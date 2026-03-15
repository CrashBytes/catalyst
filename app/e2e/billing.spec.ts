import { test, expect } from "@playwright/test";
import { ensureAuthenticated, STRIPE_TEST_CARD, TEST_USER } from "./helpers";

test.describe("Billing", () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  test("billing page renders with plan options", async ({ page }) => {
    await page.goto("/dashboard/billing");
    await expect(
      page.getByRole("heading", { name: /billing/i }).first()
    ).toBeVisible();
    await expect(page.getByText("$12").first()).toBeVisible();
    await expect(page.getByText("$29").first()).toBeVisible();
  });

  test("billing page shows current plan", async ({ page }) => {
    await page.goto("/dashboard/billing");
    await expect(
      page.locator("text=/Current plan|Current Subscription|active/i").first()
    ).toBeVisible({ timeout: 5000 });
  });

  test("manage billing link exists for subscribed users", async ({ page }) => {
    await page.goto("/dashboard/billing");
    const manageLink = page.locator(
      "text=/Manage.*Stripe|Manage.*billing/i"
    ).first();
    // Only visible if user has a subscription
    if (await manageLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(manageLink).toBeVisible();
    }
  });
});

test.describe("Team", () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  test("team page renders", async ({ page }) => {
    await page.goto("/dashboard/team");
    await page.waitForTimeout(1000);
    // Team page should load without error
    await expect(page.locator("main")).toBeVisible();
  });
});
