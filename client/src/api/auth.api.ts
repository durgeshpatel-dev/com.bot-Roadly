import apiClient from './axios';

export interface AuthResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
  };
  accessToken?: string;
  message?: string;
}

export const authApi = {
  register: (data: any) => apiClient.post<AuthResponse>('/auth/register', data),
  login: (data: any) => apiClient.post<AuthResponse>('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  refresh: () => apiClient.post<{ success: boolean; data: { accessToken: string } }>('/auth/refresh'),
  verifyEmail: (token: string) => apiClient.post('/auth/verify-email', { token }),
  forgotPassword: (email: string) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (data: any) => apiClient.post('/auth/reset-password', data),
  getMe: () => apiClient.get<AuthResponse>('/users/me'),
};
