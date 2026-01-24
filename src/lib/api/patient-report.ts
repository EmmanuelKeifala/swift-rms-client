import apiClient from './client';
import {
  PatientReport,
  CreatePatientReportRequest,
  UpdatePatientReportRequest,
  PatientReportListQuery,
  ApiResponse,
  PaginationMeta,
} from '@/types';

export const patientReportService = {
  // List patient reports with pagination and filters
  list: async (query?: PatientReportListQuery): Promise<{ data: PatientReport[]; meta?: PaginationMeta }> => {
    const response = await apiClient.get<ApiResponse<PatientReport[]>>('/patient-reports', { params: query });
    return { data: response.data.data || [], meta: response.data.meta };
  },

  // Get patient report by ID
  get: async (id: string): Promise<PatientReport> => {
    const response = await apiClient.get<ApiResponse<PatientReport>>(`/patient-reports/${id}`);
    return response.data.data!;
  },

  // Get patient report by NEMS request/mission ID
  getByMission: async (missionId: string): Promise<PatientReport | null> => {
    const response = await apiClient.get<ApiResponse<PatientReport>>(`/patient-reports/by-mission/${missionId}`);
    return response.data.data || null;
  },

  // Create a new patient report
  create: async (data: CreatePatientReportRequest): Promise<PatientReport> => {
    const response = await apiClient.post<ApiResponse<PatientReport>>('/patient-reports', data);
    return response.data.data!;
  },

  // Update an existing patient report
  update: async (id: string, data: UpdatePatientReportRequest): Promise<PatientReport> => {
    const response = await apiClient.patch<ApiResponse<PatientReport>>(`/patient-reports/${id}`, data);
    return response.data.data!;
  },

  // Sync a patient report (mark as synced after offline save)
  sync: async (id: string): Promise<PatientReport> => {
    const response = await apiClient.post<ApiResponse<PatientReport>>(`/patient-reports/${id}/sync`);
    return response.data.data!;
  },
};
