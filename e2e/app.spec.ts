import { expect, test, type Page } from "@playwright/test";

interface DocumentFixture {
  id: string;
  type: string;
  region: string;
  status: string;
  media_type: string;
  image_key: string;
  created_at: string;
  updated_at: string;
  parsed_data?: {
    raw_text: string;
    confidence: number;
    fields: Record<string, string>;
  };
  reviewed?: boolean;
}

function document(
  id: string,
  status: string,
  overrides: Partial<DocumentFixture> = {},
): DocumentFixture {
  return {
    id,
    type: "invoice",
    region: "AR",
    status,
    media_type: "image/jpeg",
    image_key: `${id}.jpg`,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

async function mockApi(page: Page): Promise<void> {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  };

  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const method = request.method();
    const pathname = new URL(request.url()).pathname;

    if (method === "OPTIONS") {
      return route.fulfill({ status: 204, headers: corsHeaders });
    }

    const respond = (status: number, body: unknown) =>
      route.fulfill({
        status,
        contentType: "application/json",
        headers: corsHeaders,
        body: JSON.stringify(body),
      });

    if (pathname === "/api/v1/auth/login" && method === "POST") {
      return respond(200, {
        access_token: "access-token",
        refresh_token: "refresh-token",
        token_type: "bearer",
        expires_in: 900,
      });
    }
    if (pathname === "/api/v1/auth/me") {
      return respond(200, { id: "u1", username: "reviewer", role: "REVIEWER" });
    }
    if (pathname === "/api/v1/dashboard") {
      return respond(200, {
        counts: { COMPLETED: 1, VALIDATION_FAILED: 1 },
        recent: [document("d1", "COMPLETED")],
      });
    }
    if (pathname === "/api/v1/documents" && method === "GET") {
      return respond(200, {
        items: [document("d1", "COMPLETED")],
        total: 1,
        page: 1,
        pages: 1,
      });
    }
    if (pathname === "/api/v1/review/queue") {
      return respond(200, {
        items: [document("d2", "VALIDATION_FAILED")],
        total: 1,
        page: 1,
        pages: 1,
      });
    }
    if (pathname === "/api/v1/documents/d2" && method === "GET") {
      return respond(200, {
        ...document("d2", "VALIDATION_FAILED"),
        parsed_data: {
          raw_text: "total: 100",
          confidence: 0.9,
          fields: { total: "100" },
        },
      });
    }
    if (pathname === "/api/v1/documents/d2/review" && method === "PATCH") {
      return respond(200, {
        ...document("d2", "COMPLETED", { reviewed: true }),
        parsed_data: {
          raw_text: "total: 100",
          confidence: 0.9,
          fields: { total: "100" },
        },
      });
    }
    if (pathname === "/api/v1/documents/d1/export" && method === "GET") {
      return respond(200, {
        document_id: "d1",
        type: "invoice",
        region: "AR",
        status: "COMPLETED",
        parsed_data: {
          raw_text: "total: 100",
          confidence: 0.95,
          fields: { total: "100" },
        },
      });
    }
    if (pathname === "/api/v1/documents/d1" && method === "GET") {
      return respond(200, {
        ...document("d1", "COMPLETED"),
        parsed_data: {
          raw_text: "total: 100",
          confidence: 0.95,
          fields: { total: "100" },
        },
      });
    }

    return route.continue();
  });
}

test("login → list → review → export", async ({ page }) => {
  await mockApi(page);

  await page.goto("/login");
  await page.getByLabel("Username").fill("reviewer");
  await page.getByLabel("Password").fill("s3cret");
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();

  // Document list
  await page.locator("nav").getByRole("link", { name: "Documents" }).click();
  await expect(page.getByText("1 documents (page 1 of 1)")).toBeVisible();

  // Review queue
  await page.locator("nav").getByRole("link", { name: "Review" }).click();
  await expect(page.getByRole("heading", { name: /review queue/i })).toBeVisible();

  // Open the editor and approve
  await page.locator("table").getByRole("link", { name: "Review" }).click();
  await expect(page.getByRole("heading", { name: /review d2/i })).toBeVisible();
  await page.getByRole("button", { name: /approve/i }).click();
  await expect(page.getByRole("heading", { name: /review queue/i })).toBeVisible();

  // Export a document from its detail view
  await page.locator("nav").getByRole("link", { name: "Documents" }).click();
  await page.locator("table").getByRole("link", { name: "View" }).click();
  await expect(page.getByRole("heading", { name: /document d1/i })).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /export json/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("d1.json");
});
