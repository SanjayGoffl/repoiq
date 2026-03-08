'use client';

import { useEffect, useState } from 'react';

interface AuthUser {
  userId: string;
  email: string;
  name: string;
  groups: string[];
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isGuest: boolean;
}

/**
 * Simplified auth hook for public/guest-friendly app.
 * Returns null user for guests, allowing full app access without login.
 * TODO: Replace with actual Amplify Auth when needed (fetchAuthSession, signInWithRedirect).
 */
export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // For now, always return guest mode (no user)
    // In future, uncomment to check Amplify Auth:
    // const checkAuth = async () => {
    //   try {
    //     const session = await fetchAuthSession();
    //     if (session?.tokens?.accessToken) {
    //       const attributes = await fetchUserAttributes();
    //       setUser({
    //         userId: session.userSub || '',
    //         email: attributes.email || '',
    //         name: attributes.name || '',
    //         groups: session.signInUserSession?.idToken?.payload['cognito:groups'] || [],
    //       });
    //     }
    //   } catch (error) {
    //     console.debug('Guest mode (no auth required)');
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // void checkAuth();
    
    setIsLoading(false);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    isAdmin: user?.groups?.includes('admins') ?? false,
    isGuest: user === null,
  };
}
