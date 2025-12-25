'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { patientService } from '@/lib/api';
import { DataTable } from '@/components/ui';
import { 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  User,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import { Patient } from '@/types';

export default function PatientsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');

  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ['patients', 'list', page, limit],
    queryFn: () => patientService.list({ page, limit }),
    enabled: !search,
  });

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['patients', 'search', search],
    queryFn: () => patientService.search({ q: search }),
    enabled: !!search,
  });

  const patients: Patient[] = search ? (searchData || []) : (listData?.data || []);
  const isLoading = search ? searchLoading : listLoading;

  // Define columns
  const columnHelper = createColumnHelper<Patient>();
  
  const columns = useMemo<ColumnDef<Patient, any>[]>(() => [
    columnHelper.accessor(row => `${row.firstName} ${row.lastName}`, {
      id: 'name',
      header: 'Patient',
      cell: info => (
        <div className="flex items-center gap-3">
          <div style={{ 
            width: 36, 
            height: 36, 
            background: 'var(--accent)', 
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={16} style={{ color: 'var(--muted)' }} />
          </div>
          <div>
            <div className="font-medium">{info.getValue()}</div>
            <div className="text-xs text-muted">{info.row.original.id.slice(0, 8)}...</div>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('phone', {
      header: 'Contact',
      cell: info => (
        <div className="flex items-center gap-1 text-sm">
          <Phone size={12} style={{ color: 'var(--muted)' }} />
          {info.getValue() || 'N/A'}
        </div>
      ),
    }),
    columnHelper.accessor('address', {
      header: 'Address',
      cell: info => (
        <div className="flex items-center gap-1 text-sm text-muted">
          <MapPin size={12} />
          {info.getValue() || 'N/A'}
        </div>
      ),
    }),
    columnHelper.accessor('dateOfBirth', {
      header: 'DOB',
      cell: info => {
        const dob = info.getValue();
        return (
          <div className="flex items-center gap-1 text-sm text-muted">
            <Calendar size={12} />
            {dob ? new Date(dob).toLocaleDateString() : 'N/A'}
          </div>
        );
      },
    }),
    columnHelper.accessor('gender', {
      header: 'Gender',
      cell: info => <span style={{ color: 'var(--muted)' }}>{info.getValue()}</span>,
    }),
    columnHelper.display({
      id: 'actions',
      cell: info => (
        <Link href={`/patients/${info.row.original.id}`} className="btn btn-ghost btn-sm">
          View
        </Link>
      ),
    }),
  ], []);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="page-subtitle">Manage patient records</p>
        </div>
        <Link href="/patients/new" className="btn btn-primary">
          <Plus size={16} />
          Register Patient
        </Link>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} className="search-box-icon" />
          <input
            type="text"
            className="search-box-input"
            placeholder="Search by name, phone, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="search-box-kbd">/</span>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : (
        <DataTable 
          data={patients} 
          columns={columns}
          globalFilter={search}
          onGlobalFilterChange={setSearch}
          emptyMessage={search ? 'No patients found matching your search' : 'No patients registered yet'}
        />
      )}

      {patients.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-muted">
            Showing {patients.length} patients
          </span>
          <div className="flex gap-1">
            <button 
              className="btn btn-secondary btn-sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft size={14} />
            </button>
            <button className="btn btn-primary btn-sm">{page}</button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
