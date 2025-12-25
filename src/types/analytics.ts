// Analytics types

export interface ReferralAnalytics {
  totalReferrals: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byType: Record<string, number>;
  byOutcome: Record<string, number>;
  averageResponseTime: number;
  successRate: number;
  mortalityRate: number;
  trendsOverTime: TrendPoint[];
}

export interface TrendPoint {
  date: string;
  count: number;
  label?: string;
}

export interface FacilityAnalytics {
  facilityId: string;
  facilityName: string;
  totalReferrals: number;
  incomingReferrals: number;
  outgoingReferrals: number;
  acceptanceRate: number;
  averageResponseTime: number;
  outcomes: Record<string, number>;
}

export interface ResponseTimeAnalytics {
  overall: number;
  byPriority: Record<string, number>;
  byFacility: Record<string, number>;
  trend: TrendPoint[];
}

export interface OutcomeAnalytics {
  total: number;
  byOutcome: Record<string, number>;
  byFacility: Record<string, Record<string, number>>;
  trend: TrendPoint[];
}

export interface RCPerformance {
  userId: string;
  userName: string;
  referralsCoordinated: number;
  averageResponseTime: number;
  bedReportCompliance: number;
  rating: number;
}

export interface RCPerformanceResponse {
  coordinators: RCPerformance[];
  averagePerformance: {
    referralsCoordinated: number;
    averageResponseTime: number;
    bedReportCompliance: number;
  };
}

export interface HeatmapData {
  fromFacilityId: string;
  fromFacilityName: string;
  toFacilityId: string;
  toFacilityName: string;
  count: number;
}

export interface DHIS2Export {
  period: string;
  orgUnit: string;
  dataValues: DHIS2DataValue[];
}

export interface DHIS2DataValue {
  dataElement: string;
  value: number;
  comment?: string;
}

export interface AnalyticsQuery {
  dateFrom?: string;
  dateTo?: string;
  facilityId?: string;
  districtId?: string;
}

export interface GenerateReportRequest {
  reportType: 'referrals' | 'facilities' | 'outcomes' | 'performance';
  format: 'pdf' | 'csv' | 'excel';
  dateFrom: string;
  dateTo: string;
  facilityId?: string;
  districtId?: string;
}
