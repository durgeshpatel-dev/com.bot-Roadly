import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../api/auth.api';
import type { AuthResponse } from '../api/auth.api';
import { setAccessToken } from '../api/axios';

interface AuthContextType {
  user: AuthResponse['user'] | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      // First try to refresh token via httpOnly cookie
      const { data: refreshData } = await authApi.refresh();
      const token = refreshData.data.accessToken;
      
      setAccessToken(token); // Update axios interceptor
      setAccessTokenState(token); // Update react state

      // If refresh succeeded, fetch user profile
      const { data: userData } = await authApi.getMe();
      setUser(userData.user);
    } catch (error) {
      setUser(null);
      setAccessTokenState(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // Listen for unauthorized events from axios interceptor
    const handleUnauthorized = () => {
      setUser(null);
      setAccessTokenState(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (credentials: any) => {
    const { data } = await authApi.login(credentials);
    const token = data.accessToken!;
    
    setAccessToken(token);
    setAccessTokenState(token);
    setUser(data.user);
  };

  const signup = async (credentials: any) => {
    await authApi.register(credentials);
    // Don't auto-login after signup as they need to verify email
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setAccessTokenState(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
