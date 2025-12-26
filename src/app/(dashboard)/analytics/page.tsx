'use client';

import { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Clock,
  Calendar,
  ArrowRight,
  Building2,
  AlertTriangle,
  Download,
  Filter
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
  // Outcomes
  'COMPLETED': '#10B981', // green
  'ADMITTED': '#3B82F6',  // blue
  'REFERRED': '#F59E0B',  // amber
  'DECEASED': '#DC2626',  // red
  'DISCHARGED': '#34D399', // emerald
  
  // Priorities
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
        background: 'var(--card-bg)', 
        border: '1px solid var(--border)', 
        padding: '8px 12px', 
        borderRadius: '8px',
        boxShadow: 'var(--shadow-md)',
        fontSize: '12px'
      }}>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8, color: entry.color }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: entry.color }} />
            <span>{entry.name}: {entry.value}</span>
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
    // Assuming success is non-deceased outcomes or just completion rate?
    // Let's use completion rate as success for now
    return Math.round((referralData.summary.completed / referralData.summary.totalReferrals) * 100);
  }, [referralData, outcomeData]);

  const highRejectionFacilities = useMemo(() => {
    return facilityData
      ?.filter(f => f.rejectionRate > 20) // Facilities with > 20% rejection rate
      .sort((a, b) => b.rejectionRate - a.rejectionRate)
      .slice(0, 3) || [];
  }, [facilityData]);

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="text-sm font-medium text-gray-500">Loading insights...</p>
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
        <div className="flex gap-2">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            {['7d', '30d', '90d', '1y'].map((p) => (
              <button 
                key={p}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  period === p 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={{
                  background: period === p ? 'var(--accent)' : 'transparent',
                  color: period === p ? 'var(--primary)' : 'var(--muted)',
                }}
                onClick={() => setPeriod(p)}
              >
                {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : p === '90d' ? '3 Months' : '1 Year'}
              </button>
            ))}
          </div>
          <button className="btn btn-secondary gap-2">
            <Filter size={16} />
            Filter
          </button>
          <button className="btn btn-secondary gap-2">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="stats-grid mb-6">
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
          <div className="card h-full">
            <div className="card-header">
              <h3 className="card-title">Referral Volume Trends</h3>
            </div>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6B7280' }} 
                    dy={10}
                    tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6B7280' }} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    name="Total Referrals"
                    stroke="#2563EB" 
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
          <div className="card h-full">
            <div className="card-header">
              <h3 className="card-title">Referrals by Priority</h3>
            </div>
            <div style={{ height: 320 }}>
              {priorityChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityChartData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const total = priorityChartData.reduce((acc, curr) => acc + curr.value, 0);
                          const val = Number(payload[0].value);
                          const percentage = Math.round((val / total) * 100);
                          
                          return (
                            <div className="bg-white border rounded-lg p-2 shadow-md text-xs">
                              <span style={{ color: payload[0].payload.color, fontWeight: 600 }}>
                                {percentage}% ({val})
                              </span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                      {priorityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted text-sm">
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Outcome Breakdown */}
        <div className="col-4">
          <div className="card h-full">
            <div className="card-header">
              <h3 className="card-title">Outcomes</h3>
            </div>
            <div style={{ height: 250, position: 'relative' }}>
              {outcomeChartData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={outcomeChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
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
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--foreground)' }}>
                      {outcomeData?.totalCompleted || 0}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Total</div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted text-sm">
                  No outcome data
                </div>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {outcomeChartData.slice(0, 4).map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                  <span className="text-muted truncate">{item.name}</span>
                  <span className="font-medium ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alert Cards - Dynamic Insights */}
        <div className="col-8">
          <div className="card h-full">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2">
                <AlertTriangle size={16} />
                Critical Insights
              </h3>
            </div>
            <div className="flex flex-col gap-4 p-2">
              {/* High Rejection Facilities Insight */}
              {highRejectionFacilities.length > 0 ? (
                <div className="flex-1 p-4 rounded-lg border border-yellow-200 bg-yellow-50" style={{ background: 'var(--warning-light)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                  <div className="flex gap-3">
                    <AlertTriangle className="text-yellow-600 shrink-0" size={20} style={{ color: 'var(--warning)' }} />
                    <div>
                      <h4 className="font-semibold text-yellow-900 mb-1" style={{ color: '#92400E' }}>High Rejection Rates Detected</h4>
                      <p className="text-sm text-yellow-700" style={{ color: '#B45309' }}>
                        {highRejectionFacilities[0].facilityName} has a {Math.round(highRejectionFacilities[0].rejectionRate)}% rejection rate.
                        {highRejectionFacilities[0].topRejectionReason && ` Top reason: ${highRejectionFacilities[0].topRejectionReason}`}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 p-4 rounded-lg border border-green-200 bg-green-50">
                  <div className="flex gap-3">
                     <TrendingUp className="text-green-600 shrink-0" size={20} />
                     <div>
                       <h4 className="font-semibold text-green-900 mb-1">Healthy Rejection Rates</h4>
                       <p className="text-sm text-green-700">All facilities are maintaining rejection rates below 20%.</p>
                     </div>
                  </div>
                </div>
              )}
              
              {/* Response Time Insight */}
              {responseTimeData?.averageMinutes && responseTimeData.averageMinutes > 45 && (
                <div className="flex-1 p-4 rounded-lg border border-red-200 bg-red-50">
                  <div className="flex gap-3">
                    <Clock className="text-red-600 shrink-0" size={20} />
                    <div>
                      <h4 className="font-semibold text-red-900 mb-1">Slow Response Times</h4>
                      <p className="text-sm text-red-700">
                        Average response time is {Math.round(responseTimeData.averageMinutes)} mins, exceeding the 30 min target.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Volume Insight - simple based on trend */}
              {volumeTrendData.length >= 2 && 
               volumeTrendData[volumeTrendData.length-1].count > volumeTrendData[volumeTrendData.length-2].count * 1.2 && (
                <div className="flex-1 p-4 rounded-lg border border-blue-200 bg-blue-50">
                   <div className="flex gap-3">
                     <Activity className="text-blue-600 shrink-0" size={20} />
                     <div>
                       <h4 className="font-semibold text-blue-900 mb-1">Surge in Referrals</h4>
                       <p className="text-sm text-blue-700">
                         Recent volume shows a 20% increase compared to previous day.
                       </p>
                     </div>
                   </div>
                 </div>
               )
              }
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
