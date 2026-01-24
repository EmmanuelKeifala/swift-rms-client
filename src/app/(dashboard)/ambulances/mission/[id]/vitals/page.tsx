'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nemsService } from '@/lib/api';
import { LogVitalsRequest } from '@/types';
import { 
  ArrowLeft,
  Heart,
  Activity,
  Thermometer,
  Wind,
  Brain,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  User
} from 'lucide-react';

const INTERVENTION_OPTIONS = [
  'IV Access',
  'Oxygen Therapy',
  'Fluid Resuscitation',
  'Medication Given',
  'Wound Dressing',
  'Immobilization',
  'Airway Management',
  'CPR',
  'Defibrillation',
  'Other'
];

interface VitalsFormData {
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  heartRate: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  temperature: string;
  consciousnessLevel: 'ALERT' | 'VERBAL' | 'PAIN' | 'UNRESPONSIVE' | '';
  interventions: string[];
  notes: string;
}

function VitalsLogCard({ entry, index }: { entry: any; index: number }) {
  return (
    <div className="card" style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-2)' }}>
        <span className="badge badge-secondary">Log #{index + 1}</span>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
          <Clock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          {new Date(entry.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)', fontSize: 'var(--text-sm)' }}>
        {entry.bloodPressureSystolic && (
          <div>
            <span style={{ color: 'var(--muted)' }}>BP:</span>{' '}
            {entry.bloodPressureSystolic}/{entry.bloodPressureDiastolic}
          </div>
        )}
        {entry.heartRate && (
          <div>
            <span style={{ color: 'var(--muted)' }}>HR:</span> {entry.heartRate}
          </div>
        )}
        {entry.oxygenSaturation && (
          <div>
            <span style={{ color: 'var(--muted)' }}>SpO2:</span> {entry.oxygenSaturation}%
          </div>
        )}
        {entry.respiratoryRate && (
          <div>
            <span style={{ color: 'var(--muted)' }}>RR:</span> {entry.respiratoryRate}
          </div>
        )}
        {entry.temperature && (
          <div>
            <span style={{ color: 'var(--muted)' }}>Temp:</span> {entry.temperature}C
          </div>
        )}
        {entry.consciousnessLevel && (
          <div>
            <span style={{ color: 'var(--muted)' }}>AVPU:</span> {entry.consciousnessLevel}
          </div>
        )}
      </div>
      {entry.interventions?.length > 0 && (
        <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
          <span style={{ color: 'var(--muted)' }}>Interventions:</span>{' '}
          {entry.interventions.join(', ')}
        </div>
      )}
      {entry.notes && (
        <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)', fontStyle: 'italic' }}>
          {entry.notes}
        </div>
      )}
    </div>
  );
}

export default function MissionVitalsPage() {
  const params = useParams();
  const router = useRouter();
  const missionId = params.id as string;
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<VitalsFormData>({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    temperature: '',
    consciousnessLevel: '',
    interventions: [],
    notes: ''
  });

  // Fetch mission details
  const { data: mission, isLoading } = useQuery({
    queryKey: ['nems-mission', missionId],
    queryFn: () => nemsService.getRequest(missionId),
    enabled: !!missionId,
  });

  // Mutation for logging vitals
  const logVitalsMutation = useMutation({
    mutationFn: (data: LogVitalsRequest) => nemsService.logVitals(missionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nems-mission', missionId] });
      // Reset form
      setFormData({
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        heartRate: '',
        respiratoryRate: '',
        oxygenSaturation: '',
        temperature: '',
        consciousnessLevel: '',
        interventions: [],
        notes: ''
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: LogVitalsRequest = {};
    
    if (formData.bloodPressureSystolic) data.bloodPressureSystolic = parseInt(formData.bloodPressureSystolic);
    if (formData.bloodPressureDiastolic) data.bloodPressureDiastolic = parseInt(formData.bloodPressureDiastolic);
    if (formData.heartRate) data.heartRate = parseInt(formData.heartRate);
    if (formData.respiratoryRate) data.respiratoryRate = parseInt(formData.respiratoryRate);
    if (formData.oxygenSaturation) data.oxygenSaturation = parseInt(formData.oxygenSaturation);
    if (formData.temperature) data.temperature = parseFloat(formData.temperature);
    if (formData.consciousnessLevel) data.consciousnessLevel = formData.consciousnessLevel as 'ALERT' | 'VERBAL' | 'PAIN' | 'UNRESPONSIVE';
    if (formData.interventions.length > 0) data.interventions = formData.interventions;
    if (formData.notes) data.notes = formData.notes;
    
    logVitalsMutation.mutate(data);
  };

  const toggleIntervention = (intervention: string) => {
    setFormData(prev => ({
      ...prev,
      interventions: prev.interventions.includes(intervention)
        ? prev.interventions.filter(i => i !== intervention)
        : [...prev.interventions, intervention]
    }));
  };

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto' }} />
      </div>
    );
  }

  if (!mission) {
    return (
      <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <AlertTriangle size={48} style={{ margin: '0 auto var(--space-4)', color: 'var(--warning)' }} />
        <h3>Mission not found</h3>
        <Link href="/ambulances" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
          Back to Ambulances
        </Link>
      </div>
    );
  }

  const vitalsLog = (mission as any).vitalsLog || [];

  return (
    <>
      <div className="page-header">
        <div className="flex items-center gap-4">
          <button className="btn btn-ghost btn-sm" onClick={() => router.back()}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="page-title">Mission Vitals Log</h1>
            <p className="page-subtitle">
              {mission.referralCode || `Mission #${mission.id.slice(0, 8)}`}
            </p>
          </div>
        </div>
        <div className="badge badge-primary" style={{ fontSize: 'var(--text-base)' }}>
          {mission.status}
        </div>
      </div>

      {/* Patient Info Card */}
      <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div className="flex gap-6" style={{ flexWrap: 'wrap' }}>
          <div className="flex items-center gap-2">
            <User size={16} color="var(--muted)" />
            <span><strong>Patient:</strong> {mission.patientName || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} color="var(--warning)" />
            <span><strong>Condition:</strong> {mission.patientCondition || 'Not specified'}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} color="var(--muted)" />
            <span><strong>To:</strong> {mission.dropoffFacility || 'Not specified'}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Vitals Entry Form */}
        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <h2 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--text-lg)', fontWeight: 600 }}>
            <Plus size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Log New Vitals
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Blood Pressure */}
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label flex items-center gap-2">
                <Heart size={16} color="var(--error)" />
                Blood Pressure
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  className="form-input"
                  placeholder="Systolic"
                  value={formData.bloodPressureSystolic}
                  onChange={(e) => setFormData({ ...formData, bloodPressureSystolic: e.target.value })}
                  style={{ width: 100 }}
                />
                <span>/</span>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Diastolic"
                  value={formData.bloodPressureDiastolic}
                  onChange={(e) => setFormData({ ...formData, bloodPressureDiastolic: e.target.value })}
                  style={{ width: 100 }}
                />
                <span style={{ color: 'var(--muted)' }}>mmHg</span>
              </div>
            </div>

            {/* Heart Rate & SpO2 */}
            <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label flex items-center gap-2">
                  <Activity size={16} color="var(--error)" />
                  Heart Rate
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    className="form-input"
                    placeholder="HR"
                    value={formData.heartRate}
                    onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                  />
                  <span style={{ color: 'var(--muted)' }}>bpm</span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label flex items-center gap-2">
                  <Wind size={16} color="var(--primary)" />
                  SpO2
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    className="form-input"
                    placeholder="SpO2"
                    value={formData.oxygenSaturation}
                    onChange={(e) => setFormData({ ...formData, oxygenSaturation: e.target.value })}
                  />
                  <span style={{ color: 'var(--muted)' }}>%</span>
                </div>
              </div>
            </div>

            {/* RR & Temp */}
            <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label flex items-center gap-2">
                  <Wind size={16} color="var(--success)" />
                  Respiratory Rate
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    className="form-input"
                    placeholder="RR"
                    value={formData.respiratoryRate}
                    onChange={(e) => setFormData({ ...formData, respiratoryRate: e.target.value })}
                  />
                  <span style={{ color: 'var(--muted)' }}>/min</span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label flex items-center gap-2">
                  <Thermometer size={16} color="var(--warning)" />
                  Temperature
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    placeholder="Temp"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  />
                  <span style={{ color: 'var(--muted)' }}>C</span>
                </div>
              </div>
            </div>

            {/* AVPU Score */}
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label flex items-center gap-2">
                <Brain size={16} color="var(--muted)" />
                Consciousness Level (AVPU)
              </label>
              <div className="flex gap-2">
                {(['ALERT', 'VERBAL', 'PAIN', 'UNRESPONSIVE'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={`btn ${formData.consciousnessLevel === level ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                    onClick={() => setFormData({ ...formData, consciousnessLevel: level })}
                  >
                    {level.charAt(0)}
                  </button>
                ))}
              </div>
            </div>

            {/* Interventions */}
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">Interventions Performed</label>
              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                {INTERVENTION_OPTIONS.map((intervention) => (
                  <button
                    key={intervention}
                    type="button"
                    className={`badge ${formData.interventions.includes(intervention) ? 'badge-primary' : ''}`}
                    style={{ cursor: 'pointer', padding: 'var(--space-1) var(--space-2)' }}
                    onClick={() => toggleIntervention(intervention)}
                  >
                    {intervention}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">Notes</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional observations..."
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              disabled={logVitalsMutation.isPending}
            >
              {logVitalsMutation.isPending ? 'Saving...' : 'Log Vitals'}
            </button>
          </form>
        </div>

        {/* Vitals History */}
        <div>
          <h2 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--text-lg)', fontWeight: 600 }}>
            <Clock size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Vitals History
          </h2>

          {vitalsLog.length === 0 ? (
            <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
              <CheckCircle2 size={32} style={{ margin: '0 auto var(--space-2)', color: 'var(--muted)' }} />
              <p style={{ color: 'var(--muted)' }}>No vitals logged yet</p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                Log patient vitals every 30 minutes during transport
              </p>
            </div>
          ) : (
            vitalsLog.map((entry: any, index: number) => (
              <VitalsLogCard key={index} entry={entry} index={index} />
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .form-group {
          margin-bottom: var(--space-3);
        }
        .form-label {
          display: block;
          font-weight: 500;
          margin-bottom: var(--space-2);
          font-size: var(--text-sm);
        }
        .form-input {
          width: 100%;
          padding: var(--space-2) var(--space-3);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: var(--background);
          font-size: var(--text-sm);
        }
        .form-textarea {
          width: 100%;
          padding: var(--space-2) var(--space-3);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: var(--background);
          resize: vertical;
          font-size: var(--text-sm);
        }
        .form-input:focus, .form-textarea:focus {
          outline: none;
          border-color: var(--primary);
        }
      `}</style>
    </>
  );
}
