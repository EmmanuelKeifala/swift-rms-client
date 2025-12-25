import apiClient from './client';
import { ApiResponse } from '@/types';

export interface District {
  id: string;
  name: string;
  code: string;
  regionId: string;
  region?: {
    id: string;
    name: string;
    code: string;
  };
}

export const districtService = {
  list: async (): Promise<District[]> => {
    const response = await apiClient.get<ApiResponse<District[]>>('/districts');
    return response.data.data || [];
  },
};
