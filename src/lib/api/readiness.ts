import apiClient from './client';
import {
  FacilityReadiness,
  CreateReadinessRequest,
  BedMonitoring,
  ApiResponse,
  PaginationMeta,
} from '@/types';

export const readinessService = {
  list: async (facilityId?: string): Promise<{ data: FacilityReadiness[]; meta?: PaginationMeta }> => {
    const response = await apiClient.get<ApiResponse<FacilityReadiness[]>>('/facility-readiness', { 
      params: facilityId ? { facilityId } : undefined 
    });
    return { data: response.data.data || [], meta: response.data.meta };
  },

  getCurrent: async (): Promise<FacilityReadiness | null> => {
    const response = await apiClient.get<ApiResponse<FacilityReadiness[]>>('/facility-readiness/current');
    // The API returns an array of all facilities' current readiness; take the first one for single facility view
    const data = response.data.data;
    return data && data.length > 0 ? data[0] : null;
  },

  getAllCurrent: async (): Promise<FacilityReadiness[]> => {
    const response = await apiClient.get<ApiResponse<FacilityReadiness[]>>('/facility-readiness/current');
    // Returns all facilities' current readiness for admin/dispatch users
    return response.data.data || [];
  },

  getLatest: async (facilityId: string): Promise<FacilityReadiness> => {
    const response = await apiClient.get<ApiResponse<FacilityReadiness>>(`/facilities/${facilityId}/readiness/latest`);
    return response.data.data!;
  },

  getHistory: async (facilityId: string, page?: number, limit?: number): Promise<{ data: FacilityReadiness[]; meta?: PaginationMeta }> => {
    const response = await apiClient.get<ApiResponse<FacilityReadiness[]>>(`/facilities/${facilityId}/readiness/history`, {
      params: { page, limit }
    });
    return { data: response.data.data || [], meta: response.data.meta };
  },

  create: async (data: CreateReadinessRequest): Promise<FacilityReadiness> => {
    const response = await apiClient.post<ApiResponse<FacilityReadiness>>('/facility-readiness', data);
    return response.data.data!;
  },

  update: async (data: CreateReadinessRequest): Promise<FacilityReadiness> => {
    const response = await apiClient.post<ApiResponse<FacilityReadiness>>('/facility-readiness', data);
    return response.data.data!;
  },

  getBedMonitoring: async (): Promise<BedMonitoring> => {
    const response = await apiClient.get<ApiResponse<BedMonitoring>>('/facility-readiness/bed-monitoring');
    return response.data.data!;
  },
};
