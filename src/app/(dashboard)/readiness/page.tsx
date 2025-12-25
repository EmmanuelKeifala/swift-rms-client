'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { readinessService } from '@/lib/api';
import { 
  BedDouble, 
  Droplets, 
  Wind,
  RefreshCw,
  Users,
  Stethoscope,
  Syringe,
  AlertCircle,
  CheckCircle,
  Clock,
  Building2,
  Scissors,
  Package
} from 'lucide-react';

export default function ReadinessPage() {
  const { data: currentReadiness, isLoading } = useQuery({
    queryKey: ['readiness', 'current'],
    queryFn: () => readinessService.getCurrent(),
  });

  // Calculate overall readiness score based on available data
  const overallScore = useMemo(() => {
    if (!currentReadiness) return 0;
    let score = 0;
    let factors = 0;
    
    // Bed availability (40% weight)
    if (currentReadiness.bedCapacityTotal > 0) {
      const bedScore = (currentReadiness.bedCapacityAvailable / currentReadiness.bedCapacityTotal) * 100;
      score += bedScore * 0.4;
      factors += 0.4;
    }
    
    // Oxygen status (20% weight)
    const statusScore = (status: string) => {
      switch (status) {
        case 'ADEQUATE': return 100;
        case 'LOW': return 50;
        case 'CRITICAL': return 20;
        default: return 0;
      }
    };
    if (currentReadiness.oxygenStatus) {
      score += statusScore(currentReadiness.oxygenStatus) * 0.2;
      factors += 0.2;
    }
    
    // Blood bank status (20% weight)
    if (currentReadiness.bloodBankStatus) {
      score += statusScore(currentReadiness.bloodBankStatus) * 0.2;
      factors += 0.2;
    }
    
    // Staffing (20% weight)
    if (currentReadiness.staffingStatus) {
      const status = String(currentReadiness.staffingStatus);
      const staffScore = status === 'FULLY_STAFFED' ? 100 : 
                         status === 'ADEQUATE' ? 80 :
                         status === 'UNDERSTAFFED' ? 50 : 20;
      score += staffScore * 0.2;
      factors += 0.2;
    }
    
    return factors > 0 ? Math.round(score / factors) : 0;
  }, [currentReadiness]);

  // Calculate total blood units
  const totalBloodUnits = useMemo(() => {
    if (!currentReadiness) return 0;
    return (
      (currentReadiness.bloodUnitsAPositive || 0) +
      (currentReadiness.bloodUnitsANegative || 0) +
      (currentReadiness.bloodUnitsBPositive || 0) +
      (currentReadiness.bloodUnitsBNegative || 0) +
      (currentReadiness.bloodUnitsOPositive || 0) +
      (currentReadiness.bloodUnitsONegative || 0) +
      (currentReadiness.bloodUnitsABPositive || 0) +
      (currentReadiness.bloodUnitsABNegative || 0)
    );
  }, [currentReadiness]);

  // Blood units array for display
  const bloodUnitsArray = useMemo(() => {
    if (!currentReadiness) return [];
    return [
      { type: 'A+', units: currentReadiness.bloodUnitsAPositive || 0 },
      { type: 'A-', units: currentReadiness.bloodUnitsANegative || 0 },
      { type: 'B+', units: currentReadiness.bloodUnitsBPositive || 0 },
      { type: 'B-', units: currentReadiness.bloodUnitsBNegative || 0 },
      { type: 'O+', units: currentReadiness.bloodUnitsOPositive || 0 },
      { type: 'O-', units: currentReadiness.bloodUnitsONegative || 0 },
      { type: 'AB+', units: currentReadiness.bloodUnitsABPositive || 0 },
      { type: 'AB-', units: currentReadiness.bloodUnitsABNegative || 0 },
    ];
  }, [currentReadiness]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ADEQUATE':
      case 'FULLY_STAFFED':
      case 'AVAILABLE':
        return 'var(--success)';
      case 'LOW':
      case 'UNDERSTAFFED':
        return 'var(--warning)';
      case 'CRITICAL':
      case 'UNAVAILABLE':
        return 'var(--error)';
      default:
        return 'var(--muted)';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ADEQUATE':
      case 'FULLY_STAFFED':
      case 'AVAILABLE':
        return 'rgba(34, 197, 94, 0.1)';
      case 'LOW':
      case 'UNDERSTAFFED':
        return 'rgba(234, 179, 8, 0.1)';
      case 'CRITICAL':
      case 'UNAVAILABLE':
        return 'rgba(239, 68, 68, 0.1)';
      default:
        return 'var(--accent)';
    }
  };

  const StatusBadge = ({ status }: { status: string }) => (
    <span style={{
      padding: '4px 12px',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      color: getStatusColor(status),
      background: getStatusBg(status),
      textTransform: 'capitalize'
    }}>
      {status?.replace(/_/g, ' ').toLowerCase() || 'N/A'}
    </span>
  );

  const getBloodUnitColor = (units: number) => {
    if (units >= 10) return 'var(--success)';
    if (units > 0) return 'var(--warning)';
    return 'var(--error)';
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!currentReadiness) {
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
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <AlertCircle size={48} style={{ color: 'var(--muted)', margin: '0 auto var(--space-4)' }} />
          <h3 style={{ marginBottom: 'var(--space-2)' }}>No Readiness Data</h3>
          <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>
            No readiness report has been submitted yet for this facility.
          </p>
          <Link href="/readiness/update" className="btn btn-primary">
            Submit First Report
          </Link>
        </div>
      </>
    );
  }

  const bedOccupancy = currentReadiness.bedCapacityTotal > 0 
    ? Math.round(((currentReadiness.bedCapacityTotal - currentReadiness.bedCapacityAvailable) / currentReadiness.bedCapacityTotal) * 100) 
    : 0;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Facility Readiness</h1>
          <p className="page-subtitle">
            {currentReadiness.facilityName || 'Current Facility'} - Last updated {new Date(currentReadiness.reportDate).toLocaleDateString()}
          </p>
        </div>
        <Link href="/readiness/update" className="btn btn-primary">
          <RefreshCw size={16} />
          Update Status
        </Link>
      </div>

      {/* Overall Score & Quick Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(5, 1fr)', 
        gap: 'var(--space-4)', 
        marginBottom: 'var(--space-6)' 
      }}>
        {/* Overall Readiness Score */}
        <div className="card" style={{ 
          gridColumn: 'span 1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-6)'
        }}>
          <div style={{ 
            width: 100, 
            height: 100, 
            borderRadius: '50%',
            background: `conic-gradient(${getScoreColor(overallScore)} ${overallScore}%, var(--border) 0)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--space-3)'
          }}>
            <div style={{ 
              width: 80, 
              height: 80, 
              background: 'var(--card)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--text-2xl)',
              fontWeight: 700,
              color: getScoreColor(overallScore)
            }}>
              {overallScore}%
            </div>
          </div>
          <div className="text-sm font-medium">Overall Readiness</div>
          <div className="text-xs text-muted flex items-center gap-1 mt-1">
            <Clock size={12} />
            {new Date(currentReadiness.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Bed Stats */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div style={{ 
              width: 36, 
              height: 36, 
              borderRadius: 'var(--radius-md)', 
              background: 'rgba(59, 130, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BedDouble size={18} style={{ color: 'rgb(59, 130, 246)' }} />
            </div>
            <span className="text-sm font-medium">Beds</span>
          </div>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, lineHeight: 1.2 }}>
            {currentReadiness.bedCapacityAvailable}
            <span className="text-muted" style={{ fontSize: 'var(--text-lg)', fontWeight: 400 }}>
              /{currentReadiness.bedCapacityTotal}
            </span>
          </div>
          <div className="text-xs text-muted mt-1">Available beds</div>
          <div style={{ 
            marginTop: 'var(--space-3)',
            height: 6, 
            background: 'var(--accent)', 
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${bedOccupancy}%`,
              height: '100%',
              background: bedOccupancy > 80 ? 'var(--error)' : bedOccupancy > 60 ? 'var(--warning)' : 'var(--success)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <div className="text-xs text-muted mt-1">{bedOccupancy}% occupied</div>
        </div>

        {/* ICU Stats */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div style={{ 
              width: 36, 
              height: 36, 
              borderRadius: 'var(--radius-md)', 
              background: 'rgba(168, 85, 247, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Stethoscope size={18} style={{ color: 'rgb(168, 85, 247)' }} />
            </div>
            <span className="text-sm font-medium">ICU</span>
          </div>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, lineHeight: 1.2 }}>
            {currentReadiness.icuBedsAvailable || 0}
            <span className="text-muted" style={{ fontSize: 'var(--text-lg)', fontWeight: 400 }}>
              /{currentReadiness.icuBedsTotal || 0}
            </span>
          </div>
          <div className="text-xs text-muted mt-1">ICU beds available</div>
        </div>

        {/* Staff Stats */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div style={{ 
              width: 36, 
              height: 36, 
              borderRadius: 'var(--radius-md)', 
              background: 'rgba(34, 197, 94, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={18} style={{ color: 'rgb(34, 197, 94)' }} />
            </div>
            <span className="text-sm font-medium">Staff</span>
          </div>
          <div className="flex gap-4">
            <div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{currentReadiness.doctorsOnDuty || 0}</div>
              <div className="text-xs text-muted">Doctors</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{currentReadiness.nursesOnDuty || 0}</div>
              <div className="text-xs text-muted">Nurses</div>
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-2)' }}>
            <StatusBadge status={String(currentReadiness.staffingStatus)} />
          </div>
        </div>

        {/* Theatre Stats */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div style={{ 
              width: 36, 
              height: 36, 
              borderRadius: 'var(--radius-md)', 
              background: 'rgba(236, 72, 153, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Scissors size={18} style={{ color: 'rgb(236, 72, 153)' }} />
            </div>
            <span className="text-sm font-medium">Theatre</span>
          </div>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, lineHeight: 1.2 }}>
            {currentReadiness.operatingRoomsAvailable || 0}
          </div>
          <div className="text-xs text-muted mt-1">Operating rooms</div>
          {currentReadiness.theatreStatus && (
            <div style={{ marginTop: 'var(--space-2)' }}>
              <StatusBadge status={currentReadiness.theatreStatus} />
            </div>
          )}
        </div>
      </div>

      {/* Resource Status Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: 'var(--space-4)', 
        marginBottom: 'var(--space-6)' 
      }}>
        {/* Oxygen Status */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div style={{ 
                width: 44, 
                height: 44, 
                borderRadius: 'var(--radius-lg)', 
                background: getStatusBg(currentReadiness.oxygenStatus),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Wind size={22} style={{ color: getStatusColor(currentReadiness.oxygenStatus) }} />
              </div>
              <div>
                <div className="font-semibold">Oxygen Supply</div>
                <div className="text-xs text-muted">Medical grade O2</div>
              </div>
            </div>
            <StatusBadge status={currentReadiness.oxygenStatus} />
          </div>
          {currentReadiness.oxygenCylinders > 0 && (
            <div className="flex items-center gap-2 text-sm" style={{ 
              padding: 'var(--space-3)', 
              background: 'var(--accent)', 
              borderRadius: 'var(--radius-md)' 
            }}>
              <CheckCircle size={14} style={{ color: 'var(--success)' }} />
              <span>{currentReadiness.oxygenCylinders} cylinders available</span>
            </div>
          )}
        </div>

        {/* Blood Bank Status */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div style={{ 
                width: 44, 
                height: 44, 
                borderRadius: 'var(--radius-lg)', 
                background: getStatusBg(currentReadiness.bloodBankStatus),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Droplets size={22} style={{ color: getStatusColor(currentReadiness.bloodBankStatus) }} />
              </div>
              <div>
                <div className="font-semibold">Blood Bank</div>
                <div className="text-xs text-muted">All blood types</div>
              </div>
            </div>
            <StatusBadge status={currentReadiness.bloodBankStatus} />
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ 
            padding: 'var(--space-3)', 
            background: 'var(--accent)', 
            borderRadius: 'var(--radius-md)' 
          }}>
            <Syringe size={14} style={{ color: getStatusColor(currentReadiness.bloodBankStatus) }} />
            <span>{totalBloodUnits} total units in stock</span>
          </div>
        </div>

        {/* Emergency Supplies Status */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div style={{ 
                width: 44, 
                height: 44, 
                borderRadius: 'var(--radius-lg)', 
                background: getStatusBg(currentReadiness.emergencySuppliesStatus),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Package size={22} style={{ color: getStatusColor(currentReadiness.emergencySuppliesStatus) }} />
              </div>
              <div>
                <div className="font-semibold">Emergency Supplies</div>
                <div className="text-xs text-muted">Critical supplies</div>
              </div>
            </div>
            <StatusBadge status={currentReadiness.emergencySuppliesStatus} />
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ 
            padding: 'var(--space-3)', 
            background: 'var(--accent)', 
            borderRadius: 'var(--radius-md)' 
          }}>
            {String(currentReadiness.emergencySuppliesStatus).toUpperCase() === 'ADEQUATE' ? (
              <>
                <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                <span>All supplies stocked</span>
              </>
            ) : (
              <>
                <AlertCircle size={14} style={{ color: getStatusColor(currentReadiness.emergencySuppliesStatus) }} />
                <span>Supplies need attention</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Blood Bank Detail */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title" style={{ marginBottom: 0 }}>
            <Droplets size={16} />
            Blood Bank Inventory
          </h3>
          <div className="text-sm text-muted">
            {totalBloodUnits} total units
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 'var(--space-3)' }}>
          {bloodUnitsArray.map((blood) => (
            <div key={blood.type} style={{ 
              textAlign: 'center',
              padding: 'var(--space-4)',
              background: 'var(--accent)',
              borderRadius: 'var(--radius-lg)',
              border: `2px solid ${blood.units === 0 ? 'var(--error)' : 'transparent'}`
            }}>
              <div style={{ 
                fontSize: 'var(--text-sm)', 
                fontWeight: 600,
                color: blood.type.includes('-') ? 'rgb(236, 72, 153)' : 'rgb(239, 68, 68)',
                marginBottom: 'var(--space-2)'
              }}>
                {blood.type}
              </div>
              <div style={{ 
                fontSize: 'var(--text-2xl)', 
                fontWeight: 700,
                color: getBloodUnitColor(blood.units)
              }}>
                {blood.units}
              </div>
              <div className="text-xs text-muted">units</div>
            </div>
          ))}
        </div>
        {totalBloodUnits === 0 && (
          <div style={{ 
            marginTop: 'var(--space-4)',
            padding: 'var(--space-3)',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            color: 'var(--error)',
            fontSize: 'var(--text-sm)'
          }}>
            <AlertCircle size={16} />
            <span>Critical: No blood units in stock. Immediate restocking required.</span>
          </div>
        )}
      </div>

      {/* Report Info Footer */}
      <div className="card" style={{ 
        background: 'var(--accent)', 
        padding: 'var(--space-4)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Building2 size={14} className="text-muted" />
            <span>{currentReadiness.facilityName || 'Facility'}</span>
          </div>
          {currentReadiness.reportedBy && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Users size={14} />
              <span>Reported by {currentReadiness.reportedBy.firstName} {currentReadiness.reportedBy.lastName}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <Clock size={14} />
          <span>Report date: {new Date(currentReadiness.reportDate).toLocaleDateString()}</span>
        </div>
      </div>
    </>
  );
}
