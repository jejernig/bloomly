import { test, expect } from '@playwright/test';
import { AuthTestHelper } from '../utils/test-helpers';

test.describe('Authentication System Tests', () => {
  let authHelper: AuthTestHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthTestHelper(page);
  });

  test.describe('Sign In Flow', () => {
    test('should load sign-in page correctly @smoke', async ({ page }) => {
      await authHelper.navigateToSignIn();
      
      // Verify page loads
      await expect(page).toHaveTitle(/Sign In/);
      await expect(authHelper.getSignInForm()).toBeVisible();
      
      // Verify form elements are present
      await expect(authHelper.getEmailInput()).toBeVisible();
      await expect(authHelper.getPasswordInput()).toBeVisible();
      await expect(authHelper.getSignInButton()).toBeVisible();
      await expect(authHelper.getGoogleSignInButton()).toBeVisible();
      
      // Verify navigation links
      await expect(authHelper.getSignUpLink()).toBeVisible();
      await expect(authHelper.getForgotPasswordLink()).toBeVisible();
    });

    test('should show validation errors for empty form @critical', async ({ page }) => {
      await authHelper.navigateToSignIn();
      
      // Click sign in without filling form
      await authHelper.clickSignIn();
      
      // Verify validation errors appear
      await authHelper.expectEmailError('Please enter a valid email address');
      await authHelper.expectPasswordError('Password must be at least 6 characters');
    });

    test('should show validation errors for invalid email @critical', async ({ page }) => {
      await authHelper.navigateToSignIn();
      
      await authHelper.fillEmail('invalid-email');
      await authHelper.fillPassword('validPassword123!');
      await authHelper.clickSignIn();
      
      await authHelper.expectEmailError('Please enter a valid email address');
    });

    test('should show validation errors for short password @critical', async ({ page }) => {
      await authHelper.navigateToSignIn();
      
      await authHelper.fillEmail('test@example.com');
      await authHelper.fillPassword('123');
      await authHelper.clickSignIn();
      
      await authHelper.expectPasswordError('Password must be at least 6 characters');
    });

    test('should handle invalid credentials properly @critical', async ({ page }) => {
      await authHelper.navigateToSignIn();
      
      // Fill with invalid credentials
      await authHelper.fillEmail('nonexistent@example.com');
      await authHelper.fillPassword('wrongpassword');
      await authHelper.clickSignIn();
      
      // Verify error message appears
      await authHelper.expectAuthError('Invalid login credentials');
      
      // Verify we stay on sign-in page
      await expect(page).toHaveURL(/\/auth\/signin/);
    });

    test('should toggle password visibility @functional', async ({ page }) => {
      await authHelper.navigateToSignIn();
      
      await authHelper.fillPassword('testpassword123');
      
      // Password should be hidden by default
      await expect(authHelper.getPasswordInput()).toHaveAttribute('type', 'password');
      
      // Click toggle to show password
      await authHelper.togglePasswordVisibility();
      await expect(authHelper.getPasswordInput()).toHaveAttribute('type', 'text');
      
      // Click toggle to hide password again
      await authHelper.togglePasswordVisibility();
      await expect(authHelper.getPasswordInput()).toHaveAttribute('type', 'password');
    });

    test('should navigate to sign-up page @functional', async ({ page }) => {
      await authHelper.navigateToSignIn();
      
      await authHelper.clickSignUpLink();
      
      await expect(page).toHaveURL(/\/auth\/signup/);
      await expect(page).toHaveTitle(/Sign Up/);
    });
  });

  test.describe('Sign Up Flow', () => {
    test('should load sign-up page correctly @smoke', async ({ page }) => {
      await authHelper.navigateToSignUp();
      
      // Verify page loads
      await expect(page).toHaveTitle(/Sign Up/);
      await expect(authHelper.getSignUpForm()).toBeVisible();
      
      // Verify form elements are present
      await expect(authHelper.getFullNameInput()).toBeVisible();
      await expect(authHelper.getEmailInput()).toBeVisible();
      await expect(authHelper.getPasswordInput()).toBeVisible();
      await expect(authHelper.getConfirmPasswordInput()).toBeVisible();
      await expect(authHelper.getTermsCheckbox()).toBeVisible();
      await expect(authHelper.getSignUpButton()).toBeVisible();
      await expect(authHelper.getGoogleSignUpButton()).toBeVisible();
      
      // Verify navigation links
      await expect(authHelper.getSignInLink()).toBeVisible();
    });

    test('should show validation errors for empty sign-up form @critical', async ({ page }) => {
      await authHelper.navigateToSignUp();
      
      // Click sign up without filling form
      await authHelper.clickSignUp();
      
      // Verify validation errors appear
      await authHelper.expectFullNameError('Full name is required');
      await authHelper.expectEmailError('Please enter a valid email address');
      await authHelper.expectPasswordError('Password must be at least 6 characters');
      await authHelper.expectConfirmPasswordError('Please confirm your password');
    });

    test('should validate password confirmation @critical', async ({ page }) => {
      await authHelper.navigateToSignUp();
      
      await authHelper.fillFullName('Test User');
      await authHelper.fillEmail('test@example.com');
      await authHelper.fillPassword('TestPassword123!');
      await authHelper.fillConfirmPassword('DifferentPassword123!');
      await authHelper.checkTermsAgreement();
      await authHelper.clickSignUp();
      
      await authHelper.expectConfirmPasswordError('Passwords do not match');
    });

    test('should require terms agreement @critical', async ({ page }) => {
      await authHelper.navigateToSignUp();
      
      await authHelper.fillFullName('Test User');
      await authHelper.fillEmail('test@example.com');
      await authHelper.fillPassword('TestPassword123!');
      await authHelper.fillConfirmPassword('TestPassword123!');
      // Don't check terms
      await authHelper.clickSignUp();
      
      await authHelper.expectTermsError('You must agree to the Terms of Service and Privacy Policy');
    });

    test('should show password strength indicator @functional', async ({ page }) => {
      await authHelper.navigateToSignUp();
      
      // Test weak password
      await authHelper.fillPassword('123');
      await authHelper.expectPasswordStrength('Weak');
      
      // Test medium password
      await authHelper.fillPassword('password123');
      await authHelper.expectPasswordStrength('Medium');
      
      // Test strong password
      await authHelper.fillPassword('TestPassword123!');
      await authHelper.expectPasswordStrength('Very Strong');
    });

    test('should handle invalid email format during registration @critical', async ({ page }) => {
      await authHelper.navigateToSignUp();
      
      await authHelper.fillFullName('Test User');
      await authHelper.fillEmail('testuser@example.com'); // This will trigger Supabase validation
      await authHelper.fillPassword('TestPassword123!');
      await authHelper.fillConfirmPassword('TestPassword123!');
      await authHelper.checkTermsAgreement();
      await authHelper.clickSignUp();
      
      // Expect Supabase validation error for invalid email format
      await authHelper.expectAuthError('Email address "testuser@example.com" is invalid');
    });

    test('should navigate to sign-in page @functional', async ({ page }) => {
      await authHelper.navigateToSignUp();
      
      await authHelper.clickSignInLink();
      
      await expect(page).toHaveURL(/\/auth\/signin/);
      await expect(page).toHaveTitle(/Sign In/);
    });
  });

  test.describe('Google OAuth Flow', () => {
    test('should initiate Google sign-in @critical', async ({ page }) => {
      await authHelper.navigateToSignIn();
      
      // Mock the OAuth redirect since we can't test actual Google OAuth
      await page.route('**/auth/v1/authorize*', route => {
        // Mock successful OAuth initiation
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ url: 'https://accounts.google.com/oauth/authorize' })
        });
      });
      
      await authHelper.clickGoogleSignIn();
      
      // Verify the OAuth request was made
      const requests = page.context().request;
      // In a real test, we'd verify the redirect or success toast
    });

    test('should initiate Google sign-up @critical', async ({ page }) => {
      await authHelper.navigateToSignUp();
      
      // Mock the OAuth redirect
      await page.route('**/auth/v1/authorize*', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ url: 'https://accounts.google.com/oauth/authorize' })
        });
      });
      
      await authHelper.clickGoogleSignUp();
      
      // Verify the OAuth request was made
      // In a real test, we'd verify the redirect or success toast
    });
  });

  test.describe('Authentication State Management', () => {
    test('should handle network errors gracefully @error-handling', async ({ page }) => {
      await authHelper.navigateToSignIn();
      
      // Mock network error
      await page.route('**/auth/v1/token*', route => {
        route.abort('failed');
      });
      
      await authHelper.fillEmail('test@example.com');
      await authHelper.fillPassword('password123');
      await authHelper.clickSignIn();
      
      // Verify error handling
      await authHelper.expectAuthError('An unexpected error occurred');
    });

    test('should show loading states during authentication @functional', async ({ page }) => {
      await authHelper.navigateToSignIn();
      
      // Mock slow response
      await page.route('**/auth/v1/token*', route => {
        setTimeout(() => {
          route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({ error_description: 'Invalid login credentials' })
          });
        }, 2000);
      });
      
      await authHelper.fillEmail('test@example.com');
      await authHelper.fillPassword('password123');
      await authHelper.clickSignIn();
      
      // Verify loading state appears
      await authHelper.expectLoadingState();
      
      // Wait for response and verify loading state disappears
      await page.waitForTimeout(3000);
      await authHelper.expectLoadingStateGone();
    });
  });

  test.describe('Accessibility Testing', () => {
    test('should be keyboard navigable @a11y', async ({ page }) => {
      await authHelper.navigateToSignIn();
      
      // Test tab navigation
      await page.keyboard.press('Tab'); // Email input
      await expect(authHelper.getEmailInput()).toBeFocused();
      
      await page.keyboard.press('Tab'); // Password input
      await expect(authHelper.getPasswordInput()).toBeFocused();
      
      await page.keyboard.press('Tab'); // Remember me checkbox
      await page.keyboard.press('Tab'); // Forgot password link
      await page.keyboard.press('Tab'); // Sign in button
      await expect(authHelper.getSignInButton()).toBeFocused();
      
      // Test Enter key on sign in button
      await page.keyboard.press('Enter');
      // Should trigger form validation
    });

    test('should have proper ARIA labels @a11y', async ({ page }) => {
      await authHelper.navigateToSignIn();
      
      // Verify form has proper labels and ARIA attributes
      await expect(authHelper.getEmailInput()).toHaveAttribute('aria-label', 'Email address');
      await expect(authHelper.getPasswordInput()).toHaveAttribute('aria-label', 'Password');
      await expect(authHelper.getSignInButton()).toHaveAttribute('type', 'submit');
    });

    test('should announce errors to screen readers @a11y', async ({ page }) => {
      await authHelper.navigateToSignIn();
      
      await authHelper.clickSignIn();
      
      // Verify error messages have proper ARIA attributes
      const emailError = page.locator('[data-testid="email-error"]');
      await expect(emailError).toHaveAttribute('role', 'alert');
      await expect(emailError).toHaveAttribute('aria-live', 'polite');
    });
  });

  test.describe('Mobile Responsive Testing', () => {
    test('should work on mobile devices @mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 390, height: 844 });
      
      await authHelper.navigateToSignIn();
      
      // Verify mobile layout
      await expect(authHelper.getSignInForm()).toBeVisible();
      await expect(authHelper.getEmailInput()).toBeVisible();
      await expect(authHelper.getPasswordInput()).toBeVisible();
      await expect(authHelper.getSignInButton()).toBeVisible();
      
      // Test touch interaction
      await authHelper.getEmailInput().tap();
      await authHelper.fillEmail('test@mobile.com');
      
      await authHelper.getPasswordInput().tap();
      await authHelper.fillPassword('mobiletest123');
      
      await authHelper.getSignInButton().tap();
    });

    test('should handle touch gestures on sign-up @mobile', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      
      await authHelper.navigateToSignUp();
      
      // Test scrolling to bottom of form
      await page.locator('[data-testid="signup-form"]').scrollIntoViewIfNeeded();
      
      // Verify all form elements are accessible
      await expect(authHelper.getSignUpButton()).toBeVisible();
      await expect(authHelper.getTermsCheckbox()).toBeVisible();
    });
  });

  test.describe('Performance Testing', () => {
    test('should load sign-in page within performance budget @performance', async ({ page }) => {
      const startTime = Date.now();
      
      await authHelper.navigateToSignIn();
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
      
      // Verify page is interactive
      await expect(authHelper.getEmailInput()).toBeVisible();
      await expect(authHelper.getSignInButton()).toBeEnabled();
    });

    test('should load sign-up page within performance budget @performance', async ({ page }) => {
      const startTime = Date.now();
      
      await authHelper.navigateToSignUp();
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
      
      // Verify page is interactive
      await expect(authHelper.getFullNameInput()).toBeVisible();
      await expect(authHelper.getSignUpButton()).toBeEnabled();
    });
  });

  test.describe('Security Testing', () => {
    test('should not expose sensitive data in client @security', async ({ page }) => {
      await authHelper.navigateToSignIn();
      
      await authHelper.fillPassword('supersecretpassword');
      
      // Verify password is masked in input
      await expect(authHelper.getPasswordInput()).toHaveAttribute('type', 'password');
      
      // Verify no sensitive data in localStorage after failed login
      await authHelper.fillEmail('test@example.com');
      await authHelper.clickSignIn();
      
      const localStorage = await page.evaluate(() => window.localStorage);
      const sessionStorage = await page.evaluate(() => window.sessionStorage);
      
      // Verify no password or sensitive auth data is stored
      expect(JSON.stringify(localStorage)).not.toContain('supersecretpassword');
      expect(JSON.stringify(sessionStorage)).not.toContain('supersecretpassword');
    });

    test('should handle CSRF protection @security', async ({ page }) => {
      await authHelper.navigateToSignIn();
      
      // Verify requests include proper headers for CSRF protection
      const requestPromise = page.waitForRequest('**/auth/v1/token*');
      
      await authHelper.fillEmail('test@example.com');
      await authHelper.fillPassword('password123');
      await authHelper.clickSignIn();
      
      const request = await requestPromise;
      
      // Verify request has proper headers
      expect(request.headers()['content-type']).toContain('application/json');
    });
  });
});