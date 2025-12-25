// API services barrel export
export { authService } from './auth';
export { userService } from './users';
export { patientService } from './patients';
export { facilityService } from './facilities';
export { referralService } from './referrals';
export { readinessService } from './readiness';
export { nemsService, callCentreService } from './nems';
export { analyticsService } from './analytics';
export { districtService } from './districts';
export { ambulanceService } from './ambulances';

// Re-export client utilities
export { 
  default as apiClient,
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens
} from './client';
