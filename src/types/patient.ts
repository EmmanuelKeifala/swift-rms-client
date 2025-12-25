// Patient types

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone?: string;
  address?: string;
  bloodType?: string;
  allergies?: string;
  chronicConditions?: string;
  isPregnant?: boolean;
  estimatedDeliveryDate?: string;
  nextOfKinName?: string;
  nextOfKinPhone?: string;
  nextOfKinRelationship?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone?: string;
  address?: string;
  bloodType?: string;
  allergies?: string;
  chronicConditions?: string;
  isPregnant?: boolean;
  estimatedDeliveryDate?: string;
  nextOfKinName?: string;
  nextOfKinPhone?: string;
  nextOfKinRelationship?: string;
}

export interface UpdatePatientRequest {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  bloodType?: string;
  allergies?: string;
  chronicConditions?: string;
  isPregnant?: boolean;
  estimatedDeliveryDate?: string;
  nextOfKinName?: string;
  nextOfKinPhone?: string;
  nextOfKinRelationship?: string;
}

export interface PatientListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PatientSearchQuery {
  q: string;
  fields?: string;
}

export interface PatientSummary {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  age?: number;
  phone?: string;
}
