# Testing Patterns

**Analysis Date:** 2026-04-21

---

## Test Framework

**Status:** No testing framework configured

**Detected:**
- No Jest, Vitest, or similar test runner
- No test configuration files (`jest.config.*`, `vitest.config.*`)
- No test assertion libraries (Jest expect, Chai, etc.)

**Scripts in `package.json`:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  }
}
```

**Missing Test Scripts:**
- No `test` script
- No `test:watch` script
- No `test:coverage` script

---

## Test File Organization

**Status:** No test files detected in source directories

**Search Results:**
- No `*.test.*` files in `src/`
- No `*.spec.*` files in `src/`
- No `__tests__` directories
- No `tests/` or `test/` directories

**Test Directory Structure:**
```
Not configured
```

**Expected Structure (if implementing):**
```
src/
├── __tests__/
│   ├── components/
│   ├── lib/
│   └── app/
└── test/
    └── fixtures/
```

---

## Test Framework Recommendations

### Option 1: Jest + React Testing Library (Popular Choice)

**Installation:**
```bash
npm install -D jest @types/jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Configuration (`jest.config.js`):**
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
```

**Package.json Scripts:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Option 2: Vitest (Modern Alternative)

**Installation:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Configuration (`vitest.config.ts`):**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
  },
})
```

---

## Test Structure (Recommended Patterns)

### Unit Test Example

```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility', () => {
  it('merges tailwind classes correctly', () => {
    expect(cn('px-4 py-2', 'bg-blue-500')).toBe('px-4 py-2 bg-blue-500')
  })

  it('handles conditional classes', () => {
    const isActive = true
    expect(cn('base-class', isActive && 'active-class')).toBe('base-class active-class')
  })
})
```

### Component Test Example

```typescript
// src/components/ui/button.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button component', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    
    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>)
    expect(screen.getByText('Loading')).toBeDisabled()
  })

  it('applies correct variant classes', () => {
    const { container } = render(<Button variant="danger">Danger</Button>)
    expect(container.firstChild).toHaveClass('bg-red-600')
  })
})
```

### Form Component Test Example

```typescript
// src/components/units/unit-form.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { UnitForm } from '@/components/units/unit-form'

describe('UnitForm component', () => {
  const mockOnSubmit = vi.fn()

  it('renders form fields', () => {
    render(
      <UnitForm
        submitLabel="Create Unit"
        onSubmit={mockOnSubmit}
        isLoading={false}
      />
    )
    
    expect(screen.getByLabelText('Unit Number')).toBeInTheDocument()
    expect(screen.getByLabelText('Type')).toBeInTheDocument()
    expect(screen.getByLabelText('Monthly Rent')).toBeInTheDocument()
  })

  it('submits form data', async () => {
    render(
      <UnitForm
        submitLabel="Create Unit"
        onSubmit={mockOnSubmit}
        isLoading={false}
      />
    )

    fireEvent.change(screen.getByLabelText('Unit Number'), {
      target: { value: 'A-101' },
    })
    fireEvent.change(screen.getByLabelText('Type'), {
      target: { value: '1BR' },
    })
    fireEvent.change(screen.getByLabelText('Monthly Rent'), {
      target: { value: '15000' },
    })
    fireEvent.change(screen.getByLabelText('Security Deposit'), {
      target: { value: '30000' },
    })

    fireEvent.click(screen.getByText('Create Unit'))
    expect(mockOnSubmit).toHaveBeenCalledWith({
      unitNumber: 'A-101',
      type: '1BR',
      rentAmount: '15000',
      securityDeposit: '30000',
    })
  })

  it('shows validation errors for empty fields', () => {
    render(
      <UnitForm
        submitLabel="Create Unit"
        onSubmit={mockOnSubmit}
        isLoading={false}
      />
    )

    fireEvent.click(screen.getByText('Create Unit'))
    expect(screen.getByText('Unit number is required')).toBeInTheDocument()
  })
})
```

---

## Mocking Strategies

### API Mocking (Recommended)

**Using MSW (Mock Service Worker):**

```bash
npm install -D msw
```

```typescript
// test/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/units', () => {
    return HttpResponse.json([
      { id: '1', name: 'Unit A', status: 'vacant' },
    ])
  }),

  http.post('/api/units', async ({ request }) => {
    const data = await request.json()
    return HttpResponse.json({ id: '2', ...data })
  }),
]
```

### PocketBase Mocking

```typescript
// test/mocks/pocketbase.ts
import { vi } from 'vitest'
import PocketBase from 'pocketbase'

// Mock PocketBase instance
export const mockPocketBase = {
  authStore: {
    isValid: true,
    record: { id: '1', email: 'test@example.com' },
    onChange: vi.fn(),
    clear: vi.fn(),
  },
  collection: vi.fn(() => ({
    authWithPassword: vi.fn(),
    getOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  })),
}

vi.mock('@/lib/pocketbase', () => ({
  default: mockPocketBase,
}))
```

---

## Fixtures and Factories

### Test Data Factories (Recommended)

```typescript
// test/fixtures/units.ts
export const unitFixture = {
  id: '1',
  name: 'Unit A-101',
  number: 'A-101',
  floor: 1,
  area: 50,
  type: '1BR',
  rent: 15000,
  deposit: 30000,
  status: 'vacant' as const,
  features: 'Balcony, AC',
  description: 'Cozy 1BR unit',
  rentHistory: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

export function createUnitFixture(overrides?: Partial<typeof unitFixture>) {
  return { ...unitFixture, ...overrides }
}
```

```typescript
// test/fixtures/tenants.ts
export const tenantFixture = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '123-456-7890',
  unit: '1',
  moveInDate: '2024-01-01',
  moveOutDate: null,
  status: 'active' as const,
  notes: '',
  contactLog: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}
```

### Location

**Recommended:** `test/fixtures/` or `src/__tests__/fixtures/`

---

## Coverage

**Status:** No coverage configuration or reporting

**Recommended Setup (Jest):**

```bash
npm run test:coverage
```

**Coverage Configuration:**
```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**/page.tsx',
  ],
}
```

**Coverage Report Location:** `./coverage/lcov-report/index.html`

---

## Test Types

### Unit Tests (Recommended Priority: High)

**Scope:**
- Utility functions (`src/lib/utils.ts`)
- Form validation schemas
- Type guards and helpers

**Example Files:**
- `src/lib/utils.test.ts`
- `src/types/pocketbase.test.ts`

### Component Tests (Recommended Priority: High)

**Scope:**
- UI components (`src/components/ui/*`)
- Feature components (`src/components/{feature}/*`)
- Form components

**Example Files:**
- `src/components/ui/button.test.tsx`
- `src/components/units/unit-form.test.tsx`
- `src/components/auth/auth-guard.test.tsx`

### Integration Tests (Recommended Priority: Medium)

**Scope:**
- API client functions (`src/lib/api.ts`)
- PocketBase interactions
- Authentication flow

**Example Files:**
- `src/lib/api.test.ts`
- `src/lib/AuthProvider.test.tsx`

### E2E Tests (Recommended Priority: Low)

**Status:** Not configured

**Recommended Tools:**
- Playwright (Next.js recommended)
- Cypress

**Installation (Playwright):**
```bash
npm install -D @playwright/test
npx playwright install
```

**Configuration (`playwright.config.ts`):**
```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
})
```

**Example E2E Test:**
```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test'

test('login flow', async ({ page }) => {
  await page.goto('/login')
  await page.fill('#email', 'admin@example.com')
  await page.fill('#password', 'password123')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/')
})
```

---

## CI/CD Test Integration

**Status:** No CI/CD pipeline configured

**Detected:**
- No `.github/workflows/` directory
- No CI configuration files

**Recommended GitHub Actions Workflow:**

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Run tests
        run: npm run test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Common Patterns (Recommended)

### Async Testing

```typescript
// With async/await
it('handles async operations', async () => {
  const data = await fetchData()
  expect(data).toBeDefined()
})

// With Promise
it('returns a promise', () => {
  const promise = asyncFunction()
  expect(promise).toBeInstanceOf(Promise)
})
```

### Error Testing

```typescript
// Testing thrown errors
it('throws an error for invalid input', () => {
  expect(() => validateInput('')).toThrow('Invalid input')
})

// Testing rejected promises
it('rejects on failure', async () => {
  await expect(failingFunction()).rejects.toThrow('Failed')
})

// Testing error messages in try-catch
it('handles error state', async () => {
  const { result } = renderHook(() => useAuth())
  await act(async () => {
    await result.current.signIn('invalid', 'credentials')
  })
  expect(result.current.error).toBe('Invalid credentials')
})
```

### Context Testing

```typescript
it('provides auth context values', () => {
  const { result } = renderHook(() => useAuth(), {
    wrapper: ({ children }) => (
      <AuthProvider>
        {children}
      </AuthProvider>
    ),
  })
  
  expect(result.current.user).toBeNull()
  expect(result.current.isLoading).toBe(true)
})
```

---

## Test Coverage Gaps

### Currently Untested Areas

| Area | Files | Risk | Priority |
|------|-------|------|----------|
| Form validation | `src/components/**/unit-form.tsx`, `*-form.tsx` | High | High |
| Auth flow | `src/lib/AuthProvider.tsx`, `src/components/auth/` | High | High |
| API client | `src/lib/api.ts`, `src/lib/tenant-api.ts` | High | High |
| UI components | `src/components/ui/*` | Medium | High |
| Page components | `src/app/**/page.tsx` | Medium | Medium |
| Layout components | `src/components/layout/*` | Low | Low |

### Critical Test Files to Create First

1. **`src/lib/utils.test.ts`** - Tests `cn()` utility
2. **`src/components/ui/button.test.tsx`** - Core UI component
3. **`src/components/auth/auth-guard.test.tsx`** - Auth protection
4. **`src/lib/AuthProvider.test.tsx`** - Auth context
5. **`src/components/units/unit-form.test.tsx`** - Form validation

---

## Recommendations Summary

### Immediate Actions

1. **Choose a test framework** - Vitest (modern) or Jest (established)
2. **Set up test configuration** - Config file + test scripts in package.json
3. **Create test directory structure** - `src/__tests__/` or `test/`
4. **Write utility tests first** - `utils.ts` is small and foundational
5. **Add test script to CI** - Even without full coverage initially

### Short-term Goals

1. **Achieve 70%+ coverage** on `src/lib/` utilities
2. **Test all UI components** in `src/components/ui/`
3. **Add form validation tests** for all `*-form.tsx` components
4. **Set up coverage reporting** with thresholds

### Long-term Goals

1. **Add E2E tests** with Playwright for critical user flows
2. **Implement MSW** for API mocking
3. **Achieve 80%+ overall coverage**
4. **Add visual regression tests** (optional)

---

*Testing analysis: 2026-04-21*
