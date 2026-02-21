'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { referralService } from '@/lib/api';
import { Referral, ClinicianReviewRequest, ArrivalCondition } from '@/types';
import { 
  Stethoscope,
  Clock,
  CheckCircle2,
  X,
  User,
  Building2,
  AlertTriangle,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';

function ColourCodeBadge({ code }: { code?: string }) {
  if (!code) return <span style={{ color: 'var(--text-muted)' }}>-</span>;
  
  const getStyles = (c: string) => {
    switch (c) {
      case 'RED': return { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
      case 'YELLOW': return { bg: 'rgba(234, 179, 8, 0.15)', color: '#fbbf24', border: 'rgba(234, 179, 8, 0.3)' };
      case 'GREEN': return { bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' };
      default: return { bg: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: 'var(--border-subtle)' };
    }
  };
  
  const styles = getStyles(code);
  
  return (
    <span style={{ 
      padding: '4px 10px',
      borderRadius: 'var(--radius-full)',
      fontSize: '11px',
      fontWeight: 600,
      backgroundColor: styles.bg,
      color: styles.color,
      border: `1px solid ${styles.border}`
    }}>
      {code}
    </span>
  );
}

function TimeSinceArrival({ arrivedAt }: { arrivedAt?: string }) {
  if (!arrivedAt) return <span style={{ color: 'var(--text-muted)' }}>-</span>;
  
  const arrived = new Date(arrivedAt);
  const now = new Date();
  const diffMs = now.getTime() - arrived.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  
  const isUrgent = diffHours > 2;
  
  return (
    <span className="flex items-center gap-1" style={{ 
      fontSize: '12px',
      color: isUrgent ? 'var(--danger)' : 'var(--text-secondary)'
    }}>
      <Clock size={12} />
      {diffHours > 0 ? `${diffHours}h ${diffMins % 60}m ago` : `${diffMins}m ago`}
    </span>
  );
}

interface ReviewModalProps {
  referral: Referral;
  onClose: () => void;
  onSubmit: (data: ClinicianReviewRequest) => void;
  isLoading: boolean;
}

function ReviewModal({ referral, onClose, onSubmit, isLoading }: ReviewModalProps) {
  const [validatedColourCode, setValidatedColourCode] = useState<'RED' | 'YELLOW' | 'GREEN'>(
    (referral.colourCode as 'RED' | 'YELLOW' | 'GREEN') || 'GREEN'
  );
  const [arrivalCondition, setArrivalCondition] = useState<ArrivalCondition>('SAME');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      validatedColourCode,
      arrivalCondition,
      arrivalConditionNotes: notes,
    });
  };

  const colorStyles = {
    RED: { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.5)', text: '#f87171' },
    YELLOW: { bg: 'rgba(234, 179, 8, 0.2)', border: 'rgba(234, 179, 8, 0.5)', text: '#fbbf24' },
    GREEN: { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgba(34, 197, 94, 0.5)', text: '#4ade80' },
  };

  const conditionStyles = {
    IMPROVED: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)' },
    SAME: { bg: 'var(--bg-overlay)', border: 'var(--border-subtle)' },
    DETERIORATED: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' },
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--space-4)'
      }}
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          maxWidth: 520,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--space-5)',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div className="flex items-center gap-3">
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-lg)',
              background: 'var(--accent-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Stethoscope size={20} style={{ color: 'var(--accent-light)' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Clinician Review
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-tertiary)' }}>
                {referral.referralCode}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'var(--glass-bg)',
              color: 'var(--text-tertiary)',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: 'var(--space-5)' }}>
            {/* Patient Info Card */}
            <div style={{ 
              padding: 'var(--space-4)',
              marginBottom: 'var(--space-5)',
              background: 'var(--bg-overlay)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <div className="flex items-center gap-2 mb-3">
                <User size={16} style={{ color: 'var(--text-tertiary)' }} />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {referral.patient?.firstName} {referral.patient?.lastName}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <Building2 size={14} style={{ color: 'var(--text-tertiary)' }} />
                From: {referral.sendingFacility?.name}
              </div>
              <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  Chief Complaint
                </div>
                <div style={{ color: 'var(--text-primary)' }}>{referral.chiefComplaint}</div>
              </div>
              {referral.dangerSigns && referral.dangerSigns.length > 0 && (
                <div style={{ 
                  marginTop: 'var(--space-3)',
                  padding: 'var(--space-2) var(--space-3)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--danger)'
                }}>
                  <AlertTriangle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  <span style={{ fontSize: '13px' }}>Danger Signs: {referral.dangerSigns.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Validate Colour Code */}
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '13px', 
                fontWeight: 500, 
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-2)' 
              }}>
                Validate Triage Colour Code
              </label>
              <div className="flex gap-2">
                {(['RED', 'YELLOW', 'GREEN'] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setValidatedColourCode(code)}
                    style={{ 
                      flex: 1,
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${validatedColourCode === code ? colorStyles[code].border : 'var(--border-subtle)'}`,
                      background: validatedColourCode === code ? colorStyles[code].bg : 'var(--bg-overlay)',
                      color: validatedColourCode === code ? colorStyles[code].text : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {code}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>
                Original: <ColourCodeBadge code={referral.colourCode} />
              </p>
            </div>

            {/* Arrival Condition */}
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '13px', 
                fontWeight: 500, 
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-2)' 
              }}>
                Patient Condition on Arrival
              </label>
              <div className="flex gap-2">
                {(['IMPROVED', 'SAME', 'DETERIORATED'] as const).map((condition) => (
                  <button
                    key={condition}
                    type="button"
                    onClick={() => setArrivalCondition(condition)}
                    style={{ 
                      flex: 1,
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${arrivalCondition === condition ? (condition === 'DETERIORATED' ? 'rgba(239, 68, 68, 0.3)' : condition === 'IMPROVED' ? 'rgba(34, 197, 94, 0.3)' : 'var(--accent)') : 'var(--border-subtle)'}`,
                      background: arrivalCondition === condition ? conditionStyles[condition].bg : 'var(--bg-overlay)',
                      color: arrivalCondition === condition ? (condition === 'DETERIORATED' ? '#f87171' : condition === 'IMPROVED' ? '#4ade80' : 'var(--text-primary)') : 'var(--text-secondary)',
                      fontWeight: 500,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {condition === 'IMPROVED' && <CheckCircle2 size={14} />}
                    {condition === 'DETERIORATED' && <AlertTriangle size={14} />}
                    {condition.charAt(0) + condition.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '13px', 
                fontWeight: 500, 
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-2)' 
              }}>
                Notes (Optional)
              </label>
              <textarea
                className="form-input"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any clinical observations..."
                style={{ resize: 'vertical', width: '100%' }}
              />
            </div>
          </div>

          {/* Footer */}
          <div style={{ 
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-3)',
            padding: 'var(--space-4) var(--space-5)',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-elevated)'
          }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Complete Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ClinicianWorkflowPage() {
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const queryClient = useQueryClient();

  // Fetch referrals with ARRIVED status (awaiting clinician review)
  const { data, isLoading, error } = useQuery({
    queryKey: ['referrals', 'awaiting-review'],
    queryFn: () => referralService.list({ status: 'ARRIVED', limit: 50 }),
    refetchInterval: 30000,
  });

  const allReferrals = data?.data || [];

  // Mutation for clinician review
  const reviewMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ClinicianReviewRequest }) => 
      referralService.clinicianReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      setSelectedReferral(null);
    },
  });

  const handleReview = (data: ClinicianReviewRequest) => {
    if (selectedReferral) {
      reviewMutation.mutate({ id: selectedReferral.id, data });
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const redCount = allReferrals.filter((r: Referral) => r.colourCode === 'RED').length;
    const yellowCount = allReferrals.filter((r: Referral) => r.colourCode === 'YELLOW').length;
    const greenCount = allReferrals.filter((r: Referral) => r.colourCode === 'GREEN').length;
    const criticalCount = allReferrals.filter((r: Referral) => r.priority === 'CRITICAL').length;
    const highCount = allReferrals.filter((r: Referral) => r.priority === 'HIGH').length;
    
    // Calculate average wait time
    const now = new Date();
    const avgWaitMinutes = allReferrals.length > 0
      ? Math.floor(allReferrals.reduce((acc: number, r: Referral) => {
          if (!r.actualArrival) return acc;
          return acc + (now.getTime() - new Date(r.actualArrival).getTime()) / 60000;
        }, 0) / allReferrals.length)
      : 0;
    
    // Patients waiting > 2 hours
    const longWaitCount = allReferrals.filter((r: Referral) => {
      if (!r.actualArrival) return false;
      const diffHours = (now.getTime() - new Date(r.actualArrival).getTime()) / 3600000;
      return diffHours > 2;
    }).length;

    return {
      total: allReferrals.length,
      red: redCount,
      yellow: yellowCount,
      green: greenCount,
      critical: criticalCount,
      high: highCount,
      avgWaitMinutes,
      longWaitCount,
      redPercentage: allReferrals.length > 0 ? Math.round((redCount / allReferrals.length) * 100) : 0,
    };
  }, [allReferrals]);

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <AlertTriangle size={32} style={{ color: 'var(--danger)', margin: '0 auto var(--space-3)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Failed to load clinician workflow data</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--space-6)' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title">Clinician Workflow</h1>
          <p className="page-subtitle">
            Overview of patients awaiting clinical review
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Awaiting Review
          </div>
        </div>
      </div>

      {/* Priority Stats - First Row */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 'var(--space-4)' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #f87171' }}>
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
              <AlertTriangle size={20} style={{ color: '#f87171' }} />
            </div>
          </div>
          <div className="stat-label">RED Priority</div>
          <div className="stat-value" style={{ color: '#f87171' }}>{stats.red}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {stats.redPercentage}% of total
          </div>
        </div>
        
        <div className="stat-card" style={{ borderLeft: '4px solid #fbbf24' }}>
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(234, 179, 8, 0.15)' }}>
              <Clock size={20} style={{ color: '#fbbf24' }} />
            </div>
          </div>
          <div className="stat-label">YELLOW Priority</div>
          <div className="stat-value" style={{ color: '#fbbf24' }}>{stats.yellow}</div>
        </div>
        
        <div className="stat-card" style={{ borderLeft: '4px solid #4ade80' }}>
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
              <CheckCircle2 size={20} style={{ color: '#4ade80' }} />
            </div>
          </div>
          <div className="stat-label">GREEN Priority</div>
          <div className="stat-value" style={{ color: '#4ade80' }}>{stats.green}</div>
        </div>
        
        <div className="stat-card" style={{ borderLeft: '4px solid var(--accent)' }}>
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'var(--accent-subtle)' }}>
              <Activity size={20} style={{ color: 'var(--accent-light)' }} />
            </div>
          </div>
          <div className="stat-label">Critical Priority</div>
          <div className="stat-value" style={{ color: 'var(--accent-light)' }}>{stats.critical}</div>
        </div>
      </div>

      {/* Additional Stats - Second Row */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
              <TrendingUp size={20} style={{ color: '#f87171' }} />
            </div>
          </div>
          <div className="stat-label">High Priority</div>
          <div className="stat-value">{stats.high}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'var(--bg-overlay)' }}>
              <Clock size={20} style={{ color: 'var(--text-secondary)' }} />
            </div>
          </div>
          <div className="stat-label">Avg. Wait Time</div>
          <div className="stat-value">
            {stats.avgWaitMinutes >= 60 
              ? `${Math.floor(stats.avgWaitMinutes / 60)}h ${stats.avgWaitMinutes % 60}m`
              : `${stats.avgWaitMinutes}m`
            }
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
              <TrendingDown size={20} style={{ color: '#f87171' }} />
            </div>
          </div>
          <div className="stat-label">Waiting &gt; 2 Hours</div>
          <div className="stat-value" style={{ color: stats.longWaitCount > 0 ? '#f87171' : 'inherit' }}>
            {stats.longWaitCount}
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'var(--accent-subtle)' }}>
              <Calendar size={20} style={{ color: 'var(--accent-light)' }} />
            </div>
          </div>
          <div className="stat-label">Today's Arrivals</div>
          <div className="stat-value">
            {allReferrals.filter((r: Referral) => {
              if (!r.actualArrival) return false;
              const arrival = new Date(r.actualArrival);
              const today = new Date();
              return arrival.toDateString() === today.toDateString();
            }).length}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {selectedReferral && (
        <ReviewModal
          referral={selectedReferral}
          onClose={() => setSelectedReferral(null)}
          onSubmit={handleReview}
          isLoading={reviewMutation.isPending}
        />
      )}
    </div>
  );
}
