'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { facilityService, districtService } from '@/lib/api';
import type { District } from '@/lib/api/districts';
import { FacilityType, BulkUploadFacilityItem, BulkUploadResult } from '@/types';
import { 
  Search, 
  Building2,
  MapPin,
  Phone,
  Activity,
  Plus,
  X,
  Upload,
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  LayoutGrid,
  List
} from 'lucide-react';
import { DataTable } from '@/components/ui';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';

const facilitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  facilityCode: z.string().min(1, 'Code is required'),
  facilityType: z.string().min(1, 'Type is required'),
  level: z.number().min(1).max(4),
  districtId: z.string().min(1, 'District is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type FacilityFormData = z.infer<typeof facilitySchema>;

// CSV Parser helper
function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  const normalizedText = text.replace(/^\uFEFF/, '');

  for (let i = 0; i < normalizedText.length; i += 1) {
    const char = normalizedText[i];

    if (inQuotes) {
      if (char === '"') {
        const nextChar = normalizedText[i + 1];
        if (nextChar === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(field);
        field = '';
      } else if (char === '\n') {
        row.push(field);
        field = '';
        if (row.some(value => value.trim() !== '')) {
          rows.push(row);
        }
        row = [];
      } else if (char !== '\r') {
        field += char;
      }
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some(value => value.trim() !== '')) {
      rows.push(row);
    }
  }

  if (rows.length === 0) return { headers: [], rows: [] };

  const normalizeHeader = (header: string) =>
    header.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();

  const headers = rows[0].map(header => normalizeHeader(header));
  const parsedRows: Record<string, string>[] = [];

  for (let i = 1; i < rows.length; i += 1) {
    const values = rows[i];
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index]?.trim() || '';
    });
    parsedRows.push(record);
  }

  return { headers, rows: parsedRows };
}

// Default column mappings for WHO AHO format
const defaultColumnMappings: Record<string, string> = {
  name: 'name',
  facilityCode: 'facilityCode',
  facilityType: 'facilityType',
  level: 'level',
  districtName: 'districtName',
  districtCode: 'districtCode',
  address: 'address',
  latitude: 'latitude',
  longitude: 'longitude',
  phone: 'phone',
  email: 'email',
};

export default function FacilitiesPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showModal, setShowModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [csvData, setCsvData] = useState<{ headers: string[]; rows: Record<string, string>[] } | null>(null);
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>(defaultColumnMappings);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: facilitiesResponse, isLoading } = useQuery({
    queryKey: ['facilities'],
    queryFn: () => facilityService.list(),
  });

  const facilities = facilitiesResponse?.data || [];

  const { data: districts = [] } = useQuery({
    queryKey: ['districts'],
    queryFn: () => districtService.list(),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FacilityFormData>({
    resolver: zodResolver(facilitySchema),
    defaultValues: {
      level: 1,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: FacilityFormData) => facilityService.create({
      ...data,
      facilityType: data.facilityType as FacilityType,
      email: data.email || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      setShowModal(false);
      reset();
    },
  });

  const bulkUploadMutation = useMutation({
    mutationFn: (facilities: BulkUploadFacilityItem[]) => facilityService.bulkUpload(facilities),
    onSuccess: (result) => {
      setUploadResult(result);
      if (result.successful > 0) {
        queryClient.invalidateQueries({ queryKey: ['facilities'] });
      }
    },
  });

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      setCsvData(parsed);
      setUploadResult(null);
      
      // Auto-detect column mappings with expanded matching
      const newMappings: Record<string, string> = {};
      const normalizeKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normalizedHeaders = parsed.headers.map(normalizeKey);
      
      // Define aliases for each field - updated to match SLE Health Facility List CSV format
      const fieldAliases: Record<string, string[]> = {
        name: ['name', 'facilityname', 'facility_name', 'hfname', 'healthfacilityname', 'fac_name', 'facility'],
        facilityCode: ['facilitycode', 'code', 'facility_code', 'hfcode', 'id', 'facilityid', 'fac_id'],
        facilityType: ['facilitytype', 'type', 'facility_type', 'hftype', 'category'],
        level: ['level', 'facilitylevel', 'tier'],
        districtName: ['districtname', 'district', 'district_name', 'lga', 'county'],
        districtCode: ['districtcode', 'district_code', 'lgacode'],
        address: ['address', 'location', 'administrative_location', 'administrativelocation', 'physicaladdress', 'community', 'section', 'chiefdom', 'chiefdom2'],
        latitude: ['latitude', 'lat', 'y', 'geolat', 'geo_lat', 'ycoord', 'y_coord'],
        longitude: ['longitude', 'long', 'lng', 'lon', 'x', 'geolong', 'geo_long', 'xcoord', 'x_coord'],
        phone: ['phone', 'telephone', 'tel', 'phonenumber', 'phone_number', 'contact', 'fac_phone', 'inchargecontact', 'inchargecontact', 'facinchargecontact'],
        email: ['email', 'emailaddress', 'email_address', 'mail', 'fac_email'],
        ownership: ['ownership', 'owner', 'authority'],
        status: ['status'],
        functional: ['functional'],
        managerName: ['managername', 'manager_name', 'facinchargemanagername', 'incharge', 'manager', 'facinchargemanagername'],
        region: ['region'],
      };
      
      Object.entries(fieldAliases).forEach(([field, aliases]) => {
        const normalizedAliases = aliases.map(normalizeKey);
        const matchIndex = normalizedHeaders.findIndex(h =>
          normalizedAliases.some(alias => h === alias || h.includes(alias) || alias.includes(h))
        );
        if (matchIndex !== -1) {
          newMappings[field] = parsed.headers[matchIndex];
        } else {
          newMappings[field] = ''; // No match found
        }
      });
      
      setColumnMappings(newMappings);
    };
    reader.readAsText(file);
  }, []);


  const handleBulkUpload = useCallback(() => {
    if (!csvData) return;

    // Map SLE CSV facility types to system types
    const mapFacilityType = (type: string): string => {
      const typeMap: Record<string, string> = {
        'MCHP': 'PHU',
        'CHP': 'PHU',
        'CHC': 'PHU',
        'Clinic': 'PHU',
        'Hospital': 'DISTRICT_HOSPITAL',
        'Government Hospital': 'DISTRICT_HOSPITAL',
        'Private Hospital': 'DISTRICT_HOSPITAL',
        'Mission Hospital': 'DISTRICT_HOSPITAL',
      };
      return typeMap[type] || type || 'PHU';
    };

    const facilities: BulkUploadFacilityItem[] = csvData.rows.map(row => {
      // Determine if facility is active based on status/functional fields
      const status = row[columnMappings.status] || '';
      const functional = row[columnMappings.functional] || '';
      const isActive = status.toLowerCase() !== 'closed' && functional.toLowerCase() === 'functional';
      
      // Build services array based on facility type and ownership
      const services: string[] = [];
      const ownership = row[columnMappings.ownership] || '';
      if (ownership) services.push(ownership);
      
      return {
        name: row[columnMappings.name] || '',
        facilityCode: row[columnMappings.facilityCode] || '',
        facilityType: mapFacilityType(row[columnMappings.facilityType] || ''),
        level: parseInt(row[columnMappings.level]) || undefined,
        districtName: row[columnMappings.districtName] || '',
        districtCode: row[columnMappings.districtCode] || '',
        region: row[columnMappings.region] || '',
        address: row[columnMappings.address] || '',
        latitude: row[columnMappings.latitude] ? parseFloat(row[columnMappings.latitude]) : undefined,
        longitude: row[columnMappings.longitude] ? parseFloat(row[columnMappings.longitude]) : undefined,
        phone: row[columnMappings.phone] || '',
        email: row[columnMappings.email] || '',
        isActive,
        ownership: row[columnMappings.ownership] || '',
        status,
        functional,
        managerName: row[columnMappings.managerName] || '',
        services,
      };
    });

    bulkUploadMutation.mutate(facilities);
  }, [csvData, columnMappings, bulkUploadMutation]);

  const handleDownloadTemplate = useCallback(async () => {
    try {
      const blob = await facilityService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'facility_upload_template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download template:', error);
    }
  }, []);

  const resetBulkUpload = useCallback(() => {
    setCsvData(null);
    setUploadResult(null);
    setColumnMappings(defaultColumnMappings);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const closeBulkUploadModal = useCallback(() => {
    setShowBulkUploadModal(false);
    resetBulkUpload();
  }, [resetBulkUpload]);

  // Case-insensitive filtering
  const filteredFacilities = facilities.filter(f => {
    const searchLower = search.toLowerCase();
    const matchesSearch = !search || 
      f.name?.toLowerCase().includes(searchLower) ||
      f.facilityCode?.toLowerCase().includes(searchLower) ||
      f.district?.name?.toLowerCase().includes(searchLower);
    const matchesType = !typeFilter || f.type === typeFilter || f.facilityType === typeFilter;
    const matchesDistrict = !districtFilter || f.district?.id === districtFilter;
    return matchesSearch && matchesType && matchesDistrict;
  });

  // Table columns
  const columnHelper = createColumnHelper<typeof facilities[0]>();
  const columns: ColumnDef<typeof facilities[0], any>[] = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: info => (
        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('facilityCode', {
      header: 'Code',
      cell: info => <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{info.getValue()}</span>,
    }),
    columnHelper.accessor(row => row.type || row.facilityType, {
      id: 'facilityType',
      header: 'Type',
      cell: info => (
        <span style={{
          padding: '2px 8px',
          background: 'var(--bg-overlay)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '11px',
          textTransform: 'uppercase'
        }}>
          {String(info.getValue() || 'PHU').replace(/_/g, ' ')}
        </span>
      ),
    }),
    columnHelper.accessor(row => row.district?.name, {
      id: 'district',
      header: 'District',
      cell: info => info.getValue() || 'Unknown',
    }),
    columnHelper.accessor('level', {
      header: 'Level',
      cell: info => `Level ${info.getValue() || 1}`,
    }),
    columnHelper.accessor('isActive', {
      header: 'Status',
      cell: info => (
        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          color: info.getValue() ? 'var(--success)' : 'var(--text-tertiary)'
        }}>
          <span style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: info.getValue() ? 'var(--success)' : 'var(--text-muted)'
          }} />
          {info.getValue() ? 'Active' : 'Inactive'}
        </span>
      ),
    }),
  ];

  const facilityTypes: FacilityType[] = ['PHU', 'DISTRICT_HOSPITAL', 'REGIONAL_HOSPITAL', 'TERTIARY_HOSPITAL'];

  const targetFields = [
    { key: 'name', label: 'Name *', required: true },
    { key: 'facilityCode', label: 'Facility Code *', required: true },
    { key: 'facilityType', label: 'Facility Type', required: false },
    { key: 'level', label: 'Level', required: false },
    { key: 'districtName', label: 'District Name', required: false },
    { key: 'districtCode', label: 'District Code', required: false },
    { key: 'address', label: 'Address', required: false },
    { key: 'latitude', label: 'Latitude', required: false },
    { key: 'longitude', label: 'Longitude', required: false },
    { key: 'phone', label: 'Phone', required: false },
    { key: 'email', label: 'Email', required: false },
    { key: 'ownership', label: 'Ownership', required: false },
    { key: 'status', label: 'Status', required: false },
    { key: 'functional', label: 'Functional', required: false },
    { key: 'managerName', label: 'Manager Name', required: false },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Facilities</h1>
          <p className="page-subtitle">Healthcare facilities directory</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn-secondary" onClick={() => setShowBulkUploadModal(true)}>
            <Upload size={16} />
            Bulk Upload
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            New Facility
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} className="search-box-icon" />
          <input
            type="text"
            className="search-box-input"
            placeholder="Search facilities by name, code or district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-box-kbd">/</span>
        </div>
        
        <div className="filter-divider" />
        
        <select 
          className="filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          {facilityTypes.map(type => (
            <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
          ))}
        </select>

        <select 
          className="filter-select"
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
        >
          <option value="">All Districts</option>
          {districts.map((d: District) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <div className="filter-divider" />

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className={`btn btn-icon btn-sm ${viewMode === 'cards' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('cards')}
            title="Cards view"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className={`btn btn-icon btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('table')}
            title="Table view"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : !filteredFacilities.length ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--muted)', padding: 'var(--space-12)' }}>
          No facilities found
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
          {filteredFacilities.map((facility) => (
            <Link key={facility.id} href={`/facilities/${facility.id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ 
                height: '100%', 
                display: 'flex',
                flexDirection: 'column',
                transition: 'all var(--transition-fast)',
                cursor: 'pointer'
              }}>
                {/* Header with icon and name */}
                <div className="flex items-start gap-4 mb-4">
                  <div style={{ 
                    width: 44, 
                    height: 44, 
                    background: 'var(--accent-subtle)', 
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Building2 size={22} style={{ color: 'var(--accent-light)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontWeight: 600, 
                      color: 'var(--text-primary)',
                      marginBottom: '6px',
                      fontSize: '15px'
                    }}>
                      {facility.name}
                    </div>
                    <span style={{ 
                      display: 'inline-block',
                      padding: '3px 10px',
                      background: 'var(--bg-overlay)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      fontWeight: 500,
                      color: 'var(--text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em'
                    }}>
                      {facility.type?.replace(/_/g, ' ') || 'PHU'}
                    </span>
                  </div>
                </div>
                
                {/* Details */}
                <div className="flex flex-col gap-2" style={{ flex: 1 }}>
                  <div className="flex items-center gap-3" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <MapPin size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {facility.district?.name || 'Unknown District'}
                    </span>
                  </div>
                  {facility.phone && (
                    <div className="flex items-center gap-3" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <Phone size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                      <span>{facility.phone}</span>
                    </div>
                  )}
                </div>

                {/* Footer with status */}
                <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: facility.isActive ? 'var(--success)' : 'var(--text-tertiary)'
                  }}>
                    <span style={{ 
                      width: 7, 
                      height: 7, 
                      borderRadius: '50%',
                      background: facility.isActive ? 'var(--success)' : 'var(--text-muted)'
                    }} />
                    {facility.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span style={{ 
                    fontSize: '12px', 
                    color: 'var(--text-tertiary)',
                    fontWeight: 500
                  }}>
                    Level {facility.level || 1}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* New Facility Modal */}
      {showModal && (
        <>
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
            }}
            onClick={() => setShowModal(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'var(--background)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              width: '90%',
              maxWidth: 600,
              maxHeight: '90vh',
              overflow: 'auto',
              zIndex: 1000,
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ 
              padding: 'var(--space-6)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>New Facility</h2>
              <button 
                className="btn btn-ghost btn-icon btn-sm"
                onClick={() => setShowModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit((data) => createMutation.mutate(data))}>
              <div style={{ padding: 'var(--space-6)' }}>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    {...register('name')}
                  />
                  {errors.name && <span className="form-error">{errors.name.message}</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Code *</label>
                    <input
                      type="text"
                      className={`form-input ${errors.facilityCode ? 'error' : ''}`}
                      {...register('facilityCode')}
                    />
                    {errors.facilityCode && <span className="form-error">{errors.facilityCode.message}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Type *</label>
                    <select className={`form-input ${errors.facilityType ? 'error' : ''}`} {...register('facilityType')}>
                      <option value="">Select type...</option>
                      {facilityTypes.map(type => (
                        <option key={type} value={type}>{type.replace('_', ' ')}</option>
                      ))}
                    </select>
                    {errors.facilityType && <span className="form-error">{errors.facilityType.message}</span>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Level *</label>
                    <input
                      type="number"
                      className={`form-input ${errors.level ? 'error' : ''}`}
                      min="1"
                      max="4"
                      {...register('level', { valueAsNumber: true })}
                    />
                    {errors.level && <span className="form-error">{errors.level.message}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">District *</label>
                    <select className={`form-input ${errors.districtId ? 'error' : ''}`} {...register('districtId')}>
                      <option value="">Select district...</option>
                      {districts.map(district => (
                        <option key={district.id} value={district.id}>{district.name}</option>
                      ))}
                    </select>
                    {errors.districtId && <span className="form-error">{errors.districtId.message}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-input"
                    {...register('address')}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-input"
                      {...register('phone')}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      {...register('email')}
                    />
                    {errors.email && <span className="form-error">{errors.email.message}</span>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      className="form-input"
                      {...register('latitude', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      className="form-input"
                      {...register('longitude', { valueAsNumber: true })}
                    />
                  </div>
                </div>

                {createMutation.isError && (
                  <div className="auth-error">
                    Failed to create facility. Please try again.
                  </div>
                )}
              </div>

              <div style={{ 
                padding: 'var(--space-6)',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                gap: 'var(--space-2)',
                justifyContent: 'flex-end'
              }}>
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Create Facility
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <>
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
            }}
            onClick={closeBulkUploadModal}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'var(--background)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              width: '90%',
              maxWidth: 800,
              maxHeight: '90vh',
              overflow: 'auto',
              zIndex: 1000,
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ 
              padding: 'var(--space-6)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>Bulk Upload Facilities</h2>
              <button 
                className="btn btn-ghost btn-icon btn-sm"
                onClick={closeBulkUploadModal}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: 'var(--space-6)' }}>
              {/* Upload Result */}
              {uploadResult && (
                <div style={{ 
                  marginBottom: 'var(--space-6)',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  background: uploadResult.failed === 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  border: `1px solid ${uploadResult.failed === 0 ? 'var(--success)' : 'var(--warning)'}`
                }}>
                  <div className="flex items-center gap-3 mb-3">
                    {uploadResult.failed === 0 ? (
                      <CheckCircle size={20} style={{ color: 'var(--success)' }} />
                    ) : (
                      <AlertCircle size={20} style={{ color: 'var(--warning)' }} />
                    )}
                    <span style={{ fontWeight: 600 }}>
                      Upload Complete: {uploadResult.successful} created
                      {uploadResult.skipped > 0 && `, ${uploadResult.skipped} skipped (already exist)`}
                      {uploadResult.failed > 0 && `, ${uploadResult.failed} failed`}
                    </span>
                  </div>
                  
                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <div style={{ marginTop: 'var(--space-3)' }}>
                      <div style={{ fontWeight: 500, marginBottom: 'var(--space-2)', color: 'var(--destructive)' }}>
                        Errors ({uploadResult.failed}):
                      </div>
                      <div style={{ 
                        maxHeight: 150, 
                        overflow: 'auto',
                        fontSize: 'var(--text-sm)',
                        background: 'var(--background)',
                        padding: 'var(--space-2)',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        {uploadResult.errors.map((error, i) => (
                          <div key={i} className="flex items-start gap-2" style={{ marginBottom: 'var(--space-1)' }}>
                            <XCircle size={14} style={{ color: 'var(--destructive)', flexShrink: 0, marginTop: 2 }} />
                            <span>
                              Row {error.row}: {error.message}
                              {error.name && ` (${error.name})`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* File Upload */}
              {!csvData && !uploadResult && (
                <div 
                  style={{
                    border: '2px dashed var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-12)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all var(--duration-fast) var(--ease)',
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file && fileInputRef.current) {
                      const dt = new DataTransfer();
                      dt.items.add(file);
                      fileInputRef.current.files = dt.files;
                      handleFileChange({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>);
                    }
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  <FileText size={48} style={{ color: 'var(--muted)', marginBottom: 'var(--space-4)' }} />
                  <p style={{ fontWeight: 500, marginBottom: 'var(--space-2)' }}>
                    Drop your CSV file here or click to browse
                  </p>
                  <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
                    Upload facility data from SLE Health Facility List CSV (e.g., &quot;Copy of SLE_Health Facility List Jan. 2024.xlsx - Master List.csv&quot;)
                  </p>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ marginTop: 'var(--space-4)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadTemplate();
                    }}
                  >
                    <Download size={16} />
                    Download Template
                  </button>
                </div>
              )}

              {/* Column Mapping */}
              {csvData && !uploadResult && (
                <>
                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ fontWeight: 500 }}>
                        Found {csvData.rows.length} rows to import
                      </span>
                      <button 
                        type="button" 
                        className="btn btn-ghost btn-sm"
                        onClick={resetBulkUpload}
                      >
                        Choose Different File
                      </button>
                    </div>
                    <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
                      Map CSV columns to facility fields. Required fields are marked with *
                    </p>
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: 'var(--space-3)',
                    marginBottom: 'var(--space-4)'
                  }}>
                    {targetFields.map(field => (
                      <div key={field.key} className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: 'var(--text-xs)' }}>
                          {field.label}
                        </label>
                        <select
                          className="form-input"
                          style={{ fontSize: 'var(--text-sm)' }}
                          value={columnMappings[field.key] || ''}
                          onChange={(e) => setColumnMappings(prev => ({
                            ...prev,
                            [field.key]: e.target.value
                          }))}
                        >
                          <option value="">-- Not mapped --</option>
                          {csvData.headers.map(header => (
                            <option key={header} value={header}>{header}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  {/* Preview */}
                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <div style={{ fontWeight: 500, marginBottom: 'var(--space-2)' }}>
                      Preview (first 3 rows, all columns)
                    </div>
                    <div style={{
                      overflow: 'auto',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-xs)'
                    }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: 'var(--accent)' }}>
                            {csvData.headers.map(header => (
                              <th
                                key={header}
                                style={{ padding: 'var(--space-2)', textAlign: 'left', fontWeight: 500, whiteSpace: 'nowrap' }}
                              >
                                {header || '(Unnamed)'}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvData.rows.slice(0, 3).map((row, i) => (
                            <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                              {csvData.headers.map(header => (
                                <td key={`${i}-${header}`} style={{ padding: 'var(--space-2)' }}>
                                  {row[header] || '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div style={{ 
              padding: 'var(--space-6)',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: 'var(--space-2)',
              justifyContent: 'flex-end'
            }}>
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={closeBulkUploadModal}
              >
                {uploadResult ? 'Close' : 'Cancel'}
              </button>
              {csvData && !uploadResult && (
                <button 
                  type="button"
                  className="btn btn-primary"
                  onClick={handleBulkUpload}
                  disabled={bulkUploadMutation.isPending || !columnMappings.name || !columnMappings.facilityCode}
                >
                  {bulkUploadMutation.isPending ? (
                    <>
                      <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Upload {csvData.rows.length} Facilities
                    </>
                  )}
                </button>
              )}
              {uploadResult && uploadResult.failed > 0 && (
                <button 
                  type="button"
                  className="btn btn-primary"
                  onClick={resetBulkUpload}
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
