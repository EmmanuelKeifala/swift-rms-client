'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { readinessService } from '@/lib/api';
import { 
  BedDouble, 
  Droplets, 
  Zap, 
  Building2, 
  RefreshCw,
  Users,
  Activity
} from 'lucide-react';

export default function ReadinessPage() {
  const { data: currentReadiness, isLoading } = useQuery({
    queryKey: ['readiness', 'current'],
    queryFn: () => readinessService.getCurrent(),
  });

  const { data: bedMonitoring } = useQuery({
    queryKey: ['readiness', 'bed-monitoring'],
    queryFn: () => readinessService.getBedMonitoring(),
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ADEQUATE': return 'var(--success)';
      case 'LOW': return 'var(--warning)';
      case 'CRITICAL': return 'var(--error)';
      default: return 'var(--muted)';
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Facility Readiness</h1>
          <p className="page-subtitle">Monitor and update facility status</p>
        </div>
        <Link href="/readiness/update" className="btn btn-primary">
          <RefreshCw size={16} />
          Update Status
        </Link>
      </div>

      {currentReadiness && (
        <div className="stats-grid">
          <div className="stat-card" style={{ gridColumn: 'span 2' }}>
            <div className="flex items-center gap-6">
              <div style={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%',
                background: `conic-gradient(${getScoreColor(currentReadiness.overallScore)} ${currentReadiness.overallScore}%, var(--border) 0)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ 
                  width: 64, 
                  height: 64, 
                  background: 'var(--background)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--text-xl)',
                  fontWeight: 700
                }}>
                  {currentReadiness.overallScore}%
                </div>
              </div>
              <div>
                <div className="font-semibold">Overall Readiness</div>
                <div className="text-sm text-muted">
                  Last updated {new Date(currentReadiness.reportedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Beds Available</div>
            <div className="stat-value">{currentReadiness.bedsAvailable}/{currentReadiness.bedsTotal}</div>
            <div style={{ 
              marginTop: 'var(--space-3)',
              height: 4,
              background: 'var(--border)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(currentReadiness.bedsAvailable / currentReadiness.bedsTotal) * 100}%`,
                height: '100%',
                background: getScoreColor((currentReadiness.bedsAvailable / currentReadiness.bedsTotal) * 100)
              }} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Staff on Duty</div>
            <div className="flex gap-6 mt-2">
              <div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{currentReadiness.doctorsOnDuty}</div>
                <div className="text-xs text-muted">Doctors</div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{currentReadiness.nursesOnDuty}</div>
                <div className="text-xs text-muted">Nurses</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="col-6">
          <div className="card">
            <h3 className="card-title mb-4">
              <BedDouble size={16} />
              Bed Availability
            </h3>
            {currentReadiness?.bedsByWard?.length ? (
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
                    {currentReadiness.bedsByWard.map((ward, i) => (
                      <tr key={i}>
                        <td>{ward.wardName}</td>
                        <td>{ward.available}</td>
                        <td>{ward.total}</td>
                        <td style={{ color: getScoreColor(100 - ward.occupancy) }}>{ward.occupancy}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted">No ward data available</p>
            )}
          </div>
        </div>

        <div className="col-6">
          <div className="card">
            <h3 className="card-title mb-4">
              <Droplets size={16} />
              Blood Bank
            </h3>
            {currentReadiness?.bloodBank?.units?.length ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)' }}>
                {currentReadiness.bloodBank.units.map((blood, i) => (
                  <div key={i} style={{ 
                    textAlign: 'center',
                    padding: 'var(--space-3)',
                    background: 'var(--accent)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: getStatusColor(blood.status) }}>
                      {blood.units}
                    </div>
                    <div className="text-xs text-muted mt-1">{blood.type}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No blood bank data</p>
            )}
          </div>
        </div>

        <div className="col-6">
          <div className="card">
            <h3 className="card-title mb-4">
              <Zap size={16} />
              Resources
            </h3>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Oxygen', value: currentReadiness?.oxygenStatus },
                { label: 'Staffing', value: currentReadiness?.staffingStatus },
                { label: 'Supplies', value: currentReadiness?.emergencySuppliesStatus },
                { label: 'Theatre', value: currentReadiness?.theatreAvailable ? 'Available' : 'Unavailable' }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm">{item.label}</span>
                  <span style={{ 
                    padding: 'var(--space-1) var(--space-2)',
                    background: item.value === 'ADEQUATE' || item.value === 'Available' ? 'var(--success-light)' : 
                               item.value === 'LOW' ? 'var(--warning-light)' : 'var(--error-light)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 500
                  }}>
                    {item.value || 'Unknown'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-6">
          <div className="card">
            <h3 className="card-title mb-4">
              <Building2 size={16} />
              District Overview
            </h3>
            {bedMonitoring ? (
              <div>
                <div className="flex justify-around mb-4">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{bedMonitoring.totalBeds}</div>
                    <div className="text-xs text-muted">Total</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--success)' }}>
                      {bedMonitoring.availableBeds}
                    </div>
                    <div className="text-xs text-muted">Available</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>
                      {Math.round(bedMonitoring.occupancyRate)}%
                    </div>
                    <div className="text-xs text-muted">Occupancy</div>
                  </div>
                </div>
                {bedMonitoring.facilities?.slice(0, 5).map((f, i) => (
                  <div key={i} className="flex justify-between text-sm" style={{ 
                    padding: 'var(--space-2) 0',
                    borderBottom: i < 4 ? '1px solid var(--border)' : 'none'
                  }}>
                    <span>{f.facilityName}</span>
                    <span className="text-muted">{f.availableBeds}/{f.totalBeds}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">Loading...</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
