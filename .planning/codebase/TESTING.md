# Testing Patterns

**Analysis Date:** 2026-04-21

## Test Framework

**Status:** No test framework configured.

**Runner:** None detected
- No test runner found (no Vitest, Jest, Mocha, or similar)
- No test configuration files present (`vitest.config.ts`, `jest.config.js`, `playwright.config.ts`, etc.)
- No test dependencies in `package.json`

**Dependencies from `package.json`:**
```json
{
  "dependencies": {
    "@hookform/resolvers": "^5.2.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "lucide-react": "^1.8.0",
    "next": "16.2.4",
    "pocketbase": "^0.25.0",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "react-hook-form": "^7.72.1",
    "recharts": "^3.8.1",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.5.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.4",
    "tailwindcss": "^4",
    "tsx": "^4.21.0",
    "typescript": "^5"
  }
}
```

**Run Commands:** None defined
- No `test`, `test:watch`, or `test:coverage` scripts in `package.json`
- Only scripts present: `dev`, `build`, `start`, `lint`

## Test File Organization

**Location:** No test files found

**Search Results:**
- No `.test.ts`, `.test.tsx`, `.spec.ts`, or `.spec.tsx` files in `src/`
- No `__tests__/` directories
- No `tests/` directory
- No test setup files (`setupTests.ts`, `vitest.setup.ts`, `jest.setup.js`)

**File Organization Pattern (recommended):**
```
src/
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── button.test.tsx          # Would test variant, size, loading states
│   │   ├── input.tsx
│   │   ├── input.test.tsx           # Would test validation, onChange
│   │   └── modal.tsx
│   └── tenants/
│       ├── tenant-table.tsx
│       └── tenant-table.test.tsx    # Would test rendering, actions
├── lib/
│   ├── api.ts
│   ├── api.test.ts                  # Would test data mapping, error handling
│   ├── pocketbase.ts
│   ├── utils.ts
│   └── utils.test.ts                # Would test cn() utility
└── types/
    └── pocketbase.ts                # Type definitions (not testable)
```

## Testing Patterns

**Unit Tests:** Not implemented
- No utility function tests (`src/lib/utils.ts` — `cn()` function)
- No data mapping tests (`src/lib/api.ts` — `getStatusMap()`, `mapUnit()`, `mapTenant()`)
- No component tests for UI primitives (`button.tsx`, `input.tsx`, `card.tsx`)
- No component tests for feature components (`tenant-table.tsx`, `lease-form.tsx`)

**Integration Tests:** Not implemented
- No PocketBase client tests (`src/lib/pocketbase.ts`)
- No API data flow tests (fetch → map → render)
- No AuthProvider tests (`src/lib/AuthProvider.tsx`)

**E2E Tests:** Not implemented
- No Playwright, Cypress, or similar E2E tools configured
- No test directories for E2E (`e2e/`, `integration/`)
- No user flow tests (login → dashboard → CRUD operations)

## Component Testing Analysis

**Components Requiring Tests:**

### UI Primitives (`src/components/ui/`)
1. **button.tsx** — Test variants (primary, secondary, outline, ghost, danger), sizes (sm, md, lg, icon), loading state, disabled state
2. **input.tsx** — Test onChange, value prop, placeholder, error state
3. **card.tsx** — Test rendering with/without header, children
4. **modal.tsx** — Test open/close, backdrop click, escape key
5. **badge.tsx** — Test variants (success, neutral, warning, danger)
6. **table.tsx** — Test rendering rows, columns
7. **select.tsx** — Test option selection
8. **textarea.tsx** — Test onChange, value
9. **empty-state.tsx** — Test rendering with different messages

### Feature Components
1. **tenant-table.tsx** — Test rendering tenant list, action buttons, empty state
2. **tenant-form.tsx** — Test form submission, validation errors
3. **lease-table.tsx** — Test rendering leases, status badges
4. **lease-form.tsx** — Test create/edit flows
5. **unit-table.tsx** — Test rendering units, status indicators
6. **maintenance-table.tsx** — Test priority badges, status filtering
7. **expense-table.tsx** — Test category filtering, date display

### Layout Components
1. **Sidebar** — Test navigation items, active state, mobile toggle
2. **header.tsx** — Test rendering, user menu

### Auth Components
1. **AuthGuard.tsx** — Test redirect behavior, loading state

## Mocking

**Framework:** None configured

**Recommended Patterns (for future setup):**

### Mocking PocketBase
```typescript
// tests/mocks/pocketbase.ts
import PocketBase from 'pocketbase'

const mockAuthStore = {
  isValid: true,
  record: { id: 'test-id', email: 'test@example.com' },
  onChange: jest.fn(),
  clear: jest.fn(),
}

const mockCollection = {
  getFullList: jest.fn(),
  getOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}

jest.mock('pocketbase', () => {
  return jest.fn(() => ({
    authStore: mockAuthStore,
    collection: jest.fn(() => mockCollection),
  }))
})
```

### Mocking API Functions
```typescript
// tests/mocks/api.ts
export const mockApi = {
  getUnits: jest.fn(),
  getTenants: jest.fn(),
  createUnit: jest.fn(),
  // ... other functions
}
```

### Test Data Factories
```typescript
// tests/factories/unit.ts
export function createUnitRecord(overrides = {}) {
  return {
    id: 'test-id',
    number: '101',
    floor: 1,
    area: 1000,
    type: 'studio',
    rent: 1500,
    deposit: 1500,
    status: 'vacant',
    features: '',
    description: '',
    rentHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

export function createTenantRecord(overrides = {}) {
  return {
    id: 'tenant-id',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '555-1234',
    unit: '',
    moveInDate: '2024-01-01',
    moveOutDate: null,
    status: 'active',
    notes: '',
    contactLog: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}
```

## Fixtures and Test Data

**Location:** Not established

**Recommended Structure:**
```
tests/
├── fixtures/
│   ├── units.ts           # Unit test data
│   ├── tenants.ts         # Tenant test data
│   ├── leases.ts          # Lease test data
│   ├── payments.ts        # Payment test data
│   ├── expenses.ts        # Expense test data
│   └── maintenance.ts     # Maintenance test data
├── mocks/
│   ├── pocketbase.ts      # PocketBase SDK mock
│   ├── api.ts             # API function mock
│   └── router.ts          # Next.js router mock
└── setup/
    └── global.ts          # Global test setup
```

**Example Fixture:**
```typescript
// tests/fixtures/dashboard.ts
export const mockDashboardData = {
  unit_counts: {
    total: 10,
    occupied: 7,
    vacant: 2,
    maintenance: 1,
    under_renovation: 0,
  },
  occupancy_rate: 70,
  monthly_revenue: {
    expected: 15000,
    collected: 12000,
  },
  expenses: {
    total: 3000,
    net_profit: 9000,
    by_category: {
      Maintenance: 1500,
      Utilities: 1000,
      Insurance: 500,
    },
  },
  recent_activities: [],
  upcoming_expirations: [],
}
```

## Coverage

**Requirements:** None enforced — no coverage tool configured

**Recommended Setup:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest watch",
    "test:coverage": "vitest --coverage"
  }
}
```

**View Coverage (after setup):**
```bash
npm run test:coverage
```

## Test Types

**Unit Tests:** Not implemented
- **Scope:** Individual functions, utilities, small components
- **Approach:** Isolated tests with mocked dependencies
- **Examples to add:**
  - `getStatusMap()` — test status conversion logic
  - `cn()` utility — test class merging
  - Form validation schemas (if Zod is used)

**Integration Tests:** Not implemented
- **Scope:** API data flow, component interactions
- **Approach:** Test multiple layers together (API → component)
- **Examples to add:**
  - `getUnits()` with mocked PocketBase response
  - `AuthProvider` context flow
  - Form submission with `react-hook-form`

**E2E Tests:** Not implemented
- **Framework:** Not configured
- **Recommended:** Playwright or Cypress
- **Tests to add:**
  - Login flow
  - Create unit flow
  - Create tenant flow
  - Lease creation flow
  - Rent payment flow

## Common Patterns (Recommended)

**Async Testing:**
```typescript
// Would look like this with Vitest + Testing Library
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

describe('UnitTable', () => {
  it('loads and displays units', async () => {
    const mockUnits = [/* ... */]
    vi.spyOn(api, 'getUnits').mockResolvedValue(mockUnits)

    render(<UnitTable />)

    await waitFor(() => {
      expect(screen.getByText('101')).toBeInTheDocument()
    })
  })
})
```

**Error Testing:**
```typescript
describe('UnitTable', () => {
  it('shows error state when fetch fails', async () => {
    vi.spyOn(api, 'getUnits').mockRejectedValue(new Error('Failed to fetch'))

    render(<UnitTable />)

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
    })
  })
})
```

**Component Snapshot Testing:**
```typescript
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('matches snapshot', () => {
    const { container } = render(<Button>Click</Button>)
    expect(container).toMatchSnapshot()
  })
})
```

## Testing Recommendations

### Priority 1: Critical Infrastructure
1. **Set up Vitest** — Fast, Next.js-compatible test runner
2. **Configure Testing Library** — For React component testing
3. **Add MSW (Mock Service Worker)** — For API mocking
4. **Create test utilities** — Custom render, mock factories

### Priority 2: Core Functionality
1. **Test data mapping functions** — `getStatusMap()`, `mapUnit()`, `mapTenant()`
2. **Test UI primitives** — `Button`, `Input`, `Modal`, `Badge`
3. **Test table components** — `TenantTable`, `UnitTable`, `LeaseTable`
4. **Test form components** — `TenantForm`, `UnitForm`, `LeaseForm`

### Priority 3: Integration
1. **Test API layer** — Mock PocketBase, test `api.ts` functions
2. **Test AuthProvider** — Context flow, login/logout
3. **Test layout components** — `Sidebar`, `Header`

### Priority 4: E2E
1. **Set up Playwright** — Browser automation
2. **Test critical user flows:**
   - Login → Dashboard
   - Create unit
   - Create tenant
   - Create lease
   - Record payment

---

*Testing analysis: 2026-04-21*
