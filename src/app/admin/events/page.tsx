'use client';

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  MapPin, 
  Clock, 
  Users, 
  Megaphone, 
  CheckCircle2, 
  ArrowRight,
  X
} from 'lucide-react';

export default function AdminEventsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [events, setEvents] = useState([
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
  ]);

  return (
    <div className="space-y-6 font-sans text-slate-800">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#9C2007] bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
              Community Calendar &bull; Public Advisories
            </span>
            <span className="text-[10px] font-bold text-slate-400">&bull;</span>
            <span className="text-[10px] font-bold text-slate-500">Barangay Onse</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
            Events &amp; Community Calendar
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-red-900/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Post Event / Advisory</span>
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#9C2007] bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                  {evt.category}
                </span>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                  evt.status === 'COMPLETED' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {evt.status}
                </span>
              </div>

              <h3 className="font-black text-base text-slate-900 leading-snug">{evt.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{evt.desc}</p>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#9C2007]" />
                  <span className="font-bold text-slate-900">{evt.date}</span>
                  <span className="text-slate-300">|</span>
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{evt.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#9C2007]" />
                  <span>{evt.location}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                {evt.attendees}
              </span>
              <button
                onClick={() => alert(`Editing details for ${evt.title}`)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-[#9C2007] hover:text-white rounded-xl font-bold text-[11px] transition cursor-pointer"
              >
                Manage &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black uppercase text-slate-900">Post Community Event</h3>
            <p className="text-xs text-slate-500">Publish a new assembly, health mission, or activity to the citizen portal.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsAddModalOpen(false);
                alert('Event posted successfully to public calendar!');
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Event Title</label>
                <input required placeholder="e.g. Free Anti-Rabies Vaccination" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Date</label>
                  <input type="date" required className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Time</label>
                  <input required placeholder="08:00 AM - 01:00 PM" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Venue / Location</label>
                <input required placeholder="Barangay Onse Hall or Covered Court" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#9C2007] text-white font-black uppercase shadow-md"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
