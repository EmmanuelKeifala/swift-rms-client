'use client';

import { use } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { facilityService } from '@/lib/api';
import { 
  ArrowLeft, 
  Building2, 
  MapPin,
  Phone,
  BedDouble,
  Users,
  Activity,
  Edit,
  ExternalLink
} from 'lucide-react';

// Dynamic import for map to avoid SSR issues
const SingleFacilityMap = dynamic(
  () => import('@/components/SingleFacilityMap'),
  { 
    ssr: false,
    loading: () => (
      <div style={{ 
        height: 220, 
        background: 'var(--accent)', 
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--muted)'
      }}>
        Loading map...
      </div>
    )
  }
);

interface Props {
  params: Promise<{ id: string }>;
}

export default function FacilityDetailPage({ params }: Props) {
  const { id } = use(params);

  const { data: facility, isLoading } = useQuery({
    queryKey: ['facility', id],
    queryFn: () => facilityService.get(id),
  });

  const { data: referralCount } = useQuery({
    queryKey: ['facility-referrals', id],
    queryFn: () => facilityService.getReferralCount(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
        <p className="text-muted">Facility not found</p>
        <Link href="/facilities" className="btn btn-primary mt-4">Back to Facilities</Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <Link href="/facilities" className="flex items-center gap-1 text-sm text-muted">
          <ArrowLeft size={14} />
          Back to Facilities
        </Link>
      </div>

      <div className="page-header">
        <div className="flex items-center gap-4">
          <div style={{ 
            width: 64, 
            height: 64, 
            background: 'var(--accent)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Building2 size={28} style={{ color: 'var(--muted)' }} />
          </div>
          <div>
            <h1 className="page-title">{facility.name}</h1>
            <p className="page-subtitle">{facility.facilityType} | {facility.district?.name}</p>
          </div>
        </div>
        <button className="btn btn-secondary">
          <Edit size={16} />
          Edit
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <BedDouble size={16} style={{ color: 'var(--muted)' }} />
            <div className="stat-label">Level</div>
          </div>
          <div className="stat-value">{facility.level}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <Users size={16} style={{ color: 'var(--muted)' }} />
            <div className="stat-label">Services</div>
          </div>
          <div className="stat-value">{facility.services?.length || 0}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <Activity size={16} style={{ color: 'var(--muted)' }} />
            <div className="stat-label">Total Referrals</div>
          </div>
          <div className="stat-value">{referralCount ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <div style={{ width: 16, height: 16, background: 'var(--success)', borderRadius: '50%' }} />
            <div className="stat-label">Status</div>
          </div>
          <div className="stat-value text-sm">Active</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="col-6">
          <div className="card">
            <h3 className="card-title mb-4">
              <Building2 size={16} />
              Facility Information
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between">
                <span className="text-muted">Name</span>
                <span className="font-medium">{facility.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Code</span>
                <span>{facility.facilityCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Type</span>
                <span>{facility.facilityType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">District</span>
                <span>{facility.district?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Region</span>
                <span>{facility.district?.region?.name || 'N/A'}</span>
              </div>
              {facility.phone && (
                <div className="flex justify-between">
                  <span className="text-muted">Phone</span>
                  <a href={`tel:${facility.phone}`} className="link">{facility.phone}</a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-6">
          <div className="card">
            <h3 className="card-title mb-4">
              <MapPin size={16} />
              Location
            </h3>
            {facility.latitude && facility.longitude ? (
              <>
                <div style={{ height: 220, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <SingleFacilityMap
                    latitude={facility.latitude}
                    longitude={facility.longitude}
                    name={facility.name}
                    type={facility.facilityType}
                    code={facility.facilityCode}
                  />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="text-xs text-muted">
                    {facility.latitude.toFixed(6)}, {facility.longitude.toFixed(6)}
                  </div>
                  <a 
                    href={`https://www.google.com/maps?q=${facility.latitude},${facility.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-secondary"
                  >
                    <ExternalLink size={12} />
                    Open in Google Maps
                  </a>
                </div>
              </>
            ) : (
              <div style={{ 
                height: 220, 
                background: 'var(--accent)', 
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--muted)'
              }}>
                No coordinates available
              </div>
            )}
          </div>
        </div>

        <div className="col-12">
          <div className="card">
            <h3 className="card-title mb-4">Services & Capabilities</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {(facility.services && facility.services.length > 0) ? (
                facility.services.map((service) => (
                  <span 
                    key={service}
                    style={{ 
                      padding: 'var(--space-2) var(--space-3)',
                      background: 'var(--accent)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--text-sm)'
                    }}
                  >
                    {service}
                  </span>
                ))
              ) : (
                <span className="text-muted">No services listed</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

