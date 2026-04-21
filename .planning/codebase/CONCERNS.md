# Codebase Concerns

**Analysis Date:** 2026-04-21

## Test Coverage Gaps

**No test suite detected:**
- What's not tested: Complete absence of unit tests, integration tests, or E2E tests
- Files: No test files found in `src/` directory
- Risk: Any code change could introduce regressions without detection
- Priority: **High** - Critical for maintaining application stability

## Security Considerations

**Potential SQL Injection in PocketBase Filters:**
- Risk: String interpolation in filter queries could be vulnerable if user input is not sanitized
- Files: `src/lib/tenant-api.ts` (lines 31, 50, 68)
- Current mitigation: Variables appear to be internal IDs, but no explicit validation
- Recommendations: Add input validation before constructing filter strings

**Silent Error Handling:**
- Risk: Errors are caught and swallowed without logging or user notification
- Files:
  - `src/lib/tenant-api.ts` (lines 20, 36, 54, 72) - returns null/empty arrays
  - `src/components/leases/renewal-modal.tsx` (line 57)
  - `src/components/tenant/maintenance-request-form.tsx` (line 55)
  - `src/app/tenant/portal/page.tsx` (lines 67, 90)
  - `src/app/(dashboard)/rent/page.tsx` (lines 79, 98, 114)
  - `src/app/(dashboard)/leases/[id]/page.tsx` (lines 99, 130)
  - `src/app/(dashboard)/expenses/[id]/page.tsx` (line 55)
- Current mitigation: None - errors fail silently
- Recommendations: Implement proper error logging and user feedback

**Console Errors in Production:**
- Risk: Debug console statements present throughout codebase
- Files: 11 console.error statements across multiple dashboard pages
- Current mitigation: None
- Recommendations: Replace with proper logging service or remove in production builds

## Performance Bottlenecks

**Client-Side Data Filtering:**
- Problem: Large datasets fetched entirely then filtered on client
- Files: `src/lib/api.ts` (lines 95-103, 206-217, 331-334, 446-458, 591-607, 714-725)
- Cause: `getFullList()` fetches all records, then client-side filtering applied
- Impact: Poor performance with large datasets, unnecessary network transfer
- Improvement path: Implement server-side filtering using PocketBase query parameters

**Unoptimized Dashboard Queries:**
- Problem: Dashboard fetches all collections without pagination or limiting
- Files: `src/lib/api.ts` (lines 840-922)
- Cause: `getDashboard()` calls `getFullList()` on units, payments, expenses, leases
- Impact: Slow dashboard load as data grows
- Improvement path: Add pagination, date-range filters, or caching

**Inefficient Nested Client Components:**
- Problem: 47 components marked with 'use client' directive
- Files: Throughout `src/components/` and `src/app/`
- Impact: Reduces server-side rendering benefits, larger bundle size
- Improvement path: Audit which components truly need client-side interactivity

## Fragile Areas

**Type Safety Gaps:**
- Issue: Use of `any` type undermines TypeScript benefits
- Files: `src/app/(dashboard)/maintenance/[id]/page.tsx` (line 29)
- Why fragile: Type errors won't be caught at compile time
- Safe modification: Define proper TypeScript interfaces
- Test coverage: None

**Data Mapping Inconsistencies:**
- Issue: Complex field name transformations between PocketBase and UI
- Files: `src/lib/api.ts` (throughout - getStatusMap, mapUnit, mapTenant, mapLease, mapExpense, mapMaintenance)
- Why fragile: Easy to introduce bugs during field mapping
- Safe modification: Consider using Zod schemas for validation
- Test coverage: None

**Empty Filter Results Not Handled:**
- Issue: Multiple pages show generic messages but logic may not handle edge cases
- Files:
  - `src/app/(dashboard)/maintenance/page.tsx` (line 256)
  - `src/app/(dashboard)/units/page.tsx` (line 154)
  - `src/app/(dashboard)/expenses/page.tsx` (line 235)
- Why fragile: User experience degrades with empty data
- Safe modification: Add comprehensive empty state handling

## Tech Debt

**API Layer Migration Incomplete:**
- Issue: Comments reference "old" and "new" conventions indicating incomplete migration
- Files: `src/lib/api.ts` (lines 4-6, 44-56 comments)
- Impact: Confusion about which naming convention to use
- Fix approach: Complete migration to consistent PocketBase field naming

**Missing Unit Relation Population:**
- Issue: Unit and tenant relations not populated in API responses
- Files: `src/lib/api.ts` (lines 90-91, 124-125, 237-238)
- Impact: Additional queries needed to fetch related data
- Fix approach: Use PocketBase expand parameter to fetch relations in single query

**Lease Expiration Logic Missing Data:**
- Issue: Dashboard expiration calculation returns empty array
- Files: `src/lib/api.ts` (lines 898-910)
- Impact: Upcoming lease expirations not shown to users
- Fix approach: Implement proper unit and tenant expansion for lease data

**Currency Formatting Hardcoded:**
- Issue: Philippine Peso (PHP) currency hardcoded
- Files: `src/app/(dashboard)/maintenance/[id]/page.tsx` (lines 162-167)
- Impact: Not adaptable to different currencies/regions
- Fix approach: Extract to configuration or context

## Dependencies at Risk

**No Validation Library for Runtime:**
- Risk: No Zod/Joi/Yup for runtime validation of API responses
- Impact: Type mismatches between PocketBase schema and TypeScript types could cause runtime errors
- Migration plan: Add Zod schemas mirroring PocketBase types

**Missing Error Boundary Components:**
- Risk: No React ErrorBoundary for graceful error handling
- Impact: Unhandled errors crash entire application
- Migration plan: Add error boundary wrapper around dashboard

## Missing Critical Features

**No Input Sanitization:**
- Problem: User input not validated before database operations
- Files: All form submission handlers in `src/app/(dashboard)/**/`
- Blocks: Security vulnerability for XSS or injection attacks

**No Rate Limiting:**
- Problem: No protection against API abuse
- Blocks: Application vulnerable to DoS attacks

**Missing Loading States:**
- Problem: Inconsistent or missing loading indicators
- Files: Various dashboard pages
- Blocks: Poor user experience during data fetch

---

*Concerns audit: 2026-04-21*
