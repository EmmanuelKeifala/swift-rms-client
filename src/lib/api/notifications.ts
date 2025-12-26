import apiClient from './client';

export interface SubscribeDeviceRequest {
  token: string;
  platform: 'WEB' | 'ANDROID' | 'IOS';
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  referralId?: string;
  priority: string;
  channel: string;
  status: string;
  createdAt: string;
  readAt?: string;
  sentAt?: string;
}

export interface NotificationListResponse {
  data: Notification[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  count: number;
}

// Subscribe device for push notifications
export async function subscribeDevice(data: SubscribeDeviceRequest): Promise<void> {
  await apiClient.post('/notifications/subscribe', data);
}

// Get notifications list
export async function getNotifications(page = 1, limit = 20): Promise<{ data: Notification[]; total: number }> {
  const response = await apiClient.get('/notifications', {
    params: { page, limit },
  });
  // API returns { data: [...], meta: {...} }
  const result = response.data as { data: Notification[]; meta?: { total: number } };
  return { 
    data: result.data || [], 
    total: result.meta?.total || 0 
  };
}

// Get unread notification count
export async function getUnreadCount(): Promise<UnreadCountResponse> {
  const response = await apiClient.get('/notifications/unread-count');
  // API returns { data: { count: N } }
  return response.data as UnreadCountResponse;
}

// Mark notification as read
export async function markAsRead(notificationId: string): Promise<void> {
  await apiClient.patch(`/notifications/${notificationId}/read`);
}

// Mark all notifications as read
export async function markAllAsRead(): Promise<void> {
  await apiClient.patch('/notifications/read-all');
}
