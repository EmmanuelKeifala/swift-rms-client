'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store';
import { referralService } from '@/lib/api';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Circle,
  LucideIcon
} from 'lucide-react';
import { StatCard } from '@/components/ui';



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

  const pendingCount = pendingReferrals?.length || 0;
  const incomingCount = incomingReferrals?.meta?.total || incomingReferrals?.data.length || 0;
  const outgoingCount = outgoingReferrals?.meta?.total || outgoingReferrals?.data.length || 0;
  const totalReferrals = referralsData?.meta?.total || 0;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.firstName || 'User'}</h1>
          <p className="page-subtitle">{currentDate}</p>
        </div>
        <Link href="/referrals/new" className="btn btn-primary">
          New Referral
        </Link>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Incoming Referrals"
          value={incomingCount}
          icon={ArrowDownLeft}
          trend="15%"
          trendType="up"
          variant="info"
        />
        <StatCard
          label="Outgoing Referrals"
          value={outgoingCount}
          icon={ArrowUpRight}
          trend="5%"
          trendType="down"
          variant="warning"
        />
        <StatCard
          label="Completed"
          value={totalReferrals}
          icon={CheckCircle2}
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
            
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Priority</th>
                    <th>Patient</th>
                    <th>Type</th>
                    <th>From</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {referralsLoading ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                        <div className="spinner" style={{ margin: '0 auto' }} />
                      </td>
                    </tr>
                  ) : !referralsData?.data.length ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 'var(--space-8)' }}>
                        No referrals found
                      </td>
                    </tr>
                  ) : (
                    referralsData.data.map((referral) => (
                      <tr key={referral.id}>
                        <td>
                          <Link href={`/referrals/${referral.id}`} className="link font-medium">
                            {referral.referralCode}
                          </Link>
                        </td>
                        <td>
                          <span className="flex items-center gap-2">
                            <PriorityDot priority={referral.priority} />
                            <span className="text-sm">{referral.priority}</span>
                          </span>
                        </td>
                        <td>{referral.patient?.firstName} {referral.patient?.lastName}</td>
                        <td className="text-muted">{referral.referralType}</td>
                        <td className="text-muted">{referral.sendingFacility?.name}</td>
                        <td><StatusBadge status={referral.status} /></td>
                        <td>
                          <Link href={`/referrals/${referral.id}`} className="btn btn-ghost btn-sm">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
