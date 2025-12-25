'use client';

import { useState } from 'react';
import { 
  Settings, 
  Bell,
  Shield,
  Database,
  Mail,
  Globe,
  Clock,
  Save,
  RefreshCw,
  AlertTriangle,
  Check
} from 'lucide-react';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const sections: SettingSection[] = [
  { id: 'general', title: 'General', description: 'Basic system configuration', icon: <Settings size={20} /> },
  { id: 'notifications', title: 'Notifications', description: 'Alert and notification settings', icon: <Bell size={20} /> },
  { id: 'security', title: 'Security', description: 'Authentication and access control', icon: <Shield size={20} /> },
  { id: 'integrations', title: 'Integrations', description: 'External system connections', icon: <Globe size={20} /> },
];

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">System Settings</h1>
          <p className="page-subtitle">Configure system-wide preferences</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          {saved ? (
            <>
              <Check size={16} />
              Saved
            </>
          ) : (
            <>
              <Save size={16} />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="dashboard-grid">
        {/* Navigation */}
        <div className="col-3" style={{ gridColumn: 'span 3' }}>
          <div className="card" style={{ padding: 'var(--space-2)' }}>
            {sections.map((section) => (
              <button
                key={section.id}
                className="flex items-center gap-3 w-full text-left p-3"
                style={{ 
                  background: activeSection === section.id ? 'var(--accent)' : 'transparent',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  cursor: 'pointer',
                  marginBottom: 'var(--space-1)'
                }}
                onClick={() => setActiveSection(section.id)}
              >
                <span style={{ color: activeSection === section.id ? 'var(--foreground)' : 'var(--muted)' }}>
                  {section.icon}
                </span>
                <div>
                  <div className="font-medium text-sm">{section.title}</div>
                  <div className="text-xs text-muted">{section.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Panel */}
        <div className="col-9" style={{ gridColumn: 'span 9' }}>
          {activeSection === 'general' && (
            <div className="card">
              <h3 className="card-title mb-4">General Settings</h3>
              
              <div className="form-group">
                <label className="form-label">System Name</label>
                <input type="text" className="form-input" defaultValue="RMS - Referral Management System" />
              </div>

              <div className="form-group">
                <label className="form-label">Default Timezone</label>
                <select className="form-input">
                  <option>Africa/Freetown (GMT+0)</option>
                  <option>UTC</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date Format</label>
                <select className="form-input">
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Default Referral Priority</label>
                <select className="form-input">
                  <option>MEDIUM</option>
                  <option>LOW</option>
                  <option>HIGH</option>
                </select>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', marginTop: 'var(--space-6)', paddingTop: 'var(--space-6)' }}>
                <h4 className="font-medium mb-4">Response Time Targets</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group">
                    <label className="form-label">Critical (minutes)</label>
                    <input type="number" className="form-input" defaultValue="15" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">High (minutes)</label>
                    <input type="number" className="form-input" defaultValue="30" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Medium (minutes)</label>
                    <input type="number" className="form-input" defaultValue="60" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Low (minutes)</label>
                    <input type="number" className="form-input" defaultValue="120" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="card">
              <h3 className="card-title mb-4">Notification Settings</h3>
              
              <div className="flex flex-col gap-4">
                <label className="flex items-center justify-between p-4" style={{ background: 'var(--accent)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div className="font-medium">SMS Notifications</div>
                    <div className="text-sm text-muted">Send SMS alerts for critical referrals</div>
                  </div>
                  <input type="checkbox" defaultChecked style={{ width: 20, height: 20 }} />
                </label>

                <label className="flex items-center justify-between p-4" style={{ background: 'var(--accent)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div className="font-medium">Push Notifications</div>
                    <div className="text-sm text-muted">Browser push notifications for updates</div>
                  </div>
                  <input type="checkbox" defaultChecked style={{ width: 20, height: 20 }} />
                </label>

                <label className="flex items-center justify-between p-4" style={{ background: 'var(--accent)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div className="font-medium">Email Digests</div>
                    <div className="text-sm text-muted">Daily summary emails</div>
                  </div>
                  <input type="checkbox" style={{ width: 20, height: 20 }} />
                </label>

                <label className="flex items-center justify-between p-4" style={{ background: 'var(--accent)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div className="font-medium">Escalation Alerts</div>
                    <div className="text-sm text-muted">Notify supervisors on delayed responses</div>
                  </div>
                  <input type="checkbox" defaultChecked style={{ width: 20, height: 20 }} />
                </label>
              </div>

              <div style={{ marginTop: 'var(--space-6)' }}>
                <h4 className="font-medium mb-3">Escalation Rules</h4>
                <div className="form-group">
                  <label className="form-label">Escalate after (minutes past target)</label>
                  <input type="number" className="form-input" defaultValue="15" style={{ maxWidth: 200 }} />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="card">
              <h3 className="card-title mb-4">Security Settings</h3>
              
              <div className="flex flex-col gap-4">
                <label className="flex items-center justify-between p-4" style={{ background: 'var(--accent)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div className="font-medium">Two-Factor Authentication</div>
                    <div className="text-sm text-muted">Require 2FA for admin accounts</div>
                  </div>
                  <input type="checkbox" defaultChecked style={{ width: 20, height: 20 }} />
                </label>

                <label className="flex items-center justify-between p-4" style={{ background: 'var(--accent)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div className="font-medium">Session Timeout</div>
                    <div className="text-sm text-muted">Auto-logout after inactivity</div>
                  </div>
                  <input type="checkbox" defaultChecked style={{ width: 20, height: 20 }} />
                </label>
              </div>

              <div style={{ marginTop: 'var(--space-6)' }}>
                <div className="form-group">
                  <label className="form-label">Session Timeout Duration (minutes)</label>
                  <input type="number" className="form-input" defaultValue="30" style={{ maxWidth: 200 }} />
                </div>

                <div className="form-group">
                  <label className="form-label">Minimum Password Length</label>
                  <input type="number" className="form-input" defaultValue="8" style={{ maxWidth: 200 }} />
                </div>

                <div className="form-group">
                  <label className="form-label">Maximum Login Attempts</label>
                  <input type="number" className="form-input" defaultValue="5" style={{ maxWidth: 200 }} />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'integrations' && (
            <div className="card">
              <h3 className="card-title mb-4">Integrations</h3>
              
              <div className="flex flex-col gap-4">
                <div className="p-4" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <div className="flex justify-between items-start mb-3">
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
                        <Mail size={20} style={{ color: 'var(--muted)' }} />
                      </div>
                      <div>
                        <div className="font-medium">SMS Gateway</div>
                        <div className="text-xs text-muted">AfricasTalking API</div>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--success)' }}>
                      <Check size={12} />
                      Connected
                    </span>
                  </div>
                  <button className="btn btn-secondary btn-sm">Configure</button>
                </div>

                <div className="p-4" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <div className="flex justify-between items-start mb-3">
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
                        <Database size={20} style={{ color: 'var(--muted)' }} />
                      </div>
                      <div>
                        <div className="font-medium">DHIS2</div>
                        <div className="text-xs text-muted">Health Information System</div>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--warning)' }}>
                      <AlertTriangle size={12} />
                      Not configured
                    </span>
                  </div>
                  <button className="btn btn-primary btn-sm">Set Up</button>
                </div>

                <div className="p-4" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <div className="flex justify-between items-start mb-3">
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
                        <Globe size={20} style={{ color: 'var(--muted)' }} />
                      </div>
                      <div>
                        <div className="font-medium">Maps API</div>
                        <div className="text-xs text-muted">OpenStreetMap / Google Maps</div>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--success)' }}>
                      <Check size={12} />
                      Connected
                    </span>
                  </div>
                  <button className="btn btn-secondary btn-sm">Configure</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
