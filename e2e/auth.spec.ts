import { expect, test } from "@playwright/test";

test("public website loads", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole("heading", { name: /Growing Upwards Together/i })).toBeVisible();
});

test("admin dashboard requires sign-in", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("heading", { name: /staff sign in/i })).toBeVisible();
});

test("privileged APIs reject unauthenticated callers", async ({ request }) => {
  const data = await request.get("/api/dashboard/data");
  expect(data.status()).toBe(401);

  const clients = await request.post("/api/dashboard/clients", {
    data: { name: "Test", email: "test@example.com" },
  });
  expect([401, 403]).toContain(clients.status());

  const files = await request.post("/api/files", {
    data: { fileName: "a.pdf", mimeType: "application/pdf", byteSize: 10, purpose: "project" },
  });
  expect([401, 403]).toContain(files.status());
});

test("old PIN login is gone", async ({ request }) => {
  const response = await request.post("/api/auth/pin", { data: { pin: "246810" } });
  expect(response.status()).toBe(410);
});
