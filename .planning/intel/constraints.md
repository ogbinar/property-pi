# Constraints Index

Synthesized from SPECs and ADRs in CLASSIFICATIONS_DIR

---

## Constraint: Tech Stack

**Source:** `/projects/property-pi/SPEC.md` §4, `/projects/property-pi/ARCHITECTURE-DECISION.md` §3  
**Type:** api-contract

### Content
- **Frontend:** Next.js 16 with Tailwind CSS 4.x
- **Backend:** PocketBase (Go/SQLite) + FastAPI (Python)
- **Database:** PocketBase SQLite (embedded)
- **Auth:** PocketBase email/password only
- **Deployment:** PocketBase + FastAPI on fly.io/Railway, Next.js on Vercel

---

## Constraint: Auth Approach

**Source:** `/projects/property-pi/ARCHITECTURE-DECISION.md` §2, §6  
**Type:** protocol

### Content
- PocketBase email/password auth is the **single** auth approach
- Landlord-only authentication (single PocketBase user account)
- Tenant portal uses shared link tokens — **NOT** PocketBase auth accounts
- All landlord collections require `@request.auth.id != ''` authentication rules
- No NextAuth, no FastAPI token auth, no self-registration

---

## Constraint: Data Layer Architecture

**Source:** `/projects/property-pi/ARCHITECTURE-DECISION.md` §3, §4  
**Type:** schema

### Content
- **PocketBase handles:** Auth, database (SQLite), file storage, real-time
- **FastAPI handles:** Reporting aggregation, file processing, automated tasks (cron) — **NOT CRUD, NOT auth**
- **Next.js:** Frontend-only with zero server-side logic (no Prisma, no NextAuth)
- **FastAPI communicates** with PocketBase via PocketBase Admin API — NOT direct DB access, NOT Prisma, NOT SQLAlchemy
- **7 PocketBase collections** map to 9 Prisma models (RentAdjustment and ContactLog become JSON fields)

---

## Constraint: File Storage

**Source:** `/projects/property-pi/ARCHITECTURE-DECISION.md` §4, §8  
**Type:** schema

### Content
- Lease documents and expense receipts stored via PocketBase file fields
- Files stored in PocketBase's `uploads/` directory
- Replaces Prisma `documents: String[]` and `receiptUrl: String?`
- File upload uses FormData (not JSON)
- Files accessible via PocketBase CDN URL

---

## Constraint: Tenant Portal Access

**Source:** `/projects/property-pi/ARCHITECTURE-DECISION.md` §2, §3  
**Type:** protocol

### Content
- Tenant access via shared link with unique token: `/tenant/portal?token={leaseId}:{token}`
- No tenant accounts in PocketBase
- Token validated client-side against `leases` collection
- Tenant portal bypasses PocketBase auth rules
- Landlord can generate/regenerate tokens (invalidating old links)

---

## Constraint: UI Preservation

**Source:** `/projects/property-pi/ARCHITECTURE-DECISION.md` §1  
**Type:** api-contract

### Content
- Preserve existing page structure and component hierarchy
- Only swap data layer (Prisma → PocketBase SDK)
- Existing Next.js UI component hierarchy remains valid
- ROADMAP.md phase structure (Phase 1–5) remains valid
- Requirements (REQ-01 through REQ-15) remain valid

---

## Constraint: Non-Functional Requirements

**Source:** `/projects/property-pi/SPEC.md` §6, `.planning/REQUIREMENTS.md`  
**Type:** nfr

### Content
- **Performance:** Dashboard loads < 5s on 4G connection
- **Security:** All landlord operations require authentication; tenant portal uses cryptographically random tokens
- **No hardcoded secrets** in codebase
- **Zero TypeScript errors**, zero build errors
- **API proxy adds < 100ms overhead**

---

*Generated: 2026-04-22 via /gsd-doc-synthesizer (MERGE mode)*  
*Total constraints: 7*
