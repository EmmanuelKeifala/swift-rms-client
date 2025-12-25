import apiClient from './client';
import {
  ReferralAnalytics,
  FacilityAnalytics,
  ResponseTimeAnalytics,
  OutcomeAnalytics,
  RCPerformanceResponse,
  HeatmapData,
  DHIS2Export,
  AnalyticsQuery,
  GenerateReportRequest,
  ApiResponse,
} from '@/types';

export const analyticsService = {
  getReferralAnalytics: async (query?: AnalyticsQuery): Promise<ReferralAnalytics> => {
    const response = await apiClient.get<ApiResponse<ReferralAnalytics>>('/analytics/referrals', { params: query });
    return response.data.data!;
  },

  getReferralHeatmap: async (query?: AnalyticsQuery): Promise<HeatmapData[]> => {
    const response = await apiClient.get<ApiResponse<HeatmapData[]>>('/analytics/referrals/heatmap', { params: query });
    return response.data.data || [];
  },

  getFacilityAnalytics: async (query?: AnalyticsQuery): Promise<FacilityAnalytics[]> => {
    const response = await apiClient.get<ApiResponse<FacilityAnalytics[]>>('/analytics/facilities', { params: query });
    return response.data.data || [];
  },

  getResponseTimes: async (query?: AnalyticsQuery): Promise<ResponseTimeAnalytics> => {
    const response = await apiClient.get<ApiResponse<ResponseTimeAnalytics>>('/analytics/response-times', { params: query });
    return response.data.data!;
  },

  getOutcomes: async (query?: AnalyticsQuery): Promise<OutcomeAnalytics> => {
    const response = await apiClient.get<ApiResponse<OutcomeAnalytics>>('/analytics/outcomes', { params: query });
    return response.data.data!;
  },

  getRCPerformance: async (query?: AnalyticsQuery): Promise<RCPerformanceResponse> => {
    const response = await apiClient.get<ApiResponse<RCPerformanceResponse>>('/analytics/rc-performance', { params: query });
    return response.data.data!;
  },

  getDHIS2Export: async (query?: AnalyticsQuery): Promise<DHIS2Export> => {
    const response = await apiClient.get<ApiResponse<DHIS2Export>>('/analytics/dhis2-export', { params: query });
    return response.data.data!;
  },

  generateReport: async (data: GenerateReportRequest): Promise<{ url: string }> => {
    const response = await apiClient.post<ApiResponse<{ url: string }>>('/analytics/reports/generate', data);
    return response.data.data!;
  },
};
