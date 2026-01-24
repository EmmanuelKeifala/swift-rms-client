import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CreatePatientReportRequest,
  MissionTimeline,
  VitalSignsReading,
  PregnancyAssessment,
  TraumaRegion,
  LocationType,
  ABCStatus,
  TriageColorCode,
  TransportDecision,
  PatientCondition,
} from '@/types';

// Form steps
export const FORM_STEPS = [
  'Mission & Crew',
  'Timeline',
  'Location',
  'Patient Demographics',
  'Condition Assessment',
  'ABC Assessment',
  'Vital Signs',
  'Pregnancy Assessment',
  'Triage',
  'Interventions',
  'Transport & Handover',
] as const;

export type FormStep = typeof FORM_STEPS[number];

// Default values for form
const defaultTimeline: MissionTimeline = {
  dispatchTime: '',
  enrouteTime: '',
  arrivalAtLocationTime: '',
  departureFromLocationTime: '',
  arrivalAtDestinationTime: '',
  returnToStandbyTime: '',
};

const defaultFormData: CreatePatientReportRequest = {
  ambulanceStation: '',
  ambulanceUnit: '',
  missionDate: new Date().toISOString().split('T')[0],
  paramedicName: '',
  driverName: '',
  timeline: defaultTimeline,
  locationType: 'HOME',
  locationTown: '',
  locationAddress: '',
  patientLastName: '',
  patientFirstName: '',
  patientBirthDate: '',
  patientResidence: '',
  patientSex: undefined,
  isTraumatic: false,
  nonTraumaticConditions: [],
  traumaticConditions: [],
  traumaAssessment: [],
  complaintDescription: '',
  preExistingConditions: '',
  recentMedications: '',
  airwayStatus: 'NORMAL',
  breathingStatus: 'NORMAL',
  circulationStatus: 'NORMAL',
  vitalReadings: [],
  isPregnant: false,
  pregnancyAssessment: undefined,
  triageColorCode: undefined,
  interventions: [],
  interventionNotes: '',
  transportDecision: undefined,
  destinationFacilityId: '',
  patientCondition: undefined,
  handoverNotes: '',
  receivingStaffName: '',
  receivingSection: '',
};

interface PatientReportFormState {
  // Current step
  currentStep: number;
  
  // Form data
  formData: CreatePatientReportRequest;
  
  // Mission context
  nemsRequestId: string | null;
  missionId: string | null;
  
  // Draft status
  isDirty: boolean;
  lastSavedAt: Date | null;
  
  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // Form data updates
  updateFormData: <K extends keyof CreatePatientReportRequest>(
    field: K,
    value: CreatePatientReportRequest[K]
  ) => void;
  updateTimeline: (timeline: Partial<MissionTimeline>) => void;
  addVitalReading: (reading: VitalSignsReading) => void;
  removeVitalReading: (index: number) => void;
  updatePregnancyAssessment: (assessment: Partial<PregnancyAssessment>) => void;
  toggleCondition: (isTraumatic: boolean, condition: string) => void;
  toggleIntervention: (intervention: string) => void;
  addTraumaRegion: (region: TraumaRegion) => void;
  removeTraumaRegion: (index: number) => void;
  
  // Mission context
  setMissionContext: (nemsRequestId: string, missionId?: string) => void;
  
  // Reset
  resetForm: () => void;
  
  // Get complete request data
  getRequestData: () => CreatePatientReportRequest;
}

export const usePatientReportFormStore = create<PatientReportFormState>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      formData: { ...defaultFormData },
      nemsRequestId: null,
      missionId: null,
      isDirty: false,
      lastSavedAt: null,

      setStep: (step) => set({ currentStep: step }),
      
      nextStep: () => set((state) => ({ 
        currentStep: Math.min(state.currentStep + 1, FORM_STEPS.length - 1) 
      })),
      
      prevStep: () => set((state) => ({ 
        currentStep: Math.max(state.currentStep - 1, 0) 
      })),

      updateFormData: (field, value) => set((state) => ({
        formData: { ...state.formData, [field]: value },
        isDirty: true,
      })),

      updateTimeline: (timeline) => set((state) => ({
        formData: {
          ...state.formData,
          timeline: { ...state.formData.timeline, ...timeline },
        },
        isDirty: true,
      })),

      addVitalReading: (reading) => set((state) => ({
        formData: {
          ...state.formData,
          vitalReadings: [...state.formData.vitalReadings, reading],
        },
        isDirty: true,
      })),

      removeVitalReading: (index) => set((state) => ({
        formData: {
          ...state.formData,
          vitalReadings: state.formData.vitalReadings.filter((_, i) => i !== index),
        },
        isDirty: true,
      })),

      updatePregnancyAssessment: (assessment) => set((state) => ({
        formData: {
          ...state.formData,
          pregnancyAssessment: {
            ...state.formData.pregnancyAssessment,
            ...assessment,
          },
        },
        isDirty: true,
      })),

      toggleCondition: (isTraumatic, condition) => set((state) => {
        const field = isTraumatic ? 'traumaticConditions' : 'nonTraumaticConditions';
        const current = state.formData[field] || [];
        const updated = current.includes(condition)
          ? current.filter((c) => c !== condition)
          : [...current, condition];
        return {
          formData: { ...state.formData, [field]: updated },
          isDirty: true,
        };
      }),

      toggleIntervention: (intervention) => set((state) => {
        const current = state.formData.interventions || [];
        const updated = current.includes(intervention)
          ? current.filter((i) => i !== intervention)
          : [...current, intervention];
        return {
          formData: { ...state.formData, interventions: updated },
          isDirty: true,
        };
      }),

      addTraumaRegion: (region) => set((state) => ({
        formData: {
          ...state.formData,
          traumaAssessment: [...(state.formData.traumaAssessment || []), region],
        },
        isDirty: true,
      })),

      removeTraumaRegion: (index) => set((state) => ({
        formData: {
          ...state.formData,
          traumaAssessment: (state.formData.traumaAssessment || []).filter((_, i) => i !== index),
        },
        isDirty: true,
      })),

      setMissionContext: (nemsRequestId, missionId) => set({
        nemsRequestId,
        missionId: missionId || null,
        formData: {
          ...get().formData,
          nemsRequestId,
          missionId: missionId || undefined,
        },
      }),

      resetForm: () => set({
        currentStep: 0,
        formData: { ...defaultFormData },
        nemsRequestId: null,
        missionId: null,
        isDirty: false,
        lastSavedAt: null,
      }),

      getRequestData: () => {
        const state = get();
        return {
          ...state.formData,
          nemsRequestId: state.nemsRequestId || undefined,
          missionId: state.missionId || undefined,
        };
      },
    }),
    {
      name: 'patient-report-form',
      partialize: (state) => ({
        formData: state.formData,
        nemsRequestId: state.nemsRequestId,
        missionId: state.missionId,
        currentStep: state.currentStep,
      }),
    }
  )
);
