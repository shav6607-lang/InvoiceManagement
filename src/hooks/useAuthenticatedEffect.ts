import { useEffect } from 'react';
import { useAppSelector } from '@/redux/hooks';

/**
 * Runs the callback only when the user is authenticated with a valid token.
 * Prevents protected API calls on the login page or after logout.
 */
export const useAuthenticatedEffect = (
  effect: () => void | (() => void),
  deps: React.DependencyList = [],
): void => {
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !token?.trim()) return;
    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token, ...deps]);
};
