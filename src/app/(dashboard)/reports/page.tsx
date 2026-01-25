'use client';

import { useState, useMemo } from 'react';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui';
import { 
  FileText, 
  Download,
  Calendar,
  BarChart3,
  Users,
  Building2,
  Activity,
  Clock,
  FileSpreadsheet,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Search
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'scheduled' | 'custom';
  frequency?: string;
  lastGenerated?: Date;
  category: string;
}

interface RecentDownload {
  id: string;
  report: string;
  generated: string;
  period: string;
  size: string;
  format: string;
}

const reports: Report[] = [
  { id: '1', name: 'Monthly Referral Summary', description: 'Overview of all referrals by status, type, and facility', type: 'scheduled', frequency: 'Monthly', lastGenerated: new Date(Date.now() - 86400000), category: 'Referrals' },
  { id: '2', name: 'Facility Performance Report', description: 'Response times, acceptance rates, and capacity utilization', type: 'scheduled', frequency: 'Weekly', lastGenerated: new Date(Date.now() - 172800000), category: 'Performance' },
  { id: '3', name: 'Patient Outcomes Report', description: 'Track patient journey from referral to discharge', type: 'scheduled', frequency: 'Monthly', lastGenerated: new Date(Date.now() - 604800000), category: 'Outcomes' },
  { id: '4', name: 'Response Time Analysis', description: 'Detailed breakdown of response times by priority level', type: 'custom', category: 'Performance' },
  { id: '5', name: 'District Comparison', description: 'Compare referral patterns and outcomes across districts', type: 'custom', category: 'Analytics' },
  { id: '6', name: 'Critical Cases Report', description: 'Analysis of critical priority referrals and outcomes', type: 'custom', category: 'Referrals' },
];

const recentDownloads: RecentDownload[] = [
  { id: '1', report: 'Monthly Referral Summary', generated: 'Jan 1, 2025', period: 'Dec 2024', size: '2.4 MB', format: 'PDF' },
  { id: '2', report: 'Facility Performance Report', generated: 'Dec 25, 2024', period: 'Week 52', size: '856 KB', format: 'XLSX' },
  { id: '3', report: 'Patient Outcomes Report', generated: 'Dec 1, 2024', period: 'Nov 2024', size: '1.8 MB', format: 'PDF' },
  { id: '4', report: 'Critical Cases Report', generated: 'Nov 28, 2024', period: 'Q4 2024', size: '1.2 MB', format: 'PDF' },
];

const getReportIcon = (category: string) => {
  switch (category) {
    case 'Referrals': return <Activity size={20} />;
    case 'Performance': return <TrendingUp size={20} />;
    case 'Outcomes': return <Users size={20} />;
    case 'Analytics': return <BarChart3 size={20} />;
    default: return <FileText size={20} />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Referrals': return { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' };
    case 'Performance': return { bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' };
    case 'Outcomes': return { bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' };
    case 'Analytics': return { bg: 'rgba(234, 179, 8, 0.15)', color: '#fbbf24', border: 'rgba(234, 179, 8, 0.3)' };
    default: return { bg: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: 'var(--border-subtle)' };
  }
};

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [activePeriod, setActivePeriod] = useState('This Month');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      if (categoryFilter && r.category !== categoryFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return r.name.toLowerCase().includes(s) || r.description.toLowerCase().includes(s);
      }
      return true;
    });
  }, [categoryFilter, search]);

  // Define columns for recent downloads
  const columnHelper = createColumnHelper<RecentDownload>();
  
  const columns = useMemo<ColumnDef<RecentDownload, any>[]>(() => [
    columnHelper.accessor('report', {
      header: 'Report',
      cell: info => (
        <div className="flex items-center gap-3">
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileText size={14} style={{ color: 'var(--accent-light)' }} />
          </div>
          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor('period', {
      header: 'Period',
      cell: info => <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('generated', {
      header: 'Generated',
      cell: info => <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('format', {
      header: 'Format',
      cell: info => (
        <span style={{
          padding: '3px 8px',
          background: info.getValue() === 'PDF' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
          color: info.getValue() === 'PDF' ? '#f87171' : '#4ade80',
          borderRadius: 'var(--radius-full)',
          fontSize: '10px',
          fontWeight: 600
        }}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('size', {
      header: 'Size',
      cell: info => <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>{info.getValue()}</span>,
    }),
    columnHelper.display({
      id: 'actions',
      cell: () => (
        <button className="btn btn-ghost btn-sm">
          <Download size={14} />
          Download
        </button>
      ),
    }),
  ], []);

  const periodOptions = ['Today', 'This Week', 'This Month', 'This Quarter', 'This Year'];
  const categories = ['Referrals', 'Performance', 'Outcomes', 'Analytics'];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Generate and download system reports</p>
        </div>
        <button className="btn btn-primary">
          <FileSpreadsheet size={16} />
          Create Custom Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 'var(--space-5)' }}>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
              <FileText size={20} style={{ color: '#60a5fa' }} />
            </div>
          </div>
          <div className="stat-label">Total Reports</div>
          <div className="stat-value">{reports.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
              <Clock size={20} style={{ color: '#4ade80' }} />
            </div>
          </div>
          <div className="stat-label">Scheduled</div>
          <div className="stat-value">{reports.filter(r => r.type === 'scheduled').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.15)' }}>
              <BarChart3 size={20} style={{ color: '#c084fc' }} />
            </div>
          </div>
          <div className="stat-label">Custom</div>
          <div className="stat-value">{reports.filter(r => r.type === 'custom').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(234, 179, 8, 0.15)' }}>
              <Download size={20} style={{ color: '#fbbf24' }} />
            </div>
          </div>
          <div className="stat-label">Downloads Today</div>
          <div className="stat-value">{recentDownloads.length}</div>
        </div>
      </div>

      {/* Date Selection Bar */}
      <div className="filter-bar" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="flex items-center gap-2">
          <Calendar size={16} style={{ color: 'var(--text-tertiary)' }} />
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>Date Range</span>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '2px',
          padding: '4px',
          background: 'var(--bg-subtle)', 
          borderRadius: 'var(--radius-lg)'
        }}>
          {periodOptions.map((label) => (
            <button 
              key={label}
              onClick={() => setActivePeriod(label)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 500,
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: activePeriod === label ? 'var(--accent-subtle)' : 'transparent',
                color: activePeriod === label ? 'var(--accent-light)' : 'var(--text-tertiary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {label}
            </button>
          ))}
        </div>
        
        <div className="filter-divider" />
        
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="form-input"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            style={{ width: 'auto', height: 36, fontSize: '12px' }}
          />
          <span style={{ color: 'var(--text-muted)' }}>to</span>
          <input
            type="date"
            className="form-input"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            style={{ width: 'auto', height: 36, fontSize: '12px' }}
          />
        </div>
      </div>

      {/* Report Categories Filter */}
      <div className="filter-bar" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="search-box" style={{ flex: 1, minWidth: 250 }}>
          <Search size={16} className="search-box-icon" />
          <input
            type="text"
            className="search-box-input"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-divider" />
        <select 
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="dashboard-grid">
        {/* Scheduled Reports */}
        <div className="col-12">
          <div className="card">
            <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 className="card-title">
                <Clock size={16} />
                Scheduled Reports
              </h3>
            </div>
            <div style={{ padding: 'var(--space-4)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-4)' }}>
                {filteredReports.filter(r => r.type === 'scheduled').map((report) => {
                  const catColor = getCategoryColor(report.category);
                  return (
                    <div 
                      key={report.id}
                      style={{ 
                        padding: 'var(--space-4)',
                        border: '1px solid var(--border-default)', 
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--bg-surface)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div style={{ 
                          width: 44, 
                          height: 44, 
                          background: catColor.bg,
                          border: `1px solid ${catColor.border}`,
                          borderRadius: 'var(--radius-lg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: catColor.color,
                          flexShrink: 0
                        }}>
                          {getReportIcon(report.category)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                            {report.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <span style={{
                              padding: '2px 8px',
                              background: catColor.bg,
                              color: catColor.color,
                              borderRadius: 'var(--radius-full)',
                              fontSize: '10px',
                              fontWeight: 500
                            }}>
                              {report.category}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{report.frequency}</span>
                          </div>
                        </div>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)', lineHeight: 1.5 }}>
                        {report.description}
                      </p>
                      <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                          Last: {report.lastGenerated?.toLocaleDateString()}
                        </span>
                        <button className="btn btn-primary btn-sm">
                          <Download size={12} />
                          Download
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Custom Reports */}
        <div className="col-12">
          <div className="card">
            <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 className="card-title">
                <BarChart3 size={16} />
                Custom Reports
              </h3>
            </div>
            <div style={{ padding: 'var(--space-4)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-4)' }}>
                {filteredReports.filter(r => r.type === 'custom').map((report) => {
                  const catColor = getCategoryColor(report.category);
                  return (
                    <div 
                      key={report.id}
                      style={{ 
                        padding: 'var(--space-4)',
                        border: '1px solid var(--border-default)', 
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--bg-surface)'
                      }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div style={{ 
                          width: 44, 
                          height: 44, 
                          background: catColor.bg,
                          border: `1px solid ${catColor.border}`,
                          borderRadius: 'var(--radius-lg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: catColor.color,
                          flexShrink: 0
                        }}>
                          {getReportIcon(report.category)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                            {report.name}
                          </div>
                          <span style={{
                            padding: '2px 8px',
                            background: catColor.bg,
                            color: catColor.color,
                            borderRadius: 'var(--radius-full)',
                            fontSize: '10px',
                            fontWeight: 500
                          }}>
                            {report.category}
                          </span>
                        </div>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)', lineHeight: 1.5 }}>
                        {report.description}
                      </p>
                      <button className="btn btn-secondary" style={{ width: '100%' }}>
                        Configure & Generate
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Downloads */}
        <div className="col-12">
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 className="card-title">
                <Download size={16} />
                Recent Downloads
              </h3>
            </div>
            <div style={{ padding: 'var(--space-4)' }}>
              <DataTable 
                data={recentDownloads} 
                columns={columns}
                emptyMessage="No recent downloads"
                emptyDescription="Generated reports will appear here"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
