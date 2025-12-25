'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { useAuthStore } from '@/store';
import { referralService } from '@/lib/api';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Circle,
} from 'lucide-react';
import { StatCard, DataTable } from '@/components/ui';

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
  status: string;
}

function PriorityDot({ priority }: { priority: string }) {
  const getColor = (p: string) => {
    switch (p) {
      case 'CRITICAL': return 'var(--priority-critical)';
      case 'HIGH': return 'var(--priority-high)';
      case 'MEDIUM': return 'var(--priority-medium)';
      case 'LOW': return 'var(--priority-low)';
      default: return 'var(--muted)';
    }
  };
  
  return <Circle size={8} fill={getColor(priority)} color={getColor(priority)} />;
}

function StatusBadge({ status }: { status: string }) {
  const cls = `badge badge-${status.toLowerCase().replace(/_/g, '-')}`;
  return <span className={cls}>{status.replace(/_/g, ' ')}</span>;
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [currentDate] = useState(new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  const { data: referralsData, isLoading: referralsLoading } = useQuery({
    queryKey: ['referrals', 'dashboard'],
    queryFn: () => referralService.list({ page: 1, limit: 5 }),
  });

  const { data: pendingReferrals } = useQuery({
    queryKey: ['referrals', 'pending'],
    queryFn: () => referralService.listPending(),
  });

  const { data: incomingReferrals } = useQuery({
    queryKey: ['referrals', 'incoming'],
    queryFn: () => referralService.listIncoming({ page: 1, limit: 10 }),
  });

  const { data: outgoingReferrals } = useQuery({
    queryKey: ['referrals', 'outgoing'],
    queryFn: () => referralService.listOutgoing({ page: 1, limit: 10 }),
  });

  const referrals: Referral[] = referralsData?.data || [];
  const totalCount = pendingReferrals?.length || 0;
  const incomingCount = incomingReferrals?.data?.length || 0;
  const outgoingCount = outgoingReferrals?.data?.length || 0;
  const pendingCount = pendingReferrals?.filter((r: any) => r.status === 'PENDING').length || 0;

  // Define columns for recent referrals
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
    columnHelper.accessor('priority', {
      header: 'Priority',
      cell: info => (
        <span className="flex items-center gap-2">
          <PriorityDot priority={info.getValue()} />
          <span className="text-sm">{info.getValue()}</span>
        </span>
      ),
    }),
    columnHelper.accessor(row => `${row.patient?.firstName || ''} ${row.patient?.lastName || ''}`.trim(), {
      id: 'patient',
      header: 'Patient',
    }),
    columnHelper.accessor('referralType', {
      header: 'Type',
      cell: info => <span style={{ color: 'var(--muted)' }}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('sendingFacility.name', {
      header: 'From',
      cell: info => <span style={{ color: 'var(--muted)' }}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.display({
      id: 'actions',
      cell: info => (
        <Link href={`/referrals/${info.row.original.id}`} className="btn btn-ghost btn-sm">
          View
        </Link>
      ),
    }),
  ], []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.firstName}!</h1>
          <p className="page-subtitle">{currentDate}</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Total Referrals"
          value={totalCount}
          icon={ArrowUpRight}
          trend="12%"
          trendType="up"
        />
        <StatCard
          label="Incoming"
          value={incomingCount}
          icon={ArrowDownLeft}
          trend="8%"
          trendType="up"
          variant="info"
        />
        <StatCard
          label="Outgoing"
          value={outgoingCount}
          icon={ArrowUpRight}
          trend="20%"
          trendType="up"
          variant="success"
        />
        <StatCard
          label="Pending Action"
          value={pendingCount}
          icon={Clock}
          trend="0%"
          trendType="neutral"
        />
      </div>

      <div className="dashboard-grid">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Referrals</h3>
              <Link href="/referrals" className="btn btn-ghost btn-sm">
                View all
                <ArrowRight size={14} />
              </Link>
            </div>
            
            {referralsLoading ? (
              <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
              </div>
            ) : (
              <DataTable 
                data={referrals} 
                columns={columns}
                emptyMessage="No referrals found"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
