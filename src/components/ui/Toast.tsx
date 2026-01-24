'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useUIStore } from '@/store';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: {
    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(34, 197, 94, 0.06) 100%)',
    border: '1px solid rgba(34, 197, 94, 0.25)',
    iconColor: 'var(--green-500)',
  },
  error: {
    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(239, 68, 68, 0.06) 100%)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    iconColor: 'var(--red-500)',
  },
  warning: {
    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.06) 100%)',
    border: '1px solid rgba(245, 158, 11, 0.25)',
    iconColor: 'var(--amber-500)',
  },
  info: {
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.06) 100%)',
    border: '1px solid rgba(59, 130, 246, 0.25)',
    iconColor: 'var(--blue-500)',
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [isExiting, setIsExiting] = useState(false);
  const Icon = icons[toast.type];
  const style = styles[toast.type];
  const duration = toast.duration ?? 5000;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(onDismiss, 200);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(onDismiss, 200);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
        background: style.background,
        border: style.border,
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        backdropFilter: 'blur(12px)',
        minWidth: '320px',
        maxWidth: '420px',
        animation: isExiting 
          ? 'toast-exit var(--duration-fast) var(--ease) forwards'
          : 'toast-enter var(--duration-smooth) var(--ease-spring) forwards',
      }}
    >
      <Icon 
        size={20} 
        style={{ color: style.iconColor, flexShrink: 0, marginTop: '2px' }} 
        aria-hidden="true"
      />
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ 
          fontWeight: 600, 
          fontSize: 'var(--text-sm)',
          color: 'var(--foreground)' 
        }}>
          {toast.title}
        </div>
        
        {toast.description && (
          <div style={{ 
            fontSize: 'var(--text-sm)', 
            color: 'var(--muted)',
            marginTop: 'var(--space-1)'
          }}>
            {toast.description}
          </div>
        )}
        
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            style={{
              marginTop: 'var(--space-2)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color: style.iconColor,
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>
      
      <button
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: 'var(--radius-md)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--muted)',
          transition: 'all var(--duration-fast) var(--ease)',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
          e.currentTarget.style.color = 'var(--foreground)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--muted)';
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

/**
 * ToastContainer - Displays toast notifications in top-right corner
 * 
 * Add to your root layout to enable toast notifications globally
 * Use useUIStore().addToast() to show notifications
 */
export function ToastContainer() {
  const toasts = useUIStore((state) => state.toasts);
  const removeToast = useUIStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      style={{
        position: 'fixed',
        top: 'calc(var(--header-height) + var(--space-4))',
        right: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <style>{`
        @keyframes toast-enter {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        
        @keyframes toast-exit {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
        }
      `}</style>
      
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem 
            toast={toast} 
            onDismiss={() => removeToast(toast.id)} 
          />
        </div>
      ))}
    </div>
  );
}
