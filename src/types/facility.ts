// Facility types

import { FacilityType } from './common';

export interface FacilitySummary {
  id: string;
  name: string;
  code: string;
  type: FacilityType;
}

export interface Facility {
  id: string;
  name: string;
  code: string;
  type: FacilityType;
  level: number;
  address?: string;
  district: DistrictSummary;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  isActive: boolean;
  hasEmergencyServices: boolean;
  services: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DistrictSummary {
  id: string;
  name: string;
  code: string;
}

export interface CreateFacilityRequest {
  name: string;
  facilityCode: string;
  facilityType: FacilityType;
  level: number;
  districtId: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  services?: string[];
  operatingHours?: Record<string, string>;
}

export interface UpdateFacilityRequest {
  name?: string;
  type?: FacilityType;
  level?: number;
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  isActive?: boolean;
  hasEmergencyServices?: boolean;
  services?: string[];
}

export interface FacilityListQuery {
  type?: FacilityType;
  districtId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface NearbyQuery {
  latitude: number;
  longitude: number;
  radius?: number; // in km
}

export interface FacilityWithDistance extends Facility {
  distance: number; // in km
}
