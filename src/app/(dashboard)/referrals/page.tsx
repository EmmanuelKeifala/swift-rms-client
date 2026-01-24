'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { referralService } from '@/lib/api';
import { ReferralStatus, Priority, ReferralType } from '@/types';
import { DataTable } from '@/components/ui';
import { 
  Plus, 
  Circle, 
  ChevronLeft, 
  ChevronRight,
  Download,
  X,
  Search,
  Filter,
  ArrowRight,
  Building2,
  Clock,
  SlidersHorizontal,
  LayoutGrid,
  List,
  RefreshCw
} from 'lucide-react';

interface Referral {
  id: string;
  referralCode: string;
  priority: string;
  patient?: {
    firstName: string;
    lastName: string;
  };
  referralType: string;
  sendingFacility?: {
    name: string;
  };
  receivingFacility?: {
    name: string;
  };
  status: string;
  createdAt: string;
}

// UX Decision: Priority pills with semantic colors for instant recognition
// Shape: Pill (borderRadius 20px) for soft, non-threatening appearance
function PriorityPill({ priority }: { priority: string }) {
  const config: Record<string, { color: string; bg: string; border: string }> = {
    CRITICAL: { 
      color: 'var(--red-600)', 
      bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(239, 68, 68, 0.06) 100%)',
      border: 'rgba(239, 68, 68, 0.2)'
    },
    HIGH: { 
      color: 'var(--amber-600)', 
      bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.06) 100%)',
      border: 'rgba(245, 158, 11, 0.2)'
    },
    MEDIUM: { 
      color: 'var(--blue-600)', 
      bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.06) 100%)',
      border: 'rgba(59, 130, 246, 0.2)'
    },
    LOW: { 
      color: 'var(--green-600)', 
      bg: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(34, 197, 94, 0.06) 100%)',
      border: 'rgba(34, 197, 94, 0.2)'
    },
  };
  
  const style = config[priority] || { 
    color: 'var(--muted)', 
    bg: 'var(--accent)', 
    border: 'var(--border)' 
  };
  
  return (
    <span style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: '6px',
      padding: '5px 12px',
      background: style.bg,
      border: `1px solid ${style.border}`,
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.02em',
    }}>
      <Circle size={6} fill={style.color} color={style.color} />
      <span style={{ color: style.color }}>{priority}</span>
    </span>
  );
}

// UX Decision: Status badges with gradient backgrounds for depth
function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge badge-${status.toLowerCase().replace(/_/g, '-')}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

// Filter chip component for active filters visualization
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 8px 4px 12px',
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.08) 100%)',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 500,
      color: 'var(--blue-600)',
    }}>
      {label}
      <button 
        onClick={onRemove}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: 'rgba(59, 130, 246, 0.15)',
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.15s ease',
        }}
      >
        <X size={10} style={{ color: 'var(--blue-600)' }} />
      </button>
    </span>
  );
}

export default function ReferralsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [filters, setFilters] = useState<{
    status?: ReferralStatus;
    priority?: Priority;
    referralType?: ReferralType;
  }>({});

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['referrals', page, limit, filters],
    queryFn: () => referralService.list({ page, limit, ...filters }),
  });

  const referrals: Referral[] = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages || 1;

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const hasFilters = Object.values(filters).some(Boolean);
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // Column definitions with UX-optimized ordering
  const columnHelper = createColumnHelper<Referral>();
  
  const columns = useMemo<ColumnDef<Referral, any>[]>(() => [
    columnHelper.accessor('referralCode', {
      header: 'Referral',
      cell: info => (
        <div>
          <Link 
            href={`/referrals/${info.row.original.id}`} 
            className="link"
            style={{ fontWeight: 600, fontSize: '14px' }}
          >
            {info.getValue()}
          </Link>
          <div style={{ 
            fontSize: '12px', 
            color: 'var(--muted)', 
            marginTop: '2px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Clock size={10} />
            {new Date(info.row.original.createdAt).toLocaleDateString()}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('priority', {
      header: 'Priority',
      cell: info => <PriorityPill priority={info.getValue()} />,
    }),
    columnHelper.accessor(row => `${row.patient?.firstName || ''} ${row.patient?.lastName || ''}`.trim(), {
      id: 'patient',
      header: 'Patient',
      cell: info => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--gray-100), var(--gray-50))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--muted)',
            border: '1px solid var(--border)',
          }}>
            {info.getValue()?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
          </div>
          <span style={{ fontWeight: 500 }}>{info.getValue() || 'Unknown'}</span>
        </div>
      ),
    }),
    columnHelper.accessor('referralType', {
      header: 'Type',
      cell: info => (
        <span style={{ 
          padding: '4px 10px',
          background: 'var(--accent)',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 500,
          color: 'var(--muted)',
        }}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('sendingFacility.name', {
      header: 'From',
      cell: info => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '160px' }}>
          <Building2 size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          <span style={{ 
            color: 'var(--muted)', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap' 
          }}>
            {info.getValue() || 'Unknown'}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor('receivingFacility.name', {
      header: 'To',
      cell: info => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '160px' }}>
          <Building2 size={14} style={{ color: 'var(--blue-500)', flexShrink: 0 }} />
          <span style={{ 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            fontWeight: 500
          }}>
            {info.getValue() || 'Unknown'}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: info => (
        <Link 
          href={`/referrals/${info.row.original.id}`} 
          className="btn btn-ghost btn-sm"
          style={{ whiteSpace: 'nowrap' }}
        >
          View
          <ArrowRight size={14} />
        </Link>
      ),
    }),
  ], []);

  // Generate pagination array with ellipsis
  const getPaginationRange = () => {
    const range: (number | string)[] = [];
    const showPages = 5;
    const halfShow = Math.floor(showPages / 2);
    
    let start = Math.max(1, page - halfShow);
    let end = Math.min(totalPages, page + halfShow);
    
    if (page - halfShow <= 0) {
      end = Math.min(totalPages, showPages);
    }
    if (page + halfShow > totalPages) {
      start = Math.max(1, totalPages - showPages + 1);
    }
    
    if (start > 1) {
      range.push(1);
      if (start > 2) range.push('...');
    }
    
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    
    if (end < totalPages) {
      if (end < totalPages - 1) range.push('...');
      range.push(totalPages);
    }
    
    return range;
  };

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
            Referrals
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
            Manage and track patient referrals across facilities
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => refetch()}
            disabled={isFetching}
            style={{ opacity: isFetching ? 0.6 : 1 }}
          >
            <RefreshCw size={16} style={{ 
              animation: isFetching ? 'spin 1s linear infinite' : 'none' 
            }} />
            Refresh
          </button>
          <Link href="/referrals/new" className="btn btn-primary">
            <Plus size={16} />
            New Referral
          </Link>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="card" style={{ 
        padding: '16px 20px', 
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Top row: Search and filter controls */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          {/* Search */}
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
              placeholder="Search by code, patient, or facility..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Divider */}
          <div style={{ 
            width: '1px', 
            height: '28px', 
            background: 'var(--border)',
          }} />

          {/* Filter Selects */}
          <select 
            className="filter-select"
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="ARRIVED">Arrived</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select 
            className="filter-select"
            value={filters.priority || ''}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <option value="">All Priority</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select 
            className="filter-select"
            value={filters.referralType || ''}
            onChange={(e) => handleFilterChange('referralType', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="OBSTETRIC">Obstetric</option>
            <option value="NEONATAL">Neonatal</option>
            <option value="PEDIATRIC">Pediatric</option>
            <option value="MEDICAL">Medical</option>
            <option value="SURGICAL">Surgical</option>
            <option value="TRAUMA">Trauma</option>
          </select>

          {/* View toggle */}
          <div style={{ 
            display: 'flex', 
            borderRadius: '8px', 
            overflow: 'hidden',
            border: '1px solid var(--border)',
          }}>
            <button 
              onClick={() => setViewMode('table')}
              style={{
                padding: '8px 12px',
                background: viewMode === 'table' ? 'var(--accent)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <List size={16} style={{ color: viewMode === 'table' ? 'var(--foreground)' : 'var(--muted)' }} />
            </button>
            <button 
              onClick={() => setViewMode('cards')}
              style={{
                padding: '8px 12px',
                background: viewMode === 'cards' ? 'var(--accent)' : 'transparent',
                border: 'none',
                borderLeft: '1px solid var(--border)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <LayoutGrid size={16} style={{ color: viewMode === 'cards' ? 'var(--foreground)' : 'var(--muted)' }} />
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasFilters && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>
              <Filter size={12} style={{ marginRight: '4px' }} />
              Active filters:
            </span>
            {filters.status && (
              <FilterChip 
                label={`Status: ${filters.status}`} 
                onRemove={() => handleFilterChange('status', '')}
              />
            )}
            {filters.priority && (
              <FilterChip 
                label={`Priority: ${filters.priority}`} 
                onRemove={() => handleFilterChange('priority', '')}
              />
            )}
            {filters.referralType && (
              <FilterChip 
                label={`Type: ${filters.referralType}`} 
                onRemove={() => handleFilterChange('referralType', '')}
              />
            )}
            <button 
              onClick={clearFilters}
              style={{
                fontSize: '12px',
                color: 'var(--muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
                marginLeft: '4px',
              }}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Data Display */}
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
          <span style={{ color: 'var(--muted)', fontSize: '14px' }}>Loading referrals...</span>
        </div>
      ) : error ? (
        <div className="card" style={{ 
          padding: '60px', 
          textAlign: 'center',
        }}>
          <div style={{ 
            width: '56px', 
            height: '56px', 
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <X size={24} style={{ color: 'var(--red-500)' }} />
          </div>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>Failed to load referrals</div>
          <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>
            Please check your connection and try again
          </p>
          <button className="btn btn-secondary" onClick={() => refetch()}>
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      ) : (
        <DataTable 
          data={referrals} 
          columns={columns}
          globalFilter={search}
          onGlobalFilterChange={setSearch}
          emptyMessage="No referrals found"
          emptyDescription="Create a new referral or adjust your filters"
        />
      )}

      {/* Pagination & Export Footer */}
      {meta && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginTop: '20px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Results count */}
          <span style={{ fontSize: '14px', color: 'var(--muted)' }}>
            Showing <strong>{((page - 1) * limit) + 1}</strong> - <strong>{Math.min(page * limit, meta.total)}</strong> of <strong>{meta.total}</strong> referrals
          </span>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button 
                className="btn btn-secondary btn-sm btn-icon"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                style={{ opacity: page === 1 ? 0.5 : 1 }}
              >
                <ChevronLeft size={16} />
              </button>
              
              {getPaginationRange().map((pageNum, idx) => (
                typeof pageNum === 'number' ? (
                  <button
                    key={idx}
                    className={`btn btn-sm ${page === pageNum ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setPage(pageNum)}
                    style={{ minWidth: '36px' }}
                  >
                    {pageNum}
                  </button>
                ) : (
                  <span key={idx} style={{ padding: '0 8px', color: 'var(--muted)' }}>...</span>
                )
              ))}
              
              <button 
                className="btn btn-secondary btn-sm btn-icon"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                style={{ opacity: page === totalPages ? 0.5 : 1 }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Export button */}
          <button className="btn btn-secondary btn-sm">
            <Download size={14} />
            Export CSV
          </button>
        </div>
      )}
    </>
  );
}
