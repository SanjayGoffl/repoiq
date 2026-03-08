/**
 * RepoIQ - Session Reader Lambda
 *
 * Reads session data (including analysis report and gap records)
 * from DynamoDB. Validates user ownership via JWT claims.
 *
 * Runtime: Node.js 20.x
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const REGION = process.env.AWS_REGION ?? "ap-south-1";
const SESSIONS_TABLE = process.env.SESSIONS_TABLE ?? "Sessions";
const GAPS_TABLE = process.env.GAPS_TABLE ?? "Gaps";

// ---------------------------------------------------------------------------
// DynamoDB Client
// ---------------------------------------------------------------------------

const ddbClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: { removeUndefinedValues: true },
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface APIGatewayEvent {
  httpMethod?: string;
  pathParameters?: Record<string, string> | null;
  queryStringParameters?: Record<string, string> | null;
  headers?: Record<string, string>;
  requestContext?: {
    authorizer?: {
      claims?: Record<string, string>;
      jwt?: {
        claims?: Record<string, string>;
      };
    };
    http?: {
      method?: string;
    };
  };
}

interface LambdaResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

interface GapRecord {
  gapId: string;
  sessionId: string;
  userId: string;
  concept: string;
  file: string;
  lines: string;
  whyCritical: string;
  firstQuestion: string;
  status: string;
  exchangeCount: number;
  understood: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CORS_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
};

function makeResponse(statusCode: number, body: Record<string, unknown>): LambdaResponse {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

/**
 * Extract the authenticated user ID from the event's JWT claims.
 *
 * Supports multiple authorizer formats:
 * - API Gateway REST API (Cognito authorizer)
 * - API Gateway HTTP API (JWT authorizer)
 * - Custom header fallback for development
 */
function extractUserId(event: APIGatewayEvent): string | null {
  // HTTP API v2 JWT authorizer
  const jwtClaims = event.requestContext?.authorizer?.jwt?.claims;
  if (jwtClaims?.sub) {
    return jwtClaims.sub;
  }

  // REST API Cognito authorizer
  const cognitoClaims = event.requestContext?.authorizer?.claims;
  if (cognitoClaims?.sub) {
    return cognitoClaims.sub;
  }

  // Fallback: custom header (for dev/testing only)
  const headerUserId = event.headers?.["x-user-id"];
  if (headerUserId) {
    console.warn("Using x-user-id header — only acceptable in development.");
    return headerUserId;
  }

  return null;
}

/**
 * Retrieve all Gap records for a session, sorted by their order field.
 */
async function getGapsForSession(sessionId: string): Promise<GapRecord[]> {
  try {
    const result = await docClient.send(
      new QueryCommand({
        TableName: GAPS_TABLE,
        IndexName: "bySession",
        KeyConditionExpression: "sessionId = :sid",
        ExpressionAttributeValues: { ":sid": sessionId },
      })
    );

    const items = (result.Items ?? []) as GapRecord[];
    // Sort by the order field to maintain consistent concept ordering
    return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch (error) {
    console.error("Failed to query gaps:", error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Lambda Handler
// ---------------------------------------------------------------------------

export const handler = async (event: APIGatewayEvent): Promise<LambdaResponse> => {
  console.log("Session handler invoked:", JSON.stringify({
    method: event.httpMethod ?? event.requestContext?.http?.method,
    path: event.pathParameters,
  }));

  // Handle CORS preflight
  const method = event.httpMethod ?? event.requestContext?.http?.method;
  if (method === "OPTIONS") {
    return makeResponse(200, { message: "OK" });
  }

  try {
    // ── Extract and validate user identity ─────────────────────────
    const userId = extractUserId(event);
    if (!userId) {
      return makeResponse(401, {
        error: "Unauthorized. No valid user identity found in request.",
      });
    }

    // ── Extract session ID from path parameters ────────────────────
    const sessionId = event.pathParameters?.session_id
      ?? event.pathParameters?.sessionId
      ?? event.queryStringParameters?.session_id;

    if (!sessionId) {
      return makeResponse(400, {
        error: "Missing required parameter: session_id",
      });
    }

    // ── Fetch session from DynamoDB ────────────────────────────────
    const sessionResult = await docClient.send(
      new GetCommand({
        TableName: SESSIONS_TABLE,
        Key: { sessionId },
      })
    );

    const session = sessionResult.Item;
    if (!session) {
      return makeResponse(404, {
        error: `Session '${sessionId}' not found.`,
      });
    }

    // ── Validate ownership ─────────────────────────────────────────
    if (session.userId !== userId) {
      return makeResponse(403, {
        error: "Access denied. You do not own this session.",
      });
    }

    // ── Fetch associated gap records ───────────────────────────────
    const gaps = await getGapsForSession(sessionId);

    // ── Compute progress summary ───────────────────────────────────
    const totalGaps = gaps.length;
    const understoodGaps = gaps.filter((g) => g.understood).length;
    const inProgressGaps = gaps.filter((g) => g.status === "in_progress").length;

    // ── Return session with enriched data ──────────────────────────
    return makeResponse(200, {
      session: {
        sessionId: session.sessionId,
        userId: session.userId,
        repoUrl: session.repoUrl ?? null,
        status: session.status,
        fileCount: session.fileCount ?? 0,
        report: session.report ?? null,
        errorMessage: session.errorMessage ?? null,
        createdAt: session.createdAt ?? null,
        updatedAt: session.updatedAt ?? null,
        completedAt: session.completedAt ?? null,
      },
      gaps,
      progress: {
        total: totalGaps,
        understood: understoodGaps,
        in_progress: inProgressGaps,
        not_started: totalGaps - understoodGaps - inProgressGaps,
        percentage: totalGaps > 0
          ? Math.round((understoodGaps / totalGaps) * 100)
          : 0,
      },
    });
  } catch (error) {
    console.error("Session handler error:", error);

    const message = error instanceof Error ? error.message : "Unknown error";
    return makeResponse(500, {
      error: "Internal server error.",
      detail: process.env.NODE_ENV === "development" ? message : undefined,
    });
  }
};
