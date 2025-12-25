'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { referralService } from '@/lib/api';
import { 
  AlertTriangle, 
  Clock, 
  Circle,
  User,
  Building2,
  Activity,
  Heart,
  Thermometer
} from 'lucide-react';

function PriorityBadge({ priority }: { priority: string }) {
  const getColor = (p: string) => {
    switch (p) {
      case 'CRITICAL': return { bg: 'var(--error-light)', text: 'var(--error)' };
      case 'HIGH': return { bg: 'var(--warning-light)', text: 'var(--warning)' };
      case 'MEDIUM': return { bg: 'var(--info-light)', text: 'var(--info)' };
      default: return { bg: 'var(--success-light)', text: 'var(--success)' };
    }
  };
  const colors = getColor(priority);
  return (
    <span style={{ 
      padding: 'var(--space-1) var(--space-2)', 
      background: colors.bg, 
      color: colors.text,
      borderRadius: 'var(--radius-sm)',
      fontSize: 'var(--text-xs)',
      fontWeight: 500
    }}>
      {priority}
    </span>
  );
}

export default function TriagePage() {
  const [filter, setFilter] = useState<'all' | 'critical' | 'high'>('all');

  const { data: pending, isLoading } = useQuery({
    queryKey: ['referrals', 'pending'],
    queryFn: () => referralService.listPending(),
  });

  const filtered = pending?.filter(r => {
    if (filter === 'critical') return r.priority === 'CRITICAL';
    if (filter === 'high') return r.priority === 'HIGH';
    return true;
  }) || [];

  const criticalCount = pending?.filter(r => r.priority === 'CRITICAL').length || 0;
  const highCount = pending?.filter(r => r.priority === 'HIGH').length || 0;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Triage</h1>
          <p className="page-subtitle">Prioritize and assess incoming referrals</p>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div 
          className="stat-card" 
          style={{ cursor: 'pointer', border: filter === 'critical' ? '2px solid var(--error)' : undefined }}
          onClick={() => setFilter(filter === 'critical' ? 'all' : 'critical')}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} style={{ color: 'var(--error)' }} />
            <div className="stat-label">Critical</div>
          </div>
          <div className="stat-value" style={{ color: 'var(--error)' }}>{criticalCount}</div>
          <div className="text-xs text-muted mt-1">Immediate attention</div>
        </div>
        <div 
          className="stat-card" 
          style={{ cursor: 'pointer', border: filter === 'high' ? '2px solid var(--warning)' : undefined }}
          onClick={() => setFilter(filter === 'high' ? 'all' : 'high')}
        >
          <div className="flex items-center gap-2">
            <Clock size={16} style={{ color: 'var(--warning)' }} />
            <div className="stat-label">High Priority</div>
          </div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{highCount}</div>
          <div className="text-xs text-muted mt-1">Urgent response</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <Circle size={16} style={{ color: 'var(--muted)' }} />
            <div className="stat-label">Total Pending</div>
          </div>
          <div className="stat-value">{pending?.length || 0}</div>
          <div className="text-xs text-muted mt-1">All priorities</div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : !filtered.length ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--muted)', padding: 'var(--space-12)' }}>
          <CheckMark />
          <div className="mt-4">No pending referrals requiring triage</div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((referral) => (
            <div key={referral.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <PriorityBadge priority={referral.priority} />
                  <span className="font-semibold">{referral.referralCode}</span>
                  <span className="text-sm text-muted">{referral.referralType}</span>
                </div>
                <span className="text-xs text-muted">
                  {new Date(referral.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="dashboard-grid" style={{ gap: 'var(--space-4)' }}>
                <div className="col-6">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={14} style={{ color: 'var(--muted)' }} />
                    <span className="text-sm font-medium">Patient</span>
                  </div>
                  <div className="text-sm">
                    {referral.patient?.firstName} {referral.patient?.lastName}
                  </div>
                  <div className="text-xs text-muted">
                    {referral.patient?.gender} | {referral.patient?.phone || 'No phone'}
                  </div>
                </div>

                <div className="col-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 size={14} style={{ color: 'var(--muted)' }} />
                    <span className="text-sm font-medium">From</span>
                  </div>
                  <div className="text-sm">{referral.sendingFacility?.name}</div>
                  <div className="text-xs text-muted">{referral.sendingFacility?.type}</div>
                </div>
              </div>

              <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="text-xs text-muted mb-1">Chief Complaint</div>
                <div className="text-sm">{referral.chiefComplaint}</div>
              </div>

              {referral.dangerSigns && referral.dangerSigns.length > 0 && (
                <div className="mt-3 p-3" style={{ background: 'var(--error-light)', borderRadius: 'var(--radius-md)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} style={{ color: 'var(--error)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--error)' }}>Danger Signs</span>
                  </div>
                  <div className="text-xs">{referral.dangerSigns.join(', ')}</div>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <a href={`/referrals/${referral.id}`} className="btn btn-primary">
                  Review & Respond
                </a>
                <button className="btn btn-secondary">Escalate</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function CheckMark() {
  return (
    <div style={{ 
      width: 64, 
      height: 64, 
      margin: '0 auto',
      background: 'var(--success-light)', 
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  );
}
