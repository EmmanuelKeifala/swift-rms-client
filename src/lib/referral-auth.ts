import { Referral } from '@/types/referral';
import { User } from '@/types/user';
import type { UserResponse } from '@/types/auth';

/**
 * Determines if the current user can modify (accept/reject/mark arrived) a referral.
 * 
 * Authorization rules:
 * - SYSTEM_ADMIN: can modify any referral
 * - AMBULANCE_DISPATCH (NEMS users): can modify any referral
 * - Users from the receiving facility: can modify incoming referrals
 * - Users from the sending facility: CANNOT modify their own referrals
 * 
 * @param user - The current authenticated user
 * @param referral - The referral to check permissions for
 * @returns true if the user can modify the referral, false otherwise
 */
export function canModifyReferral(user: User | UserResponse | null, referral: Referral): boolean {
  if (!user) return false;
  
  // System admins can do anything
  if (user.userType === 'SYSTEM_ADMIN') {
    return true;
  }
  
  // NEMS users (ambulance dispatch) can modify any referral
  if (user.userType === 'AMBULANCE_DISPATCH') {
    return true;
  }
  
  // Users from receiving facility can modify incoming referrals
  if (user.facility?.id && referral.receivingFacility?.id) {
    return user.facility.id === referral.receivingFacility.id;
  }
  
  return false;
}

/**
 * Determines if the current user can create referrals.
 * Any authenticated user with a facility can create referrals.
 * 
 * @param user - The current authenticated user
 * @returns true if the user can create referrals, false otherwise
 */
export function canCreateReferral(user: User | null): boolean {
  if (!user) return false;
  return !!user.facility;
}
