'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  createdAt: string; // ISO date
  type: 'request' | 'system' | 'event' | 'alert' | 'transparency';
  targetRole?: 'all' | 'admin' | 'staff' | 'resident';
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
    targetRole?: 'all' | 'admin' | 'staff' | 'resident';
    href?: string;
  }) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NOTIFICATION_STORAGE_KEY = 'smartonse_notifications_v2';

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New Clearance Application',
    description: 'Juan Dela Cruz submitted Barangay Clearance #ONSE-2026-8891 for Employment review.',
    timestamp: '10m ago',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    type: 'request',
    targetRole: 'admin',
    href: '/admin/requests',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Community Medical Mission Scheduled',
    description: 'Free Flu Shots & Pediatric checkups at Onse Multi-Purpose Covered Court this Saturday.',
    timestamp: '1h ago',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    type: 'event',
    targetRole: 'all',
    href: '/events',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'DILG Full Disclosure Due',
    description: 'Q3 Financial report upload scheduled for mandatory submission under Form 83.',
    timestamp: '3h ago',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    type: 'transparency',
    targetRole: 'admin',
    href: '/admin/transparency',
    read: false,
  },
  {
    id: 'notif-4',
    title: 'SK Inter-Purok Youth Tournament',
    description: 'Basketball & Volleyball team rosters are now accepting player entries at the SK Office.',
    timestamp: '1d ago',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    type: 'event',
    targetRole: 'all',
    href: '/sk-programs',
    read: false,
  },
  {
    id: 'notif-5',
    title: 'System Security Audit Completed',
    description: 'Cryptographic SHA-256 ledger integrity check verified 100% valid with 0 tamper flags.',
    timestamp: '2d ago',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    type: 'system',
    targetRole: 'admin',
    href: '/admin/audit-logs',
    read: true,
  },
];

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      }
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage when updated
  const saveNotifications = (newNotifs: NotificationItem[]) => {
    setNotifications(newNotifs);
    try {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(newNotifs));
    } catch (e) {
      console.error('Failed to save notifications:', e);
    }
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    saveNotifications(updated);
  };

  const clearAll = () => {
    saveNotifications([]);
  };

  const addNotification = (item: {
    title: string;
    description: string;
    type?: 'request' | 'system' | 'event' | 'alert' | 'transparency';
    targetRole?: 'all' | 'admin' | 'staff' | 'resident';
    href?: string;
  }) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: item.title,
      description: item.description,
      timestamp: 'Just now',
      createdAt: new Date().toISOString(),
      type: item.type || 'system',
      targetRole: item.targetRole || 'all',
      href: item.href,
      read: false,
    };
    saveNotifications([newNotif, ...notifications]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
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
