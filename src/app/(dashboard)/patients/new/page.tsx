'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { patientService } from '@/lib/api';
import { CreatePatientRequest } from '@/types';
import { 
  ArrowLeft, 
  User,
  Heart,
  Save
} from 'lucide-react';

// Phone is 9 digits after +232 prefix
const optionalPhoneRegex = /^$|^[0-9]{9}$/;

const patientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { message: 'Gender is required' }),
  dateOfBirth: z.string().optional(),
  phone: z.string().regex(optionalPhoneRegex, 'Phone must be 9 digits (e.g., 76000002)').optional(),
  address: z.string().optional(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  nextOfKinName: z.string().optional(),
  nextOfKinPhone: z.string().regex(optionalPhoneRegex, 'Phone must be 9 digits').optional(),
  nextOfKinRelationship: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

export default function NewPatientPage() {
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: PatientFormData) => {
      // Transform phone numbers to full format
      const request: CreatePatientRequest = {
        ...data,
        phone: data.phone ? `+232${data.phone}` : undefined,
        nextOfKinPhone: data.nextOfKinPhone ? `+232${data.nextOfKinPhone}` : undefined,
      };
      return patientService.create(request);
    },
    onSuccess: (patient) => router.push(`/patients/${patient.id}`),
  });

  return (
    <>
      <div className="mb-4">
        <Link href="/patients" className="flex items-center gap-1 text-sm text-muted">
          <ArrowLeft size={14} />
          Back to Patients
        </Link>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Register Patient</h1>
          <p className="page-subtitle">Add a new patient to the system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        <div className="dashboard-grid">
          <div className="col-6">
            <div className="card">
              <h3 className="card-title mb-4">
                <User size={16} />
                Personal Information
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input 
                    type="text" 
                    className={`form-input ${errors.firstName ? 'error' : ''}`}
                    {...register('firstName')}
                  />
                  {errors.firstName && <span className="form-error">{errors.firstName.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input 
                    type="text" 
                    className={`form-input ${errors.lastName ? 'error' : ''}`}
                    {...register('lastName')}
                  />
                  {errors.lastName && <span className="form-error">{errors.lastName.message}</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select 
                    className={`form-input ${errors.gender ? 'error' : ''}`}
                    {...register('gender')}
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {errors.gender && <span className="form-error">{errors.gender.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input 
                    type="date" 
                    className="form-input"
                    {...register('dateOfBirth')}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="phone-input-wrapper">
                  <span className="phone-prefix">+232</span>
                  <input 
                    type="tel" 
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    placeholder="76000002"
                    maxLength={9}
                    {...register('phone')}
                  />
                </div>
                {errors.phone && <span className="form-error">{errors.phone.message}</span>}
                <span className="form-hint">9 digits (e.g., 76000002)</span>
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Village, Chiefdom, District"
                  {...register('address')}
                />
              </div>
            </div>
          </div>

          <div className="col-6">
            <div className="card mb-4">
              <h3 className="card-title mb-4">
                <Heart size={16} />
                Medical Information
              </h3>

              <div className="form-group">
                <label className="form-label">Blood Type</label>
                <select className="form-input" {...register('bloodType')}>
                  <option value="">Select blood type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Allergies</label>
                <textarea 
                  className="form-input"
                  rows={2}
                  placeholder="List any known allergies"
                  {...register('allergies')}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Chronic Conditions</label>
                <textarea 
                  className="form-input"
                  rows={2}
                  placeholder="List any chronic conditions"
                  {...register('chronicConditions')}
                />
              </div>
            </div>

            <div className="card">
              <h3 className="card-title mb-4">
                <User size={16} />
                Next of Kin
              </h3>

              <div className="form-group">
                <label className="form-label">Name</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Full name"
                  {...register('nextOfKinName')}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <div className="phone-input-wrapper">
                  <span className="phone-prefix">+232</span>
                  <input 
                    type="tel" 
                    className={`form-input ${errors.nextOfKinPhone ? 'error' : ''}`}
                    placeholder="76000002"
                    maxLength={9}
                    {...register('nextOfKinPhone')}
                  />
                </div>
                {errors.nextOfKinPhone && <span className="form-error">{errors.nextOfKinPhone.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Relationship</label>
                <select className="form-input" {...register('nextOfKinRelationship')}>
                  <option value="">Select relationship</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-6">
          <Link href="/patients" className="btn btn-secondary">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Register Patient
              </>
            )}
          </button>
        </div>

        {mutation.isError && (
          <div className="auth-error mt-4">
            Failed to register patient. Please try again.
          </div>
        )}
      </form>
    </>
  );
}
