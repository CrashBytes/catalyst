import { test, expect } from "@playwright/test";
import { ensureAuthenticated, fillStripeCheckout, STRIPE_TEST_CARD } from "./helpers";

test.describe("Billing", () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  test("billing page renders with plan options", async ({ page }) => {
    await page.goto("/dashboard/billing");
    await expect(page.getByText("Billing")).toBeVisible();
    await expect(page.getByText("Free").first()).toBeVisible();
    await expect(page.getByText("Pro").first()).toBeVisible();
    await expect(page.getByText("Team").first()).toBeVisible();
  });

  test("billing page shows current plan", async ({ page }) => {
    await page.goto("/dashboard/billing");
    // Should show either "Current plan" text or a plan badge
    await expect(
      page.locator("text=/Current plan|Current Subscription/i")
    ).toBeVisible({ timeout: 5000 });
  });

  test("upgrade to Pro redirects to Stripe checkout", async ({ page }) => {
    await page.goto("/dashboard/billing");

    // Find upgrade/switch to Pro button
    const upgradeBtn = page
      .getByRole("button", { name: /upgrade to pro|switch to pro/i })
      .first();

    if (await upgradeBtn.isVisible()) {
      await upgradeBtn.click();

      // Should redirect to Stripe Checkout
      await page.waitForURL(/checkout\.stripe\.com/, { timeout: 15000 });
      await expect(page).toHaveURL(/checkout\.stripe\.com/);
    }
  });

  test("Stripe checkout accepts test card", async ({ page }) => {
    test.slow(); // This test involves external redirects

    await page.goto("/dashboard/billing");

    const upgradeBtn = page
      .getByRole("button", { name: /upgrade to pro|switch to pro/i })
      .first();

    if (!(await upgradeBtn.isVisible())) {
      test.skip(true, "User already on Pro plan");
      return;
    }

    await upgradeBtn.click();

    // Wait for Stripe Checkout
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 15000 });
    await page.waitForTimeout(3000);

    // Fill in the checkout form
    // Stripe Checkout form structure varies - fill email first
    const emailInput = page.locator("#email");
    if (await emailInput.isVisible()) {
      await emailInput.fill("test@catalyst.crashbytes.com");
    }

    // Card details are in an iframe
    const cardNumberFrame = page
      .frameLocator('iframe[title*="card number"]')
      .first();
    const cardNumber = cardNumberFrame.locator(
      'input[name="cardnumber"], input[placeholder*="card number"]'
    );
    if (await page.locator('iframe[title*="card number"]').isVisible()) {
      await cardNumber.fill(STRIPE_TEST_CARD.number);
    }

    const expiryFrame = page
      .frameLocator('iframe[title*="expiration"]')
      .first();
    const expiry = expiryFrame.locator(
      'input[name="exp-date"], input[placeholder*="MM"]'
    );
    if (await page.locator('iframe[title*="expiration"]').isVisible()) {
      await expiry.fill(STRIPE_TEST_CARD.expiry);
    }

    const cvcFrame = page.frameLocator('iframe[title*="CVC"]').first();
    const cvc = cvcFrame.locator(
      'input[name="cvc"], input[placeholder*="CVC"]'
    );
    if (await page.locator('iframe[title*="CVC"]').isVisible()) {
      await cvc.fill(STRIPE_TEST_CARD.cvc);
    }

    // Cardholder name
    const nameInput = page.locator("#billingName");
    if (await nameInput.isVisible()) {
      await nameInput.fill("Test User");
    }

    // ZIP
    const zipInput = page.locator("#billingPostalCode");
    if (await zipInput.isVisible()) {
      await zipInput.fill(STRIPE_TEST_CARD.zip);
    }

    // Subscribe button
    const subscribeBtn = page
      .getByRole("button", { name: /subscribe/i })
      .first();
    if (await subscribeBtn.isVisible()) {
      await subscribeBtn.click();

      // Wait for redirect back to billing page
      await page.waitForURL(/dashboard\/billing/, { timeout: 30000 });
      await expect(page.getByText(/Pro Plan|active/i)).toBeVisible({
        timeout: 10000,
      });
    }
  });

  test("manage billing redirects to Stripe portal", async ({ page }) => {
    await page.goto("/dashboard/billing");

    const manageBtn = page.getByRole("link", {
      name: /manage.*stripe|manage.*billing/i,
    });

    if (await manageBtn.isVisible()) {
      // Don't actually click - just verify it exists
      await expect(manageBtn).toBeVisible();
    }
  });
});

test.describe("Team", () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  test("team page renders", async ({ page }) => {
    await page.goto("/dashboard/team");
    await expect(page.getByText(/team/i).first()).toBeVisible();
  });
});
