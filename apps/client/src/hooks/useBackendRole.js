import { useState, useEffect, useCallback } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';

export function useBackendRole() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRole = useCallback(async () => {
    // Not ready or not logged in — nothing to fetch
    if (!isLoaded) return;
    if (!isSignedIn || !user) {
      setRole(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 1️⃣  Fast path: role already in Clerk publicMetadata
      const metadataRole = user?.publicMetadata?.role;
      if (metadataRole) {
        setRole(metadataRole);
        setIsLoading(false);
        return;
      }

      // 2️⃣  Slow path: ask the backend (also initialises the role if missing)
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/role`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch role');

      const data = await response.json();
      setRole(data.role ?? 'user');
    } catch (err) {
      console.error('Error fetching role:', err);
      setError(err.message);
      setRole('user'); // safe default
    } finally {
      setIsLoading(false);
    }
  }, [user, isLoaded, isSignedIn, getToken]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  const refreshRole = useCallback(() => fetchRole(), [fetchRole]);

  return {
    role,
    isAdmin: role === 'admin',
    isUser:  role === 'user',
    isLoading,
    error,
    refreshRole,
  };
}

/**
 * Check whether the current user has a specific role.
 * @param {string} requiredRole
 */
export function useRequireRole(requiredRole) {
  const { role, isLoading, error } = useBackendRole();
  return {
    hasRole: role === requiredRole,
    isLoading,
    error,
  };
}

/**
 * One-shot hook to initialise a brand-new user's role on first login.
 * Call `initializeRole()` inside a Clerk `afterSignIn` or `onLoad` handler.
 */
export function useInitializeRole() {
  const { getToken } = useAuth();
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError]           = useState(null);

  const initializeRole = useCallback(async () => {
    try {
      setIsInitializing(true);
      setInitError(null);

      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/initialize`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to initialize role');

      return await response.json(); // { success: true, role: 'user' }
    } catch (err) {
      console.error('Error initializing role:', err);
      setInitError(err.message);
      throw err;
    } finally {
      setIsInitializing(false);
    }
  }, [getToken]);

  return { initializeRole, isInitializing, initError };
}