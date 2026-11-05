'use client';

import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  PieChart, 
  FileText, 
  DollarSign, 
  ArrowUpRight, 
  Sparkles,
  Info,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export interface AnalyticsData {
  summary: {
    totalRequests: number;
    pendingCount: number;
    processingCount: number;
    readyCount: number;
    completedCount: number;
    rejectedCount: number;
    realizedRevenue: number;
    pipelineRevenue: number;
    waivedRevenue: number;
    freeRequestsCount: number;
    paidRequestsCount: number;
    exemptionRate: number;
    collectionEfficiency: number;
    avgTurnaroundDays: string;
    avgRating: string;
    ratingsCount: number;
    totalUsers: number;
    verifiedUsers: number;
    totalInhabitants: number;
  };
  documentTypeBreakdown: Array<{
    name: string;
    code: string;
    count: number;
    revenue: number;
    percentage: number;
    color: string;
  }>;
  monthlyVelocity: Array<{
    label: string;
    monthYear: string;
    sortKey: string;
    clearances: number;
    revenue: number;
    completed: number;
  }>;
  topPurposes: Array<{ purpose: string; count: number }>;
}

export interface DashboardChartsProps {
  selectedPeriod: string;
  analytics?: AnalyticsData | null;
}

interface TrendPoint {
  label: string;
  clearances: number;
  revenue: number;
  budget: number;
  growth: string;
}

interface SectorItem {
  name: string;
  shortName: string;
  percentage: number;
  amount: number;
  count?: number;
  color: string;
  desc: string;
}

// Fallback Period Data Sets (if database is brand new / completely empty)
const PERIOD_DATA: Record<string, TrendPoint[]> = {
  'FY 2026 (August 2026)': [
    { label: 'May', clearances: 4, revenue: 330, budget: 0, growth: 'Base' },
    { label: 'Jun', clearances: 6, revenue: 580, budget: 0, growth: '+50%' },
    { label: 'Jul', clearances: 7, revenue: 650, budget: 0, growth: '+16%' },
    { label: 'Aug', clearances: 9, revenue: 850, budget: 0, growth: '+28%' },
  ],
  'FY 2026 (Q3 July-Sept)': [
    { label: 'Jul', clearances: 7, revenue: 650, budget: 0, growth: 'Base' },
    { label: 'Aug', clearances: 9, revenue: 850, budget: 0, growth: '+28%' },
    { label: 'Sep', clearances: 10, revenue: 950, budget: 0, growth: '+11%' },
  ],
  'FY 2026 Annual': [
    { label: 'Jan', clearances: 2, revenue: 150, budget: 0, growth: 'Base' },
    { label: 'Feb', clearances: 3, revenue: 230, budget: 0, growth: '+50%' },
    { label: 'Mar', clearances: 4, revenue: 310, budget: 0, growth: '+33%' },
    { label: 'Apr', clearances: 4, revenue: 350, budget: 0, growth: '0%' },
    { label: 'May', clearances: 5, revenue: 410, budget: 0, growth: '+25%' },
    { label: 'Jun', clearances: 6, revenue: 580, budget: 0, growth: '+20%' },
    { label: 'Jul', clearances: 7, revenue: 650, budget: 0, growth: '+12%' },
    { label: 'Aug', clearances: 9, revenue: 850, budget: 0, growth: '+28%' },
  ],
};

const DEFAULT_SECTORS: SectorItem[] = [
  { name: 'Barangay Clearance', shortName: 'Clearance', percentage: 38, amount: 450, count: 9, color: '#DC2626', desc: 'Standard residency and good standing certificates' },
  { name: 'Certificate of Residency', shortName: 'Residency', percentage: 25, amount: 210, count: 7, color: '#3B82F6', desc: 'Proof of residency certificates' },
  { name: 'Certificate of Indigency', shortName: 'Indigency', percentage: 17, amount: 0, count: 5, color: '#10B981', desc: 'Fee-exempted medical and financial assistance' },
  { name: 'First Time Jobseeker', shortName: 'Jobseeker', percentage: 12, amount: 0, count: 3, color: '#F59E0B', desc: 'R.A. 11261 waived pre-employment certificates' },
  { name: 'Business Clearance', shortName: 'Business', percentage: 8, amount: 500, count: 2, color: '#8B5CF6', desc: 'Commercial establishment permits' },
];

export default function DashboardCharts({ selectedPeriod, analytics }: DashboardChartsProps) {
  // Metric toggle for Left Chart: 'clearances' or 'revenue'
  const [activeMetric, setActiveMetric] = useState<'clearances' | 'revenue'>('clearances');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Sector hover state for Right Donut Chart
  const [hoveredSectorIndex, setHoveredSectorIndex] = useState<number | null>(null);

  // Derive points from real database analytics if available
  const points: TrendPoint[] = useMemo(() => {
    if (analytics && Array.isArray(analytics.monthlyVelocity) && analytics.monthlyVelocity.length > 0) {
      return analytics.monthlyVelocity.map((m, i, arr) => {
        const prev = i > 0 ? arr[i - 1].clearances : m.clearances;
        const diff = m.clearances - prev;
        const growth = i === 0 ? 'Base' : diff >= 0 ? `+${diff}` : `${diff}`;
        return {
          label: m.label,
          clearances: m.clearances,
          revenue: m.revenue,
          budget: 0,
          growth,
        };
      });
    }
    return PERIOD_DATA[selectedPeriod] || PERIOD_DATA['FY 2026 (August 2026)'];
  }, [analytics, selectedPeriod]);

  // Derive sectors from real documentTypeBreakdown if available
  const sectors: SectorItem[] = useMemo(() => {
    if (analytics && Array.isArray(analytics.documentTypeBreakdown) && analytics.documentTypeBreakdown.length > 0) {
      return analytics.documentTypeBreakdown.map((t) => {
        const short = t.name
          .replace('Barangay ', '')
          .replace('Certificate of ', 'Cert. ')
          .replace('First Time Jobseeker Certificate', 'Jobseeker (RA 11261)')
          .replace('Incident / Blotter Certification', 'Blotter Report');

        return {
          name: t.name,
          shortName: short.length > 18 ? `${short.slice(0, 16)}…` : short,
          percentage: t.percentage,
          amount: t.revenue,
          count: t.count,
          color: t.color,
          desc: `${t.count} requests (${t.percentage}%) • ₱${t.revenue.toLocaleString()} collected`,
        };
      });
    }
    return DEFAULT_SECTORS;
  }, [analytics]);

  // Calculate totals and statistics
  const stats = useMemo(() => {
    const totalClearances = points.reduce((sum, p) => sum + p.clearances, 0);
    const totalRevenue = points.reduce((sum, p) => sum + p.revenue, 0);
    const avgClearances = points.length > 0 ? Math.round(totalClearances / points.length) : 0;
    const peakPoint = [...points].sort((a, b) => b.clearances - a.clearances)[0];

    return {
      totalClearances,
      totalRevenue,
      avgClearances,
      peakMonth: peakPoint?.label ?? 'N/A',
      peakValue: peakPoint?.clearances ?? 0,
    };
  }, [points]);

  // SVG Chart Geometry Calculations
  const chartWidth = 600;
  const chartHeight = 200;
  const padding = { left: 45, right: 45, top: 30, bottom: 40 };

  const usableWidth = chartWidth - padding.left - padding.right;
  const usableHeight = chartHeight - padding.top - padding.bottom;

  const values = points.map((p) => (activeMetric === 'clearances' ? p.clearances : p.revenue));
  const minValue = 0;
  const rawMax = Math.max(...values, 5);
  // Round max value up to nice number for cleaner grid
  const maxValue = activeMetric === 'clearances'
    ? Math.max(5, Math.ceil(rawMax * 1.2))
    : Math.max(100, Math.ceil(rawMax / 100) * 100);

  // Calculate pixel coordinates for each point
  const coords = useMemo(() => {
    if (points.length === 0) return [];
    if (points.length === 1) {
      const p = points[0];
      const val = activeMetric === 'clearances' ? p.clearances : p.revenue;
      const x = padding.left + usableWidth / 2;
      const y = padding.top + usableHeight - ((val - minValue) / (maxValue - minValue)) * usableHeight;
      return [{ x, y, point: p, val }];
    }
    return points.map((p, idx) => {
      const val = activeMetric === 'clearances' ? p.clearances : p.revenue;
      const x = padding.left + (idx / Math.max(1, points.length - 1)) * usableWidth;
      const y = padding.top + usableHeight - ((val - minValue) / (maxValue - minValue)) * usableHeight;
      return { x, y, point: p, val };
    });
  }, [points, activeMetric, maxValue, usableWidth, usableHeight, padding.left, padding.top]);

  // Generate Smooth Bezier Curve Path
  const linePath = useMemo(() => {
    if (coords.length === 0) return '';
    if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;

    let path = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const cp1x = curr.x + (next.x - curr.x) / 2;
      const cp1y = curr.y;
      const cp2x = curr.x + (next.x - curr.x) / 2;
      const cp2y = next.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    return path;
  }, [coords]);

  // Closed Area Path for gradient fill
  const areaPath = useMemo(() => {
    if (coords.length === 0) return '';
    const bottomY = padding.top + usableHeight;
    const firstX = coords[0].x;
    const lastX = coords[coords.length - 1].x;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [coords, linePath, padding.top, usableHeight]);

  // Grid levels (4 intervals)
  const gridLevels = [0, 0.33, 0.66, 1];

  // Donut chart calculations: Circumference of circle with r=38
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76

  // Cumulative stroke offsets for donut slices
  const totalSectorCount = useMemo(() => {
    return sectors.reduce((sum, s) => sum + (s.count || 1), 0);
  }, [sectors]);

  let cumulativeOffset = 0;
  const donutSlices = sectors.map((sec, idx) => {
    const fraction = totalSectorCount > 0 ? (sec.count || 1) / totalSectorCount : 0.2;
    const strokeDash = fraction * circumference;
    const offset = cumulativeOffset;
    cumulativeOffset += strokeDash;
    return {
      ...sec,
      index: idx,
      strokeDash,
      offset,
    };
  });

  const activeSector = hoveredSectorIndex !== null ? sectors[hoveredSectorIndex] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* 1. LEFT CHART: Velocity & Growth Trend (Interactive) */}
      <div className="lg:col-span-7 bg-white dark:bg-[#0B1528] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-blue-900/40 shadow-xs space-y-5 flex flex-col justify-between transition-all">
        
        {/* Top Header with Metric Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#9C2007] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/50 px-2 py-0.5 rounded-full">
                System Activity Stream
              </span>
              <span className="text-[10px] font-bold text-slate-400">&bull;</span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                Live Database Records
              </span>
            </div>
            <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#9C2007] dark:text-rose-400" />
              <span>Barangay Request &amp; Fee Velocity</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Real request volume and actual fee collections recorded inside SmartOnse.
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#080E1A] p-1 rounded-xl border border-slate-200 dark:border-blue-900/40 shrink-0">
            <button
              onClick={() => setActiveMetric('clearances')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                activeMetric === 'clearances'
                  ? 'bg-[#9C2007] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>Volume</span>
            </button>
            <button
              onClick={() => setActiveMetric('revenue')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                activeMetric === 'revenue'
                  ? 'bg-[#9C2007] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <DollarSign className="w-3 h-3" />
              <span>Revenue (₱)</span>
            </button>
          </div>
        </div>

        {/* SVG Interactive Chart Canvas */}
        <div className="relative w-full h-[210px] select-none">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="velocityAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9C2007" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#9C2007" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines and Y-Axis Labels */}
            {gridLevels.map((lvl, idx) => {
              const y = padding.top + usableHeight - lvl * usableHeight;
              const labelVal = Math.round(minValue + lvl * (maxValue - minValue));
              const displayVal = activeMetric === 'revenue'
                ? `₱${labelVal >= 1000 ? `${(labelVal / 1000).toFixed(0)}k` : labelVal}`
                : labelVal;

              return (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="currentColor"
                    strokeDasharray="4 4"
                    className="text-slate-200 dark:text-blue-900/40"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3}
                    fontSize="9"
                    fontWeight="700"
                    fill="currentColor"
                    className="text-slate-400 dark:text-slate-400"
                    textAnchor="end"
                  >
                    {displayVal}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            {areaPath && (
              <path
                d={areaPath}
                fill="url(#velocityAreaGradient)"
                className="transition-all duration-300 ease-out"
              />
            )}

            {/* Smooth Bezier Line */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="#9C2007"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300 ease-out drop-shadow-sm"
              />
            )}

            {/* Hover Vertical Guide Line */}
            {hoveredPointIndex !== null && coords[hoveredPointIndex] && (
              <line
                x1={coords[hoveredPointIndex].x}
                y1={padding.top}
                x2={coords[hoveredPointIndex].x}
                y2={padding.top + usableHeight}
                stroke="#9C2007"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                className="opacity-70 animate-in fade-in"
              />
            )}

            {/* Interactive Points & X-Axis Labels */}
            {coords.map((c, idx) => {
              const isHovered = hoveredPointIndex === idx;

              return (
                <g
                  key={idx}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredPointIndex(idx)}
                  onMouseLeave={() => setHoveredPointIndex(null)}
                >
                  {/* Invisible larger hover hit target */}
                  <circle cx={c.x} cy={c.y} r="18" fill="transparent" />

                  {/* Outer glowing halo on hover */}
                  {isHovered && (
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r="9"
                      fill="#DC2626"
                      fillOpacity="0.25"
                      className="animate-ping"
                    />
                  )}

                  {/* Visible data point circle */}
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={isHovered ? 6 : 4.5}
                    fill="#9C2007"
                    stroke="#ffffff"
                    strokeWidth={isHovered ? 3 : 2}
                    className="transition-all duration-150"
                  />

                  {/* X-Axis Label */}
                  <text
                    x={c.x}
                    y={chartHeight - 15}
                    fontSize="10"
                    fontWeight={isHovered ? '900' : '700'}
                    fill="currentColor"
                    className={`transition-colors duration-150 ${
                      isHovered
                        ? 'text-[#9C2007] dark:text-rose-400'
                        : 'text-slate-400 dark:text-slate-400'
                    }`}
                    textAnchor="middle"
                  >
                    {c.point.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Floating Tooltip positioned over hovered point */}
          {hoveredPointIndex !== null && coords[hoveredPointIndex] && (
            <div
              className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 bg-white dark:bg-[#0B1528] p-3 rounded-2xl shadow-xl border border-slate-200 dark:border-blue-900/60 text-xs animate-in zoom-in-95 duration-150"
              style={{
                left: `${(coords[hoveredPointIndex].x / chartWidth) * 100}%`,
                top: `${(coords[hoveredPointIndex].y / chartHeight) * 100}%`,
              }}
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-blue-900/40 pb-1.5 mb-1.5">
                <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {coords[hoveredPointIndex].point.label}
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                  {coords[hoveredPointIndex].point.growth}
                </span>
              </div>
              <div className="space-y-1 font-mono text-[11px]">
                <div className="flex items-center justify-between gap-3 text-slate-700 dark:text-slate-200">
                  <span>Applications:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">
                    {coords[hoveredPointIndex].point.clearances.toLocaleString()} requests
                  </strong>
                </div>
                <div className="flex items-center justify-between gap-3 text-slate-700 dark:text-slate-200">
                  <span>Fee Collections:</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
                    ₱{coords[hoveredPointIndex].point.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Real Calculated Summary Strip */}
        <div className="pt-3 border-t border-slate-100 dark:border-blue-900/40 grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              System Total
            </span>
            <span className="font-black text-slate-900 dark:text-white text-sm">
              {activeMetric === 'clearances'
                ? `${stats.totalClearances.toLocaleString()} Requests`
                : `₱${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Average Velocity
            </span>
            <span className="font-black text-slate-900 dark:text-white text-sm">
              {stats.avgClearances} docs / mo
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Peak Period
            </span>
            <span className="font-black text-[#9C2007] dark:text-rose-400 text-sm">
              {stats.peakMonth} ({stats.peakValue} docs)
            </span>
          </div>
        </div>
      </div>

      {/* 2. RIGHT CHART: Service & Revenue Share (Interactive Donut) */}
      <div className="lg:col-span-5 bg-white dark:bg-[#0B1528] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-blue-900/40 shadow-xs space-y-4 flex flex-col justify-between transition-all">
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/50 px-2 py-0.5 rounded-full">
              System Service Distribution
            </span>
            <span className="text-[10px] font-bold text-slate-400">&bull;</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Database Audit</span>
          </div>
          <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Document Request &amp; Revenue Share</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Real distribution of citizen applications and collections across all document services.
          </p>
        </div>

        {/* Dynamic Interactive SVG Donut */}
        <div className="flex items-center justify-center py-2 relative">
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {donutSlices.map((slice) => {
                const isHovered = hoveredSectorIndex === slice.index;

                return (
                  <circle
                    key={slice.index}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth={isHovered ? 21 : 17}
                    strokeDasharray={`${slice.strokeDash} ${circumference}`}
                    strokeDashoffset={-slice.offset}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredSectorIndex(slice.index)}
                    onMouseLeave={() => setHoveredSectorIndex(null)}
                    style={{
                      filter: isHovered ? 'drop-shadow(0 0 6px rgba(0,0,0,0.3))' : 'none',
                    }}
                  />
                );
              })}
            </svg>

            {/* Dynamic Center Label (Transforms on Hover) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 pointer-events-none">
              {activeSector ? (
                <div className="animate-in zoom-in-90 duration-150 space-y-0.5">
                  <span
                    className="text-[10px] font-black uppercase block tracking-wider truncate max-w-[120px]"
                    style={{ color: activeSector.color }}
                  >
                    {activeSector.shortName}
                  </span>
                  <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white block leading-tight font-mono">
                    {activeSector.percentage}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block font-mono">
                    {activeSector.count} reqs • ₱{activeSector.amount.toLocaleString()}
                  </span>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">
                    Total System Volume
                  </span>
                  <span className="text-xl font-black text-slate-900 dark:text-white block font-mono">
                    {analytics?.summary.totalRequests ?? stats.totalClearances} Reqs
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block font-mono">
                    ₱{(analytics?.summary.realizedRevenue ?? stats.totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2 })} Earned
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Legend Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100 dark:border-blue-900/40">
          {sectors.map((sec, idx) => {
            const isHovered = hoveredSectorIndex === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredSectorIndex(idx)}
                onMouseLeave={() => setHoveredSectorIndex(null)}
                className={`flex items-center justify-between p-2 rounded-xl transition cursor-pointer border ${
                  isHovered
                    ? 'bg-slate-100 dark:bg-[#0E1B33] border-slate-300 dark:border-blue-800 scale-102 shadow-xs'
                    : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-[#080E1A]'
                }`}
                title={sec.desc}
              >
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 truncate max-w-[110px] font-medium">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: sec.color }}
                  />
                  <span className="truncate">{sec.shortName}</span>
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0 ml-1">
                  {sec.percentage}%
                </span>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
