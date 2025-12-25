'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { patientService, referralService } from '@/lib/api';
import { DataTable } from '@/components/ui';
import { 
  ArrowLeft, 
  User, 
  Phone,
  MapPin,
  Calendar,
  ClipboardList,
  Edit
} from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

interface Referral {
  id: string;
  referralCode: string;
  referralType: string;
  status: string;
  receivingFacility?: {
    name: string;
  };
  createdAt: string;
}

export default function PatientDetailPage({ params }: Props) {
  const { id } = use(params);

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => patientService.get(id),
  });

  const { data: referrals } = useQuery({
    queryKey: ['patient', id, 'referrals'],
    queryFn: () => referralService.listByPatient(id),
    enabled: !!patient,
  });

  // Define columns for referral history
  const columnHelper = createColumnHelper<Referral>();
  
  const columns = useMemo<ColumnDef<Referral, any>[]>(() => [
    columnHelper.accessor('referralCode', {
      header: 'Code',
      cell: info => (
        <Link href={`/referrals/${info.row.original.id}`} className="link font-medium">
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor('referralType', {
      header: 'Type',
      cell: info => <span style={{ color: 'var(--muted)' }}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => (
        <span className={`badge badge-${info.getValue().toLowerCase().replace(/_/g, '-')}`}>
          {info.getValue().replace(/_/g, ' ')}
        </span>
      ),
    }),
    columnHelper.accessor('receivingFacility.name', {
      header: 'Facility',
      cell: info => <span style={{ color: 'var(--muted)' }}>{info.getValue() || '-'}</span>,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Date',
      cell: info => (
        <span style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
          {new Date(info.getValue()).toLocaleDateString()}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      cell: info => (
        <Link href={`/referrals/${info.row.original.id}`} className="btn btn-ghost btn-sm">
          View
        </Link>
      ),
    }),
  ], []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
        <p className="text-muted">Patient not found</p>
        <Link href="/patients" className="btn btn-primary mt-4">Back to Patients</Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <Link href="/patients" className="flex items-center gap-1 text-sm text-muted">
          <ArrowLeft size={14} />
          Back to Patients
        </Link>
      </div>

      <div className="page-header">
        <div className="flex items-center gap-4">
          <div style={{ 
            width: 64, 
            height: 64, 
            background: 'var(--foreground)',
            color: 'var(--background)',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-xl)',
            fontWeight: 600
          }}>
            {patient.firstName[0]}{patient.lastName[0]}
          </div>
          <div>
            <h1 className="page-title">{patient.firstName} {patient.lastName}</h1>
            <p className="page-subtitle">{patient.gender} | ID: {patient.id.slice(0, 8)}...</p>
          </div>
        </div>
        <button className="btn btn-secondary">
          <Edit size={16} />
          Edit
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="col-6">
          <div className="card">
            <h3 className="card-title mb-4">
              <User size={16} />
              Personal Information
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between">
                <span className="text-muted">Full Name</span>
                <span className="font-medium">{patient.firstName} {patient.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Gender</span>
                <span>{patient.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Date of Birth</span>
                <span>{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Phone</span>
                <span>{patient.phone || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6">
          <div className="card">
            <h3 className="card-title mb-4">
              <MapPin size={16} />
              Location
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between">
                <span className="text-muted">Address</span>
                <span>{patient.address || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="card-title" style={{ margin: 0 }}>
                <ClipboardList size={16} />
                Referral History
              </h3>
              <Link href={`/referrals/new?patientId=${patient.id}`} className="btn btn-primary btn-sm">
                New Referral
              </Link>
            </div>
            
            <DataTable 
              data={referrals || []} 
              columns={columns}
              emptyMessage="No referral history"
            />
          </div>
        </div>
      </div>
    </>
  );
}
