'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { referralService } from '@/lib/api';
import { ReferralStatus, Priority, ReferralType } from '@/types';
import { DataTable, PriorityBadge, StatusIndicator } from '@/components/ui';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Download,
  X,
  Search,
  Filter,
  ArrowRight,
  Building2,
  Clock,
  List,
  LayoutGrid,
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

// Filter chip component for active filters visualization
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 8px 4px 12px',
      background: 'var(--accent-subtle)',
      border: '1px solid rgba(99, 102, 241, 0.2)',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 500,
      color: 'var(--accent-light)',
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
          background: 'rgba(99, 102, 241, 0.2)',
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.15s ease',
        }}
      >
        <X size={10} style={{ color: 'var(--accent-light)' }} />
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
      cell: info => <PriorityBadge priority={info.getValue()} size="sm" />,
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
            background: 'var(--glass-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            border: '1px solid var(--border-subtle)',
          }}>
            {info.getValue()?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
          </div>
          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{info.getValue() || 'Unknown'}</span>
        </div>
      ),
    }),
    columnHelper.accessor('referralType', {
      header: 'Type',
      cell: info => (
        <span style={{ 
          padding: '4px 10px',
          background: 'var(--glass-bg)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 500,
          color: 'var(--text-secondary)',
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
      cell: info => <StatusIndicator status={info.getValue()} size="sm" />,
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

      {/* Stats Summary */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 'var(--space-5)' }}>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'var(--accent-subtle)' }}>
              <ArrowRight size={20} style={{ color: 'var(--accent-light)' }} />
            </div>
          </div>
          <div className="stat-label">Total Referrals</div>
          <div className="stat-value">{meta?.total?.toLocaleString() || referrals.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(234, 179, 8, 0.15)' }}>
              <Clock size={20} style={{ color: '#eab308' }} />
            </div>
          </div>
          <div className="stat-label">Pending</div>
          <div className="stat-value" style={{ color: '#eab308' }}>
            {referrals.filter(r => r.status === 'PENDING' || r.status === 'ACCEPTED' || r.status === 'IN_TRANSIT').length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
              <Filter size={20} style={{ color: '#ef4444' }} />
            </div>
          </div>
          <div className="stat-label">Critical</div>
          <div className="stat-value" style={{ color: '#ef4444' }}>
            {referrals.filter(r => r.priority === 'CRITICAL').length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
              <RefreshCw size={20} style={{ color: '#22c55e' }} />
            </div>
          </div>
          <div className="stat-label">Completed</div>
          <div className="stat-value" style={{ color: '#22c55e' }}>
            {referrals.filter(r => r.status === 'COMPLETED').length}
          </div>
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
          <div className="view-toggle">
            <button 
              onClick={() => setViewMode('table')}
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
            >
              <List size={16} />
            </button>
            <button 
              onClick={() => setViewMode('cards')}
              className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
            >
              <LayoutGrid size={16} />
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
      ) : viewMode === 'cards' ? (
        // Cards View
        (() => {
          // Filter referrals by search (case-insensitive)
          const filteredReferrals = referrals.filter(r => {
            if (!search) return true;
            const searchLower = search.toLowerCase();
            const patientName = `${r.patient?.firstName || ''} ${r.patient?.lastName || ''}`.toLowerCase();
            const sendingFacility = r.sendingFacility?.name?.toLowerCase() || '';
            const receivingFacility = r.receivingFacility?.name?.toLowerCase() || '';
            return (
              r.referralCode.toLowerCase().includes(searchLower) ||
              patientName.includes(searchLower) ||
              sendingFacility.includes(searchLower) ||
              receivingFacility.includes(searchLower)
            );
          });

          if (filteredReferrals.length === 0) {
            return (
              <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '50%',
                  background: 'var(--glass-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <ArrowRight size={24} style={{ color: 'var(--muted)' }} />
                </div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>No referrals found</div>
                <p style={{ color: 'var(--muted)' }}>Create a new referral or adjust your filters</p>
              </div>
            );
          }

          return (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '16px',
            }}>
              {filteredReferrals.map(referral => (
                <Link 
                  key={referral.id} 
                  href={`/referrals/${referral.id}`}
                  className="card"
                  style={{ 
                    padding: '20px', 
                    textDecoration: 'none',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>
                        {referral.referralCode}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={10} />
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <PriorityBadge priority={referral.priority} size="sm" />
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'var(--glass-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--text-tertiary)',
                      border: '1px solid var(--border-subtle)',
                    }}>
                      {`${referral.patient?.firstName?.[0] || ''}${referral.patient?.lastName?.[0] || ''}`.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '14px' }}>
                        {referral.patient?.firstName} {referral.patient?.lastName}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        {referral.referralType}
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '10px 12px',
                    background: 'var(--bg-elevated)',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    fontSize: '13px',
                  }}>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={12} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {referral.sendingFacility?.name || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={12} style={{ color: 'var(--blue-500)', flexShrink: 0 }} />
                        <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {referral.receivingFacility?.name || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <StatusIndicator status={referral.status} size="sm" />
                </Link>
              ))}
            </div>
          );
        })()
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
