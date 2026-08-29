'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, MapPin, Tag, Clock, ArrowRight, X } from 'lucide-react';

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'barangay' | 'sk'>('all');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 8, 1)); // September 2026
  const [selectedStory, setSelectedStory] = useState<any | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const events = [
    {
      id: 1,
      title: 'General Barangay Assembly & State of the Barangay Address (SOBA)',
      category: 'barangay',
      content: 'Mandatory assembly for all residents of Barangay Onse to discuss local projects, budget utilization, peace and order, and upcoming community programs for 2026.',
      location: 'Barangay Onse Covered Court',
      event_date: '2026-09-15',
      display_date: 'September 15, 2026',
      time: '9:00 AM - 12:00 PM',
    },
    {
      id: 2,
      title: 'SK Inter-Barangay Basketball League & Youth Sportsfest 2026',
      category: 'sk',
      content: 'Annual youth sports tournament featuring basketball, volleyball, and e-sports tournaments with scholarship awards for outstanding student-athletes.',
      location: 'San Juan Sports Complex & Onse Court',
      event_date: '2026-09-20',
      display_date: 'September 20, 2026',
      time: '2:00 PM - 6:00 PM',
    },
    {
      id: 3,
      title: 'Free Anti-Rabies Vaccination & Pet Microchipping Drive',
      category: 'barangay',
      content: 'Free pet immunization campaign in partnership with the San Juan City Veterinary Office. Bring your cats and dogs for free vaccination and health check.',
      location: 'Barangay Onse Multi-Purpose Hall',
      event_date: '2026-09-28',
      display_date: 'September 28, 2026',
      time: '8:00 AM - 3:00 PM',
    },
    {
      id: 4,
      title: 'SK Digital Literacy & AI Coding Workshop for Onse Youth',
      category: 'sk',
      content: 'Free workshop series on computer basics, modern web skills, and safe digital citizenship for high school and college students in Barangay Onse.',
      location: 'Onse Youth Center / DigiParc',
      event_date: '2026-10-05',
      display_date: 'October 5, 2026',
      time: '1:00 PM - 5:00 PM',
    },
    {
      id: 5,
      title: 'Community Clean-Up Drive & Dengue Vector Control',
      category: 'barangay',
      content: 'Barangay-wide sanitation initiative and larvicide application to prevent dengue and maintain clean streets and waterways across Barangay Onse.',
      location: 'Assembly at Barangay Hall',
      event_date: '2026-10-12',
      display_date: 'October 12, 2026',
      time: '6:00 AM - 10:00 AM',
    },
  ];

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter((item) => item.category === selectedCategory);

  const dayFilteredEvents = selectedDay 
    ? filteredEvents.filter((item) => {
        const d = new Date(item.event_date);
        return d.getDate() === selectedDay && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
    : filteredEvents;

  return (
    <div className="min-h-screen bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 pt-32 md:pt-40 pb-20 px-6 lg:px-10 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <header className="mb-16 text-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-4">
              Barangay <span className="text-[#9C2007] dark:text-rose-500">Events &amp; News</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] mb-2">
              Community Assemblies, Projects &amp; Youth Activities
            </p>
            <div className="h-1 w-20 bg-[#9C2007] mx-auto rounded-full"></div>
          </div>
        </header>

        {/* Category Filters */}
        <div className="flex justify-center gap-3 mb-12">
          {[
            { key: 'all', label: 'All Activities' },
            { key: 'barangay', label: 'Barangay Council' },
            { key: 'sk', label: 'SK Youth Programs' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setSelectedCategory(tab.key as any);
                setSelectedDay(null);
              }}
              className={`px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-wider transition shadow-sm cursor-pointer ${
                selectedCategory === tab.key
                  ? 'bg-[#9C2007] text-white shadow-lg shadow-[#9C2007]/20'
                  : 'bg-white dark:bg-[#0E1B33] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#152747] border border-slate-200 dark:border-blue-900/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Interactive Event Calendar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#0E1B33] p-8 rounded-[3.5rem] shadow-xl border border-slate-100 dark:border-blue-900/50 sticky top-28">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-black text-slate-900 dark:text-white text-lg uppercase tracking-tight">
                  {monthNames[currentMonth]} {currentYear}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#152747] flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#1C335C] transition cursor-pointer"
                  >
                    &larr;
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#152747] flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#1C335C] transition cursor-pointer"
                  >
                    &rarr;
                  </button>
                </div>
              </div>

              {/* Day names */}
              <div className="grid grid-cols-7 gap-1 text-center mb-3">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                  <span key={idx} className="text-[10px] font-black text-slate-400 dark:text-slate-500">{d}</span>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="p-2"></div>
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const hasEvents = events.some((e) => {
                    const d = new Date(e.event_date);
                    return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                  });
                  const isSelected = selectedDay === day;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                      className={`p-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'bg-[#9C2007] text-white shadow-md'
                          : hasEvents
                          ? 'bg-red-50 dark:bg-rose-950/60 text-[#9C2007] dark:text-rose-400 font-black hover:bg-red-100 dark:hover:bg-rose-950'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#152747]'
                      }`}
                    >
                      <span>{day}</span>
                      {hasEvents && !isSelected && (
                        <span className="w-1.5 h-1.5 bg-[#9C2007] dark:bg-rose-400 rounded-full mt-0.5"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedDay && (
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-blue-900/40 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Filter: Day {selectedDay}</span>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="text-xs font-black text-[#9C2007] dark:text-rose-400 hover:underline cursor-pointer"
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Events List Grid */}
          <div className="lg:col-span-2 space-y-6">
            {dayFilteredEvents.length > 0 ? (
              dayFilteredEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedStory(ev)}
                  className="bg-white dark:bg-[#0E1B33] p-8 rounded-[3.5rem] shadow-xl border border-slate-100 dark:border-blue-900/50 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        ev.category === 'sk' ? 'bg-[#000055]/10 dark:bg-blue-950/80 text-[#000055] dark:text-blue-300' : 'bg-[#9C2007]/10 dark:bg-rose-950/80 text-[#9C2007] dark:text-rose-400'
                      }`}>
                        {ev.category === 'sk' ? 'Sangguniang Kabataan' : 'Barangay Council'}
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-400 text-xs font-bold">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{ev.display_date}</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-[#9C2007] dark:group-hover:text-rose-400 transition-colors leading-tight">
                      {ev.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 font-medium line-clamp-2">
                      {ev.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-blue-900/40 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-[#9C2007] dark:text-rose-400" />
                      <span>{ev.location}</span>
                    </div>
                    <span className="font-black text-[#9C2007] dark:text-rose-400 uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read Details &rarr;
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-[#0E1B33] p-12 rounded-[3.5rem] border border-slate-100 dark:border-blue-900/50 text-center text-slate-500 dark:text-slate-400 font-medium">
                No events found for this selection.
              </div>
            )}
          </div>
        </div>

        {/* Event Story Modal */}
        {selectedStory && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
            <div className="bg-white dark:bg-[#0E1B33] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-blue-900/60 max-w-2xl w-full rounded-[3.5rem] p-8 md:p-12 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedStory(null)}
                className="absolute top-8 right-8 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center font-black text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                ✕
              </button>

              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-4 ${
                selectedStory.category === 'sk' ? 'bg-[#000055]/10 dark:bg-blue-950/80 text-[#000055] dark:text-blue-300' : 'bg-[#9C2007]/10 dark:bg-rose-950/80 text-[#9C2007] dark:text-rose-400'
              }`}>
                {selectedStory.category === 'sk' ? 'Sangguniang Kabataan' : 'Barangay Council'}
              </span>

              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                {selectedStory.title}
              </h2>

              <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400 font-bold mb-8 pb-6 border-b border-slate-100 dark:border-blue-900/40">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#9C2007] dark:text-rose-400" />
                  <span>{selectedStory.display_date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#9C2007] dark:text-rose-400" />
                  <span>{selectedStory.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#9C2007] dark:text-rose-400" />
                  <span>{selectedStory.location}</span>
                </div>
              </div>

              <div className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-base mb-8 whitespace-pre-line">
                {selectedStory.content}
              </div>

              <button
                onClick={() => setSelectedStory(null)}
                className="w-full bg-[#9C2007] text-white py-4 rounded-full font-black text-xs uppercase tracking-widest hover:brightness-110 transition shadow-lg shadow-[#9C2007]/20 cursor-pointer"
              >
                Close Event
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

