import { StrictMode } from 'react';
import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AxiosResponse } from 'axios';
import { AuthProvider, useAuth } from '../AuthContext';
import { authApi } from '../../api/auth.api';
import { getAccessToken, setAccessToken } from '../../api/axios';

vi.mock('../../api/auth.api', () => ({ authApi: { refresh: vi.fn(), getMe: vi.fn(), login: vi.fn(), logout: vi.fn(), register: vi.fn() } }));
const user = { _id: 'admin', name: 'Admin', email: 'admin@example.test', role: 'admin' as const, isVerified: true };
const envelope = <T,>(data: T) => ({ data: { success: true, data } } as AxiosResponse<{ success: true; data: T }>);

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <StrictMode><QueryClientProvider client={client}><AuthProvider>{children}</AuthProvider></QueryClientProvider></StrictMode>
  );
  return { ...renderHook(useAuth, { wrapper }), client };
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setAccessToken(null);
    vi.mocked(authApi.refresh).mockRejectedValue(new Error('No session'));
    vi.mocked(authApi.logout).mockResolvedValue({} as AxiosResponse);
  });

  it('restores the wrapped user profile once in StrictMode', async () => {
    vi.mocked(authApi.refresh).mockResolvedValue('restored-token');
    vi.mocked(authApi.getMe).mockResolvedValue(envelope({ user }));
    const { result } = setup();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toEqual(user);
    expect(result.current.accessToken).toBe('restored-token');
    expect(authApi.refresh).toHaveBeenCalledTimes(1);
    expect(authApi.getMe).toHaveBeenCalledTimes(1);
  });

  it('reads the real login envelope and clears identity-dependent caches on login/logout', async () => {
    vi.mocked(authApi.login).mockResolvedValue(envelope({ user, accessToken: 'login-token' }));
    const { result, client } = setup();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    client.setQueryData(['posts', {}], { posts: [{ hasVoted: false }] });
    await act(() => result.current.login({ email: user.email, password: 'test-password' }));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(user);
    expect(getAccessToken()).toBe('login-token');
    expect(client.getQueryData(['posts', {}])).toBeUndefined();
    client.setQueryData(['admin', 'stats'], { totalPosts: 10 });
    client.setQueryData(['post', '1'], { hasVoted: true });
    await act(() => result.current.logout());
    expect(result.current.isAuthenticated).toBe(false);
    expect(getAccessToken()).toBeNull();
    expect(client.getQueryData(['admin', 'stats'])).toBeUndefined();
    expect(client.getQueryData(['post', '1'])).toBeUndefined();
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });

  it('clears private cache on interceptor session expiry', async () => {
    const { result, client } = setup();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    client.setQueryData(['admin', 'stats'], { totalPosts: 10 });
    act(() => window.dispatchEvent(new Event('auth:unauthorized')));
    expect(result.current.user).toBeNull();
    expect(client.getQueryData(['admin', 'stats'])).toBeUndefined();
  });
});
