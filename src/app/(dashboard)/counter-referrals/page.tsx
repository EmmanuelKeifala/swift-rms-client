'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { referralService } from '@/lib/api';
import { 
  RefreshCw, 
  Plus,
  Circle,
  ArrowRight,
  Clock,
  CheckCircle2
} from 'lucide-react';

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

  const referrals = tab === 'outgoing' ? outgoing?.data : incoming?.data;
  const isLoading = tab === 'outgoing' ? loadingOut : loadingIn;

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
          <div className="stat-value">{referrals?.filter(r => r.status === 'PENDING').length || 0}</div>
          <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: 'var(--warning)' }}>
            <Clock size={12} />
            Awaiting action
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">In Progress</div>
          <div className="stat-value">{referrals?.filter(r => ['ACCEPTED', 'IN_TRANSIT'].includes(r.status)).length || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value">{referrals?.filter(r => r.status === 'COMPLETED').length || 0}</div>
          <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: 'var(--success)' }}>
            <CheckCircle2 size={12} />
            This month
          </div>
        </div>
      </div>

      <div className="table-container">
        {isLoading ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : !referrals?.length ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--muted)' }}>
            No counter-referrals found
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Patient</th>
                <th>{tab === 'outgoing' ? 'To' : 'From'}</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((ref) => (
                <tr key={ref.id}>
                  <td>
                    <Link href={`/referrals/${ref.id}`} className="link font-medium">
                      {ref.referralCode}
                    </Link>
                  </td>
                  <td>{ref.patient?.firstName} {ref.patient?.lastName}</td>
                  <td className="text-muted truncate" style={{ maxWidth: 150 }}>
                    {tab === 'outgoing' ? ref.receivingFacility?.name : ref.sendingFacility?.name}
                  </td>
                  <td className="text-muted">{ref.referralType}</td>
                  <td><StatusBadge status={ref.status} /></td>
                  <td className="text-xs text-muted">
                    {new Date(ref.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <Link href={`/referrals/${ref.id}`} className="btn btn-ghost btn-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
