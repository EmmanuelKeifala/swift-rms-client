'use client';

import { useState } from 'react';
import { 
  Settings, 
  Bell,
  Shield,
  Palette,
  Save,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account preferences</p>
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
        {/* Notifications */}
        <div className="col-6">
          <div className="card">
            <h3 className="card-title mb-4">
              <Bell size={16} />
              Notifications
            </h3>
            
            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-between p-3" style={{ background: 'var(--accent)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                <div>
                  <div className="font-medium text-sm">Push Notifications</div>
                  <div className="text-xs text-muted">Receive browser notifications</div>
                </div>
                <input type="checkbox" defaultChecked style={{ width: 18, height: 18 }} />
              </label>

              <label className="flex items-center justify-between p-3" style={{ background: 'var(--accent)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                <div>
                  <div className="font-medium text-sm">SMS Alerts</div>
                  <div className="text-xs text-muted">Critical referral alerts via SMS</div>
                </div>
                <input type="checkbox" defaultChecked style={{ width: 18, height: 18 }} />
              </label>

              <label className="flex items-center justify-between p-3" style={{ background: 'var(--accent)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                <div>
                  <div className="font-medium text-sm">Sound Alerts</div>
                  <div className="text-xs text-muted">Play sound for new referrals</div>
                </div>
                <input type="checkbox" defaultChecked style={{ width: 18, height: 18 }} />
              </label>

              <label className="flex items-center justify-between p-3" style={{ background: 'var(--accent)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                <div>
                  <div className="font-medium text-sm">Email Digest</div>
                  <div className="text-xs text-muted">Daily summary email</div>
                </div>
                <input type="checkbox" style={{ width: 18, height: 18 }} />
              </label>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="col-6">
          <div className="card">
            <h3 className="card-title mb-4">
              <Palette size={16} />
              Appearance
            </h3>
            
            <div className="form-group">
              <label className="form-label">Theme</label>
              <select className="form-input">
                <option>Light</option>
                <option>Dark</option>
                <option>System</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Language</label>
              <select className="form-input">
                <option>English</option>
                <option>Krio</option>
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
              <label className="form-label">Time Format</label>
              <select className="form-input">
                <option>12-hour</option>
                <option>24-hour</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="col-12">
          <div className="card">
            <h3 className="card-title mb-4">
              <Shield size={16} />
              Security
            </h3>
            
            <div style={{ maxWidth: 400 }}>
              <h4 className="font-medium mb-3">Change Password</h4>
              
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showCurrentPassword ? 'text' : 'password'} 
                    className="form-input" 
                    style={{ paddingRight: 'var(--space-10)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{ 
                      position: 'absolute', 
                      right: 'var(--space-1)', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      background: 'none',
                      color: 'var(--muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showNewPassword ? 'text' : 'password'} 
                    className="form-input"
                    style={{ paddingRight: 'var(--space-10)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{ 
                      position: 'absolute', 
                      right: 'var(--space-1)', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      background: 'none',
                      color: 'var(--muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <span className="form-hint">Minimum 8 characters</span>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-input" />
              </div>

              <button className="btn btn-secondary">Update Password</button>
            </div>

            <div style={{ marginTop: 'var(--space-8)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--border)' }}>
              <h4 className="font-medium mb-3">Sessions</h4>
              <p className="text-sm text-muted mb-3">
                You are currently logged in on this device. Log out of all other sessions below.
              </p>
              <button className="btn btn-secondary">Log Out Other Sessions</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
