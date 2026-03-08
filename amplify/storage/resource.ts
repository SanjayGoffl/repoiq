import { defineStorage } from '@aws-amplify/backend';

/**
 * Amplify Gen 2 storage configuration
 * S3 bucket for cloned repository files
 * Path structure: repos/{session_id}/*
 */
export const storage = defineStorage({
  name: 'repoiq-repo-storage',

  access: (allow) => ({
    // Repo files are written by Lambda (analyze) and read by Lambda (chat/session)
    // Path: repos/{session_id}/*
    'repos/*': [
      // TODO: Verify that Lambda function access uses this pattern in Gen 2
      // Authenticated users can read their own session files
      allow.authenticated.to(['read']),
      // TODO: Grant Lambda functions write access via function resource references
      // allow.resource(analyzeLambda).to(['read', 'write', 'delete']),
      // allow.resource(chatLambda).to(['read']),
    ],
  }),
});
