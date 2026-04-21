---
status: testing
phase: 03-core-data
source: [03-SUMMARY.md]
started: 2026-04-22T23:55:00Z
updated: 2026-04-22T23:55:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 1
name: Dashboard Page Loads with Aggregated Data
expected: |
  Navigate to /dashboard. Page should display aggregated counts from PocketBase:
  - Total units count
  - Total tenants count
  - Active leases count
  - Dashboard widgets show data without errors
  - No console errors related to data fetching
awaiting: user response

## Tests

### 1. Dashboard Page Loads with Aggregated Data
expected: Navigate to /dashboard. Page should display aggregated counts from PocketBase: total units, tenants, active leases. No console errors.
result: pending

### 2. Units List Displays All Units
expected: Navigate to /units. Page should show all units from PocketBase in a table/list format with unit details (name, type, status, rent amount).
result: pending

### 3. Create New Unit
expected: Click "New Unit" button, fill form with unit details, submit. New unit should appear in units list and be persisted in PocketBase.
result: pending

### 4. Edit Existing Unit
expected: Click edit on a unit, modify details (e.g., rent amount, status), save. Changes should reflect in the list and persist.
result: pending

### 5. Tenants List Displays All Tenants
expected: Navigate to /tenants. Page should show all tenants with their details (name, email, phone, current unit assignment).
result: pending

### 6. Create New Tenant
expected: Click "New Tenant", fill form with tenant details, optionally assign to a unit, submit. New tenant appears in list and persists.
result: pending

### 7. Leases List Displays Active Leases
expected: Navigate to /leases. Page should show lease records with tenant name, unit, start date, end date, status.
result: pending

### 8. Rent Page Shows Rent Records
expected: Navigate to /rent. Page should display rent records with tenant, unit, amount, period, status (paid/unpaid/overdue).
result: pending

### 9. Expenses List Displays All Expenses
expected: Navigate to /expenses. Page should show expense records with category, amount, date, description, unit association.
result: pending

### 10. Maintenance List Displays Requests
expected: Navigate to /maintenance. Page should show maintenance requests with unit, tenant, description, priority, status.
result: pending

### 11. Authentication Works (Login/Logout)
expected: Login with PocketBase credentials succeeds, user is redirected to dashboard. Logout clears session and redirects to login.
result: pending

### 12. FastAPI Health Check Endpoint
expected: GET /api/health returns 200 with status "ok" and PocketBase connectivity confirmed.
result: pending

### 13. FastAPI Dashboard Aggregation Endpoint
expected: GET /api/dashboard returns aggregated counts matching what frontend displays.
result: pending

## Summary

total: 13
passed: 0
issues: 0
pending: 13
skipped: 0

## Gaps

[none yet]
