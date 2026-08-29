import React from 'react';
import prisma from '@/lib/prisma';

export const revalidate = 60;

export default async function TransparencyPage() {
  let documents: any[] = [];
  try {
    documents = await prisma.transparencyDocument.findMany({
      orderBy: { publishedDate: 'desc' },
    });
  } catch (e) {
    console.error(e);
  }

  const skDocs = documents.filter((doc) => doc.category.toLowerCase().includes('sk') || doc.category.toLowerCase().includes('youth'));
  const barangayDocs = documents.filter((doc) => !doc.category.toLowerCase().includes('sk') && !doc.category.toLowerCase().includes('youth'));

  return (
    <div className="min-h-screen bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 pt-32 md:pt-40 pb-20 px-6 lg:px-10 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <header className="mb-16 text-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-4">
              Transparency <span className="text-[#9C2007] dark:text-rose-500">Board</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] mb-2">
              Public Financial &amp; Administrative Reports
            </p>
            <div className="h-1 w-20 bg-[#9C2007] mx-auto rounded-full"></div>
          </div>
        </header>

        {/* Barangay Disclosure Section */}
        <div className="bg-white/60 dark:bg-[#0E1B33]/80 backdrop-blur-xl p-8 md:p-12 rounded-[4rem] shadow-2xl border border-white dark:border-blue-900/50 mb-12">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 dark:bg-rose-950/60 rounded-full mb-6">
              <svg className="w-8 h-8 text-[#9C2007] dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
              Barangay <span className="text-[#9C2007] dark:text-rose-400">Disclosure</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
              In compliance with the DILG directives, Barangay Onse maintains this board to provide
              residents access to vital financial data, promoting a culture of honesty and accountability.
            </p>
          </div>

          {/* Barangay Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {barangayDocs.length > 0 ? (
              barangayDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-8 bg-white/80 dark:bg-[#152747]/80 backdrop-blur-md rounded-[3rem] border border-white/80 dark:border-blue-900/40 hover:bg-white dark:hover:bg-[#1C335C] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col justify-between"
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-[10px] font-black text-[#9C2007] dark:text-rose-400 uppercase tracking-widest">{doc.category}</span>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400">{doc.year} {doc.quarter}</span>
                    </div>
                    <h3 className="font-black text-slate-800 dark:text-slate-100 text-lg mb-6 leading-tight group-hover:text-[#9C2007] dark:group-hover:text-rose-400 transition-colors">
                      {doc.title}
                    </h3>
                    <div className="mt-auto">
                      <a
                        href={doc.fileUrl || '#'}
                        className="inline-flex items-center gap-2 text-xs font-black uppercase text-slate-600 dark:text-slate-300 group-hover:text-[#9C2007] dark:group-hover:text-rose-400 transition-colors bg-white/70 dark:bg-[#0E1B33] px-5 py-3 rounded-2xl border border-slate-200 dark:border-blue-900/50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Document ({doc.fileSize})
                      </a>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-slate-500 font-medium">
                No documents available at the moment.
              </div>
            )}
          </div>
        </div>


        {/* SK Disclosure Section */}
        <div className="bg-white dark:bg-[#0B1528] text-slate-900 dark:text-white p-8 md:p-12 rounded-[4rem] shadow-xl border border-blue-200 dark:border-blue-900/50 mb-12 relative overflow-hidden transition-colors duration-200">
          {/* SK Decorative Background */}
          <div className="absolute top-0 right-0 opacity-5 dark:opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4 text-blue-600">
            <svg width="400" height="400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>

          <div className="mb-12 text-center relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-950/80 rounded-full mb-6 border border-blue-200 dark:border-blue-800/40">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight mb-4 text-slate-900 dark:text-white">
              Sangguniang Kabataan <span className="text-blue-600 dark:text-blue-400">Disclosure</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
              Supporting youth empowerment through clear and accessible documentation of SK funds,
              activities, and developmental programs.
            </p>
          </div>

          {/* SK Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left relative z-10">
            {skDocs.length > 0 ? (
              skDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-8 bg-blue-50/60 dark:bg-[#152747]/80 backdrop-blur-md rounded-[3rem] border border-blue-100 dark:border-blue-900/40 hover:bg-blue-50 dark:hover:bg-[#1C335C] hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group flex flex-col justify-between"
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{doc.category}</span>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400">{doc.year} {doc.quarter}</span>
                    </div>
                    <h3 className="font-black text-slate-900 dark:text-white text-lg mb-6 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                      {doc.title}
                    </h3>
                    <div className="mt-auto">
                      <a
                        href={doc.fileUrl || '#'}
                        className="inline-flex items-center gap-2 text-xs font-black uppercase text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors bg-white dark:bg-[#0E1B33] px-5 py-3 rounded-2xl border border-blue-200 dark:border-blue-900/50 shadow-xs"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Document ({doc.fileSize})
                      </a>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-slate-400 font-medium">
                No SK documents available at the moment.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
