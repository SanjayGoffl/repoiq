import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    QueryCommand,
    UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import type { Session, Message } from './types';

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
});

export const docClient = DynamoDBDocumentClient.from(client);

const TABLES = {
    sessions: 'RepoIQ_Sessions',
    messages: 'RepoIQ_Messages',
};

export async function createSession(
    repoUrl: string,
    repoName: string,
): Promise<Session> {
    const sessionId = crypto.randomUUID();
    const now = new Date().toISOString();

    const session: Session = {
        session_id: sessionId,
        user_id: 'guest',
        repo_url: repoUrl,
        repo_name: repoName,
        status: 'ingesting',
        report: null,
        file_count: 0,
        languages: [],
        created_at: now,
        completed_at: null,
    };

    await docClient.send(
        new PutCommand({
            TableName: TABLES.sessions,
            Item: session,
        }),
    );
    return session;
}

export async function getSessionById(sessionId: string): Promise<Session | null> {
    const result = await docClient.send(
        new GetCommand({
            TableName: TABLES.sessions,
            Key: { session_id: sessionId },
        }),
    );
    return (result.Item as Session) || null;
}

export async function updateSessionReport(
    sessionId: string,
    report: Session['report'],
    fileCount: number,
    languages: string[]
): Promise<void> {
    await docClient.send(
        new UpdateCommand({
            TableName: TABLES.sessions,
            Key: { session_id: sessionId },
            UpdateExpression: 'SET #report = :report, #status = :status, file_count = :fc, languages = :lang, completed_at = :now',
            ExpressionAttributeNames: {
                '#report': 'report',
                '#status': 'status',
            },
            ExpressionAttributeValues: {
                ':report': report,
                ':status': 'complete',
                ':fc': fileCount,
                ':lang': languages,
                ':now': new Date().toISOString(),
            },
        }),
    );
}

export async function getMessagesBySessionId(sessionId: string): Promise<Message[]> {
    const result = await docClient.send(
        new QueryCommand({
            TableName: TABLES.messages,
            IndexName: 'bySessionCreated',
            KeyConditionExpression: 'session_id = :sessionId',
            ExpressionAttributeValues: {
                ':sessionId': sessionId,
            },
            ScanIndexForward: true,
        }),
    );
    return (result.Items as Message[]) || [];
}

export async function createMessage(message: Message): Promise<Message> {
    await docClient.send(
        new PutCommand({
            TableName: TABLES.messages,
            Item: message,
        }),
    );
    return message;
}
