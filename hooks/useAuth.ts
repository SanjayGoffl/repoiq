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
  guestId: string;
}

/**
 * Simplified auth hook for public/guest-friendly app.
 * Returns null user for guests, allowing full app access without login.
 * TODO: Replace with actual Amplify Auth when needed (fetchAuthSession, signInWithRedirect).
 */
/**
 * Get or create a persistent guest ID for memory personalization.
 */
function getOrCreateGuestId(): string {
  if (typeof window === 'undefined') return 'guest';
  const key = 'repoiq_guest_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = `guest_${crypto.randomUUID()}`;
    localStorage.setItem(key, id);
  }
  return id;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [guestId, setGuestId] = useState('guest');

  useEffect(() => {
    // Generate persistent guest ID for AI memory
    setGuestId(getOrCreateGuestId());

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
    guestId,
  };
}
