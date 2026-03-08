import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import type { Session, User, Gap, Message, AnalyticsEvent } from './types';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

export const docClient = DynamoDBDocumentClient.from(client);

// ──────────────────────────────────────────────────────────────
// TABLE NAMES — match the tables created in AWS
// ──────────────────────────────────────────────────────────────
const TABLES = {
  users: 'RepoIQ_Users',
  sessions: 'RepoIQ_Sessions',
  messages: 'RepoIQ_Messages',
  gaps: 'RepoIQ_Gaps',
  analytics: 'RepoIQ_Analytics',
};

// ──────────────────────────────────────────────────────────────
// USER OPERATIONS
// ──────────────────────────────────────────────────────────────

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLES.users,
        Key: { user_id: userId },
      }),
    );
    return (result.Item as User) || null;
  } catch (error) {
    console.error('[DynamoDB] Failed to get user:', error);
    throw error;
  }
}

export async function createGuestSession(
  repoUrl: string,
  repoName: string,
): Promise<Session> {
  const sessionId = crypto.randomUUID();
  const now = new Date().toISOString();

  const session: Session = {
    session_id: sessionId,
    user_id: 'guest', // Use 'guest' as placeholder for unauthenticated sessions
    repo_url: repoUrl,
    repo_name: repoName,
    status: 'ingesting',
    s3_prefix: `repos/${sessionId}/`,
    kb_data_source_id: null,
    report: null,
    file_count: 0,
    languages: [],
    teach_mode_started: false,
    teach_mode_completed: false,
    created_at: now,
    completed_at: null,
  };

  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLES.sessions,
        Item: session,
      }),
    );
    return session;
  } catch (error) {
    console.error('[DynamoDB] Failed to create guest session:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────────────────
// SESSION OPERATIONS
// ──────────────────────────────────────────────────────────────

export async function getSessionById(sessionId: string): Promise<Session | null> {
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLES.sessions,
        Key: { session_id: sessionId },
      }),
    );
    return (result.Item as Session) || null;
  } catch (error) {
    console.error('[DynamoDB] Failed to get session:', error);
    throw error;
  }
}

export async function getSessionsByUserId(userId: string): Promise<Session[]> {
  try {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLES.sessions,
        IndexName: 'byUserCreated',
        KeyConditionExpression: 'user_id = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
        ScanIndexForward: false, // Sort by created_at descending
      }),
    );
    return (result.Items as Session[]) || [];
  } catch (error) {
    console.error('[DynamoDB] Failed to list sessions by user:', error);
    throw error;
  }
}

export async function getGuestSessions(): Promise<Session[]> {
  try {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLES.sessions,
        IndexName: 'byUserCreated',
        KeyConditionExpression: 'user_id = :userId',
        ExpressionAttributeValues: {
          ':userId': 'guest',
        },
        ScanIndexForward: false,
      }),
    );
    return (result.Items as Session[]) || [];
  } catch (error) {
    console.error('[DynamoDB] Failed to get guest sessions:', error);
    throw error;
  }
}

export async function updateSessionStatus(
  sessionId: string,
  status: Session['status'],
): Promise<void> {
  try {
    await docClient.send(
      new UpdateCommand({
        TableName: TABLES.sessions,
        Key: { session_id: sessionId },
        UpdateExpression: 'SET #status = :status',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':status': status },
      }),
    );
  } catch (error) {
    console.error('[DynamoDB] Failed to update session status:', error);
    throw error;
  }
}

export async function updateSessionReport(
  sessionId: string,
  report: Session['report'],
): Promise<void> {
  try {
    await docClient.send(
      new UpdateCommand({
        TableName: TABLES.sessions,
        Key: { session_id: sessionId },
        UpdateExpression: 'SET #report = :report, #status = :status, completed_at = :now',
        ExpressionAttributeNames: {
          '#report': 'report',
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':report': report,
          ':status': 'complete',
          ':now': new Date().toISOString(),
        },
      }),
    );
  } catch (error) {
    console.error('[DynamoDB] Failed to update session report:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────────────────
// GAP OPERATIONS
// ──────────────────────────────────────────────────────────────

export async function getGapsBySessionId(sessionId: string): Promise<Gap[]> {
  try {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLES.gaps,
        IndexName: 'bySessionOrder',
        KeyConditionExpression: 'session_id = :sessionId',
        ExpressionAttributeValues: {
          ':sessionId': sessionId,
        },
      }),
    );
    return (result.Items as Gap[]) || [];
  } catch (error) {
    console.error('[DynamoDB] Failed to get gaps by session:', error);
    throw error;
  }
}

export async function createGap(gap: Gap): Promise<Gap> {
  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLES.gaps,
        Item: gap,
      }),
    );
    return gap;
  } catch (error) {
    console.error('[DynamoDB] Failed to create gap:', error);
    throw error;
  }
}

export async function updateGapProgress(
  gapId: string,
  understood: boolean,
  score?: number,
): Promise<void> {
  try {
    let updateExpression = 'SET understood = :understood, completed_at = :now';
    const values: Record<string, unknown> = {
      ':understood': understood,
      ':now': new Date().toISOString(),
    };

    if (score !== undefined) {
      updateExpression += ', #score = :score';
      values[':score'] = score;
    }

    await docClient.send(
      new UpdateCommand({
        TableName: TABLES.gaps,
        Key: { gap_id: gapId },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: score !== undefined ? { '#score': 'score' } : undefined,
        ExpressionAttributeValues: values,
      }),
    );
  } catch (error) {
    console.error('[DynamoDB] Failed to update gap progress:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────────────────
// MESSAGE OPERATIONS
// ──────────────────────────────────────────────────────────────

export async function getMessagesBySessionId(sessionId: string): Promise<Message[]> {
  try {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLES.messages,
        IndexName: 'bySessionCreated',
        KeyConditionExpression: 'session_id = :sessionId',
        ExpressionAttributeValues: {
          ':sessionId': sessionId,
        },
        ScanIndexForward: true, // Chronological order
      }),
    );
    return (result.Items as Message[]) || [];
  } catch (error) {
    console.error('[DynamoDB] Failed to get messages:', error);
    throw error;
  }
}

export async function createMessage(message: Message): Promise<Message> {
  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLES.messages,
        Item: message,
      }),
    );
    return message;
  } catch (error) {
    console.error('[DynamoDB] Failed to create message:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────────────────
// ANALYTICS OPERATIONS
// ──────────────────────────────────────────────────────────────

export async function createAnalyticsEvent(
  event: Omit<AnalyticsEvent, 'event_id' | 'created_at'>,
): Promise<AnalyticsEvent> {
  const eventId = crypto.randomUUID();
  const now = new Date().toISOString();

  const fullEvent: AnalyticsEvent = {
    event_id: eventId,
    event_type: event.event_type,
    user_id: event.user_id,
    session_id: event.session_id,
    metadata: event.metadata,
    created_at: now,
  };

  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLES.analytics,
        Item: fullEvent,
      }),
    );
    return fullEvent;
  } catch (error) {
    console.error('[DynamoDB] Failed to create analytics event:', error);
    throw error;
  }
}
