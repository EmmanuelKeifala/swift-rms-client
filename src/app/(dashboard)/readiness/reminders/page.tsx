'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facilityService, readinessService } from '@/lib/api';
import { ReadinessReminder, CreateReminderRequest } from '@/types';
import { 
  Bell,
  Plus,
  Clock,
  Calendar,
  Mail,
  MessageSquare,
  Smartphone,
  Trash2,
  Check,
  X,
  Building2
} from 'lucide-react';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface ReminderFormData {
  facilityId: string;
  reminderType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  time: string;
  dayOfWeek: number;
  dayOfMonth: number;
  notifyVia: ('email' | 'sms' | 'push')[];
}

function ReminderCard({ 
  reminder, 
  onToggle, 
  onDelete 
}: { 
  reminder: ReadinessReminder; 
  onToggle: () => void; 
  onDelete: () => void;
}) {
  const getScheduleText = () => {
    switch (reminder.reminderType) {
      case 'DAILY':
        return `Daily at ${reminder.time}`;
      case 'WEEKLY':
        return `Every ${DAYS_OF_WEEK[reminder.dayOfWeek || 0]} at ${reminder.time}`;
      case 'MONTHLY':
        return `Monthly on day ${reminder.dayOfMonth} at ${reminder.time}`;
      default:
        return reminder.time;
    }
  };

  return (
    <div 
      className="card" 
      style={{ 
        padding: 'var(--space-4)',
        opacity: reminder.isActive ? 1 : 0.6,
        borderLeft: `4px solid ${reminder.isActive ? 'var(--primary)' : 'var(--muted)'}`
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-2)' }}>
            <Building2 size={16} color="var(--muted)" />
            <strong>{reminder.facilityName || 'Unknown Facility'}</strong>
          </div>
          <div className="flex items-center gap-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
            <Clock size={14} />
            {getScheduleText()}
          </div>
          <div className="flex items-center gap-2" style={{ marginTop: 'var(--space-2)' }}>
            {reminder.notifyVia.map(channel => (
              <span key={channel} className="badge badge-secondary" style={{ fontSize: 'var(--text-xs)' }}>
                {channel === 'email' && <Mail size={10} style={{ marginRight: 4 }} />}
                {channel === 'sms' && <MessageSquare size={10} style={{ marginRight: 4 }} />}
                {channel === 'push' && <Smartphone size={10} style={{ marginRight: 4 }} />}
                {channel.toUpperCase()}
              </span>
            ))}
          </div>
          {reminder.lastSentAt && (
            <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              Last sent: {new Date(reminder.lastSentAt).toLocaleString()}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button 
            className={`btn btn-sm ${reminder.isActive ? 'btn-primary' : 'btn-secondary'}`}
            onClick={onToggle}
            title={reminder.isActive ? 'Disable' : 'Enable'}
          >
            {reminder.isActive ? <Check size={14} /> : <X size={14} />}
          </button>
          <button 
            className="btn btn-ghost btn-sm"
            onClick={onDelete}
            style={{ color: 'var(--error)' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReadinessRemindersPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ReminderFormData>({
    facilityId: '',
    reminderType: 'DAILY',
    time: '08:00',
    dayOfWeek: 1,
    dayOfMonth: 1,
    notifyVia: ['push']
  });
  const queryClient = useQueryClient();

  // Fetch facilities for dropdown
  const { data: facilitiesData } = useQuery({
    queryKey: ['facilities'],
    queryFn: () => facilityService.list({}),
  });
  const facilities = facilitiesData?.data || [];

  // Fetch reminders
  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['readiness-reminders'],
    queryFn: () => readinessService.listReminders(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateReminderRequest) => readinessService.createReminder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readiness-reminders'] });
      setShowForm(false);
      setFormData({
        facilityId: '',
        reminderType: 'DAILY',
        time: '08:00',
        dayOfWeek: 1,
        dayOfMonth: 1,
        notifyVia: ['push']
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      readinessService.updateReminder(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readiness-reminders'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => readinessService.deleteReminder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readiness-reminders'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: CreateReminderRequest = {
      facilityId: formData.facilityId,
      reminderType: formData.reminderType,
      time: formData.time,
      notifyVia: formData.notifyVia,
    };

    if (formData.reminderType === 'WEEKLY') {
      data.dayOfWeek = formData.dayOfWeek;
    } else if (formData.reminderType === 'MONTHLY') {
      data.dayOfMonth = formData.dayOfMonth;
    }

    createMutation.mutate(data);
  };

  const toggleChannel = (channel: 'email' | 'sms' | 'push') => {
    setFormData(prev => ({
      ...prev,
      notifyVia: prev.notifyVia.includes(channel)
        ? prev.notifyVia.filter(c => c !== channel)
        : [...prev.notifyVia, channel]
    }));
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Readiness Reminders</h1>
          <p className="page-subtitle">
            Schedule automatic reminders for facilities to update their readiness status
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} />
          New Reminder
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <h2 style={{ margin: '0 0 var(--space-4)', fontSize: 'var(--text-lg)' }}>
            <Bell size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Create New Reminder
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Facility */}
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">Facility</label>
              <select
                className="form-select"
                value={formData.facilityId}
                onChange={(e) => setFormData({ ...formData, facilityId: e.target.value })}
                required
              >
                <option value="">Select a facility...</option>
                {facilities.map(facility => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name} ({facility.facilityCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Reminder Type */}
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">Frequency</label>
              <div className="flex gap-2">
                {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    className={`btn ${formData.reminderType === type ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                    onClick={() => setFormData({ ...formData, reminderType: type })}
                  >
                    <Calendar size={14} style={{ marginRight: 4 }} />
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Time */}
            <div className="grid gap-4" style={{ gridTemplateColumns: formData.reminderType === 'DAILY' ? '1fr' : '1fr 1fr', marginBottom: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>

              {formData.reminderType === 'WEEKLY' && (
                <div className="form-group">
                  <label className="form-label">Day of Week</label>
                  <select
                    className="form-select"
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                  >
                    {DAYS_OF_WEEK.map((day, index) => (
                      <option key={day} value={index}>{day}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.reminderType === 'MONTHLY' && (
                <div className="form-group">
                  <label className="form-label">Day of Month</label>
                  <select
                    className="form-select"
                    value={formData.dayOfMonth}
                    onChange={(e) => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) })}
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Notification Channels */}
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">Notification Channels</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`btn ${formData.notifyVia.includes('push') ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => toggleChannel('push')}
                >
                  <Smartphone size={14} />
                  Push
                </button>
                <button
                  type="button"
                  className={`btn ${formData.notifyVia.includes('email') ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => toggleChannel('email')}
                >
                  <Mail size={14} />
                  Email
                </button>
                <button
                  type="button"
                  className={`btn ${formData.notifyVia.includes('sms') ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => toggleChannel('sms')}
                >
                  <MessageSquare size={14} />
                  SMS
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={createMutation.isPending || formData.notifyVia.length === 0}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Reminder'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reminders List */}
      {isLoading ? (
        <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : reminders.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <Bell size={48} style={{ margin: '0 auto var(--space-4)', color: 'var(--muted)' }} />
          <h3 style={{ margin: 0 }}>No reminders configured</h3>
          <p style={{ color: 'var(--muted)', margin: 'var(--space-2) 0 0' }}>
            Create a reminder to automatically notify facilities to update their readiness status.
          </p>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
          {reminders.map(reminder => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              onToggle={() => toggleMutation.mutate({ id: reminder.id, isActive: !reminder.isActive })}
              onDelete={() => {
                if (confirm('Are you sure you want to delete this reminder?')) {
                  deleteMutation.mutate(reminder.id);
                }
              }}
            />
          ))}
        </div>
      )}

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
        .form-input, .form-select {
          width: 100%;
          padding: var(--space-2) var(--space-3);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: var(--background);
          font-size: var(--text-sm);
        }
        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: var(--primary);
        }
      `}</style>
    </>
  );
}
