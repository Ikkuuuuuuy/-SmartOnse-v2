/**
 * SmartOnse 1:1 Role-Based Access Control (RBAC) Module Permissions
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  BARANGAY_CAPTAIN: 'barangay_captain',
  BARANGAY_COUNCILOR: 'barangay_councilor',
  SK_CHAIRPERSON: 'sk_chairperson',
  SK_COUNCILOR: 'sk_councilor',
  STAFF: 'staff',
  RESIDENT: 'resident',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES] | string;

/**
 * Standardize any incoming role key to internal canonical role
 */
export function normalizeRole(role?: string): string {
  if (!role) return '';
  const r = role.toLowerCase().trim();
  if (r === 'admin' || r === 'super_admin' || r === 'superadmin') return ROLES.SUPER_ADMIN;
  if (r === 'captain' || r === 'barangay_captain') return ROLES.BARANGAY_CAPTAIN;
  if (r === 'kagawad' || r === 'barangay_councilor' || r === 'councilor') return ROLES.BARANGAY_COUNCILOR;
  if (r === 'sk' || r === 'sk_chairperson' || r === 'sk_chair') return ROLES.SK_CHAIRPERSON;
  if (r === 'sk_kagawad' || r === 'sk_councilor') return ROLES.SK_COUNCILOR;
  if (r === 'staff' || r === 'desk_staff' || r === 'records') return ROLES.STAFF;
  if (r === 'resident' || r === 'citizen' || r === 'user') return ROLES.RESIDENT;
  return r;
}

export const MODULE_PERMISSIONS: Record<string, string[]> = {
  // Full System Administration
  'audit-logs': [ROLES.SUPER_ADMIN, ROLES.BARANGAY_CAPTAIN],
  'site-settings': [ROLES.SUPER_ADMIN, ROLES.BARANGAY_CAPTAIN],
  'user-management': [ROLES.SUPER_ADMIN, ROLES.BARANGAY_CAPTAIN],
  'document-types': [ROLES.SUPER_ADMIN, ROLES.BARANGAY_CAPTAIN, ROLES.BARANGAY_COUNCILOR],

  // Operational & Council Administration
  'dashboard': [ROLES.SUPER_ADMIN, ROLES.BARANGAY_CAPTAIN, ROLES.BARANGAY_COUNCILOR, ROLES.SK_CHAIRPERSON, ROLES.SK_COUNCILOR, ROLES.STAFF],
  'requests': [ROLES.SUPER_ADMIN, ROLES.BARANGAY_CAPTAIN, ROLES.BARANGAY_COUNCILOR, ROLES.SK_CHAIRPERSON, ROLES.STAFF],
  'residents': [ROLES.SUPER_ADMIN, ROLES.BARANGAY_CAPTAIN, ROLES.BARANGAY_COUNCILOR, ROLES.SK_CHAIRPERSON, ROLES.STAFF],
  'officials': [ROLES.SUPER_ADMIN, ROLES.BARANGAY_CAPTAIN, ROLES.BARANGAY_COUNCILOR, ROLES.SK_CHAIRPERSON, ROLES.SK_COUNCILOR],
  'events': [ROLES.SUPER_ADMIN, ROLES.BARANGAY_CAPTAIN, ROLES.BARANGAY_COUNCILOR, ROLES.SK_CHAIRPERSON, ROLES.SK_COUNCILOR, ROLES.STAFF],
  'transparency': [ROLES.SUPER_ADMIN, ROLES.BARANGAY_CAPTAIN, ROLES.BARANGAY_COUNCILOR, ROLES.SK_CHAIRPERSON, ROLES.SK_COUNCILOR],
  'services': [ROLES.SUPER_ADMIN, ROLES.BARANGAY_CAPTAIN, ROLES.BARANGAY_COUNCILOR, ROLES.SK_CHAIRPERSON, ROLES.STAFF],
};

/**
 * Check if a role can access a specific admin module
 */
export function canAccessModule(role: string | undefined, moduleKey: string): boolean {
  if (!role) return false;
  const canonical = normalizeRole(role);
  if (canonical === ROLES.SUPER_ADMIN) return true;
  const allowed = MODULE_PERMISSIONS[moduleKey];
  if (!allowed) return false;
  return allowed.includes(canonical);
}

/**
 * Checks if a user is an administrative/staff user allowed in /admin
 */
export function isAdminUser(role: string | undefined): boolean {
  if (!role) return false;
  const canonical = normalizeRole(role);
  return (
    canonical === ROLES.SUPER_ADMIN ||
    canonical === ROLES.BARANGAY_CAPTAIN ||
    canonical === ROLES.BARANGAY_COUNCILOR ||
    canonical === ROLES.SK_CHAIRPERSON ||
    canonical === ROLES.SK_COUNCILOR ||
    canonical === ROLES.STAFF
  );
}

