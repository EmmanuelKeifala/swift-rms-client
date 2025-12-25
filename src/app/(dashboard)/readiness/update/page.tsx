'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { readinessService } from '@/lib/api';
import { 
  ArrowLeft, 
  Save,
  BedDouble,
  Users,
  Droplets,
  Zap,
  AlertTriangle,
  Plus,
  Minus
} from 'lucide-react';

interface WardBed {
  wardName: string;
  available: number;
  total: number;
}

interface BloodUnit {
  type: string;
  units: number;
}

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const statusOptions = ['ADEQUATE', 'LOW', 'CRITICAL'];

export default function UpdateReadinessPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [bedsAvailable, setBedsAvailable] = useState(50);
  const [bedsTotal, setBedsTotal] = useState(100);
  const [doctorsOnDuty, setDoctorsOnDuty] = useState(5);
  const [nursesOnDuty, setNursesOnDuty] = useState(12);
  const [oxygenStatus, setOxygenStatus] = useState('ADEQUATE');
  const [staffingStatus, setStaffingStatus] = useState('ADEQUATE');
  const [emergencySuppliesStatus, setEmergencySuppliesStatus] = useState('ADEQUATE');
  const [theatreAvailable, setTheatreAvailable] = useState(true);
  const [bloodBank, setBloodBank] = useState<BloodUnit[]>(
    bloodTypes.map(type => ({ type, units: 0 }))
  );
  const [wards, setWards] = useState<WardBed[]>([
    { wardName: 'General Ward', available: 20, total: 40 },
    { wardName: 'ICU', available: 2, total: 8 },
    { wardName: 'Maternity', available: 10, total: 20 },
    { wardName: 'Pediatric', available: 8, total: 15 },
  ]);

  const mutation = useMutation({
    mutationFn: () => readinessService.update({
      bedsAvailable,
      bedsTotal,
      doctorsOnDuty,
      nursesOnDuty,
      oxygenStatus,
      staffingStatus,
      emergencySuppliesStatus,
      theatreAvailable,
      bloodBank: { units: bloodBank },
      bedsByWard: wards,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readiness'] });
      router.push('/readiness');
    },
  });

  const updateBloodUnits = (type: string, delta: number) => {
    setBloodBank(prev => prev.map(b => 
      b.type === type ? { ...b, units: Math.max(0, b.units + delta) } : b
    ));
  };

  const updateWard = (index: number, field: 'available' | 'total', value: number) => {
    setWards(prev => prev.map((w, i) => 
      i === index ? { ...w, [field]: Math.max(0, value) } : w
    ));
  };

  return (
    <>
      <div className="mb-4">
        <Link href="/readiness" className="flex items-center gap-1 text-sm text-muted">
          <ArrowLeft size={14} />
          Back to Readiness
        </Link>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Update Readiness Status</h1>
          <p className="page-subtitle">Report current facility capacity and resources</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Submit Update
            </>
          )}
        </button>
      </div>

      <div className="dashboard-grid">
        {/* Bed Capacity */}
        <div className="col-6">
          <div className="card">
            <h3 className="card-title mb-4">
              <BedDouble size={16} />
              Bed Capacity
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Available Beds</label>
                <input 
                  type="number" 
                  className="form-input"
                  value={bedsAvailable}
                  onChange={(e) => setBedsAvailable(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Total Beds</label>
                <input 
                  type="number" 
                  className="form-input"
                  value={bedsTotal}
                  onChange={(e) => setBedsTotal(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-4)' }}>
              <div className="text-sm font-medium mb-2">Occupancy</div>
              <div style={{ 
                height: 8, 
                background: 'var(--accent)', 
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${((bedsTotal - bedsAvailable) / bedsTotal) * 100}%`,
                  height: '100%',
                  background: bedsAvailable < bedsTotal * 0.2 ? 'var(--error)' : 'var(--success)'
                }} />
              </div>
              <div className="text-xs text-muted mt-1">
                {Math.round(((bedsTotal - bedsAvailable) / bedsTotal) * 100)}% occupied
              </div>
            </div>
          </div>
        </div>

        {/* Staff on Duty */}
        <div className="col-6">
          <div className="card">
            <h3 className="card-title mb-4">
              <Users size={16} />
              Staff on Duty
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Doctors</label>
                <input 
                  type="number" 
                  className="form-input"
                  value={doctorsOnDuty}
                  onChange={(e) => setDoctorsOnDuty(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nurses</label>
                <input 
                  type="number" 
                  className="form-input"
                  value={nursesOnDuty}
                  onChange={(e) => setNursesOnDuty(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
              <label className="form-label">Staffing Status</label>
              <select 
                className="form-input"
                value={staffingStatus}
                onChange={(e) => setStaffingStatus(e.target.value)}
              >
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Ward Details */}
        <div className="col-12">
          <div className="card">
            <h3 className="card-title mb-4">Ward-by-Ward Status</h3>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Ward</th>
                    <th>Available</th>
                    <th>Total</th>
                    <th>Occupancy</th>
                  </tr>
                </thead>
                <tbody>
                  {wards.map((ward, i) => (
                    <tr key={ward.wardName}>
                      <td className="font-medium">{ward.wardName}</td>
                      <td>
                        <input 
                          type="number" 
                          className="form-input" 
                          style={{ width: 80 }}
                          value={ward.available}
                          onChange={(e) => updateWard(i, 'available', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          className="form-input" 
                          style={{ width: 80 }}
                          value={ward.total}
                          onChange={(e) => updateWard(i, 'total', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td>
                        <div style={{ 
                          width: 100,
                          height: 6, 
                          background: 'var(--accent)', 
                          borderRadius: 'var(--radius-full)',
                          overflow: 'hidden'
                        }}>
                          <div style={{ 
                            width: `${ward.total ? ((ward.total - ward.available) / ward.total) * 100 : 0}%`,
                            height: '100%',
                            background: 'var(--foreground)'
                          }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Blood Bank */}
        <div className="col-6">
          <div className="card">
            <h3 className="card-title mb-4">
              <Droplets size={16} />
              Blood Bank
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)' }}>
              {bloodBank.map((blood) => (
                <div 
                  key={blood.type}
                  style={{ 
                    textAlign: 'center',
                    padding: 'var(--space-3)',
                    background: 'var(--accent)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div className="text-xs text-muted mb-1">{blood.type}</div>
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={() => updateBloodUnits(blood.type, -1)}
                      style={{ width: 24, height: 24 }}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="font-semibold" style={{ minWidth: 24 }}>{blood.units}</span>
                    <button 
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={() => updateBloodUnits(blood.type, 1)}
                      style={{ width: 24, height: 24 }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="col-6">
          <div className="card">
            <h3 className="card-title mb-4">
              <Zap size={16} />
              Resources
            </h3>
            
            <div className="form-group">
              <label className="form-label">Oxygen Supply</label>
              <select 
                className="form-input"
                value={oxygenStatus}
                onChange={(e) => setOxygenStatus(e.target.value)}
              >
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Supplies</label>
              <select 
                className="form-input"
                value={emergencySuppliesStatus}
                onChange={(e) => setEmergencySuppliesStatus(e.target.value)}
              >
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <label className="flex items-center justify-between p-3 mt-2" style={{ background: 'var(--accent)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
              <div>
                <div className="font-medium text-sm">Operating Theatre</div>
                <div className="text-xs text-muted">Available for emergency surgery</div>
              </div>
              <input 
                type="checkbox" 
                checked={theatreAvailable}
                onChange={(e) => setTheatreAvailable(e.target.checked)}
                style={{ width: 18, height: 18 }} 
              />
            </label>
          </div>
        </div>
      </div>
    </>
  );
}
