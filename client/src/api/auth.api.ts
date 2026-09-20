import apiClient, { refreshAccessToken, waitForRefresh } from './axios';

export interface LoginInput { email: string; password: string }
export interface SignupInput extends LoginInput { name: string }
export interface ResetPasswordInput { token: string; password: string }
interface SuccessResponse<T> { success: true; data: T }

export interface AuthResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    isVerified: boolean;
  };
  accessToken?: string;
  message?: string;
}

export const authApi = {
  register: (data: SignupInput) => apiClient.post<SuccessResponse<AuthResponse>>('/auth/register', data),
  login: (data: LoginInput) => apiClient.post<SuccessResponse<AuthResponse & { accessToken: string }>>('/auth/login', data),
  logout: async () => {
    await waitForRefresh();
    return apiClient.post('/auth/logout');
  },
  refresh: refreshAccessToken,
  verifyEmail: (token: string) => apiClient.post('/auth/verify-email', { token }),
  forgotPassword: (email: string) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (data: ResetPasswordInput) => apiClient.post('/auth/reset-password', data),
  getMe: () => apiClient.get<SuccessResponse<AuthResponse>>('/users/me'),
  adminRegister: (data: SignupInput & { adminSecret: string }) => apiClient.post<SuccessResponse<AuthResponse>>('/auth/admin-register', data),
};
