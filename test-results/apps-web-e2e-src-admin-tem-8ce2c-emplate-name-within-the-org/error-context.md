# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: apps/web-e2e/src/admin-templates.spec.ts >> admin templates page >> rejects a duplicate template name within the org
- Location: apps/web-e2e/src/admin-templates.spec.ts:23:7

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/tenantSlug/admin/templates", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('admin templates page', () => {
  4  |   test('lists existing templates', async ({ page }) => {
  5  |     await page.goto('/tenantSlug/admin/templates');
  6  |     await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible();
  7  |     await expect(page.getByText('Standard Consulting SOW')).toBeVisible();
  8  |   });
  9  | 
  10 |   test('opens the rich text template editor with section tabs', async ({ page }) => {
  11 |     await page.goto('/tenantSlug/admin/templates');
  12 |     await page.getByRole('button', { name: 'New template' }).click();
  13 | 
  14 |     await expect(page.getByRole('heading', { name: 'New template' })).toBeVisible();
  15 |     await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible();
  16 |     await expect(page.getByRole('tab', { name: 'Objectives' })).toBeVisible();
  17 |     await expect(page.getByRole('button', { name: 'Bold' })).toBeVisible();
  18 | 
  19 |     await page.getByRole('button', { name: 'Back to templates' }).click();
  20 |     await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible();
  21 |   });
  22 | 
  23 |   test('rejects a duplicate template name within the org', async ({ page }) => {
> 24 |     await page.goto('/tenantSlug/admin/templates');
     |                ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  25 |     await page.getByRole('button', { name: 'New template' }).click();
  26 | 
  27 |     await page.getByLabel('Name').fill('Standard Consulting SOW');
  28 |     await page.getByRole('button', { name: 'Create template' }).click();
  29 | 
  30 |     await expect(page.getByText(/already exists/)).toBeVisible();
  31 |     await expect(page.getByRole('heading', { name: 'New template' })).toBeVisible();
  32 |   });
  33 | 
  34 |   test('creates a template with rich text default sections', async ({ page }) => {
  35 |     await page.goto('/tenantSlug/admin/templates');
  36 |     await page.getByRole('button', { name: 'New template' }).click();
  37 | 
  38 |     await page.getByLabel('Name').fill('Marketing Retainer');
  39 |     const overviewEditor = page.locator('[contenteditable="true"]').first();
  40 |     await overviewEditor.click();
  41 |     await overviewEditor.type('Default overview for marketing retainers.');
  42 |     await page.getByRole('button', { name: 'Create template' }).click();
  43 | 
  44 |     await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible();
  45 |     await expect(page.getByText('Marketing Retainer')).toBeVisible();
  46 |   });
  47 | 
  48 |   test('duplicates a template', async ({ page }) => {
  49 |     await page.goto('/tenantSlug/admin/templates');
  50 |     const row = page.locator('tr').filter({ hasText: 'Fixed-Bid Development' });
  51 |     await row.getByRole('button', { name: 'Duplicate' }).click();
  52 |     await expect(page.getByText('Fixed-Bid Development (copy)')).toBeVisible();
  53 |   });
  54 | 
  55 |   test('archives a template via the active toggle', async ({ page }) => {
  56 |     await page.goto('/tenantSlug/admin/templates');
  57 |     const row = page.locator('tr').filter({ hasText: 'Standard Consulting SOW' });
  58 |     await row.getByRole('switch').click();
  59 |     await expect(row.getByText('Archived')).toBeVisible();
  60 |   });
  61 | });
  62 | 
```