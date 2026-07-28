import { test, expect } from '@playwright/test';

test.describe('admin sows page', () => {
  test('lists SOWs with status badges', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows');
    await expect(page.getByRole('heading', { name: 'SOWs' })).toBeVisible();
    await expect(page.getByText('SOW-1042')).toBeVisible();
    await expect(page.getByText('Approved')).toBeVisible();
  });

  test('filters SOWs by status', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows');
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Draft' }).click();

    await expect(page.getByText('SOW-1055')).toBeVisible();
    await expect(page.getByText('SOW-1042')).toBeHidden();
  });

  test('shows the SOW description in the right sidebar', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows');
    await page.locator('tr').filter({ hasText: 'SOW-1042' }).click();

    await expect(page.getByText('Description')).toBeVisible();
    await expect(page.getByText(/Redesign and rebuild of the client-facing marketing site/)).toBeVisible();
  });

  test('New SOW opens the create template flow', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows');
    await page.getByRole('button', { name: 'New SOW' }).click();

    await page.waitForURL(/\/sows\/new$/);
    await expect(page.getByRole('heading', { name: 'New template' })).toBeVisible();
  });

  test('SOW awaiting approval requires a logged comment before Approve/Reject/Review is enabled', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows');
    await expect(page.locator('tr').filter({ hasText: 'SOW-1060' }).getByText('Requires your approval')).toBeVisible();
    await page.locator('tr').filter({ hasText: 'SOW-1060' }).click();
    await expect(page.getByText('Requires your approval')).toBeVisible();

    const approve = page.getByRole('button', { name: 'Approve' });
    const reject = page.getByRole('button', { name: 'Reject' });
    const review = page.getByRole('button', { name: 'Review' });

    await expect(approve).toBeDisabled();
    await expect(reject).toBeDisabled();
    await expect(review).toBeDisabled();
    await expect(page.getByText('Log a comment above before you can review, approve, or reject this SOW.')).toBeVisible();

    await page.getByPlaceholder('Reply to comments...').fill('Looks good to proceed.');
    await expect(approve).toBeEnabled();

    await approve.click();

    await expect(page.getByText('Approved: Looks good to proceed.')).toBeVisible();
    await expect(page.locator('tr').filter({ hasText: 'SOW-1060' }).getByText('Approved')).toBeVisible();
  });

  test('tags a comment to a specific template section', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows');
    await page.locator('tr').filter({ hasText: 'SOW-1042' }).click();

    await page
      .locator('div')
      .filter({ has: page.getByRole('heading', { name: '3. Deliverables', exact: true }) })
      .first()
      .getByRole('button', { name: 'Comment' })
      .click();

    await expect(page.getByText('Commenting on: 3. Deliverables')).toBeVisible();
    await expect(page.getByPlaceholder('Comment on 3. Deliverables...')).toBeVisible();

    await page.getByPlaceholder('Comment on 3. Deliverables...').fill('Please clarify the QA sign-off step.');
    await page.getByRole('button', { name: 'Post Reply' }).click();

    await expect(page.getByRole('button', { name: '§ 3. Deliverables' })).toBeVisible();
    await expect(page.getByText('Please clarify the QA sign-off step.')).toBeVisible();
  });
});
