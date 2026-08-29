'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  X, 
  FileText, 
  Calendar, 
  ShieldAlert, 
  Sparkles, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { useNotifications, NotificationItem } from '@/contexts/NotificationContext';

interface NotificationBellDropdownProps {
  variant?: 'navbar' | 'admin';
}

export default function NotificationBellDropdown({ variant = 'navbar' }: NotificationBellDropdownProps) {
  const router = useRouter();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll 
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredList = filter === 'unread' 
    ? notifications.filter((n) => !n.read) 
    : notifications;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'request':
        return <FileText className="w-4 h-4 text-[#9C2007] dark:text-rose-400" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'transparency':
        return <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'alert':
        return <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'system':
      default:
        return <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    markAsRead(item.id);
    setIsOpen(false);
    if (item.href) {
      router.push(item.href);
    }
  };

  const isNavbar = variant === 'navbar';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center justify-center transition-all cursor-pointer ${
          isNavbar
            ? 'w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full'
            : 'p-2.5 rounded-xl bg-slate-50 dark:bg-[#0E1B33] hover:bg-slate-100 dark:hover:bg-[#152747] border border-slate-200 dark:border-blue-900/60 text-slate-600 dark:text-slate-200'
        }`}
        title={`Notifications (${unreadCount} unread)`}
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4" />

        {/* Real Dynamic Unread Count Number Badge */}
        {unreadCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full font-black text-[10px] flex items-center justify-center shadow-md animate-in zoom-in ${
              isNavbar
                ? 'bg-amber-400 text-slate-950 ring-2 ring-[#9C2007]'
                : 'bg-[#9C2007] text-white ring-2 ring-white dark:ring-[#0E1B33]'
            }`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Interactive Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-[#0E1B33] rounded-3xl shadow-2xl border border-slate-200 dark:border-blue-900/60 z-[100] overflow-hidden animate-in fade-in zoom-in-95 text-slate-800 dark:text-slate-200 font-sans">
          
          {/* Header Bar */}
          <div className="p-4 border-b border-slate-100 dark:border-blue-900/50 bg-slate-50/70 dark:bg-[#080E1A]/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#9C2007]/10 dark:bg-[#9C2007]/20 text-[#9C2007] dark:text-rose-400 flex items-center justify-center">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                    Notifications
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:text-[#9C2007] dark:hover:text-rose-400 bg-white dark:bg-[#0E1B33] hover:bg-rose-50 dark:hover:bg-[#152747] rounded-lg border border-slate-200 dark:border-blue-900/40 transition cursor-pointer"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Read all</span>
                  </button>
                )}

                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                    title="Clear all notifications"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                  filter === 'all'
                    ? 'bg-[#9C2007] text-white shadow-xs'
                    : 'bg-white dark:bg-[#0E1B33] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#152747] border border-slate-200 dark:border-blue-900/40'
                }`}
              >
                All ({notifications.length})
              </button>

              <button
                type="button"
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                  filter === 'unread'
                    ? 'bg-[#9C2007] text-white shadow-xs'
                    : 'bg-white dark:bg-[#0E1B33] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#152747] border border-slate-200 dark:border-blue-900/40'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>

          {/* Notifications Scrollable List */}
          <div className="divide-y divide-slate-100 dark:divide-blue-900/40 max-h-80 overflow-y-auto custom-scrollbar">
            {filteredList.length === 0 ? (
              <div className="py-10 px-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-[#152747] text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {filter === 'unread' ? 'No unread notifications!' : 'All caught up!'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {filter === 'unread' 
                    ? 'You have reviewed all incoming alerts.' 
                    : 'New updates and announcements will appear here.'}
                </p>
              </div>
            ) : (
              filteredList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 transition flex items-start gap-3 cursor-pointer group relative ${
                    item.read 
                      ? 'hover:bg-slate-50 dark:hover:bg-[#152747]/50 opacity-80 hover:opacity-100' 
                      : 'bg-rose-50/40 dark:bg-[#152747]/90 hover:bg-rose-50/70 dark:hover:bg-[#1a3158]'
                  }`}
                >
                  {/* Unread Indicator Dot */}
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-[#9C2007] dark:bg-rose-400 shrink-0 mt-1.5" />
                  )}

                  {/* Icon Frame */}
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#0B1528] border border-slate-200 dark:border-blue-900/50 flex items-center justify-center shrink-0 shadow-2xs">
                    {getIcon(item.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate leading-tight group-hover:text-[#9C2007] dark:group-hover:text-rose-400 transition-colors">
                        {item.title}
                      </h4>
                      <span className="text-[9px] text-slate-400 dark:text-slate-400 shrink-0 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {item.timestamp}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {item.href && (
                      <span className="text-[10px] font-bold text-[#9C2007] dark:text-rose-400 inline-flex items-center gap-0.5 pt-0.5">
                        View details &rarr;
                      </span>
                    )}
                  </div>

                  {/* Dismiss Single Notification Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition cursor-pointer"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-3 border-t border-slate-100 dark:border-blue-900/50 bg-slate-50 dark:bg-[#080E1A] flex items-center justify-between text-xs">
            <Link
              href="/events"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-[#9C2007] dark:hover:text-rose-400 transition"
            >
              Public Calendar &rarr;
            </Link>

            <Link
              href="/admin/audit-logs"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-black uppercase text-[#9C2007] dark:text-rose-400 hover:underline flex items-center gap-1"
            >
              <span>Audit Trails</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}
