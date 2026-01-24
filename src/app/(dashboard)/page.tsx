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
  Clock, 
  ArrowRight,
  Circle,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Calendar,
  Users
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
  createdAt?: string;
}

// Priority indicator with semantic colors
function PriorityDot({ priority }: { priority: string }) {
  const config: Record<string, { color: string; bg: string; label: string }> = {
    CRITICAL: { color: '#F43F5E', bg: '#FFF1F2', label: 'Critical' },
    HIGH: { color: '#F59E0B', bg: '#FFFBEB', label: 'High' },
    MEDIUM: { color: '#0EA5E9', bg: '#F0F9FF', label: 'Medium' },
    LOW: { color: '#10B981', bg: '#ECFDF5', label: 'Low' },
  };
  
  const { color, bg, label } = config[priority] || { color: '#71717A', bg: '#F4F4F5', label: priority };
  
  return (
    <span style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: '6px',
      padding: '4px 10px',
      background: bg,
      borderRadius: '100px',
      fontSize: '12px',
      fontWeight: 600,
    }}>
      <Circle size={6} fill={color} color={color} />
      <span style={{ color }}>{label}</span>
    </span>
  );
}

// Status badge using CSS classes
function StatusBadge({ status }: { status: string }) {
  const cls = `badge badge-${status.toLowerCase().replace(/_/g, '-')}`;
  return <span className={cls}>{status.replace(/_/g, ' ')}</span>;
}

// Quick action card for common tasks
function QuickActionCard({ 
  icon: Icon, 
  label, 
  description, 
  href, 
  variant = 'default' 
}: { 
  icon: any; 
  label: string; 
  description: string; 
  href: string;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}) {
  const styles: Record<string, { bg: string; iconBg: string; iconColor: string }> = {
    default: { 
      bg: 'white', 
      iconBg: '#F4F4F5', 
      iconColor: '#71717A' 
    },
    primary: { 
      bg: 'white', 
      iconBg: '#EEF2FF', 
      iconColor: '#6366F1' 
    },
    success: { 
      bg: 'white', 
      iconBg: '#ECFDF5', 
      iconColor: '#10B981' 
    },
    warning: { 
      bg: 'white', 
      iconBg: '#FFFBEB', 
      iconColor: '#F59E0B' 
    },
  };

  const style = styles[variant];

  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div 
        className="card hover-lift"
        style={{
          padding: '20px',
          cursor: 'pointer',
          height: '100%',
        }}
      >
        <div style={{ 
          width: '44px', 
          height: '44px', 
          borderRadius: '12px',
          background: style.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <Icon size={22} style={{ color: style.iconColor }} strokeWidth={1.75} />
        </div>
        <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', color: '#18181B' }}>{label}</div>
        <div style={{ fontSize: '13px', color: '#71717A' }}>{description}</div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  
  // UX Decision: Time-based greeting creates personal connection
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

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
  
  // Calculate critical count for urgency indicator
  const criticalCount = pendingReferrals?.filter((r: any) => r.priority === 'CRITICAL').length || 0;

  const columnHelper = createColumnHelper<Referral>();
  
  // UX Decision: Columns ordered by importance - Code (identity) → Priority (urgency) → Patient (context)
  const columns = useMemo<ColumnDef<Referral, any>[]>(() => [
    columnHelper.accessor('referralCode', {
      header: 'Referral',
      cell: info => (
        <div>
          <Link href={`/referrals/${info.row.original.id}`} className="link font-semibold">
            {info.getValue()}
          </Link>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
            {info.row.original.referralType}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('priority', {
      header: 'Priority',
      cell: info => <PriorityDot priority={info.getValue()} />,
    }),
    columnHelper.accessor(row => `${row.patient?.firstName || ''} ${row.patient?.lastName || ''}`.trim(), {
      id: 'patient',
      header: 'Patient',
      cell: info => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--gray-100), var(--gray-50))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--muted)',
          }}>
            {info.getValue()?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?'}
          </div>
          <span style={{ fontWeight: 500 }}>{info.getValue() || 'Unknown'}</span>
        </div>
      ),
    }),
    columnHelper.accessor('sendingFacility.name', {
      header: 'From',
      cell: info => (
        <span style={{ 
          color: 'var(--muted)', 
          maxWidth: '180px', 
          display: 'block', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap' 
        }}>
          {info.getValue() || 'Unknown'}
        </span>
      ),
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
          <ArrowRight size={14} />
        </Link>
      ),
    }),
  ], []);

  return (
    <>
      {/* Hero Section - Personal greeting with context */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <h1 style={{ 
              fontSize: '28px', // 28px = readable but not overwhelming
              fontWeight: 700, 
              letterSpacing: '-0.02em',
              marginBottom: '6px',
            }}>
              {getGreeting()}, {user?.firstName}
            </h1>
            <p style={{ 
              color: 'var(--muted)', 
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Calendar size={14} />
              {currentDate}
            </p>
          </div>
          
          {/* Urgent Alert - Only shown when critical items exist */}
          {criticalCount > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}>
              <AlertTriangle size={18} style={{ color: 'var(--red-500)' }} />
              <span style={{ fontSize: '14px', fontWeight: 500 }}>
                <strong>{criticalCount}</strong> critical referral{criticalCount > 1 ? 's' : ''} pending
              </span>
              <Link href="/referrals?priority=CRITICAL" className="btn btn-sm" style={{
                background: 'var(--red-500)',
                color: 'white',
                marginLeft: '8px'
              }}>
                Review Now
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid - 4 columns on desktop, 2 on tablet, 1 on mobile */}
      <div className="stats-grid">
        <div style={{ animation: 'fade-in-up var(--duration-smooth) var(--ease) forwards', animationDelay: '0ms' }}>
          <StatCard
            label="Total Referrals"
            value={totalCount}
            icon={Activity}
            trend="12%"
            trendType="up"
            description="All time referrals"
          />
        </div>
        <div style={{ animation: 'fade-in-up var(--duration-smooth) var(--ease) forwards', animationDelay: '50ms', opacity: 0 }}>
          <StatCard
            label="Incoming"
            value={incomingCount}
            icon={ArrowDownLeft}
            trend="8%"
            trendType="up"
            variant="info"
            description="Referrals to your facility"
          />
        </div>
        <div style={{ animation: 'fade-in-up var(--duration-smooth) var(--ease) forwards', animationDelay: '100ms', opacity: 0 }}>
          <StatCard
            label="Outgoing"
            value={outgoingCount}
            icon={ArrowUpRight}
            trend="20%"
            trendType="up"
            variant="success"
            description="Referrals sent out"
          />
        </div>
        <div style={{ animation: 'fade-in-up var(--duration-smooth) var(--ease) forwards', animationDelay: '150ms', opacity: 0 }}>
          <StatCard
            label="Pending Action"
            value={pendingCount}
            icon={Clock}
            trend={pendingCount > 5 ? `${pendingCount - 5}+` : '0'}
            trendType={pendingCount > 5 ? 'up' : 'neutral'}
            variant={pendingCount > 5 ? 'warning' : 'default'}
            description="Awaiting your response"
          />
        </div>
      </div>

      {/* Quick Actions - Grid of 4 actionable items */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          fontSize: '16px', 
          fontWeight: 600, 
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Zap size={18} style={{ color: 'var(--amber-500)' }} />
          Quick Actions
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '16px',
        }} className="stats-grid">
          <QuickActionCard 
            icon={ArrowUpRight}
            label="New Referral"
            description="Create outgoing referral"
            href="/referrals/new"
            variant="primary"
          />
          <QuickActionCard 
            icon={Users}
            label="Register Patient"
            description="Add new patient record"
            href="/patients/new"
            variant="success"
          />
          <QuickActionCard 
            icon={Clock}
            label="Pending Reviews"
            description={`${pendingCount} awaiting action`}
            href="/referrals?status=PENDING"
            variant={pendingCount > 0 ? 'warning' : 'default'}
          />
          <QuickActionCard 
            icon={CheckCircle2}
            label="Completed Today"
            description="View today's completions"
            href="/referrals?status=COMPLETED"
          />
        </div>
      </div>

      {/* Recent Referrals Table */}
      <div className="card">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
              Recent Referrals
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              Latest activity across your facility
            </p>
          </div>
          <Link href="/referrals" className="btn btn-ghost btn-sm">
            View all
            <ArrowRight size={14} />
          </Link>
        </div>
        
        {referralsLoading ? (
          <div style={{ 
            padding: '60px', 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div className="spinner spinner-lg" />
            <span style={{ color: 'var(--muted)', fontSize: '14px' }}>Loading referrals...</span>
          </div>
        ) : (
          <DataTable 
            data={referrals} 
            columns={columns}
            emptyMessage="No recent referrals"
            emptyDescription="New referrals will appear here"
          />
        )}
      </div>
    </>
  );
}
