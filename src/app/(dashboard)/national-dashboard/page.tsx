'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { analyticsService } from '@/lib/api/analytics';
import { referralService, facilityService, readinessService, ambulanceService } from '@/lib/api';
import { format, subDays, subMonths, startOfDay, endOfDay, startOfMonth } from 'date-fns';
import dynamic from 'next/dynamic';
import { 
  Activity,
  Ambulance,
  Building2,
  TrendingUp,
  Calendar,
  MapPin,
  Maximize2,
  Filter
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
} from 'recharts';

// Dynamic import for map to avoid SSR issues
const NationalReferralMap = dynamic(
  () => import('@/components/maps/NationalReferralMap'),
  { 
    ssr: false,
    loading: () => (
      <div style={{ 
        height: 400, 
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

interface DistrictPerformance {
  id: string;
  name: string;
  referralCount: number;
  avgResponseTime: number;
  successRate: number;
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
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: entry.color }} />
            <span style={{ color: 'var(--text-secondary)' }}>{entry.name}:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function NationalDashboardPage() {
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  
  // Map layer toggles
  const [showReferrals, setShowReferrals] = useState(true);
  const [showAmbulances, setShowAmbulances] = useState(true);
  const [showHighReadiness, setShowHighReadiness] = useState(true);
  const [showMediumReadiness, setShowMediumReadiness] = useState(true);
  const [showLowReadiness, setShowLowReadiness] = useState(true);

  const currentMonth = format(new Date(), 'MMMM yyyy');

  // Date range for analytics (current month)
  const dateRange = useMemo(() => ({
    dateFrom: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    dateTo: format(endOfDay(new Date()), 'yyyy-MM-dd'),
  }), []);

  // Queries
  const { data: referralData, isLoading: isLoadingReferrals } = useQuery({
    queryKey: ['analytics', 'referrals', 'national', dateRange],
    queryFn: () => analyticsService.getReferralAnalytics(dateRange),
  });

  const { data: activeReferrals } = useQuery({
    queryKey: ['referrals', 'active'],
    queryFn: () => referralService.list({ status: 'IN_TRANSIT', limit: 100 }),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: ambulancesData } = useQuery({
    queryKey: ['ambulances', 'all'],
    queryFn: () => ambulanceService.list({ limit: 100 }),
    refetchInterval: 30000,
  });

  const { data: readinessData } = useQuery({
    queryKey: ['readiness', 'all-current'],
    queryFn: () => readinessService.getAllCurrent(),
  });

  const { data: facilityData } = useQuery({
    queryKey: ['analytics', 'facilities', dateRange],
    queryFn: () => analyticsService.getFacilityAnalytics(dateRange),
  });

  const { data: districtsData } = useQuery({
    queryKey: ['districts'],
    queryFn: () => facilityService.getDistricts(),
  });

  // Fetch all facilities to get district mapping
  const { data: allFacilitiesData } = useQuery({
    queryKey: ['facilities', 'all-for-district-mapping'],
    queryFn: () => facilityService.list({ limit: 1000 }),
  });

  // Process data for map
  const mapReferrals = useMemo(() => {
    return (activeReferrals?.data || []).map((r: any) => ({
      id: r.id,
      code: r.referralCode,
      priority: r.priority,
      status: r.status,
      fromFacility: {
        name: r.sendingFacility?.name,
        latitude: r.sendingFacility?.latitude,
        longitude: r.sendingFacility?.longitude,
      },
      toFacility: {
        name: r.receivingFacility?.name,
        latitude: r.receivingFacility?.latitude,
        longitude: r.receivingFacility?.longitude,
      },
    }));
  }, [activeReferrals]);

  const mapAmbulances = useMemo(() => {
    return (ambulancesData?.data || []).map((a: any) => ({
      id: a.id,
      ambulanceId: a.ambulanceId,
      status: a.status,
      latitude: a.latitude,
      longitude: a.longitude,
    }));
  }, [ambulancesData]);

  const mapFacilities = useMemo(() => {
    return (readinessData || []).map((r: any) => ({
      id: r.facilityId,
      name: r.facilityName || r.facility?.name || 'Unknown',
      latitude: r.facility?.latitude,
      longitude: r.facility?.longitude,
      readinessScore: r.overallScore,
      type: r.facility?.type,
    }));
  }, [readinessData]);

  // Stats calculations
  const totalReferrals = referralData?.summary?.totalReferrals || 0;
  const activeCount = activeReferrals?.data?.length || 0;
  const ambulances = ambulancesData?.data || [];
  const operationalAmbulances = ambulances.filter((a: any) => a.status !== 'MAINTENANCE' && a.status !== 'OUT_OF_SERVICE').length;
  const totalAmbulances = ambulances.length;
  const ambulancePercentage = totalAmbulances > 0 ? Math.round((operationalAmbulances / totalAmbulances) * 100) : 0;

  const facilitiesWithReadiness = readinessData?.length || 0;
  const totalFacilities = 160; // Approximate total
  const facilityReportingPercentage = Math.round((facilitiesWithReadiness / totalFacilities) * 100);

  // Calculate readiness counts for toggles
  const readinessCounts = useMemo(() => {
    const allFacilities = readinessData || [];
    return {
      high: allFacilities.filter((f: any) => (f.overallScore || 0) >= 8).length,
      medium: allFacilities.filter((f: any) => {
        const score = f.overallScore || 0;
        return score >= 5 && score < 8;
      }).length,
      low: allFacilities.filter((f: any) => (f.overallScore || 0) < 5).length,
    };
  }, [readinessData]);

  // Build a map of facility IDs to districts
  const facilityDistrictMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (!allFacilitiesData?.data) return map;
    
    allFacilitiesData.data.forEach((facility: any) => {
      map[facility.id] = facility.district?.name || facility.districtName || 'Unknown';
    });
    return map;
  }, [allFacilitiesData]);

  // District performance data
  const districtPerformance: DistrictPerformance[] = useMemo(() => {
    if (!facilityData || !districtsData) return [];
    
    // Group by district
    const byDistrict: Record<string, { 
      refs: number; 
      received: number;
      sent: number;
      time: number; 
      accepted: number;
      total: number;
      count: number 
    }> = {};
    
    // Initialize all districts
    districtsData.forEach((d: any) => {
      byDistrict[d.name] = { 
        refs: 0, 
        received: 0,
        sent: 0,
        time: 0, 
        accepted: 0,
        total: 0,
        count: 0 
      };
    });
    
    facilityData.forEach((f: any) => {
      // Find district for this facility
      const district = facilityDistrictMap[f.facilityId] || 'Unknown';
      if (!byDistrict[district]) {
        byDistrict[district] = { 
          refs: 0, 
          received: 0,
          sent: 0,
          time: 0, 
          accepted: 0,
          total: 0,
          count: 0 
        };
      }
      byDistrict[district].refs += (f.totalReferralsReceived || 0) + (f.totalReferralsSent || 0);
      byDistrict[district].received += f.totalReferralsReceived || 0;
      byDistrict[district].sent += f.totalReferralsSent || 0;
      byDistrict[district].time += f.averageResponseTimeMinutes || 0;
      byDistrict[district].accepted += (f.acceptanceRate || 0) * (f.totalReferralsReceived || 0);
      byDistrict[district].total += f.totalReferralsReceived || 0;
      byDistrict[district].count += 1;
    });

    return Object.entries(byDistrict)
      .map(([name, data]) => ({
        id: name,
        name,
        referralCount: data.refs,
        avgResponseTime: data.count > 0 ? Math.round(data.time / data.count) : 0,
        successRate: data.total > 0 ? Math.round(data.accepted / data.total) : 0,
      }))
      .filter(d => d.referralCount > 0) // Only show districts with data
      .sort((a, b) => b.referralCount - a.referralCount);
  }, [facilityData, districtsData, facilityDistrictMap, allFacilitiesData]);

  // Monthly trends (last 6 months)
  const monthlyTrends = useMemo(() => {
    if (!referralData?.trend) {
      // Generate mock data for demo
      return Array.from({ length: 6 }, (_, i) => ({
        month: format(subMonths(new Date(), 5 - i), 'MMM'),
        count: Math.floor(Math.random() * 3000) + 1500,
      }));
    }
    
    // Group by month
    const byMonth: Record<string, number> = {};
    referralData.trend.forEach((t: any) => {
      const month = format(new Date(t.date), 'MMM');
      byMonth[month] = (byMonth[month] || 0) + (t.count || 0);
    });

    return Object.entries(byMonth).map(([month, count]) => ({ month, count }));
  }, [referralData]);

  const columnHelper = createColumnHelper<DistrictPerformance>();
  
  const columns = useMemo<ColumnDef<DistrictPerformance, any>[]>(() => [
    columnHelper.accessor('name', {
      header: 'District',
      cell: info => <span style={{ fontWeight: 500 }}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('referralCount', {
      header: 'Referrals',
      cell: info => <span style={{ fontWeight: 600 }}>{info.getValue().toLocaleString()}</span>,
    }),
    columnHelper.accessor('avgResponseTime', {
      header: 'Avg Response',
      cell: info => (
        <span style={{ color: info.getValue() > 20 ? 'var(--warning)' : 'var(--text-secondary)' }}>
          {info.getValue()} min
        </span>
      ),
    }),
    columnHelper.accessor('successRate', {
      header: 'Acceptance',
      cell: info => {
        const rate = info.getValue();
        const color = rate >= 90 ? 'var(--success)' : rate >= 80 ? 'var(--warning)' : 'var(--error)';
        return <span style={{ fontWeight: 600, color }}>{rate}%</span>;
      },
    }),
  ], []);

  if (isLoadingReferrals) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto var(--space-3)' }} />
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Loading national data...</p>
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
            <span style={{ fontSize: '24px' }}>Sierra Leone</span> RMS Overview
          </h1>
          <p className="page-subtitle">
            Period: {currentMonth}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <StatCard
          label="Total Referrals"
          value={totalReferrals.toLocaleString()}
          icon={Activity}
          trend="12%"
          trendType="up"
          description="This month"
        />
        <StatCard
          label="Active"
          value={activeCount.toString()}
          icon={TrendingUp}
          trend=""
          trendType="neutral"
          variant="info"
          description="In transit now"
        />
        <StatCard
          label="Ambulances"
          value={`${operationalAmbulances}/${totalAmbulances}`}
          icon={Ambulance}
          trend={`${ambulancePercentage}% Op`}
          trendType={ambulancePercentage >= 80 ? 'up' : 'down'}
          variant={ambulancePercentage >= 80 ? 'success' : 'warning'}
          description="Operational"
        />
        <StatCard
          label="Facilities"
          value={`${facilitiesWithReadiness}/${totalFacilities}`}
          icon={Building2}
          trend={`${facilityReportingPercentage}% Rep`}
          trendType={facilityReportingPercentage >= 90 ? 'up' : 'neutral'}
          variant="default"
          description="Reporting readiness"
        />
      </div>

      {/* Live Referral Map */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ 
          padding: 'var(--space-4)', 
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-3)'
        }}>
          <h3 className="card-title">
            <MapPin size={16} />
            Live Referral Map
          </h3>
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Filters */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              <option value="">All Districts</option>
              {(districtsData || []).map((d: any) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              <option value="">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => setIsMapFullscreen(!isMapFullscreen)}
            >
              <Maximize2 size={14} />
            </button>
          </div>
        </div>
        <div style={{ padding: 'var(--space-2)' }}>
          <NationalReferralMap
            referrals={mapReferrals}
            ambulances={mapAmbulances}
            facilities={mapFacilities}
            height={isMapFullscreen ? 600 : 400}
            selectedDistrict={selectedDistrict}
            selectedPriority={selectedPriority}
            showReferrals={showReferrals}
            showAmbulances={showAmbulances}
            showHighReadiness={showHighReadiness}
            showMediumReadiness={showMediumReadiness}
            showLowReadiness={showLowReadiness}
          />
        </div>
        {/* Layer Toggles */}
        <div style={{
          padding: 'var(--space-3) var(--space-4)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: 'var(--space-4)',
          fontSize: '12px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {/* Active Referrals Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={showReferrals}
              onChange={(e) => setShowReferrals(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#DC2626',
              border: '2px solid #fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }} />
            <span>Active Referrals ({activeCount})</span>
          </label>

          {/* Ambulances Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={showAmbulances}
              onChange={(e) => setShowAmbulances(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#8B5CF6',
              border: '2px solid #fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }} />
            <span>Ambulances ({totalAmbulances})</span>
          </label>

          {/* High Readiness Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={showHighReadiness}
              onChange={(e) => setShowHighReadiness(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#10B981'
            }} />
            <span>High Readiness ({readinessCounts.high})</span>
          </label>

          {/* Medium Readiness Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={showMediumReadiness}
              onChange={(e) => setShowMediumReadiness(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#F59E0B'
            }} />
            <span>Medium Readiness ({readinessCounts.medium})</span>
          </label>

          {/* Low Readiness Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={showLowReadiness}
              onChange={(e) => setShowLowReadiness(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#DC2626'
            }} />
            <span>Low Readiness ({readinessCounts.low})</span>
          </label>
        </div>
      </div>

      {/* Bottom Row: District Performance + Monthly Trends */}
      <div className="dashboard-grid">
        {/* District Performance */}
        <div className="col-6">
          <div className="card" style={{ height: '100%' }}>
            <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 className="card-title">
                <Building2 size={16} />
                District Performance
              </h3>
            </div>
            <DataTable 
              data={districtPerformance}
              columns={columns}
              emptyMessage="No district data available"
            />
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="col-6">
          <div className="card" style={{ height: '100%' }}>
            <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 className="card-title">
                <Calendar size={16} />
                Monthly Trends
              </h3>
            </div>
            <div style={{ height: 300, padding: 'var(--space-4)' }}>
              {monthlyTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorNational" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} 
                      tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      name="Referrals"
                      stroke="var(--accent)" 
                      fillOpacity={1} 
                      fill="url(#colorNational)" 
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
      </div>
    </>
  );
}
