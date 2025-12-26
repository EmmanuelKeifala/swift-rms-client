'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck, ExternalLink } from 'lucide-react';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, Notification } from '@/lib/api/notifications';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unread count
  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadCount,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => getNotifications(1, 10),
    enabled: isOpen, // Only fetch when dropdown is open
  });

  // Mark single as read
  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const isRead = (notification: Notification) => notification.status === 'READ' || !!notification.readAt;

  const handleNotificationClick = (notification: Notification) => {
    if (!isRead(notification)) {
      markReadMutation.mutate(notification.id);
    }
    setIsOpen(false);
  };

  const unreadCount = unreadData?.count ?? 0;
  const notifications = notificationsData?.data ?? [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return '#E00';
      case 'HIGH': return '#F5A623';
      case 'MEDIUM': return '#0070F3';
      default: return '#00C853';
    }
  };

  return (
    <div className="notification-dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        className="notification-btn" 
        aria-label="Notifications"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: isOpen ? 'var(--accent)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.15s ease',
        }}
      >
        <Bell size={18} style={{ color: 'var(--foreground)' }} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            minWidth: '16px',
            height: '16px',
            padding: '0 4px',
            background: 'var(--error)',
            color: 'white',
            fontSize: '10px',
            fontWeight: 600,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          width: '380px',
          maxHeight: '480px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 16px 32px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.06)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          zIndex: 1000,
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            borderBottom: '1px solid var(--border)',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>
              Notifications
              {unreadCount > 0 && (
                <span style={{ 
                  marginLeft: '8px', 
                  color: 'var(--muted)',
                  fontWeight: 400 
                }}>
                  ({unreadCount} unread)
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  color: 'var(--blue-500)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {isLoading ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>
                <Bell size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                <p style={{ margin: 0 }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: isRead(notification) ? 'transparent' : 'var(--info-light)',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isRead(notification) ? 'transparent' : 'var(--info-light)';
                  }}
                >
                  {/* Priority indicator */}
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: getPriorityColor(notification.priority),
                    marginTop: '6px',
                    flexShrink: 0,
                  }} />
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}>
                      <p style={{ 
                        fontSize: '13px', 
                        fontWeight: isRead(notification) ? 400 : 500, 
                        color: 'var(--foreground)',
                        margin: 0,
                        lineHeight: 1.4,
                      }}>
                        {notification.title}
                      </p>
                      {!isRead(notification) && (
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'var(--blue-500)',
                          flexShrink: 0,
                          marginTop: '4px',
                        }} />
                      )}
                    </div>
                    <p style={{ 
                      fontSize: '12px', 
                      color: 'var(--muted)', 
                      margin: '4px 0 0',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {notification.message}
                    </p>
                    <p style={{ 
                      fontSize: '11px', 
                      color: 'var(--muted-foreground)', 
                      margin: '6px 0 0',
                    }}>
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  {notification.referralId && (
                    <Link
                      href={`/referrals/${notification.referralId}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: 'var(--accent)',
                        color: 'var(--muted)',
                        flexShrink: 0,
                        alignSelf: 'center',
                      }}
                    >
                      <ExternalLink size={14} />
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--border)',
              textAlign: 'center',
            }}>
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                style={{
                  fontSize: '13px',
                  color: 'var(--blue-500)',
                  textDecoration: 'none',
                }}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
