---
phase: 2
plan_number: 02
title: Authentication
objective: Implement landlord login via PocketBase auth — auth context provider, login page, session protection, logout, and user info display.
waves:
  - wave: 1
    plans:
      - id: "02-01"
        autonomous: true
        objective: Create AuthContext provider, login page, and protected dashboard with logout
files_modified:
  - src/lib/AuthProvider.tsx
  - src/app/login/page.tsx
  - src/app/login/actions.ts
  - src/app/layout.tsx
  - src/app/(dashboard)/layout.tsx
  - src/components/layout/header.tsx
tasks:
  - Create AuthContext provider that wraps app layout
  - Create login page with email/password form
  - Implement authWithPassword flow with PocketBase SDK
  - Store token in localStorage via pb.authStore
  - Protect dashboard layout — redirect to login if not authenticated
  - Display logged-in user info in header
  - Implement logout (clear token, redirect to login)
  - Verify build succeeds with npm run build
---

## Objective

Implement landlord login via PocketBase auth. The landlord authenticates with email/password, gets a session stored in PocketBase's authStore (localStorage), and the dashboard is protected.

## Tasks

### Task 1: Create AuthContext provider

Create `src/lib/AuthProvider.tsx` — a React context provider that manages auth state, handles loading state, and provides `signIn`, `signOut`, `user`, `isLoading` to the app. This replaces the old NextAuth session provider.

The provider should:
- Initialize PocketBase SDK instance
- Listen to auth store changes
- Expose `user` (from `pb.authStore.model`) and `isLoading` (true while checking initial session)
- Provide `signIn(email, password)` → `pb.authWithPassword()`
- Provide `signOut()` → `pb.authStore.clear()`

### Task 2: Create login page

Create `src/app/login/page.tsx` — a login page with email and password form fields.

The page should:
- Display a simple branded login form
- Have email and password fields
- Show error messages from PocketBase auth responses
- On successful auth, redirect to `/` (dashboard)
- Use the AuthContext provider's signIn method
- Not be wrapped in the dashboard layout (no auth required)

### Task 3: Wrap app layout with AuthContext

Update `src/app/layout.tsx` to wrap the page content with the AuthContext provider. The provider should be a client component wrapper.

### Task 4: Dashboard layout protection

The dashboard layout (`src/app/(dashboard)/layout.tsx`) already checks `pocketBase.authStore.isValid` on the server side. This is good — keep it.

### Task 5: Header user info

Update the header component to display the logged-in user's email/name from the PocketBase auth store model.

### Task 6: Verify build

Run `npm run build` and fix any errors.
