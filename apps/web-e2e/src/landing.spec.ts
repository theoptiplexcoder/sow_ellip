import { test, expect } from '@playwright/test';

test.describe('landing page', () => {
  test('renders the hero headline and primary CTAs', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Catch scope changes while it’s still cheap to fix them.' })
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get started' }).first()).toHaveAttribute('href', '/auth/signup');
    await expect(page.getByRole('link', { name: 'Sign in' }).first()).toHaveAttribute('href', '/auth/signin');
  });

  test('renders all main sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Built for how scope actually moves' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Never too late to change course' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Three promises, kept every time' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Trusted by operations teams' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Simple, no-fuss pricing' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Frequently asked questions' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Draft your first SOW, no fuss' })).toBeVisible();
  });

  test('renders the efficiency, feasibility, and robustness pillars', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Efficiency' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Feasibility' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Robustness' })).toBeVisible();
  });

  test('FAQ accordion expands and collapses on click', async ({ page }) => {
    await page.goto('/');
    const question = page.getByRole('button', { name: 'Can I reuse a previous SOW as a starting point?' });
    const answer = page.getByText('clone any existing SOW or start from an org template');

    await expect(answer).not.toBeVisible();
    await question.click();
    await expect(answer).toBeVisible();
    await question.click();
    await expect(answer).not.toBeVisible();
  });

  test('pricing section highlights the recommended plan', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Most popular')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Business' })).toBeVisible();
  });
});
