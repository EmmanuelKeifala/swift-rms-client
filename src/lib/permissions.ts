import { UserType } from '@/types';

/**
 * Role-based permissions based on RMS_WEB_SPECIFICATION.md
 * 
 * Roles:
 * - REFERRAL_COORDINATOR: Manage referrals, update readiness, track outcomes (Facility level)
 * - HOSPITAL_DESK: Accept/reject referrals, coordinate admissions (Facility level)
 * - DISTRICT_HEALTH: District analytics, facility monitoring (District level)
 * - NATIONAL_USER: National dashboards, policy oversight (National level)
 * - SYSTEM_ADMIN: User management, system configuration (Full access)
 * - AMBULANCE_DISPATCH: Triage calls, dispatch ambulances (Call Centre)
 * - PHU_STAFF: Basic referral operations (PHU level)
 * - SPECIALIST: Specialist consultations
 */

export const PERMISSIONS = {
  // Dashboard access
  DASHBOARD: ['PHU_STAFF', 'HOSPITAL_DESK', 'REFERRAL_COORDINATOR', 'SPECIALIST', 'AMBULANCE_DISPATCH', 'DISTRICT_HEALTH', 'NATIONAL_USER', 'SYSTEM_ADMIN'] as UserType[],
  
  // I Referral management
  REFERRALS_VIEW: ['PHU_STAFF', 'HOSPITAL_DESK', 'REFERRAL_COORDINATOR', 'SPECIALIST', 'DISTRICT_HEALTH', 'NATIONAL_USER', 'SYSTEM_ADMIN', 'AMBULANCE_DISPATCH'] as UserType[],
  REFERRALS_CREATE: ['PHU_STAFF', 'HOSPITAL_DESK', 'REFERRAL_COORDINATOR', 'AMBULANCE_DISPATCH', 'SYSTEM_ADMIN'] as UserType[],
  REFERRALS_ACCEPT_REJECT: ['HOSPITAL_DESK', 'REFERRAL_COORDINATOR', 'SYSTEM_ADMIN', 'AMBULANCE_DISPATCH'] as UserType[],
  
  // Patient management
  PATIENTS_VIEW: ['PHU_STAFF', 'HOSPITAL_DESK', 'REFERRAL_COORDINATOR', 'SPECIALIST', 'DISTRICT_HEALTH', 'NATIONAL_USER', 'SYSTEM_ADMIN'] as UserType[],
  PATIENTS_CREATE: ['PHU_STAFF', 'HOSPITAL_DESK', 'REFERRAL_COORDINATOR', 'AMBULANCE_DISPATCH', 'SYSTEM_ADMIN'] as UserType[],
  
  // Facilities
  FACILITIES_VIEW: ['PHU_STAFF', 'HOSPITAL_DESK', 'REFERRAL_COORDINATOR', 'SPECIALIST', 'AMBULANCE_DISPATCH', 'DISTRICT_HEALTH', 'NATIONAL_USER', 'SYSTEM_ADMIN'] as UserType[],
  
  // Readiness - Facility level users + Ambulance Dispatch (for multi-facility view)
  READINESS_VIEW: ['HOSPITAL_DESK', 'REFERRAL_COORDINATOR', 'AMBULANCE_DISPATCH', 'DISTRICT_HEALTH', 'NATIONAL_USER', 'SYSTEM_ADMIN'] as UserType[],
  READINESS_UPDATE: ['HOSPITAL_DESK', 'REFERRAL_COORDINATOR', 'SYSTEM_ADMIN'] as UserType[],
  
  // Counter-referrals
  COUNTER_REFERRALS: ['PHU_STAFF', 'HOSPITAL_DESK', 'REFERRAL_COORDINATOR', 'SYSTEM_ADMIN'] as UserType[],
  
  // Triage
  TRIAGE: ['HOSPITAL_DESK', 'REFERRAL_COORDINATOR', 'AMBULANCE_DISPATCH', 'SYSTEM_ADMIN'] as UserType[],
  
  // Call Centre - Emergency coordinators only
  CALL_CENTRE: ['AMBULANCE_DISPATCH', 'SYSTEM_ADMIN'] as UserType[],
  
  // Ambulances
  AMBULANCES: ['AMBULANCE_DISPATCH', 'SYSTEM_ADMIN'] as UserType[],
  
  // Analytics - District and above
  ANALYTICS: ['DISTRICT_HEALTH', 'NATIONAL_USER', 'SYSTEM_ADMIN'] as UserType[],
  
  // Reports - District and above
  REPORTS: ['DISTRICT_HEALTH', 'NATIONAL_USER', 'SYSTEM_ADMIN'] as UserType[],
  
  // Admin - System admin only
  ADMIN_USERS: ['SYSTEM_ADMIN'] as UserType[],
  ADMIN_FACILITIES: ['SYSTEM_ADMIN'] as UserType[],
  ADMIN_SETTINGS: ['SYSTEM_ADMIN'] as UserType[],
  
  // Profile - All users
  PROFILE: ['PHU_STAFF', 'HOSPITAL_DESK', 'REFERRAL_COORDINATOR', 'SPECIALIST', 'AMBULANCE_DISPATCH', 'DISTRICT_HEALTH', 'NATIONAL_USER', 'SYSTEM_ADMIN'] as UserType[],
  SETTINGS: ['PHU_STAFF', 'HOSPITAL_DESK', 'REFERRAL_COORDINATOR', 'SPECIALIST', 'AMBULANCE_DISPATCH', 'DISTRICT_HEALTH', 'NATIONAL_USER', 'SYSTEM_ADMIN'] as UserType[],
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

/**
 * Check if a user has permission for a specific action
 */
export function hasPermission(userType: UserType | undefined, permission: PermissionKey): boolean {
  if (!userType) return false;
  return PERMISSIONS[permission].includes(userType);
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(userType: UserType | undefined, permissions: PermissionKey[]): boolean {
  if (!userType) return false;
  return permissions.some(p => PERMISSIONS[p].includes(userType));
}

/**
 * Get all permissions for a user type
 */
export function getUserPermissions(userType: UserType): PermissionKey[] {
  return (Object.keys(PERMISSIONS) as PermissionKey[]).filter(
    key => PERMISSIONS[key].includes(userType)
  );
}

/**
 * Route to permission mapping
 */
export const ROUTE_PERMISSIONS: Record<string, PermissionKey> = {
  '/': 'DASHBOARD',
  '/referrals': 'REFERRALS_VIEW',
  '/referrals/new': 'REFERRALS_CREATE',
  '/patients': 'PATIENTS_VIEW',
  '/patients/new': 'PATIENTS_CREATE',
  '/facilities': 'FACILITIES_VIEW',
  '/readiness': 'READINESS_VIEW',
  '/readiness/update': 'READINESS_UPDATE',
  '/counter-referrals': 'COUNTER_REFERRALS',
  '/triage': 'TRIAGE',
  '/call-centre': 'CALL_CENTRE',
  '/ambulances': 'AMBULANCES',
  '/analytics': 'ANALYTICS',
  '/reports': 'REPORTS',
  '/admin/users': 'ADMIN_USERS',
  '/admin/facilities': 'ADMIN_FACILITIES',
  '/admin/settings': 'ADMIN_SETTINGS',
  '/profile': 'PROFILE',
  '/settings': 'SETTINGS',
};

/**
 * Check if a user can access a route
 */
export function canAccessRoute(userType: UserType | undefined, pathname: string): boolean {
  if (!userType) return false;
  
  // Find matching route permission
  const route = Object.keys(ROUTE_PERMISSIONS).find(r => {
    if (r === pathname) return true;
    // Handle dynamic routes like /referrals/[id]
    if (pathname.startsWith(r + '/')) return true;
    return false;
  });
  
  if (!route) {
    // If route not in map, default to allowing access (for catch-all routes)
    return true;
  }
  
  const permission = ROUTE_PERMISSIONS[route];
  return hasPermission(userType, permission);
}
