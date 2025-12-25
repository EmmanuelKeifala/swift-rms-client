'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { userService, facilityService } from '@/lib/api';
import type { CreateUserRequest } from '@/types/user';
import { UserType } from '@/types';
import { 
  Users, 
  Plus,
  Search,
  MoreVertical,
  Shield,
  Building2,
  Phone,
  Mail,
  Check,
  X,
  Edit,
  Trash2
} from 'lucide-react';

const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().regex(/^\d{9}$/, 'Phone must be exactly 9 digits'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  userType: z.string().min(1, 'Role is required'),
  facilityId: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    SYSTEM_ADMIN: { bg: 'var(--error-light)', text: 'var(--error)' },
    HOSPITAL_DESK: { bg: 'var(--info-light)', text: 'var(--info)' },
    REFERRAL_COORDINATOR: { bg: 'var(--success-light)', text: 'var(--success)' },
    AMBULANCE_DISPATCH: { bg: 'var(--warning-light)', text: 'var(--warning)' },
    DISTRICT_HEALTH: { bg: 'rgba(121, 40, 202, 0.1)', text: 'var(--purple-500)' },
    NATIONAL_USER: { bg: 'var(--accent)', text: 'var(--foreground)' },
    PHU_STAFF: { bg: 'var(--accent)', text: 'var(--foreground)' },
    SPECIALIST: { bg: 'var(--info-light)', text: 'var(--info)' },
  };
  const c = colors[role] || colors.NATIONAL_USER;
  return (
    <span style={{ 
      padding: 'var(--space-1) var(--space-2)', 
      background: c.bg, 
      color: c.text,
      borderRadius: 'var(--radius-sm)',
      fontSize: 'var(--text-xs)',
      fontWeight: 500
    }}>
      {role.replace(/_/g, ' ')}
    </span>
  );
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [facilitySearch, setFacilitySearch] = useState('');
  const queryClient = useQueryClient();

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => userService.list(),
  });

  const { data: facilities = [] } = useQuery({
    queryKey: ['facilities', 'search', facilitySearch],
    queryFn: () => facilityService.search(facilitySearch),
    enabled: facilitySearch.length >= 2,
  });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: UserFormData) => userService.create({
      ...data,
      phone: `+232${data.phone}`,
      email: data.email || undefined,
      userType: data.userType as UserType,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setShowAddModal(false);
      reset();
    },
  });

  const users = usersData?.data || [];

  const filteredUsers = users.filter((u: any) => {
    const matchesSearch = !search || 
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);
    const matchesRole = !roleFilter || u.userType === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roles: UserType[] = [
    'SYSTEM_ADMIN', 
    'HOSPITAL_DESK', 
    'REFERRAL_COORDINATOR', 
    'AMBULANCE_DISPATCH', 
    'DISTRICT_HEALTH', 
    'NATIONAL_USER',
    'PHU_STAFF',
    'SPECIALIST'
  ];

  const selectedFacilityId = watch('facilityId');

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage system users and permissions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          Add User
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{users.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            {users.filter((u: any) => u.status === 'ACTIVE').length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Admins</div>
          <div className="stat-value">
            {users.filter((u: any) => u.userType === 'SYSTEM_ADMIN').length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Hospital Staff</div>
          <div className="stat-value">
            {users.filter((u: any) => u.userType === 'HOSPITAL_DESK').length}
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} className="search-box-icon" />
          <input
            type="text"
            className="search-box-input"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-box-kbd">/</span>
        </div>
        
        <div className="filter-divider" />
        
        <select 
          className="filter-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          {roles.map(role => (
            <option key={role} value={role}>{role.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Facility</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ width: 80 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user: any) => (
                <tr key={user.id}>
                  <td>
                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                  </td>
                  <td>
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 text-sm">
                        <Phone size={12} style={{ color: 'var(--muted)' }} />
                        {user.phone}
                      </span>
                      {user.email && (
                        <span className="flex items-center gap-2 text-sm text-muted">
                          <Mail size={12} />
                          {user.email}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <RoleBadge role={user.userType} />
                  </td>
                  <td className="text-sm text-muted">
                    {user.facility ? (
                      <span className="flex items-center gap-2">
                        <Building2 size={12} />
                        {user.facility.name}
                      </span>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td>
                    {user.status === 'ACTIVE' ? (
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--success)' }}>
                        <Check size={12} />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted)' }}>
                        <X size={12} />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="text-muted text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-sm btn-icon">
                        <Edit size={14} />
                      </button>
                      <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--error)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <>
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 999,
            }}
            onClick={() => setShowAddModal(false)}
          />
          <div style={{
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
          }}>
            <div style={{ 
              padding: 'var(--space-6)',
              borderBottom: '1px solid var(--border)',
            }}>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>Add New User</h2>
            </div>

            <form onSubmit={handleSubmit((data) => createMutation.mutate(data))}>
              <div style={{ padding: 'var(--space-6)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input 
                      type="text" 
                      className={`form-input ${errors.firstName ? 'error' : ''}`} 
                      {...register('firstName')}
                    />
                    {errors.firstName && <span className="form-error">{errors.firstName.message}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input 
                      type="text" 
                      className={`form-input ${errors.lastName ? 'error' : ''}`} 
                      {...register('lastName')}
                    />
                    {errors.lastName && <span className="form-error">{errors.lastName.message}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <div className="phone-input-wrapper">
                    <span className="phone-prefix">+232</span>
                    <input 
                      type="tel" 
                      className={`form-input ${errors.phone ? 'error' : ''}`} 
                      placeholder="76000002" 
                      maxLength={9} 
                      {...register('phone')}
                    />
                  </div>
                  {errors.phone && <span className="form-error">{errors.phone.message}</span>}
                  <span className="form-hint">9 digits (e.g., 76000002)</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Email (Optional)</label>
                  <input 
                    type="email" 
                    className={`form-input ${errors.email ? 'error' : ''}`} 
                    {...register('email')}
                  />
                  {errors.email && <span className="form-error">{errors.email.message}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input 
                    type="password" 
                    className={`form-input ${errors.password ? 'error' : ''}`} 
                    {...register('password')}
                  />
                  {errors.password && <span className="form-error">{errors.password.message}</span>}
                  <span className="form-hint">Minimum 8 characters</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <select className={`form-input ${errors.userType ? 'error' : ''}`} {...register('userType')}>
                    <option value="">Select role...</option>
                    {roles.map(role => (
                      <option key={role} value={role}>{role.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                  {errors.userType && <span className="form-error">{errors.userType.message}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Facility (Optional)</label>
                  <div className="search-box">
                    <Search size={16} className="search-box-icon" />
                    <input 
                      type="text" 
                      className="search-box-input" 
                      placeholder="Search facility..." 
                      value={facilitySearch}
                      onChange={(e) => setFacilitySearch(e.target.value)}
                    />
                  </div>
                  {facilities.length > 0 && (
                    <div style={{
                      marginTop: 'var(--space-2)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      maxHeight: 200,
                      overflow: 'auto'
                    }}>
                      {facilities.map((facility: any) => (
                        <div 
                          key={facility.id}
                          onClick={() => {
                            setValue('facilityId', facility.id);
                            setFacilitySearch(facility.name);
                          }}
                          style={{
                            padding: 'var(--space-3)',
                            cursor: 'pointer',
                            background: selectedFacilityId === facility.id ? 'var(--accent)' : 'transparent',
                          }}
                          className="hover-bg"
                        >
                          <div className="font-medium">{facility.name}</div>
                          <div className="text-sm text-muted">{facility.type}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {createMutation.isError && (
                  <div className="auth-error">
                    Failed to create user. Please try again.
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
                  onClick={() => setShowAddModal(false)}
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
                      Create User
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
