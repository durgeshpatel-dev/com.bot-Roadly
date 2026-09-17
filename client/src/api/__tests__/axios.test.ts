import axios, { AxiosError, AxiosHeaders } from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient, { getAccessToken, refreshAccessToken, setAccessToken } from '../axios';

const originalAdapter = apiClient.defaults.adapter;
const response = (config: InternalAxiosRequestConfig, status = 200): AxiosResponse => ({ data: {}, status, statusText: '', headers: {}, config });
const unauthorized = (config: InternalAxiosRequestConfig) => new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, response(config, 401));

describe('access-token refresh', () => {
  beforeEach(() => setAccessToken('expired'));
  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter;
    setAccessToken(null);
    vi.restoreAllMocks();
  });

  it('shares one refresh between bootstrap and concurrent requests and retries each once', async () => {
    let complete!: (value: AxiosResponse) => void;
    const refresh = vi.spyOn(axios, 'post').mockReturnValue(new Promise((resolve) => { complete = resolve; }));
    let requests = 0;
    apiClient.defaults.adapter = async (config) => {
      requests += 1;
      if (config.headers.Authorization !== 'Bearer renewed') throw unauthorized(config);
      return response(config);
    };
    const bootstrap = refreshAccessToken();
    const first = apiClient.get('/posts');
    const second = apiClient.get('/users/me');
    await vi.waitFor(() => expect(requests).toBe(2));
    complete({ data: { data: { accessToken: 'renewed' } } } as AxiosResponse);
    await Promise.all([bootstrap, first, second]);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(requests).toBe(4);
    expect(getAccessToken()).toBe('renewed');
  });

  it('never recursively refreshes a failing auth endpoint', async () => {
    const refresh = vi.spyOn(axios, 'post');
    apiClient.defaults.adapter = async (config) => { throw unauthorized(config); };
    await expect(apiClient.post('/auth/refresh')).rejects.toMatchObject({ response: { status: 401 } });
    expect(refresh).not.toHaveBeenCalled();
  });

  it('rejects queued requests and clears memory when refresh fails', async () => {
    vi.spyOn(axios, 'post').mockRejectedValue(new Error('Session expired'));
    apiClient.defaults.adapter = async (config) => { throw unauthorized(config); };
    const expired = vi.fn();
    window.addEventListener('auth:unauthorized', expired);
    await expect(apiClient.get('/users/me')).rejects.toThrow('Session expired');
    expect(getAccessToken()).toBeNull();
    expect(expired).toHaveBeenCalledTimes(1);
    window.removeEventListener('auth:unauthorized', expired);
  });

  it('does not restore a session when an in-flight refresh finishes after logout', async () => {
    let complete!: (value: AxiosResponse) => void;
    vi.spyOn(axios, 'post').mockReturnValue(new Promise((resolve) => { complete = resolve; }));
    const pending = refreshAccessToken();
    setAccessToken(null);
    complete({ data: { data: { accessToken: 'too-late' } } } as AxiosResponse);
    await expect(pending).rejects.toThrow('Session changed');
    expect(getAccessToken()).toBeNull();
  });

  it('stops after one retry when the renewed token is also rejected', async () => {
    const refresh = vi.spyOn(axios, 'post').mockResolvedValue({ data: { data: { accessToken: 'renewed' } } });
    apiClient.defaults.adapter = async (config) => { throw unauthorized(config); };
    await expect(apiClient.get('/users/me', { headers: new AxiosHeaders() })).rejects.toMatchObject({ response: { status: 401 } });
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
