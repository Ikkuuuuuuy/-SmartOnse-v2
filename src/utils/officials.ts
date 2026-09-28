export const BARANGAY_ROLES = [
  'Barangay Chairman',
  'Barangay Treasurer',
  'Barangay Secretary',
  'Barangay Kagawad',
] as const;

export const SK_ROLES = [
  'SK Chairperson',
  'SK Treasurer',
  'SK Secretary',
  'SK Kagawad',
] as const;

export type BarangayRole = typeof BARANGAY_ROLES[number];
export type SKRole = typeof SK_ROLES[number];
export type OfficialCategory = 'barangay' | 'sk';

export function getOfficialImageUrl(imagePath: string | null | undefined, name = 'Official'): string {
  if (!imagePath) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=9C2007&color=fff`;
  }

  const path = imagePath.replace(/^\//, '');

  if (path.startsWith('images/')) {
    return `/${path}`;
  }

  if (path.startsWith('storage/')) {
    return `/${path}`;
  }

  return `/storage/${path}`;
}

export function isSkOfficial(official: {
  category?: string;
  type?: string;
  role?: string;
  position?: string;
}): boolean {
  if (official.category) {
    return official.category === 'sk';
  }
  if (official.type) {
    return official.type === 'sk';
  }
  const text = `${official.role || ''} ${official.position || ''}`.toLowerCase();
  return /\bsk\b/i.test(text) || text.includes('kabataan') || text.includes('youth');
}

/**
 * Returns the hierarchy rank for official roles:
 * 1 = Chairman / Chairperson / Punong Barangay
 * 2 = Treasurer
 * 3 = Secretary
 * 4 = Kagawad / Councilor
 * 5 = Others / Support Staff
 */
export function getOfficialRank(position: string = ''): number {
  const p = position.toLowerCase().trim();

  // 1. Chairman / Chairperson / Punong Barangay / Captain
  if (p.includes('chair') || p.includes('punong') || p.includes('captain')) {
    return 1;
  }

  // 2. Treasurer / Ingat-Yaman
  if (p.includes('treasur') || p.includes('ingat-yaman')) {
    return 2;
  }

  // 3. Secretary / Kalihim
  if (p.includes('secretar') || p.includes('kalihim')) {
    return 3;
  }

  // 4. Kagawad / Councilor / Council Member
  if (p.includes('kagawad') || p.includes('council')) {
    return 4;
  }

  return 5;
}

/**
 * Sorts officials strictly according to civic hierarchy:
 * Chairman -> Treasurer -> Secretary -> Kagawads -> Others
 */
export function sortOfficialsByHierarchy<
  T extends { position?: string; name?: string; order?: number }
>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const rankA = getOfficialRank(a.position || '');
    const rankB = getOfficialRank(b.position || '');

    if (rankA !== rankB) {
      return rankA - rankB;
    }

    if (a.order !== undefined && b.order !== undefined && a.order !== b.order) {
      return a.order - b.order;
    }

    return (a.name || '').localeCompare(b.name || '');
  });
}
