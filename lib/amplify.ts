import { Amplify } from 'aws-amplify';

export function configureAmplify(): void {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID ?? '',
        userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID ?? '',
        identityPoolId: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID ?? '',
        loginWith: {
          oauth: {
            domain: process.env.NEXT_PUBLIC_OAUTH_DOMAIN ?? '',
            scopes: ['openid', 'email', 'profile'],
            redirectSignIn: [
              process.env.NEXT_PUBLIC_APP_URL || 
              (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000')
            ],
            redirectSignOut: [
              process.env.NEXT_PUBLIC_APP_URL || 
              (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000')
            ],
            responseType: 'code',
          },
        },
      },
    },
  });
}
