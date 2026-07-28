import { test, expect } from '@playwright/test';

test.describe('client projects page', () => {
  test('lists the client\'s own projects without owner or edit controls', async ({ page }) => {
    await page.goto('/tenantSlug/client/projects');
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
    await expect(page.getByText('Website revamp')).toBeVisible();
    await expect(page.getByRole('button', { name: 'New project' })).toHaveCount(0);
  });

  test('opens a side panel with SOWs and lets the client log a requirement', async ({ page }) => {
    await page.goto('/tenantSlug/client/projects');
    const row = page.locator('tr').filter({ hasText: 'Website revamp' });
    await row.click();

    const panel = page.locator('aside');
    await expect(panel).toBeVisible();
    await expect(panel.getByText('SOW-1042')).toBeVisible();

    await panel.getByPlaceholder('Log a new requirement for your consultant...').fill('We need a French translation too.');
    await panel.getByRole('button', { name: 'Add comment' }).click();

    await expect(panel.getByText('We need a French translation too.')).toBeVisible();

    await panel.getByRole('button', { name: 'Close' }).click();
    await expect(panel).toBeHidden();
  });
});
