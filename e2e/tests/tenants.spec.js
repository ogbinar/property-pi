import { test, expect } from '@playwright/test';

const APP_URL = process.env.APP_URL || 'http://localhost:5173';

test.describe('Tenant Management E2E', () => {
  let userEmail = `test${Date.now()}@example.com`;

  test.beforeEach(async ({ page }) => {
    await page.goto(`${APP_URL}/register`);
    await page.fill('#name', 'Test User');
    await page.fill('#email', userEmail);
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(`${APP_URL}/`);
  });

  test('should create tenant with all fields', async ({ page }) => {
    await page.goto(`${APP_URL}/tenants/new`);
    await expect(page.locator('text=Add New Tenant')).toBeVisible();
    
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    await page.fill('input[name="phone"]', '555-123-4567');
    await page.fill('input[name="emergencyContact"]', 'Jane Doe - 555-987-6543');
    
    await page.click('button:has-text("Create Tenant")');
    
    await expect(page).toHaveURL(`${APP_URL}/tenants`);
    await expect(page.locator('text=John Doe')).toBeVisible();
  });

  test('should create tenant with minimal fields', async ({ page }) => {
    await page.goto(`${APP_URL}/tenants/new`);
    
    await page.fill('input[name="firstName"]', 'Jane');
    await page.fill('input[name="lastName"]', 'Smith');
    await page.fill('input[name="email"]', 'jane@example.com');
    
    await page.click('button:has-text("Create Tenant")');
    
    await expect(page).toHaveURL(`${APP_URL}/tenants`);
    await expect(page.locator('text=Jane Smith')).toBeVisible();
  });

  test('should validate required fields on tenant creation', async ({ page }) => {
    await page.goto(`${APP_URL}/tenants/new`);
    
    await page.click('button:has-text("Create Tenant")');
    
    await expect(page.locator('text=First name is required')).toBeVisible();
  });

  test('should list all tenants', async ({ page }) => {
    await page.goto(`${APP_URL}/tenants/new`);
    await page.fill('input[name="firstName"]', 'Tenant');
    await page.fill('input[name="lastName"]', 'One');
    await page.fill('input[name="email"]', 'one@example.com');
    await page.click('button:has-text("Create Tenant")');
    
    await page.goto(`${APP_URL}/tenants/new`);
    await page.fill('input[name="firstName"]', 'Tenant');
    await page.fill('input[name="lastName"]', 'Two');
    await page.fill('input[name="email"]', 'two@example.com');
    await page.click('button:has-text("Create Tenant")');
    
    await page.goto(`${APP_URL}/tenants`);
    
    await expect(page.locator('text=Tenant One')).toBeVisible();
    await expect(page.locator('text=Tenant Two')).toBeVisible();
  });

  test('should view tenant detail', async ({ page }) => {
    await page.goto(`${APP_URL}/tenants/new`);
    await page.fill('input[name="firstName"]', 'Bob');
    await page.fill('input[name="lastName"]', 'Wilson');
    await page.fill('input[name="email"]', 'bob@example.com');
    await page.fill('input[name="phone"]', '555-333-3333');
    await page.click('button:has-text("Create Tenant")');
    
    await page.click('tr:has-text("Bob Wilson")');
    
    await expect(page).toHaveURL(`${APP_URL}/tenants/`);
    await expect(page.locator('text=Bob Wilson')).toBeVisible();
  });

  test('should edit tenant', async ({ page }) => {
    await page.goto(`${APP_URL}/tenants/new`);
    await page.fill('input[name="firstName"]', 'Alice');
    await page.fill('input[name="lastName"]', 'Brown');
    await page.fill('input[name="email"]', 'alice@example.com');
    await page.click('button:has-text("Create Tenant")');
    
    await page.click('tr:has-text("Alice Brown") button:has-text("Edit")');
    
    await page.fill('input[name="phone"]', '555-999-9999');
    await page.click('button:has-text("Save Changes")');
    
    await expect(page.locator('text=555-999-9999')).toBeVisible();
  });

  test('should delete tenant', async ({ page }) => {
    await page.goto(`${APP_URL}/tenants/new`);
    await page.fill('input[name="firstName"]', 'Charlie');
    await page.fill('input[name="lastName"]', 'Davis');
    await page.fill('input[name="email"]', 'charlie@example.com');
    await page.click('button:has-text("Create Tenant")');
    
    await page.click('tr:has-text("Charlie Davis") button:has-text("Delete")');
    
    await expect(page.locator('text=Charlie Davis')).not.toBeVisible();
  });

  test('should navigate from tenant list to detail and back', async ({ page }) => {
    await page.goto(`${APP_URL}/tenants/new`);
    await page.fill('input[name="firstName"]', 'David');
    await page.fill('input[name="lastName"]', 'Lee');
    await page.fill('input[name="email"]', 'david@example.com');
    await page.click('button:has-text("Create Tenant")');
    
    await page.click('tr:has-text("David Lee")');
    await expect(page).toHaveURL(`${APP_URL}/tenants/`);
    
    await page.goBack();
    await expect(page).toHaveURL(`${APP_URL}/tenants`);
  });
});
