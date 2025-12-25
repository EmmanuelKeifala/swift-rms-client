'use client';

import { 
  TrendingUp,
  TrendingDown,
  Minus,
  LucideIcon
} from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  trendType, 
  variant = 'default',
  className = ''
}: StatCardProps) {
  const iconClass = variant === 'success' ? 'stat-icon-success' : 
                    variant === 'warning' ? 'stat-icon-warning' :
                    variant === 'error' ? 'stat-icon-error' :
                    variant === 'info' ? 'stat-icon-info' : '';
  
  const cardClass = variant === 'success' ? 'stat-card-success' : 
                    variant === 'warning' ? 'stat-card-warning' :
                    variant === 'error' ? 'stat-card-error' :
                    variant === 'info' ? 'stat-card-info' : '';

  return (
    <div className={`stat-card ${cardClass} ${className}`}>
      <div className="stat-header">
        <div className={`stat-icon ${iconClass}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {trend && (
        <div className="stat-footer">
          <div className={`stat-change ${trendType === 'up' ? 'positive' : trendType === 'down' ? 'negative' : 'neutral'}`}>
            {trendType === 'up' && <TrendingUp size={12} />}
            {trendType === 'down' && <TrendingDown size={12} />}
            {trendType === 'neutral' && <Minus size={12} />}
            <span>{trendType === 'up' ? '+' : trendType === 'down' ? '' : ''}{trend.replace(/[+-]/, '').replace('from last week', '').trim()}</span>
          </div>
          <span className="stat-meta">vs last week</span>
        </div>
      )}
    </div>
  );
}
