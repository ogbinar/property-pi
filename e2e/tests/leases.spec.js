import { test, expect } from '@playwright/test';

const APP_URL = process.env.APP_URL || 'http://localhost:5173';

test.describe('Lease Management E2E', () => {
  let userEmail = `test${Date.now()}@example.com`;

  test.beforeEach(async ({ page }) => {
    await page.goto(`${APP_URL}/register`);
    await page.fill('#name', 'Test User');
    await page.fill('#email', userEmail);
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(`${APP_URL}/`);
    
    // Create a unit
    await page.goto(`${APP_URL}/units/new`);
    await page.fill('input[name="unitNumber"]', '101');
    await page.selectOption('select[name="type"]', '1BR');
    await page.fill('input[name="rentAmount"]', '1500');
    await page.fill('input[name="securityDeposit"]', '1500');
    await page.click('button:has-text("Create Unit")');
    
    // Create a tenant
    await page.goto(`${APP_URL}/tenants/new`);
    await page.fill('input[name="firstName"]', 'Lease');
    await page.fill('input[name="lastName"]', 'Tenant');
    await page.fill('input[name="email"]', 'lease@example.com');
    await page.click('button:has-text("Create Tenant")');
  });

  test('should create lease with all fields', async ({ page }) => {
    await page.goto(`${APP_URL}/leases/new`);
    await expect(page.locator('text=Add New Lease')).toBeVisible();
    
    await page.selectOption('select[name="tenantId"]', '1');
    await page.selectOption('select[name="unitId"]', '1');
    await page.fill('input[name="monthlyRent"]', '1500');
    await page.fill('input[name="startDate"]', '2026-01-01');
    await page.fill('input[name="endDate"]', '2026-12-31');
    
    await page.click('button:has-text("Create Lease")');
    
    await expect(page).toHaveURL(`${APP_URL}/leases`);
    await expect(page.locator('text=Lease Tenant')).toBeVisible();
  });

  test('should create lease with minimal fields', async ({ page }) => {
    await page.goto(`${APP_URL}/leases/new`);
    
    await page.selectOption('select[name="tenantId"]', '1');
    await page.selectOption('select[name="unitId"]', '1');
    await page.fill('input[name="monthlyRent"]', '1500');
    await page.fill('input[name="startDate"]', '2026-01-01');
    await page.fill('input[name="endDate"]', '2026-06-30');
    
    await page.click('button:has-text("Create Lease")');
    
    await expect(page).toHaveURL(`${APP_URL}/leases`);
    await expect(page.locator('text=Lease Tenant')).toBeVisible();
  });

  test('should validate required fields on lease creation', async ({ page }) => {
    await page.goto(`${APP_URL}/leases/new`);
    
    await page.click('button:has-text("Create Lease")');
    
    await expect(page.locator('text=Tenant is required')).toBeVisible();
  });

  test('should list all leases', async ({ page }) => {
    await page.goto(`${APP_URL}/leases/new`);
    await page.selectOption('select[name="tenantId"]', '1');
    await page.selectOption('select[name="unitId"]', '1');
    await page.fill('input[name="monthlyRent"]', '1500');
    await page.fill('input[name="startDate"]', '2026-01-01');
    await page.fill('input[name="endDate"]', '2026-06-30');
    await page.click('button:has-text("Create Lease")');
    
    await page.goto(`${APP_URL}/leases/new`);
    await page.selectOption('select[name="tenantId"]', '1');
    await page.selectOption('select[name="unitId"]', '1');
    await page.fill('input[name="monthlyRent"]', '1600');
    await page.fill('input[name="startDate"]', '2026-07-01');
    await page.fill('input[name="endDate"]', '2026-12-31');
    await page.click('button:has-text("Create Lease")');
    
    await page.goto(`${APP_URL}/leases`);
    
    await expect(page.locator('text=Lease Tenant')).toBeVisible();
  });

  test('should view lease detail', async ({ page }) => {
    await page.goto(`${APP_URL}/leases/new`);
    await page.selectOption('select[name="tenantId"]', '1');
    await page.selectOption('select[name="unitId"]', '1');
    await page.fill('input[name="monthlyRent"]', '1500');
    await page.fill('input[name="startDate"]', '2026-01-01');
    await page.fill('input[name="endDate"]', '2026-12-31');
    await page.click('button:has-text("Create Lease")');
    
    await page.click('tr:has-text("Lease Tenant")');
    
    await expect(page).toHaveURL(`${APP_URL}/leases/`);
    await expect(page.locator('text=Lease Tenant')).toBeVisible();
  });

  test('should edit lease', async ({ page }) => {
    await page.goto(`${APP_URL}/leases/new`);
    await page.selectOption('select[name="tenantId"]', '1');
    await page.selectOption('select[name="unitId"]', '1');
    await page.fill('input[name="monthlyRent"]', '1500');
    await page.fill('input[name="startDate"]', '2026-01-01');
    await page.fill('input[name="endDate"]', '2026-06-30');
    await page.click('button:has-text("Create Lease")');
    
    await page.click('tr:has-text("Lease Tenant") button:has-text("Edit")');
    
    await page.fill('input[name="monthlyRent"]', '1700');
    await page.click('button:has-text("Save Changes")');
    
    await expect(page.locator('text=$1,700')).toBeVisible();
  });

  test('should delete lease', async ({ page }) => {
    await page.goto(`${APP_URL}/leases/new`);
    await page.selectOption('select[name="tenantId"]', '1');
    await page.selectOption('select[name="unitId"]', '1');
    await page.fill('input[name="monthlyRent"]', '1500');
    await page.fill('input[name="startDate"]', '2026-01-01');
    await page.fill('input[name="endDate"]', '2026-12-31');
    await page.click('button:has-text("Create Lease")');
    
    await page.click('tr:has-text("Lease Tenant") button:has-text("Delete")');
    
    await expect(page.locator('text=Lease Tenant')).not.toBeVisible();
  });

  test('should generate share link for lease', async ({ page }) => {
    await page.goto(`${APP_URL}/leases/new`);
    await page.selectOption('select[name="tenantId"]', '1');
    await page.selectOption('select[name="unitId"]', '1');
    await page.fill('input[name="monthlyRent"]', '1500');
    await page.fill('input[name="startDate"]', '2026-01-01');
    await page.fill('input[name="endDate"]', '2026-12-31');
    await page.click('button:has-text("Create Lease")');
    
    await page.click('tr:has-text("Lease Tenant")');
    
    await expect(page.locator('text=Share Link')).toBeVisible();
  });
});
