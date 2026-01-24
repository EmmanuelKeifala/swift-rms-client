import './auth.css';
import { Activity, Shield, Zap, Users } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-container">
      {/* Branding Panel - Premium design with features */}
      <div className="auth-branding">
        {/* Animated orbs decorations are in CSS */}
        <div className="auth-branding-content">
          <div className="auth-logo">
            <Activity size={36} strokeWidth={1.5} />
          </div>
          <h1 className="auth-title">
            Referral Management System
          </h1>
          <p className="auth-subtitle">
            Streamlining healthcare referrals across Sierra Leone. 
            Connecting facilities, saving lives.
          </p>
          
          {/* Feature highlights */}
          <div className="auth-features">
            <div className="auth-feature">
              <Zap size={16} />
              <span>Real-time referral tracking</span>
            </div>
            <div className="auth-feature">
              <Shield size={16} />
              <span>Secure patient data management</span>
            </div>
            <div className="auth-feature">
              <Users size={16} />
              <span>Multi-facility coordination</span>
            </div>
          </div>

          <div className="auth-flag">
            <svg width="48" height="32" viewBox="0 0 48 32" fill="none">
              <rect width="48" height="10.67" fill="#1EB53A"/>
              <rect y="10.67" width="48" height="10.67" fill="#FFFFFF"/>
              <rect y="21.33" width="48" height="10.67" fill="#0072C6"/>
            </svg>
          </div>
          
          <div style={{ 
            marginTop: '32px', 
            padding: '16px 20px', 
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <p style={{ 
              fontSize: '14px', 
              color: 'rgba(255, 255, 255, 0.6)',
              fontStyle: 'italic',
              margin: 0,
            }}>
              "A system that has transformed how we manage patient referrals and improved outcomes significantly."
            </p>
            <p style={{ 
              fontSize: '12px', 
              color: 'rgba(255, 255, 255, 0.4)',
              marginTop: '8px',
              marginBottom: 0,
            }}>
              — Ministry of Health, Sierra Leone
            </p>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="auth-form-container">
        <div className="auth-form-wrapper">
          <div className="auth-mobile-logo">
            <div className="auth-mobile-logo-icon">
              <Activity size={22} strokeWidth={1.75} />
            </div>
            <span className="auth-mobile-logo-text">RMS</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
