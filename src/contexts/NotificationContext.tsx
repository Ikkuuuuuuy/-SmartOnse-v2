'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  createdAt: string; // ISO date
  type: 'request' | 'system' | 'event' | 'alert' | 'transparency';
  targetRole?: 'all' | 'admin' | 'staff' | 'kagawad' | 'sk' | 'resident';
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
    href?: string;
  }) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Tailored initial notifications per account role
const ROLE_NOTIFICATIONS: Record<string, NotificationItem[]> = {
  admin: [
    {
      id: 'admin-1',
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
      id: 'admin-2',
      title: 'DILG Full Disclosure Due',
      description: 'Q3 Financial report upload scheduled for mandatory submission under Form 83.',
      timestamp: '2h ago',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      type: 'transparency',
      targetRole: 'admin',
      href: '/admin/transparency',
      read: false,
    },
    {
      id: 'admin-3',
      title: 'System Security Audit Completed',
      description: 'Cryptographic SHA-256 ledger integrity check verified 100% valid with 0 tamper flags.',
      timestamp: '1d ago',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      type: 'system',
      targetRole: 'admin',
      href: '/admin/audit-logs',
      read: true,
    },
  ],
  staff: [
    {
      id: 'staff-1',
      title: 'Document Review Queue Active',
      description: '4 pending clearance applications awaiting document verification and receipt generation.',
      timestamp: '15m ago',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      type: 'request',
      targetRole: 'staff',
      href: '/admin/requests',
      read: false,
    },
    {
      id: 'staff-2',
      title: 'Certificates Scheduled for Pickup',
      description: '12 approved citizen clearances printed and waiting for resident claim at Desk Window 2.',
      timestamp: '1h ago',
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      type: 'system',
      targetRole: 'staff',
      href: '/admin/requests',
      read: false,
    },
  ],
  kagawad: [
    {
      id: 'kagawad-1',
      title: 'Health Committee Advisory',
      description: 'Barangay Medical & Dental mission logistics finalized for Friday at the Onse Health Center.',
      timestamp: '30m ago',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      type: 'event',
      targetRole: 'kagawad',
      href: '/admin/services',
      read: false,
    },
    {
      id: 'kagawad-2',
      title: 'Regular Council Session Notice',
      description: 'Sangguniang Barangay ordinance review session scheduled for Wednesday 9:00 AM.',
      timestamp: '3h ago',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      type: 'system',
      targetRole: 'kagawad',
      href: '/admin/officials',
      read: false,
    },
  ],
  sk: [
    {
      id: 'sk-1',
      title: 'SK Youth Tournament Registration',
      description: '8 Basketball & Volleyball team rosters submitted and awaiting bracket verification.',
      timestamp: '20m ago',
      createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      type: 'event',
      targetRole: 'sk',
      href: '/sk-programs',
      read: false,
    },
    {
      id: 'sk-2',
      title: 'Katipunan ng Kabataan Assembly',
      description: 'Youth leadership workshop and educational assistance orientation set for this weekend.',
      timestamp: '4h ago',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      type: 'system',
      targetRole: 'sk',
      href: '/sk-programs',
      read: false,
    },
  ],
  resident: [
    {
      id: 'res-1',
      title: 'Clearance Application Received',
      description: 'Your Barangay Clearance #ONSE-2026-8891 is currently being reviewed by desk staff.',
      timestamp: '15m ago',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      type: 'request',
      targetRole: 'resident',
      href: '/track?trackingNumber=ONSE-2026-8891',
      read: false,
    },
    {
      id: 'res-2',
      title: 'Free Medical & Flu Shots Mission',
      description: 'Free healthcare checkups and flu vaccinations at Onse Covered Court this Saturday, 8:00 AM.',
      timestamp: '2h ago',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      type: 'event',
      targetRole: 'resident',
      href: '/events',
      read: false,
    },
  ],
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Load account-specific notifications whenever user logs in, logs out, or switches accounts
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const userKey = `smartonse_notifs_${user.id || user.role || user.email}`;
    try {
      const stored = localStorage.getItem(userKey);
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        const defaultRoleNotifs = ROLE_NOTIFICATIONS[user.role] || ROLE_NOTIFICATIONS.resident;
        setNotifications(defaultRoleNotifs);
        localStorage.setItem(userKey, JSON.stringify(defaultRoleNotifs));
      }
    } catch (e) {
      console.error('Failed to load user notifications:', e);
      const defaultRoleNotifs = ROLE_NOTIFICATIONS[user.role] || ROLE_NOTIFICATIONS.resident;
      setNotifications(defaultRoleNotifs);
    }
  }, [user]);

  // Save to current user's localStorage
  const saveNotifications = (newNotifs: NotificationItem[]) => {
    setNotifications(newNotifs);
    if (!user) return;
    const userKey = `smartonse_notifs_${user.id || user.role || user.email}`;
    try {
      localStorage.setItem(userKey, JSON.stringify(newNotifs));
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
    targetRole?: 'all' | 'admin' | 'staff' | 'kagawad' | 'sk' | 'resident';
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
