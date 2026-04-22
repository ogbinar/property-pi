# Section 1.1 — Project Setup & Infrastructure

## Goal
Get the project running with all dependencies, database initialized, authentication working, and a layout shell ready.

---

## Task 1.1.1 — Install Dependencies

**What:** Add all required npm packages.

**Steps:**
1. Run `npm install next-auth date-fns lucide-react clsx tailwind-merge zod react-hook-form @hookform/resolvers/zod recharts`
2. Run `npm install -D @types/node @types/react @types/react-dom typescript`
3. Verify `package.json` has all dependencies listed
4. Run `npm install` to generate fresh `package-lock.json`

**Acceptance Criteria:**
- All packages installed without errors
- `npm run dev` starts without dependency errors
- `node_modules/` contains all packages

---

## Task 1.1.2 — Initialize Database

**What:** Push Prisma schema to PostgreSQL and verify tables.

**Steps:**
1. Verify `.env` has `DATABASE_URL` configured
2. Run `npx prisma generate` to generate Prisma Client
3. Run `npx prisma db push` to create all tables
4. Run `npx prisma studio` to visually verify tables exist
5. Verify these tables exist: `Unit`, `Tenant`, `Lease`, `Payment`, `Expense`, `MaintenanceRequest`

**Acceptance Criteria:**
- Prisma Client generated (no TypeScript errors in `src/lib/prisma.ts`)
- All 6 tables created in PostgreSQL
- Prisma Studio opens and shows all tables (empty but present)
- No migration files needed (using `db push` for dev)

---

## Task 1.1.3 — Add Authentication

**What:** Implement landlord login with NextAuth.js.

**Steps:**
1. Create `src/lib/auth.ts` — configure NextAuth with credentials provider (email/password)
2. Create `src/app/(auth)/login/page.tsx` — login form with email + password fields
3. Create `src/app/(auth)/actions.ts` — login server action
4. Create `src/middleware.ts` — protect all routes except `/login` and `/api/auth/*`
5. Create `src/app/api/auth/[...nextauth]/route.ts` — NextAuth API handler
6. Create `src/components/auth/session-provider.tsx` — wrap app with SessionProvider
7. Create a simple admin user seed (email: admin@propertypi.local, password: admin123)

**Acceptance Criteria:**
- `/login` page renders with email and password fields
- Valid credentials → redirect to `/` (dashboard)
- Invalid credentials → show error message
- Unauthenticated user → redirected to `/login` when accessing `/` or any dashboard route
- Authenticated user → can logout and redirect to `/login`
- Session persists across page refreshes

---

## Task 1.1.4 — Create Layout Shell

**What:** Build the main app layout with sidebar and header.

**Steps:**
1. Restructure `src/app/`:
   - Create `src/app/(dashboard)/` — route group for all authenticated pages
   - Move `page.tsx` into `(dashboard)/` (will be replaced later)
   - Keep `layout.tsx` at root level, update to include SessionProvider and auth check
   - Keep `globals.css` at root level
2. Create `src/components/layout/sidebar.tsx`:
   - Logo/app name at top
   - Navigation links: Dashboard, Units, Tenants, Leases, Rent
   - Active link highlighting
   - Collapsible on mobile (hamburger menu)
3. Create `src/components/layout/header.tsx`:
   - Page title (prop passed from each page)
   - User avatar + dropdown with logout
   - Dark mode toggle button
4. Create `src/app/(dashboard)/layout.tsx`:
   - Wrap children with Sidebar + Header
   - Flex layout: sidebar fixed left, content scrolls right
   - Responsive: sidebar collapses on small screens
5. Add Tailwind config for dark mode (if not using CSS-only dark mode)

**Acceptance Criteria:**
- Sidebar shows on desktop, hamburger menu on mobile
- Navigation links render correctly
- Clicking a link navigates (currently all go to placeholder)
- Header shows user info and logout button
- Dark mode toggle works (toggles a class on `<html>`)
- Content area scrolls independently of sidebar
- Layout looks good at 320px, 768px, 1024px, 1440px widths

---

## Task 1.1.5 — Create Shared UI Components

**What:** Build reusable component library.

**Steps:**

### Button (`src/components/ui/button.tsx`)
- Props: `variant` (primary/secondary/outline/ghost/danger), `size` (sm/md/lg), `disabled`, `isLoading`, `children`
- Default: primary, md
- Primary: filled background color, white text
- Secondary: outlined, secondary text
- Danger: red background
- Loading: shows spinner icon, disables click

### Card (`src/components/ui/card.tsx`)
- Props: `title`, `subtitle`, `action` (node), `children`
- Structure: `<Card>` → `<CardHeader>` + `<CardBody>` + `<CardFooter>`
- Subtle shadow, rounded corners, white background (or dark in dark mode)

### Badge (`src/components/ui/badge.tsx`)
- Props: `variant` (default/success/warning/error/info/neutral), `children`
- Colors:
  - success: green (PAID, OCCUPIED, ACTIVE)
  - warning: yellow (PENDING, RENEWAL_PENDING)
  - error: red (OVERDUE, EXPIRED, TERMINATED)
  - info: blue (UNDER_RENOVATION)
  - neutral: gray (VACANT, MAINTENANCE)

### Input (`src/components/ui/input.tsx`)
- Props: `label`, `error`, `placeholder`, `type`, `required`, `children`
- Shows label above, input below, error text in red below error
- Supports: text, email, number, password, date

### Select (`src/components/ui/select.tsx`)
- Props: `label`, `error`, `options` (array of {value, label}), `required`, `placeholder`
- Styled dropdown with label and error state

### Modal (`src/components/ui/modal.tsx`)
- Props: `isOpen`, `onClose`, `title`, `description`, `children`, `actions`
- Backdrop overlay with click-outside-to-close
- Centered card with title, content, and action buttons
- Trap focus inside modal

### Table (`src/components/ui/table.tsx`)
- Props: `columns` (array of {key, label, render?}), `data`, `actions?`
- Responsive: horizontal scroll on mobile
- Striped rows option
- Actions column: edit/delete buttons per row

### EmptyState (`src/components/ui/empty-state.tsx`)
- Props: `title`, `description`, `actionLabel`, `onAction`
- Icon + text + optional CTA button
- Used when lists are empty

**Acceptance Criteria:**
- All 8 components created in `src/components/ui/`
- Each component has proper TypeScript types
- Components work in both light and dark mode
- `npm run lint` passes with no errors
- Components are importable and render without warnings

---

## Execution Notes

- **Prisma 7 adapter:** Using `@prisma/adapter-pg` with `PrismaPg` for PostgreSQL connection
- **Auth:** NextAuth v4 with credentials provider, JWT strategy
- **Admin user:** Created via `prisma/seed.ts` — email: `admin@propertypi.local`, password: `admin123`
- **Middleware:** Uses `export { auth as middleware }` pattern (Next.js 16 deprecates this in favor of `proxy`, but still works)
- **class-variance-authority:** Installed for Button and Badge variant styling
- **TypeScript:** Zero errors, zero lint warnings

## Summary Checklist

- [x] Task 1.1.1 — Dependencies installed
- [x] Task 1.1.2 — Database initialized, all tables created
- [x] Task 1.1.3 — Auth working (login, protect routes, logout)
- [x] Task 1.1.4 — Layout shell (sidebar + header + responsive)
- [x] Task 1.1.5 — All 8 UI components built and lint-clean
