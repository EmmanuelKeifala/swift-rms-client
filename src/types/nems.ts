// NEMS and Ambulance types

import { NEMSRequestStatus, AmbulanceStatus, Priority } from './common';

export interface Ambulance {
  id: string;
  code: string;
  plateNumber: string;
  type: string;
  status: AmbulanceStatus;
  district: string;
  currentLocation?: Location;
  crew?: CrewMember[];
  lastUpdated: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  phone: string;
}

export interface NEMSRequest {
  id: string;
  referralId?: string;
  referralCode?: string;
  requestType: 'EMERGENCY' | 'INTER_HOSPITAL' | 'ROUTINE';
  priority: Priority;
  status: NEMSRequestStatus;
  pickupLocation: Location;
  pickupFacility?: string;
  dropoffLocation?: Location;
  dropoffFacility?: string;
  patientName?: string;
  patientCondition?: string;
  ambulance?: Ambulance;
  dispatchedAt?: string;
  arrivedAtPickup?: string;
  leftPickup?: string;
  arrivedAtDropoff?: string;
  completedAt?: string;
  estimatedArrival?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNEMSRequest {
  referralId?: string;
  requestType: 'EMERGENCY' | 'INTER_HOSPITAL' | 'ROUTINE';
  priority: Priority;
  pickupLatitude: number;
  pickupLongitude: number;
  pickupAddress?: string;
  pickupFacilityId?: string;
  dropoffLatitude?: number;
  dropoffLongitude?: number;
  dropoffAddress?: string;
  dropoffFacilityId?: string;
  patientName?: string;
  patientCondition?: string;
  notes?: string;
}

export interface UpdateNEMSRequest {
  status?: NEMSRequestStatus;
  ambulanceId?: string;
  notes?: string;
  cancelReason?: string;
}

export interface NEMSListQuery {
  status?: NEMSRequestStatus;
  priority?: Priority;
  ambulanceId?: string;
  page?: number;
  limit?: number;
}

// Call Centre types
export interface Call {
  id: string;
  callerPhone: string;
  callerName?: string;
  callerFacility?: string;
  emergencyNature: string;
  patientName?: string;
  patientAge?: number;
  chiefComplaint?: string;
  vitalSigns?: Record<string, unknown>;
  triageCode?: string;
  triageScore?: number;
  nemsRequestId?: string;
  referralId?: string;
  operatorId: string;
  duration: number;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  createdAt: string;
  completedAt?: string;
}

export interface CreateCallRequest {
  callerPhone: string;
  callerName?: string;
  callerFacilityId?: string;
  emergencyNature: string;
  patientName?: string;
  patientAge?: number;
  chiefComplaint?: string;
  vitalSigns?: Record<string, unknown>;
}

export interface CallCentreDashboard {
  activeCalls: number;
  ambulancesOnMission: number;
  ambulancesAvailable: number;
  averageResponseTime: number;
  todaysCalls: number;
  todaysMissions: number;
}
