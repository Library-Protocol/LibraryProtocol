'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';

import { Bell, X, Info } from 'lucide-react';

import { Badge, Button, Dialog, DialogContent, DialogTitle } from '@mui/material';

import {
  getNotifications,
  markNotificationAsRead,
} from '@/app/server/actions/notification';
import type { Notification } from '../../types/notification';


const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      const data = await getNotifications();

      setNotifications(data);
      setUnreadCount(data.filter((notification) => !notification.read).length);
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    await markNotificationAsRead(id);
    const updatedNotifications = await getNotifications();

    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.filter((n) => !n.read).length);
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <Button
        onClick={() => setOpen(true)}
        variant="text"
        size="small"
        className="relative w-10 h-10 rounded-full"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <Badge
            variant="standard"
            color="error"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <div className="border-b px-4 py-2 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-base font-medium">Notifications</DialogTitle>
            <Info className="h-4 w-4 text-gray-400" />
          </div>
          <Button
            variant="text"
            size="small"
            className="h-8 w-8"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <img
              src="/sleeping-illustration.svg"
              alt="No notifications"
              className="w-32 h-32 mb-4" />
            <p className="text-gray-500 text-center">
              Shh! It&apos;s quiet around here...
            </p>
          </div>
        ) : (
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <Link
                    href={notification.link}
                    className="flex-1 text-sm text-gray-600"
                  >
                    {notification.message}
                  </Link>
                  {!notification.read && (
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Mark read
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NotificationBell;
