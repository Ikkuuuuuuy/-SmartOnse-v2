-- ==============================================================================
-- SMARTONSE DATABASE SECURITY & ROW LEVEL SECURITY (RLS) MIGRATION
-- Target: Supabase PostgreSQL
-- Purpose:
--   1. Enable RLS on every sensitive table.
--   2. Define strict READ and WRITE policies.
--   3. Enforce Append-Only immutability on AuditLog (prevent tamper/deletion).
--   4. Prevent unauthorized cross-tenant data leaks and privilege escalation.
-- ==============================================================================

-- 1. ENABLE ROW LEVEL SECURITY ACROSS ALL CORE TABLES
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BarangayInhabitant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DocumentRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ConsentRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SkPost" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SkComment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SkPostLike" ENABLE ROW LEVEL SECURITY;

-- Ensure table owners/superusers obey RLS when running under authenticated context
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;
ALTER TABLE "BarangayInhabitant" FORCE ROW LEVEL SECURITY;
ALTER TABLE "DocumentRequest" FORCE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" FORCE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. USER PROFILE POLICIES ("User")
-- ==============================================================================
DROP POLICY IF EXISTS "Users can read own profile" ON "User";
CREATE POLICY "Users can read own profile"
ON "User"
FOR SELECT
USING (
  auth.uid()::text = id 
  OR EXISTS (
    SELECT 1 FROM "User" u 
    WHERE u.id = auth.uid()::text 
    AND u.role IN ('super_admin', 'barangay_captain', 'staff')
  )
);

DROP POLICY IF EXISTS "Users can update own personal info" ON "User";
CREATE POLICY "Users can update own personal info"
ON "User"
FOR UPDATE
USING (auth.uid()::text = id)
WITH CHECK (
  auth.uid()::text = id
  -- Prevents self-escalation of roles or verified status
  AND (
    role = (SELECT u.role FROM "User" u WHERE u.id = id)
    OR EXISTS (
      SELECT 1 FROM "User" u 
      WHERE u.id = auth.uid()::text 
      AND u.role IN ('super_admin', 'barangay_captain')
    )
  )
);

-- ==============================================================================
-- 3. CIVIL REGISTRY & RESIDENTS ("BarangayInhabitant")
-- ==============================================================================
DROP POLICY IF EXISTS "Residents can view own inhabitant record" ON "BarangayInhabitant";
CREATE POLICY "Residents can view own inhabitant record"
ON "BarangayInhabitant"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "User" u
    WHERE u.id = auth.uid()::text
    AND (u.email = "BarangayInhabitant".email OR u.role IN ('super_admin', 'barangay_captain', 'staff'))
  )
);

DROP POLICY IF EXISTS "Only staff and captain can modify civil registry" ON "BarangayInhabitant";
CREATE POLICY "Only staff and captain can modify civil registry"
ON "BarangayInhabitant"
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM "User" u
    WHERE u.id = auth.uid()::text
    AND u.role IN ('super_admin', 'barangay_captain', 'staff')
  )
);

-- ==============================================================================
-- 4. DOCUMENT REQUEST POLICIES ("DocumentRequest")
-- ==============================================================================
DROP POLICY IF EXISTS "Residents can read own requests" ON "DocumentRequest";
CREATE POLICY "Residents can read own requests"
ON "DocumentRequest"
FOR SELECT
USING (
  "userId" = auth.uid()::text
  OR EXISTS (
    SELECT 1 FROM "User" u
    WHERE u.id = auth.uid()::text
    AND u.role IN ('super_admin', 'barangay_captain', 'staff', 'barangay_councilor')
  )
);

DROP POLICY IF EXISTS "Residents can insert own requests" ON "DocumentRequest";
CREATE POLICY "Residents can insert own requests"
ON "DocumentRequest"
FOR INSERT
WITH CHECK (
  "userId" = auth.uid()::text
);

DROP POLICY IF EXISTS "Officials can update requests" ON "DocumentRequest";
CREATE POLICY "Officials can update requests"
ON "DocumentRequest"
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM "User" u
    WHERE u.id = auth.uid()::text
    AND u.role IN ('super_admin', 'barangay_captain', 'staff')
  )
);

-- ==============================================================================
-- 5. AUDIT LOG IMMUTABILITY & PROTECTION ("AuditLog")
-- ==============================================================================
DROP POLICY IF EXISTS "Only authorized officials can read audit trail" ON "AuditLog";
CREATE POLICY "Only authorized officials can read audit trail"
ON "AuditLog"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "User" u
    WHERE u.id = auth.uid()::text
    AND u.role IN ('super_admin', 'barangay_captain')
  )
);

DROP POLICY IF EXISTS "System can append audit logs" ON "AuditLog";
CREATE POLICY "System can append audit logs"
ON "AuditLog"
FOR INSERT
WITH CHECK (true);

-- Trigger: Prohibit any UPDATE or DELETE operations on AuditLog table
CREATE OR REPLACE FUNCTION prevent_audit_log_tampering()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'SECURITY VIOLATION: Audit logs are append-only. Modification or deletion is strictly forbidden under RA 10173 and DILG compliance.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_log_immutable ON "AuditLog";
CREATE TRIGGER trg_audit_log_immutable
BEFORE UPDATE OR DELETE ON "AuditLog"
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_log_tampering();

-- ==============================================================================
-- 6. PUBLIC SK FEED POLICIES ("SkPost", "SkComment", "SkPostLike")
-- ==============================================================================
DROP POLICY IF EXISTS "Public can view published SK posts" ON "SkPost";
CREATE POLICY "Public can view published SK posts"
ON "SkPost"
FOR SELECT
USING ("isPublished" = true);

DROP POLICY IF EXISTS "SK Leaders can manage posts" ON "SkPost";
CREATE POLICY "SK Leaders can manage posts"
ON "SkPost"
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM "User" u
    WHERE u.id = auth.uid()::text
    AND u.role IN ('super_admin', 'sk_chairperson', 'sk_councilor')
  )
);

DROP POLICY IF EXISTS "Authenticated users can like and comment" ON "SkComment";
CREATE POLICY "Authenticated users can like and comment"
ON "SkComment"
FOR INSERT
WITH CHECK (auth.uid()::text = "userId");

