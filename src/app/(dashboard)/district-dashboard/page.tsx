'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { useAuthStore } from '@/store';
import { analyticsService } from '@/lib/api/analytics';
import { facilityService, readinessService } from '@/lib/api';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import dynamic from 'next/dynamic';
import { 
  Activity,
  CheckCircle2,
  Clock,
  TrendingUp,
  Download,
  Calendar,
  MapPin,
  AlertTriangle,
  Building2
} from 'lucide-react';
import { StatCard, DataTable } from '@/components/ui';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

// Dynamic import for map to avoid SSR issues
const FacilityReadinessMap = dynamic(
  () => import('@/components/maps/FacilityReadinessMap'),
  { 
    ssr: false,
    loading: () => (
      <div style={{ 
        height: 300, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--bg-overlay)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div className="spinner" />
      </div>
    )
  }
);

const COLORS = {
  'CRITICAL': '#DC2626',
  'HIGH': '#F59E0B',
  'MEDIUM': '#3B82F6',
  'LOW': '#10B981',
  'DISCHARGED': '#10B981',
  'ADMITTED': '#3B82F6',
  'REFERRED': '#F59E0B',
  'DECEASED': '#DC2626',
};

interface FacilityPerformance {
  id: string;
  facilityName: string;
  referralCount: number;
  acceptedCount: number;
  rejectedCount: number;
  readinessScore: number;
}

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        background: 'var(--bg-surface)', 
        border: '1px solid var(--border-default)', 
        padding: '10px 14px', 
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        fontSize: '12px'
      }}>
        <p style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8, color: entry.color }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: entry.color }} />
            <span style={{ color: 'var(--text-secondary)' }}>{entry.name}:</span>
            <span style={{ fontWeight: 600 }}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DistrictDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [period, setPeriod] = useState('30d');

  // Get user's district from their facility (cast to any since FacilitySummary doesn't include district)
  const userFacility = user?.facility as any;
  const districtId = userFacility?.districtId || userFacility?.district?.id || '';
  const districtName = userFacility?.district?.name || 'Your District';

  const dateRange = useMemo(() => {
    const end = new Date();
    let start = new Date();
    
    switch (period) {
      case '7d': start = subDays(end, 7); break;
      case '30d': start = subDays(end, 30); break;
      case '90d': start = subDays(end, 90); break;
    }
    
    return {
      dateFrom: format(startOfDay(start), 'yyyy-MM-dd'),
      dateTo: format(endOfDay(end), 'yyyy-MM-dd'),
      districtId,
    };
  }, [period, districtId]);

  // Queries
  const { data: referralData, isLoading: isLoadingReferrals } = useQuery({
    queryKey: ['analytics', 'referrals', 'district', dateRange],
    queryFn: () => analyticsService.getReferralAnalytics(dateRange),
    enabled: !!districtId,
  });

  const { data: responseTimeData } = useQuery({
    queryKey: ['analytics', 'response-times', 'district', dateRange],
    queryFn: () => analyticsService.getResponseTimes(dateRange),
    enabled: !!districtId,
  });

  const { data: outcomeData } = useQuery({
    queryKey: ['analytics', 'outcomes', 'district', dateRange],
    queryFn: () => analyticsService.getOutcomes(dateRange),
    enabled: !!districtId,
  });

  const { data: facilityData } = useQuery({
    queryKey: ['analytics', 'facilities', 'district', dateRange],
    queryFn: () => analyticsService.getFacilityAnalytics(dateRange),
    enabled: !!districtId,
  });

  const { data: readinessData } = useQuery({
    queryKey: ['readiness', 'all-current', districtId],
    queryFn: () => readinessService.getAllCurrent(districtId),
    enabled: !!districtId,
  });

  // Process data
  const volumeTrendData = useMemo(() => referralData?.trend || [], [referralData]);

  const priorityChartData = useMemo(() => {
    if (!referralData?.byPriority) return [];
    return Object.entries(referralData.byPriority).map(([name, value]) => ({
      name,
      value,
      color: COLORS[name as keyof typeof COLORS] || '#888888'
    })).sort((a, b) => (b.value as number) - (a.value as number));
  }, [referralData]);

  const outcomeChartData = useMemo(() => {
    if (!outcomeData?.byOutcome) return [];
    return Object.entries(outcomeData.byOutcome).map(([name, value]) => ({
      name,
      value,
      color: COLORS[name as keyof typeof COLORS] || '#888888'
    })).sort((a, b) => (b.value as number) - (a.value as number));
  }, [outcomeData]);

  // Stats calculations
  const totalReferrals = referralData?.summary?.totalReferrals || 0;
  const completedCount = referralData?.summary?.completed || 0;
  const avgResponseTime = Math.round(responseTimeData?.averageMinutes || 0);
  const outcomeRate = totalReferrals > 0 
    ? Math.round((completedCount / totalReferrals) * 100) 
    : 0;

  // Facility table data
  const facilityTableData: FacilityPerformance[] = useMemo(() => {
    return (facilityData || []).map((f: any) => ({
      id: f.facilityId,
      facilityName: f.facilityName,
      referralCount: f.referralCount || 0,
      acceptedCount: f.acceptedCount || 0,
      rejectedCount: f.rejectedCount || 0,
      readinessScore: f.readinessScore || 0,
    })).slice(0, 10);
  }, [facilityData]);

  const columnHelper = createColumnHelper<FacilityPerformance>();
  
  const columns = useMemo<ColumnDef<FacilityPerformance, any>[]>(() => [
    columnHelper.accessor('facilityName', {
      header: 'Facility',
      cell: info => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Building2 size={16} style={{ color: 'var(--text-tertiary)' }} />
          <span style={{ fontWeight: 500 }}>{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor('referralCount', {
      header: 'Referrals',
      cell: info => <span style={{ fontWeight: 600 }}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('acceptedCount', {
      header: 'Accepted',
      cell: info => (
        <span style={{ color: 'var(--success)' }}>{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('rejectedCount', {
      header: 'Rejected',
      cell: info => (
        <span style={{ color: info.getValue() > 5 ? 'var(--error)' : 'var(--text-secondary)' }}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('readinessScore', {
      header: 'Readiness',
      cell: info => {
        const score = info.getValue();
        const color = score >= 8 ? 'var(--success)' : score >= 5 ? 'var(--warning)' : 'var(--error)';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600, color }}>{score.toFixed(1)}</span>
            {score < 6 && <AlertTriangle size={14} style={{ color: 'var(--warning)' }} />}
          </div>
        );
      },
    }),
  ], []);

  // Export to CSV handler
  const handleExportCSV = () => {
    const headers = ['Facility', 'Referrals', 'Accepted', 'Rejected', 'Readiness'];
    const rows = facilityTableData.map(f => [
      f.facilityName,
      f.referralCount,
      f.acceptedCount,
      f.rejectedCount,
      f.readinessScore.toFixed(1)
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `district-performance-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const periodOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '3 Months' },
  ];

  if (isLoadingReferrals) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto var(--space-3)' }} />
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Loading district data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <MapPin size={24} style={{ color: 'var(--accent)' }} />
            {districtName} District Overview
          </h1>
          <p className="page-subtitle">
            Period: {format(new Date(dateRange.dateFrom), 'MMM d')} - {format(new Date(dateRange.dateTo), 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex gap-3">
          {/* Period Selector */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '2px',
            padding: '4px',
            background: 'var(--bg-overlay)', 
            border: '1px solid var(--border-default)', 
            borderRadius: 'var(--radius-lg)'
          }}>
            {periodOptions.map((p) => (
              <button 
                key={p.value}
                onClick={() => setPeriod(p.value)}
                style={{
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 500,
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: period === p.value ? 'var(--accent-subtle)' : 'transparent',
                  color: period === p.value ? 'var(--accent-light)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <StatCard
          label="Total Referrals"
          value={totalReferrals.toLocaleString()}
          icon={Activity}
          trend="8%"
          trendType="up"
          description="This period"
        />
        <StatCard
          label="Completed"
          value={completedCount.toLocaleString()}
          icon={CheckCircle2}
          trend="10%"
          trendType="up"
          variant="success"
          description="Successfully processed"
        />
        <StatCard
          label="Avg Response Time"
          value={`${avgResponseTime} min`}
          icon={Clock}
          trend={avgResponseTime < 30 ? '15% faster' : 'Above target'}
          trendType={avgResponseTime < 30 ? 'up' : 'down'}
          variant={avgResponseTime < 30 ? 'success' : 'warning'}
          description="Target: < 30 min"
        />
        <StatCard
          label="Outcome Rate"
          value={`${outcomeRate}%`}
          icon={TrendingUp}
          trend="2%"
          trendType="up"
          variant="info"
          description="Completion rate"
        />
      </div>

      {/* Charts Row 1: Trends + Map */}
      <div className="dashboard-grid" style={{ marginBottom: 'var(--space-6)' }}>
        {/* Referral Trends */}
        <div className="col-6">
          <div className="card" style={{ height: '100%' }}>
            <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 className="card-title">
                <Calendar size={16} />
                Referral Trends
              </h3>
            </div>
            <div style={{ height: 280, padding: 'var(--space-4)' }}>
              {volumeTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} 
                      dy={10}
                      tickFormatter={(value) => format(new Date(value), 'MMM d')}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      name="Referrals"
                      stroke="var(--accent)" 
                      fillOpacity={1} 
                      fill="url(#colorTrend)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)' }}>
                  No trend data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Facility Readiness Map */}
        <div className="col-6">
          <div className="card" style={{ height: '100%' }}>
            <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 className="card-title">
                <MapPin size={16} />
                Facility Readiness Map
              </h3>
            </div>
            <div style={{ height: 280, padding: 'var(--space-2)' }}>
              <FacilityReadinessMap 
                facilities={(readinessData || []).map((r: any) => ({
                  id: r.facilityId,
                  name: r.facilityName || r.facility?.name || 'Unknown',
                  latitude: r.facility?.latitude,
                  longitude: r.facility?.longitude,
                  readinessScore: r.overallScore,
                  bedAvailability: r.bedCapacityAvailable,
                }))}
                height={260}
              />
            </div>
            {/* Legend */}
            <div style={{ 
              padding: 'var(--space-3) var(--space-4)', 
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: 'var(--space-4)',
              fontSize: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
                High (8-10)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
                Medium (5-7)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#DC2626' }} />
                Low (1-4)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Facility Performance Table */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ 
          padding: 'var(--space-4)', 
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 className="card-title">
            <Building2 size={16} />
            Facility Performance
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <Download size={14} />
            Export CSV
          </button>
        </div>
        <DataTable 
          data={facilityTableData}
          columns={columns}
          emptyMessage="No facility data available"
        />
      </div>

      {/* Charts Row 2: Priority + Outcomes */}
      <div className="dashboard-grid">
        {/* Referrals by Priority */}
        <div className="col-6">
          <div className="card" style={{ height: '100%' }}>
            <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 className="card-title">
                <AlertTriangle size={16} />
                Referrals by Priority
              </h3>
            </div>
            <div style={{ height: 280, padding: 'var(--space-4)' }}>
              {priorityChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityChartData} layout="vertical" margin={{ top: 0, right: 30, left: 80, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border-subtle)" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]} barSize={28}>
                      {priorityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)' }}>
                  No priority data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Outcomes */}
        <div className="col-6">
          <div className="card" style={{ height: '100%' }}>
            <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 className="card-title">
                <TrendingUp size={16} />
                Outcomes
              </h3>
            </div>
            <div style={{ padding: 'var(--space-4)' }}>
              <div style={{ height: 200, position: 'relative' }}>
                {outcomeChartData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={outcomeChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {outcomeChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ 
                      position: 'absolute', 
                      top: '50%', 
                      left: '50%', 
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {outcomeData?.totalCompleted || 0}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Total</div>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)' }}>
                    No outcome data
                  </div>
                )}
              </div>
              {/* Legend */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: 'var(--space-2)',
                marginTop: 'var(--space-3)',
                paddingTop: 'var(--space-3)',
                borderTop: '1px solid var(--border-subtle)'
              }}>
                {outcomeChartData.slice(0, 4).map((item) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '12px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
