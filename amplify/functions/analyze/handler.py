"""
RepoIQ - Repo Ingestion & AI Analysis Lambda

Clones a GitHub repo, uploads code to S3, triggers Bedrock KB sync,
and generates an AI-powered codebase analysis report.

Runtime: Python 3.12
"""

import json
import os
import shutil
import subprocess
import time
import uuid
import logging
from pathlib import Path
from datetime import datetime, timezone
from typing import Any

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
BEDROCK_KB_DATA_SOURCE_ID = os.environ.get("BEDROCK_KB_DATA_SOURCE_ID", "")
S3_BUCKET_NAME = os.environ.get("S3_BUCKET_NAME", "")
SESSIONS_TABLE = os.environ.get("SESSIONS_TABLE", "Sessions")
GAPS_TABLE = os.environ.get("GAPS_TABLE", "Gaps")

# File extensions to include in the analysis
CODE_EXTENSIONS = {
    ".py", ".js", ".ts", ".tsx", ".jsx", ".java", ".go", ".rs", ".c", ".cpp",
    ".h", ".hpp", ".cs", ".rb", ".php", ".swift", ".kt", ".scala", ".vue",
    ".svelte", ".html", ".css", ".scss", ".sass", ".less", ".sql", ".sh",
    ".bash", ".yaml", ".yml", ".json", ".toml", ".xml", ".md", ".dockerfile",
    ".tf", ".hcl", ".proto", ".graphql", ".prisma",
}

# Directories to skip during ingestion
SKIP_DIRS = {
    "node_modules", ".git", "__pycache__", ".next", "dist", "build",
    ".venv", "venv", "env", ".env", ".idea", ".vscode", "vendor",
    "target", "bin", "obj", ".terraform", ".serverless",
}

MAX_FILE_SIZE_BYTES = 512 * 1024  # 512 KB per file
MAX_TOTAL_FILES = 500

# ---------------------------------------------------------------------------
# AWS Clients
# ---------------------------------------------------------------------------

dynamodb = boto3.resource("dynamodb", region_name=REGION)
s3 = boto3.client("s3", region_name=REGION)
bedrock_runtime = boto3.client("bedrock-runtime", region_name=REGION)
bedrock_agent = boto3.client("bedrock-agent", region_name=REGION)

sessions_table = dynamodb.Table(SESSIONS_TABLE)
gaps_table = dynamodb.Table(GAPS_TABLE)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _now_iso() -> str:
    """Return current UTC timestamp in ISO-8601 format."""
    return datetime.now(timezone.utc).isoformat()


def _update_status(session_id: str, status: str, extra: dict | None = None) -> None:
    """Update session status in DynamoDB."""
    update_expr = "SET #s = :s, updatedAt = :u"
    expr_values: dict[str, Any] = {":s": status, ":u": _now_iso()}
    expr_names = {"#s": "status"}

    if extra:
        for key, value in extra.items():
            update_expr += f", {key} = :{key}"
            expr_values[f":{key}"] = value

    sessions_table.update_item(
        Key={"sessionId": session_id},
        UpdateExpression=update_expr,
        ExpressionAttributeNames=expr_names,
        ExpressionAttributeValues=expr_values,
    )
    logger.info("Session %s status -> %s", session_id, status)


def _clone_repo(repo_url: str, clone_dir: str) -> None:
    """Shallow-clone a public GitHub repository into clone_dir."""
    logger.info("Cloning %s -> %s", repo_url, clone_dir)
    subprocess.run(
        ["git", "clone", "--depth", "1", "--single-branch", repo_url, clone_dir],
        check=True,
        timeout=120,
        capture_output=True,
        text=True,
    )


def _collect_code_files(root: str) -> list[dict[str, str]]:
    """
    Walk the cloned repo and collect code files.

    Returns a list of dicts: { "relative_path": str, "content": str }
    """
    files: list[dict[str, str]] = []
    root_path = Path(root)

    for path in sorted(root_path.rglob("*")):
        # Skip excluded directories
        if any(part in SKIP_DIRS for part in path.parts):
            continue

        if not path.is_file():
            continue

        if path.suffix.lower() not in CODE_EXTENSIONS:
            continue

        if path.stat().st_size > MAX_FILE_SIZE_BYTES:
            continue

        if len(files) >= MAX_TOTAL_FILES:
            logger.warning("Reached max file limit (%d), stopping collection.", MAX_TOTAL_FILES)
            break

        try:
            content = path.read_text(encoding="utf-8", errors="replace")
            relative = str(path.relative_to(root_path))
            files.append({"relative_path": relative, "content": content})
        except Exception as exc:
            logger.warning("Skipping %s: %s", path, exc)

    logger.info("Collected %d code files.", len(files))
    return files


def _upload_to_s3(session_id: str, files: list[dict[str, str]]) -> int:
    """Upload code files to S3 under repos/{session_id}/. Returns count."""
    uploaded = 0
    for f in files:
        key = f"repos/{session_id}/{f['relative_path']}"
        s3.put_object(
            Bucket=S3_BUCKET_NAME,
            Key=key,
            Body=f["content"].encode("utf-8"),
            ContentType="text/plain",
        )
        uploaded += 1
    logger.info("Uploaded %d files to s3://%s/repos/%s/", uploaded, S3_BUCKET_NAME, session_id)
    return uploaded


def _start_kb_sync() -> str | None:
    """
    Trigger a Bedrock Knowledge Base data source sync.
    Returns the ingestion job ID, or None if KB is not configured.
    """
    if not BEDROCK_KB_ID or not BEDROCK_KB_DATA_SOURCE_ID:
        logger.warning("Bedrock KB not configured; skipping sync.")
        return None

    response = bedrock_agent.start_ingestion_job(
        knowledgeBaseId=BEDROCK_KB_ID,
        dataSourceId=BEDROCK_KB_DATA_SOURCE_ID,
    )
    job_id = response["ingestionJob"]["ingestionJobId"]
    logger.info("Started KB ingestion job: %s", job_id)
    return job_id


def _wait_for_kb_sync(job_id: str, max_wait: int = 180) -> None:
    """Poll until the KB ingestion job completes (or timeout)."""
    if not job_id:
        return

    start = time.time()
    while time.time() - start < max_wait:
        resp = bedrock_agent.get_ingestion_job(
            knowledgeBaseId=BEDROCK_KB_ID,
            dataSourceId=BEDROCK_KB_DATA_SOURCE_ID,
            ingestionJobId=job_id,
        )
        status = resp["ingestionJob"]["status"]
        if status in ("COMPLETE", "FAILED", "STOPPED"):
            logger.info("KB sync finished with status: %s", status)
            return
        time.sleep(5)

    logger.warning("KB sync timed out after %ds.", max_wait)


def _build_analysis_prompt(files: list[dict[str, str]]) -> str:
    """Build the codebase analysis prompt for Bedrock Claude."""
    file_listing = []
    for f in files[:100]:  # Limit context window usage
        snippet = f["content"][:3000]  # Truncate very long files
        file_listing.append(f"### {f['relative_path']}\n```\n{snippet}\n```")

    code_block = "\n\n".join(file_listing)

    return f"""Analyze the following codebase and produce a JSON report.

<codebase>
{code_block}
</codebase>

Return ONLY valid JSON with exactly this schema:

{{
  "architecture_summary": "<3 sentences max describing the overall architecture>",
  "top_5_concepts": [
    {{
      "concept": "<concept name>",
      "file": "<primary file path>",
      "lines": "<line range, e.g. 10-45>",
      "why_critical": "<why a learner must understand this>",
      "first_question": "<a Socratic question to start learning>"
    }}
  ],
  "bugs_found": [
    {{
      "file": "<file path>",
      "line": <line number>,
      "issue": "<description of the bug or code smell>",
      "severity": "<critical|high|medium|low>"
    }}
  ],
  "learning_path": [
    {{
      "week": <week number>,
      "focus": "<what to study>",
      "reason": "<why this ordering>"
    }}
  ]
}}

Guidelines:
- Identify the 5 most important concepts a developer must learn to understand this codebase.
- Be specific: reference actual files and line ranges from the code above.
- For bugs_found, only list genuine issues (not style preferences). Include at least 1 if any exist.
- learning_path should have 3-5 weeks, ordered from foundational to advanced.
- architecture_summary must be exactly 3 sentences.
"""


def _invoke_bedrock(prompt: str) -> dict:
    """
    Call Bedrock Claude to analyze the codebase.
    Falls back to the secondary model on failure.
    """
    models = [BEDROCK_MODEL_ID, BEDROCK_FALLBACK_MODEL_ID]

    for model_id in models:
        try:
            logger.info("Invoking Bedrock model: %s", model_id)
            response = bedrock_runtime.invoke_model(
                modelId=model_id,
                contentType="application/json",
                accept="application/json",
                body=json.dumps({
                    "anthropic_version": "bedrock-2023-05-31",
                    "max_tokens": 4096,
                    "temperature": 0.2,
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt,
                        }
                    ],
                }),
            )
            body = json.loads(response["body"].read())
            text = body["content"][0]["text"]

            # Extract JSON from the response (handle markdown fences)
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]

            return json.loads(text.strip())

        except (ClientError, json.JSONDecodeError, KeyError, IndexError) as exc:
            logger.error("Model %s failed: %s", model_id, exc)
            continue

    raise RuntimeError("All Bedrock models failed to produce a valid analysis.")


def _save_report(session_id: str, user_id: str, repo_url: str, report: dict) -> None:
    """Persist the analysis report to the Sessions table."""
    sessions_table.update_item(
        Key={"sessionId": session_id},
        UpdateExpression=(
            "SET report = :r, repoUrl = :url, fileCount = :fc, "
            "completedAt = :ca, updatedAt = :u"
        ),
        ExpressionAttributeValues={
            ":r": report,
            ":url": repo_url,
            ":fc": len(report.get("top_5_concepts", [])),
            ":ca": _now_iso(),
            ":u": _now_iso(),
        },
    )
    logger.info("Saved report for session %s.", session_id)


def _create_gap_records(session_id: str, user_id: str, concepts: list[dict]) -> None:
    """Create a Gap record for each identified concept."""
    now = _now_iso()
    with gaps_table.batch_writer() as batch:
        for idx, concept in enumerate(concepts):
            batch.put_item(
                Item={
                    "gapId": str(uuid.uuid4()),
                    "sessionId": session_id,
                    "userId": user_id,
                    "concept": concept.get("concept", f"Concept {idx + 1}"),
                    "file": concept.get("file", ""),
                    "lines": concept.get("lines", ""),
                    "whyCritical": concept.get("why_critical", ""),
                    "firstQuestion": concept.get("first_question", ""),
                    "status": "not_started",
                    "exchangeCount": 0,
                    "understood": False,
                    "order": idx,
                    "createdAt": now,
                    "updatedAt": now,
                }
            )
    logger.info("Created %d gap records for session %s.", len(concepts), session_id)


# ---------------------------------------------------------------------------
# Lambda Handler
# ---------------------------------------------------------------------------


def handler(event: dict, context: Any) -> dict:
    """
    Lambda entry point for repo analysis.

    Expected event body (JSON):
        {
            "repo_url": "https://github.com/owner/repo",
            "user_id": "user-uuid",
            "session_id": "session-uuid"
        }

    Returns:
        API Gateway-compatible response with status and report.
    """
    clone_dir = ""

    try:
        # ── Parse input ───────────────────────────────────────────────
        body = event.get("body", event)
        if isinstance(body, str):
            body = json.loads(body)

        repo_url: str = body["repo_url"]
        user_id: str = body["user_id"]
        session_id: str = body["session_id"]

        logger.info(
            "Starting analysis: session=%s user=%s repo=%s",
            session_id, user_id, repo_url,
        )

        # ── Step 1: Ingest ────────────────────────────────────────────
        _update_status(session_id, "ingesting")

        clone_dir = f"/tmp/repo-{session_id}"
        if os.path.exists(clone_dir):
            shutil.rmtree(clone_dir)

        _clone_repo(repo_url, clone_dir)
        files = _collect_code_files(clone_dir)

        if not files:
            raise ValueError("No code files found in the repository.")

        # ── Step 2: Upload to S3 ──────────────────────────────────────
        _upload_to_s3(session_id, files)

        # ── Step 3: Index via Knowledge Base ──────────────────────────
        _update_status(session_id, "indexing")
        job_id = _start_kb_sync()
        _wait_for_kb_sync(job_id)

        # ── Step 4: AI Analysis ───────────────────────────────────────
        _update_status(session_id, "analyzing")
        prompt = _build_analysis_prompt(files)
        report = _invoke_bedrock(prompt)

        # ── Step 5: Save results ──────────────────────────────────────
        _save_report(session_id, user_id, repo_url, report)

        concepts = report.get("top_5_concepts", [])
        _create_gap_records(session_id, user_id, concepts)

        # ── Step 6: Mark complete ─────────────────────────────────────
        _update_status(session_id, "complete")

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({
                "status": "complete",
                "session_id": session_id,
                "file_count": len(files),
                "concepts_count": len(concepts),
                "report": report,
            }),
        }

    except Exception as exc:
        logger.exception("Analysis failed: %s", exc)

        # Attempt to mark the session as failed
        try:
            if "session_id" in dir():
                _update_status(session_id, "failed", {"errorMessage": str(exc)})
        except Exception:
            logger.exception("Failed to update session status to 'failed'.")

        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({
                "status": "failed",
                "error": str(exc),
            }),
        }

    finally:
        # Clean up cloned repo from /tmp
        if clone_dir and os.path.exists(clone_dir):
            shutil.rmtree(clone_dir, ignore_errors=True)
