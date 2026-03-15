import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("sign-in page renders Clerk component", async ({ page }) => {
    await page.goto("/sign-in");
    // Clerk should render its sign-in form - look for any sign-in related text
    await expect(
      page.locator("text=/Sign in|sign in|Log in|Welcome back/i").first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("sign-up page renders Clerk component", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page.locator("text=Create your account")).toBeVisible({
      timeout: 10000,
    });
  });

  test("unauthenticated user accessing dashboard redirects to sign-in", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForTimeout(2000);
    // Should redirect to sign-in
    await expect(page).toHaveURL(/sign-in/);
  });

  test("unauthenticated user accessing dashboard/projects redirects to sign-in", async ({
    page,
  }) => {
    await page.goto("/dashboard/projects");
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/sign-in/);
  });

  test("unauthenticated user accessing dashboard/billing redirects to sign-in", async ({
    page,
  }) => {
    await page.goto("/dashboard/billing");
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/sign-in/);
  });

  test("unauthenticated user accessing dashboard/settings redirects to sign-in", async ({
    page,
  }) => {
    await page.goto("/dashboard/settings");
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/sign-in/);
  });
});
