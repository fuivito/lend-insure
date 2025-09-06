import { test, expect } from '@playwright/test';

test.describe('Onboarding Wizard Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/start?token=demo');
    await page.waitForSelector('[data-testid="onboarding-wizard"]');
  });

  test('Step 1: Identity validation error', async ({ page }) => {
    // Navigate to identity step
    await expect(page.locator('h2').filter({ hasText: 'Let\'s verify your identity' })).toBeVisible();
    
    // Try to proceed without filling required fields
    await page.click('button:has-text("Verify Identity")');
    
    // Should remain on the same step due to validation
    await expect(page.locator('h2').filter({ hasText: 'Let\'s verify your identity' })).toBeVisible();
    
    // Fill in name but leave email empty
    await page.fill('#name', 'John Doe');
    await page.click('button:has-text("Verify Identity")');
    
    // Should still be disabled or show validation error
    await expect(page.locator('button:has-text("Verify Identity")')).toBeDisabled();
  });

  test('Step 2: Credit check consent validation', async ({ page }) => {
    // Complete step 1 first
    await page.fill('#name', 'John Doe');
    await page.fill('#email', 'john@example.com');
    await page.fill('#phone', '+44 7700 900123');
    await page.fill('#address-line1', '123 Test Street');
    await page.fill('#city', 'London');
    await page.fill('#postcode', 'SW1A 1AA');
    await page.click('button:has-text("Upload Document")');
    await page.click('button:has-text("Verify Identity")');
    
    // Should be on credit check step
    await expect(page.locator('h2').filter({ hasText: 'Credit Assessment' })).toBeVisible();
    
    // Try to run credit check without consent
    await page.click('button:has-text("Run Credit Check")');
    
    // Button should be disabled without consent
    await expect(page.locator('button:has-text("Run Credit Check")')).toBeDisabled();
    
    // Check consent
    await page.check('#credit-consent');
    await expect(page.locator('button:has-text("Run Credit Check")')).not.toBeDisabled();
  });

  test('Step 3: Bank connection validation', async ({ page }) => {
    // Complete steps 1 and 2
    await completeIdentityStep(page);
    await completeCreditCheckStep(page);
    
    // Should be on bank setup step
    await expect(page.locator('h2').filter({ hasText: 'Bank Account Setup' })).toBeVisible();
    
    // Try to proceed without connecting bank
    const nextButton = page.locator('button:has-text("Continue")');
    await expect(nextButton).toBeDisabled();
    
    // Connect bank
    await page.click('button:has-text("Select Your Bank")');
    await page.click('button:has-text("HSBC")');
    
    // Wait for connection
    await expect(page.locator('text=Bank Account Connected')).toBeVisible({ timeout: 5000 });
    
    // Try to proceed without signing mandate
    await expect(nextButton).toBeDisabled();
  });

  test('Step 4: Plan summary validation', async ({ page }) => {
    // Complete steps 1-3
    await completeIdentityStep(page);
    await completeCreditCheckStep(page);
    await completeBankSetupStep(page);
    
    // Should be on plan summary step
    await expect(page.locator('h2').filter({ hasText: 'Review Your Plan' })).toBeVisible();
    
    // Try to proceed without confirming plan
    const nextButton = page.locator('button:has-text("Continue")');
    await expect(nextButton).toBeDisabled();
    
    // Confirm plan
    await page.click('button:has-text("Confirm Plan Details")');
    await expect(nextButton).not.toBeDisabled();
  });

  test('Step 5: E-signature validation', async ({ page }) => {
    // Complete steps 1-4
    await completeIdentityStep(page);
    await completeCreditCheckStep(page);
    await completeBankSetupStep(page);
    await completePlanSummaryStep(page);
    
    // Should be on e-signature step
    await expect(page.locator('h2').filter({ hasText: 'Digital Signature & Final Agreements' })).toBeVisible();
    
    // Try to complete without signature or agreements
    const finishButton = page.locator('button:has-text("Complete Application")');
    await expect(finishButton).toBeDisabled();
    
    // Check agreements but no signature
    await page.check('#terms');
    await page.check('#secci');
    await expect(finishButton).toBeDisabled();
    
    // Add typed signature
    await page.click('[data-testid="type-signature-tab"]');
    await page.fill('#typed-signature', 'John Doe');
    await page.click('button:has-text("Apply Signature")');
    
    // Should now be able to complete
    await expect(finishButton).not.toBeDisabled();
  });
});

// Helper functions
async function completeIdentityStep(page) {
  await page.fill('#name', 'John Doe');
  await page.fill('#email', 'john@example.com');
  await page.fill('#phone', '+44 7700 900123');
  await page.fill('#address-line1', '123 Test Street');
  await page.fill('#city', 'London');
  await page.fill('#postcode', 'SW1A 1AA');
  await page.click('button:has-text("Upload Document")');
  await page.click('button:has-text("Verify Identity")');
}

async function completeCreditCheckStep(page) {
  await page.check('#credit-consent');
  await page.click('button:has-text("Run Credit Check")');
  await expect(page.locator('text=Credit check passed!')).toBeVisible({ timeout: 5000 });
}

async function completeBankSetupStep(page) {
  await page.click('button:has-text("Select Your Bank")');
  await page.click('button:has-text("HSBC")');
  await expect(page.locator('text=Bank Account Connected')).toBeVisible({ timeout: 5000 });
  await page.click('button:has-text("Sign Direct Debit Mandate")');
  await page.click('button:has-text("Confirm & Sign Mandate")');
}

async function completePlanSummaryStep(page) {
  await page.click('button:has-text("Confirm Plan Details")');
}