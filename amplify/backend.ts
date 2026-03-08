import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { analyzeFn } from './functions/analyze/resource';
import { chatFn } from './functions/chat/resource';
import { sessionFn } from './functions/session/resource';

/**
 * RepoIQ — Amplify Gen 2 backend definition
 *
 * Resources:
 *   - auth:    Cognito User Pool with Google SSO
 *   - data:    DynamoDB tables (Users, Sessions, Messages, Gaps, Analytics)
 *   - storage: S3 bucket for cloned repo files
 *   - analyzeFn: Lambda for repo analysis pipeline
 *   - chatFn:    Lambda for Socratic chat interactions
 *   - sessionFn: Lambda for session data retrieval
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  analyzeFn,
  chatFn,
  sessionFn,
});

// ── CDK overrides ──
// TODO: Use the CDK escape hatch to:
// 1. Switch analyzeFn and chatFn to Python 3.12 runtime
// 2. Wire environment variables (bucket names, table names) from deployed resources
// 3. Add fine-grained IAM policies for Bedrock, S3, DynamoDB access
// 4. Grant analyzeFn write access to the S3 storage bucket
// 5. Grant chatFn read access to the S3 storage bucket
//
// Example CDK override pattern:
//   const analyzeStack = backend.analyzeFn.resources.lambda;
//   analyzeStack.addEnvironment('REPO_BUCKET', backend.storage.resources.bucket.bucketName);
//   backend.storage.resources.bucket.grantReadWrite(analyzeStack);
//
// Example Python runtime override:
//   import { Runtime } from 'aws-cdk-lib/aws-lambda';
//   const cfnFunction = analyzeStack.node.defaultChild as CfnFunction;
//   cfnFunction.runtime = 'python3.12';

export default backend;
