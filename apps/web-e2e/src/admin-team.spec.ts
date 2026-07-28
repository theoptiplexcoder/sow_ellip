import { test, expect } from '@playwright/test';

test.describe('admin team page', () => {
  test('lists team members with role and status', async ({ page }) => {
    await page.goto('/tenantSlug/admin/team');
    await expect(page.getByRole('heading', { name: 'Team' })).toBeVisible();
    await expect(page.getByText('Priya Nair')).toBeVisible();
    await expect(page.getByText('Active').first()).toBeVisible();
  });

  test('invites a new teammate', async ({ page }) => {
    await page.goto('/tenantSlug/admin/team');
    await page.getByRole('button', { name: 'Invite teammate' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('Email').fill('newperson@acme.com');
    await dialog.getByRole('button', { name: 'Send invite' }).click();

    await expect(dialog).toBeHidden();
    await expect(page.getByText('newperson@acme.com')).toBeVisible();
  });

  test('deactivates a teammate', async ({ page }) => {
    await page.goto('/tenantSlug/admin/team');
    const row = page.locator('tr').filter({ hasText: 'Sam Okafor' });
    await row.getByRole('switch').click();
    await expect(row.getByText('Deactivated')).toBeVisible();
  });
});
