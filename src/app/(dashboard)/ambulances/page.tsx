'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ambulanceService, facilityService } from '@/lib/api';
import type { Ambulance, CreateAmbulanceRequest, AmbulanceStatus } from '@/lib/api/ambulances';
import { 
  Ambulance as AmbulanceIcon, 
  MapPin,
  Phone,
  User,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  Plus,
  X,
  Wrench,
  AlertOctagon
} from 'lucide-react';

const ambulanceSchema = z.object({
  ambulanceId: z.string().min(1, 'Ambulance ID is required').max(50),
  facilityId: z.string().optional(),
  status: z.enum(['AVAILABLE', 'ON_MISSION', 'MAINTENANCE', 'OUT_OF_SERVICE']).optional(),
  phone: z.string().optional(),
  equipment: z.string().optional(),
  crewMembers: z.string().optional(),
});

type AmbulanceFormData = z.infer<typeof ambulanceSchema>;

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    AVAILABLE: { bg: 'rgba(34, 197, 94, 0.1)', text: 'var(--success)', icon: <CheckCircle2 size={12} /> },
    ON_MISSION: { bg: 'rgba(59, 130, 246, 0.1)', text: 'var(--primary)', icon: <Navigation size={12} /> },
    MAINTENANCE: { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--warning)', icon: <Wrench size={12} /> },
    OUT_OF_SERVICE: { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--error)', icon: <AlertOctagon size={12} /> },
  };
  const c = colors[status] || colors.OUT_OF_SERVICE;
  return (
    <span style={{ 
      padding: 'var(--space-1) var(--space-2)', 
      background: c.bg, 
      color: c.text,
      borderRadius: 'var(--radius-sm)',
      fontSize: 'var(--text-xs)',
      fontWeight: 500,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-1)'
    }}>
      {c.icon}
      {status.replace('_', ' ')}
    </span>
  );
}

export default function AmbulancesPage() {
  const [selected, setSelected] = useState<Ambulance | null>(null);
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch ambulances
  const { data: ambulancesData, isLoading: ambulancesLoading } = useQuery({
    queryKey: ['ambulances'],
    queryFn: () => ambulanceService.list({ limit: 100 }),
  });

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['ambulance-stats'],
    queryFn: () => ambulanceService.getStats(),
  });

  // Fetch facilities for dropdown
  const { data: facilitiesData } = useQuery({
    queryKey: ['facilities-dropdown'],
    queryFn: () => facilityService.list({ limit: 500 }),
  });

  const ambulances = ambulancesData?.data || [];
  const facilities = facilitiesData?.data || [];

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AmbulanceFormData>({
    resolver: zodResolver(ambulanceSchema),
    defaultValues: {
      status: 'AVAILABLE',
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateAmbulanceRequest) => ambulanceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ambulances'] });
      queryClient.invalidateQueries({ queryKey: ['ambulance-stats'] });
      setShowModal(false);
      reset();
    },
  });

  const onSubmit = (data: AmbulanceFormData) => {
    const request: CreateAmbulanceRequest = {
      ambulanceId: data.ambulanceId,
      facilityId: data.facilityId || undefined,
      status: data.status as AmbulanceStatus,
      phone: data.phone || undefined,
      equipment: data.equipment ? data.equipment.split(',').map(e => e.trim()).filter(Boolean) : undefined,
      crewMembers: data.crewMembers ? data.crewMembers.split(',').map(c => c.trim()).filter(Boolean) : undefined,
    };
    createMutation.mutate(request);
  };

  const isLoading = ambulancesLoading || statsLoading;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Ambulances</h1>
          <p className="page-subtitle">Fleet management and tracking</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Add Ambulance
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-label">Total Fleet</div>
          <div className="stat-value">{stats?.total || 0}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
            <div className="stat-label">Available</div>
          </div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{stats?.available || 0}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <Navigation size={14} style={{ color: 'var(--primary)' }} />
            <div className="stat-label">On Mission</div>
          </div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{stats?.onMission || 0}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <Wrench size={14} style={{ color: 'var(--warning)' }} />
            <div className="stat-label">Maintenance</div>
          </div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats?.maintenance || 0}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} style={{ color: 'var(--error)' }} />
            <div className="stat-label">Out of Service</div>
          </div>
          <div className="stat-value" style={{ color: 'var(--error)' }}>{stats?.outOfService || 0}</div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : ambulances.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <AmbulanceIcon size={48} style={{ color: 'var(--muted)', margin: '0 auto var(--space-4)' }} />
          <h3 style={{ marginBottom: 'var(--space-2)' }}>No Ambulances Yet</h3>
          <p className="text-muted" style={{ marginBottom: 'var(--space-4)' }}>
            Add your first ambulance to start managing your fleet.
          </p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            Add Ambulance
          </button>
        </div>
      ) : (
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
                        background: amb.status === 'AVAILABLE' ? 'rgba(34, 197, 94, 0.1)' : 'var(--accent)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <AmbulanceIcon size={24} style={{ color: amb.status === 'AVAILABLE' ? 'var(--success)' : 'var(--muted)' }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{amb.ambulanceId}</span>
                          <StatusBadge status={amb.status} />
                        </div>
                        <div className="text-sm text-muted">
                          {amb.facility?.name || 'Unassigned'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {amb.latitude && amb.longitude && (
                        <div className="flex items-center gap-1 text-sm text-muted">
                          <MapPin size={14} />
                          <span>{Number(amb.latitude).toFixed(4)}, {Number(amb.longitude).toFixed(4)}</span>
                        </div>
                      )}
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
                      <AmbulanceIcon size={28} style={{ color: 'var(--muted)' }} />
                    </div>
                    <div>
                      <div className="font-semibold">{selected.ambulanceId}</div>
                      <StatusBadge status={selected.status} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3" style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)' }}>
                    {selected.phone && (
                      <div>
                        <div className="text-xs text-muted mb-1">Phone</div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} style={{ color: 'var(--muted)' }} />
                          <a href={`tel:${selected.phone}`} className="text-sm link">{selected.phone}</a>
                        </div>
                      </div>
                    )}
                    {selected.facility && (
                      <div>
                        <div className="text-xs text-muted mb-1">Assigned Facility</div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} style={{ color: 'var(--muted)' }} />
                          <span className="text-sm">{selected.facility.name}</span>
                        </div>
                      </div>
                    )}
                    {selected.crewMembers && selected.crewMembers.length > 0 && (
                      <div>
                        <div className="text-xs text-muted mb-1">Crew Members</div>
                        <div className="flex flex-wrap gap-1">
                          {selected.crewMembers.map((crew, i) => (
                            <span key={i} style={{
                              padding: 'var(--space-1) var(--space-2)',
                              background: 'var(--accent)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: 'var(--text-xs)'
                            }}>
                              {crew}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selected.equipment && selected.equipment.length > 0 && (
                      <div>
                        <div className="text-xs text-muted mb-1">Equipment</div>
                        <div className="flex flex-wrap gap-1">
                          {selected.equipment.map((equip, i) => (
                            <span key={i} style={{
                              padding: 'var(--space-1) var(--space-2)',
                              background: 'rgba(59, 130, 246, 0.1)',
                              color: 'var(--primary)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: 'var(--text-xs)'
                            }}>
                              {equip}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selected.latitude && selected.longitude && (
                      <div>
                        <div className="text-xs text-muted mb-1">Location</div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} style={{ color: 'var(--muted)' }} />
                          <span className="text-sm">{Number(selected.latitude).toFixed(5)}, {Number(selected.longitude).toFixed(5)}</span>
                        </div>
                      </div>
                    )}
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
      )}

      {/* Add Ambulance Modal */}
      {showModal && (
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
          <div className="card" style={{ maxWidth: 520, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="card-title">Add New Ambulance</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label className="form-label">Ambulance ID *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g., AMB-001"
                  {...register('ambulanceId')}
                />
                {errors.ambulanceId && <p className="form-error">{errors.ambulanceId.message}</p>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Assigned Facility</label>
                <select className="form-input" {...register('facilityId')}>
                  <option value="">-- Select Facility --</option>
                  {facilities.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" {...register('status')}>
                  <option value="AVAILABLE">Available</option>
                  <option value="ON_MISSION">On Mission</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="e.g., +232 76 123 456"
                  {...register('phone')}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Equipment</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Comma separated (e.g., AED, Oxygen, Stretcher)"
                  {...register('equipment')}
                />
                <p className="text-xs text-muted mt-1">Separate multiple items with commas</p>
              </div>

              <div className="form-group">
                <label className="form-label">Crew Members</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Comma separated names"
                  {...register('crewMembers')}
                />
                <p className="text-xs text-muted mt-1">Separate multiple names with commas</p>
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Ambulance'}
                </button>
              </div>
              {createMutation.isError && (
                <p className="form-error mt-2">Failed to create ambulance. Please try again.</p>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
