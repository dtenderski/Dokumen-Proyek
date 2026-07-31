/**
 * E2E: FinancialModule header controls at 375 × 812 px (smallest phone).
 *
 * All API calls are intercepted and mocked so the test runs without a real
 * database and without going through Replit OAuth. The server is assumed to
 * be running on http://localhost:5000 (the project's standard workflow).
 *
 * Checklist verified here:
 *  ✓ No horizontal scroll / overflow on a 375 px viewport
 *  ✓ The icon-only "Tambah Transaksi" button is visible and opens the dialog
 *  ✓ The month-filter trigger is visible and tappable inside the header row
 *  ✓ The sm:hidden label span is absent from the rendered visible area
 *    (Playwright can compute getComputedStyle)
 */
import { test, expect, Route, Request } from "@playwright/test";

// ── Fixture data ──────────────────────────────────────────────────────────────
const MOCK_USER = {
  id: "test-user",
  name: "Test User",
  email: "test@example.com",
};

const MOCK_PROFILE = {
  id: 1,
  userId: "test-user",
  companyName: "PT Test",
  phone: null,
  address: null,
  npwp: null,
};

const MOCK_TRANSACTIONS = [
  {
    id: 1,
    userId: "test-user",
    type: "income",
    category: "payment_received",
    description: "Pembayaran Proyek Alpha",
    amount: 5_000_000,
    date: "2026-06-01T00:00:00.000Z",
    createdAt: "2026-06-01T00:00:00.000Z",
    projectId: null,
    notes: null,
  },
  {
    id: 2,
    userId: "test-user",
    type: "expense",
    category: "material",
    description: "Beli Material",
    amount: 1_000_000,
    date: "2026-07-15T00:00:00.000Z",
    createdAt: "2026-07-15T00:00:00.000Z",
    projectId: null,
    notes: null,
  },
];

// ── Route interceptor helper ──────────────────────────────────────────────────
async function mockAllApis(route: Route, req: Request) {
  const url = req.url();

  if (url.includes("/api/auth/user")) {
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_USER) });
  }
  if (url.includes("/api/profile")) {
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_PROFILE) });
  }
  if (url.includes("/api/transactions") && req.method() === "GET") {
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_TRANSACTIONS) });
  }
  if (url.includes("/api/projects")) {
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  }

  // Let all other requests (JS, CSS, fonts, etc.) pass through
  return route.continue();
}

// ── Test setup ────────────────────────────────────────────────────────────────
test.use({ viewport: { width: 375, height: 812 } });

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", mockAllApis);
  await page.goto("/financial");
  // Wait for the header to finish hydrating
  await page.waitForSelector('[data-testid="button-add-transaction"]', { timeout: 10_000 });
});

// ─────────────────────────────────────────────────────────────────────────────

test("no horizontal scroll on a 375px phone viewport", async ({ page }) => {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
});

test("header row does not overflow its container at 375px", async ({ page }) => {
  const header = page.locator("header");
  const box = await header.boundingBox();
  expect(box).not.toBeNull();
  // Header width must not exceed the viewport
  expect(box!.width).toBeLessThanOrEqual(375 + 1); // +1 px for rounding
  // Header right edge must not exceed viewport right edge
  expect(box!.x + box!.width).toBeLessThanOrEqual(376);
});

test("add-transaction button is visible within the header at 375px", async ({ page }) => {
  const btn = page.getByTestId("button-add-transaction");
  await expect(btn).toBeVisible();
  const box = await btn.boundingBox();
  expect(box).not.toBeNull();
  // Confirm button is inside the 375px viewport (not clipped off-screen)
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(376);
});

test("the 'Tambah Transaksi' text label is not visible (icon-only) at 375px", async ({ page }) => {
  // The span is in the DOM but must be hidden by CSS at this viewport width.
  // Tailwind's `hidden` class sets display:none; `sm:inline` restores it only
  // at ≥640 px. We confirm the span itself is not visible at 375 px.
  const labelSpan = page.locator('[data-testid="button-add-transaction"] span.\\!hidden, [data-testid="button-add-transaction"] span').filter({ hasText: "Tambah Transaksi" });
  // The span is hidden via CSS — getComputedStyle should confirm it
  const isHidden = await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="button-add-transaction"]');
    if (!btn) return false;
    const spans = btn.querySelectorAll("span");
    for (const span of spans) {
      if (span.textContent?.trim() === "Tambah Transaksi") {
        const style = window.getComputedStyle(span);
        return style.display === "none";
      }
    }
    return false;
  });
  expect(isHidden).toBe(true);
});

test("tapping the icon-only button opens the add-transaction dialog at 375px", async ({ page }) => {
  const btn = page.getByTestId("button-add-transaction");
  await btn.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible({ timeout: 5_000 });
  await expect(page.getByRole("heading", { name: "Tambah Transaksi" })).toBeVisible();
});

test("dialog opened from icon button contains income/expense type controls", async ({ page }) => {
  await page.getByTestId("button-add-transaction").click();
  await page.getByRole("dialog").waitFor({ timeout: 5_000 });

  await expect(page.getByTestId("button-type-income")).toBeVisible();
  await expect(page.getByTestId("button-type-expense")).toBeVisible();
});

test("month-filter trigger is visible and inside the 375px header", async ({ page }) => {
  const trigger = page.getByTestId("select-filter-month");
  await expect(trigger).toBeVisible();

  const box = await trigger.boundingBox();
  expect(box).not.toBeNull();
  // Trigger must be fully within the viewport width
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(376);
});

test("month-filter trigger is tappable (opens dropdown) at 375px", async ({ page }) => {
  const trigger = page.getByTestId("select-filter-month");
  await trigger.click();

  // Radix Select opens a listbox/combobox when activated
  // Wait for at least one option to appear
  await expect(page.getByRole("option", { name: "Semua Bulan" })).toBeVisible({ timeout: 5_000 });
});

test("selecting a month in the filter shows only that month's transactions", async ({ page }) => {
  // Open the month filter
  const trigger = page.getByTestId("select-filter-month");
  await trigger.click();

  // Wait for the dropdown to open and click the July 2026 option
  // (MOCK_TRANSACTIONS[1] is dated 2026-07-15)
  const julyOption = page.getByRole("option", { name: /Juli 2026/i });
  await expect(julyOption).toBeVisible({ timeout: 5_000 });
  await julyOption.click();

  // After filtering for July, only 1 of 2 mock transactions should show in "Semua" tab counter
  await expect(page.getByTestId("tab-all")).toContainText("(1)");
  // The June income transaction must not appear
  await expect(page.getByText("Pembayaran Proyek Alpha")).not.toBeVisible();
  // The July expense transaction must appear
  await expect(page.getByText("Beli Material")).toBeVisible();
});
