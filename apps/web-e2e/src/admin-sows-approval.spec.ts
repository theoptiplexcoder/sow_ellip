import { test, expect } from '@playwright/test';

test.describe('SOW requiring approval', () => {
  test('shows a Requires approval badge with SOW details and an Approved action', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows');

    const row = page.locator('tr').filter({ hasText: 'SOW-1065' });
    await expect(row.getByText('Requires approval')).toBeVisible();

    await row.click();
    await expect(page.getByText(/Automating the vendor onboarding checklist/)).toBeVisible();

    const approve = page.getByRole('button', { name: 'Approved' });
    const changes = page.getByRole('button', { name: 'Changes Requested' });
    await expect(approve).toBeDisabled();
    await expect(changes).toBeDisabled();

    await page.getByPlaceholder('Reply to comments...').fill('Looks good, approving.');
    await expect(approve).toBeEnabled();

    await approve.click();

    await expect(page.locator('tr').filter({ hasText: 'SOW-1065' }).getByText('Approved')).toBeVisible();
  });

  test('requesting changes updates the status badge', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows');
    await page.locator('tr').filter({ hasText: 'SOW-1065' }).click();

    await page.getByPlaceholder('Reply to comments...').fill('Please revise the timeline section.');
    await page.getByRole('button', { name: 'Changes Requested' }).click();

    await expect(page.locator('tr').filter({ hasText: 'SOW-1065' }).getByText('Changes requested')).toBeVisible();
  });
});
