'use client';

import { Circle } from 'lucide-react';

type StatusType = 
  | 'pending' 
  | 'accepted' 
  | 'in_transit' 
  | 'arrived' 
  | 'completed' 
  | 'rejected' 
  | 'cancelled';

interface StatusIndicatorProps {
  status: StatusType | string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const statusConfig: Record<string, { color: string; bg: string; border: string; label: string }> = {
  pending: {
    color: 'var(--warning)',
    bg: 'var(--warning-subtle)',
    border: 'rgba(245, 158, 11, 0.2)',
    label: 'Pending',
  },
  accepted: {
    color: 'var(--info)',
    bg: 'var(--info-subtle)',
    border: 'rgba(59, 130, 246, 0.2)',
    label: 'Accepted',
  },
  in_transit: {
    color: 'var(--info)',
    bg: 'var(--info-subtle)',
    border: 'rgba(59, 130, 246, 0.2)',
    label: 'In Transit',
  },
  arrived: {
    color: 'var(--success)',
    bg: 'var(--success-subtle)',
    border: 'rgba(16, 185, 129, 0.2)',
    label: 'Arrived',
  },
  completed: {
    color: 'var(--success)',
    bg: 'var(--success-subtle)',
    border: 'rgba(16, 185, 129, 0.2)',
    label: 'Completed',
  },
  rejected: {
    color: 'var(--danger)',
    bg: 'var(--danger-subtle)',
    border: 'rgba(239, 68, 68, 0.2)',
    label: 'Rejected',
  },
  cancelled: {
    color: 'var(--text-secondary)',
    bg: 'var(--glass-bg)',
    border: 'var(--border-default)',
    label: 'Cancelled',
  },
};

/**
 * StatusIndicator - Dark theme status display
 */
export function StatusIndicator({ 
  status, 
  size = 'md', 
  showLabel = true 
}: StatusIndicatorProps) {
  const normalizedStatus = status.toLowerCase().replace(/ /g, '_');
  const config = statusConfig[normalizedStatus] || {
    color: 'var(--text-secondary)',
    bg: 'var(--glass-bg)',
    border: 'var(--border-default)',
    label: status.replace(/_/g, ' '),
  };

  const dotSize = size === 'sm' ? 6 : 8;
  const fontSize = size === 'sm' ? '11px' : '12px';
  const padding = size === 'sm' ? '3px 8px' : '4px 10px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding,
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: 'var(--radius-full)',
        fontSize,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
      }}
    >
      <Circle 
        size={dotSize} 
        fill={config.color} 
        color={config.color}
        aria-hidden="true"
      />
      {showLabel && (
        <span style={{ color: config.color }}>
          {config.label}
        </span>
      )}
    </span>
  );
}
