---
status: testing
phase: 04-tenant-portal
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md]
started: 2026-04-23T00:00:00Z
updated: 2026-04-23T00:00:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 1
name: Tenant Portal Page Loads
expected: |
  Navigate to /tenant/portal with a valid token (leaseId:secret format).
  Page should display:
  - Lease details card with tenant name, unit, lease period
  - Tab navigation (Overview, Payments, Maintenance, Notices)
  - No authentication required (token-based access)
awaiting: user response

## Tests

### 1. Tenant Portal Page Loads
expected: Navigate to /tenant/portal?token={leaseId}:{secret}. Page displays lease details, tab navigation, no login required.
result: pending

### 2. Tenant Sidebar Navigation
expected: Sidebar shows navigation links (Overview, Payments, Maintenance, Notices). Clicking links updates content without page reload.
result: pending

### 3. View Payment History
expected: Click "Payments" tab. Page shows payment history table with dates, amounts, status (paid/unpaid/overdue).
result: pending

### 4. Submit Maintenance Request
expected: Click "Maintenance" tab, fill form with description, select unit, submit. Request appears in maintenance list.
result: pending

### 5. View Maintenance Status
expected: Maintenance requests show status (open, in-progress, completed). Status updates reflect in real-time.
result: pending

### 6. Generate Tenant Access Link (Landlord)
expected: Landlord navigates to lease detail page, clicks "Share Tenant Link" button. Link generates and displays in modal.
result: pending

### 7. Copy Tenant Access Link
expected: Clicking copy button on generated link copies to clipboard. Confirmation message shows.
result: pending

### 8. Regenerate Tenant Access Link
expected: Click "Regenerate" button. New token generated, old link invalidated. Old link no longer works.
result: pending

### 9. Invalid Token Handling
expected: Navigate to /tenant/portal with invalid/expired token. Error message displays: "Invalid or expired access link".
result: pending

### 10. Tenant Portal Data Accuracy
expected: All data shown (lease, payments, maintenance) matches landlord's view. No data leakage between tenants.
result: pending

## Summary

total: 10
passed: 0
issues: 0
pending: 10
skipped: 0

## Gaps

[none yet]
