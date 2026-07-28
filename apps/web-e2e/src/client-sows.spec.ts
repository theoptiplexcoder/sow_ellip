import { test, expect } from '@playwright/test';

test.describe('client sows page', () => {
  test('lists SOWs with status badges', async ({ page }) => {
    await page.goto('/tenantSlug/client/sows');
    await expect(page.getByRole('heading', { name: 'SOWs' })).toBeVisible();
    await expect(page.getByText('SOW-1042')).toBeVisible();
    await expect(page.getByText('Approved')).toBeVisible();
  });

  test('filters SOWs by status', async ({ page }) => {
    await page.goto('/tenantSlug/client/sows');
    await page.getByRole('button', { name: 'Changes requested' }).click();

    await expect(page.getByText('SOW-1048')).toBeVisible();
    await expect(page.getByText('SOW-1042')).toBeHidden();
  });

  test('shows the SOW description and template in the right sidebar with no approve/reject controls', async ({ page }) => {
    await page.goto('/tenantSlug/client/sows');
    await page.locator('tr').filter({ hasText: 'SOW-1042' }).click();

    await expect(page.getByText('Description')).toBeVisible();
    await expect(page.getByText(/Redesign and rebuild of the client-facing marketing site/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Approve' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Reject' })).toHaveCount(0);
  });

  test('posts a comment on the SOW', async ({ page }) => {
    await page.goto('/tenantSlug/client/sows');
    await page.locator('tr').filter({ hasText: 'SOW-1048' }).click();

    await expect(page.getByText('Please update Section 3')).toBeVisible();

    await page.getByPlaceholder('Leave a comment...').fill('Thanks, that works for us.');
    await page.getByRole('button', { name: 'Post comment' }).click();

    await expect(page.getByText('Thanks, that works for us.')).toBeVisible();
  });

  test('tags a comment to a specific template section', async ({ page }) => {
    await page.goto('/tenantSlug/client/sows');
    await page.locator('tr').filter({ hasText: 'SOW-1042' }).click();

    await page
      .locator('div')
      .filter({ has: page.getByRole('heading', { name: '3. Deliverables', exact: true }) })
      .first()
      .getByRole('button', { name: 'Comment' })
      .click();

    await expect(page.getByText('Commenting on: 3. Deliverables')).toBeVisible();
    await page.getByPlaceholder('Comment on 3. Deliverables...').fill('Can we add a QA checklist here?');
    await page.getByRole('button', { name: 'Post comment' }).click();

    await expect(page.getByRole('button', { name: '§ 3. Deliverables' })).toBeVisible();
    await expect(page.getByText('Can we add a QA checklist here?')).toBeVisible();
  });
});
