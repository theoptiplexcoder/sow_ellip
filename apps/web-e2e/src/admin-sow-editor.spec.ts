import { test, expect } from '@playwright/test';

test.describe('admin SOW editor', () => {
  test('clicking Edit in the row menu opens the SOW creator canvas as a full page', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows');
    await page.locator('#sow-actions-s-1').click();
    await page.getByRole('menuitem', { name: 'Edit' }).click();

    await page.waitForURL(/\/sows\/edit\?id=s-1$/);
    await expect(page.getByRole('heading', { name: 'Edit SOW-1042' })).toBeVisible();
    await expect(page.getByText('Field palette')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Live preview' })).toBeVisible();
  });

  test('Edit Document in the SOW detail panel opens the same full page canvas', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows');
    await page.locator('tr').filter({ hasText: 'SOW-1042' }).click();
    await page.getByRole('button', { name: 'Edit Document' }).click();

    await page.waitForURL(/\/sows\/edit\?id=s-1$/);
    await expect(page.getByRole('heading', { name: 'Edit SOW-1042' })).toBeVisible();
  });

  test('cancel returns to the SOWs list without changes', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows');
    await page.locator('#sow-actions-s-1').click();
    await page.getByRole('menuitem', { name: 'Edit' }).click();
    await page.waitForURL(/\/sows\/edit\?id=s-1$/);

    await page.getByRole('button', { name: 'Cancel' }).click();
    await page.waitForURL(/\/admin\/sows$/);
    await expect(page.locator('tr').filter({ hasText: 'SOW-1042' }).getByText('v2')).toBeVisible();
  });

  test('editing a field value and saving creates a new version', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows');
    await page.locator('#sow-actions-s-1').click();
    await page.getByRole('menuitem', { name: 'Edit' }).click();
    await page.waitForURL(/\/sows\/edit\?id=s-1$/);

    await page.getByRole('tab', { name: 'Live preview' }).click();
    await page.getByLabel('Project Title').fill('Website revamp — Phase 1 (revised)');

    await page.getByRole('button', { name: 'Save as new version' }).click();

    await page.waitForURL(/\/admin\/sows$/);
    await expect(page.locator('tr').filter({ hasText: 'SOW-1042' }).getByText('v3')).toBeVisible();
  });
});
