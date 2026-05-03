import { test, expect } from '@playwright/test';

const APP_URL = process.env.APP_URL || 'http://localhost:5173';

test.describe('Unit Management E2E', () => {
  let userEmail = `test${Date.now()}@example.com`;

  test.beforeEach(async ({ page }) => {
    await page.goto(`${APP_URL}/register`);
    await page.fill('#name', 'Test User');
    await page.fill('#email', userEmail);
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(`${APP_URL}/`);
  });

  test('should create unit with all fields', async ({ page }) => {
    await page.goto(`${APP_URL}/units/new`);
    await expect(page.locator('text=Add New Unit')).toBeVisible();
    
    await page.fill('input[name="unitNumber"]', '101');
    await page.selectOption('select[name="type"]', '1BR');
    await page.fill('input[name="rentAmount"]', '1200');
    await page.fill('input[name="securityDeposit"]', '1200');
    
    await page.click('button:has-text("Create Unit")');
    
    await expect(page).toHaveURL(`${APP_URL}/units`);
    await expect(page.locator('text=101')).toBeVisible();
  });

  test('should create unit with minimal fields', async ({ page }) => {
    await page.goto(`${APP_URL}/units/new`);
    
    await page.fill('input[name="unitNumber"]', '202');
    await page.selectOption('select[name="type"]', 'Studio');
    await page.fill('input[name="rentAmount"]', '800');
    await page.fill('input[name="securityDeposit"]', '800');
    
    await page.click('button:has-text("Create Unit")');
    
    await expect(page).toHaveURL(`${APP_URL}/units`);
    await expect(page.locator('text=202')).toBeVisible();
  });

  test('should validate required fields on unit creation', async ({ page }) => {
    await page.goto(`${APP_URL}/units/new`);
    
    await page.click('button:has-text("Create Unit")');
    
    await expect(page.locator('text=Unit number is required')).toBeVisible();
  });

  test('should list all units', async ({ page }) => {
    // Create multiple units
    await page.goto(`${APP_URL}/units/new`);
    await page.fill('input[name="unitNumber"]', '301');
    await page.selectOption('select[name="type"]', '2BR');
    await page.fill('input[name="rentAmount"]', '1500');
    await page.fill('input[name="securityDeposit"]', '1500');
    await page.click('button:has-text("Create Unit")');
    
    await page.goto(`${APP_URL}/units/new`);
    await page.fill('input[name="unitNumber"]', '302');
    await page.selectOption('select[name="type"]', '2BR');
    await page.fill('input[name="rentAmount"]', '1600');
    await page.fill('input[name="securityDeposit"]', '1600');
    await page.click('button:has-text("Create Unit")');
    
    await page.goto(`${APP_URL}/units`);
    
    await expect(page.locator('text=301')).toBeVisible();
    await expect(page.locator('text=302')).toBeVisible();
  });

  test('should view unit detail', async ({ page }) => {
    await page.goto(`${APP_URL}/units/new`);
    await page.fill('input[name="unitNumber"]', '401');
    await page.selectOption('select[name="type"]', '3BR');
    await page.fill('input[name="rentAmount"]', '2000');
    await page.fill('input[name="securityDeposit"]', '2000');
    await page.click('button:has-text("Create Unit")');
    
    await page.click('tr:has-text("401")');
    
    await expect(page).toHaveURL(`${APP_URL}/units/`);
    await expect(page.locator('text=401')).toBeVisible();
  });

  test('should edit unit', async ({ page }) => {
    await page.goto(`${APP_URL}/units/new`);
    await page.fill('input[name="unitNumber"]', '501');
    await page.selectOption('select[name="type"]', '1BR');
    await page.fill('input[name="rentAmount"]', '1000');
    await page.fill('input[name="securityDeposit"]', '1000');
    await page.click('button:has-text("Create Unit")');
    
    await page.click('tr:has-text("501") button:has-text("Edit")');
    
    await page.fill('input[name="rentAmount"]', '1200');
    await page.fill('input[name="securityDeposit"]', '1200');
    await page.click('button:has-text("Save Changes")');
    
    await expect(page.locator('text=$1,200')).toBeVisible();
  });

  test('should delete unit', async ({ page }) => {
    await page.goto(`${APP_URL}/units/new`);
    await page.fill('input[name="unitNumber"]', '601');
    await page.selectOption('select[name="type"]', 'Studio');
    await page.fill('input[name="rentAmount"]', '900');
    await page.fill('input[name="securityDeposit"]', '900');
    await page.click('button:has-text("Create Unit")');
    
    await page.click('tr:has-text("601") button:has-text("Delete")');
    
    await expect(page.locator('text=601')).not.toBeVisible();
  });

  test('should navigate from unit list to detail and back', async ({ page }) => {
    await page.goto(`${APP_URL}/units/new`);
    await page.fill('input[name="unitNumber"]', '701');
    await page.selectOption('select[name="type"]', '1BR');
    await page.fill('input[name="rentAmount"]', '1100');
    await page.fill('input[name="securityDeposit"]', '1100');
    await page.click('button:has-text("Create Unit")');
    
    await page.click('tr:has-text("701")');
    await expect(page).toHaveURL(`${APP_URL}/units/`);
    
    await page.goBack();
    await expect(page).toHaveURL(`${APP_URL}/units`);
  });
});
