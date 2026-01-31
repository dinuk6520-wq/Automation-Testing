import { test, expect, Page } from '@playwright/test';

// Use baseURL to simplify navigation
test.use({ baseURL: 'https://www.saucedemo.com' });

async function login(page: Page, username = 'standard_user', password = 'secret_sauce') {
  await page.goto('/');
  await page.locator('#user-name').fill(username);
  await page.locator('#password').fill(password);
  await page.locator('#login-button').click();
  await page.waitForLoadState('networkidle');
}

test.describe('SauceDemo E2E - required scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Log in with valid credentials', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/inventory.html/);
    await expect(page.locator('.inventory_list')).toBeVisible();
  });

  test('Login with invalid credentials', async ({ page }) => {
    await page.goto('/');
    await page.locator('#user-name').fill('invalid_user');
    await page.locator('#password').fill('wrong_pass');
    await page.locator('#login-button').click();
    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText('Username and password');
  });

  test('Product listing validation', async ({ page }) => {
    await login(page);

    const products = page.locator('.inventory_item');
    await expect(products).toHaveCount(6);

    const first = products.first();
    await expect(first.locator('.inventory_item_name')).toBeVisible();
    await expect(first.locator('.inventory_item_desc')).toBeVisible();
    await expect(first.locator('.inventory_item_price')).toBeVisible();
  });

  test('Add product(s) to cart', async ({ page }) => {
    await login(page);

    await page.locator('button[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('button[data-test="add-to-cart-sauce-labs-bike-light"]').click();

    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');
  });

  test('Cart content validation', async ({ page }) => {
    await login(page);

    await page.locator('button[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('.shopping_cart_link').click();

    const cartItems = page.locator('.cart_item');
    await expect(cartItems).toHaveCount(1);
    await expect(cartItems.locator('.inventory_item_name')).toHaveText('Sauce Labs Backpack');
  });

  test('Checkout flow (basic happy path)', async ({ page }) => {
    await login(page);

    await page.locator('button[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('.shopping_cart_link').click();

    await page.locator('button[data-test="checkout"]').click();
    await page.locator('input[data-test="firstName"]').fill('DINESH');
    await page.locator('input[data-test="lastName"]').fill('K');
    await page.locator('input[data-test="postalCode"]').fill('12345');
    await page.locator('input[data-test="continue"]').click();
    await page.locator('button[data-test="finish"]').click();

    await expect(page.locator('.complete-header')).toContainText('Thank you for your order');
  });

  test('Logout (optional)', async ({ page }) => {
    await login(page);

    await page.locator('#react-burger-menu-btn').click();
    await page.locator('#logout_sidebar_link').click();
    await expect(page.locator('#login-button')).toBeVisible();
  });
});
