import prisma from '@/lib/prisma';

/**
 * Calculates the official pickup deadline by adding business days (Mon-Fri)
 * Barangay Hall Office Hours: Monday to Friday, 8:00 AM to 5:00 PM.
 * Skips Saturdays and Sundays.
 */
export function calculatePickupDeadline(startDate: Date = new Date(), businessDays: number = 5): Date {
  const current = new Date(startDate);
  let addedDays = 0;

  while (addedDays < businessDays) {
    current.setDate(current.getDate() + 1);
    const dayOfWeek = current.getDay();
    // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays++;
    }
  }

  // Set to 5:00 PM (End of barangay office hours)
  current.setHours(17, 0, 0, 0);
  return current;
}

/**
 * Human-readable format for pickup deadline and office hours advisory
 */
export function formatPickupDeadline(deadline: Date | string): string {
  const dateObj = typeof deadline === 'string' ? new Date(deadline) : deadline;
  return new Intl.DateTimeFormat('en-PH', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj);
}

/**
 * Generates strictly sequential tracking numbers for Barangay Onse:
 * Format: ONSE-YYYY-XXXX (e.g. ONSE-2026-0829, ONSE-2026-0830, ONSE-2026-0831)
 */
export async function getNextSequentialTrackingNumber(count: number = 1): Promise<string[]> {
  const currentYear = new Date().getFullYear();
  const prefix = `ONSE-${currentYear}-`;

  // Fetch all existing tracking numbers for current year
  const existing = await prisma.documentRequest.findMany({
    where: {
      trackingNumber: {
        startsWith: prefix,
      },
    },
    select: {
      trackingNumber: true,
    },
  });

  // Base starting sequence (continuation from seed benchmark 828)
  let maxSeq = 828;

  for (const item of existing) {
    const parts = item.trackingNumber.split('-');
    if (parts.length === 3 && parts[1] === String(currentYear)) {
      const num = parseInt(parts[2], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }

  const generated: string[] = [];
  for (let i = 1; i <= count; i++) {
    const nextNum = maxSeq + i;
    const suffix = String(nextNum).padStart(4, '0');
    generated.push(`${prefix}${suffix}`);
  }

  return generated;
}

