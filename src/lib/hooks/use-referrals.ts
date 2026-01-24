import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { referralService } from '@/lib/api';
import { 
  Referral, 
  CreateReferralRequest, 
  ReferralListQuery,
  ClinicianReviewRequest,
} from '@/types';

// Query keys for cache management
export const referralKeys = {
  all: ['referrals'] as const,
  lists: () => [...referralKeys.all, 'list'] as const,
  list: (filters: ReferralListQuery) => [...referralKeys.lists(), filters] as const,
  details: () => [...referralKeys.all, 'detail'] as const,
  detail: (id: string) => [...referralKeys.details(), id] as const,
  pending: () => [...referralKeys.all, 'pending'] as const,
  incoming: (filters?: ReferralListQuery) => [...referralKeys.all, 'incoming', filters] as const,
  outgoing: (filters?: ReferralListQuery) => [...referralKeys.all, 'outgoing', filters] as const,
  timeline: (id: string) => [...referralKeys.all, 'timeline', id] as const,
  byPatient: (patientId: string) => [...referralKeys.all, 'patient', patientId] as const,
};

// List referrals with pagination and filters
export function useReferrals(query?: ReferralListQuery) {
  return useQuery({
    queryKey: referralKeys.list(query || {}),
    queryFn: () => referralService.list(query),
  });
}

// Get pending referrals (commonly used on dashboard)
export function usePendingReferrals() {
  return useQuery({
    queryKey: referralKeys.pending(),
    queryFn: () => referralService.listPending(),
    staleTime: 30 * 1000, // 30 seconds - pending list changes frequently
  });
}

// Get incoming referrals
export function useIncomingReferrals(query?: ReferralListQuery) {
  return useQuery({
    queryKey: referralKeys.incoming(query),
    queryFn: () => referralService.listIncoming(query),
  });
}

// Get outgoing referrals
export function useOutgoingReferrals(query?: ReferralListQuery) {
  return useQuery({
    queryKey: referralKeys.outgoing(query),
    queryFn: () => referralService.listOutgoing(query),
  });
}

// Get single referral by ID
export function useReferral(id: string) {
  return useQuery({
    queryKey: referralKeys.detail(id),
    queryFn: () => referralService.get(id),
    enabled: !!id,
  });
}

// Get referral timeline
export function useReferralTimeline(id: string) {
  return useQuery({
    queryKey: referralKeys.timeline(id),
    queryFn: () => referralService.getTimeline(id),
    enabled: !!id,
  });
}

// Get referrals by patient
export function usePatientReferrals(patientId: string) {
  return useQuery({
    queryKey: referralKeys.byPatient(patientId),
    queryFn: () => referralService.listByPatient(patientId),
    enabled: !!patientId,
  });
}

// Create referral mutation
export function useCreateReferral() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateReferralRequest) => referralService.create(data),
    onSuccess: () => {
      // Invalidate all referral lists
      queryClient.invalidateQueries({ queryKey: referralKeys.lists() });
      queryClient.invalidateQueries({ queryKey: referralKeys.pending() });
    },
  });
}

// Accept referral mutation
export function useAcceptReferral() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => referralService.accept(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: referralKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: referralKeys.pending() });
      queryClient.invalidateQueries({ queryKey: referralKeys.lists() });
    },
  });
}

// Reject referral mutation
export function useRejectReferral() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      referralService.reject(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: referralKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: referralKeys.pending() });
      queryClient.invalidateQueries({ queryKey: referralKeys.lists() });
    },
  });
}

// Complete referral mutation
export function useCompleteReferral() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, outcome, notes }: { id: string; outcome: string; notes?: string }) => 
      referralService.complete(id, outcome, notes),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: referralKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: referralKeys.lists() });
    },
  });
}

// Mark arrived mutation
export function useMarkReferralArrived() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => referralService.markArrived(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: referralKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: referralKeys.lists() });
    },
  });
}

// Add note mutation
export function useAddReferralNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => 
      referralService.addNote(id, { notes }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: referralKeys.timeline(id) });
    },
  });
}

// Clinician review mutation
export function useClinicianReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ClinicianReviewRequest }) => 
      referralService.clinicianReview(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: referralKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: referralKeys.timeline(id) });
    },
  });
}
