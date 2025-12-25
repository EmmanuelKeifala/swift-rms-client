'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { facilityService, districtService } from '@/lib/api';
import type { District } from '@/lib/api/districts';
import { FacilityType } from '@/types';
import { 
  Search, 
  Building2,
  MapPin,
  Phone,
  Activity,
  Plus,
  X
} from 'lucide-react';

const facilitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  facilityCode: z.string().min(1, 'Code is required'),
  facilityType: z.string().min(1, 'Type is required'),
  level: z.number().min(1).max(4),
  districtId: z.string().min(1, 'District is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type FacilityFormData = z.infer<typeof facilitySchema>;

export default function FacilitiesPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: facilities, isLoading } = useQuery({
    queryKey: ['facilities', search],
    queryFn: () => facilityService.search(search),
    enabled: search.length >= 2 || search.length === 0,
  });

  const { data: districts = [] } = useQuery({
    queryKey: ['districts'],
    queryFn: () => districtService.list(),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FacilityFormData>({
    resolver: zodResolver(facilitySchema),
    defaultValues: {
      level: 1,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: FacilityFormData) => facilityService.create({
      ...data,
      facilityType: data.facilityType as FacilityType,
      email: data.email || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      setShowModal(false);
      reset();
    },
  });

  const filteredFacilities = facilities?.filter(f => 
    !typeFilter || f.type === typeFilter
  ) || [];

  const facilityTypes: FacilityType[] = ['PHU', 'DISTRICT_HOSPITAL', 'REGIONAL_HOSPITAL', 'TERTIARY_HOSPITAL'];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Facilities</h1>
          <p className="page-subtitle">Healthcare facilities directory</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          New Facility
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} className="search-box-icon" />
          <input
            type="text"
            className="search-box-input"
            placeholder="Search facilities by name or district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-box-kbd">/</span>
        </div>
        
        <div className="filter-divider" />
        
        <select 
          className="filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          {facilityTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : !filteredFacilities.length ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--muted)', padding: 'var(--space-12)' }}>
          No facilities found
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-5)' }}>
          {filteredFacilities.map((facility) => (
            <Link key={facility.id} href={`/facilities/${facility.id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ height: '100%', transition: 'all var(--duration-fast) var(--ease)' }}>
                <div className="flex items-start gap-4 mb-4">
                  <div style={{ 
                    width: 48, 
                    height: 48, 
                    background: 'var(--accent)', 
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Building2 size={24} style={{ color: 'var(--muted)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="font-semibold" style={{ marginBottom: 'var(--space-1)' }}>{facility.name}</div>
                    <span style={{ 
                      display: 'inline-block',
                      padding: 'var(--space-1) var(--space-2)',
                      background: 'var(--accent)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 500
                    }}>
                      {facility.type}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-sm text-muted">
                    <MapPin size={16} />
                    <span>{facility.district?.name || 'Unknown District'}</span>
                  </div>
                  {facility.phone && (
                    <div className="flex items-center gap-3 text-sm text-muted">
                      <Phone size={16} />
                      <span>{facility.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2 text-sm">
                    <Activity size={14} style={{ color: 'var(--muted)' }} />
                    <span>{facility.services?.length || 0} services</span>
                  </div>
                  <span style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-1)',
                    fontSize: 'var(--text-xs)',
                    color: facility.isActive ? 'var(--success)' : 'var(--muted)'
                  }}>
                    <span style={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%',
                      background: facility.isActive ? 'var(--success)' : 'var(--muted)'
                    }} />
                    {facility.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <>
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
            }}
            onClick={() => setShowModal(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'var(--background)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              width: '90%',
              maxWidth: 600,
              maxHeight: '90vh',
              overflow: 'auto',
              zIndex: 1000,
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ 
              padding: 'var(--space-6)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>New Facility</h2>
              <button 
                className="btn btn-ghost btn-icon btn-sm"
                onClick={() => setShowModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit((data) => createMutation.mutate(data))}>
              <div style={{ padding: 'var(--space-6)' }}>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    {...register('name')}
                  />
                  {errors.name && <span className="form-error">{errors.name.message}</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Code *</label>
                    <input
                      type="text"
                      className={`form-input ${errors.facilityCode ? 'error' : ''}`}
                      {...register('facilityCode')}
                    />
                    {errors.facilityCode && <span className="form-error">{errors.facilityCode.message}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Type *</label>
                    <select className={`form-input ${errors.facilityType ? 'error' : ''}`} {...register('facilityType')}>
                      <option value="">Select type...</option>
                      {facilityTypes.map(type => (
                        <option key={type} value={type}>{type.replace('_', ' ')}</option>
                      ))}
                    </select>
                    {errors.facilityType && <span className="form-error">{errors.facilityType.message}</span>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Level *</label>
                    <input
                      type="number"
                      className={`form-input ${errors.level ? 'error' : ''}`}
                      min="1"
                      max="4"
                      {...register('level', { valueAsNumber: true })}
                    />
                    {errors.level && <span className="form-error">{errors.level.message}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">District *</label>
                    <select className={`form-input ${errors.districtId ? 'error' : ''}`} {...register('districtId')}>
                      <option value="">Select district...</option>
                      {districts.map(district => (
                        <option key={district.id} value={district.id}>{district.name}</option>
                      ))}
                    </select>
                    {errors.districtId && <span className="form-error">{errors.districtId.message}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-input"
                    {...register('address')}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-input"
                      {...register('phone')}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      {...register('email')}
                    />
                    {errors.email && <span className="form-error">{errors.email.message}</span>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      className="form-input"
                      {...register('latitude', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      className="form-input"
                      {...register('longitude', { valueAsNumber: true })}
                    />
                  </div>
                </div>



                {createMutation.isError && (
                  <div className="auth-error">
                    Failed to create facility. Please try again.
                  </div>
                )}
              </div>

              <div style={{ 
                padding: 'var(--space-6)',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                gap: 'var(--space-2)',
                justifyContent: 'flex-end'
              }}>
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Create Facility
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}
