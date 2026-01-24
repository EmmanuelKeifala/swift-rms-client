'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { referralService } from '@/lib/api';
import { Referral, ClinicianReviewRequest, ArrivalCondition } from '@/types';
import { DataTable } from '@/components/ui';
import { 
  Stethoscope,
  Circle, 
  Clock,
  CheckCircle2,
  X,
  User,
  Building2,
  AlertTriangle
} from 'lucide-react';

function PriorityIndicator({ priority }: { priority: string }) {
  const getColor = (p: string) => {
    switch (p) {
      case 'CRITICAL': return 'var(--priority-critical)';
      case 'HIGH': return 'var(--priority-high)';
      case 'MEDIUM': return 'var(--priority-medium)';
      case 'LOW': return 'var(--priority-low)';
      default: return 'var(--muted)';
    }
  };
  
  return (
    <span className="flex items-center gap-2">
      <Circle size={8} fill={getColor(priority)} color={getColor(priority)} />
      <span>{priority}</span>
    </span>
  );
}

function ColourCodeBadge({ code }: { code?: string }) {
  if (!code) return <span className="badge">-</span>;
  
  const bgColor = code === 'RED' ? 'var(--error)' : 
                   code === 'YELLOW' ? 'var(--warning)' : 'var(--success)';
  
  return (
    <span 
      className="badge"
      style={{ 
        backgroundColor: bgColor, 
        color: code === 'YELLOW' ? 'var(--foreground)' : 'white' 
      }}
    >
      {code}
    </span>
  );
}

function TimeSinceArrival({ arrivedAt }: { arrivedAt?: string }) {
  if (!arrivedAt) return <span>-</span>;
  
  const arrived = new Date(arrivedAt);
  const now = new Date();
  const diffMs = now.getTime() - arrived.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  
  if (diffHours > 0) {
    return (
      <span className="flex items-center gap-1" style={{ color: diffHours > 2 ? 'var(--error)' : 'var(--muted)' }}>
        <Clock size={14} />
        {diffHours}h {diffMins % 60}m ago
      </span>
    );
  }
  
  return (
    <span className="flex items-center gap-1" style={{ color: 'var(--muted)' }}>
      <Clock size={14} />
      {diffMins}m ago
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 500, width: '100%' }}
      >
        <div className="modal-header">
          <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 600 }}>
            <Stethoscope size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Clinician Review
          </h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: 'var(--space-4)' }}>
            {/* Patient Info */}
            <div className="card" style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-4)', background: 'var(--card-muted)' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-2)' }}>
                <User size={16} />
                <strong>
                  {referral.patient?.firstName} {referral.patient?.lastName}
                </strong>
              </div>
              <div className="flex items-center gap-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                <Building2 size={14} />
                From: {referral.sendingFacility?.name}
              </div>
              <div style={{ marginTop: 'var(--space-2)' }}>
                <strong>Chief Complaint:</strong> {referral.chiefComplaint}
              </div>
              {referral.dangerSigns && referral.dangerSigns.length > 0 && (
                <div style={{ marginTop: 'var(--space-2)', color: 'var(--error)' }}>
                  <AlertTriangle size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  Danger Signs: {referral.dangerSigns.join(', ')}
                </div>
              )}
            </div>

            {/* Validate Colour Code */}
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">Validate Triage Colour Code</label>
              <div className="flex gap-2">
                {(['RED', 'YELLOW', 'GREEN'] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    className={`btn ${validatedColourCode === code ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ 
                      flex: 1,
                      backgroundColor: validatedColourCode === code ? 
                        (code === 'RED' ? 'var(--error)' : code === 'YELLOW' ? 'var(--warning)' : 'var(--success)') :
                        undefined
                    }}
                    onClick={() => setValidatedColourCode(code)}
                  >
                    {code}
                  </button>
                ))}
              </div>
              <p className="form-hint">
                Original colour: <ColourCodeBadge code={referral.colourCode} />
              </p>
            </div>

            {/* Arrival Condition */}
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">Patient Condition on Arrival</label>
              <div className="flex gap-2">
                {(['IMPROVED', 'SAME', 'DETERIORATED'] as const).map((condition) => (
                  <button
                    key={condition}
                    type="button"
                    className={`btn ${arrivalCondition === condition ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                    onClick={() => setArrivalCondition(condition)}
                  >
                    {condition === 'IMPROVED' && <CheckCircle2 size={14} style={{ marginRight: 4 }} />}
                    {condition === 'DETERIORATED' && <AlertTriangle size={14} style={{ marginRight: 4 }} />}
                    {condition.charAt(0) + condition.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Notes (Optional)</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any clinical observations..."
              />
            </div>
          </div>

          <div className="modal-footer">
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
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const referrals = data?.data || [];

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

  // Define columns
  const columnHelper = createColumnHelper<Referral>();
  
  const columns = useMemo<ColumnDef<Referral, any>[]>(() => [
    columnHelper.accessor('referralCode', {
      header: 'Code',
      cell: info => (
        <Link href={`/referrals/${info.row.original.id}`} className="link font-medium">
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor('priority', {
      header: 'Priority',
      cell: info => <PriorityIndicator priority={info.getValue()} />,
    }),
    columnHelper.accessor('colourCode', {
      header: 'Colour',
      cell: info => <ColourCodeBadge code={info.getValue()} />,
    }),
    columnHelper.accessor(row => `${row.patient?.firstName || ''} ${row.patient?.lastName || ''}`.trim(), {
      id: 'patient',
      header: 'Patient',
    }),
    columnHelper.accessor('chiefComplaint', {
      header: 'Chief Complaint',
      cell: info => (
        <span style={{ maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('sendingFacility.name', {
      header: 'From',
      cell: info => (
        <span style={{ color: 'var(--muted)', maxWidth: 150, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('actualArrival', {
      header: 'Arrived',
      cell: info => <TimeSinceArrival arrivedAt={info.getValue()} />,
    }),
    columnHelper.display({
      id: 'actions',
      cell: info => (
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => setSelectedReferral(info.row.original)}
        >
          <Stethoscope size={14} />
          Review
        </button>
      ),
    }),
  ], []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clinician Workflow</h1>
          <p className="page-subtitle">
            Review and validate arrived patients ({referrals.length} awaiting review)
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--error)' }}>
            {referrals.filter(r => r.colourCode === 'RED').length}
          </div>
          <div className="stat-label">RED Priority</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--warning)' }}>
            {referrals.filter(r => r.colourCode === 'YELLOW').length}
          </div>
          <div className="stat-label">YELLOW Priority</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            {referrals.filter(r => r.colourCode === 'GREEN').length}
          </div>
          <div className="stat-label">GREEN Priority</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{referrals.length}</div>
          <div className="stat-label">Total Awaiting</div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : error ? (
        <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--error)' }}>
          Failed to load referrals awaiting review
        </div>
      ) : referrals.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <CheckCircle2 size={48} style={{ margin: '0 auto var(--space-4)', color: 'var(--success)' }} />
          <h3 style={{ margin: 0 }}>All caught up!</h3>
          <p style={{ color: 'var(--muted)', margin: 'var(--space-2) 0 0' }}>
            No patients are currently awaiting clinician review.
          </p>
        </div>
      ) : (
        <DataTable 
          data={referrals} 
          columns={columns}
          emptyMessage="No patients awaiting review"
        />
      )}

      {/* Review Modal */}
      {selectedReferral && (
        <ReviewModal
          referral={selectedReferral}
          onClose={() => setSelectedReferral(null)}
          onSubmit={handleReview}
          isLoading={reviewMutation.isPending}
        />
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--space-4);
        }
        .modal-content {
          background: var(--card);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-4);
          border-bottom: 1px solid var(--border);
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-2);
          padding: var(--space-4);
          border-top: 1px solid var(--border);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--space-4);
        }
        .stat-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: var(--space-4);
          text-align: center;
        }
        .stat-value {
          font-size: var(--text-2xl);
          font-weight: 700;
        }
        .stat-label {
          font-size: var(--text-sm);
          color: var(--muted);
          margin-top: var(--space-1);
        }
        .form-group {
          margin-bottom: var(--space-4);
        }
        .form-label {
          display: block;
          font-weight: 500;
          margin-bottom: var(--space-2);
        }
        .form-hint {
          font-size: var(--text-sm);
          color: var(--muted);
          margin-top: var(--space-1);
        }
        .form-textarea {
          width: 100%;
          padding: var(--space-2) var(--space-3);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: var(--background);
          resize: vertical;
        }
      `}</style>
    </>
  );
}
