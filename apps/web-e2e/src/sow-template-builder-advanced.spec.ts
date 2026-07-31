import { test, expect } from '@playwright/test';

test.describe('SOW template document editor — advanced formatting', () => {
  test('applies underline, highlight, and text alignment from the toolbar', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows/new');

    const doc = page.locator('[contenteditable="true"]');
    await doc.click();
    await page.keyboard.type('Styled paragraph');
    await page.keyboard.press('Control+A');

    await page.getByRole('button', { name: 'Underline' }).click();
    await expect(doc.locator('u')).toHaveText('Styled paragraph');

    await page.getByRole('button', { name: 'Highlight' }).click();
    await expect(doc.locator('mark')).toHaveText('Styled paragraph');

    await page.getByRole('button', { name: 'Align center' }).click();
    await expect(doc.locator('p[style*="text-align: center"]')).toContainText('Styled paragraph');
  });

  test('inserts a task list with a checkbox', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows/new');

    const doc = page.locator('[contenteditable="true"]');
    await doc.click();
    await page.getByRole('button', { name: 'Task list' }).click();
    await page.keyboard.type('Deliver frontend');

    await expect(doc.locator('ul[data-type="taskList"] li')).toHaveCount(1);
    await expect(doc.locator('ul[data-type="taskList"] input[type="checkbox"]')).toHaveCount(1);
  });

  test('inserts a page break and a signature block from the toolbar', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows/new');

    const doc = page.locator('[contenteditable="true"]');
    await doc.click();
    await page.getByRole('button', { name: 'Insert page break' }).click();
    await expect(doc.locator('[data-page-break]')).toHaveCount(1);

    await page.getByRole('button', { name: 'Insert signature block' }).click();
    await expect(doc.locator('[data-signature-block]')).toHaveCount(1);
    await expect(doc.locator('[data-signature-block]')).toContainText('Approved By');
    await expect(doc.locator('[data-signature-block]')).toContainText('Date');
  });

  test('inserts a placeholder variable via the toolbar prompt', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows/new');

    const doc = page.locator('[contenteditable="true"]');
    await doc.click();

    page.once('dialog', (dialog) => dialog.accept('client_name'));
    await page.getByRole('button', { name: 'Insert variable' }).click();

    await expect(doc.locator('[data-placeholder-variable]')).toHaveText('{{client_name}}');
  });

  test('inserts a divider via the slash command menu', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows/new');

    const doc = page.locator('[contenteditable="true"]');
    await doc.click();
    await page.keyboard.type('/Divider');
    await page.getByText('Horizontal rule').waitFor();
    await page.keyboard.press('Enter');

    await expect(doc.locator('hr')).toHaveCount(1);
  });

  test('document outline lists headings and jumps to them on click', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows/new');

    const doc = page.locator('[contenteditable="true"]');
    await doc.click();
    await page.getByLabel('Text style').selectOption('1');
    await page.keyboard.type('Project Overview');

    await page.getByRole('button', { name: 'Document outline' }).click();
    const outline = page.getByRole('navigation', { name: 'Document outline' });
    await expect(outline.getByText('Project Overview')).toBeVisible();

    await outline.getByText('Project Overview').click();
    await expect(doc).toBeFocused();
  });

  test('find and replace updates matching text', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows/new');

    const doc = page.locator('[contenteditable="true"]');
    await doc.click();
    await page.keyboard.type('The budget is TBD for now.');

    await page.getByRole('button', { name: 'Find and replace' }).click();
    await page.getByLabel('Search').fill('TBD');
    await page.getByLabel('Replace with').fill('$5,000');
    await page.getByRole('button', { name: 'Replace all' }).click();

    await expect(doc).toContainText('The budget is $5,000 for now.');
  });

  test('toggles read-only mode and hides the formatting toolbar', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows/new');

    const doc = page.locator('[contenteditable="true"]');
    await doc.click();
    await page.keyboard.type('Locked content');

    await page.getByRole('button', { name: 'Make read-only' }).click();
    await expect(page.getByRole('button', { name: 'Bold' })).toHaveCount(0);
    await expect(doc).toHaveAttribute('contenteditable', 'false');

    await page.getByRole('button', { name: 'Enable editing' }).click();
    await expect(doc).toHaveAttribute('contenteditable', 'true');
    await expect(page.getByRole('button', { name: 'Bold' })).toBeVisible();
  });
});
