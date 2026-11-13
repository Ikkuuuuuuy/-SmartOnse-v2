'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  createdAt: string; // ISO date
  type: 'request' | 'system' | 'event' | 'alert' | 'transparency';
  targetRole?: 'all' | 'admin' | 'staff' | 'kagawad' | 'sk' | 'resident';
  targetUserId?: string;
  href?: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (notification: {
    title: string;
    description: string;
    type?: 'request' | 'system' | 'event' | 'alert' | 'transparency';
    targetRole?: 'all' | 'admin' | 'staff' | 'kagawad' | 'sk' | 'resident';
    targetUserId?: string;
    href?: string;
  }) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      }
    } catch (err) {
      console.error('Failed to fetch real-time notifications:', err);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    fetchNotifications();

    // Real-time polling every 10 seconds + refresh when window regains focus
    const interval = setInterval(fetchNotifications, 10000);
    const handleFocus = () => fetchNotifications();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await fetch(`/api/notifications?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, []);

  const clearAll = useCallback(async () => {
    setNotifications([]);
    try {
      await fetch('/api/notifications?clearAll=true', {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  }, []);

  const addNotification = useCallback(
    async (item: {
      title: string;
      description: string;
      type?: 'request' | 'system' | 'event' | 'alert' | 'transparency';
      targetRole?: 'all' | 'admin' | 'staff' | 'kagawad' | 'sk' | 'resident';
      targetUserId?: string;
      href?: string;
    }) => {
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
        await fetchNotifications();
      } catch (err) {
        console.error('Failed to create notification:', err);
      }
    },
    [fetchNotifications]
  );

  const unreadCount = user ? notifications.filter((n) => !n.read).length : 0;

  return (
    <NotificationContext.Provider
      value={{
        notifications: user ? notifications : [],
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
