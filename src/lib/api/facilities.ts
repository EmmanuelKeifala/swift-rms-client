import apiClient from './client';
import {
  Facility,
  CreateFacilityRequest,
  UpdateFacilityRequest,
  FacilityListQuery,
  NearbyQuery,
  FacilityWithDistance,
  BulkUploadFacilityItem,
  BulkUploadResult,
  FacilityStats,
  ApiResponse,
  PaginationMeta,
} from '@/types';

export const facilityService = {
  list: async (query?: FacilityListQuery): Promise<{ data: Facility[]; meta?: PaginationMeta }> => {
    const response = await apiClient.get<ApiResponse<Facility[]>>('/facilities', { params: query });
    return { data: response.data.data || [], meta: response.data.meta };
  },

  search: async (q: string): Promise<Facility[]> => {
    const response = await apiClient.get<ApiResponse<Facility[]>>('/facilities/search', { params: { q } });
    return response.data.data || [];
  },

  nearby: async (query: NearbyQuery): Promise<FacilityWithDistance[]> => {
    const response = await apiClient.get<ApiResponse<FacilityWithDistance[]>>('/facilities/nearby', { params: query });
    return response.data.data || [];
  },

  get: async (id: string): Promise<Facility> => {
    const response = await apiClient.get<ApiResponse<Facility>>(`/facilities/${id}`);
    return response.data.data!;
  },

  create: async (data: CreateFacilityRequest): Promise<Facility> => {
    const response = await apiClient.post<ApiResponse<Facility>>('/facilities', data);
    return response.data.data!;
  },

  update: async (id: string, data: UpdateFacilityRequest): Promise<Facility> => {
    const response = await apiClient.put<ApiResponse<Facility>>(`/facilities/${id}`, data);
    return response.data.data!;
  },

  getServices: async (id: string): Promise<string[]> => {
    const response = await apiClient.get<ApiResponse<string[]>>(`/facilities/${id}/services`);
    return response.data.data || [];
  },

  getStaff: async (id: string): Promise<unknown[]> => {
    const response = await apiClient.get<ApiResponse<unknown[]>>(`/facilities/${id}/staff`);
    return response.data.data || [];
  },

  bulkUpload: async (facilities: BulkUploadFacilityItem[]): Promise<BulkUploadResult> => {
    const response = await apiClient.post<ApiResponse<BulkUploadResult>>('/facilities/bulk-upload', { facilities });
    return response.data.data!;
  },

  downloadTemplate: async (): Promise<Blob> => {
    const response = await apiClient.get('/facilities/template', {
      responseType: 'blob',
    });
    return response.data;
  },

  getStats: async (): Promise<FacilityStats> => {
    const response = await apiClient.get<ApiResponse<FacilityStats>>('/facilities/stats');
    return response.data.data!;
  },
};
