'use client';

import { useState } from 'react';
import { 
  Phone, 
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  User,
  MapPin,
  AlertTriangle
} from 'lucide-react';

interface Call {
  id: string;
  callerName: string;
  callerPhone: string;
  status: 'active' | 'on-hold' | 'completed' | 'missed';
  type: 'emergency' | 'referral' | 'inquiry';
  startTime: Date;
  duration: number;
  notes?: string;
}

const mockCalls: Call[] = [
  { id: '1', callerName: 'Unknown', callerPhone: '+232 76 123 456', status: 'active', type: 'emergency', startTime: new Date(), duration: 145 },
  { id: '2', callerName: 'Facility Operator', callerPhone: '+232 77 987 654', status: 'on-hold', type: 'referral', startTime: new Date(Date.now() - 300000), duration: 300 },
  { id: '3', callerName: 'Community Health', callerPhone: '+232 78 111 222', status: 'completed', type: 'inquiry', startTime: new Date(Date.now() - 3600000), duration: 420 },
];

function CallTypeBadge({ type }: { type: string }) {
  const colors = {
    emergency: { bg: 'var(--error-light)', text: 'var(--error)' },
    referral: { bg: 'var(--info-light)', text: 'var(--info)' },
    inquiry: { bg: 'var(--accent)', text: 'var(--muted)' },
  };
  const c = colors[type as keyof typeof colors] || colors.inquiry;
  return (
    <span style={{ 
      padding: 'var(--space-1) var(--space-2)', 
      background: c.bg, 
      color: c.text,
      borderRadius: 'var(--radius-sm)',
      fontSize: 'var(--text-xs)',
      fontWeight: 500,
      textTransform: 'uppercase'
    }}>
      {type}
    </span>
  );
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function CallCentrePage() {
  const [calls] = useState<Call[]>(mockCalls);
  const [activeCall, setActiveCall] = useState<Call | null>(calls.find(c => c.status === 'active') || null);

  const activeCalls = calls.filter(c => c.status === 'active' || c.status === 'on-hold');
  const completedToday = calls.filter(c => c.status === 'completed').length;
  const missedToday = calls.filter(c => c.status === 'missed').length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Call Centre</h1>
          <p className="page-subtitle">Emergency call management and dispatch</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} />
          Log New Call
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-label">Active Calls</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{activeCalls.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">On Hold</div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>
            {calls.filter(c => c.status === 'on-hold').length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed Today</div>
          <div className="stat-value">{completedToday}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Missed</div>
          <div className="stat-value" style={{ color: 'var(--error)' }}>{missedToday}</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Active Call Panel */}
        <div className="col-6">
          <div className="card">
            <h3 className="card-title mb-4">
              <PhoneCall size={16} />
              Active Call
            </h3>
            {activeCall ? (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CallTypeBadge type={activeCall.type} />
                      <span className="text-xs text-muted">{formatDuration(activeCall.duration)}</span>
                    </div>
                    <div className="font-semibold">{activeCall.callerPhone}</div>
                    <div className="text-sm text-muted">{activeCall.callerName}</div>
                  </div>
                  <div style={{ 
                    width: 48, 
                    height: 48, 
                    background: 'var(--success-light)', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulse 2s infinite'
                  }}>
                    <Phone size={20} style={{ color: 'var(--success)' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Call Notes</label>
                  <textarea 
                    className="form-input" 
                    rows={3} 
                    placeholder="Document call details..."
                  />
                </div>

                <div className="flex gap-2">
                  <button className="btn btn-secondary">
                    <Mic size={14} />
                    Mute
                  </button>
                  <button className="btn btn-secondary">
                    <Clock size={14} />
                    Hold
                  </button>
                  <button className="btn btn-primary">
                    Create Referral
                  </button>
                  <button className="btn btn-danger">
                    <PhoneOff size={14} />
                    End
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 'var(--space-8)' }}>
                <Phone size={32} style={{ margin: '0 auto var(--space-4)', opacity: 0.3 }} />
                <div>No active call</div>
              </div>
            )}
          </div>
        </div>

        {/* Call Queue */}
        <div className="col-6">
          <div className="card">
            <h3 className="card-title mb-4">
              <Clock size={16} />
              Call Queue
            </h3>
            {activeCalls.length ? (
              <div className="flex flex-col gap-3">
                {activeCalls.map((call) => (
                  <div 
                    key={call.id}
                    className="flex justify-between items-center p-3"
                    style={{ 
                      background: call.status === 'active' ? 'var(--success-light)' : 'var(--accent)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer'
                    }}
                    onClick={() => setActiveCall(call)}
                  >
                    <div className="flex items-center gap-3">
                      <div style={{ 
                        width: 32, 
                        height: 32, 
                        background: call.status === 'active' ? 'var(--success)' : 'var(--border)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Phone size={14} style={{ color: 'white' }} />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{call.callerPhone}</div>
                        <div className="text-xs text-muted">{formatDuration(call.duration)}</div>
                      </div>
                    </div>
                    <CallTypeBadge type={call.type} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 'var(--space-6)' }}>
                Queue empty
              </div>
            )}
          </div>
        </div>

        {/* Recent Calls */}
        <div className="col-12">
          <div className="card">
            <h3 className="card-title mb-4">Recent Calls</h3>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Caller</th>
                    <th>Type</th>
                    <th>Duration</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {calls.map((call) => (
                    <tr key={call.id}>
                      <td>
                        <div className="font-medium">{call.callerPhone}</div>
                        <div className="text-xs text-muted">{call.callerName}</div>
                      </td>
                      <td><CallTypeBadge type={call.type} /></td>
                      <td className="text-muted">{formatDuration(call.duration)}</td>
                      <td className="text-muted text-sm">
                        {call.startTime.toLocaleTimeString()}
                      </td>
                      <td>
                        {call.status === 'completed' && <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />}
                        {call.status === 'missed' && <XCircle size={16} style={{ color: 'var(--error)' }} />}
                        {call.status === 'active' && <Phone size={16} style={{ color: 'var(--success)' }} />}
                        {call.status === 'on-hold' && <Clock size={16} style={{ color: 'var(--warning)' }} />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
