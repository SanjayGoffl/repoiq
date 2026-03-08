import { defineAuth } from '@aws-amplify/backend';

/**
 * Amplify Gen 2 auth configuration
 * Uses Cognito User Pool with Google SSO
 * Groups: students, admins
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        // TODO: Replace with actual Google OAuth credentials
        // These should be configured via amplify/backend.ts secrets or environment
        clientId: process.env.GOOGLE_CLIENT_ID ?? 'PLACEHOLDER_GOOGLE_CLIENT_ID',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? 'PLACEHOLDER_GOOGLE_CLIENT_SECRET',
        scopes: ['email', 'profile', 'openid'],
        // TODO: Verify attribute mapping API matches Amplify Gen 2 spec
        attributeMapping: {
          email: 'email',
          fullname: 'name',
        },
      },
      // TODO: Set redirect URLs for deployed environment
      callbackUrls: [
        'http://localhost:3000/auth',
        ...(process.env.APP_URL ? [`${process.env.APP_URL}/auth`] : []),
        ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}/auth`] : []), // For Vercel deployments
      ],
      logoutUrls: [
        'http://localhost:3000/',
        ...(process.env.APP_URL ? [`${process.env.APP_URL}/`] : []),
        ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}/`] : []), // For Vercel deployments
      ],
    },
  },

  // TODO: Verify groups API — Amplify Gen 2 may use a different mechanism
  // for Cognito user groups. This may need to be configured via custom CDK.
  groups: ['students', 'admins'],

  // TODO: Customize user attributes if needed
  // userAttributes: {
  //   preferredUsername: { required: false, mutable: true },
  // },
});
