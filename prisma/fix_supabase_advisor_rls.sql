-- ==============================================================================
-- SMARTONSE: COMPLETE SUPABASE ADVISOR FIX (ENABLE RLS ON ALL PUBLIC TABLES)
-- Copy and run this script in Supabase Dashboard -> SQL Editor
-- This will resolve all 20 "RLS Disabled in Public" security warnings.
-- ==============================================================================

-- 1. Enable RLS on every public table in the database
ALTER TABLE IF EXISTS "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "BarangayInhabitant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "DocumentRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "DocumentType" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "BarangayOfficial" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Service" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "TransparencyDocument" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "BarangayStatistic" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "PasswordResetToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "ConsentRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "SkPost" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "SkProgram" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "SkPostMedia" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "SkPostLike" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "SkComment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "VerificationSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "RateLimitLog" ENABLE ROW LEVEL SECURITY;

-- 2. Allow Public Read Access for Public Barangay Content
-- (Services, Events, Officials, Document Types, Transparency, Published SK Posts)
CREATE POLICY "Public can view document types" ON "DocumentType" FOR SELECT USING (true);
CREATE POLICY "Public can view services" ON "Service" FOR SELECT USING (true);
CREATE POLICY "Public can view events" ON "Event" FOR SELECT USING (true);
CREATE POLICY "Public can view officials" ON "BarangayOfficial" FOR SELECT USING (true);
CREATE POLICY "Public can view transparency docs" ON "TransparencyDocument" FOR SELECT USING (true);
CREATE POLICY "Public can view statistics" ON "BarangayStatistic" FOR SELECT USING (true);
CREATE POLICY "Public can view published sk posts" ON "SkPost" FOR SELECT USING ("isPublished" = true);
CREATE POLICY "Public can view sk programs" ON "SkProgram" FOR SELECT USING (true);
CREATE POLICY "Public can view sk media" ON "SkPostMedia" FOR SELECT USING (true);

-- 3. Restrict Sensitive Citizen Tables
-- User: Only view own profile or officials
CREATE POLICY "Users can view own profile" ON "User" FOR SELECT USING (auth.uid()::text = id);

-- DocumentRequest: Only view own requests
CREATE POLICY "Residents can view own document requests" ON "DocumentRequest" FOR SELECT USING (auth.uid()::text = "userId");

-- BarangayInhabitant: Only officials or verified resident matching email
CREATE POLICY "Residents view own inhabitant entry" ON "BarangayInhabitant" FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM "User" u
    WHERE u.id = auth.uid()::text AND (u.email = "BarangayInhabitant".email OR u.role IN ('super_admin', 'barangay_captain', 'staff'))
  )
);

-- Appointments: Only view own appointments
CREATE POLICY "Residents view own appointments" ON "Appointment" FOR SELECT USING (auth.uid()::text = "userId");

-- AuditLog: Strictly viewable only by Admins
CREATE POLICY "Admins can view audit logs" ON "AuditLog" FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM "User" u
    WHERE u.id = auth.uid()::text AND u.role IN ('super_admin', 'barangay_captain')
  )
);

-- 4. Audit Log Immutability (Tamper-Proof Trigger)
CREATE OR REPLACE FUNCTION prevent_audit_log_tampering()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'SECURITY VIOLATION: Audit logs are append-only. Modification or deletion is forbidden.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_log_immutable ON "AuditLog";
CREATE TRIGGER trg_audit_log_immutable
BEFORE UPDATE OR DELETE ON "AuditLog"
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_log_tampering();
