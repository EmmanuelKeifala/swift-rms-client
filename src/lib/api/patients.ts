import apiClient from './client';
import {
  Patient,
  CreatePatientRequest,
  UpdatePatientRequest,
  PatientListQuery,
  PatientSearchQuery,
  ApiResponse,
  PaginationMeta,
  Referral,
} from '@/types';

export const patientService = {
  list: async (query?: PatientListQuery): Promise<{ data: Patient[]; meta?: PaginationMeta }> => {
    const response = await apiClient.get<ApiResponse<Patient[]>>('/patients', { params: query });
    return { data: response.data.data || [], meta: response.data.meta };
  },

  search: async (query: PatientSearchQuery): Promise<Patient[]> => {
    const response = await apiClient.get<ApiResponse<Patient[]>>('/patients/search', { params: query });
    return response.data.data || [];
  },

  get: async (id: string): Promise<Patient> => {
    const response = await apiClient.get<ApiResponse<Patient>>(`/patients/${id}`);
    return response.data.data!;
  },

  create: async (data: CreatePatientRequest): Promise<Patient> => {
    const response = await apiClient.post<ApiResponse<Patient>>('/patients', data);
    return response.data.data!;
  },

  update: async (id: string, data: UpdatePatientRequest): Promise<Patient> => {
    const response = await apiClient.put<ApiResponse<Patient>>(`/patients/${id}`, data);
    return response.data.data!;
  },

  getReferrals: async (id: string): Promise<Referral[]> => {
    const response = await apiClient.get<ApiResponse<Referral[]>>(`/patients/${id}/referrals`);
    return response.data.data || [];
  },
};
