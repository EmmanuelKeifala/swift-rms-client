'use client';

import { Circle } from 'lucide-react';

type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface PriorityBadgeProps {
  priority: string;
  variant?: 'dot' | 'pill';
}

const priorityConfig: Record<Priority, { color: string; bg: string; border: string; label: string }> = {
  CRITICAL: { 
    color: 'var(--red-600)', 
    bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(239, 68, 68, 0.06) 100%)',
    border: 'rgba(239, 68, 68, 0.2)',
    label: 'Critical'
  },
  HIGH: { 
    color: 'var(--amber-600)', 
    bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.06) 100%)',
    border: 'rgba(245, 158, 11, 0.2)',
    label: 'High'
  },
  MEDIUM: { 
    color: 'var(--blue-600)', 
    bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.06) 100%)',
    border: 'rgba(59, 130, 246, 0.2)',
    label: 'Medium'
  },
  LOW: { 
    color: 'var(--green-600)', 
    bg: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(34, 197, 94, 0.06) 100%)',
    border: 'rgba(34, 197, 94, 0.2)',
    label: 'Low'
  },
};

const defaultConfig = { 
  color: 'var(--muted)', 
  bg: 'var(--accent)', 
  border: 'var(--border)',
  label: 'Unknown'
};

export function PriorityBadge({ priority, variant = 'pill' }: PriorityBadgeProps) {
  const config = priorityConfig[priority as Priority] || { ...defaultConfig, label: priority };
  
  return (
    <span style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: '6px',
      padding: variant === 'pill' ? '5px 12px' : '4px 10px',
      background: config.bg,
      border: `1px solid ${config.border}`,
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.02em',
    }}>
      <Circle size={6} fill={config.color} color={config.color} />
      <span style={{ color: config.color }}>{config.label}</span>
    </span>
  );
}
