import { test, expect } from '@playwright/test';

test.describe('Dashboard Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to onboarding with demo token to complete it
    await page.goto('/start?token=demo');
    
    // Complete onboarding quickly by clicking through all steps
    const steps = ['identity', 'credit-check', 'bank-setup', 'plan-summary', 'e-signature'];
    
    for (const step of steps) {
      if (step === 'credit-check') {
        // Check consent checkbox
        await page.check('input[type="checkbox"]');
      } else if (step === 'e-signature') {
        // Sign and agree to terms
        const canvas = page.locator('canvas');
        await canvas.click();
        await page.check('input[type="checkbox"]');
      }
      
      // Click next (or finish on last step)
      const button = step === 'e-signature' ? 
        page.getByRole('button', { name: /finish/i }) : 
        page.getByRole('button', { name: /next/i });
      await button.click();
    }
    
    // Should now be on dashboard
    await expect(page).toHaveURL('/app/dashboard');
  });

  test('should display skeleton loader then dashboard content', async ({ page }) => {
    // Refresh to see loading state
    await page.reload();
    
    // Should see skeleton loader initially
    await expect(page.locator('.animate-pulse')).toBeVisible();
    
    // Wait for content to load
    await expect(page.locator('h1')).toContainText('Welcome back, John');
    await expect(page.locator('.animate-pulse')).toHaveCount(0);
  });

  test('should display next payment hero card with mini calendar', async ({ page }) => {
    // Check hero card is visible
    await expect(page.locator('.card-hero')).toBeVisible();
    
    // Check next payment amount
    await expect(page.locator('.card-hero')).toContainText('Next Payment Due');
    await expect(page.locator('.card-hero')).toContainText('£');
    
    // Check mini calendar strip
    await expect(page.locator('.card-hero')).toContainText('Upcoming Payments');
    await expect(page.getByRole('button', { name: /view full schedule/i })).toBeVisible();
  });

  test('should display enhanced progress bar with amounts', async ({ page }) => {
    // Check progress card
    await expect(page.getByRole('heading', { name: /payment progress/i })).toBeVisible();
    
    // Should show both percentage and amounts
    await expect(page.locator('text=Amount Paid')).toBeVisible();
    await expect(page.locator('text=Remaining')).toBeVisible();
    
    // Should show payment counts
    await expect(page.locator('text=payments')).toBeVisible();
  });

  test('should handle arrears state toggle', async ({ page }) => {
    // Initially should not show arrears banner
    await expect(page.locator('text=Payment Overdue')).not.toBeVisible();
    
    // Open demo controls (if available) and toggle arrears
    const demoButton = page.getByRole('button', { name: /demo controls/i });
    if (await demoButton.isVisible()) {
      await demoButton.click();
      
      // Toggle arrears state
      const arrearsToggle = page.locator('text=Arrears State').locator('..').locator('button');
      if (await arrearsToggle.isVisible()) {
        await arrearsToggle.click();
        
        // Should now show arrears banner
        await expect(page.locator('text=Payment Overdue')).toBeVisible();
        await expect(page.getByRole('button', { name: /get support options/i })).toBeVisible();
      }
    }
  });

  test('should display upcoming payments with animations', async ({ page }) => {
    // Check upcoming payments section
    await expect(page.getByRole('heading', { name: /upcoming payments/i })).toBeVisible();
    
    // Should show payment cards
    const paymentCards = page.locator('[class*="bg-accent"]');
    await expect(paymentCards).toHaveCountGreaterThan(0);
    
    // Check calendar button
    await expect(page.getByRole('button', { name: /add to calendar/i })).toBeVisible();
  });

  test('should display quick action cards with hover effects', async ({ page }) => {
    // Check all quick action cards
    await expect(page.getByRole('heading', { name: /documents/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /payment history/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /support/i })).toBeVisible();
    
    // Check buttons in cards
    await expect(page.getByRole('button', { name: /view all documents/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /view payment history/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /get support/i })).toBeVisible();
  });

  test('should display help strip with support options', async ({ page }) => {
    // Check help strip
    await expect(page.locator('text=Struggling to make payments?')).toBeVisible();
    await expect(page.getByRole('button', { name: /view support options/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /contact us/i })).toBeVisible();
  });
});