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
  Calendar
} from 'lucide-react';

export interface DashboardChartsProps {
  selectedPeriod: string;
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
  color: string;
  desc: string;
}

// Period Data Sets
const PERIOD_DATA: Record<string, TrendPoint[]> = {
  'FY 2026 (August 2026)': [
    { label: 'Mar', clearances: 95, revenue: 142500, budget: 1850000, growth: '+12%' },
    { label: 'Apr', clearances: 140, revenue: 210000, budget: 2100000, growth: '+47%' },
    { label: 'May', clearances: 175, revenue: 262500, budget: 2450000, growth: '+25%' },
    { label: 'Jun', clearances: 210, revenue: 315000, budget: 2800000, growth: '+20%' },
    { label: 'Jul', clearances: 235, revenue: 352500, budget: 3100000, growth: '+12%' },
    { label: 'Aug', clearances: 275, revenue: 412500, budget: 2550000, growth: '+17%' },
  ],
  'FY 2026 (Q3 July-Sept)': [
    { label: 'Jul (Actual)', clearances: 235, revenue: 352500, budget: 3100000, growth: '+12%' },
    { label: 'Aug (Current)', clearances: 275, revenue: 412500, budget: 2550000, growth: '+17%' },
    { label: 'Sep (Forecast)', clearances: 320, revenue: 480000, budget: 2900000, growth: '+16%' },
  ],
  'FY 2026 Annual': [
    { label: 'Jan', clearances: 80, revenue: 120000, budget: 1400000, growth: 'Base' },
    { label: 'Feb', clearances: 85, revenue: 127500, budget: 1600000, growth: '+6%' },
    { label: 'Mar', clearances: 95, revenue: 142500, budget: 1850000, growth: '+12%' },
    { label: 'Apr', clearances: 140, revenue: 210000, budget: 2100000, growth: '+47%' },
    { label: 'May', clearances: 175, revenue: 262500, budget: 2450000, growth: '+25%' },
    { label: 'Jun', clearances: 210, revenue: 315000, budget: 2800000, growth: '+20%' },
    { label: 'Jul', clearances: 235, revenue: 352500, budget: 3100000, growth: '+12%' },
    { label: 'Aug', clearances: 275, revenue: 412500, budget: 2550000, growth: '+17%' },
    { label: 'Sep', clearances: 310, revenue: 465000, budget: 2800000, growth: '+13%' },
    { label: 'Oct', clearances: 340, revenue: 510000, budget: 3000000, growth: '+10%' },
    { label: 'Nov', clearances: 380, revenue: 570000, budget: 3200000, growth: '+12%' },
    { label: 'Dec', clearances: 420, revenue: 630000, budget: 3500000, growth: '+11%' },
  ],
};

const SECTORS: SectorItem[] = [
  { name: 'General Services & Operations', shortName: 'General Ops', percentage: 38, amount: 5643000, color: '#DC2626', desc: 'Barangay Hall operations, staff salaries, utility overhead, maintenance' },
  { name: 'Health & Medical Assistance', shortName: 'Health & Med', percentage: 24, amount: 3564000, color: '#10B981', desc: 'Health center medicines, maternal care, senior citizen vitamins, dental' },
  { name: 'Peace & Order / Tanod Security', shortName: 'Peace & Order', percentage: 18, amount: 2673000, color: '#8B5CF6', desc: 'Tanod honorarium, CCTV maintenance, night patrols, lupong tagapamayapa' },
  { name: 'Youth, Sports & SK Programs', shortName: 'Youth & SK', percentage: 12, amount: 1782000, color: '#F59E0B', desc: '10% mandatory SK budget, student scholarships, youth sports league' },
  { name: 'DRRM & Climate Sanitation', shortName: 'DRRM & Climate', percentage: 8, amount: 1188000, color: '#3B82F6', desc: 'BDRRMF 5% calamity reserve, anti-dengue misting, canal declogging' },
];

export default function DashboardCharts({ selectedPeriod }: DashboardChartsProps) {
  // Metric toggle for Left Chart: 'clearances' or 'revenue'
  const [activeMetric, setActiveMetric] = useState<'clearances' | 'revenue'>('clearances');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Sector hover state for Right Donut Chart
  const [hoveredSectorIndex, setHoveredSectorIndex] = useState<number | null>(null);

  // Active dataset
  const points = PERIOD_DATA[selectedPeriod] || PERIOD_DATA['FY 2026 (August 2026)'];

  // Calculate totals and statistics
  const stats = useMemo(() => {
    const totalClearances = points.reduce((sum, p) => sum + p.clearances, 0);
    const totalRevenue = points.reduce((sum, p) => sum + p.revenue, 0);
    const avgClearances = Math.round(totalClearances / points.length);
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
  const rawMax = Math.max(...values, 10);
  // Round max value up to nice number for cleaner grid
  const maxValue = activeMetric === 'clearances' ? Math.ceil(rawMax / 50) * 50 : Math.ceil(rawMax / 100000) * 100000;

  // Calculate pixel coordinates for each point
  const coords = useMemo(() => {
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
  let cumulativeOffset = 0;
  const donutSlices = SECTORS.map((sec, idx) => {
    const strokeDash = (sec.percentage / 100) * circumference;
    const offset = cumulativeOffset;
    cumulativeOffset += strokeDash;
    return {
      ...sec,
      index: idx,
      strokeDash,
      offset,
    };
  });

  const activeSector = hoveredSectorIndex !== null ? SECTORS[hoveredSectorIndex] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* 1. LEFT CHART: Velocity & Growth Trend (Interactive) */}
      <div className="lg:col-span-7 bg-white dark:bg-[#0B1528] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-blue-900/40 shadow-xs space-y-5 flex flex-col justify-between transition-all">
        
        {/* Top Header with Metric Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#9C2007] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/50 px-2 py-0.5 rounded-full">
                Interactive Velocity
              </span>
              <span className="text-[10px] font-bold text-slate-400">&bull;</span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                {selectedPeriod}
              </span>
            </div>
            <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#9C2007] dark:text-rose-400" />
              <span>Barangay Clearance &amp; Revenue Velocity</span>
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">
              Hover over data points to inspect monthly clearance volume and fee collections.
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

        {/* Dynamic SVG Area & Line Chart */}
        <div className="relative h-60 w-full select-none">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="maroonGradientDynamic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9C2007" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#9C2007" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Lines & Y-Axis Labels */}
            {gridLevels.map((lvl, idx) => {
              const y = padding.top + usableHeight - lvl * usableHeight;
              const labelVal = minValue + lvl * (maxValue - minValue);
              const formatted =
                activeMetric === 'clearances'
                  ? Math.round(labelVal).toString()
                  : `₱${(labelVal / 1000).toFixed(0)}k`;

              return (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-100 dark:text-blue-950/70"
                    strokeWidth="1"
                    strokeDasharray={idx === 0 ? '0' : '4 4'}
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 3.5}
                    fontSize="9"
                    fontWeight="bold"
                    fill="currentColor"
                    className="text-slate-400 dark:text-slate-500 font-mono"
                    textAnchor="end"
                  >
                    {formatted}
                  </text>
                </g>
              );
            })}

            {/* Gradient Filled Area */}
            <path
              d={areaPath}
              fill="url(#maroonGradientDynamic)"
              className="transition-all duration-300 ease-out"
            />

            {/* Curved Trend Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#DC2626"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300 ease-out drop-shadow-xs"
            />

            {/* Active Vertical Crosshair line when hovered */}
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
                  <span>Clearances Issued:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">
                    {coords[hoveredPointIndex].point.clearances.toLocaleString()} docs
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
              Period Total
            </span>
            <span className="font-black text-slate-900 dark:text-white text-sm">
              {activeMetric === 'clearances'
                ? `${stats.totalClearances.toLocaleString()} Clearances`
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
              Peak Month
            </span>
            <span className="font-black text-[#9C2007] dark:text-rose-400 text-sm">
              {stats.peakMonth} ({stats.peakValue} docs)
            </span>
          </div>
        </div>
      </div>

      {/* 2. RIGHT CHART: Service & Expenditure Breakdown (Interactive Donut) */}
      <div className="lg:col-span-5 bg-white dark:bg-[#0B1528] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-blue-900/40 shadow-xs space-y-4 flex flex-col justify-between transition-all">
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/50 px-2 py-0.5 rounded-full">
              Full Disclosure Form 83
            </span>
            <span className="text-[10px] font-bold text-slate-400">&bull;</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">COA Certified</span>
          </div>
          <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
            <PieChart className="w-4 h-4 text-amber-500" />
            <span>Service &amp; Expenditure Breakdown</span>
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">
            Hover over donut slices or sectors below to inspect allocated fund distribution.
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
                    ₱{(activeSector.amount / 1000000).toFixed(2)}M
                  </span>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">
                    Total IRA Ops
                  </span>
                  <span className="text-xl font-black text-slate-900 dark:text-white block font-mono">
                    100%
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block font-mono">
                    ₱14.85M Budget
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Legend Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100 dark:border-blue-900/40">
          {SECTORS.map((sec, idx) => {
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
