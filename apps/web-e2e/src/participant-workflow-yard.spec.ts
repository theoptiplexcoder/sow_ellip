import { test, expect } from '@playwright/test';

test.describe('participant workflow yard page', () => {
  test('lists published workflows from the organization', async ({ page }) => {
    await page.goto('/tenantSlug/participant/workflows/yard');
    await expect(page.getByRole('heading', { name: 'Workflow Yard' })).toBeVisible();
    await expect(page.getByText('Standard 2-step')).toBeVisible();
  });

  test('does not show create or edit controls to a participant', async ({ page }) => {
    await page.goto('/tenantSlug/participant/workflows/yard');
    await expect(page.getByRole('button', { name: 'New workflow' })).toHaveCount(0);
  });

  test('attaches a workflow to a SOW via the Use flow', async ({ page }) => {
    await page.goto('/tenantSlug/participant/workflows/yard');

    const row = page.locator('tr').filter({ hasText: 'Standard 2-step' });
    await row.getByRole('button', { name: 'Use' }).click();

    const dialog = page.getByRole('dialog');
    await dialog.getByRole('combobox').click();
    await page.getByRole('option', { name: /Support retainer renewal/i }).click();
    await dialog.getByRole('button', { name: 'Attach' }).click();

    await expect(dialog).toBeHidden();
    await expect(page.getByText(/Standard 2-step.*attached to SOW-1055/)).toBeVisible();
  });
});
