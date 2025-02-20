// app/actions/notifications.ts
'use server';

import { Notification } from '../../../types/notification';

let notifications: Notification[] = [
  { id: 1, message: 'You have a new message', read: false, link: '/messages' },
  { id: 2, message: 'Your order has been shipped', read: true, link: '/orders' },
];

// Fetch all notifications
export async function getNotifications(): Promise<Notification[]> {
  return notifications;
}

// Mark a notification as read
export async function markNotificationAsRead(id: number): Promise<void> {
  const notification = notifications.find((n) => n.id === id);
  if (notification) {
    notification.read = true;
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(): Promise<void> {
  notifications = notifications.map((n) => ({ ...n, read: true }));
}

// Add a new notification (for real-time updates)
export async function addNotification(notification: Notification): Promise<void> {
  notifications = [notification, ...notifications];
}
