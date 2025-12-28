'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { getFCMToken, onForegroundMessage, firebaseConfig } from '@/lib/firebase';
import { subscribeDevice } from '@/lib/api/notifications';
import { useAuthStore } from '@/store/authStore';
import { Bell, X } from 'lucide-react';

interface NotificationPayload {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: {
    title?: string;
    body?: string;
    type?: string;
    referralId?: string;
    priority?: string;
  };
}

export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const hasRegistered = useRef(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const showToastNotification = useCallback((title: string, body: string, referralId?: string) => {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 9999;
      max-width: 384px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04);
      border: 1px solid #E5E5E5;
      padding: 16px;
      animation: slideIn 0.3s ease-out forwards;
    `;
    toast.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="flex-shrink: 0;">
          <svg style="width: 24px; height: 24px; color: #0070F3;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div style="flex: 1; min-width: 0;">
          <p style="font-size: 14px; font-weight: 500; color: #171717; margin: 0;">${title}</p>
          <p style="font-size: 14px; color: #737373; margin-top: 4px;">${body}</p>
        </div>
        <button style="flex-shrink: 0; margin-left: 8px; color: #A3A3A3; cursor: pointer; background: none; border: none; padding: 0;" onclick="this.closest('div').parentElement.remove()">
          <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    `;

    if (referralId) {
      toast.style.cursor = 'pointer';
      toast.onclick = (e) => {
        if ((e.target as HTMLElement).tagName !== 'BUTTON' && !(e.target as HTMLElement).closest('button')) {
          window.location.href = `/referrals/${referralId}`;
        }
      };
    }

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out forwards';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }, []);

  // Show prompt when authenticated and not yet registered (only once per user)
  useEffect(() => {
    if (typeof window === 'undefined' || !user?.id) return;
    
    const permission = 'Notification' in window ? Notification.permission : 'not supported';
    const promptKey = `notification-prompt-responded-${user.id}`;
    const hasRespondedToPrompt = localStorage.getItem(promptKey) === 'true';
    
    console.log('[Push] Checking notification state:', {
      isAuthenticated,
      userId: user.id,
      hasRegistered: hasRegistered.current,
      permission,
      hasRespondedToPrompt
    });
    
    // Don't show prompt if:
    // - User already granted/denied permission
    // - User previously dismissed the prompt
    // - Already registered in this session
    const shouldShowPrompt = isAuthenticated && 
      !hasRegistered.current && 
      'Notification' in window && 
      permission === 'default' && 
      !hasRespondedToPrompt;
    
    if (shouldShowPrompt) {
      setShowPrompt(true);
      console.log('[Push] Showing notification prompt');
    }
  }, [isAuthenticated, user?.id]);

  // Register for push notifications (called from user action)
  const enableNotifications = useCallback(async () => {
    if (isRegistering) return;
    setIsRegistering(true);
    
    console.log('[Push] Enabling notifications...');
    
    try {
      // Register service worker first
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('[Push] Service Worker registered:', registration.scope);
        
        // Send Firebase config to service worker
        const sendConfig = () => {
          registration.active?.postMessage({ type: 'FIREBASE_CONFIG', config: firebaseConfig });
        };
        
        if (registration.active) {
          sendConfig();
        } else if (registration.installing || registration.waiting) {
          const sw = registration.installing || registration.waiting;
          sw?.addEventListener('statechange', (e) => {
            if ((e.target as ServiceWorker).state === 'activated') {
              sendConfig();
            }
          });
        }
      }

      // Get FCM token (this will request permission)
      const token = await getFCMToken();
      if (!token) {
        console.log('[Push] Could not get FCM token');
        setIsRegistering(false);
        return;
      }

      console.log('[Push] FCM Token obtained, registering with backend...');

      // Register token with backend
      await subscribeDevice({
        token,
        platform: 'WEB',
      });

      console.log('[Push] Device registered successfully');
      hasRegistered.current = true;
      if (user?.id) {
        localStorage.setItem(`notification-prompt-responded-${user.id}`, 'true');
      }
      setShowPrompt(false);
      setIsRegistering(false);
      
      showToastNotification('Notifications Enabled', 'You will now receive push notifications');
    } catch (error) {
      console.error('[Push] Failed to register:', error);
      setIsRegistering(false);
    }
  }, [isRegistering, showToastNotification]);

  // Listen for foreground messages
  useEffect(() => {
    if (!isAuthenticated) return;

    console.log('[Push] Setting up foreground message listener');
    
    const unsubscribe = onForegroundMessage((payload: unknown) => {
      console.log('[Push] Foreground message received:', payload);
      
      const notificationPayload = payload as NotificationPayload;
      const title = notificationPayload.notification?.title || notificationPayload.data?.title || 'Notification';
      const body = notificationPayload.notification?.body || notificationPayload.data?.body || '';
      const referralId = notificationPayload.data?.referralId;

      showToastNotification(title, body, referralId);
    });

    return unsubscribe;
  }, [isAuthenticated, showToastNotification]);

  // Prompt styles
  const promptStyles: React.CSSProperties = {
    position: 'fixed',
    top: '16px',
    right: '16px',
    zIndex: 9999,
    maxWidth: '384px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 16px 32px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.06)',
    border: '1px solid #E5E5E5',
    padding: '16px',
  };

  return (
    <>
      {children}
      
      {/* Notification Permission Prompt */}
      {showPrompt && (
        <div style={promptStyles}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              flexShrink: 0,
              width: '40px',
              height: '40px',
              background: 'rgba(0, 112, 243, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bell style={{ width: '20px', height: '20px', color: '#0070F3' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#171717', margin: 0 }}>
                Enable Notifications
              </h4>
              <p style={{ fontSize: '14px', color: '#737373', marginTop: '4px' }}>
                Get instant alerts for new referrals
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  onClick={enableNotifications}
                  disabled={isRegistering}
                  className="btn btn-primary btn-sm"
                >
                  {isRegistering ? 'Enabling...' : 'Enable'}
                </button>
                <button
                  onClick={() => {
                    if (user?.id) {
                      localStorage.setItem(`notification-prompt-responded-${user.id}`, 'true');
                    }
                    setShowPrompt(false);
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  Not Now
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowPrompt(false)}
              style={{
                flexShrink: 0,
                color: '#A3A3A3',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: '0'
              }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
