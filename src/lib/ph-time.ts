export const PH_TIMEZONE = 'Asia/Manila';

export const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export interface PhDateParts {
  year: number;
  month: number; // 1-12
  day: number;   // 1-31
  hour: number;  // 0-23
  minute: number;
  second: number;
  quarter: number; // 1-4
  dateStr: string; // YYYY-MM-DD
  monthStr: string; // YYYY-MM
  monthName: string;
  monthShort: string;
}

/**
 * Returns the exact current (or given) date & time components in Philippine Standard Time (Asia/Manila, UTC+8).
 */
export function getPhNowParts(date: Date = new Date()): PhDateParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: PH_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || '0';

  const year = parseInt(get('year'), 10);
  const month = parseInt(get('month'), 10);
  const day = parseInt(get('day'), 10);
  let hour = parseInt(get('hour'), 10);
  if (hour === 24) hour = 0;
  const minute = parseInt(get('minute'), 10);
  const second = parseInt(get('second'), 10);
  const quarter = Math.floor((month - 1) / 3) + 1;

  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    quarter,
    dateStr: `${year}-${mm}-${dd}`,
    monthStr: `${year}-${mm}`,
    monthName: MONTH_NAMES_FULL[month - 1] || 'January',
    monthShort: MONTH_NAMES_SHORT[month - 1] || 'Jan',
  };
}

/**
 * Start of a Philippine calendar day (00:00:00.000 +08:00).
 */
export function phDateStart(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000+08:00`);
}

/**
 * End of a Philippine calendar day (23:59:59.999 +08:00).
 */
export function phDateEnd(dateStr: string): Date {
  return new Date(`${dateStr}T23:59:59.999+08:00`);
}

/**
 * Start of a Philippine calendar month (1st day 00:00:00.000 +08:00).
 */
export function phMonthStart(year: number, month: number): Date {
  const mm = String(month).padStart(2, '0');
  return new Date(`${year}-${mm}-01T00:00:00.000+08:00`);
}

/**
 * End of a Philippine calendar month (last day 23:59:59.999 +08:00).
 */
export function phMonthEnd(year: number, month: number): Date {
  const mm = String(month).padStart(2, '0');
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const dd = String(lastDay).padStart(2, '0');
  return new Date(`${year}-${mm}-${dd}T23:59:59.999+08:00`);
}

/**
 * Add/subtract days on a YYYY-MM-DD string safely and return YYYY-MM-DD.
 */
export function shiftPhDateStr(dateStr: string, deltaDays: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + deltaDays));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
}

/**
 * Formats a Date or ISO string to exact Philippine date & time (e.g. "Nov 14, 2026, 03:50 AM PHT").
 */
export function formatPhDateTime(input: Date | string): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(d.getTime())) return String(input);
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: PH_TIMEZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d);
  return `${formatted} PHT`;
}

/**
 * Formats a Date or ISO string to compact sortable Philippine date & time (e.g. "2026-11-14 03:50 AM").
 */
export function formatPhCompactDateTime(input: Date | string): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(d.getTime())) return String(input);
  const parts = getPhNowParts(d);
  const h12 = parts.hour % 12 === 0 ? 12 : parts.hour % 12;
  const ampm = parts.hour >= 12 ? 'PM' : 'AM';
  return `${parts.dateStr} ${String(h12).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')} ${ampm}`;
}

/**
 * Formats a Date or ISO string to Philippine date only (e.g. "Nov 14, 2026").
 */
export function formatPhDateOnly(input: Date | string): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(d.getTime())) return String(input);
  return new Intl.DateTimeFormat('en-US', {
    timeZone: PH_TIMEZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}
