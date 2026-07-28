import { test, expect } from '@playwright/test';

test.describe('client dashboard page', () => {
  test('shows client nav and stats', async ({ page }) => {
    await page.goto('/tenantSlug/client');
    await expect(page.getByText('/ Client')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Active projects')).toBeVisible();
  });

  test('links to the full SOWs list', async ({ page }) => {
    await page.goto('/tenantSlug/client');
    await page.getByRole('link', { name: 'View all' }).click();
    await expect(page).toHaveURL(/\/client\/sows$/);
  });
});
