import { docClient } from './dynamodb';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import type { UserMemory } from './types';

const TABLE = 'RepoIQ_UserMemory';

export async function getUserMemory(userId: string): Promise<string> {
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE,
        Key: { user_id: userId },
      }),
    );
    const item = result.Item as UserMemory | undefined;
    return item?.memory_md ?? '';
  } catch (error) {
    console.warn('[Memory] Failed to get user memory:', error);
    return '';
  }
}

export async function saveUserMemory(
  userId: string,
  memoryMd: string,
): Promise<void> {
  try {
    const item: UserMemory = {
      user_id: userId,
      memory_md: memoryMd,
      last_updated: new Date().toISOString(),
      version: 1,
    };
    await docClient.send(
      new PutCommand({
        TableName: TABLE,
        Item: item,
      }),
    );
  } catch (error) {
    console.warn('[Memory] Failed to save user memory:', error);
  }
}
