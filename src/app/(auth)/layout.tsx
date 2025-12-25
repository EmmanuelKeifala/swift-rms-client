import './auth.css';
import { Hospital } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-container">
      {/* Branding Panel */}
      <div className="auth-branding">
        <div className="auth-branding-content">
          <div className="auth-logo">
            <Hospital size={36} />
          </div>
          <h1 className="auth-title">
            Referral Management System
          </h1>
          <p className="auth-subtitle">
            Streamlining healthcare referrals across Sierra Leone. 
            Connecting facilities, saving lives.
          </p>
          <div className="auth-flag">
            <svg width="48" height="32" viewBox="0 0 48 32" fill="none">
              <rect width="48" height="10.67" fill="#1EB53A"/>
              <rect y="10.67" width="48" height="10.67" fill="#FFFFFF"/>
              <rect y="21.33" width="48" height="10.67" fill="#0072C6"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="auth-form-container">
        <div className="auth-form-wrapper">
          <div className="auth-mobile-logo">
            <div className="auth-mobile-logo-icon">
              <Hospital size={20} />
            </div>
            <span className="auth-mobile-logo-text">RMS</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
