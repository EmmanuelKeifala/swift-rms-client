'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store';
import { 
  User, 
  Phone,
  Mail,
  Building2,
  Shield,
  Calendar,
  Edit,
  Camera,
  Save
} from 'lucide-react';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
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
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">View and update your profile information</p>
        </div>
        <button 
          className={`btn ${isEditing ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <>
              <Save size={16} />
              Save Changes
            </>
          ) : (
            <>
              <Edit size={16} />
              Edit Profile
            </>
          )}
        </button>
      </div>

      <div className="dashboard-grid">
        {/* Profile Card */}
        <div className="col-4" style={{ gridColumn: 'span 4' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{ 
                width: 96, 
                height: 96, 
                background: 'var(--foreground)',
                color: 'var(--background)',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-3xl)',
                fontWeight: 700,
                margin: '0 auto'
              }}>
                {user.firstName[0]}{user.lastName[0]}
              </div>
              {isEditing && (
                <button 
                  style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    right: -8,
                    width: 32,
                    height: 32,
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Camera size={14} />
                </button>
              )}
            </div>
            <h3 className="font-semibold mt-4">{user.firstName} {user.lastName}</h3>
            <p className="text-sm text-muted">{user.userType.replace(/_/g, ' ')}</p>
            
            {user.facility && (
              <div className="flex items-center justify-center gap-2 mt-3 text-sm text-muted">
                <Building2 size={14} />
                {user.facility.name}
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="col-8" style={{ gridColumn: 'span 8' }}>
          <div className="card">
            <h3 className="card-title mb-4">
              <User size={16} />
              Personal Information
            </h3>

            {isEditing ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input type="text" className="form-input" defaultValue={user.firstName} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input type="text" className="form-input" defaultValue={user.lastName} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="tel" className="form-input" defaultValue={user.phone} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email (Optional)</label>
                  <input type="email" className="form-input" placeholder="email@example.com" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 p-3" style={{ background: 'var(--accent)', borderRadius: 'var(--radius-md)' }}>
                  <User size={18} style={{ color: 'var(--muted)' }} />
                  <div>
                    <div className="text-xs text-muted">Full Name</div>
                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3" style={{ background: 'var(--accent)', borderRadius: 'var(--radius-md)' }}>
                  <Phone size={18} style={{ color: 'var(--muted)' }} />
                  <div>
                    <div className="text-xs text-muted">Phone Number</div>
                    <div className="font-medium">{user.phone}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3" style={{ background: 'var(--accent)', borderRadius: 'var(--radius-md)' }}>
                  <Shield size={18} style={{ color: 'var(--muted)' }} />
                  <div>
                    <div className="text-xs text-muted">Role</div>
                    <div className="font-medium">{user.userType.replace(/_/g, ' ')}</div>
                  </div>
                </div>

                {user.facility && (
                  <div className="flex items-center gap-3 p-3" style={{ background: 'var(--accent)', borderRadius: 'var(--radius-md)' }}>
                    <Building2 size={18} style={{ color: 'var(--muted)' }} />
                    <div>
                      <div className="text-xs text-muted">Facility</div>
                      <div className="font-medium">{user.facility.name}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3" style={{ background: 'var(--accent)', borderRadius: 'var(--radius-md)' }}>
                  <Calendar size={18} style={{ color: 'var(--muted)' }} />
                  <div>
                    <div className="text-xs text-muted">Member Since</div>
                    <div className="font-medium">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Activity */}
        <div className="col-12">
          <div className="card">
            <h3 className="card-title mb-4">Recent Activity</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 p-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 8, height: 8, background: 'var(--success)', borderRadius: '50%' }} />
                <div style={{ flex: 1 }}>
                  <div className="text-sm">Accepted referral REF-2024-001</div>
                  <div className="text-xs text-muted">2 hours ago</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 8, height: 8, background: 'var(--info)', borderRadius: '50%' }} />
                <div style={{ flex: 1 }}>
                  <div className="text-sm">Created new referral for patient John Doe</div>
                  <div className="text-xs text-muted">4 hours ago</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3">
                <div style={{ width: 8, height: 8, background: 'var(--muted)', borderRadius: '50%' }} />
                <div style={{ flex: 1 }}>
                  <div className="text-sm">Updated facility readiness status</div>
                  <div className="text-xs text-muted">Yesterday</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
