import { type Page, expect } from "@playwright/test";

// Test user credentials - loaded from e2e/.env via playwright.config.ts
export const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || "test@catalyst.crashbytes.com",
  password: process.env.TEST_USER_PASSWORD || "TestPassword123!",
  firstName: "Test",
  lastName: "User",
};

// Stripe test card
export const STRIPE_TEST_CARD = {
  number: "4242424242424242",
  expiry: "12/30",
  cvc: "123",
  zip: "10001",
};

/**
 * Sign in via Clerk's sign-in page.
 */
export async function signIn(page: Page) {
  await page.goto("/sign-in");
  await page.waitForTimeout(2000);

  // Fill email
  const emailInput = page.locator('input[name="identifier"]');
  await emailInput.waitFor({ timeout: 10000 });
  await emailInput.fill(TEST_USER.email);

  // Click the primary continue button (not social buttons)
  await page
    .getByRole("button", { name: "Continue", exact: true })
    .click();

  // Enter password
  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.waitFor({ timeout: 10000 });
  await passwordInput.fill(TEST_USER.password);

  // Click continue to sign in
  await page
    .getByRole("button", { name: "Continue", exact: true })
    .click();

  // Wait for redirect to dashboard
  await page.waitForURL("**/dashboard**", { timeout: 15000 });
}

/**
 * Ensure the user is authenticated - sign in if not.
 */
export async function ensureAuthenticated(page: Page) {
  await page.goto("/dashboard");
  await page.waitForTimeout(2000);

  // If redirected to sign-in, perform sign in
  if (page.url().includes("sign-in")) {
    await signIn(page);
  }

  await expect(page).toHaveURL(/dashboard/);
}

/**
 * Fill Stripe checkout form with test card.
 */
export async function fillStripeCheckout(page: Page) {
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 15000 });
  await page.waitForTimeout(3000);

  // Fill email if present
  const emailField = page.locator("#email");
  if (await emailField.isVisible()) {
    await emailField.fill(TEST_USER.email);
  }

  // Card number iframe
  const cardFrame = page
    .frameLocator('iframe[title*="card number"]')
    .first();
  if (await page.locator('iframe[title*="card number"]').isVisible()) {
    await cardFrame
      .locator('input[name="cardnumber"]')
      .fill(STRIPE_TEST_CARD.number);
  }

  // Expiry iframe
  const expiryFrame = page
    .frameLocator('iframe[title*="expiration"]')
    .first();
  if (await page.locator('iframe[title*="expiration"]').isVisible()) {
    await expiryFrame
      .locator('input[name="exp-date"]')
      .fill(STRIPE_TEST_CARD.expiry);
  }

  // CVC iframe
  const cvcFrame = page.frameLocator('iframe[title*="CVC"]').first();
  if (await page.locator('iframe[title*="CVC"]').isVisible()) {
    await cvcFrame.locator('input[name="cvc"]').fill(STRIPE_TEST_CARD.cvc);
  }

  // Cardholder name
  const nameInput = page.locator("#billingName");
  if (await nameInput.isVisible()) {
    await nameInput.fill(`${TEST_USER.firstName} ${TEST_USER.lastName}`);
  }

  // ZIP
  const zipInput = page.locator("#billingPostalCode");
  if (await zipInput.isVisible()) {
    await zipInput.fill(STRIPE_TEST_CARD.zip);
  }

  // Subscribe
  await page.getByRole("button", { name: /subscribe/i }).first().click();

  // Wait for redirect back
  await page.waitForURL(/dashboard\/billing/, { timeout: 30000 });
}
