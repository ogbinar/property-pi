# Codebase Concerns

**Analysis Date:** 2026-04-21

## Critical Issues

**Missing Error Handling in API Layer:**
- Issue: Catch blocks silently return empty arrays or null without logging errors
- Files: `src/lib/tenant-api.ts`, `src/lib/api.ts`
- Impact: Production errors are invisible, debugging becomes impossible
- Fix approach: Add structured error logging with error details to catch blocks

**No Backend API Routes Implemented:**
- Issue: Frontend calls `/api/tenants`, `/api/units`, `/api/leases` but no Next.js API routes exist
- Files: Frontend components in `src/app/(dashboard)/leases/new/page.tsx`, `src/app/(dashboard)/expenses/` call non-existent endpoints
- Impact: API calls will fail at runtime, features broken
- Fix approach: Create Next.js API routes in `src/app/api/` or implement direct PocketBase calls on server side

**Hard-coded Environment Default:**
- Issue: `src/lib/pocketbase.ts` hard-codes `http://localhost:8090` as fallback
- Files: `src/lib/pocketbase.ts`
- Impact: Misconfigured deployments will silently connect to wrong URL
- Fix approach: Throw error on missing env var in production, add runtime validation

## High Priority Concerns

**Empty Catch Blocks Swallow Errors:**
- Issue: 16+ catch blocks use bare `catch { return null/[] }` patterns
- Files: `src/lib/tenant-api.ts`, `src/app/(dashboard)/rent/page.tsx`, `src/app/(dashboard)/leases/[id]/page.tsx`
- Impact: Silent failures, poor user experience, unmaintainable code
- Fix approach: Log errors to console/error tracking, show user-friendly messages

**No Test Coverage:**
- Issue: Zero test files in `src/` directory, no jest/vitest config
- Files: N/A
- Impact: Regressions undetected, refactoring risky, no CI validation
- Fix approach: Add vitest/jest config, write unit tests for `src/lib/api.ts`, component tests

**Client-Side Filtering Instead of Server-Side:**
- Issue: Large datasets retrieved then filtered client-side (units, tenants, leases)
- Files: `src/lib/api.ts` lines 96-103, 207-215
- Impact: Performance degrades with data growth, unnecessary data transfer
- Fix approach: Use PocketBase filter queries server-side

**Status Mapping Inconsistencies:**
- Issue: Complex `getStatusMap()` function with hardcoded status translations
- Files: `src/lib/api.ts` lines 47-57
- Impact: Status values diverge between frontend/backend/PocketBase, bugs likely
- Fix approach: Centralize status definitions, use TypeScript enums

## Medium Priority Concerns

**Console Error Usage:**
- Issue: 11+ `console.error()` calls scattered throughout components
- Files: `src/components/dashboard/unit-status-grid.tsx`, `src/app/(dashboard)/tenants/[id]/page.tsx`, etc.
- Impact: Inconsistent error handling, no error tracking integration
- Fix approach: Centralize error handling, integrate error tracking service (Sentry)

**Missing Type Safety in API Calls:**
- Issue: `as unknown as LeaseRecord` patterns bypass type checking
- Files: `src/lib/api.ts` lines 314, 387, 400, 579, 701
- Impact: Runtime type errors, defeats TypeScript purpose
- Fix approach: Proper type guards or Zod validation on API responses

**No Input Validation on Forms:**
- Issue: Form submissions rely only on UI validation, no backend validation
- Files: All form components in `src/components/*/` and `src/app/(dashboard)/*/new/`
- Impact: Data integrity risks, potential for invalid data in database
- Fix approach: Add Zod schemas, validate on both client and server

**Empty Recent Activities Dashboard:**
- Issue: `getDashboard()` returns empty `recent_activities` array
- Files: `src/lib/api.ts` lines 898-900
- Impact: Dashboard incomplete, user confusion
- Fix approach: Implement activity tracking from PocketBase events

**Lease Unit/Tenant Not Expanded:**
- Issue: Dashboard expirations don't populate unit_number or tenant_name
- Files: `src/lib/api.ts` lines 898-911
- Impact: Incomplete data displayed, extra queries needed
- Fix approach: Use PocketBase expand parameter in queries

## Low Priority Concerns

**Inconsistent Field Naming:**
- Issue: Mix of snake_case (`unit_number`) and camelCase (`firstName`) across types
- Files: `src/types/pocketbase.ts`, `src/lib/api.ts`
- Impact: Cognitive overhead, potential bugs
- Fix approach: Standardize on one convention

**Unused `documents` Field in Lease:**
- Issue: `Lease.documents` always returns empty array
- Files: `src/lib/api.ts` line 326
- Impact: Feature incomplete
- Fix approach: Implement file upload/download for lease documents

**Missing Maintenance Cost Tracking:**
- Issue: `MaintenanceRequest.cost` field exists but never populated in UI
- Files: `src/lib/api.ts` line 704
- Impact: Budget tracking incomplete
- Fix approach: Add cost field to maintenance forms

**No Pagination:**
- Issue: All queries use `getFullList()` fetching entire collections
- Files: `src/lib/api.ts`
- Impact: Memory/performance issues at scale
- Fix approach: Implement PocketBase pagination with `page` and `perPage`

## Scalability Risks

**SQLite Database Limitations:**
- Issue: PocketBase uses SQLite which has known limits
- Files: N/A (architecture)
- Impact: Cannot scale beyond single instance, limited concurrent connections
- Fix approach: Plan migration path to PostgreSQL for production

**No Caching Layer:**
- Issue: Every dashboard load queries all collections fresh
- Files: `src/lib/api.ts` `getDashboard()`
- Impact: Database load increases with usage, slow page loads
- Fix approach: Add React Query/SWR for client caching, consider Redis for server

**No Rate Limiting:**
- Issue: No rate limiting on frontend or backend
- Files: N/A
- Impact: Vulnerable to DoS, potential abuse
- Fix approach: Implement rate limiting in FastAPI, add middleware in Next.js

## Documentation Gaps

**Missing TypeScript JSDoc:**
- Issue: Functions lack documentation comments
- Files: `src/lib/api.ts`, `src/lib/tenant-api.ts`
- Impact: Onboarding difficulty, incorrect usage
- Fix approach: Add JSDoc to all public functions

**No API Documentation:**
- Issue: Frontend API functions not documented for component authors
- Files: N/A
- Impact: Redundant code, inconsistent usage
- Fix approach: Document API surface in README or separate docs

## Dependencies at Risk

**Next.js 16.2.4:**
- Risk: Very recent version, potential stability issues
- Impact: Breaking changes in patch releases
- Migration plan: Pin version, monitor release notes

**React 19.2.4:**
- Risk: Very recent version, ecosystem may not be fully compatible
- Impact: Third-party library incompatibilities
- Migration plan: Test all dependencies after updates

## Security Considerations

**Tenant Portal Token Validation:**
- Risk: Tenant access token stored in plain text in `LeaseRecord.tenantAccess`
- Files: `src/types/pocketbase.ts` line 58, `src/lib/tenant-api.ts` line 16
- Current mitigation: Token comparison in `validateTenantToken()`
- Recommendations: Use hashed tokens with expiration, implement token revocation

**No Authentication on Tenant Portal:**
- Risk: Anyone with link can access tenant data
- Files: `src/app/tenant/portal/page.tsx`
- Current mitigation: Token required in URL
- Recommendations: Add token expiration, IP whitelisting option

**Environment Variable Exposure:**
- Risk: `BACKEND_SECRET_KEY` defaults to weak value in docker-compose
- Files: `docker-compose.yml` line 20
- Current mitigation: Can be overridden with env var
- Recommendations: Enforce strong secret generation, document security requirements

## Test Coverage Gaps

**Unittest Missing:**
- What's not tested: All API functions, data transformations
- Files: `src/lib/api.ts`, `src/lib/tenant-api.ts`
- Risk: Data corruption, silent failures
- Priority: High

**Integration Tests Missing:**
- What's not tested: End-to-end flows (create lease, generate rent, process payment)
- Files: N/A
- Risk: Broken workflows undetected
- Priority: High

**Component Tests Missing:**
- What's not tested: Form validation, error states, loading states
- Files: All form components
- Risk: UI regressions, poor UX
- Priority: Medium

---

*Concerns audit: 2026-04-21*
