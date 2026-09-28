'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  MapPin, 
  Clock, 
  Users, 
  Megaphone, 
  CheckCircle2, 
  Edit3,
  Trash2,
  RefreshCw,
  X,
  Loader2
} from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

export interface EventItem {
  id: string;
  title: string;
  date: string;
  rawDate?: string;
  time: string;
  location: string;
  category: string;
  attendees: string;
  status: 'SCHEDULED' | 'UPCOMING' | 'COMPLETED';
  desc: string;
}

const FALLBACK_EVENTS: EventItem[] = [
  {
    id: 'EVT-01',
    title: 'Barangay General Assembly & State of the Barangay Address (SOBA)',
    date: 'September 12, 2026',
    time: '08:00 AM - 12:00 PM',
    location: 'Barangay Onse Covered Court, Lt. Artiaga St.',
    category: 'General Assembly',
    attendees: '350 Expected',
    status: 'SCHEDULED',
    desc: 'Annual presentation of Barangay Onse accomplishments, financial disclosures, and citizen consultation.',
  },
  {
    id: 'EVT-02',
    title: 'Free Medical & Dental Mission with San Juan City Health Office',
    date: 'September 05, 2026',
    time: '09:00 AM - 03:00 PM',
    location: 'Barangay Health Center, J.V. Panganiban St.',
    category: 'Health & Wellness',
    attendees: '200 Registered',
    status: 'UPCOMING',
    desc: 'Free general consultations, dental checkup, blood typing, and maintenance medicines for seniors.',
  },
  {
    id: 'EVT-03',
    title: 'SK Inter-Purok Youth Basketball & Volleyball League Opening',
    date: 'August 30, 2026',
    time: '04:00 PM - 08:00 PM',
    location: 'Onse Sports Complex',
    category: 'Youth & Sports',
    attendees: '180 Players',
    status: 'UPCOMING',
    desc: 'SK Youth Sports tournament opening ceremony featuring teams from Purok 1 to Purok 6.',
  },
  {
    id: 'EVT-04',
    title: 'Community Clean-Up Drive & Anti-Dengue Misting Operation',
    date: 'August 22, 2026',
    time: '06:00 AM - 10:00 AM',
    location: 'All Streets & Waterways of Brgy Onse',
    category: 'Environmental & DRRM',
    attendees: '75 Volunteers',
    status: 'COMPLETED',
    desc: 'Simultaneous clean-up of drainage canals and localized misting to prevent dengue outbreaks.',
  },
];

export default function AdminEventsPage() {
  const { addNotification } = useNotifications();
  const [events, setEvents] = useState<EventItem[]>(FALLBACK_EVENTS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  // Add Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCategory, setNewCategory] = useState('General Assembly');
  const [newDesc, setNewDesc] = useState('');

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/events');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.events) && data.events.length > 0) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          date: newDate,
          time: newTime,
          location: newLocation,
          category: newCategory,
          description: newDesc,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.event) {
        setEvents((prev) => [data.event, ...prev]);
        addNotification({
          title: `New Event: ${newTitle}`,
          description: `${newTitle} scheduled for ${newDate || 'this week'} at ${newLocation || 'Barangay Onse'}.`,
          type: 'event',
          targetRole: 'all',
          href: '/events',
        });
        setIsAddModalOpen(false);
        setNewTitle('');
        setNewDate('');
        setNewTime('');
        setNewLocation('');
        setNewDesc('');
      } else {
        alert(data.error || 'Failed to create event.');
      }
    } catch (err) {
      console.error('Error creating event:', err);
      alert('An error occurred while creating event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/events/${editingEvent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingEvent.title,
          date: editingEvent.rawDate,
          location: editingEvent.location,
          category: editingEvent.category,
          description: editingEvent.desc,
          time: editingEvent.time,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.event) {
        setEvents((prev) =>
          prev.map((evt) => (evt.id === editingEvent.id ? { ...evt, ...data.event } : evt))
        );
        setEditingEvent(null);
      } else {
        alert(data.error || 'Failed to update event.');
      }
    } catch (err) {
      console.error('Error updating event:', err);
      alert('An error occurred while updating event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove event "${title}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEvents((prev) => prev.filter((evt) => evt.id !== id));
      } else {
        alert(data.error || 'Failed to delete event.');
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('An error occurred while deleting event.');
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0B1528] p-6 rounded-3xl border border-slate-200/80 dark:border-blue-900/40 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/50 px-2.5 py-0.5 rounded-full">
              Community Calendar &bull; Public Advisories
            </span>
            <span className="text-[10px] font-bold text-slate-400">&bull;</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Barangay Onse</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Events &amp; Community Calendar
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchEvents}
            disabled={isLoading}
            className="px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] hover:bg-slate-100 dark:hover:bg-[#152747] border border-slate-200 dark:border-blue-900/40 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#9C2007] dark:text-rose-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Syncing...' : 'Sync Events'}</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-red-900/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post Event / Advisory</span>
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="bg-white dark:bg-[#0B1528] rounded-3xl p-6 border border-slate-200/80 dark:border-blue-900/40 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#9C2007] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/50 px-2.5 py-0.5 rounded-full">
                  {evt.category}
                </span>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  evt.status === 'COMPLETED' 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' 
                    : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
                }`}>
                  {evt.status}
                </span>
              </div>

              <h3 className="font-black text-base text-slate-900 dark:text-white leading-snug">{evt.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{evt.desc}</p>

              <div className="p-3.5 bg-slate-50 dark:bg-[#080E1A] rounded-2xl border border-slate-100 dark:border-blue-900/30 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#9C2007] dark:text-rose-400" />
                  <span className="font-bold text-slate-900 dark:text-white">{evt.date}</span>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{evt.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#9C2007] dark:text-rose-400" />
                  <span>{evt.location}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-blue-900/40 flex items-center justify-between text-xs">
              <span className="text-slate-400 dark:text-slate-400 font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                {evt.attendees}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setEditingEvent({ ...evt })}
                  className="px-2.5 py-1.5 bg-slate-100 dark:bg-[#0E1B33] hover:bg-[#9C2007] dark:hover:bg-[#9C2007] text-slate-800 dark:text-slate-200 hover:text-white rounded-xl font-bold text-[11px] transition cursor-pointer border border-transparent dark:border-blue-900/40 inline-flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteEvent(evt.id, evt.title)}
                  className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-600 text-rose-700 dark:text-rose-300 hover:text-white rounded-xl font-bold text-[11px] transition cursor-pointer border border-rose-200/60 dark:border-rose-900/40 inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0B1528] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200 dark:border-blue-900/50 shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white">Post Community Event</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Publish a new assembly, health mission, or activity to the public website.</p>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Event Title</label>
                <input 
                  required 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Free Anti-Rabies Vaccination" 
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-[#9C2007]" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Date</label>
                  <input 
                    type="date" 
                    required 
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Time</label>
                  <input 
                    required 
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="08:00 AM - 01:00 PM" 
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-[#9C2007]" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                  >
                    <option value="General Assembly">General Assembly</option>
                    <option value="Health & Wellness">Health & Wellness</option>
                    <option value="Youth & Sports">Youth & Sports</option>
                    <option value="Environmental & DRRM">Environmental & DRRM</option>
                    <option value="Community Activity">Community Activity</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Venue / Location</label>
                  <input 
                    required 
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Barangay Onse Covered Court" 
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-[#9C2007]" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Program overview and reminders for residents..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-[#9C2007]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#0E1B33] text-slate-700 dark:text-slate-300 font-bold uppercase transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#9C2007] hover:bg-[#8B1A05] text-white font-black uppercase shadow-md transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isSubmitting ? 'Publishing...' : 'Publish Event'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0B1528] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200 dark:border-blue-900/50 shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingEvent(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white">Edit Community Event</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Update event details for {editingEvent.title}</p>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Event Title</label>
                <input 
                  required 
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Date</label>
                  <input 
                    type="date" 
                    value={editingEvent.rawDate || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, rawDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Time</label>
                  <input 
                    required 
                    value={editingEvent.time}
                    onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Category</label>
                  <select
                    value={editingEvent.category}
                    onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                  >
                    <option value="General Assembly">General Assembly</option>
                    <option value="Health & Wellness">Health & Wellness</option>
                    <option value="Youth & Sports">Youth & Sports</option>
                    <option value="Environmental & DRRM">Environmental & DRRM</option>
                    <option value="Community Activity">Community Activity</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Venue / Location</label>
                  <input 
                    required 
                    value={editingEvent.location}
                    onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Description</label>
                <textarea
                  rows={2}
                  value={editingEvent.desc}
                  onChange={(e) => setEditingEvent({ ...editingEvent, desc: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#0E1B33] text-slate-700 dark:text-slate-300 font-bold uppercase transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#9C2007] hover:bg-[#8B1A05] text-white font-black uppercase shadow-md transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isSubmitting ? 'Updating...' : 'Update Event'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
