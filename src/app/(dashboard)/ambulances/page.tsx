'use client';

import { useState } from 'react';
import { 
  Ambulance, 
  MapPin,
  Clock,
  Phone,
  User,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  Battery,
  Wifi
} from 'lucide-react';

interface AmbulanceData {
  id: string;
  vehicleNumber: string;
  status: 'available' | 'en-route' | 'on-scene' | 'transporting' | 'offline';
  driver: string;
  driverPhone: string;
  currentLocation: string;
  assignedReferral?: string;
  batteryLevel: number;
  lastUpdated: Date;
}

const mockAmbulances: AmbulanceData[] = [
  { id: '1', vehicleNumber: 'AMB-001', status: 'available', driver: 'Mohamed Kamara', driverPhone: '+232 76 111 111', currentLocation: 'Connaught Hospital', batteryLevel: 95, lastUpdated: new Date() },
  { id: '2', vehicleNumber: 'AMB-002', status: 'en-route', driver: 'Fatmata Sesay', driverPhone: '+232 77 222 222', currentLocation: 'En route to Bo Hospital', assignedReferral: 'REF-2024-001', batteryLevel: 72, lastUpdated: new Date() },
  { id: '3', vehicleNumber: 'AMB-003', status: 'transporting', driver: 'Ibrahim Bangura', driverPhone: '+232 78 333 333', currentLocation: 'Transporting patient', assignedReferral: 'REF-2024-002', batteryLevel: 45, lastUpdated: new Date() },
  { id: '4', vehicleNumber: 'AMB-004', status: 'offline', driver: 'Aminata Koroma', driverPhone: '+232 79 444 444', currentLocation: 'Unknown', batteryLevel: 12, lastUpdated: new Date(Date.now() - 3600000) },
];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    available: { bg: 'var(--success-light)', text: 'var(--success)' },
    'en-route': { bg: 'var(--info-light)', text: 'var(--info)' },
    'on-scene': { bg: 'var(--warning-light)', text: 'var(--warning)' },
    transporting: { bg: 'rgba(121, 40, 202, 0.1)', text: 'var(--purple-500)' },
    offline: { bg: 'var(--accent)', text: 'var(--muted)' },
  };
  const c = colors[status] || colors.offline;
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
      {status.replace('-', ' ')}
    </span>
  );
}

export default function AmbulancesPage() {
  const [ambulances] = useState<AmbulanceData[]>(mockAmbulances);
  const [selected, setSelected] = useState<AmbulanceData | null>(null);

  const available = ambulances.filter(a => a.status === 'available').length;
  const active = ambulances.filter(a => ['en-route', 'on-scene', 'transporting'].includes(a.status)).length;
  const offline = ambulances.filter(a => a.status === 'offline').length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Ambulances</h1>
          <p className="page-subtitle">Fleet management and tracking</p>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-label">Total Fleet</div>
          <div className="stat-value">{ambulances.length}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
            <div className="stat-label">Available</div>
          </div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{available}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <Navigation size={14} style={{ color: 'var(--info)' }} />
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-value" style={{ color: 'var(--info)' }}>{active}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} style={{ color: 'var(--error)' }} />
            <div className="stat-label">Offline</div>
          </div>
          <div className="stat-value" style={{ color: 'var(--error)' }}>{offline}</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Ambulance List */}
        <div className="col-8">
          <div className="card">
            <h3 className="card-title mb-4">Fleet Status</h3>
            <div className="flex flex-col gap-3">
              {ambulances.map((amb) => (
                <div 
                  key={amb.id}
                  className="flex justify-between items-center p-4"
                  style={{ 
                    background: selected?.id === amb.id ? 'var(--accent)' : 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all var(--duration-fast) var(--ease)'
                  }}
                  onClick={() => setSelected(amb)}
                >
                  <div className="flex items-center gap-4">
                    <div style={{ 
                      width: 48, 
                      height: 48, 
                      background: amb.status === 'available' ? 'var(--success-light)' : 'var(--accent)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Ambulance size={24} style={{ color: amb.status === 'available' ? 'var(--success)' : 'var(--muted)' }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{amb.vehicleNumber}</span>
                        <StatusBadge status={amb.status} />
                      </div>
                      <div className="text-sm text-muted">{amb.driver}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1 text-sm text-muted">
                      <MapPin size={14} />
                      <span className="truncate" style={{ maxWidth: 150 }}>{amb.currentLocation}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Battery size={14} style={{ color: amb.batteryLevel < 30 ? 'var(--error)' : 'var(--muted)' }} />
                      <span className="text-xs" style={{ color: amb.batteryLevel < 30 ? 'var(--error)' : 'var(--muted)' }}>
                        {amb.batteryLevel}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Ambulance Details */}
        <div className="col-4">
          <div className="card" style={{ position: 'sticky', top: 'var(--space-6)' }}>
            <h3 className="card-title mb-4">Details</h3>
            {selected ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div style={{ 
                    width: 56, 
                    height: 56, 
                    background: 'var(--accent)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Ambulance size={28} style={{ color: 'var(--muted)' }} />
                  </div>
                  <div>
                    <div className="font-semibold">{selected.vehicleNumber}</div>
                    <StatusBadge status={selected.status} />
                  </div>
                </div>

                <div className="flex flex-col gap-3" style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)' }}>
                  <div>
                    <div className="text-xs text-muted mb-1">Driver</div>
                    <div className="flex items-center gap-2">
                      <User size={14} style={{ color: 'var(--muted)' }} />
                      <span className="text-sm">{selected.driver}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted mb-1">Phone</div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} style={{ color: 'var(--muted)' }} />
                      <span className="text-sm">{selected.driverPhone}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted mb-1">Location</div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} style={{ color: 'var(--muted)' }} />
                      <span className="text-sm">{selected.currentLocation}</span>
                    </div>
                  </div>
                  {selected.assignedReferral && (
                    <div>
                      <div className="text-xs text-muted mb-1">Assigned Referral</div>
                      <a href={`/referrals/${selected.assignedReferral}`} className="link text-sm">
                        {selected.assignedReferral}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-2">
                  <button className="btn btn-primary" style={{ flex: 1 }}>
                    <Phone size={14} />
                    Call Driver
                  </button>
                  <button className="btn btn-secondary">
                    <Navigation size={14} />
                    Track
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 'var(--space-8)' }}>
                Select an ambulance to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
