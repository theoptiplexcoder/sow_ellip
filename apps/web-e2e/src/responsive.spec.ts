import { test, expect, type Page } from '@playwright/test';

const MOBILE = { width: 375, height: 812 };
const DESKTOP = { width: 1280, height: 800 };

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth };
  });
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

const ROUTES = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/tenantSlug/admin',
  '/tenantSlug/admin/clients',
  '/tenantSlug/admin/projects',
  '/tenantSlug/admin/sows',
  '/tenantSlug/admin/team',
  '/tenantSlug/admin/auditlogs',
  '/tenantSlug/admin/workflows',
  '/tenantSlug/admin/workflowyard',
  '/tenantSlug/participant',
  '/tenantSlug/participant/sows',
  '/tenantSlug/participant/sows/yard',
  '/tenantSlug/participant/workflows',
  '/tenantSlug/participant/workflows/yard',
  '/tenantSlug/client',
  '/tenantSlug/client/projects',
  '/tenantSlug/client/sows',
];

test.describe('mobile viewport (375px) has no horizontal overflow', () => {
  test.use({ viewport: MOBILE });

  for (const route of ROUTES) {
    test(`${route} fits within the viewport`, async ({ page }) => {
      await page.goto(route);
      await expectNoHorizontalOverflow(page);
    });
  }
});

test.describe('desktop viewport (1280px) has no horizontal overflow', () => {
  test.use({ viewport: DESKTOP });

  for (const route of ROUTES) {
    test(`${route} fits within the viewport`, async ({ page }) => {
      await page.goto(route);
      await expectNoHorizontalOverflow(page);
    });
  }
});

test.describe('detail sidebar becomes a full-screen overlay on mobile', () => {
  test.use({ viewport: MOBILE });

  test('opening a client detail panel does not overflow and can be closed', async ({ page }) => {
    await page.goto('/tenantSlug/admin/clients');
    await page.locator('tr').filter({ hasText: 'Northwind Traders' }).click();

    const aside = page.locator('aside').filter({ hasText: 'Northwind Traders' });
    await expect(aside).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await aside.getByRole('button', { name: 'Close' }).click();
    await expect(aside).toBeHidden();
  });
});

test.describe('landing header mobile navigation', () => {
  test.use({ viewport: MOBILE });

  test('reveals Sign in / Get started via the mobile menu toggle', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header');
    await expect(header.getByRole('link', { name: 'Get started' })).toBeHidden();

    await page.getByRole('button', { name: /menu/i }).click();
    await expect(header.getByRole('link', { name: 'Get started' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});

test.describe('wide tables scroll horizontally instead of overflowing the page', () => {
  test.use({ viewport: MOBILE });

  test('projects table stays within the viewport', async ({ page }) => {
    await page.goto('/tenantSlug/admin/projects');
    await expectNoHorizontalOverflow(page);
    const table = page.locator('table').first();
    await expect(table).toBeVisible();
  });
});

test.describe('workflow step editor row wraps instead of overlapping on mobile', () => {
  test.use({ viewport: MOBILE });

  test('the new-workflow dialog step row fits within the viewport', async ({ page }) => {
    await page.goto('/tenantSlug/admin/workflows');
    await page.getByRole('button', { name: 'New workflow' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
