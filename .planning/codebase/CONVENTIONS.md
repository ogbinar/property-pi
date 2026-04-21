# Coding Conventions

**Analysis Date:** 2026-04-21

## Project Overview

**Framework:** Next.js 16.2.4 (App Router)
**Language:** TypeScript 5.x
**UI Library:** React 19.2.4
**Styling:** Tailwind CSS 4.x

---

## Naming Patterns

### Files and Directories

**Component Files:**
- Use `kebab-case` for feature components: `tenant-form.tsx`, `maintenance-table.tsx`
- Use `kebab-case` for UI components: `button.tsx`, `input.tsx`, `card.tsx`
- Directory structure: `src/components/{feature}/{component}.tsx`

**Page Files:**
- Always named `page.tsx` within route folders
- Route folders use `kebab-case`: `/tenant/[id]/edit`

**Library Files:**
- Use `camelCase` for utility files: `utils.ts`, `pocketbase.ts`
- Use `PascalCase` for React context providers: `AuthProvider.tsx`

### Functions and Components

**React Components:**
- Use `PascalCase` for component names: `AuthGuard`, `UnitForm`, `Sidebar`
- Function components defined with `export function ComponentName()`
- Named exports preferred over default exports

**Utility Functions:**
- Use `camelCase`: `cn()`, `handleSubmitForm()`
- Single responsibility functions

### Variables and Types

**Variables:**
- Use `camelCase`: `user`, `isLoading`, `handleSubmit`
- State variables follow React conventions: `[user, setUser] = useState()`

**Interfaces and Types:**
- Use `PascalCase`: `UnitFormData`, `SelectOption`, `AuthContextType`
- Type suffixes for inferred types: `UnitFormData` (from `z.infer<typeof unitSchema>`)

**TypeScript Records:**
- Use `PascalCase` with `Record` suffix for PocketBase schemas: `UserRecord`, `UnitRecord`, `TenantRecord`

---

## Code Style

### Formatting

**Tool:** ESLint with `eslint-config-next`

**Key Settings (inferred from code):**
- 2-space indentation
- Single quotes for strings
- Semicolons omitted
- Trailing commas in multiline objects
- Maximum line length follows Next.js defaults

**Component Structure Pattern:**
```tsx
'use client'  // If client component

import { ... } from 'library'
import { ... } from '@/path/to/import'

interface ComponentProps {
  // Props with types
}

export function ComponentName({ props }: ComponentProps) {
  // Hooks
  // State
  // Effects
  // Handlers
  // Render
}
```

### Linting

**Configuration:** `eslint.config.mjs`
```javascript
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
```

**Run Command:**
```bash
npm run lint    # Runs ESLint
```

**Enforced Rules:**
- Next.js core web vitals optimizations
- TypeScript strict mode enabled
- Import ordering via eslint-config-next

---

## Import Organization

### Import Order

1. **React imports:** `import { useState, useEffect } from 'react'`
2. **Third-party libraries:** `import { zodResolver } from '@hookform/resolvers/zod'`
3. **UI components:** `import { Button } from '@/components/ui/button'`
4. **Local utilities:** `import { cn } from '@/lib/utils'`
5. **Type imports:** `import type { Metadata } from 'next'`

### Path Aliases

**Configuration in `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Usage:**
- `@/lib/utils` → `src/lib/utils.ts`
- `@/components/ui/button` → `src/components/ui/button.tsx`
- `@/app/layout` → `src/app/layout.tsx`

---

## Error Handling

### Patterns Used

**Try-Catch with Error Messages:**
```tsx
try {
  await signIn(email, password)
  router.push('/')
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : 'Login failed'
  setError(message)
}
```

**Form Submission Error Handling:**
```tsx
const handleSubmitForm = async (data: UnitFormData) => {
  await onSubmit(data)
}

// In component:
onSubmit={handleSubmit(handleSubmitForm)}
```

**API Error Logging:**
```tsx
.catch((error) => {
  console.error('Failed to fetch units:', error)
  // Show error UI
})
```

**Error Display:**
- Form field errors via `error` prop on inputs
- Inline error messages below fields: `<p className="text-sm text-red-600">{error}</p>`
- Error alerts at form/page level

### Loading States

**Pattern:**
```tsx
const [isLoading, setIsLoading] = useState(false)

const handleSubmit = async () => {
  setIsLoading(true)
  try {
    await someAsyncOperation()
  } finally {
    setIsLoading(false)
  }
}
```

**UI Feedback:**
- Loading spinners via `isLoading` prop on Button: `<Button isLoading>Loading</Button>`
- Disabled states during submission

---

## Logging

**Framework:** `console` built-in only

**Patterns Observed:**
```tsx
console.error('Failed to fetch units:', error)
console.error('Failed to create maintenance request:', error)
```

**Guidelines:**
- Use `console.error()` for API failures
- No structured logging framework installed
- No logging library detected (e.g., winston, pino)

---

## Comments

**When to Comment:**
- Minimal inline comments in current codebase
- No JSDoc/TSDoc comments detected on functions

**Documentation:**
- `.planning/` directory contains project documentation
- `.env.example` has inline comments explaining configuration

---

## Function Design

### Size Guidelines

**Observed Patterns:**
- UI components: 50-180 lines
- Utility functions: 5-10 lines
- Form schemas: 10-20 lines

**Example Small Function:**
```tsx
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Parameters

**Pattern:** Object destructuring for props
```tsx
export function UnitForm({
  defaultValues,
  submitLabel,
  onSubmit,
  isLoading,
  disabledUnitNumber = false,
  onCancel,
  className,
}: UnitFormProps) {
```

**Default Values:**
- Use destructuring defaults: `disabledUnitNumber = false`
- Optional chaining: `onChange?.(e.target.value)`

### Return Values

**React Components:** Return JSX directly
**Async Functions:** Return `Promise<void>` or data
**Utility Functions:** Return computed values

---

## Module Design

### Exports

**Pattern:** Named exports preferred
```tsx
export function ComponentName() { }
export const VariableName = ...
export type TypeName = ...
```

**Single Default Export (rare):**
```tsx
export default pocketBase  // For singleton instances
```

### Barrel Files

**Not Used:** Components imported directly from their file paths
- No index.ts barrel files detected
- Direct imports: `import { Button } from '@/components/ui/button'`

---

## Component Patterns

### UI Components (src/components/ui/)

**Standard Props Interface:**
```tsx
interface ComponentProps extends React.HTMLAttributes<ElementType> {
  className?: string
  // Custom props
}
```

**Forward Ref Pattern:**
```tsx
export const ComponentName = forwardRef<ElementType, ComponentProps>(
  ({ className, ...props }, ref) => {
    return <element ref={ref} className={cn(className)} {...props} />
  }
)
ComponentName.displayName = 'ComponentName'
```

**Variant Components (using class-variance-authority):**
```tsx
const buttonVariants = cva('base-classes', {
  variants: {
    variant: { primary: '...', secondary: '...' },
    size: { sm: '...', md: '...', lg: '...' },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
})

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}
```

### Form Components

**Schema Validation (Zod + react-hook-form):**
```tsx
const schema = z.object({
  field: z.string().min(1, 'Required'),
})

type FormData = z.infer<typeof schema>

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues,
})
```

**Error Display:**
```tsx
<Input
  label="Field Name"
  error={errors.field?.message}
  {...register('field')}
/>
{errors.field && <p className="text-red-600">{errors.field.message}</p>}
```

### Layout Components

**AuthGuard Pattern:**
```tsx
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      redirect('/login')
    }
    setChecking(false)
  }, [])

  if (checking) return <LoadingSpinner />
  return <>{children}</>
}
```

**Layout Composition:**
```tsx
export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main>{children}</main>
      </div>
    </AuthGuard>
  )
}
```

---

## Styling Conventions

### Tailwind CSS

**Class Organization:**
- Base classes first, variant classes last
- Use `cn()` utility for conditional classes
- Dark mode classes: `dark:bg-gray-800`

**Pattern:**
```tsx
className={cn(
  'base-classes',
  variant === 'primary' && 'primary-classes',
  error && 'error-classes',
  className
)}
```

### Component Libraries

**Used:**
- `class-variance-authority` for variant management
- `clsx` + `tailwind-merge` via `cn()` utility

---

## File Organization

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── login/             # Login route
│   └── (dashboard)/       # Dashboard route group
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── auth/             # Authentication components
│   ├── layout/           # Layout components
│   └── {feature}/        # Feature-specific components
├── lib/                  # Utilities and configurations
│   ├── utils.ts          # Helper functions
│   ├── pocketbase.ts     # PocketBase client
│   └── AuthProvider.tsx  # Auth context
└── types/                # TypeScript type definitions
    └── pocketbase.ts     # PocketBase record types
```

### File Placement Guidelines

**New UI Component:** `src/components/ui/{name}.tsx`
**New Feature Component:** `src/components/{feature}/{name}.tsx`
**New Page:** `src/app/{route}/page.tsx`
**New Utility:** `src/lib/{name}.ts`
**New Type:** `src/types/{name}.ts`

---

## Commit Conventions

**Not Enforced:** No commitlint or husky detected
**Recommended:** Follow conventional commits for consistency
- `feat: add new feature`
- `fix: patch a bug`
- `docs: update documentation`
- `refactor: code restructuring`

---

## TypeScript Configuration

**`tsconfig.json` Key Settings:**
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "strict": true,
    "esModuleInterop": true,
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

**Strict Mode Enabled:**
- No `any` types allowed
- Proper type inference required
- Type guards for unknown types

---

*Convention analysis: 2026-04-21*
