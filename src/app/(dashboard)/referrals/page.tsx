'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { referralService } from '@/lib/api';
import { ReferralStatus, Priority, ReferralType } from '@/types';
import { 
  Plus, 
  Circle, 
  ChevronLeft, 
  ChevronRight,
  Download,
  X,
  Search
} from 'lucide-react';

function PriorityIndicator({ priority }: { priority: string }) {
  const getColor = (p: string) => {
    switch (p) {
      case 'CRITICAL': return 'var(--priority-critical)';
      case 'HIGH': return 'var(--priority-high)';
      case 'MEDIUM': return 'var(--priority-medium)';
      case 'LOW': return 'var(--priority-low)';
      default: return 'var(--muted)';
    }
  };
  
  return (
    <span className="flex items-center gap-2">
      <Circle size={8} fill={getColor(priority)} color={getColor(priority)} />
      <span>{priority}</span>
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge badge-${status.toLowerCase().replace(/_/g, '-')}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export default function ReferralsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<{
    status?: ReferralStatus;
    priority?: Priority;
    referralType?: ReferralType;
  }>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ['referrals', page, limit, filters],
    queryFn: () => referralService.list({ page, limit, ...filters }),
  });

  const referrals = data?.data || [];
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

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Referrals</h1>
          <p className="page-subtitle">Manage and track patient referrals</p>
        </div>
        <Link href="/referrals/new" className="btn btn-primary">
          <Plus size={16} />
          New Referral
        </Link>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} className="search-box-icon" />
          <input
            type="text"
            className="search-box-input"
            placeholder="Search by code, patient name, or facility..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-box-kbd">/</span>
        </div>
        
        <div className="filter-divider" />
        
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

        {hasFilters && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-container">
        {isLoading ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : error ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--error)' }}>
            Failed to load referrals
          </div>
        ) : !referrals.length ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--muted)' }}>
            No referrals found
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Priority</th>
                <th>Patient</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((referral) => (
                <tr key={referral.id}>
                  <td>
                    <Link href={`/referrals/${referral.id}`} className="link font-medium">
                      {referral.referralCode}
                    </Link>
                  </td>
                  <td><PriorityIndicator priority={referral.priority} /></td>
                  <td>{referral.patient?.firstName} {referral.patient?.lastName}</td>
                  <td className="text-muted">{referral.referralType}</td>
                  <td className="text-muted truncate" style={{ maxWidth: 150 }}>{referral.sendingFacility?.name}</td>
                  <td className="text-muted truncate" style={{ maxWidth: 150 }}>{referral.receivingFacility?.name}</td>
                  <td><StatusBadge status={referral.status} /></td>
                  <td className="text-muted text-xs">
                    {new Date(referral.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <Link href={`/referrals/${referral.id}`} className="btn btn-ghost btn-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {meta && totalPages > 1 && (
        <div className="flex justify-between items-center mt-4" style={{ flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <span className="text-sm text-muted">
            Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, meta.total)} of {meta.total}
          </span>
          
          <div className="flex gap-1">
            <button 
              className="btn btn-secondary btn-sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft size={14} />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                className={`btn btn-sm ${page === pageNum ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}
            
            <button 
              className="btn btn-secondary btn-sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Export */}
      <div className="flex gap-2 mt-4">
        <button className="btn btn-secondary btn-sm">
          <Download size={14} />
          Export CSV
        </button>
      </div>
    </>
  );
}
