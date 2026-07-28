import { test, expect } from '@playwright/test';

test.describe('admin clients page', () => {
  test('lists existing clients', async ({ page }) => {
    await page.goto('/tenantSlug/admin/clients');
    await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible();
    await expect(page.getByText('Northwind Traders')).toBeVisible();
  });

  test('creates a new client', async ({ page }) => {
    await page.goto('/tenantSlug/admin/clients');
    await page.getByRole('button', { name: 'New client' }).click();

    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Display name').fill('Acme Co');
    await dialog.getByLabel('Company name').fill('Acme Company Ltd.');
    await dialog.getByRole('button', { name: 'Create client' }).click();

    await expect(dialog).toBeHidden();
    await expect(page.getByText('Acme Co')).toBeVisible();
  });

  test('blocks archiving a client with linked projects', async ({ page }) => {
    await page.goto('/tenantSlug/admin/clients');
    const row = page.locator('tr').filter({ hasText: 'Northwind Traders' });
    await row.getByRole('button', { name: 'Archive' }).click();
    await expect(row.getByText(/Can't archive/)).toBeVisible();
    await expect(page.getByText('Northwind Traders')).toBeVisible();
  });

  test('archives a client with no linked projects', async ({ page }) => {
    await page.goto('/tenantSlug/admin/clients');
    const row = page.locator('tr').filter({ hasText: 'Initech' });
    await row.getByRole('button', { name: 'Archive' }).click();
    await expect(page.getByText('Initech')).toBeHidden();
  });
});
