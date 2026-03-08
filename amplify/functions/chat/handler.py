"""
RepoIQ - Socratic Chat Lambda

Implements a Socratic teaching assistant that guides learners through
codebase concepts using their actual code as context. Uses Bedrock
Knowledge Base (RAG) for code retrieval and Claude for responses.

Runtime: Python 3.12
"""

import json
import os
import uuid
import logging
from datetime import datetime, timezone
from typing import Any
from decimal import Decimal

import boto3
from botocore.exceptions import ClientError

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

logger = logging.getLogger()
logger.setLevel(logging.INFO)

REGION = os.environ.get("AWS_REGION", "ap-south-1")
BEDROCK_MODEL_ID = os.environ.get(
    "BEDROCK_MODEL_ID", "anthropic.claude-3-5-sonnet-20241022-v2:0"
)
BEDROCK_FALLBACK_MODEL_ID = os.environ.get(
    "BEDROCK_FALLBACK_MODEL_ID", "amazon.nova-lite-v1:0"
)
BEDROCK_KB_ID = os.environ.get("BEDROCK_KB_ID", "")
SESSIONS_TABLE = os.environ.get("SESSIONS_TABLE", "Sessions")
MESSAGES_TABLE = os.environ.get("MESSAGES_TABLE", "Messages")
GAPS_TABLE = os.environ.get("GAPS_TABLE", "Gaps")

# Number of correct exchanges before marking concept as understood
UNDERSTANDING_THRESHOLD = 3
MAX_HISTORY_MESSAGES = 10

# ---------------------------------------------------------------------------
# AWS Clients
# ---------------------------------------------------------------------------

dynamodb = boto3.resource("dynamodb", region_name=REGION)
bedrock_runtime = boto3.client("bedrock-runtime", region_name=REGION)
bedrock_agent_runtime = boto3.client("bedrock-agent-runtime", region_name=REGION)

sessions_table = dynamodb.Table(SESSIONS_TABLE)
messages_table = dynamodb.Table(MESSAGES_TABLE)
gaps_table = dynamodb.Table(GAPS_TABLE)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

SOCRATIC_SYSTEM_PROMPT = """You are RepoIQ, an AI teaching assistant that helps developers understand codebases through the Socratic method.

RULES:
1. NEVER explain code directly. ALWAYS ask one focused question that leads the student to discover the answer themselves.
2. ALWAYS ground your questions in the student's ACTUAL CODE — reference specific files, functions, variables, and line numbers.
3. Keep responses under 150 words.
4. If the student's answer shows understanding, acknowledge briefly and move to the next layer of depth.
5. If the student is stuck, provide a small hint (one sentence max) then ask a simpler sub-question.
6. After the student demonstrates solid understanding (correct reasoning about why the code works the way it does), include the marker [CONCEPT_UNDERSTOOD] at the very end of your response.
7. When referencing code, use this format: `filename:line_number` — e.g., `src/auth.ts:42`.
8. Adjust difficulty based on the student's responses. Start accessible, increase complexity as they demonstrate understanding.

NEVER:
- Write or rewrite code for the student
- Give direct explanations longer than one sentence
- Ignore the student's actual codebase
- Ask vague or generic programming questions"""


def _now_iso() -> str:
    """Return current UTC timestamp in ISO-8601."""
    return datetime.now(timezone.utc).isoformat()


def _make_response(status_code: int, body: dict) -> dict:
    """Build an API Gateway-compatible response."""
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "POST,OPTIONS",
        },
        "body": json.dumps(body, default=str),
    }


def _validate_session_ownership(session_id: str, user_id: str) -> dict | None:
    """
    Verify that the session exists and belongs to the user.
    Returns the session item or None if invalid.
    """
    try:
        resp = sessions_table.get_item(Key={"sessionId": session_id})
        item = resp.get("Item")
        if not item:
            return None
        if item.get("userId") != user_id:
            return None
        return item
    except ClientError as exc:
        logger.error("DynamoDB error validating session: %s", exc)
        return None


def _get_chat_history(session_id: str, concept_id: str) -> list[dict]:
    """
    Retrieve the last N messages for this session+concept pair.
    Returns messages in chronological order.
    """
    try:
        resp = messages_table.query(
            IndexName="bySessionConcept",
            KeyConditionExpression=(
                "sessionId = :sid AND conceptId = :cid"
            ),
            ExpressionAttributeValues={
                ":sid": session_id,
                ":cid": concept_id,
            },
            ScanIndexForward=True,  # chronological
            Limit=MAX_HISTORY_MESSAGES * 2,  # user + assistant pairs
        )
        items = resp.get("Items", [])
        # Take only the last N pairs
        return items[-(MAX_HISTORY_MESSAGES * 2):]
    except ClientError as exc:
        # Index may not exist yet — fall back to scan-like query
        logger.warning("Chat history query failed: %s. Returning empty history.", exc)
        return []


def _retrieve_code_context(session_id: str, query: str) -> str:
    """
    Query Bedrock Knowledge Base for code snippets relevant to the question.
    Returns formatted code context string.
    """
    if not BEDROCK_KB_ID:
        logger.warning("Bedrock KB not configured; skipping RAG retrieval.")
        return ""

    try:
        response = bedrock_agent_runtime.retrieve(
            knowledgeBaseId=BEDROCK_KB_ID,
            retrievalQuery={"text": query},
            retrievalConfiguration={
                "vectorSearchConfiguration": {
                    "numberOfResults": 5,
                    "overrideSearchType": "HYBRID",
                }
            },
        )

        results = response.get("retrievalResults", [])
        if not results:
            return ""

        context_parts = []
        for r in results:
            content = r.get("content", {}).get("text", "")
            source = r.get("location", {}).get("s3Location", {}).get("uri", "unknown")
            # Extract the file path from the S3 key
            if f"repos/{session_id}/" in source:
                file_path = source.split(f"repos/{session_id}/")[-1]
            else:
                file_path = source.split("/")[-1] if "/" in source else source

            if content.strip():
                context_parts.append(f"### {file_path}\n```\n{content.strip()}\n```")

        return "\n\n".join(context_parts)

    except ClientError as exc:
        logger.warning("KB retrieval failed: %s", exc)
        return ""


def _build_messages(
    concept: str,
    user_message: str,
    is_hint: bool,
    code_context: str,
    chat_history: list[dict],
    gap_info: dict | None = None,
) -> list[dict]:
    """Build the message array for the Bedrock Claude API call."""
    messages = []

    # Add chat history
    for msg in chat_history:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role in ("user", "assistant") and content:
            messages.append({"role": role, "content": content})

    # Build the current user message with context
    user_content_parts = []

    if code_context:
        user_content_parts.append(
            f"<relevant_code>\n{code_context}\n</relevant_code>"
        )

    if gap_info:
        user_content_parts.append(
            f"<concept_context>\n"
            f"Concept: {gap_info.get('concept', concept)}\n"
            f"File: {gap_info.get('file', 'N/A')}\n"
            f"Lines: {gap_info.get('lines', 'N/A')}\n"
            f"Why critical: {gap_info.get('whyCritical', 'N/A')}\n"
            f"</concept_context>"
        )

    if is_hint:
        user_content_parts.append(
            f"The student is asking for a hint about: {concept}\n"
            f"Student says: {user_message}\n"
            f"Provide a small hint (one sentence) then ask a simpler question."
        )
    else:
        user_content_parts.append(user_message)

    messages.append({"role": "user", "content": "\n\n".join(user_content_parts)})

    return messages


def _invoke_bedrock(system_prompt: str, messages: list[dict]) -> str:
    """
    Call Bedrock Claude with system prompt and messages.
    Falls back to secondary model on failure.
    """
    models = [BEDROCK_MODEL_ID, BEDROCK_FALLBACK_MODEL_ID]

    for model_id in models:
        try:
            logger.info("Invoking model: %s", model_id)
            response = bedrock_runtime.invoke_model(
                modelId=model_id,
                contentType="application/json",
                accept="application/json",
                body=json.dumps({
                    "anthropic_version": "bedrock-2023-05-31",
                    "max_tokens": 512,
                    "temperature": 0.4,
                    "system": system_prompt,
                    "messages": messages,
                }),
            )
            body = json.loads(response["body"].read())
            return body["content"][0]["text"]

        except (ClientError, KeyError, IndexError) as exc:
            logger.error("Model %s failed: %s", model_id, exc)
            continue

    raise RuntimeError("All Bedrock models failed to generate a response.")


def _check_concept_understood(response_text: str, exchange_count: int) -> bool:
    """
    Determine if the concept has been understood based on the AI response
    and the number of exchanges.
    """
    if exchange_count < UNDERSTANDING_THRESHOLD:
        return False
    return "[CONCEPT_UNDERSTOOD]" in response_text


def _extract_code_reference(response_text: str) -> str | None:
    """Extract a code reference (file:line) from the response if present."""
    import re
    # Match patterns like `filename.ext:123` or `path/to/file.ext:45`
    match = re.search(r"`([a-zA-Z0-9_\-./]+\.\w+:\d+)`", response_text)
    return match.group(1) if match else None


def _save_message_pair(
    session_id: str,
    concept_id: str,
    user_id: str,
    user_message: str,
    assistant_response: str,
) -> None:
    """Save the user message and assistant response to the Messages table."""
    now = _now_iso()
    base_id = str(uuid.uuid4())

    with messages_table.batch_writer() as batch:
        batch.put_item(
            Item={
                "messageId": f"{base_id}-user",
                "sessionId": session_id,
                "conceptId": concept_id,
                "userId": user_id,
                "role": "user",
                "content": user_message,
                "createdAt": now,
            }
        )
        batch.put_item(
            Item={
                "messageId": f"{base_id}-assistant",
                "sessionId": session_id,
                "conceptId": concept_id,
                "userId": user_id,
                "role": "assistant",
                "content": assistant_response,
                "createdAt": now,
            }
        )


def _update_gap_status(gap_id: str, understood: bool, exchange_count: int) -> None:
    """Update a Gap record with understanding progress."""
    update_expr = "SET #s = :s, exchangeCount = :ec, understood = :u, updatedAt = :t"
    expr_values = {
        ":s": "understood" if understood else "in_progress",
        ":ec": Decimal(str(exchange_count)),
        ":u": understood,
        ":t": _now_iso(),
    }

    gaps_table.update_item(
        Key={"gapId": gap_id},
        UpdateExpression=update_expr,
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues=expr_values,
    )


def _get_gap(concept_id: str) -> dict | None:
    """Retrieve a Gap record by its ID."""
    try:
        resp = gaps_table.get_item(Key={"gapId": concept_id})
        return resp.get("Item")
    except ClientError:
        return None


# ---------------------------------------------------------------------------
# Lambda Handler
# ---------------------------------------------------------------------------


def handler(event: dict, context: Any) -> dict:
    """
    Lambda entry point for Socratic chat.

    Expected event body (JSON):
        {
            "session_id": "session-uuid",
            "concept_id": "gap-uuid",
            "message": "student's message text",
            "is_hint": false,
            "user_id": "user-uuid"
        }

    Returns:
        API Gateway-compatible response with AI reply and metadata.
    """
    # Handle CORS preflight
    if event.get("httpMethod") == "OPTIONS" or event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS":
        return _make_response(200, {"message": "OK"})

    try:
        # ── Parse input ───────────────────────────────────────────────
        body = event.get("body", event)
        if isinstance(body, str):
            body = json.loads(body)

        session_id: str = body.get("session_id", "")
        concept_id: str = body.get("concept_id", "")
        user_message: str = body.get("message", "")
        is_hint: bool = body.get("is_hint", False)
        user_id: str = body.get("user_id", "")

        if not all([session_id, concept_id, user_message, user_id]):
            return _make_response(400, {
                "error": "Missing required fields: session_id, concept_id, message, user_id",
            })

        # ── Validate session ownership ────────────────────────────────
        session = _validate_session_ownership(session_id, user_id)
        if not session:
            return _make_response(403, {
                "error": "Session not found or access denied.",
            })

        if session.get("status") != "complete":
            return _make_response(409, {
                "error": "Session analysis is not yet complete.",
                "status": session.get("status", "unknown"),
            })

        # ── Get gap info ──────────────────────────────────────────────
        gap = _get_gap(concept_id)
        if not gap:
            return _make_response(404, {
                "error": f"Concept (gap) '{concept_id}' not found.",
            })

        if gap.get("sessionId") != session_id:
            return _make_response(403, {
                "error": "Concept does not belong to this session.",
            })

        concept_name = gap.get("concept", "unknown concept")
        current_exchange_count = int(gap.get("exchangeCount", 0))

        # ── Retrieve chat history ─────────────────────────────────────
        chat_history = _get_chat_history(session_id, concept_id)

        # ── Retrieve relevant code via RAG ────────────────────────────
        rag_query = f"{concept_name}: {user_message}"
        code_context = _retrieve_code_context(session_id, rag_query)

        # ── Build messages and invoke Bedrock ─────────────────────────
        messages = _build_messages(
            concept=concept_name,
            user_message=user_message,
            is_hint=is_hint,
            code_context=code_context,
            chat_history=chat_history,
            gap_info=gap,
        )

        assistant_response = _invoke_bedrock(SOCRATIC_SYSTEM_PROMPT, messages)

        # ── Evaluate understanding ────────────────────────────────────
        new_exchange_count = current_exchange_count + 1
        concept_understood = _check_concept_understood(
            assistant_response, new_exchange_count
        )

        # Clean the marker from the visible response
        clean_response = assistant_response.replace("[CONCEPT_UNDERSTOOD]", "").strip()

        # ── Extract code reference ────────────────────────────────────
        code_reference = _extract_code_reference(clean_response)

        # ── Save message pair ─────────────────────────────────────────
        _save_message_pair(
            session_id=session_id,
            concept_id=concept_id,
            user_id=user_id,
            user_message=user_message,
            assistant_response=clean_response,
        )

        # ── Update gap progress ───────────────────────────────────────
        _update_gap_status(concept_id, concept_understood, new_exchange_count)

        # ── Return response ───────────────────────────────────────────
        return _make_response(200, {
            "response": clean_response,
            "concept_understood": concept_understood,
            "exchange_count": new_exchange_count,
            "code_reference": code_reference,
            "concept": concept_name,
        })

    except json.JSONDecodeError:
        return _make_response(400, {"error": "Invalid JSON in request body."})

    except KeyError as exc:
        logger.exception("Missing required field: %s", exc)
        return _make_response(400, {"error": f"Missing required field: {exc}"})

    except RuntimeError as exc:
        logger.exception("AI invocation failed: %s", exc)
        return _make_response(502, {"error": "AI service temporarily unavailable."})

    except Exception as exc:
        logger.exception("Unexpected error in chat handler: %s", exc)
        return _make_response(500, {"error": "Internal server error."})
