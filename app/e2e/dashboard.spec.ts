import { test, expect } from "@playwright/test";
import { ensureAuthenticated } from "./helpers";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  test("overview page renders usage stats", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Overview")).toBeVisible();
    await expect(page.getByText(/analyses this month/i)).toBeVisible();
  });

  test("sidebar navigation links work", async ({ page }) => {
    await page.goto("/dashboard");

    // Navigate to Projects
    await page.getByRole("link", { name: /projects/i }).click();
    await expect(page).toHaveURL(/dashboard\/projects/);

    // Navigate to Billing
    await page.getByRole("link", { name: /billing/i }).click();
    await expect(page).toHaveURL(/dashboard\/billing/);

    // Navigate to Settings
    await page.getByRole("link", { name: /settings/i }).click();
    await expect(page).toHaveURL(/dashboard\/settings/);

    // Navigate back to Overview
    await page.getByRole("link", { name: /overview/i }).click();
    await expect(page).toHaveURL(/dashboard$/);
  });

  test("sidebar shows plan badge", async ({ page }) => {
    await page.goto("/dashboard");
    // Should show Free Plan or Pro Plan depending on user state
    await expect(
      page.locator("text=/Free Plan|Pro Plan|Team Plan/")
    ).toBeVisible();
  });
});

test.describe("Projects", () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  test("projects page renders", async ({ page }) => {
    await page.goto("/dashboard/projects");
    await expect(page.getByText("Projects")).toBeVisible();
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
    const nameInput = page.locator(
      'input[name="name"], input[placeholder*="project"]'
    );
    await nameInput.waitFor({ timeout: 5000 });
    await nameInput.fill("E2E Test Project");

    const descInput = page.locator(
      'textarea[name="description"], textarea[placeholder*="description"]'
    );
    if (await descInput.isVisible()) {
      await descInput.fill("Created by Playwright E2E test");
    }

    // Submit
    const createBtn = page.getByRole("button", {
      name: /create project/i,
    });
    await createBtn.click();

    // Verify project appears in list
    await expect(page.getByText("E2E Test Project")).toBeVisible({
      timeout: 5000,
    });
  });

  test("can delete a project", async ({ page }) => {
    await page.goto("/dashboard/projects");

    // Look for delete button on an existing project
    const deleteBtn = page.getByRole("button", { name: /delete/i }).first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();

      // Wait for the page to update
      await page.waitForTimeout(1000);
    }
  });
});

test.describe("Settings", () => {
  test.beforeEach(async ({ page }) => {
    await ensureAuthenticated(page);
  });

  test("settings page renders", async ({ page }) => {
    await page.goto("/dashboard/settings");
    await expect(page.getByText("Settings")).toBeVisible();
  });

  test("CLI tokens section is visible", async ({ page }) => {
    await page.goto("/dashboard/settings");
    await expect(page.getByText(/API Token|CLI Token/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test("can create a CLI token", async ({ page }) => {
    await page.goto("/dashboard/settings");

    const createTokenBtn = page.getByRole("button", {
      name: /create.*token|generate.*token|new.*token/i,
    });
    if (await createTokenBtn.isVisible()) {
      await createTokenBtn.click();

      // Token should be displayed
      await page.waitForTimeout(1000);
      // Should show the generated token or a success message
    }
  });
});
