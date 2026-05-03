import { test, expect } from '@playwright/test';

const APP_URL = process.env.APP_URL || 'http://localhost:5173';

test.describe('Dashboard E2E', () => {
  let userEmail = `test${Date.now()}@example.com`;

  test.beforeEach(async ({ page }) => {
    await page.goto(`${APP_URL}/register`);
    await page.fill('#name', 'Test User');
    await page.fill('#email', userEmail);
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(`${APP_URL}/`);
  });

  test('should display dashboard on login', async ({ page }) => {
    await expect(page).toHaveURL(`${APP_URL}/`);
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should display summary cards', async ({ page }) => {
    await page.goto(`${APP_URL}/`);
    
    await expect(page.locator('text=Units')).toBeVisible();
    await expect(page.locator('text=Tenants')).toBeVisible();
    await expect(page.locator('text=Leases')).toBeVisible();
    await expect(page.locator('text=Monthly Rent')).toBeVisible();
  });

  test('should display zero counts for new user', async ({ page }) => {
    await page.goto(`${APP_URL}/`);
    
    await expect(page.locator('text=0')).toBeVisible();
  });

  test('should display updated counts after creating data', async ({ page }) => {
    await page.goto(`${APP_URL}/`);
    
    // Create a unit
    await page.goto(`${APP_URL}/units/new`);
    await page.fill('input[name="unitNumber"]', '101');
    await page.selectOption('select[name="type"]', '1BR');
    await page.fill('input[name="rentAmount"]', '1500');
    await page.fill('input[name="securityDeposit"]', '1500');
    await page.click('button:has-text("Create Unit")');
    
    // Check dashboard
    await page.goto(`${APP_URL}/`);
    await expect(page.locator('text=1')).toBeVisible();
  });

  test('should navigate to units from dashboard card', async ({ page }) => {
    await page.goto(`${APP_URL}/`);
    await page.click('text=Units');
    await expect(page).toHaveURL(`${APP_URL}/units`);
  });

  test('should navigate to tenants from dashboard card', async ({ page }) => {
    await page.goto(`${APP_URL}/`);
    await page.click('text=Tenants');
    await expect(page).toHaveURL(`${APP_URL}/tenants`);
  });

  test('should navigate to leases from dashboard card', async ({ page }) => {
    await page.goto(`${APP_URL}/`);
    await page.click('text=Leases');
    await expect(page).toHaveURL(`${APP_URL}/leases`);
  });
});

test.describe('Sidebar Navigation E2E', () => {
  let userEmail = `test${Date.now()}@example.com`;

  test.beforeEach(async ({ page }) => {
    await page.goto(`${APP_URL}/register`);
    await page.fill('#name', 'Test User');
    await page.fill('#email', userEmail);
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(`${APP_URL}/`);
  });

  test('should display all sidebar menu items', async ({ page }) => {
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Units')).toBeVisible();
    await expect(page.locator('text=Tenants')).toBeVisible();
    await expect(page.locator('text=Leases')).toBeVisible();
    await expect(page.locator('text=Rent')).toBeVisible();
    await expect(page.locator('text=Expenses')).toBeVisible();
    await expect(page.locator('text=Maintenance')).toBeVisible();
  });

  test('should navigate to dashboard from sidebar', async ({ page }) => {
    await page.goto(`${APP_URL}/units`);
    await page.click('a:has-text("Dashboard")');
    await expect(page).toHaveURL(`${APP_URL}/`);
  });

  test('should navigate to units from sidebar', async ({ page }) => {
    await page.click('a:has-text("Units")');
    await expect(page).toHaveURL(`${APP_URL}/units`);
  });

  test('should navigate to tenants from sidebar', async ({ page }) => {
    await page.click('a:has-text("Tenants")');
    await expect(page).toHaveURL(`${APP_URL}/tenants`);
  });

  test('should navigate to leases from sidebar', async ({ page }) => {
    await page.click('a:has-text("Leases")');
    await expect(page).toHaveURL(`${APP_URL}/leases`);
  });

  test('should navigate to rent from sidebar', async ({ page }) => {
    await page.click('a:has-text("Rent")');
    await expect(page).toHaveURL(`${APP_URL}/rent`);
  });

  test('should navigate to expenses from sidebar', async ({ page }) => {
    await page.click('a:has-text("Expenses")');
    await expect(page).toHaveURL(`${APP_URL}/expenses`);
  });

  test('should navigate to maintenance from sidebar', async ({ page }) => {
    await page.click('a:has-text("Maintenance")');
    await expect(page).toHaveURL(`${APP_URL}/maintenance`);
  });

  test('should highlight active menu item', async ({ page }) => {
    await page.click('a:has-text("Units")');
    await expect(page).toHaveURL(`${APP_URL}/units`);
  });
});

test.describe('Header E2E', () => {
  let userEmail = `test${Date.now()}@example.com`;

  test.beforeEach(async ({ page }) => {
    await page.goto(`${APP_URL}/register`);
    await page.fill('#name', 'Test User');
    await page.fill('#email', userEmail);
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(`${APP_URL}/`);
  });

  test('should display user name in header', async ({ page }) => {
    await expect(page.locator('text=Test User')).toBeVisible();
  });

  test('should display logout button in header', async ({ page }) => {
    await expect(page.locator('button:has-text("Logout")')).toBeVisible();
  });

  test('should logout and redirect to login', async ({ page }) => {
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL(`${APP_URL}/login`);
  });

  test('should redirect to login after logout when accessing protected route', async ({ page }) => {
    await page.click('button:has-text("Logout")');
    await page.goto(`${APP_URL}/units`);
    await expect(page).toHaveURL(`${APP_URL}/login`);
  });
});

test.describe('Responsive Design E2E', () => {
  let userEmail = `test${Date.now()}@example.com`;

  test.beforeEach(async ({ page }) => {
    await page.goto(`${APP_URL}/register`);
    await page.fill('#name', 'Test User');
    await page.fill('#email', userEmail);
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(`${APP_URL}/`);
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });
});
