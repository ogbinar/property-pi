---
phase: 05
plan: 03-04
subsystem: performance-auth
tags: [performance, auth, optimization, standalone]

# Dependency graph
requires:
  - phase: 05-wave-1
    provides: "Docker configuration, security hardening"
provides:
  - "Performance optimizations for < 5s dashboard load"
  - "Production-ready AuthProvider"
  - "Home page redirect"
affects:
  - "Production deployment"

# Tech tracking
tech-stack:
  added: ["Font display: swap", "Home page redirect", "LogoutButton component"]
  patterns: ["Optimistic font loading", "Server-side redirect", "Client-side logout"]

key-files:
  created:
    - "src/components/auth/LogoutButton.tsx"
  modified:
    - "src/app/layout.tsx"
    - "src/app/page.tsx"

key-decisions:
  - "Font display: swap for faster text rendering"
  - "Home page redirects to /login (no public landing page needed)"
  - "LogoutButton as standalone component for reuse"

# Execution summary
## Wave 2: Performance & Auth (Plans 05-03, 05-04)

### Task P5.3: Performance Optimization

**Font optimization (src/app/layout.tsx):**
- Added `display: 'swap'` to GeistSans and GeistMono fonts
- Prevents FOIT (Flash of Invisible Text)
- Improves perceived load time

**Home page redirect (src/app/page.tsx):**
- Replaced Next.js welcome page with redirect to /login
- No need for public landing page (landlord-only app)
- Reduces bundle size

**Verification:**
✅ Build succeeds with `npm run build`
✅ `.next/standalone` directory created
✅ Standalone server.js exists

### Task P5.4: AuthProvider Production Readiness

**Current state:**
- AuthProvider already uses PocketBase SDK (from Phase 2/3)
- Uses `pb.authWithPassword()` for login
- Uses `pb.authStore.isValid` for session validation
- Uses `pb.authStore.onChange` for reactive auth state

**Created LogoutButton component:**
- Simple button component with logout functionality
- Calls `signOut()` and redirects to /login
- Can be reused in header, sidebar, or modals

## Verification

✅ Build succeeds with `npm run build` (zero TypeScript errors)
✅ Font optimization applied
✅ Home page redirects to /login
✅ AuthProvider uses PocketBase SDK
✅ LogoutButton component created
✅ Standalone build output verified

## Success criteria met

- [x] Font loading optimized with display: swap
- [x] Home page redirects to /login
- [x] Build succeeds with standalone output
- [x] AuthProvider uses PocketBase SDK (already complete)
- [x] LogoutButton component created
- [x] Bundle size reasonable (verified in build output)

---
*Wave 2 execution complete: 2026-04-21*
