import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

let accessToken: string | null = null;
let sessionVersion = 0;
let refreshPromise: Promise<string> | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  sessionVersion += 1;
  window.dispatchEvent(new CustomEvent('auth:token', { detail: token }));
};

export const getAccessToken = () => accessToken;
export const getSessionVersion = () => sessionVersion;

// Bootstrap and expired requests share one rotation, including StrictMode mounts.
export const refreshAccessToken = (): Promise<string> => {
  if (!refreshPromise) {
    const version = sessionVersion;
    refreshPromise = axios.post<{ data: { accessToken: string } }>(
      `${apiClient.defaults.baseURL}/auth/refresh`, {},
      { withCredentials: true, timeout: 15_000 },
    ).then(({ data }) => {
      if (version !== sessionVersion) throw new Error('Session changed during refresh');
      setAccessToken(data.data.accessToken);
      return data.data.accessToken;
    }).finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
};

export const waitForRefresh = async () => {
  // Logout must revoke the latest cookie if a rotation was already in flight.
  await refreshPromise?.catch(() => undefined);
};

apiClient.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  else config.headers.delete('Authorization');
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (error.response?.status !== 401 || !request || request._retry || request.url?.startsWith('/auth/')) {
      return Promise.reject(error);
    }

    request._retry = true;
    const version = sessionVersion;
    try {
      // A slower 401 may arrive after another request already refreshed successfully.
      const token = accessToken && request.headers.Authorization !== `Bearer ${accessToken}`
        ? accessToken : await refreshAccessToken();
      request.headers.Authorization = `Bearer ${token}`;
      return apiClient(request);
    } catch (refreshError) {
      if (version === sessionVersion) {
        setAccessToken(null);
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
      return Promise.reject(refreshError);
    }
  },
);

export default apiClient;
