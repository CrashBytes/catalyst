import { test, expect } from "@playwright/test";

test.describe("API Endpoints", () => {
  test("CLI token endpoint returns 401 without auth", async ({ request }) => {
    const response = await request.get("/api/auth/cli-token");
    expect(response.status()).toBe(401);
  });

  test("analyze endpoint returns 401 without auth", async ({ request }) => {
    const response = await request.post("/api/v1/analyze", {
      data: { type: "full" },
    });
    expect(response.status()).toBe(401);
  });

  test("Stripe webhook endpoint rejects GET requests", async ({
    request,
  }) => {
    const response = await request.get("/api/webhooks/stripe");
    // Should return 405 Method Not Allowed or 400
    expect([400, 404, 405]).toContain(response.status());
  });

  test("Clerk webhook endpoint rejects GET requests", async ({ request }) => {
    const response = await request.get("/api/webhooks/clerk");
    expect([400, 404, 405]).toContain(response.status());
  });

  test("Stripe webhook rejects invalid signature", async ({ request }) => {
    const response = await request.post("/api/webhooks/stripe", {
      data: { type: "checkout.session.completed" },
      headers: {
        "stripe-signature": "invalid_signature",
      },
    });
    expect([400, 401, 500]).toContain(response.status());
  });
});
