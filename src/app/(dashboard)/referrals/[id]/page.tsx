'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { referralService } from '@/lib/api';
import { ReferralStatus } from '@/types';
import { useAuthStore } from '@/store';
import { canModifyReferral } from '@/lib/referral-auth';
import { 
  ArrowLeft, 
  Circle, 
  Check, 
  X, 
  ExternalLink, 
  MapPin, 
  User, 
  Clock, 
  Building2, 
  AlertTriangle, 
  FileText,
  Activity,
  Heart,
  Thermometer
} from 'lucide-react';

function PriorityBadge({ priority }: { priority: string }) {
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
      <span className="text-sm font-medium">{priority}</span>
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge badge-${status.toLowerCase().replace(/_/g, '-')}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export default function ReferralDetailPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Get user for permission checks (must be before conditional returns)
  const user = useAuthStore(state => state.user);

  const { data: referral, isLoading } = useQuery({
    queryKey: ['referral', id],
    queryFn: () => referralService.get(id),
  });

  const { data: timeline } = useQuery({
    queryKey: ['referral', id, 'timeline'],
    queryFn: () => referralService.getTimeline(id),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { status: ReferralStatus; rejectionReason?: string }) =>
      referralService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral', id] });
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
    },
  });

  const handleAccept = () => updateMutation.mutate({ status: 'ACCEPTED' });
  const handleReject = () => {
    if (rejectReason.trim()) {
      updateMutation.mutate({ status: 'REJECTED', rejectionReason: rejectReason });
      setShowRejectModal(false);
      setRejectReason('');
    }
  };
  const handleMarkArrived = () => updateMutation.mutate({ status: 'ARRIVED' });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!referral) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
        <h2>Referral not found</h2>
        <Link href="/referrals" className="btn btn-primary mt-4">
          Back to Referrals
        </Link>
      </div>
    );
  }

  const hasPermission = canModifyReferral(user, referral);
  const canAccept = referral.status === 'PENDING' && hasPermission;
  const canMarkArrived = (referral.status === 'ACCEPTED' || referral.status === 'IN_TRANSIT') && hasPermission;

  return (
    <>
      <div className="mb-4">
        <Link href="/referrals" className="flex items-center gap-1 text-sm text-muted">
          <ArrowLeft size={14} />
          Back to Referrals
        </Link>
      </div>

      <div className="page-header">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="page-title">{referral.referralCode}</h1>
            <StatusBadge status={referral.status} />
          </div>
          <div className="flex items-center gap-4 mt-2">
            <PriorityBadge priority={referral.priority} />
            <span className="text-sm text-muted">
              Created {new Date(referral.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {(canAccept || canMarkArrived) && (
        <div className="card mb-4 flex gap-2" style={{ flexWrap: 'wrap' }}>
          {canAccept && (
            <>
              <button 
                className="btn btn-success"
                onClick={handleAccept}
                disabled={updateMutation.isPending}
              >
                <Check size={16} />
                Accept
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => setShowRejectModal(true)}
                disabled={updateMutation.isPending}
              >
                <X size={16} />
                Reject
              </button>
              <button className="btn btn-secondary">
                <ExternalLink size={16} />
                Redirect
              </button>
            </>
          )}
          {canMarkArrived && (
            <button 
              className="btn btn-primary"
              onClick={handleMarkArrived}
              disabled={updateMutation.isPending}
            >
              <MapPin size={16} />
              Mark Arrived
            </button>
          )}
        </div>
      )}

      <div className="dashboard-grid">
        <div className="col-6">
          <div className="card">
            <h3 className="card-title mb-4">
              <User size={16} />
              Patient
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <div className="text-xs text-muted mb-1">Name</div>
                <div className="font-medium">{referral.patient?.firstName} {referral.patient?.lastName}</div>
              </div>
              <div>
                <div className="text-xs text-muted mb-1">Gender</div>
                <div>{referral.patient?.gender}</div>
              </div>
              <div>
                <div className="text-xs text-muted mb-1">Phone</div>
                <div>{referral.patient?.phone || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-muted mb-1">Type</div>
                <div>{referral.referralType}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6">
          <div className="card">
            <h3 className="card-title mb-4">
              <Building2 size={16} />
              Facilities
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <div className="text-xs text-muted mb-1">From</div>
                <div className="font-medium">{referral.sendingFacility?.name}</div>
                <div className="text-xs text-muted">{referral.sendingFacility?.type}</div>
              </div>
              <div>
                <div className="text-xs text-muted mb-1">To</div>
                <div className="font-medium">{referral.receivingFacility?.name}</div>
                <div className="text-xs text-muted">{referral.receivingFacility?.type}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6">
          <div className="card">
            <h3 className="card-title mb-4">
              <Clock size={16} />
              Timeline
            </h3>
            <div className="flex flex-col gap-3">
              {timeline?.length ? timeline.map((entry, i) => (
                <div key={i} className="flex gap-3">
                  <div style={{ 
                    width: 8, 
                    height: 8, 
                    background: i === 0 ? 'var(--foreground)' : 'var(--border)',
                    borderRadius: '50%',
                    marginTop: 6,
                    flexShrink: 0
                  }} />
                  <div>
                    <div className="font-medium text-sm">{entry.action}</div>
                    <div className="text-xs text-muted">
                      {new Date(entry.timestamp).toLocaleString()}
                      {entry.userName && ` · ${entry.userName}`}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="flex items-center gap-2">
                  <Circle size={8} fill="var(--foreground)" color="var(--foreground)" />
                  <span className="text-sm">Created {new Date(referral.createdAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-6">
          <div className="card">
            <h3 className="card-title mb-4">
              <AlertTriangle size={16} />
              Risk Assessment
            </h3>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-4)',
              padding: 'var(--space-4)',
              background: referral.dangerSignScore >= 7 ? 'var(--error-light)' : 
                         referral.dangerSignScore >= 4 ? 'var(--warning-light)' : 'var(--success-light)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-4)'
            }}>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>
                {referral.dangerSignScore}/10
              </div>
              <div className="text-sm">
                {referral.dangerSignScore >= 7 ? 'Critical Risk' : 
                 referral.dangerSignScore >= 4 ? 'Moderate Risk' : 'Low Risk'}
              </div>
            </div>
            {referral.dangerSigns?.length ? (
              <ul style={{ paddingLeft: 'var(--space-4)', color: 'var(--muted)' }}>
                {referral.dangerSigns.map((sign, i) => (
                  <li key={i} className="text-sm mb-1">{sign}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">No danger signs reported</p>
            )}
          </div>
        </div>

        <div className="col-12">
          <div className="card">
            <h3 className="card-title mb-4">
              <FileText size={16} />
              Clinical Information
            </h3>
            <div className="mb-4">
              <div className="text-xs text-muted mb-1">Chief Complaint</div>
              <p>{referral.chiefComplaint}</p>
            </div>
            {referral.clinicalSummary && (
              <div className="mb-4">
                <div className="text-xs text-muted mb-1">Clinical Summary</div>
                <p>{referral.clinicalSummary}</p>
              </div>
            )}
            {referral.vitalSigns && (
              <div>
                <div className="text-xs text-muted mb-2">Vital Signs</div>
                <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                  {referral.vitalSigns.bloodPressureSystolic && (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: 'var(--space-3)', 
                      background: 'var(--accent)', 
                      borderRadius: 'var(--radius-md)',
                      minWidth: 80
                    }}>
                      <Activity size={16} style={{ color: 'var(--muted)', marginBottom: 4 }} />
                      <div className="font-semibold">{referral.vitalSigns.bloodPressureSystolic}/{referral.vitalSigns.bloodPressureDiastolic}</div>
                      <div className="text-xs text-muted">BP</div>
                    </div>
                  )}
                  {referral.vitalSigns.heartRate && (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: 'var(--space-3)', 
                      background: 'var(--accent)', 
                      borderRadius: 'var(--radius-md)',
                      minWidth: 80
                    }}>
                      <Heart size={16} style={{ color: 'var(--error)', marginBottom: 4 }} />
                      <div className="font-semibold">{referral.vitalSigns.heartRate}</div>
                      <div className="text-xs text-muted">HR</div>
                    </div>
                  )}
                  {referral.vitalSigns.temperature && (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: 'var(--space-3)', 
                      background: 'var(--accent)', 
                      borderRadius: 'var(--radius-md)',
                      minWidth: 80
                    }}>
                      <Thermometer size={16} style={{ color: 'var(--warning)', marginBottom: 4 }} />
                      <div className="font-semibold">{referral.vitalSigns.temperature}°C</div>
                      <div className="text-xs text-muted">Temp</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showRejectModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 'var(--space-4)'
        }}>
          <div className="card" style={{ maxWidth: 400, width: '100%' }}>
            <h3 className="card-title mb-4">Reject Referral</h3>
            <div className="form-group">
              <label className="form-label">Reason</label>
              <textarea
                className="form-input"
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Provide a reason for rejection..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleReject}
                disabled={!rejectReason.trim()}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
