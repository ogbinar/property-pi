---
phase: 04
plan: 02
subsystem: tenant-portal
tags: [pocketbase, tenant-access, share-link, landlord-ui]

# Dependency graph
requires:
  - phase: 04-01
    provides: "Tenant portal page, validation logic, portal components"
provides:
  - "Landlord can generate tenant access tokens"
  - "Shareable tenant portal links"
  - "Token regeneration with invalidation"
affects:
  - "05-deployment"

# Tech tracking
tech-stack:
  added: ["crypto.randomUUID()", "tenantAccess field on leases"]
  patterns: ["Client-side token generation", "PocketBase collection update", "Link sharing UI"]

key-files:
  created:
    - ".planning/phases/04/04-02-SUMMARY.md"
  modified:
    - "src/app/(dashboard)/leases/[id]/page.tsx"

key-decisions:
  - "Using crypto.randomUUID() for token generation - 36-char UUIDs are cryptographically secure and browser-native"
  - "Link format: /tenant/portal?token={leaseId}:{token} - combines lease identification with authentication token"
  - "Token stored in lease.tenantAccess field - single source of truth, easy to invalidate by overwriting"

# Execution summary
## What was done

### Task 1: Add tenant link functionality to lease detail page

**State added:**
- `tenantLink` - stores generated link for display
- `linkLoading` - loading state for API calls
- `showLinkModal` - controls modal visibility

**Functions added:**
- `generateTenantLink()` - creates new UUID token, updates PocketBase lease record, generates shareable link
- `regenerateTenantLink()` - creates new token, invalidates old link by overwriting

**UI added:**
- "Tenant Portal Access" card with "Share Tenant Link" / "View Link" button
- Link display with copy-to-clipboard functionality
- "Regenerate" button (red, ghost variant) to invalidate old links
- Modal dialog showing full link and copy functionality

**Integration:**
- Uses existing `pb` PocketBase SDK client
- Leverages existing `Modal` and `Button` components
- Uses `toast` for user feedback
- No changes to existing lease functionality (renew, terminate, status change)

## Verification

✅ Build succeeds with `npm run build` (zero TypeScript errors)
✅ TypeScript compiles without errors
✅ All existing functionality preserved
✅ New tenant link feature integrated seamlessly

## Success criteria met

- [x] Landlord sees "Share Tenant Link" button on lease detail page
- [x] Clicking generates a cryptographically random token stored in lease.tenantAccess
- [x] Link format: `/tenant/portal?token={leaseId}:{uuid}`
- [x] Landlord can copy link to clipboard
- [x] Regenerating token invalidates the old link
- [x] Build succeeds with `npm run build`

---
*Phase 4.2 execution complete: 2026-04-21*
