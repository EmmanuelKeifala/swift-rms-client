'use client';

type ReferralStatus = 
  | 'PENDING' 
  | 'ACCEPTED' 
  | 'IN_TRANSIT' 
  | 'ARRIVED' 
  | 'COMPLETED' 
  | 'REJECTED' 
  | 'CANCELLED';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  // Convert status to CSS class format: IN_TRANSIT -> in-transit
  const className = `badge badge-${status.toLowerCase().replace(/_/g, '-')}`;
  // Convert status to display format: IN_TRANSIT -> IN TRANSIT
  const displayText = status.replace(/_/g, ' ');
  
  return <span className={className}>{displayText}</span>;
}
