'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { DataTable } from '@/components/ui';
import { facilityService } from '@/lib/api';
import { Facility, FacilityStats } from '@/types';
import { 
  Building2, 
  Search,
  MapPin,
  Phone,
  Edit,
  Upload,
  Filter,
  List,
  Map
} from 'lucide-react';
import Link from 'next/link';

// Dynamic import for map component (SSR incompatible)
const FacilitiesMap = dynamic(() => import('@/components/FacilitiesMap'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  ),
});

const facilityTypes = ['PHU', 'DISTRICT_HOSPITAL', 'REGIONAL_HOSPITAL', 'TERTIARY_HOSPITAL'];

export default function AdminFacilitiesPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['facility-stats'],
    queryFn: () => facilityService.getStats(),
  });

  // Fetch facilities with filters
  const { data: facilitiesData, isLoading: facilitiesLoading } = useQuery({
    queryKey: ['admin-facilities', typeFilter],
    queryFn: () => facilityService.list({ 
      limit: 2000,
      facilityType: typeFilter || undefined,
    }),
  });

  const facilities = facilitiesData?.data || [];

  // Filter by district on client side (since API might not support it directly by name)
  const filteredFacilities = useMemo(() => {
    if (!districtFilter) return facilities;
    return facilities.filter(f => f.district?.name === districtFilter);
  }, [facilities, districtFilter]);

  // Get unique districts for filter dropdown
  const districts = useMemo(() => {
    if (!stats?.byDistrict) return [];
    return Object.keys(stats.byDistrict).sort();
  }, [stats]);

  const isLoading = statsLoading || facilitiesLoading;

  // Define columns
  const columnHelper = createColumnHelper<Facility>();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Facility',
      cell: info => (
        <div className="flex items-center gap-3">
          <div style={{ 
            width: 40, 
            height: 40, 
            background: 'var(--accent)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Building2 size={20} style={{ color: 'var(--muted)' }} />
          </div>
          <div>
            <div className="font-medium">{info.getValue()}</div>
            <div className="text-xs text-muted">{info.row.original.facilityCode}</div>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: info => (
        <span style={{ 
          padding: 'var(--space-1) var(--space-2)', 
          background: info.getValue() === 'PHU' ? 'rgba(34, 197, 94, 0.1)' : 'var(--accent)',
          color: info.getValue() === 'PHU' ? 'var(--success)' : 'inherit',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-xs)',
          fontWeight: 500
        }}>
          {info.getValue()}
        </span>
      ),
      filterFn: 'equalsString',
    }),
    columnHelper.accessor(row => row.district?.name, {
      id: 'district',
      header: 'District',
      cell: info => (
        <div className="flex items-center gap-1 text-sm text-muted">
          <MapPin size={12} />
          {info.getValue() || 'Unknown'}
        </div>
      ),
    }),
    columnHelper.accessor('phone', {
      header: 'Contact',
      cell: info => {
        const phone = info.getValue();
        return phone ? (
          <div className="flex items-center gap-1 text-sm">
            <Phone size={12} style={{ color: 'var(--muted)' }} />
            {phone}
          </div>
        ) : (
          <span className="text-muted">-</span>
        );
      },
    }),
    columnHelper.accessor('address', {
      header: 'Address',
      cell: info => {
        const address = info.getValue();
        return address ? (
          <div className="text-sm text-muted" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {address}
          </div>
        ) : (
          <span className="text-muted">-</span>
        );
      },
    }),
    columnHelper.display({
      id: 'coordinates',
      header: 'Coordinates',
      cell: info => {
        const { latitude, longitude } = info.row.original;
        return latitude && longitude ? (
          <div className="text-xs text-muted">
            {Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)}
          </div>
        ) : (
          <span className="text-muted">-</span>
        );
      },
    }),
    columnHelper.display({
      id: 'actions',
      cell: info => (
        <div className="flex gap-1">
          <Link href={`/facilities/${info.row.original.id}`} className="btn btn-ghost btn-sm btn-icon">
            <Edit size={14} />
          </Link>
        </div>
      ),
    }),
  ], []);

  // Calculate totals from stats
  const totalHospitals = (stats?.byType?.['DISTRICT_HOSPITAL'] || 0) + 
                          (stats?.byType?.['REGIONAL_HOSPITAL'] || 0) + 
                          (stats?.byType?.['TERTIARY_HOSPITAL'] || 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Facility Management</h1>
          <p className="page-subtitle">Manage healthcare facilities</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Link href="/facilities" className="btn btn-secondary">
            <Upload size={16} />
            Bulk Upload
          </Link>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-label">Total Facilities</div>
          <div className="stat-value">
            {statsLoading ? '...' : (stats?.totalFacilities || 0).toLocaleString()}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Districts Covered</div>
          <div className="stat-value">
            {statsLoading ? '...' : (stats?.totalDistricts || 0)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">PHUs</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            {statsLoading ? '...' : (stats?.byType?.['PHU'] || 0).toLocaleString()}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Hospitals</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>
            {statsLoading ? '...' : totalHospitals.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} className="search-box-icon" />
          <input
            type="text"
            className="search-box-input"
            placeholder="Search facilities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-box-kbd">/</span>
        </div>

        <div className="filter-divider" />

        <div className="flex items-center gap-2">
          <Filter size={16} style={{ color: 'var(--muted)' }} />
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            {facilityTypes.map(type => (
              <option key={type} value={type}>
                {type} ({stats?.byType?.[type] || 0})
              </option>
            ))}
          </select>
        </div>

        <select
          className="filter-select"
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
        >
          <option value="">All Districts</option>
          {districts.map(district => (
            <option key={district} value={district}>
              {district} ({stats?.byDistrict?.[district] || 0})
            </option>
          ))}
        </select>

        {(typeFilter || districtFilter) && (
          <button 
            className="btn btn-ghost btn-sm"
            onClick={() => { setTypeFilter(''); setDistrictFilter(''); }}
          >
            Clear Filters
          </button>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-1)' }}>
          <button
            className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('table')}
            title="Table View"
          >
            <List size={16} />
            Table
          </button>
          <button
            className={`btn btn-sm ${viewMode === 'map' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('map')}
            title="Map View"
          >
            <Map size={16} />
            Map
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : viewMode === 'table' ? (
        <DataTable 
          data={filteredFacilities} 
          columns={columns}
          globalFilter={search}
          onGlobalFilterChange={setSearch}
          emptyMessage="No facilities found"
        />
      ) : (
        <FacilitiesMap 
          facilities={filteredFacilities} 
          isLoading={isLoading} 
        />
      )}
    </>
  );
}
