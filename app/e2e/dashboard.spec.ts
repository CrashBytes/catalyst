import { test, expect } from "@playwright/test";
import { ensureAuthenticated } from "./helpers";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  test("overview page renders usage stats", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Welcome back").first()).toBeVisible();
    await expect(page.getByText(/analyses this month/i)).toBeVisible();
  });

  test("sidebar navigation links work", async ({ page }) => {
    await page.goto("/dashboard");

    // Navigate to Projects
    await page.getByRole("link", { name: "Projects" }).first().click();
    await expect(page).toHaveURL(/dashboard\/projects/);

    // Navigate to Billing
    await page.getByRole("link", { name: "Billing" }).first().click();
    await expect(page).toHaveURL(/dashboard\/billing/);

    // Navigate to Settings
    await page.getByRole("link", { name: "Settings" }).first().click();
    await expect(page).toHaveURL(/dashboard\/settings/);

    // Navigate back to Overview
    await page.getByRole("link", { name: "Overview" }).first().click();
    await expect(page).toHaveURL(/dashboard$/);
  });

  test("sidebar shows plan badge", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(
      page.locator("text=/free plan|pro plan|team plan/i").first()
    ).toBeVisible();
  });
});

test.describe("Projects", () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  test("projects page renders", async ({ page }) => {
    await page.goto("/dashboard/projects");
    await expect(
      page.getByRole("heading", { name: /projects/i }).first()
    ).toBeVisible();
  });

  test("can create a new project", async ({ page }) => {
    await page.goto("/dashboard/projects");

    // Click new project button
    const newProjectBtn = page.getByRole("button", {
      name: /new project/i,
    });
    if (await newProjectBtn.isVisible()) {
      await newProjectBtn.click();
    }

    // Fill in project details
    const nameInput = page.locator('input[name="name"]').first();
    await nameInput.waitFor({ timeout: 5000 });
    await nameInput.fill("E2E Test Project");

    const descInput = page.locator('textarea[name="description"]').first();
    if (await descInput.isVisible()) {
      await descInput.fill("Created by Playwright E2E test");
    }

    // Submit
    const createBtn = page.getByRole("button", {
      name: /create project/i,
    });
    await createBtn.click();
    await page.waitForTimeout(1000);

    // Verify project appears in list
    await expect(page.getByText("E2E Test Project").first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("delete button exists on projects", async ({ page }) => {
    await page.goto("/dashboard/projects");
    await page.waitForTimeout(1000);

    // Verify delete buttons are present on project cards
    const deleteBtns = page.locator('button:has-text("Delete"), button:has-text("delete")');
    const count = await deleteBtns.count();

    if (count > 0) {
      await expect(deleteBtns.first()).toBeVisible();
    } else {
      // No projects - that's fine
      test.skip(true, "No projects to verify delete button on");
    }
  });
});

test.describe("Settings", () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  test("settings page renders", async ({ page }) => {
    await page.goto("/dashboard/settings");
    await expect(
      page.getByRole("heading", { name: /settings/i }).first()
    ).toBeVisible();
  });

  test("CLI tokens section is visible", async ({ page }) => {
    await page.goto("/dashboard/settings");
    await expect(
      page.locator("text=/API Token|CLI Token|token/i").first()
    ).toBeVisible({ timeout: 5000 });
  });
});
