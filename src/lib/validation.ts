import { z } from 'zod';

// Sierra Leone phone number format: +23276000002 (12 characters)
// Country code: +232
// Network prefix: 2 digits (e.g., 76, 77, 78, 79, 30, 33, etc.)
// Subscriber number: 6 digits

const PHONE_REGEX = /^\+232[0-9]{9}$/;
const PHONE_LENGTH = 12; // +232 (4) + 9 digits

export const phoneSchema = z
  .string()
  .length(PHONE_LENGTH, `Phone number must be exactly ${PHONE_LENGTH} characters (e.g., +23276000002)`)
  .regex(PHONE_REGEX, 'Invalid Sierra Leone phone number format. Use +232XXXXXXXXX');

export const optionalPhoneSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || PHONE_REGEX.test(val),
    'Invalid Sierra Leone phone number format. Use +232XXXXXXXXX'
  );

// Helper to format phone number for display
export function formatPhoneDisplay(phone: string): string {
  if (!phone) return '';
  // Format: +232 76 000 002
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('232')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  return phone;
}

// Helper to normalize phone input
export function normalizePhone(input: string): string {
  // Remove all non-digit characters except +
  let cleaned = input.replace(/[^\d+]/g, '');
  
  // Ensure it starts with +232
  if (cleaned.startsWith('232') && !cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  } else if (cleaned.startsWith('0')) {
    // Convert local format (076...) to international
    cleaned = '+232' + cleaned.slice(1);
  }
  
  return cleaned;
}

// Validate phone synchronously
export function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(phone);
}

export const PHONE_PLACEHOLDER = '+23276000000';
export const PHONE_HINT = 'Format: +232XXXXXXXXX (12 digits)';
