'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Check, 
  AlertCircle,
  User,
  Clock,
  MapPin,
  Heart,
  Activity,
  Baby,
  Stethoscope,
  Truck,
  ClipboardList,
} from 'lucide-react';
import { nemsService } from '@/lib/api/nems';
import { patientReportService } from '@/lib/api/patient-report';
import { 
  usePatientReportFormStore, 
  FORM_STEPS,
} from '@/store/patientReportFormStore';
import {
  NON_TRAUMATIC_CONDITIONS,
  TRAUMATIC_CONDITIONS,
  BODY_REGIONS,
  TRAUMA_FINDINGS,
  INTERVENTIONS,
  VitalSignsReading,
  LocationType,
  ABCStatus,
  TriageColorCode,
  TransportDecision,
  PatientCondition,
} from '@/types';

// Step icons
const STEP_ICONS = [
  User, Clock, MapPin, User, AlertCircle, Heart, Activity, Baby, AlertCircle, Stethoscope, Truck
];

export default function PatientReportPage() {
  const params = useParams();
  const router = useRouter();
  const missionId = params.id as string;
  const queryClient = useQueryClient();

  const {
    currentStep,
    formData,
    setStep,
    nextStep,
    prevStep,
    updateFormData,
    updateTimeline,
    addVitalReading,
    removeVitalReading,
    updatePregnancyAssessment,
    toggleCondition,
    toggleIntervention,
    setMissionContext,
    resetForm,
    getRequestData,
  } = usePatientReportFormStore();

  // Fetch mission details
  const { data: mission, isLoading: missionLoading } = useQuery({
    queryKey: ['nems-mission', missionId],
    queryFn: () => nemsService.getRequest(missionId),
    enabled: !!missionId,
  });

  // Check for existing patient report
  const { data: existingReport, isLoading: reportLoading } = useQuery({
    queryKey: ['patient-report-by-mission', missionId],
    queryFn: () => patientReportService.getByMission(missionId),
    enabled: !!missionId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: patientReportService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-report-by-mission', missionId] });
      queryClient.invalidateQueries({ queryKey: ['nems-mission', missionId] });
      resetForm();
      router.push(`/ambulances/mission/${missionId}`);
    },
  });

  // Set mission context on load
  useEffect(() => {
    if (missionId) {
      setMissionContext(missionId);
    }
  }, [missionId, setMissionContext]);

  // Pre-fill from mission data
  useEffect(() => {
    if (mission && !existingReport) {
      updateFormData('missionDate', new Date().toISOString().split('T')[0]);
      if (mission.ambulance) {
        updateFormData('ambulanceUnit', mission.ambulance.code || '');
        updateFormData('ambulanceStation', mission.ambulance.district || '');
      }
    }
  }, [mission, existingReport, updateFormData]);


  const handleSubmit = () => {
    const data = getRequestData();
    createMutation.mutate(data);
  };

  const isLastStep = currentStep === FORM_STEPS.length - 1;

  if (missionLoading || reportLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (existingReport) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <Check className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-green-800 mb-2">Patient Report Already Submitted</h2>
          <p className="text-green-600 mb-4">
            A patient report has already been submitted for this mission.
          </p>
          <button
            onClick={() => router.push(`/ambulances/mission/${missionId}`)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to Mission
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push(`/ambulances/mission/${missionId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Mission
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Patient Report Form</h1>
        <p className="text-gray-600">Mission: {mission?.id || missionId}</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {FORM_STEPS.map((step, index) => {
            const StepIcon = STEP_ICONS[index];
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            return (
              <button
                key={step}
                onClick={() => setStep(index)}
                className={`flex flex-col items-center min-w-[80px] ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                    isActive
                      ? 'bg-blue-100 border-2 border-blue-600'
                      : isCompleted
                      ? 'bg-green-100 border-2 border-green-600'
                      : 'bg-gray-100 border-2 border-gray-300'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                </div>
                <span className="text-xs text-center hidden sm:block">{step}</span>
              </button>
            );
          })}
        </div>
        <div className="h-2 bg-gray-200 rounded-full mt-2">
          <div
            className="h-2 bg-blue-600 rounded-full transition-all"
            style={{ width: `${((currentStep + 1) / FORM_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {FORM_STEPS[currentStep]}
        </h2>

        {/* Step 1: Mission & Crew */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ambulance Station *
                </label>
                <input
                  type="text"
                  value={formData.ambulanceStation}
                  onChange={(e) => updateFormData('ambulanceStation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Station name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ambulance Unit *
                </label>
                <input
                  type="text"
                  value={formData.ambulanceUnit}
                  onChange={(e) => updateFormData('ambulanceUnit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Unit/Call sign"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mission Date *
                </label>
                <input
                  type="date"
                  value={formData.missionDate}
                  onChange={(e) => updateFormData('missionDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paramedic Name *
                </label>
                <input
                  type="text"
                  value={formData.paramedicName}
                  onChange={(e) => updateFormData('paramedicName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Paramedic name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver Name *
                </label>
                <input
                  type="text"
                  value={formData.driverName}
                  onChange={(e) => updateFormData('driverName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Driver name"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Timeline */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dispatch Time
                </label>
                <input
                  type="time"
                  value={formData.timeline.dispatchTime || ''}
                  onChange={(e) => updateTimeline({ dispatchTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enroute Time
                </label>
                <input
                  type="time"
                  value={formData.timeline.enrouteTime || ''}
                  onChange={(e) => updateTimeline({ enrouteTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arrival at Location
                </label>
                <input
                  type="time"
                  value={formData.timeline.arrivalAtLocationTime || ''}
                  onChange={(e) => updateTimeline({ arrivalAtLocationTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departure from Location
                </label>
                <input
                  type="time"
                  value={formData.timeline.departureFromLocationTime || ''}
                  onChange={(e) => updateTimeline({ departureFromLocationTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arrival at Destination
                </label>
                <input
                  type="time"
                  value={formData.timeline.arrivalAtDestinationTime || ''}
                  onChange={(e) => updateTimeline({ arrivalAtDestinationTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Return to Standby
                </label>
                <input
                  type="time"
                  value={formData.timeline.returnToStandbyTime || ''}
                  onChange={(e) => updateTimeline({ returnToStandbyTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Type *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(['HOME', 'ROAD', 'PUBLIC', 'COMMERCIAL', 'WORKPLACE', 'PHU', 'HOSPITAL'] as LocationType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => updateFormData('locationType', type)}
                    className={`px-4 py-2 rounded-lg border text-sm ${
                      formData.locationType === type
                        ? 'bg-blue-100 border-blue-600 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Town
                </label>
                <input
                  type="text"
                  value={formData.locationTown || ''}
                  onChange={(e) => updateFormData('locationTown', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Town/City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.locationAddress || ''}
                  onChange={(e) => updateFormData('locationAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Full address"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Patient Demographics */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.patientLastName || ''}
                  onChange={(e) => updateFormData('patientLastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.patientFirstName || ''}
                  onChange={(e) => updateFormData('patientFirstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Birth Date
                </label>
                <input
                  type="date"
                  value={formData.patientBirthDate || ''}
                  onChange={(e) => updateFormData('patientBirthDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sex
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => updateFormData('patientSex', 'M')}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      formData.patientSex === 'M'
                        ? 'bg-blue-100 border-blue-600 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    onClick={() => updateFormData('patientSex', 'F')}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      formData.patientSex === 'F'
                        ? 'bg-pink-100 border-pink-600 text-pink-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Residence
              </label>
              <input
                type="text"
                value={formData.patientResidence || ''}
                onChange={(e) => updateFormData('patientResidence', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Patient residence address"
              />
            </div>
          </div>
        )}

        {/* Step 5: Condition Assessment */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition Type *
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => updateFormData('isTraumatic', false)}
                  className={`flex-1 px-4 py-3 rounded-lg border ${
                    !formData.isTraumatic
                      ? 'bg-blue-100 border-blue-600 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Non-Traumatic
                </button>
                <button
                  onClick={() => updateFormData('isTraumatic', true)}
                  className={`flex-1 px-4 py-3 rounded-lg border ${
                    formData.isTraumatic
                      ? 'bg-red-100 border-red-600 text-red-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Traumatic
                </button>
              </div>
            </div>

            {!formData.isTraumatic && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Non-Traumatic Conditions
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {NON_TRAUMATIC_CONDITIONS.map((condition) => (
                    <button
                      key={condition}
                      onClick={() => toggleCondition(false, condition)}
                      className={`px-3 py-2 rounded-lg border text-sm text-left ${
                        formData.nonTraumaticConditions?.includes(condition)
                          ? 'bg-blue-100 border-blue-600 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {condition.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {formData.isTraumatic && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Traumatic Conditions
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {TRAUMATIC_CONDITIONS.map((condition) => (
                    <button
                      key={condition}
                      onClick={() => toggleCondition(true, condition)}
                      className={`px-3 py-2 rounded-lg border text-sm text-left ${
                        formData.traumaticConditions?.includes(condition)
                          ? 'bg-red-100 border-red-600 text-red-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {condition.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description of Complaints *
              </label>
              <textarea
                value={formData.complaintDescription}
                onChange={(e) => updateFormData('complaintDescription', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the patient's complaints"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pre-existing Medical Conditions
                </label>
                <textarea
                  value={formData.preExistingConditions || ''}
                  onChange={(e) => updateFormData('preExistingConditions', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recent Medications
                </label>
                <textarea
                  value={formData.recentMedications || ''}
                  onChange={(e) => updateFormData('recentMedications', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 6: ABC Assessment */}
        {currentStep === 5 && (
          <div className="space-y-6">
            {(['airwayStatus', 'breathingStatus', 'circulationStatus'] as const).map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.replace('Status', '').charAt(0).toUpperCase() + field.replace('Status', '').slice(1)} *
                </label>
                <div className="flex gap-4">
                  {(['NORMAL', 'ABNORMAL'] as ABCStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => updateFormData(field, status)}
                      className={`flex-1 px-4 py-3 rounded-lg border ${
                        formData[field] === status
                          ? status === 'NORMAL'
                            ? 'bg-green-100 border-green-600 text-green-700'
                            : 'bg-red-100 border-red-600 text-red-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 7: Vital Signs */}
        {currentStep === 6 && (
          <VitalSignsStep
            readings={formData.vitalReadings}
            onAdd={addVitalReading}
            onRemove={removeVitalReading}
          />
        )}

        {/* Step 8: Pregnancy Assessment */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Is the patient pregnant?
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => updateFormData('isPregnant', false)}
                  className={`flex-1 px-4 py-3 rounded-lg border ${
                    !formData.isPregnant
                      ? 'bg-gray-100 border-gray-600 text-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  No
                </button>
                <button
                  onClick={() => updateFormData('isPregnant', true)}
                  className={`flex-1 px-4 py-3 rounded-lg border ${
                    formData.isPregnant
                      ? 'bg-pink-100 border-pink-600 text-pink-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Yes
                </button>
              </div>
            </div>

            {formData.isPregnant && (
              <div className="space-y-4 p-4 bg-pink-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gestational Age (weeks)
                    </label>
                    <input
                      type="number"
                      value={formData.pregnancyAssessment?.gestationalAgeWeeks || ''}
                      onChange={(e) => updatePregnancyAssessment({ gestationalAgeWeeks: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      max="45"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Risk Factors / Danger Signs
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'isFirstPregnancy', label: 'First Pregnancy' },
                      { key: 'ageUnder16', label: 'Age < 16' },
                      { key: 'ageOver35', label: 'Age > 35' },
                      { key: 'isTwins', label: 'Twins' },
                      { key: 'hasSpotting', label: 'Spotting' },
                      { key: 'hasLabor', label: 'Labor' },
                      { key: 'hasAbdominalPain', label: 'Abdominal Pain' },
                      { key: 'hasReducedFetalMovement', label: 'Reduced FM' },
                      { key: 'hasFeverOver37_5', label: 'Fever > 37.5' },
                      { key: 'hasBleeding', label: 'Bleeding' },
                      { key: 'noFetalMovement', label: 'No Fetal Movement' },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => updatePregnancyAssessment({ 
                          [key]: !formData.pregnancyAssessment?.[key as keyof typeof formData.pregnancyAssessment] 
                        })}
                        className={`px-3 py-2 rounded-lg border text-sm text-left ${
                          formData.pregnancyAssessment?.[key as keyof typeof formData.pregnancyAssessment]
                            ? 'bg-pink-200 border-pink-600 text-pink-800'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 9: Triage */}
        {currentStep === 8 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Triage Color Code
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {([
                  { code: 'RED' as TriageColorCode, color: 'red', label: 'Immediate' },
                  { code: 'YELLOW' as TriageColorCode, color: 'yellow', label: 'Urgent' },
                  { code: 'GREEN' as TriageColorCode, color: 'green', label: 'Non-Urgent' },
                  { code: 'BLACK' as TriageColorCode, color: 'gray', label: 'Deceased' },
                ]).map(({ code, color, label }) => (
                  <button
                    key={code}
                    onClick={() => updateFormData('triageColorCode', code)}
                    className={`px-4 py-6 rounded-lg border-2 flex flex-col items-center ${
                      formData.triageColorCode === code
                        ? `bg-${color}-100 border-${color}-600`
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                    style={{
                      backgroundColor: formData.triageColorCode === code 
                        ? (color === 'red' ? '#fee2e2' : color === 'yellow' ? '#fef9c3' : color === 'green' ? '#dcfce7' : '#f3f4f6')
                        : undefined,
                      borderColor: formData.triageColorCode === code
                        ? (color === 'red' ? '#dc2626' : color === 'yellow' ? '#ca8a04' : color === 'green' ? '#16a34a' : '#4b5563')
                        : undefined,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full mb-2"
                      style={{
                        backgroundColor: color === 'red' ? '#dc2626' : color === 'yellow' ? '#eab308' : color === 'green' ? '#16a34a' : '#1f2937',
                      }}
                    />
                    <span className="font-medium">{code}</span>
                    <span className="text-xs text-gray-500">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 10: Interventions */}
        {currentStep === 9 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interventions Performed
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {INTERVENTIONS.map((intervention) => (
                  <button
                    key={intervention}
                    onClick={() => toggleIntervention(intervention)}
                    className={`px-3 py-2 rounded-lg border text-sm text-left ${
                      formData.interventions?.includes(intervention)
                        ? 'bg-blue-100 border-blue-600 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {intervention.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intervention Notes
              </label>
              <textarea
                value={formData.interventionNotes || ''}
                onChange={(e) => updateFormData('interventionNotes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional notes about interventions"
              />
            </div>
          </div>
        )}

        {/* Step 11: Transport & Handover */}
        {currentStep === 10 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transport Decision
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {([
                  { value: 'NOT_NECESSARY', label: 'Not Necessary' },
                  { value: 'REFUSED', label: 'Refused' },
                  { value: 'TO_PHU', label: 'To PHU' },
                  { value: 'TO_BEMOC', label: 'To BeMOC' },
                  { value: 'TO_HOSPITAL', label: 'To Hospital' },
                  { value: 'EXPIRED', label: 'Expired' },
                ] as { value: TransportDecision; label: string }[]).map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => updateFormData('transportDecision', value)}
                    className={`px-3 py-2 rounded-lg border text-sm ${
                      formData.transportDecision === value
                        ? 'bg-blue-100 border-blue-600 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Condition at Handover
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {([
                  { value: 'IMPROVED', label: 'Improved', color: 'green' },
                  { value: 'UNCHANGED', label: 'Unchanged', color: 'gray' },
                  { value: 'DETERIORATED', label: 'Deteriorated', color: 'orange' },
                  { value: 'EXPIRED', label: 'Expired', color: 'red' },
                ] as { value: PatientCondition; label: string; color: string }[]).map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => updateFormData('patientCondition', value)}
                    className={`px-3 py-2 rounded-lg border text-sm ${
                      formData.patientCondition === value
                        ? 'bg-blue-100 border-blue-600 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receiving Staff Name
                </label>
                <input
                  type="text"
                  value={formData.receivingStaffName || ''}
                  onChange={(e) => updateFormData('receivingStaffName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receiving Section/Dept
                </label>
                <input
                  type="text"
                  value={formData.receivingSection || ''}
                  onChange={(e) => updateFormData('receivingSection', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Handover Notes
              </label>
              <textarea
                value={formData.handoverNotes || ''}
                onChange={(e) => updateFormData('handoverNotes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional handover notes"
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>

        {isLastStep ? (
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {createMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Submitting...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Submit Report
              </>
            )}
          </button>
        ) : (
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Error display */}
      {createMutation.isError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p>Failed to submit report. Please try again.</p>
        </div>
      )}
    </div>
  );
}

// Vital Signs Step Component
function VitalSignsStep({
  readings,
  onAdd,
  onRemove,
}: {
  readings: VitalSignsReading[];
  onAdd: (reading: VitalSignsReading) => void;
  onRemove: (index: number) => void;
}) {
  const [newReading, setNewReading] = useState<Partial<VitalSignsReading>>({
    time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    avpu: 'A',
  });

  const handleAdd = () => {
    if (newReading.time && newReading.avpu) {
      onAdd(newReading as VitalSignsReading);
      setNewReading({
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        avpu: 'A',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Existing readings */}
      {readings.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Recorded Readings</h3>
          <div className="space-y-2">
            {readings.map((reading, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex gap-4 text-sm">
                  <span className="font-medium">{reading.time}</span>
                  <span>BP: {reading.bloodPressureSystolic}/{reading.bloodPressureDiastolic}</span>
                  <span>HR: {reading.heartRate}</span>
                  <span>RR: {reading.respiratoryRate}</span>
                  <span>T: {reading.temperature}</span>
                  <span>AVPU: {reading.avpu}</span>
                </div>
                <button
                  onClick={() => onRemove(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add new reading */}
      <div className="p-4 border border-gray-200 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Add Vital Signs Reading</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Time</label>
            <input
              type="time"
              value={newReading.time || ''}
              onChange={(e) => setNewReading({ ...newReading, time: e.target.value })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">BP Systolic</label>
            <input
              type="number"
              value={newReading.bloodPressureSystolic || ''}
              onChange={(e) => setNewReading({ ...newReading, bloodPressureSystolic: Number(e.target.value) })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="120"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">BP Diastolic</label>
            <input
              type="number"
              value={newReading.bloodPressureDiastolic || ''}
              onChange={(e) => setNewReading({ ...newReading, bloodPressureDiastolic: Number(e.target.value) })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="80"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Heart Rate</label>
            <input
              type="number"
              value={newReading.heartRate || ''}
              onChange={(e) => setNewReading({ ...newReading, heartRate: Number(e.target.value) })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="80"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Resp Rate</label>
            <input
              type="number"
              value={newReading.respiratoryRate || ''}
              onChange={(e) => setNewReading({ ...newReading, respiratoryRate: Number(e.target.value) })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="16"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Temperature</label>
            <input
              type="number"
              step="0.1"
              value={newReading.temperature || ''}
              onChange={(e) => setNewReading({ ...newReading, temperature: Number(e.target.value) })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="37.0"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs text-gray-500 mb-1">AVPU</label>
          <div className="flex gap-2">
            {(['A', 'V', 'P', 'U'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setNewReading({ ...newReading, avpu: level })}
                className={`flex-1 px-3 py-2 rounded border ${
                  newReading.avpu === level
                    ? 'bg-blue-100 border-blue-600 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {level === 'A' && 'Alert'}
                {level === 'V' && 'Verbal'}
                {level === 'P' && 'Pain'}
                {level === 'U' && 'Unresponsive'}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Reading
        </button>
      </div>
    </div>
  );
}
