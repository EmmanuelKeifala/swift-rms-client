'use client';

import { Circle } from 'lucide-react';

type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface PriorityBadgeProps {
  priority: string;
  variant?: 'dot' | 'badge';
  size?: 'sm' | 'md';
}

const priorityConfig: Record<Priority, { color: string; bg: string; border: string; label: string }> = {
  CRITICAL: { 
    color: 'var(--danger)', 
    bg: 'var(--danger-subtle)',
    border: 'rgba(239, 68, 68, 0.2)',
    label: 'Critical'
  },
  HIGH: { 
    color: 'var(--warning)', 
    bg: 'var(--warning-subtle)',
    border: 'rgba(245, 158, 11, 0.2)',
    label: 'High'
  },
  MEDIUM: { 
    color: 'var(--info)', 
    bg: 'var(--info-subtle)',
    border: 'rgba(59, 130, 246, 0.2)',
    label: 'Medium'
  },
  LOW: { 
    color: 'var(--success)', 
    bg: 'var(--success-subtle)',
    border: 'rgba(16, 185, 129, 0.2)',
    label: 'Low'
  },
};

const defaultConfig = { 
  color: 'var(--text-secondary)', 
  bg: 'var(--glass-bg)', 
  border: 'var(--border-default)',
  label: 'Unknown'
};

/**
 * PriorityBadge - Dark theme priority indicator
 */
export function PriorityBadge({ 
  priority, 
  variant = 'badge',
  size = 'md'
}: PriorityBadgeProps) {
  const config = priorityConfig[priority as Priority] || { ...defaultConfig, label: priority };
  const isCritical = priority === 'CRITICAL';
  
  const dotSize = size === 'sm' ? 5 : 6;
  const fontSize = size === 'sm' ? '10px' : '11px';
  const padding = variant === 'badge' 
    ? size === 'sm' ? '3px 8px' : '4px 10px'
    : size === 'sm' ? '3px 6px' : '4px 8px';
  const showLabel = variant === 'badge';
  
  return (
    <span 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '5px',
        padding,
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: 'var(--radius-full)',
        fontSize,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
      }}
      aria-label={`Priority: ${config.label}`}
    >
      <Circle 
        size={dotSize} 
        fill={config.color} 
        color={config.color}
        style={isCritical ? {
          animation: 'pulse 2s ease-in-out infinite',
        } : undefined}
        aria-hidden="true"
      />
      {showLabel && (
        <span style={{ color: config.color }}>{config.label}</span>
      )}
    </span>
  );
}
