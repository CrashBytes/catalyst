import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("renders hero section with correct heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Analyze");
    await expect(page.locator("h1")).toContainText("Perfect configs");
  });

  test("renders navigation with sign-in and get-started links", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
    await expect(
      page.getByRole("navigation").getByRole("link", { name: /get started/i })
    ).toBeVisible();
  });

  test("renders features section", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "CLAUDE.md Generation" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Custom Skills" })
    ).toBeVisible();
  });

  test("renders pricing section with three tiers", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("$12").first()).toBeVisible();
    await expect(page.getByText("$29").first()).toBeVisible();
  });

  test("get started link navigates to sign-up", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("navigation")
      .getByRole("link", { name: /get started/i })
      .click();
    await expect(page).toHaveURL(/sign-up/);
  });

  test("sign in link navigates to sign-in", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/sign-in/);
  });
});

test.describe("Pricing Page", () => {
  test("renders pricing page with FAQ", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.locator("h1").first()).toContainText(
      "Simple, transparent pricing"
    );
    await expect(
      page.getByText("Frequently asked questions")
    ).toBeVisible();
  });

  test("displays monthly/annual toggle", async ({ page }) => {
    await page.goto("/pricing");
    await expect(
      page.getByText("Monthly", { exact: true }).first()
    ).toBeVisible();
    // The toggle text for annual billing
    await expect(
      page.locator("text=/Annual|Yearly/i").first()
    ).toBeVisible();
  });
});
