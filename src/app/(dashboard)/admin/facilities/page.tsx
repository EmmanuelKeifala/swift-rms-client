'use client';

import { useState, useMemo } from 'react';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui';
import { 
  Building2, 
  Plus,
  Search,
  MapPin,
  Phone,
  BedDouble,
  Users,
  Edit,
  Trash2,
  Check,
  X
} from 'lucide-react';

interface Facility {
  id: string;
  name: string;
  type: string;
  district: string;
  phone?: string;
  totalBeds: number;
  totalStaff: number;
  isActive: boolean;
  coordinates?: { lat: number; lng: number };
}

const mockFacilities: Facility[] = [
  { id: '1', name: 'Connaught Hospital', type: 'HOSPITAL', district: 'Western Area Urban', phone: '+232 22 224 365', totalBeds: 300, totalStaff: 450, isActive: true },
  { id: '2', name: 'Princess Christian Hospital', type: 'HOSPITAL', district: 'Western Area Urban', phone: '+232 22 225 890', totalBeds: 200, totalStaff: 280, isActive: true },
  { id: '3', name: 'Bo Government Hospital', type: 'HOSPITAL', district: 'Bo', phone: '+232 32 123 456', totalBeds: 180, totalStaff: 220, isActive: true },
  { id: '4', name: 'Kenema Government Hospital', type: 'HOSPITAL', district: 'Kenema', totalBeds: 150, totalStaff: 180, isActive: true },
  { id: '5', name: 'Makeni Government Hospital', type: 'HOSPITAL', district: 'Bombali', totalBeds: 120, totalStaff: 150, isActive: false },
  { id: '6', name: 'Murray Town CHC', type: 'CHC', district: 'Western Area Urban', totalBeds: 20, totalStaff: 35, isActive: true },
  { id: '7', name: 'Waterloo CHC', type: 'CHC', district: 'Western Area Rural', totalBeds: 15, totalStaff: 28, isActive: true },
];

const facilityTypes = ['HOSPITAL', 'CHC', 'CHP', 'MCHP', 'CLINIC'];

export default function AdminFacilitiesPage() {
  const [facilities] = useState<Facility[]>(mockFacilities);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const totalBeds = facilities.reduce((acc, f) => acc + f.totalBeds, 0);
  const totalStaff = facilities.reduce((acc, f) => acc + f.totalStaff, 0);

  // Define columns
  const columnHelper = createColumnHelper<Facility>();
  
  const columns = useMemo<ColumnDef<Facility, any>[]>(() => [
    columnHelper.accessor('name', {
      header: 'Facility',
      cell: info => (
        <div className="flex items-center gap-3">
          <div style={{ 
            width: 40, 
            height: 40, 
            background: info.row.original.isActive ? 'var(--accent)' : 'var(--gray-100)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Building2 size={20} style={{ color: info.row.original.isActive ? 'var(--muted)' : 'var(--gray-300)' }} />
          </div>
          <div className="font-medium">{info.getValue()}</div>
        </div>
      ),
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: info => (
        <span style={{ 
          padding: 'var(--space-1) var(--space-2)', 
          background: 'var(--accent)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-xs)',
          fontWeight: 500
        }}>
          {info.getValue()}
        </span>
      ),
      filterFn: 'equalsString',
    }),
    columnHelper.accessor('district', {
      header: 'District',
      cell: info => (
        <div className="flex items-center gap-1 text-sm text-muted">
          <MapPin size={12} />
          {info.getValue()}
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
    columnHelper.display({
      id: 'capacity',
      header: 'Capacity',
      cell: info => (
        <div className="flex gap-4 text-sm">
          <span className="flex items-center gap-1">
            <BedDouble size={12} style={{ color: 'var(--muted)' }} />
            {info.row.original.totalBeds}
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} style={{ color: 'var(--muted)' }} />
            {info.row.original.totalStaff}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor('isActive', {
      header: 'Status',
      cell: info => {
        const isActive = info.getValue();
        return isActive ? (
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--success)' }}>
            <Check size={12} />
            Active
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted)' }}>
            <X size={12} />
            Inactive
          </span>
        );
      },
    }),
    columnHelper.display({
      id: 'actions',
      cell: () => (
        <div className="flex gap-1">
          <button className="btn btn-ghost btn-sm btn-icon">
            <Edit size={14} />
          </button>
          <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--error)' }}>
            <Trash2 size={14} />
          </button>
        </div>
      ),
    }),
  ], []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Facility Management</h1>
          <p className="page-subtitle">Manage healthcare facilities</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          Add Facility
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-label">Total Facilities</div>
          <div className="stat-value">{facilities.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            {facilities.filter(f => f.isActive).length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Beds</div>
          <div className="stat-value">{totalBeds.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Staff</div>
          <div className="stat-value">{totalStaff.toLocaleString()}</div>
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
      </div>

      <DataTable 
        data={facilities} 
        columns={columns}
        globalFilter={search}
        onGlobalFilterChange={setSearch}
        emptyMessage="No facilities found"
      />

      {/* Add Facility Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 'var(--space-4)'
        }}>
          <div className="card" style={{ maxWidth: 520, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <h3 className="card-title mb-4">Add New Facility</h3>
            <div className="form-group">
              <label className="form-label">Facility Name</label>
              <input type="text" className="form-input" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-input">
                  {facilityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">District</label>
                <select className="form-input">
                  <option>Western Area Urban</option>
                  <option>Western Area Rural</option>
                  <option>Bo</option>
                  <option>Kenema</option>
                  <option>Bombali</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="tel" className="form-input" placeholder="+232 XX XXX XXXX" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div className="form-group">
                <label className="form-label">Total Beds</label>
                <input type="number" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Total Staff</label>
                <input type="number" className="form-input" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div className="form-group">
                <label className="form-label">Latitude</label>
                <input type="number" step="0.000001" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Longitude</label>
                <input type="number" step="0.000001" className="form-input" />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary">
                Create Facility
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
