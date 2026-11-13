import prisma from '@/lib/prisma';

export type NotificationType = 'request' | 'system' | 'event' | 'alert' | 'transparency';
export type NotificationTargetRole = 'all' | 'admin' | 'staff' | 'kagawad' | 'sk' | 'resident';

export async function createNotification(input: {
  title: string;
  description: string;
  type?: NotificationType;
  targetRole?: NotificationTargetRole;
  targetUserId?: string | null;
  href?: string;
}) {
  try {
    return await prisma.notification.create({
      data: {
        title: input.title,
        description: input.description,
        type: input.type || 'request',
        targetRole: input.targetRole || 'resident',
        targetUserId: input.targetUserId ?? null,
        href: input.href || null,
      },
    });
  } catch (err) {
    console.error('[Notification Create Error]:', err);
    return null;
  }
}

export function getStatusNotificationCopy(params: {
  status: string;
  trackingNumber: string;
  documentType: string;
  remarks?: string | null;
}): { title: string; description: string; type: NotificationType } {
  const { status, trackingNumber, documentType, remarks } = params;
  const remarkSuffix = remarks ? ` Note: ${remarks}` : '';

  switch (status) {
    case 'PROCESSING':
      return {
        title: `Request In Processing (#${trackingNumber})`,
        description: `Your ${documentType} is now being reviewed and processed by Barangay Onse staff.${remarkSuffix}`,
        type: 'request',
      };
    case 'READY_FOR_PICKUP':
      return {
        title: `Ready for Pickup (#${trackingNumber})`,
        description: `Your ${documentType} is printed and sealed! Claim it at Window 2 (Mon–Fri, 8:00 AM–5:00 PM) within 5 working days.${remarkSuffix}`,
        type: 'request',
      };
    case 'COMPLETED':
      return {
        title: `Certificate Released (#${trackingNumber})`,
        description: `Your ${documentType} has been officially claimed and marked as Completed.${remarkSuffix}`,
        type: 'system',
      };
    case 'REJECTED':
      return {
        title: `Application Rejected (#${trackingNumber})`,
        description: `Your ${documentType} request was rejected.${remarks ? ` Reason: ${remarks}` : ' Please check your tracking details.'}`,
        type: 'alert',
      };
    default:
      return {
        title: `Application Pending (#${trackingNumber})`,
        description: `Your ${documentType} request is in the queue for desk review.${remarkSuffix}`,
        type: 'request',
      };
  }
}

export function formatRelativePhTimestamp(dateInput: Date | string): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}
