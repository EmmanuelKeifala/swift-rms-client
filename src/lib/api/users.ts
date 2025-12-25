import apiClient from './client';
import {
  User,
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateProfileRequest,
  UserListQuery,
  ApiResponse,
  PaginationMeta,
} from '@/types';

export const userService = {
  list: async (query?: UserListQuery): Promise<{ data: User[]; meta?: PaginationMeta }> => {
    const response = await apiClient.get<ApiResponse<User[]>>('/users', { params: query });
    return { data: response.data.data || [], meta: response.data.meta };
  },

  get: async (id: string): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data!;
  },

  getMe: async (): Promise<UserResponse> => {
    const response = await apiClient.get<ApiResponse<UserResponse>>('/users/me');
    return response.data.data!;
  },

  create: async (data: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>('/users', data);
    return response.data.data!;
  },

  update: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data.data!;
  },

  updateMe: async (data: UpdateProfileRequest): Promise<UserResponse> => {
    const response = await apiClient.put<ApiResponse<UserResponse>>('/users/me', data);
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};
