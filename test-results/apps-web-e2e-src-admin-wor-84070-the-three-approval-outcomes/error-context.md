# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: apps/web-e2e/src/admin-workflows.spec.ts >> admin workflows page >> opens the workflow canvas showing the three approval outcomes
- Location: apps/web-e2e/src/admin-workflows.spec.ts:11:7

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/tenantSlug/admin/workflows", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('admin workflows page', () => {
  4  |   test('lists existing workflows with ordered steps', async ({ page }) => {
  5  |     await page.goto('/tenantSlug/admin/workflows');
  6  |     await expect(page.getByRole('heading', { name: 'Workflows' })).toBeVisible();
  7  |     await expect(page.getByText('Standard 2-step')).toBeVisible();
  8  |     await expect(page.getByText(/Manager review/)).toBeVisible();
  9  |   });
  10 | 
  11 |   test('opens the workflow canvas showing the three approval outcomes', async ({ page }) => {
> 12 |     await page.goto('/tenantSlug/admin/workflows');
     |                ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  13 |     await page.getByRole('button', { name: 'New workflow' }).click();
  14 | 
  15 |     await expect(page.getByRole('heading', { name: 'New workflow' })).toBeVisible();
  16 |     await expect(page.getByText('Creator submits')).toBeVisible();
  17 |     await expect(page.getByText('Approved')).toBeVisible();
  18 |     await expect(page.getByText('Rejected')).toBeVisible();
  19 |     await expect(page.getByText('Changes requested').first()).toBeVisible();
  20 | 
  21 |     await page.getByRole('button', { name: 'Back to workflows' }).click();
  22 |     await expect(page.getByRole('heading', { name: 'Workflows' })).toBeVisible();
  23 |   });
  24 | 
  25 |   test('creates a workflow with multiple ordered steps', async ({ page }) => {
  26 |     await page.goto('/tenantSlug/admin/workflows');
  27 |     await page.getByRole('button', { name: 'New workflow' }).click();
  28 | 
  29 |     await page.getByLabel('Name').fill('Legal review');
  30 |     await page.getByPlaceholder('Step label').fill('Legal check');
  31 |     await page.getByRole('button', { name: 'Add step' }).click();
  32 |     await page.getByPlaceholder('Step label').nth(1).fill('Final sign-off');
  33 |     await page.getByRole('button', { name: 'Create workflow' }).click();
  34 | 
  35 |     await expect(page.getByRole('heading', { name: 'Workflows' })).toBeVisible();
  36 |     await expect(page.getByText('Legal review')).toBeVisible();
  37 |     await expect(page.getByText(/1\. Legal check/)).toBeVisible();
  38 |     await expect(page.getByText(/2\. Final sign-off/)).toBeVisible();
  39 |   });
  40 | 
  41 |   test('rejects a duplicate workflow name within the org', async ({ page }) => {
  42 |     await page.goto('/tenantSlug/admin/workflows');
  43 |     await page.getByRole('button', { name: 'New workflow' }).click();
  44 | 
  45 |     await page.getByLabel('Name').fill('Standard 2-step');
  46 |     await page.getByPlaceholder('Step label').fill('Step one');
  47 |     await page.getByRole('button', { name: 'Create workflow' }).click();
  48 | 
  49 |     await expect(page.getByText(/already exists/)).toBeVisible();
  50 |     await expect(page.getByRole('heading', { name: 'New workflow' })).toBeVisible();
  51 |   });
  52 | 
  53 |   test('toggles a workflow active state', async ({ page }) => {
  54 |     await page.goto('/tenantSlug/admin/workflows');
  55 |     const row = page.locator('tr').filter({ hasText: 'Single approver' });
  56 |     await row.getByRole('switch').click();
  57 |     await expect(row.getByText('Active', { exact: true })).toBeVisible();
  58 |   });
  59 | });
  60 | 
```