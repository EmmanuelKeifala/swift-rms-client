'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { referralService } from '@/lib/api';
import {DataTable } from '@/components/ui';
import { 
  RefreshCw, 
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface Referral {
  id: string;
  referralCode: string;
  patient?: {
    firstName: string;
    lastName: string;
  };
  sendingFacility?: {
    name: string;
  };
  receivingFacility?: {
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

export default function CounterReferralsPage() {
  const [tab, setTab] = useState<'outgoing' | 'incoming'>('outgoing');

  const { data: outgoing, isLoading: loadingOut } = useQuery({
    queryKey: ['counter-referrals', 'outgoing'],
    queryFn: () => referralService.listOutgoing({ page: 1, limit: 20 }),
  });

  const { data: incoming, isLoading: loadingIn } = useQuery({
    queryKey: ['counter-referrals', 'incoming'],
    queryFn: () => referralService.listIncoming({ page: 1, limit: 20 }),
  });

  const referrals: Referral[] = (tab === 'outgoing' ? outgoing?.data : incoming?.data) || [];
  const isLoading = tab === 'outgoing' ? loadingOut : loadingIn;

  // Define columns
  const columnHelper = createColumnHelper<Referral>();
  
  const columns = useMemo<ColumnDef<Referral, any>[]>(() => [
    columnHelper.accessor('referralCode', {
      header: 'Code',
      cell: info => (
        <Link href={`/referrals/${info.row.original.id}`} className="link font-medium">
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor(row => `${row.patient?.firstName || ''} ${row.patient?.lastName || ''}`.trim(), {
      id: 'patient',
      header: 'Patient',
    }),
    columnHelper.accessor(row => tab === 'outgoing' ? row.receivingFacility?.name : row.sendingFacility?.name, {
      id: 'facility',
      header: () => tab === 'outgoing' ? 'To' : 'From',
      cell: info => (
        <span style={{ color: 'var(--muted)', maxWidth: 150, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('referralType', {
      header: 'Type',
      cell: info => <span style={{ color: 'var(--muted)' }}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Date',
      cell: info => (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
          {new Date(info.getValue()).toLocaleDateString()}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      cell: info => (
        <Link href={`/referrals/${info.row.original.id}`} className="btn btn-ghost btn-sm">
          View
        </Link>
      ),
    }),
  ], [tab]);

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

      <div className="card mb-4">
        <div className="flex gap-1">
          <button 
            className={`btn ${tab === 'outgoing' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab('outgoing')}
          >
            <RefreshCw size={14} />
            Outgoing
          </button>
          <button 
            className={`btn ${tab === 'incoming' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab('incoming')}
          >
            <ArrowRight size={14} />
            Incoming
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{referrals.filter(r => r.status === 'PENDING').length}</div>
          <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: 'var(--warning)' }}>
            <Clock size={12} />
            Awaiting action
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">In Progress</div>
          <div className="stat-value">{referrals.filter(r => ['ACCEPTED', 'IN_TRANSIT'].includes(r.status)).length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value">{referrals.filter(r => r.status === 'COMPLETED').length}</div>
          <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: 'var(--success)' }}>
            <CheckCircle2 size={12} />
            This month
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : (
        <DataTable 
          data={referrals} 
          columns={columns}
          emptyMessage="No counter-referrals found"
        />
      )}
    </>
  );
}
