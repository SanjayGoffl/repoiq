import { defineFunction } from '@aws-amplify/backend';

/**
 * Analyze Lambda — clones a GitHub repo, uploads to S3, indexes with
 * Bedrock Knowledge Base, and generates the initial analysis report.
 *
 * Runtime: Python 3.12
 * Memory:  512 MB
 * Timeout: 300 seconds (5 minutes)
 */
export const analyzeFn = defineFunction({
  name: 'repoiq-analyze',

  // TODO: Verify Python runtime configuration for Amplify Gen 2
  // Gen 2 may require a different pattern for Python Lambdas (e.g., entry point config)
  runtime: 20, // Node.js 20 placeholder — see note below
  // NOTE: Amplify Gen 2 defineFunction primarily supports Node.js runtimes.
  // For Python 3.12, you may need to use custom CDK overrides:
  //   import { Function, Runtime } from 'aws-cdk-lib/aws-lambda';
  // Or use the `cdk` escape hatch in amplify/backend.ts.
  // TODO: Replace with Python 3.12 runtime via CDK override

  memoryMB: 512,
  timeoutSeconds: 300,

  environment: {
    // S3 bucket name injected at deploy time
    REPO_BUCKET: '', // TODO: Reference storage.bucketName
    // Bedrock model configuration
    BEDROCK_MODEL_ID: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    BEDROCK_FALLBACK_MODEL_ID: 'amazon.nova-lite-v1:0',
    BEDROCK_REGION: 'us-east-1',
    // DynamoDB table name
    SESSIONS_TABLE: '', // TODO: Reference data table name
  },

  // TODO: Add IAM policy statements for:
  // - S3: PutObject, GetObject on repo bucket
  // - Bedrock: InvokeModel
  // - DynamoDB: PutItem, UpdateItem on Sessions table
  // - Bedrock KB: CreateDataSource, StartIngestionJob (if using KB)
});
