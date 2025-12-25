import apiClient, { setTokens, clearTokens } from './client';
import {
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RegisterRequest,
  UserResponse,
  ApiResponse,
} from '@/types';

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
    const loginData = response.data.data!;
    setTokens(loginData.accessToken, loginData.refreshToken);
    return loginData;
  },

  refresh: async (data: RefreshRequest): Promise<RefreshResponse> => {
    const response = await apiClient.post<ApiResponse<RefreshResponse>>('/auth/refresh', data);
    const refreshData = response.data.data!;
    setTokens(refreshData.accessToken, refreshData.refreshToken);
    return refreshData;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      clearTokens();
    }
  },

  register: async (data: RegisterRequest): Promise<UserResponse> => {
    const response = await apiClient.post<ApiResponse<UserResponse>>('/auth/register', data);
    return response.data.data!;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/forgot-password', data);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/reset-password', data);
  },
};
