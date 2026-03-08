import { defineFunction } from '@aws-amplify/backend';

/**
 * Chat Lambda — handles Socratic teach-back conversations.
 * Receives a user message + concept context, invokes Bedrock to generate
 * a pedagogical response, and evaluates concept understanding.
 *
 * Runtime: Python 3.12
 * Memory:  256 MB
 * Timeout: 30 seconds
 */
export const chatFn = defineFunction({
  name: 'repoiq-chat',

  // TODO: Verify Python runtime configuration for Amplify Gen 2
  // See note in analyze/resource.ts about Python runtime support
  runtime: 20, // Node.js 20 placeholder — replace with Python 3.12 via CDK override

  memoryMB: 256,
  timeoutSeconds: 30,

  environment: {
    // Bedrock model configuration
    BEDROCK_MODEL_ID: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    BEDROCK_FALLBACK_MODEL_ID: 'amazon.nova-lite-v1:0',
    BEDROCK_REGION: 'us-east-1',
    // DynamoDB table names
    SESSIONS_TABLE: '', // TODO: Reference data table name
    MESSAGES_TABLE: '', // TODO: Reference data table name
    GAPS_TABLE: '', // TODO: Reference data table name
    // S3 for reading repo files for code context
    REPO_BUCKET: '', // TODO: Reference storage.bucketName
  },

  // TODO: Add IAM policy statements for:
  // - Bedrock: InvokeModel
  // - DynamoDB: GetItem, PutItem, UpdateItem on Sessions, Messages, Gaps tables
  // - S3: GetObject on repo bucket (for code context retrieval)
  // - Bedrock KB: Retrieve (if using Knowledge Base for RAG)
});
