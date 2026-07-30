import { test, expect } from '@playwright/test';

test.describe('creating a SOW from a template', () => {
  test('a SOW created via a template fill appears in the admin SOWs list', async ({ page }) => {
    const title = `E2E SOW ${Date.now()}`;

    await page.goto('/tenantSlug/participant/templates');
    await page
      .locator('tr')
      .filter({ hasText: 'Standard Consulting SOW' })
      .getByRole('button', { name: 'Use' })
      .click();

    await page.waitForURL(/\/templates\/t-1$/);
    await page.getByLabel(/Project Title/).fill(title);
    await page.getByLabel(/Project Description/).fill('End-to-end test SOW created from a template.');
    await page.getByRole('button', { name: 'Use this template' }).click();

    await page.waitForURL(/\/sows\/yard$/);
    await expect(page.getByText(title)).toBeVisible();

    await page.goto('/tenantSlug/admin/sows');
    await expect(page.getByText(title)).toBeVisible();
  });

  test('attaching a SOW to a workflow in Workflow Yard shows it as a linked SOW on admin Workflows', async ({ page }) => {
    await page.goto('/tenantSlug/participant/workflows/yard');

    const row = page.locator('tr').filter({ hasText: 'Standard 2-step' });
    await row.getByRole('button', { name: 'Use' }).click();

    const dialog = page.getByRole('dialog');
    await dialog.getByRole('combobox').click();
    await page.getByRole('option', { name: /Data migration plan/i }).click();
    await dialog.getByRole('button', { name: 'Attach' }).click();
    await expect(dialog).toBeHidden();

    await page.goto('/tenantSlug/admin/workflows');
    await page.locator('tr').filter({ hasText: 'Standard 2-step' }).click();
    await expect(page.getByText('SOW-1051')).toBeVisible();
  });
});
