'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { patientService } from '@/lib/api';
import { DataTable } from '@/components/ui';
import { 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  User,
  Phone,
  MapPin,
  Calendar,
  RefreshCw,
  UserPlus,
  AlertCircle,
  Filter,
  Download
} from 'lucide-react';
import { Patient } from '@/types';

// UX Decision: Avatar with gradient background based on name for visual distinction
function PatientAvatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';
  
  // Generate consistent color based on name
  const colors = [
    'linear-gradient(135deg, #3B82F6, #8B5CF6)',
    'linear-gradient(135deg, #06B6D4, #3B82F6)',
    'linear-gradient(135deg, #8B5CF6, #EC4899)',
    'linear-gradient(135deg, #14B8A6, #06B6D4)',
    'linear-gradient(135deg, #F59E0B, #EF4444)',
    'linear-gradient(135deg, #22C55E, #14B8A6)',
  ];
  
  const colorIndex = name.length % colors.length;
  
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: colors[colorIndex],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${size * 0.35}px`,
      fontWeight: 700,
      color: 'white',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

// UX Decision: Gender badge with appropriate colors
function GenderBadge({ gender }: { gender: string }) {
  const config: Record<string, { bg: string; color: string }> = {
    MALE: { bg: 'rgba(59, 130, 246, 0.1)', color: 'var(--blue-600)' },
    FEMALE: { bg: 'rgba(236, 72, 153, 0.1)', color: 'var(--pink-500)' },
  };
  
  const style = config[gender?.toUpperCase()] || { bg: 'var(--accent)', color: 'var(--muted)' };
  
  return (
    <span style={{
      padding: '4px 10px',
      borderRadius: '6px',
      background: style.bg,
      color: style.color,
      fontSize: '12px',
      fontWeight: 500,
    }}>
      {gender || 'Unknown'}
    </span>
  );
}

export default function PatientsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');

  const { data: listData, isLoading: listLoading, refetch, isFetching } = useQuery({
    queryKey: ['patients', 'list', page, limit],
    queryFn: () => patientService.list({ page, limit }),
    enabled: !search,
  });

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['patients', 'search', search],
    queryFn: () => patientService.search({ q: search }),
    enabled: !!search,
  });

  const patients: Patient[] = search ? (searchData || []) : (listData?.data || []);
  const isLoading = search ? searchLoading : listLoading;
  const meta = listData?.meta;
  const totalPages = meta?.totalPages || 1;

  const columnHelper = createColumnHelper<Patient>();
  
  // UX Decision: Patient column with avatar and ID preview for quick identification
  const columns = useMemo<ColumnDef<Patient, any>[]>(() => [
    columnHelper.accessor(row => `${row.firstName} ${row.lastName}`, {
      id: 'name',
      header: 'Patient',
      cell: info => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <PatientAvatar name={info.getValue()} size={42} />
          <div>
            <Link 
              href={`/patients/${info.row.original.id}`}
              style={{ 
                fontWeight: 600, 
                fontSize: '14px',
                color: 'var(--foreground)',
                textDecoration: 'none',
              }}
              className="link"
            >
              {info.getValue()}
            </Link>
            <div style={{ 
              fontSize: '11px', 
              color: 'var(--muted)',
              marginTop: '2px',
              fontFamily: 'var(--font-mono)',
            }}>
              ID: {info.row.original.id.slice(0, 8)}...
            </div>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('phone', {
      header: 'Contact',
      cell: info => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Phone size={12} style={{ color: 'var(--green-500)' }} />
          </div>
          <span style={{ fontSize: '13px' }}>{info.getValue() || 'Not provided'}</span>
        </div>
      ),
    }),
    columnHelper.accessor('address', {
      header: 'Address',
      cell: info => (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          maxWidth: '200px' 
        }}>
          <MapPin size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          <span style={{ 
            color: 'var(--muted)', 
            fontSize: '13px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {info.getValue() || 'Not provided'}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor('dateOfBirth', {
      header: 'Date of Birth',
      cell: info => {
        const dob = info.getValue();
        if (!dob) return <span style={{ color: 'var(--muted)' }}>Unknown</span>;
        
        const date = new Date(dob);
        const age = Math.floor((Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        
        return (
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              fontSize: '13px'
            }}>
              <Calendar size={12} style={{ color: 'var(--muted)' }} />
              {date.toLocaleDateString()}
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: 'var(--muted)',
              marginTop: '2px'
            }}>
              {age} years old
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor('gender', {
      header: 'Gender',
      cell: info => <GenderBadge gender={info.getValue()} />,
    }),
    columnHelper.display({
      id: 'actions',
      cell: info => (
        <Link 
          href={`/patients/${info.row.original.id}`} 
          className="btn btn-ghost btn-sm"
        >
          View Profile
        </Link>
      ),
    }),
  ], []);

  return (
    <>
      {/* Page Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: 'space-between',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '26px', 
            fontWeight: 700, 
            letterSpacing: '-0.02em',
            marginBottom: '6px'
          }}>
            Patients
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
            Manage patient records and medical histories
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw size={16} style={{ 
              animation: isFetching ? 'spin 1s linear infinite' : 'none' 
            }} />
            Refresh
          </button>
          <Link href="/patients/new" className="btn btn-primary">
            <UserPlus size={16} />
            Register Patient
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <User size={20} style={{ color: 'var(--blue-500)' }} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>
                {meta?.total?.toLocaleString() || patients.length}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Total Patients</div>
            </div>
          </div>
        </div>
        
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <UserPlus size={20} style={{ color: 'var(--green-500)' }} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>
                {patients.filter(p => {
                  const created = new Date(p.createdAt || 0);
                  const now = new Date();
                  return created.getMonth() === now.getMonth() && 
                         created.getFullYear() === now.getFullYear();
                }).length}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>New This Month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card" style={{ 
        padding: '16px 20px', 
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <div style={{ 
          flex: 1, 
          minWidth: '280px',
          position: 'relative'
        }}>
          <Search 
            size={16} 
            style={{ 
              position: 'absolute', 
              left: '14px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: 'var(--muted)' 
            }} 
          />
          <input
            type="text"
            className="form-input"
            style={{ 
              paddingLeft: '42px',
              height: '42px',
              borderRadius: '10px',
            }}
            placeholder="Search by name, phone, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ 
          width: '1px', 
          height: '28px', 
          background: 'var(--border)',
        }} />

        <button className="btn btn-secondary btn-sm">
          <Filter size={14} />
          Filters
        </button>

        <button className="btn btn-secondary btn-sm">
          <Download size={14} />
          Export
        </button>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="card" style={{ 
          padding: '80px', 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div className="spinner spinner-lg" />
          <span style={{ color: 'var(--muted)', fontSize: '14px' }}>Loading patients...</span>
        </div>
      ) : patients.length === 0 ? (
        <div className="card" style={{ 
          padding: '80px', 
          textAlign: 'center',
        }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--gray-100), var(--gray-50))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <User size={28} style={{ color: 'var(--muted)' }} />
          </div>
          <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '6px' }}>
            {search ? 'No patients found' : 'No patients registered yet'}
          </div>
          <p style={{ color: 'var(--muted)', marginBottom: '20px', maxWidth: '400px', margin: '0 auto 20px' }}>
            {search 
              ? 'Try adjusting your search terms or clearing the search' 
              : 'Register your first patient to get started with referral management'}
          </p>
          {!search && (
            <Link href="/patients/new" className="btn btn-primary">
              <UserPlus size={16} />
              Register First Patient
            </Link>
          )}
        </div>
      ) : (
        <DataTable 
          data={patients} 
          columns={columns}
          globalFilter={search}
          onGlobalFilterChange={setSearch}
          emptyMessage="No patients found"
          emptyDescription="Try a different search term"
        />
      )}

      {/* Pagination */}
      {!search && patients.length > 0 && meta && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginTop: '20px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <span style={{ fontSize: '14px', color: 'var(--muted)' }}>
            Showing <strong>{((page - 1) * limit) + 1}</strong> - <strong>{Math.min(page * limit, meta.total)}</strong> of <strong>{meta.total}</strong> patients
          </span>
          
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button 
                className="btn btn-secondary btn-sm btn-icon"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                style={{ opacity: page === 1 ? 0.5 : 1 }}
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    className={`btn btn-sm ${page === pageNum ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setPage(pageNum)}
                    style={{ minWidth: '36px' }}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button 
                className="btn btn-secondary btn-sm btn-icon"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                style={{ opacity: page === totalPages ? 0.5 : 1 }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
