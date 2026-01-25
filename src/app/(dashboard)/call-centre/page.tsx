'use client';

import { useState, useMemo } from 'react';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui';
import { 
  Phone, 
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Mic,
  PhoneCall,
  PhoneOff,
  X,
  User,
  AlertTriangle,
  Search
} from 'lucide-react';

interface Call {
  id: string;
  callerName: string;
  callerPhone: string;
  status: 'active' | 'on-hold' | 'completed' | 'missed';
  type: 'emergency' | 'referral' | 'inquiry' | 'follow-up';
  startTime: Date;
  duration: number;
  notes?: string;
  facility?: string;
}

const mockCalls: Call[] = [
  { id: '1', callerName: 'Unknown', callerPhone: '+232 76 123 456', status: 'active', type: 'emergency', startTime: new Date(), duration: 145, facility: 'Konta PHU' },
  { id: '2', callerName: 'Facility Operator', callerPhone: '+232 77 987 654', status: 'on-hold', type: 'referral', startTime: new Date(Date.now() - 300000), duration: 300, facility: 'Mabella Hospital' },
  { id: '3', callerName: 'Community Health', callerPhone: '+232 78 111 222', status: 'completed', type: 'inquiry', startTime: new Date(Date.now() - 3600000), duration: 420 },
  { id: '4', callerName: 'Dr. Sesay', callerPhone: '+232 79 333 444', status: 'completed', type: 'follow-up', startTime: new Date(Date.now() - 7200000), duration: 180 },
  { id: '5', callerName: 'Unknown', callerPhone: '+232 76 555 666', status: 'missed', type: 'emergency', startTime: new Date(Date.now() - 1800000), duration: 0 },
];

function CallTypeBadge({ type }: { type: string }) {
  const styles = {
    emergency: { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
    referral: { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' },
    inquiry: { bg: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: 'var(--border-subtle)' },
    'follow-up': { bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' },
  };
  const s = styles[type as keyof typeof styles] || styles.inquiry;
  return (
    <span style={{ 
      padding: '3px 8px', 
      background: s.bg, 
      color: s.color,
      border: `1px solid ${s.border}`,
      borderRadius: 'var(--radius-full)',
      fontSize: '11px',
      fontWeight: 500,
      textTransform: 'uppercase'
    }}>
      {type}
    </span>
  );
}

function CallStatusBadge({ status }: { status: string }) {
  const config = {
    active: { icon: Phone, color: '#4ade80', bg: 'rgba(34, 197, 94, 0.15)', label: 'Active' },
    'on-hold': { icon: Clock, color: '#fbbf24', bg: 'rgba(234, 179, 8, 0.15)', label: 'On Hold' },
    completed: { icon: CheckCircle2, color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)', label: 'Completed' },
    missed: { icon: XCircle, color: '#f87171', bg: 'rgba(239, 68, 68, 0.15)', label: 'Missed' },
  };
  const c = config[status as keyof typeof config] || config.completed;
  const Icon = c.icon;
  
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '3px 8px',
      background: c.bg,
      color: c.color,
      borderRadius: 'var(--radius-full)',
      fontSize: '11px',
      fontWeight: 500
    }}>
      <Icon size={10} />
      {c.label}
    </span>
  );
}

function formatDuration(seconds: number) {
  if (seconds === 0) return '-';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface LogCallModalProps {
  onClose: () => void;
  onSubmit: (data: Partial<Call>) => void;
}

function LogCallModal({ onClose, onSubmit }: LogCallModalProps) {
  const [callerPhone, setCallerPhone] = useState('');
  const [callerName, setCallerName] = useState('');
  const [callType, setCallType] = useState<Call['type']>('inquiry');
  const [notes, setNotes] = useState('');
  const [facility, setFacility] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      callerPhone,
      callerName: callerName || 'Unknown',
      type: callType,
      notes,
      facility,
      status: 'completed',
      startTime: new Date(),
      duration: 0
    });
    onClose();
  };

  const typeOptions = [
    { value: 'emergency', label: 'Emergency', color: '#f87171', icon: AlertTriangle },
    { value: 'referral', label: 'Referral', color: '#60a5fa', icon: Phone },
    { value: 'inquiry', label: 'Inquiry', color: 'var(--text-secondary)', icon: User },
    { value: 'follow-up', label: 'Follow-up', color: '#4ade80', icon: CheckCircle2 },
  ];

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
              <Phone size={20} style={{ color: 'var(--accent-light)' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Log New Call
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-tertiary)' }}>
                Record call details
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
            {/* Call Type */}
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '13px', 
                fontWeight: 500, 
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-2)' 
              }}>
                Call Type *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)' }}>
                {typeOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setCallType(opt.value as Call['type'])}
                      style={{ 
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        border: `1px solid ${callType === opt.value ? opt.color : 'var(--border-subtle)'}`,
                        background: callType === opt.value ? `${opt.color}15` : 'var(--bg-overlay)',
                        color: callType === opt.value ? opt.color : 'var(--text-secondary)',
                        fontWeight: 500,
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Icon size={16} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Caller Phone */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '13px', 
                fontWeight: 500, 
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-2)' 
              }}>
                Caller Phone *
              </label>
              <input
                type="tel"
                className="form-input"
                value={callerPhone}
                onChange={(e) => setCallerPhone(e.target.value)}
                placeholder="+232 XX XXX XXX"
                required
              />
            </div>

            {/* Caller Name */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '13px', 
                fontWeight: 500, 
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-2)' 
              }}>
                Caller Name
              </label>
              <input
                type="text"
                className="form-input"
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                placeholder="Enter caller name (optional)"
              />
            </div>

            {/* Facility */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '13px', 
                fontWeight: 500, 
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-2)' 
              }}>
                Related Facility
              </label>
              <input
                type="text"
                className="form-input"
                value={facility}
                onChange={(e) => setFacility(e.target.value)}
                placeholder="Enter facility name (optional)"
              />
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
                Call Notes
              </label>
              <textarea
                className="form-input"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Document call details, actions taken, follow-up required..."
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
            <button type="submit" className="btn btn-primary" disabled={!callerPhone}>
              <Plus size={14} />
              Log Call
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CallCentrePage() {
  const [calls, setCalls] = useState<Call[]>(mockCalls);
  const [activeCall, setActiveCall] = useState<Call | null>(calls.find(c => c.status === 'active') || null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const activeCalls = calls.filter(c => c.status === 'active' || c.status === 'on-hold');
  const completedToday = calls.filter(c => c.status === 'completed').length;
  const missedToday = calls.filter(c => c.status === 'missed').length;

  const filteredCalls = useMemo(() => {
    return calls.filter(c => {
      if (statusFilter && c.status !== statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return c.callerPhone.toLowerCase().includes(s) || 
               c.callerName.toLowerCase().includes(s) ||
               c.facility?.toLowerCase().includes(s);
      }
      return true;
    });
  }, [calls, statusFilter, search]);

  const handleLogCall = (data: Partial<Call>) => {
    const newCall: Call = {
      id: Date.now().toString(),
      callerName: data.callerName || 'Unknown',
      callerPhone: data.callerPhone || '',
      status: data.status || 'completed',
      type: data.type || 'inquiry',
      startTime: new Date(),
      duration: data.duration || 0,
      notes: data.notes,
      facility: data.facility
    };
    setCalls([newCall, ...calls]);
  };

  // Define columns
  const columnHelper = createColumnHelper<Call>();
  
  const columns = useMemo<ColumnDef<Call, any>[]>(() => [
    columnHelper.accessor('callerPhone', {
      header: 'Caller',
      cell: info => (
        <div>
          <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{info.getValue()}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{info.row.original.callerName}</div>
        </div>
      ),
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: info => <CallTypeBadge type={info.getValue()} />,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => <CallStatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor('duration', {
      header: 'Duration',
      cell: info => (
        <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          {formatDuration(info.getValue())}
        </span>
      ),
    }),
    columnHelper.accessor('startTime', {
      header: 'Time',
      cell: info => (
        <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>
          {info.getValue().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    }),
    columnHelper.accessor('facility', {
      header: 'Facility',
      cell: info => (
        <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          {info.getValue() || '-'}
        </span>
      ),
    }),
  ], []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Call Centre</h1>
          <p className="page-subtitle">Emergency call management and dispatch</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowLogModal(true)}>
          <Plus size={16} />
          Log New Call
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 'var(--space-5)' }}>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
              <PhoneCall size={20} style={{ color: '#4ade80' }} />
            </div>
          </div>
          <div className="stat-label">Active Calls</div>
          <div className="stat-value" style={{ color: '#4ade80' }}>{activeCalls.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(234, 179, 8, 0.15)' }}>
              <Clock size={20} style={{ color: '#fbbf24' }} />
            </div>
          </div>
          <div className="stat-label">On Hold</div>
          <div className="stat-value" style={{ color: '#fbbf24' }}>
            {calls.filter(c => c.status === 'on-hold').length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
              <CheckCircle2 size={20} style={{ color: '#60a5fa' }} />
            </div>
          </div>
          <div className="stat-label">Completed Today</div>
          <div className="stat-value">{completedToday}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
              <XCircle size={20} style={{ color: '#f87171' }} />
            </div>
          </div>
          <div className="stat-label">Missed</div>
          <div className="stat-value" style={{ color: '#f87171' }}>{missedToday}</div>
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
                    <div className="flex items-center gap-2 mb-2">
                      <CallTypeBadge type={activeCall.type} />
                      <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        {formatDuration(activeCall.duration)}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '18px', color: 'var(--text-primary)' }}>
                      {activeCall.callerPhone}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {activeCall.callerName}
                    </div>
                  </div>
                  <div style={{ 
                    width: 52, 
                    height: 52, 
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '2px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulse 2s infinite'
                  }}>
                    <Phone size={22} style={{ color: '#4ade80' }} />
                  </div>
                </div>

                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '12px', 
                    fontWeight: 500, 
                    color: 'var(--text-tertiary)',
                    marginBottom: 'var(--space-2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em'
                  }}>
                    Call Notes
                  </label>
                  <textarea 
                    className="form-input" 
                    rows={3} 
                    placeholder="Document call details..."
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                  <button className="btn btn-secondary btn-sm">
                    <Mic size={14} />
                    Mute
                  </button>
                  <button className="btn btn-secondary btn-sm">
                    <Clock size={14} />
                    Hold
                  </button>
                  <button className="btn btn-primary btn-sm">
                    Create Referral
                  </button>
                  <button className="btn btn-danger btn-sm">
                    <PhoneOff size={14} />
                    End
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'var(--bg-overlay)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-4)'
                }}>
                  <Phone size={28} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No active call</div>
                <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  Select a call from the queue or log a new call
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Call Queue */}
        <div className="col-6">
          <div className="card">
            <h3 className="card-title mb-4">
              <Clock size={16} />
              Call Queue ({activeCalls.length})
            </h3>
            {activeCalls.length ? (
              <div className="flex flex-col gap-2">
                {activeCalls.map((call) => (
                  <div 
                    key={call.id}
                    onClick={() => setActiveCall(call)}
                    style={{ 
                      padding: 'var(--space-3)',
                      background: call.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-overlay)',
                      border: `1px solid ${call.status === 'active' ? 'rgba(34, 197, 94, 0.3)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div style={{ 
                        width: 36, 
                        height: 36, 
                        background: call.status === 'active' ? 'rgba(34, 197, 94, 0.2)' : 'var(--bg-subtle)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Phone size={16} style={{ color: call.status === 'active' ? '#4ade80' : 'var(--text-tertiary)' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-primary)' }}>
                          {call.callerPhone}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                          {formatDuration(call.duration)} • {call.callerName}
                        </div>
                      </div>
                    </div>
                    <CallTypeBadge type={call.type} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: 'var(--space-6)' }}>
                <CheckCircle2 size={32} style={{ margin: '0 auto var(--space-3)', opacity: 0.5 }} />
                <div>Queue empty</div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Calls Table */}
        <div className="col-12">
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Call History</h3>
              <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
                <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
                  <Search size={16} className="search-box-icon" />
                  <input
                    type="text"
                    className="search-box-input"
                    placeholder="Search calls..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select 
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="missed">Missed</option>
                </select>
              </div>
            </div>
            <div style={{ padding: 'var(--space-4)' }}>
              <DataTable 
                data={filteredCalls} 
                columns={columns}
                emptyMessage="No calls found"
                emptyDescription="Log a new call to get started"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Log Call Modal */}
      {showLogModal && (
        <LogCallModal 
          onClose={() => setShowLogModal(false)}
          onSubmit={handleLogCall}
        />
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </>
  );
}
