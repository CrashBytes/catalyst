import { type Page, expect } from "@playwright/test";

// Test user credentials - set these in environment or use Clerk test mode
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
 * Clerk renders its own UI inside an iframe or shadow DOM,
 * so we use the Clerk-specific selectors.
 */
export async function signIn(page: Page) {
  await page.goto("/sign-in");
  await page.waitForTimeout(2000); // Wait for Clerk to load

  // Clerk renders in the page - find the email input
  const emailInput = page.locator('input[name="identifier"]');
  await emailInput.waitFor({ timeout: 10000 });
  await emailInput.fill(TEST_USER.email);

  // Click continue
  const continueButton = page.getByRole("button", {
    name: /continue/i,
  });
  await continueButton.click();

  // Enter password
  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.waitFor({ timeout: 10000 });
  await passwordInput.fill(TEST_USER.password);

  // Click sign in
  const signInButton = page.getByRole("button", {
    name: /continue/i,
  });
  await signInButton.click();

  // Wait for redirect to dashboard
  await page.waitForURL("**/dashboard**", { timeout: 15000 });
}

/**
 * Sign up a new user via Clerk.
 */
export async function signUp(page: Page) {
  await page.goto("/sign-up");
  await page.waitForTimeout(2000);

  const emailInput = page.locator('input[name="emailAddress"]');
  await emailInput.waitFor({ timeout: 10000 });
  await emailInput.fill(TEST_USER.email);

  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill(TEST_USER.password);

  const firstNameInput = page.locator('input[name="firstName"]');
  if (await firstNameInput.isVisible()) {
    await firstNameInput.fill(TEST_USER.firstName);
  }

  const lastNameInput = page.locator('input[name="lastName"]');
  if (await lastNameInput.isVisible()) {
    await lastNameInput.fill(TEST_USER.lastName);
  }

  const continueButton = page.getByRole("button", { name: /continue/i });
  await continueButton.click();

  // May need to verify email - in test mode Clerk may auto-verify
  await page.waitForURL("**/dashboard**", { timeout: 30000 });
}

/**
 * Ensure the user is authenticated - sign in if not.
 */
export async function ensureAuthenticated(page: Page) {
  await page.goto("/dashboard");
  await page.waitForTimeout(1000);

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
  // Stripe Checkout is on a different domain
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 15000 });

  // Wait for the form to load
  await page.waitForTimeout(3000);

  // Fill email if present
  const emailField = page.locator('input[name="email"]');
  if (await emailField.isVisible()) {
    await emailField.fill(TEST_USER.email);
  }

  // Fill card number - Stripe uses iframes
  const cardFrame = page.frameLocator('iframe[name*="cardNumber"]').first();
  if (await page.locator('iframe[name*="cardNumber"]').isVisible()) {
    await cardFrame.locator('input[name="cardnumber"]').fill(STRIPE_TEST_CARD.number);
  } else {
    // Newer Stripe Checkout has direct inputs
    const cardInput = page.locator('[data-testid="card-number-input"], input[name="cardNumber"]');
    if (await cardInput.isVisible()) {
      await cardInput.fill(STRIPE_TEST_CARD.number);
    }
  }

  // Fill expiry
  const expiryFrame = page.frameLocator('iframe[name*="cardExpiry"]').first();
  if (await page.locator('iframe[name*="cardExpiry"]').isVisible()) {
    await expiryFrame.locator('input[name="exp-date"]').fill(STRIPE_TEST_CARD.expiry);
  }

  // Fill CVC
  const cvcFrame = page.frameLocator('iframe[name*="cardCvc"]').first();
  if (await page.locator('iframe[name*="cardCvc"]').isVisible()) {
    await cvcFrame.locator('input[name="cvc"]').fill(STRIPE_TEST_CARD.cvc);
  }

  // Fill cardholder name if visible
  const nameInput = page.locator('input[name="cardholderName"]');
  if (await nameInput.isVisible()) {
    await nameInput.fill(`${TEST_USER.firstName} ${TEST_USER.lastName}`);
  }

  // Fill ZIP if visible
  const zipInput = page.locator('input[name="postalCode"]');
  if (await zipInput.isVisible()) {
    await zipInput.fill(STRIPE_TEST_CARD.zip);
  }

  // Submit
  const submitButton = page.getByRole("button", { name: /subscribe|pay|submit/i });
  await submitButton.click();

  // Wait for redirect back to our site
  await page.waitForURL(/catalyst/, { timeout: 30000 });
}
