'use client';

import { useState, useMemo } from 'react';
import { 
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  AlertTriangle,
  Download,
  Calendar
} from 'lucide-react';
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
  Cell
} from 'recharts';
import { StatCard } from '@/components/ui';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/lib/api/analytics';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

const COLORS = {
  'COMPLETED': '#10B981',
  'ADMITTED': '#3B82F6',
  'REFERRED': '#F59E0B',
  'DECEASED': '#DC2626',
  'DISCHARGED': '#34D399',
  'CRITICAL': '#DC2626',
  'HIGH': '#F59E0B',
  'MEDIUM': '#3B82F6',
  'LOW': '#10B981',
};

// Custom Tooltip for Charts
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

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30d');

  const dateRange = useMemo(() => {
    const end = new Date();
    let start = new Date();
    
    switch (period) {
      case '7d': start = subDays(end, 7); break;
      case '30d': start = subDays(end, 30); break;
      case '90d': start = subDays(end, 90); break;
      case '1y': start = subDays(end, 365); break;
    }
    
    return {
      dateFrom: format(startOfDay(start), 'yyyy-MM-dd'),
      dateTo: format(endOfDay(end), 'yyyy-MM-dd'),
    };
  }, [period]);

  // Queries
  const { data: referralData, isLoading: isLoadingReferrals } = useQuery({
    queryKey: ['analytics', 'referrals', dateRange],
    queryFn: () => analyticsService.getReferralAnalytics(dateRange),
  });

  const { data: responseTimeData, isLoading: isLoadingResponseTime } = useQuery({
    queryKey: ['analytics', 'response-times', dateRange],
    queryFn: () => analyticsService.getResponseTimes(dateRange),
  });

  const { data: outcomeData, isLoading: isLoadingOutcomes } = useQuery({
    queryKey: ['analytics', 'outcomes', dateRange],
    queryFn: () => analyticsService.getOutcomes(dateRange),
  });

  const { data: facilityData, isLoading: isLoadingFacilities } = useQuery({
    queryKey: ['analytics', 'facilities', dateRange],
    queryFn: () => analyticsService.getFacilityAnalytics(dateRange),
  });

  const isLoading = isLoadingReferrals || isLoadingResponseTime || isLoadingOutcomes || isLoadingFacilities;

  // Process data for charts
  const volumeTrendData = useMemo(() => {
    return referralData?.trend || [];
  }, [referralData]);

  const priorityChartData = useMemo(() => {
    if (!referralData?.byPriority) return [];
    return Object.entries(referralData.byPriority).map(([name, value]) => ({
      name,
      value,
      color: COLORS[name as keyof typeof COLORS] || '#888888'
    })).sort((a, b) => b.value - a.value);
  }, [referralData]);

  const outcomeChartData = useMemo(() => {
    if (!outcomeData?.byOutcome) return [];
    return Object.entries(outcomeData.byOutcome).map(([name, value]) => ({
      name,
      value,
      color: COLORS[name as keyof typeof COLORS] || '#888888'
    })).sort((a, b) => b.value - a.value);
  }, [outcomeData]);

  // Calculate insights
  const successRate = useMemo(() => {
    if (!referralData?.summary?.totalReferrals || !outcomeData?.totalCompleted) return 0;
    return Math.round((referralData.summary.completed / referralData.summary.totalReferrals) * 100);
  }, [referralData, outcomeData]);

  const highRejectionFacilities = useMemo(() => {
    return facilityData
      ?.filter(f => f.rejectionRate > 20)
      .sort((a, b) => b.rejectionRate - a.rejectionRate)
      .slice(0, 3) || [];
  }, [facilityData]);

  const periodOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '3 Months' },
    { value: '1y', label: '1 Year' },
  ];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto var(--space-3)' }} />
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics Dashboard</h1>
          <p className="page-subtitle">Platform insights and performance metrics</p>
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
          <button className="btn btn-secondary">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <StatCard
          label="Total Referrals"
          value={referralData?.summary?.totalReferrals.toLocaleString() || '0'}
          icon={Activity}
          trend={`${referralData?.summary?.totalReferrals ? 'Active' : 'No data'}`}
          trendType="neutral"
          variant="info"
        />
        <StatCard
          label="Avg Response Time"
          value={`${Math.round(responseTimeData?.averageMinutes || 0)} min`}
          icon={Clock}
          trend="Target: <30m"
          trendType={responseTimeData?.averageMinutes && responseTimeData.averageMinutes > 30 ? 'down' : 'up'}
          variant={responseTimeData?.averageMinutes && responseTimeData.averageMinutes > 30 ? 'warning' : 'success'}
        />
        <StatCard
          label="Completion Rate"
          value={`${successRate}%`}
          icon={TrendingUp}
          trend="Success"
          trendType="up"
          variant="success"
        />
        <StatCard
          label="Rejection Rate"
          value={`${Math.round(((referralData?.summary?.rejected || 0) / (referralData?.summary?.totalReferrals || 1)) * 100)}%`}
          icon={AlertTriangle}
          trend={`${referralData?.summary?.rejected || 0} rejected`}
          trendType="down"
          variant={((referralData?.summary?.rejected || 0) / (referralData?.summary?.totalReferrals || 1)) > 0.1 ? 'warning' : 'success'}
        />
      </div>

      <div className="dashboard-grid">
        {/* Main Volume Chart */}
        <div className="col-8">
          <div className="card" style={{ height: '100%' }}>
            <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 className="card-title">
                <Calendar size={16} />
                Referral Volume Trends
              </h3>
            </div>
            <div style={{ height: 320, padding: 'var(--space-4)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
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
                    name="Total Referrals"
                    stroke="var(--accent)" 
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="col-4">
          <div className="card" style={{ height: '100%' }}>
            <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 className="card-title">
                <AlertTriangle size={16} />
                Referrals by Priority
              </h3>
            </div>
            <div style={{ height: 320, padding: 'var(--space-4)' }}>
              {priorityChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityChartData} layout="vertical" margin={{ top: 0, right: 30, left: 60, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border-subtle)" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'var(--bg-overlay)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const total = priorityChartData.reduce((acc, curr) => acc + curr.value, 0);
                          const val = Number(payload[0].value);
                          const percentage = Math.round((val / total) * 100);
                          
                          return (
                            <div style={{
                              background: 'var(--bg-surface)',
                              border: '1px solid var(--border-default)',
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-md)',
                              fontSize: '12px'
                            }}>
                              <span style={{ color: payload[0].payload.color, fontWeight: 600 }}>
                                {percentage}% ({val})
                              </span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={28}>
                      {priorityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)', fontSize: '14px' }}>
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Outcome Breakdown */}
        <div className="col-4">
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)', fontSize: '14px' }}>
                    No outcome data
                  </div>
                )}
              </div>
              {/* Legend */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: 'var(--space-2)',
                marginTop: 'var(--space-4)',
                paddingTop: 'var(--space-3)',
                borderTop: '1px solid var(--border-subtle)'
              }}>
                {outcomeChartData.slice(0, 4).map((item) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Critical Insights */}
        <div className="col-8">
          <div className="card" style={{ height: '100%' }}>
            <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 className="card-title">
                <AlertTriangle size={16} />
                Critical Insights
              </h3>
            </div>
            <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {/* High Rejection Facilities Insight */}
              {highRejectionFacilities.length > 0 ? (
                <div style={{ 
                  padding: 'var(--space-4)', 
                  borderRadius: 'var(--radius-lg)', 
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  background: 'rgba(234, 179, 8, 0.1)'
                }}>
                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <AlertTriangle size={20} style={{ color: '#fbbf24', flexShrink: 0 }} />
                    <div>
                      <h4 style={{ fontWeight: 600, color: '#fbbf24', marginBottom: '4px' }}>High Rejection Rates Detected</h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {highRejectionFacilities[0].facilityName} has a {Math.round(highRejectionFacilities[0].rejectionRate)}% rejection rate.
                        {highRejectionFacilities[0].topRejectionReason && ` Top reason: ${highRejectionFacilities[0].topRejectionReason}`}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  padding: 'var(--space-4)', 
                  borderRadius: 'var(--radius-lg)', 
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  background: 'rgba(34, 197, 94, 0.1)'
                }}>
                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <TrendingUp size={20} style={{ color: '#4ade80', flexShrink: 0 }} />
                    <div>
                      <h4 style={{ fontWeight: 600, color: '#4ade80', marginBottom: '4px' }}>Healthy Rejection Rates</h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        All facilities are maintaining rejection rates below 20%.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Response Time Insight */}
              {responseTimeData?.averageMinutes && responseTimeData.averageMinutes > 45 && (
                <div style={{ 
                  padding: 'var(--space-4)', 
                  borderRadius: 'var(--radius-lg)', 
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.1)'
                }}>
                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <Clock size={20} style={{ color: '#f87171', flexShrink: 0 }} />
                    <div>
                      <h4 style={{ fontWeight: 600, color: '#f87171', marginBottom: '4px' }}>Slow Response Times</h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Average response time is {Math.round(responseTimeData.averageMinutes)} mins, exceeding the 30 min target.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Volume Insight */}
              {volumeTrendData.length >= 2 && 
               volumeTrendData[volumeTrendData.length-1].count > volumeTrendData[volumeTrendData.length-2].count * 1.2 && (
                <div style={{ 
                  padding: 'var(--space-4)', 
                  borderRadius: 'var(--radius-lg)', 
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  background: 'rgba(59, 130, 246, 0.1)'
                }}>
                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <Activity size={20} style={{ color: '#60a5fa', flexShrink: 0 }} />
                    <div>
                      <h4 style={{ fontWeight: 600, color: '#60a5fa', marginBottom: '4px' }}>Surge in Referrals</h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Recent volume shows a 20% increase compared to previous day.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
