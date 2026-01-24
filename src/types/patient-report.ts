// Patient Report types for NEMS Crew Journey 2
// Based on Patient Form_Ambulance Team use.docx

// Location types
export type LocationType = 
  | 'HOME' 
  | 'ROAD' 
  | 'PUBLIC' 
  | 'COMMERCIAL' 
  | 'WORKPLACE' 
  | 'PHU' 
  | 'HOSPITAL';

// ABC Status
export type ABCStatus = 'NORMAL' | 'ABNORMAL';

// Triage color codes
export type TriageColorCode = 'RED' | 'YELLOW' | 'GREEN' | 'BLACK';

// Transport decisions
export type TransportDecision = 
  | 'NOT_NECESSARY' 
  | 'REFUSED' 
  | 'TO_PHU' 
  | 'TO_BEMOC' 
  | 'TO_HOSPITAL' 
  | 'EXPIRED';

// Patient condition at handover
export type PatientCondition = 'IMPROVED' | 'DETERIORATED' | 'UNCHANGED' | 'EXPIRED';

// Sync status
export type SyncStatus = 'PENDING_SYNC' | 'SYNCED' | 'SYNC_FAILED';

// Non-traumatic conditions (checkboxes on form)
export const NON_TRAUMATIC_CONDITIONS = [
  'PREGNANT', 'CHEST_PAIN', 'VOMITING', 'HEADACHE', 'FAINTING', 'DIARRHOEA',
  'SEIZURES', 'EPIGASTRIC_PAIN', 'FEVER', 'BLEEDING', 'RESP_DISTRESS',
  'SHIVERING', 'NEUROLOGICAL_DISORDER', 'COUGH', 'PSYCHIATRIC'
] as const;

// Traumatic conditions (checkboxes on form)
export const TRAUMATIC_CONDITIONS = [
  'ROAD_ACCIDENT', 'WORK_ACCIDENT', 'HOME_ACCIDENT', 'VIOLENCE', 'TOXIC',
  'FALL_UNDER_3M', 'EXPLOSION', 'DROWNING', 'HANGING', 'FALL_OVER_3M',
  'FIRE', 'DRUGS', 'BEATING', 'IMPACT', 'HEAT', 'ANIMAL_BITE', 'KNIFE',
  'ELECTRICITY', 'SEXUAL_ASSAULT', 'FIREARM', 'MACHINERY', 'GAS_SMOKE',
  'POISONING', 'OTHER_WEAPON'
] as const;

// Body regions for trauma assessment
export const BODY_REGIONS = ['CRA', 'FAC', 'SPI', 'THO', 'ABD', 'PEL', 'RUL', 'LUL', 'RLL', 'LLL'] as const;
export type BodyRegion = typeof BODY_REGIONS[number];

// Trauma findings
export const TRAUMA_FINDINGS = ['PAIN', 'ABRASION', 'WOUND', 'BLEEDING', 'SWELLING', 'DEFORMITY', 'AMPUTATION', 'BURN'] as const;
export type TraumaFinding = typeof TRAUMA_FINDINGS[number];

// Interventions from form
export const INTERVENTIONS = [
  'CHIN_LIFT', 'FACIAL_MASK', 'BANDAGE', 'SUCTION', 'OXYGEN', 'PRESSURE',
  'OP_CANULA', 'BAG_VENT', 'ELEVATE_LIMB', 'ELEVATE_LEGS', 'TOURNIQUET'
] as const;

// Trauma region assessment
export interface TraumaRegion {
  region: BodyRegion;
  findings: TraumaFinding[];
}

// Mission timeline
export interface MissionTimeline {
  dispatchTime?: string;
  enrouteTime?: string;
  arrivalAtLocationTime?: string;
  departureFromLocationTime?: string;
  arrivalAtDestinationTime?: string;
  returnToStandbyTime?: string;
}

// Vital signs reading with AVPU
export interface VitalSignsReading {
  time: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperature?: number;
  avpu: 'A' | 'V' | 'P' | 'U';
}

// Pregnancy assessment
export interface PregnancyAssessment {
  gestationalAgeWeeks?: number;
  isFirstPregnancy?: boolean;
  ageUnder16?: boolean;
  ageOver35?: boolean;
  isTwins?: boolean;
  hasSpotting?: boolean;
  hasLabor?: boolean;
  hasAbdominalPain?: boolean;
  hasReducedFetalMovement?: boolean;
  hasFeverOver37_5?: boolean;
  hasFeverOver38?: boolean;
  hasFeverUnder35?: boolean;
  hasBleeding?: boolean;
  hasSevereAbdominalPain?: boolean;
  noFetalMovement?: boolean;
}

// Patient Report Response
export interface PatientReport {
  id: string;
  missionId?: string;
  nemsRequestId?: string;
  ambulanceStation: string;
  ambulanceUnit: string;
  missionDate: string;
  paramedicName: string;
  driverName: string;
  timeline: MissionTimeline;
  locationType: LocationType;
  locationTown?: string;
  locationAddress?: string;
  patientLastName?: string;
  patientFirstName?: string;
  patientBirthDate?: string;
  patientResidence?: string;
  patientSex?: 'M' | 'F';
  isTraumatic: boolean;
  nonTraumaticConditions?: string[];
  traumaticConditions?: string[];
  traumaAssessment?: TraumaRegion[];
  complaintDescription: string;
  preExistingConditions?: string;
  recentMedications?: string;
  airwayStatus: ABCStatus;
  breathingStatus: ABCStatus;
  circulationStatus: ABCStatus;
  vitalReadings: VitalSignsReading[];
  isPregnant: boolean;
  pregnancyAssessment?: PregnancyAssessment;
  triageColorCode?: TriageColorCode;
  interventions?: string[];
  interventionNotes?: string;
  transportDecision?: TransportDecision;
  destinationFacilityId?: string;
  destinationFacilityName?: string;
  patientCondition?: PatientCondition;
  handoverNotes?: string;
  receivingStaffName?: string;
  receivingSection?: string;
  handoverTime?: string;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

// Create Patient Report Request
export interface CreatePatientReportRequest {
  missionId?: string;
  nemsRequestId?: string;
  ambulanceStation: string;
  ambulanceUnit: string;
  missionDate: string;
  paramedicName: string;
  driverName: string;
  timeline: MissionTimeline;
  locationType: LocationType;
  locationTown?: string;
  locationAddress?: string;
  patientLastName?: string;
  patientFirstName?: string;
  patientBirthDate?: string;
  patientResidence?: string;
  patientSex?: 'M' | 'F';
  isTraumatic: boolean;
  nonTraumaticConditions?: string[];
  traumaticConditions?: string[];
  traumaAssessment?: TraumaRegion[];
  complaintDescription: string;
  preExistingConditions?: string;
  recentMedications?: string;
  airwayStatus: ABCStatus;
  breathingStatus: ABCStatus;
  circulationStatus: ABCStatus;
  vitalReadings: VitalSignsReading[];
  isPregnant: boolean;
  pregnancyAssessment?: PregnancyAssessment;
  triageColorCode?: TriageColorCode;
  interventions?: string[];
  interventionNotes?: string;
  transportDecision?: TransportDecision;
  destinationFacilityId?: string;
  patientCondition?: PatientCondition;
  handoverNotes?: string;
  receivingStaffName?: string;
  receivingSection?: string;
}

// Update Patient Report Request
export interface UpdatePatientReportRequest {
  timeline?: MissionTimeline;
  vitalReadings?: VitalSignsReading[];
  interventions?: string[];
  interventionNotes?: string;
  transportDecision?: TransportDecision;
  destinationFacilityId?: string;
  patientCondition?: PatientCondition;
  handoverNotes?: string;
  receivingStaffName?: string;
  receivingSection?: string;
  handoverTime?: string;
  syncStatus?: SyncStatus;
}

// Query params for listing patient reports
export interface PatientReportListQuery {
  dateFrom?: string;
  dateTo?: string;
  syncStatus?: SyncStatus;
  page?: number;
  limit?: number;
}
