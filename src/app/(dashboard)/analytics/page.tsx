'use client';

import { useState } from 'react';
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

// Mock Data
const volumeData = [
  { date: 'Dec 1', referrals: 45, emergency: 12 },
  { date: 'Dec 4', referrals: 52, emergency: 15 },
  { date: 'Dec 7', referrals: 49, emergency: 18 },
  { date: 'Dec 10', referrals: 62, emergency: 25 },
  { date: 'Dec 13', referrals: 58, emergency: 20 },
  { date: 'Dec 16', referrals: 71, emergency: 28 },
  { date: 'Dec 19', referrals: 65, emergency: 22 },
];

const priorityData = [
  { name: 'Critical', value: 18, color: '#DC2626' },   // --priority-critical
  { name: 'High', value: 35, color: '#F59E0B' },       // --priority-high
  { name: 'Medium', value: 28, color: '#3B82F6' },     // --priority-medium
  { name: 'Low', value: 19, color: '#10B981' },        // --priority-low
];

const outcomeData = [
  { name: 'Discharged', value: 85, color: '#10B981' },
  { name: 'Admitted', value: 10, color: '#3B82F6' },
  { name: 'Referred', value: 3, color: '#F59E0B' },
  { name: 'Deceased', value: 2, color: '#DC2626' },
];

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
          value="1,247"
          icon={Activity}
          trend="12.5%"
          trendType="up"
          variant="info"
        />
        <StatCard
          label="Avg Response Time"
          value="42 min"
          icon={Clock}
          trend="8.3%"
          trendType="down"
          variant="success"
        />
        <StatCard
          label="Success Rate"
          value="92%"
          icon={TrendingUp}
          trend="3.2%"
          trendType="up"
          variant="success"
        />
        <StatCard
          label="Mortality Rate"
          value="1.2%"
          icon={AlertTriangle}
          trend="0.5%"
          trendType="down"
          variant="warning"
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
                <AreaChart data={volumeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEmer" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DC2626" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6B7280' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6B7280' }} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="referrals" 
                    name="Total Referrals"
                    stroke="#2563EB" 
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="emergency" 
                    name="Emergency"
                    stroke="#DC2626" 
                    fillOpacity={1} 
                    fill="url(#colorEmer)" 
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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
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
                        return (
                          <div className="bg-white border rounded-lg p-2 shadow-md text-xs">
                            <span style={{ color: payload[0].payload.color, fontWeight: 600 }}>
                              {payload[0].value}%
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={outcomeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {outcomeData.map((entry, index) => (
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
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--foreground)' }}>92%</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Success</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {outcomeData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                  <span className="text-muted">{item.name}</span>
                  <span className="font-medium ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alert Cards */}
        <div className="col-8">
          <div className="card h-full">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2">
                <AlertTriangle size={16} />
                Critical Insights
              </h3>
            </div>
            <div className="flex gap-4 p-2">
              <div className="flex-1 p-4 rounded-lg border border-yellow-200 bg-yellow-50" style={{ background: 'var(--warning-light)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                <div className="flex gap-3">
                  <AlertTriangle className="text-yellow-600 shrink-0" size={20} style={{ color: 'var(--warning)' }} />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1" style={{ color: '#92400E' }}>High Rejection Rate detected</h4>
                    <p className="text-sm text-yellow-700" style={{ color: '#B45309' }}>
                      Bo Government Hospital has a 34% rejection rate this week. Consider capacity review.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 p-4 rounded-lg border border-blue-200 bg-blue-50" style={{ background: 'var(--info-light)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
                <div className="flex gap-3">
                  <TrendingUp className="text-blue-600 shrink-0" size={20} style={{ color: 'var(--info)' }} />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1" style={{ color: '#1E40AF' }}>Obstetric referrals trending up</h4>
                    <p className="text-sm text-blue-700" style={{ color: '#1D4ED8' }}>
                      23% increase in maternal referrals. Ensure adequate EmONC capacity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
