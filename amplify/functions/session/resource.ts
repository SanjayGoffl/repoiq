import { defineFunction } from '@aws-amplify/backend';

/**
 * Session Lambda — handles session CRUD operations.
 * Fetches session data, gaps, and messages from DynamoDB.
 *
 * Runtime: Node.js 20
 * Memory:  128 MB
 * Timeout: 10 seconds
 */
export const sessionFn = defineFunction({
  name: 'repoiq-session',

  runtime: 20, // Node.js 20

  memoryMB: 128,
  timeoutSeconds: 10,

  environment: {
    // DynamoDB table names
    SESSIONS_TABLE: '', // TODO: Reference data table name
    GAPS_TABLE: '', // TODO: Reference data table name
    MESSAGES_TABLE: '', // TODO: Reference data table name
  },

  // TODO: Add IAM policy statements for:
  // - DynamoDB: GetItem, Query on Sessions, Gaps, Messages tables
});
