import { test, expect } from '@playwright/test';

const APP_URL = process.env.APP_URL || 'http://localhost:5173';

test.describe('Payment Management E2E', () => {
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
    await page.fill('input[name="firstName"]', 'Payment');
    await page.fill('input[name="lastName"]', 'Tenant');
    await page.fill('input[name="email"]', 'payment@example.com');
    await page.click('button:has-text("Create Tenant")');
    
    // Create a lease
    await page.goto(`${APP_URL}/leases/new`);
    await page.selectOption('select[name="tenantId"]', '1');
    await page.selectOption('select[name="unitId"]', '1');
    await page.fill('input[name="monthlyRent"]', '1500');
    await page.fill('input[name="startDate"]', '2026-01-01');
    await page.fill('input[name="endDate"]', '2026-12-31');
    await page.click('button:has-text("Create Lease")');
  });

  test('should view rent collection page', async ({ page }) => {
    await page.goto(`${APP_URL}/rent`);
    await expect(page.locator('text=Rent Tracking')).toBeVisible();
  });

  test('should generate rent records', async ({ page }) => {
    await page.goto(`${APP_URL}/rent`);
    await page.click('#generate-rent-btn');
    
    await expect(page.locator('text=Generated')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Expense Management E2E', () => {
  let userEmail = `test${Date.now()}@example.com`;

  test.beforeEach(async ({ page }) => {
    await page.goto(`${APP_URL}/register`);
    await page.fill('#name', 'Test User');
    await page.fill('#email', userEmail);
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(`${APP_URL}/`);
  });

  test('should create expense', async ({ page }) => {
    await page.goto(`${APP_URL}/expenses/new`);
    await expect(page.locator('text=Add New Expense')).toBeVisible();
    
    await page.fill('input[name="title"]', 'Plumbing Repair');
    await page.selectOption('select[name="category"]', 'repairs');
    await page.fill('input[name="amount"]', '250');
    await page.fill('input[name="expenseDate"]', '2026-01-15');
    await page.selectOption('select[name="paymentMethod"]', 'credit_card');
    
    await page.click('button:has-text("Create Expense")');
    
    await expect(page).toHaveURL(`${APP_URL}/expenses`);
    await expect(page.locator('text=Plumbing Repair')).toBeVisible();
  });

  test('should create expense with minimal fields', async ({ page }) => {
    await page.goto(`${APP_URL}/expenses/new`);
    
    await page.fill('input[name="title"]', 'Quick Expense');
    await page.fill('input[name="amount"]', '50');
    
    await page.click('button:has-text("Create Expense")');
    
    await expect(page).toHaveURL(`${APP_URL}/expenses`);
    await expect(page.locator('text=Quick Expense')).toBeVisible();
  });

  test('should list all expenses', async ({ page }) => {
    await page.goto(`${APP_URL}/expenses/new`);
    await page.fill('input[name="title"]', 'Expense One');
    await page.fill('input[name="amount"]', '100');
    await page.click('button:has-text("Create Expense")');
    
    await page.goto(`${APP_URL}/expenses/new`);
    await page.fill('input[name="title"]', 'Expense Two');
    await page.fill('input[name="amount"]', '200');
    await page.click('button:has-text("Create Expense")');
    
    await page.goto(`${APP_URL}/expenses`);
    
    await expect(page.locator('text=Expense One')).toBeVisible();
    await expect(page.locator('text=Expense Two')).toBeVisible();
  });

  test('should view expense detail', async ({ page }) => {
    await page.goto(`${APP_URL}/expenses/new`);
    await page.fill('input[name="title"]', 'HVAC Maintenance');
    await page.fill('input[name="amount"]', '300');
    await page.click('button:has-text("Create Expense")');
    
    await page.click('tr:has-text("HVAC Maintenance")');
    
    await expect(page).toHaveURL(`${APP_URL}/expenses/`);
    await expect(page.locator('text=HVAC Maintenance')).toBeVisible();
  });

  test('should edit expense', async ({ page }) => {
    await page.goto(`${APP_URL}/expenses/new`);
    await page.fill('input[name="title"]', 'Original Expense');
    await page.fill('input[name="amount"]', '100');
    await page.click('button:has-text("Create Expense")');
    
    await page.click('tr:has-text("Original Expense") button:has-text("Edit")');
    
    await page.fill('input[name="amount"]', '150');
    await page.click('button:has-text("Save Changes")');
    
    await expect(page.locator('text=$150')).toBeVisible();
  });

  test('should delete expense', async ({ page }) => {
    await page.goto(`${APP_URL}/expenses/new`);
    await page.fill('input[name="title"]', 'To Be Deleted');
    await page.fill('input[name="amount"]', '75');
    await page.click('button:has-text("Create Expense")');
    
    await page.click('tr:has-text("To Be Deleted") button:has-text("Delete")');
    
    await expect(page.locator('text=To Be Deleted')).not.toBeVisible();
  });
});

test.describe('Maintenance Management E2E', () => {
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
  });

  test('should create maintenance request', async ({ page }) => {
    await page.goto(`${APP_URL}/maintenance/new`);
    await expect(page.locator('text=Add New Maintenance Request')).toBeVisible();
    
    await page.selectOption('select[name="unitId"]', '1');
    await page.fill('input[name="requesterName"]', 'John Tenant');
    await page.fill('input[name="description"]', 'Leaky faucet in kitchen');
    await page.selectOption('select[name="priority"]', 'medium');
    
    await page.click('button:has-text("Create Request")');
    
    await expect(page).toHaveURL(`${APP_URL}/maintenance`);
    await expect(page.locator('text=Leaky faucet')).toBeVisible();
  });

  test('should create maintenance request with minimal fields', async ({ page }) => {
    await page.goto(`${APP_URL}/maintenance/new`);
    
    await page.selectOption('select[name="unitId"]', '1');
    await page.fill('input[name="description"]', 'Quick request');
    
    await page.click('button:has-text("Create Request")');
    
    await expect(page).toHaveURL(`${APP_URL}/maintenance`);
    await expect(page.locator('text=Quick request')).toBeVisible();
  });

  test('should list all maintenance requests', async ({ page }) => {
    await page.goto(`${APP_URL}/maintenance/new`);
    await page.selectOption('select[name="unitId"]', '1');
    await page.fill('input[name="description"]', 'Request One');
    await page.click('button:has-text("Create Request")');
    
    await page.goto(`${APP_URL}/maintenance/new`);
    await page.selectOption('select[name="unitId"]', '1');
    await page.fill('input[name="description"]', 'Request Two');
    await page.click('button:has-text("Create Request")');
    
    await page.goto(`${APP_URL}/maintenance`);
    
    await expect(page.locator('text=Request One')).toBeVisible();
    await expect(page.locator('text=Request Two')).toBeVisible();
  });

  test('should view maintenance detail', async ({ page }) => {
    await page.goto(`${APP_URL}/maintenance/new`);
    await page.selectOption('select[name="unitId"]', '1');
    await page.fill('input[name="description"]', 'Broken heater');
    await page.selectOption('select[name="priority"]', 'high');
    await page.click('button:has-text("Create Request")');
    
    await page.click('tr:has-text("Broken heater")');
    
    await expect(page).toHaveURL(`${APP_URL}/maintenance/`);
    await expect(page.locator('text=Broken heater')).toBeVisible();
  });

  test('should update maintenance status', async ({ page }) => {
    await page.goto(`${APP_URL}/maintenance/new`);
    await page.selectOption('select[name="unitId"]', '1');
    await page.fill('input[name="description"]', 'To be updated');
    await page.selectOption('select[name="status"]', 'open');
    await page.click('button:has-text("Create Request")');
    
    await page.click('tr:has-text("To be updated") button:has-text("Edit")');
    
    await page.selectOption('select[name="status"]', 'in_progress');
    await page.click('button:has-text("Save Changes")');
    
    await expect(page.locator('text=In Progress')).toBeVisible();
  });

  test('should delete maintenance request', async ({ page }) => {
    await page.goto(`${APP_URL}/maintenance/new`);
    await page.selectOption('select[name="unitId"]', '1');
    await page.fill('input[name="description"]', 'To Be Deleted');
    await page.click('button:has-text("Create Request")');
    
    await page.click('tr:has-text("To Be Deleted") button:has-text("Delete")');
    
    await expect(page.locator('text=To Be Deleted')).not.toBeVisible();
  });
});
