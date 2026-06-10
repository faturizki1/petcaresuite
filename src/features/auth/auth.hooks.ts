import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from './auth.service';

export function useAuthActions() {
  const setUser = useAuthStore((state) => state.setUser);
  const setSession = useAuthStore((state) => state.setSession);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  const signIn = useCallback(
    async (email: string, password: string, redirectTo = '/dashboard') => {
      const { user, session } = await authService.signIn(email, password);
      setUser(user);
      setSession(session);
      navigate(redirectTo, { replace: true });
    },
    [navigate, setSession, setUser]
  );

  const signOut = useCallback(async () => {
    await authService.signOut();
    clearAuth();
    navigate('/login');
  }, [clearAuth, navigate]);

  const sendPasswordReset = useCallback(async (email: string) => {
    await authService.sendPasswordResetEmail(email);
  }, []);

  return {
    signIn,
    signOut,
    sendPasswordReset
  };
}
