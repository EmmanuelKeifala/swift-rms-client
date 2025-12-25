// Readiness types

import { ReadinessLevel } from './common';
import { FacilitySummary } from './facility';

export interface FacilityReadiness {
  id: string;
  facility: FacilitySummary;
  overallScore: number;
  bedsAvailable: number;
  bedsTotal: number;
  bedsByWard: BedsByWard[];
  bloodBank: BloodBankStatus;
  oxygenStatus: ReadinessLevel;
  oxygenCylinders: number;
  staffingStatus: ReadinessLevel;
  doctorsOnDuty: number;
  nursesOnDuty: number;
  specialistsAvailable: string[];
  equipmentStatus: EquipmentStatus[];
  emergencySuppliesStatus: ReadinessLevel;
  emergencySupplies: string[];
  theatreAvailable: boolean;
  operatingRoomsAvailable: number;
  reportedBy: string;
  reportedAt: string;
  createdAt: string;
}

export interface BedsByWard {
  wardName: string;
  total: number;
  available: number;
  occupancy: number;
}

export interface BloodBankStatus {
  status: ReadinessLevel;
  units: BloodUnit[];
}

export interface BloodUnit {
  type: string;
  units: number;
  status: ReadinessLevel;
}

export interface EquipmentStatus {
  name: string;
  total: number;
  working: number;
}

export interface CreateReadinessRequest {
  bedsAvailable: number;
  bedsTotal: number;
  bedsByWard?: BedsByWard[];
  bloodUnits?: BloodUnit[];
  oxygenStatus: ReadinessLevel;
  oxygenCylinders?: number;
  staffingStatus: ReadinessLevel;
  doctorsOnDuty?: number;
  nursesOnDuty?: number;
  specialistsAvailable?: string[];
  equipmentStatus?: EquipmentStatus[];
  emergencySuppliesStatus: ReadinessLevel;
  emergencySupplies?: string[];
  theatreAvailable?: boolean;
  operatingRoomsAvailable?: number;
}

export interface BedMonitoring {
  facilities: FacilityBedStatus[];
  totalBeds: number;
  availableBeds: number;
  occupancyRate: number;
}

export interface FacilityBedStatus {
  facilityId: string;
  facilityName: string;
  totalBeds: number;
  availableBeds: number;
  occupancyRate: number;
  lastUpdated: string;
}
