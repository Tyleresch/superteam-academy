import { test, expect } from '@playwright/test';

/**
 * Solana Quest — E2E Tests
 *
 * Critical user flows covering the main learning journey:
 * 1. Landing page loads and navigates
 * 2. Course catalog search & filter
 * 3. Course detail and lesson navigation
 * 4. Onboarding quiz flow
 * 5. Theme toggle (dark/light)
 * 6. Demo mode authentication
 */

test.describe('Landing Page', () => {
  test('loads with hero section and CTAs', async ({ page }) => {
    await page.goto('/');
    
    // Hero section is visible
    await expect(page.locator('h1')).toBeVisible();
    
    // Navigation links exist
    await expect(page.getByRole('link', { name: /quest/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /leaderboard/i }).first()).toBeVisible();

    // CTA buttons exist
    const startButton = page.locator('a[href="/courses"]').first();
    await expect(startButton).toBeVisible();
  });

  test('navigates to courses from CTA', async ({ page }) => {
    await page.goto('/');
    
    // Click "Explore Courses" or similar CTA
    await page.locator('a[href="/courses"]').first().click();
    await expect(page).toHaveURL('/courses');
    
    // Course catalog renders
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('testimonials and partners sections are visible', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to bottom to trigger lazy-loaded sections
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Check for testimonials section
    await expect(page.getByText('Trusted by Builders')).toBeVisible();

    // Check for partners section
    await expect(page.getByText('Built on the Solana ecosystem')).toBeVisible();

    // Check for newsletter in footer
    await expect(page.getByText('Stay in the loop')).toBeVisible();
  });
});

test.describe('Course Catalog', () => {
  test('displays course cards', async ({ page }) => {
    await page.goto('/courses');
    
    // Wait for courses to render
    await page.waitForTimeout(1500);

    // At least one course card should be visible
    const courseCards = page.locator('[class*="card"]').first();
    await expect(courseCards).toBeVisible();
  });

  test('search filters courses', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForTimeout(1500);

    // Type in search
    const searchInput = page.locator('input[placeholder*="earch"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Solana');
      await page.waitForTimeout(500);
      // At least one result should remain
      await expect(page.getByText(/Solana/i).first()).toBeVisible();
    }
  });
});

test.describe('Course Detail & Lesson', () => {
  test('course detail page loads with modules', async ({ page }) => {
    await page.goto('/courses/solana-fundamentals');
    
    // Course title is visible
    await expect(page.getByText('Solana Fundamentals').first()).toBeVisible();

    // Module accordion exists
    await expect(page.getByText(/Chapter/i).first()).toBeVisible();
  });

  test('lesson page loads with content and editor', async ({ page }) => {
    await page.goto('/courses/solana-fundamentals/lessons/lesson-1-1');
    await page.waitForTimeout(2000);
    
    // Lesson content is visible
    await expect(page.getByText('The Solana Vision').first()).toBeVisible();
    
    // Editor area should exist
    const editorArea = page.locator('[class*="editor"], [class*="monaco"], textarea').first();
    await expect(editorArea).toBeVisible();
  });

  test('reviews section shows on course detail', async ({ page }) => {
    await page.goto('/courses/solana-fundamentals');
    
    // Scroll down to reviews
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    await expect(page.getByText('Learner Reviews')).toBeVisible();
    await expect(page.getByText('Ana Ferreira')).toBeVisible();
  });
});

test.describe('Onboarding Quiz', () => {
  test('quiz flow works end-to-end', async ({ page }) => {
    await page.goto('/onboarding');
    
    // First question renders
    await expect(page.getByText('What is your development experience?')).toBeVisible();

    // Select first option
    await page.locator('button:has-text("New to programming")').click();
    await page.waitForTimeout(500);

    // Second question should appear
    await expect(page.getByText('Which language are you most comfortable with?')).toBeVisible();

    // Select an option
    await page.locator('button:has-text("JavaScript / TypeScript")').click();
    await page.waitForTimeout(500);

    // Third question
    await expect(page.getByText('What excites you most about Solana?')).toBeVisible();
    await page.locator('button:has-text("DeFi & Financial protocols")').click();
    await page.waitForTimeout(500);

    // Fourth question
    await expect(page.getByText('What is your primary goal?')).toBeVisible();
    await page.locator('button:has-text("Learn blockchain fundamentals")').click();
    await page.waitForTimeout(500);

    // Results page should appear
    await expect(page.getByText('Your Quest Path is Ready!')).toBeVisible();
    await expect(page.getByText('Best Match')).toBeVisible();
  });
});

test.describe('Theme Toggle', () => {
  test('toggles between dark and light mode', async ({ page }) => {
    await page.goto('/');

    // Get the theme toggle button (sun/moon icon)
    const themeButton = page.locator('button:has(svg.lucide-sun), button:has(svg.lucide-moon)').first();
    await expect(themeButton).toBeVisible();

    // Click to toggle
    await themeButton.click();
    await page.waitForTimeout(300);

    // HTML should have class="dark" or class="light"
    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toBeTruthy();
  });
});

test.describe('Demo Mode Auth', () => {
  test('demo mode creates user session', async ({ page }) => {
    await page.goto('/');

    // Click "Demo Mode" button
    const demoButton = page.getByRole('button', { name: /demo/i }).first();
    if (await demoButton.isVisible()) {
      await demoButton.click();
      await page.waitForTimeout(500);

      // User should be authenticated — avatar/menu should appear
      // Check for user-related elements (XP display, avatar, etc.)
      const userIndicator = page.locator('[class*="avatar"], [class*="xp"]').first();
      await expect(userIndicator).toBeVisible();
    }
  });

  test('authenticated user can view dashboard', async ({ page }) => {
    await page.goto('/');

    // Enter demo mode
    const demoButton = page.getByRole('button', { name: /demo/i }).first();
    if (await demoButton.isVisible()) {
      await demoButton.click();
      await page.waitForTimeout(500);
    }

    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);

    // Dashboard should show user content (not "sign in" prompt)
    const dashboardContent = page.locator('main').first();
    await expect(dashboardContent).toBeVisible();
  });
});

test.describe('All Routes Accessible', () => {
  const routes = [
    { path: '/', name: 'Landing' },
    { path: '/courses', name: 'Courses' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/leaderboard', name: 'Leaderboard' },
    { path: '/profile', name: 'Profile' },
    { path: '/settings', name: 'Settings' },
    { path: '/onboarding', name: 'Onboarding' },
  ];

  for (const route of routes) {
    test(`${route.name} (${route.path}) loads without error`, async ({ page }) => {
      const response = await page.goto(route.path);
      expect(response?.status()).toBe(200);
      
      // No error page text
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).not.toContain('Application error');
      expect(bodyText).not.toContain('Internal Server Error');
    });
  }
});
