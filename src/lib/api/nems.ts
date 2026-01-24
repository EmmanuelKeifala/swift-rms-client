import apiClient from './client';
import {
  Ambulance,
  NEMSRequest,
  CreateNEMSRequest,
  UpdateNEMSRequest,
  NEMSListQuery,
  Call,
  CreateCallRequest,
  CallCentreDashboard,
  Location,
  LogVitalsRequest,
  ApiResponse,
  PaginationMeta,
} from '@/types';

export const nemsService = {
  // Requests/Missions
  listRequests: async (query?: NEMSListQuery): Promise<{ data: NEMSRequest[]; meta?: PaginationMeta }> => {
    const response = await apiClient.get<ApiResponse<NEMSRequest[]>>('/nems/requests', { params: query });
    return { data: response.data.data || [], meta: response.data.meta };
  },

  getRequest: async (id: string): Promise<NEMSRequest> => {
    const response = await apiClient.get<ApiResponse<NEMSRequest>>(`/nems/requests/${id}`);
    return response.data.data!;
  },

  createRequest: async (data: CreateNEMSRequest): Promise<NEMSRequest> => {
    const response = await apiClient.post<ApiResponse<NEMSRequest>>('/nems/requests', data);
    return response.data.data!;
  },

  updateRequest: async (id: string, data: UpdateNEMSRequest): Promise<NEMSRequest> => {
    const response = await apiClient.patch<ApiResponse<NEMSRequest>>(`/nems/requests/${id}`, data);
    return response.data.data!;
  },

  // Ambulances
  listAmbulances: async (status?: string): Promise<Ambulance[]> => {
    const response = await apiClient.get<ApiResponse<Ambulance[]>>('/nems/ambulances', { 
      params: status ? { status } : undefined 
    });
    return response.data.data || [];
  },

  getAmbulance: async (id: string): Promise<Ambulance> => {
    const response = await apiClient.get<ApiResponse<Ambulance>>(`/nems/ambulances/${id}`);
    return response.data.data!;
  },

  getAmbulanceLocation: async (id: string): Promise<Location> => {
    const response = await apiClient.get<ApiResponse<Location>>(`/nems/ambulances/${id}/location`);
    return response.data.data!;
  },

  // Vitals logging for ambulance crew (Journey 2)
  logVitals: async (requestId: string, data: LogVitalsRequest): Promise<NEMSRequest> => {
    const response = await apiClient.post<ApiResponse<NEMSRequest>>(`/nems/requests/${requestId}/vitals`, data);
    return response.data.data!;
  },

  // Dispatch helpers
  dispatch: async (requestId: string, ambulanceId: string): Promise<NEMSRequest> => {
    return nemsService.updateRequest(requestId, { status: 'DISPATCHED', ambulanceId });
  },

  cancel: async (requestId: string, reason: string): Promise<NEMSRequest> => {
    return nemsService.updateRequest(requestId, { status: 'CANCELLED', cancelReason: reason });
  },
};

export const callCentreService = {
  logCall: async (data: CreateCallRequest): Promise<Call> => {
    const response = await apiClient.post<ApiResponse<Call>>('/call-centre/calls', data);
    return response.data.data!;
  },

  getCall: async (id: string): Promise<Call> => {
    const response = await apiClient.get<ApiResponse<Call>>(`/call-centre/calls/${id}`);
    return response.data.data!;
  },

  updateCall: async (id: string, data: Partial<Call>): Promise<Call> => {
    const response = await apiClient.patch<ApiResponse<Call>>(`/call-centre/calls/${id}`, data);
    return response.data.data!;
  },

  listMissions: async (): Promise<{ data: NEMSRequest[]; meta?: PaginationMeta }> => {
    const response = await apiClient.get<ApiResponse<NEMSRequest[]>>('/call-centre/missions');
    return { data: response.data.data || [], meta: response.data.meta };
  },

  getMission: async (id: string): Promise<NEMSRequest> => {
    const response = await apiClient.get<ApiResponse<NEMSRequest>>(`/call-centre/missions/${id}`);
    return response.data.data!;
  },

  updateMission: async (id: string, data: UpdateNEMSRequest): Promise<NEMSRequest> => {
    const response = await apiClient.patch<ApiResponse<NEMSRequest>>(`/call-centre/missions/${id}`, data);
    return response.data.data!;
  },

  getDashboard: async (): Promise<CallCentreDashboard> => {
    const response = await apiClient.get<ApiResponse<CallCentreDashboard>>('/call-centre/dashboard');
    return response.data.data!;
  },

  createInterHospitalRequest: async (data: CreateNEMSRequest): Promise<NEMSRequest> => {
    const response = await apiClient.post<ApiResponse<NEMSRequest>>('/call-centre/inter-hospital-request', data);
    return response.data.data!;
  },
};
