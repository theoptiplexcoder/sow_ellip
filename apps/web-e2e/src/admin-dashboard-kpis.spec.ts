import { test, expect } from '@playwright/test';

test.describe('admin dashboard KPIs', () => {
  test('renders all KPI sections with charts', async ({ page }) => {
    await page.goto('/tenantSlug/admin');

    await expect(page.getByRole('heading', { name: 'Insights & KPIs' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'SOWs' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Approval health' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Team management' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Template & workflow usage' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Projects & clients' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Recent audit changes' })).toBeVisible();

    // Chart.js renders a <canvas> per chart block.
    await expect(page.locator('canvas')).toHaveCount(9);
  });

  test('filters SOWs stuck in Changes Requested by day threshold', async ({ page }) => {
    await page.goto('/tenantSlug/admin');

    await expect(page.getByText('SOW-2026-0031')).toBeVisible();
    await expect(page.getByText('SOW-2026-0044')).toBeVisible();

    await page.getByRole('button', { name: '> 10d' }).click();

    await expect(page.getByText('SOW-2026-0031')).toBeVisible();
    await expect(page.getByText('SOW-2026-0044')).toBeHidden();
  });

  test('shows recent audit activity', async ({ page }) => {
    await page.goto('/tenantSlug/admin');
    await expect(page.getByText('user invited').first()).toBeVisible();
  });
});
