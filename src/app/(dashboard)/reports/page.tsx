'use client';

import { useState, useMemo } from 'react';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui';
import { 
  FileText, 
  Download,
  Calendar,
  Filter,
  BarChart3,
  Users,
  Building2,
  Activity,
  Clock
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'scheduled' | 'custom';
  frequency?: string;
  lastGenerated?: Date;
  icon: React.ReactNode;
}

interface RecentDownload {
  id: string;
  report: string;
  generated: string;
  period: string;
  size: string;
}

const reports: Report[] = [
  { id: '1', name: 'Monthly Referral Summary', description: 'Overview of all referrals by status, type, and facility', type: 'scheduled', frequency: 'Monthly', lastGenerated: new Date(Date.now() - 86400000), icon: <Activity size={20} /> },
  { id: '2', name: 'Facility Performance Report', description: 'Response times, acceptance rates, and capacity utilization', type: 'scheduled', frequency: 'Weekly', lastGenerated: new Date(Date.now() - 172800000), icon: <Building2 size={20} /> },
  { id: '3', name: 'Patient Outcomes Report', description: 'Track patient journey from referral to discharge', type: 'scheduled', frequency: 'Monthly', lastGenerated: new Date(Date.now() - 604800000), icon: <Users size={20} /> },
  { id: '4', name: 'Response Time Analysis', description: 'Detailed breakdown of response times by priority', type: 'custom', icon: <Clock size={20} /> },
  { id: '5', name: 'District Comparison', description: 'Compare referral patterns across districts', type: 'custom', icon: <BarChart3 size={20} /> },
];

const recentDownloads: RecentDownload[] = [
  { id: '1', report: 'Monthly Referral Summary', generated: 'Dec 1, 2024', period: 'Nov 2024', size: '2.4 MB' },
  { id: '2', report: 'Facility Performance Report', generated: 'Nov 25, 2024', period: 'Week 47', size: '856 KB' },
  { id: '3', report: 'Patient Outcomes Report', generated: 'Nov 1, 2024', period: 'Oct 2024', size: '1.8 MB' },
];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  // Define columns for recent downloads
  const columnHelper = createColumnHelper<RecentDownload>();
  
  const columns = useMemo<ColumnDef<RecentDownload, any>[]>(() => [
    columnHelper.accessor('report', {
      header: 'Report',
      cell: info => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor('generated', {
      header: 'Generated',
      cell: info => <span style={{ color: 'var(--muted)' }}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('period', {
      header: 'Period',
      cell: info => <span style={{ color: 'var(--muted)' }}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('size', {
      header: 'Size',
      cell: info => <span style={{ color: 'var(--muted)' }}>{info.getValue()}</span>,
    }),
    columnHelper.display({
      id: 'actions',
      cell: () => (
        <button className="btn btn-ghost btn-sm">
          <Download size={14} />
        </button>
      ),
    }),
  ], []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Generate and download system reports</p>
        </div>
      </div>

      {/* Quick Date Selection */}
      <div className="card mb-4">
        <div className="flex items-center gap-4" style={{ flexWrap: 'wrap' }}>
          <div className="flex items-center gap-2">
            <Calendar size={16} style={{ color: 'var(--muted)' }} />
            <span className="text-sm font-medium">Date Range</span>
          </div>
          <div className="flex gap-1">
            {['Today', 'This Week', 'This Month', 'This Quarter', 'This Year'].map((label) => (
              <button key={label} className="btn btn-ghost btn-sm">{label}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="form-input"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              style={{ width: 'auto', height: 32, fontSize: 'var(--text-xs)' }}
            />
            <span className="text-muted">to</span>
            <input
              type="date"
              className="form-input"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              style={{ width: 'auto', height: 32, fontSize: 'var(--text-xs)' }}
            />
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Scheduled Reports */}
        <div className="col-12">
          <div className="card">
            <h3 className="card-title mb-4">
              <Clock size={16} />
              Scheduled Reports
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
              {reports.filter(r => r.type === 'scheduled').map((report) => (
                <div 
                  key={report.id}
                  className="p-4"
                  style={{ 
                    border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all var(--duration-fast) var(--ease)'
                  }}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div style={{ 
                      width: 40, 
                      height: 40, 
                      background: 'var(--accent)', 
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--muted)'
                    }}>
                      {report.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="font-medium">{report.name}</div>
                      <div className="text-xs text-muted">{report.frequency}</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted mb-3">{report.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted">
                      Last: {report.lastGenerated?.toLocaleDateString()}
                    </span>
                    <button className="btn btn-primary btn-sm">
                      <Download size={12} />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Reports */}
        <div className="col-12">
          <div className="card">
            <h3 className="card-title mb-4">
              <Filter size={16} />
              Custom Reports
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
              {reports.filter(r => r.type === 'custom').map((report) => (
                <div 
                  key={report.id}
                  className="p-4"
                  style={{ 
                    border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer'
                  }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div style={{ 
                      width: 40, 
                      height: 40, 
                      background: 'var(--accent)', 
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--muted)'
                    }}>
                      {report.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="font-medium">{report.name}</div>
                      <div className="text-xs text-muted">Custom</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted mb-3">{report.description}</p>
                  <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                    Configure & Generate
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Downloads */}
        <div className="col-12">
          <div className="card">
            <h3 className="card-title mb-4">
              <FileText size={16} />
              Recent Downloads
            </h3>
            <DataTable 
              data={recentDownloads} 
              columns={columns}
              emptyMessage="No recent downloads"
            />
          </div>
        </div>
      </div>
    </>
  );
}
