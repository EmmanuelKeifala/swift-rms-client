'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { referralService } from '@/lib/api';
import { DataTable } from '@/components/ui';
import { useAuthStore } from '@/store';
import { 
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Building2,
  Search,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';

interface Referral {
  id: string;
  referralCode: string;
  patient?: {
    firstName: string;
    lastName: string;
  };
  sendingFacility?: {
    id: string;
    name: string;
  };
  receivingFacility?: {
    id: string;
    name: string;
  };
  referralType: string;
  status: string;
  createdAt: string;
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge badge-${status.toLowerCase().replace(/_/g, '-')}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function DirectionBadge({ direction }: { direction: 'incoming' | 'outgoing' }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '3px 8px',
      borderRadius: 'var(--radius-full)',
      fontSize: '11px',
      fontWeight: 500,
      background: direction === 'incoming' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(168, 85, 247, 0.15)',
      color: direction === 'incoming' ? 'rgb(96, 165, 250)' : 'rgb(192, 132, 252)',
      border: `1px solid ${direction === 'incoming' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(168, 85, 247, 0.3)'}`
    }}>
      {direction === 'incoming' ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
      {direction === 'incoming' ? 'Incoming' : 'Outgoing'}
    </span>
  );
}

export default function CounterReferralsPage() {
  const [search, setSearch] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'outgoing' | 'incoming'>('all');
  const [statusFilter, setStatusFilter] = useState('');
  
  const user = useAuthStore(state => state.user);

  const { data: outgoing, isLoading: loadingOut } = useQuery({
    queryKey: ['counter-referrals', 'outgoing'],
    queryFn: () => referralService.listOutgoing({ page: 1, limit: 50 }),
  });

  const { data: incoming, isLoading: loadingIn } = useQuery({
    queryKey: ['counter-referrals', 'incoming'],
    queryFn: () => referralService.listIncoming({ page: 1, limit: 50 }),
  });

  const isLoading = loadingOut || loadingIn;

  // Combine and add direction to each referral
  const allReferrals = useMemo(() => {
    const outgoingData = (outgoing?.data || []).map((r: Referral) => ({ ...r, direction: 'outgoing' as const }));
    const incomingData = (incoming?.data || []).map((r: Referral) => ({ ...r, direction: 'incoming' as const }));
    return [...outgoingData, ...incomingData];
  }, [outgoing, incoming]);

  // Filter referrals
  const filteredReferrals = useMemo(() => {
    return allReferrals.filter(r => {
      // Direction filter
      if (directionFilter !== 'all' && r.direction !== directionFilter) return false;
      
      // Status filter
      if (statusFilter && r.status !== statusFilter) return false;
      
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchCode = r.referralCode?.toLowerCase().includes(searchLower);
        const matchPatient = `${r.patient?.firstName || ''} ${r.patient?.lastName || ''}`.toLowerCase().includes(searchLower);
        const matchFrom = r.sendingFacility?.name?.toLowerCase().includes(searchLower);
        const matchTo = r.receivingFacility?.name?.toLowerCase().includes(searchLower);
        if (!matchCode && !matchPatient && !matchFrom && !matchTo) return false;
      }
      
      return true;
    });
  }, [allReferrals, directionFilter, statusFilter, search]);

  // Stats
  const pendingCount = allReferrals.filter(r => r.status === 'PENDING').length;
  const inProgressCount = allReferrals.filter(r => ['ACCEPTED', 'IN_TRANSIT'].includes(r.status)).length;
  const completedCount = allReferrals.filter(r => r.status === 'COMPLETED').length;

  // Define columns
  const columnHelper = createColumnHelper<Referral & { direction: 'incoming' | 'outgoing' }>();
  
  const columns = useMemo<ColumnDef<Referral & { direction: 'incoming' | 'outgoing' }, any>[]>(() => [
    columnHelper.accessor('referralCode', {
      header: 'Code',
      cell: info => (
        <Link href={`/referrals/${info.row.original.id}`} className="link font-medium">
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor('direction', {
      header: 'Direction',
      cell: info => <DirectionBadge direction={info.getValue()} />,
    }),
    columnHelper.accessor(row => `${row.patient?.firstName || ''} ${row.patient?.lastName || ''}`.trim(), {
      id: 'patient',
      header: 'Patient',
      cell: info => (
        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
          {info.getValue() || 'Unknown'}
        </span>
      ),
    }),
    columnHelper.accessor('sendingFacility.name', {
      header: 'From',
      cell: info => (
        <div className="flex items-center gap-2" style={{ maxWidth: 160 }}>
          <Building2 size={12} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          <span style={{ 
            color: 'var(--text-secondary)', 
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
        <div className="flex items-center gap-2" style={{ maxWidth: 160 }}>
          <Building2 size={12} style={{ color: 'var(--accent-light)', flexShrink: 0 }} />
          <span style={{ 
            color: 'var(--text-primary)',
            fontWeight: 500,
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap' 
          }}>
            {info.getValue() || 'Unknown'}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor('referralType', {
      header: 'Type',
      cell: info => (
        <span style={{ 
          padding: '3px 8px',
          background: 'var(--bg-overlay)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '11px',
          color: 'var(--text-secondary)'
        }}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Date',
      cell: info => (
        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
          {new Date(info.getValue()).toLocaleDateString()}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      cell: info => (
        <Link href={`/referrals/${info.row.original.id}`} className="btn btn-ghost btn-sm">
          View <ArrowRight size={12} />
        </Link>
      ),
    }),
  ], []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Counter-Referrals</h1>
          <p className="page-subtitle">Manage patient counter-referrals back to sending facilities</p>
        </div>
        <Link href="/counter-referrals/new" className="btn btn-primary">
          <Plus size={16} />
          New Counter-Referral
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 'var(--space-5)' }}>
        <div className="stat-card">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{pendingCount}</div>
          <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: 'var(--warning)' }}>
            <Clock size={12} />
            Awaiting action
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">In Progress</div>
          <div className="stat-value">{inProgressCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value">{completedCount}</div>
          <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: 'var(--success)' }}>
            <CheckCircle2 size={12} />
            This month
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        {/* Search */}
        <div className="search-box" style={{ flex: 1, minWidth: 250 }}>
          <Search size={16} className="search-box-icon" />
          <input
            type="text"
            className="search-box-input"
            placeholder="Search by code, patient, or facility..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-divider" />

        {/* Direction Filter */}
        <select 
          className="filter-select"
          value={directionFilter}
          onChange={(e) => setDirectionFilter(e.target.value as 'all' | 'outgoing' | 'incoming')}
        >
          <option value="all">All Directions</option>
          <option value="outgoing">Outgoing</option>
          <option value="incoming">Incoming</option>
        </select>

        {/* Status Filter */}
        <select 
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="ARRIVED">Arrived</option>
          <option value="COMPLETED">Completed</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {isLoading ? (
        <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : (
        <DataTable 
          data={filteredReferrals} 
          columns={columns}
          emptyMessage="No counter-referrals found"
          emptyDescription="Try adjusting your filters or create a new counter-referral"
        />
      )}
    </>
  );
}
