import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import type { AuthResponse, LoginInput, SignupInput } from '../api/auth.api';
import { setAccessToken } from '../api/axios';

interface AuthContextType {
  user: AuthResponse['user'] | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  signup: (data: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authCheck = useRef<Promise<void> | null>(null);
  const identityVersion = useRef(0);

  const resetIdentityCache = useCallback(() => {
    queryClient.removeQueries({ queryKey: ['admin'] });
    queryClient.resetQueries({ predicate: ({ queryKey }) => ['posts', 'post', 'roadmap'].includes(String(queryKey[0])) }).catch(() => {});
  }, [queryClient]);

  const checkAuth = useCallback(() => {
    if (authCheck.current) return authCheck.current;
    const version = identityVersion.current;
    authCheck.current = (async () => {
      try {
        const token = await authApi.refresh();
        const { data: { data } } = await authApi.getMe();
        if (version !== identityVersion.current) return;
        setAccessTokenState(token);
        setUser(data.user);
        resetIdentityCache();
      } catch {
        if (version !== identityVersion.current) return;
        setUser(null);
        setAccessTokenState(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
        authCheck.current = null;
      }
    })();
    return authCheck.current;
  }, [resetIdentityCache]);

  useEffect(() => {
    const handleUnauthorized = () => {
      identityVersion.current += 1;
      setUser(null);
      setAccessTokenState(null);
      resetIdentityCache();
    };
    const handleToken = (event: Event) => setAccessTokenState((event as CustomEvent<string | null>).detail);
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    window.addEventListener('auth:token', handleToken);
    void checkAuth();
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
      window.removeEventListener('auth:token', handleToken);
    };
  }, [checkAuth, resetIdentityCache]);

  const login = async (credentials: LoginInput) => {
    const { data: { data } } = await authApi.login(credentials);
    identityVersion.current += 1;
    setAccessToken(data.accessToken);
    setAccessTokenState(data.accessToken);
    setUser(data.user);
    resetIdentityCache();
  };

  const signup = async (credentials: SignupInput) => { await authApi.register(credentials); };

  const logout = async () => {
    identityVersion.current += 1;
    setAccessToken(null);
    setAccessTokenState(null);
    setUser(null);
    resetIdentityCache();
    await authApi.logout();
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isAuthenticated: !!user, isLoading, login, signup, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
