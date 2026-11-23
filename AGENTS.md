# SmartOnse v2 — Project Architecture & Coding Standards

## Tech Stack
- **Framework**: Next.js 15 (App Router, `src/app`), React 19, TypeScript
- **Database & ORM**: PostgreSQL with Prisma ORM (`@prisma/client` ^6.4.1, [schema.prisma](prisma/schema.prisma))
- **Authentication & Security**: Custom JWT via `jose`, password hashing via `bcryptjs`, MFA OTP support, Google OAuth, and RBAC (`super_admin`, `barangay_captain`, `barangay_councilor`, `sk_chairperson`, `sk_councilor`, `staff`, `resident`)
- **Integrations**: Firebase (`firebase`), Nodemailer (`nodemailer`), Client/Server OCR (`tesseract.js`), QR Code generation (`qrcode`)
- **Styling & UI**: Tailwind CSS 3.4, Framer Motion, Lucide React icons

## Core Conventions
1. **Database & Prisma**:
   - Always use the singleton Prisma client instance from `src/lib/prisma.ts` (or equivalent project helper) to avoid connection exhaustion.
   - Wrap sensitive state mutations (user verification, RBI inhabitant updates, document request status transitions, role changes) with an `AuditLog` entry.
   - Respect Philippine Data Privacy Act (RA 10173) compliance via `ConsentRecord` and strict PII handling.
2. **Authentication & Authorization**:
   - Validate JWT sessions (`jose`) and check role permissions before returning or mutating protected data in `src/app/api/**`.
   - Never expose password hashes, `mfaOtp`, or raw reset tokens in API responses.
3. **Next.js 15 App Router Best Practices**:
   - Await dynamic `params` and `searchParams` in Next.js 15 pages, layouts, and route handlers.
   - Keep Server Components fast and avoid waterfall queries (`Promise.all` independent Prisma queries).
