import { test, expect } from '@playwright/test';

test.describe('landing page auth links', () => {
  test('sign in / sign up links point to the auth routes', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Sign in' }).first()).toHaveAttribute('href', '/auth/signin');
    await expect(page.getByRole('link', { name: 'Get started' }).first()).toHaveAttribute('href', '/auth/signup');
  });
});

test.describe('auth tabs', () => {
  test('switches between sign in and create organization', async ({ page }) => {
    await page.goto('/auth/signin');
    await expect(page.getByRole('link', { name: 'Sign In' })).toHaveAttribute('href', '/auth/signin');

    await page.getByRole('link', { name: 'Create Organization' }).click();
    await expect(page).toHaveURL(/\/auth\/signup$/);

    await page.getByRole('link', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/auth\/signin$/);
  });
});

test.describe('sign in page', () => {
  test('renders the sign-in form', async ({ page }) => {
    await page.goto('/auth/signin');
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('toggles password visibility', async ({ page }) => {
    await page.goto('/auth/signin');
    const password = page.getByLabel('Password');
    await password.fill('supersecret');
    await expect(password).toHaveAttribute('type', 'password');

    await page.getByRole('button', { name: 'Show password' }).click();
    await expect(password).toHaveAttribute('type', 'text');

    await page.getByRole('button', { name: 'Hide password' }).click();
    await expect(password).toHaveAttribute('type', 'password');
  });

  test('autofills the form from a demo account', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.getByRole('listitem').filter({ hasText: 'Ava Shah' }).getByRole('button', { name: 'Use' }).click();

    await expect(page.getByLabel('Email address')).toHaveValue('ava@acme-consulting.example');
    await expect(page.getByLabel('Password')).toHaveValue('demo1234');
  });

  test('shows a pending-approval banner when status=pending', async ({ page }) => {
    await page.goto('/auth/signin?status=pending');
    await expect(page.getByText('still awaiting approval')).toBeVisible();
  });

  test('shows a rejected banner when status=rejected', async ({ page }) => {
    await page.goto('/auth/signin?status=rejected');
    await expect(page.getByText('was not approved')).toBeVisible();
  });
});

test.describe('sign up page', () => {
  test('renders the organization signup form', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.getByRole('heading', { name: 'Set up your organization' })).toBeVisible();
    for (const label of ['Organization name', 'Organization slug', 'Your name', 'Email', 'Phone', 'Password']) {
      await expect(page.getByLabel(label)).toBeVisible();
    }
  });

  test('auto-generates a slug from the organization name until edited manually', async ({ page }) => {
    await page.goto('/auth/signup');
    await page.getByLabel('Organization name').fill('Acme Consulting Co');
    await expect(page.getByLabel('Organization slug')).toHaveValue('acme-consulting-co');

    await page.getByLabel('Organization slug').fill('acme');
    await page.getByLabel('Organization name').fill('Acme Consulting Co Renamed');
    await expect(page.getByLabel('Organization slug')).toHaveValue('acme');
  });

  test('shows an awaiting-approval confirmation after submit', async ({ page }) => {
    await page.goto('/auth/signup');
    await page.getByLabel('Organization name').fill('Acme Consulting');
    await page.getByLabel('Your name').fill('Jordan Reyes');
    await page.getByLabel('Email').fill('jordan@acme.test');
    await page.getByLabel('Phone').fill('+1 555 000 0000');
    await page.getByLabel('Password').fill('supersecret');
    await page.getByRole('button', { name: 'Submit for approval' }).click();

    await expect(page.getByRole('heading', { name: 'Request submitted' })).toBeVisible();
    await expect(page.getByText('jordan@acme.test')).toBeVisible();
    await page.getByRole('link', { name: 'Back to sign in' }).click();
    await expect(page).toHaveURL(/\/auth\/signin$/);
  });
});
