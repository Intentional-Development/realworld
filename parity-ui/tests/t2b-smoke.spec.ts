import { test, expect } from '@playwright/test';

/**
 * T2b UI Parity — 7-Gate Smoke Flow
 * 
 * Validates that the generated backend (app/node-api) correctly serves
 * the reference frontend (yurisldk/realworld-react-fsd) for critical user flows.
 * 
 * Scope per Stark's spec (.squad/decisions/inbox/stark-conduit-frontend-scope.md):
 * - Register → Login → Create Article → View in Feed → Favorite → Logout
 * - 7 gates, all must pass for T2b claim
 * 
 * Out of scope:
 * - Visual pixel parity (CSS differences are acceptable)
 * - Full feature set (Edit, Delete, Comments, Follow, Profile pages)
 * - Cross-browser (Chromium only)
 * - Error states (tested via Hurl)
 * - Performance metrics
 */

// Generate unique user credentials per test run to avoid collisions
const timestamp = Date.now();
const testUser = {
  username: `parity-${timestamp}`,
  email: `parity-${timestamp}@example.com`,
  password: 'TestPass123!',
};

const testArticle = {
  title: `T2b Test Article ${timestamp}`,
  description: 'Smoke test article for T2b UI parity validation',
  body: 'This article was created by the Playwright T2b smoke suite to validate the generated backend serves the frontend correctly. Source→IDL→executable parity demonstration.',
  tags: 't2b,smoke,playwright',
};

test.describe('T2b UI Parity — 7-Gate Smoke Flow', () => {
  test('G1 → G7: Complete user flow (register, login, create, view, favorite, logout)', async ({ page }) => {
    
    // ==========================================
    // GATE 1: Home loads
    // ==========================================
    await test.step('G1: Home page loads with tag list', async () => {
      await page.goto('/');
      
      // Check page title contains "Conduit"
      await expect(page).toHaveTitle(/conduit/i);
      
      // Verify tag list is visible (common element on RealWorld home)
      // Using semantic selectors, not brittle CSS
      const tagsSection = page.getByText(/popular tags/i).or(page.locator('[data-testid="tag-list"]'));
      await expect(tagsSection).toBeVisible({ timeout: 10000 });
      
      // Verify article feed container exists (even if empty initially)
      const feedContainer = page.locator('.article-preview').first().or(page.getByText(/No articles/i));
      await expect(feedContainer).toBeVisible();
    });
    
    // ==========================================
    // GATE 2: Register new user
    // ==========================================
    await test.step('G2: Register new user', async () => {
      // Navigate to register page
      await page.getByRole('link', { name: /sign up/i }).click();
      await expect(page).toHaveURL(/\/register/);
      
      // Fill registration form
      await page.getByPlaceholder(/username/i).fill(testUser.username);
      await page.getByPlaceholder(/email/i).fill(testUser.email);
      await page.getByPlaceholder(/password/i).fill(testUser.password);
      
      // Submit form
      await page.getByRole('button', { name: /sign up/i }).click();
      
      // G2: yurisldk redirects to /settings after register — accept either / or /settings as authenticated state
      await expect(page).toHaveURL(/\/(settings)?$/, { timeout: 10000 });
      
      // Verify username appears in header (indicates successful registration + auto-login)
      const userLink = page.getByRole('link', { name: testUser.username }).first();
      await expect(userLink).toBeVisible({ timeout: 5000 });
    });
    
    // ==========================================
    // GATE 3: Logout
    // ==========================================
    await test.step('G3: Logout', async () => {
      // Click settings or logout link (vary by frontend implementation)
      const settingsLink = page.getByRole('link', { name: /settings/i }).first();
      await settingsLink.click();
      
      // Find and click logout button
      const logoutButton = page.getByRole('button', { name: /logout/i }).or(page.getByText(/logout/i));
      await logoutButton.click();
      
      // G3: yurisldk redirects to /login after logout — accept either / or /login as logged-out state
      await expect(page).toHaveURL(/\/(login)?$/, { timeout: 5000 });
      const signInLink = page.getByRole('link', { name: /sign in/i });
      await expect(signInLink).toBeVisible({ timeout: 5000 });
      
      // Username should no longer appear in header
      const userLink = page.getByRole('link', { name: testUser.username });
      await expect(userLink).not.toBeVisible();
    });
    
    // ==========================================
    // GATE 4: Login
    // ==========================================
    await test.step('G4: Login with registered user', async () => {
      // Navigate to login page
      await page.getByRole('link', { name: /sign in/i }).click();
      await expect(page).toHaveURL(/\/login/);
      
      // Fill login form
      await page.getByPlaceholder(/email/i).fill(testUser.email);
      await page.getByPlaceholder(/password/i).fill(testUser.password);
      
      // Submit form
      await page.getByRole('button', { name: /sign in/i }).click();
      
      // G4: yurisldk redirects to /settings after login — accept either / or /settings as authenticated state
      await expect(page).toHaveURL(/\/(settings)?$/, { timeout: 10000 });
      
      // Verify username appears in header again
      const userLink = page.getByRole('link', { name: testUser.username }).first();
      await expect(userLink).toBeVisible({ timeout: 5000 });
    });
    
    // ==========================================
    // GATE 5: Create article
    // ==========================================
    await test.step('G5: Create new article', async () => {
      // Navigate to new article page
      const newArticleLink = page.getByRole('link', { name: /new article/i }).or(page.getByRole('link', { name: /new post/i }));
      await newArticleLink.click();
      await expect(page).toHaveURL(/\/(editor|new-article)/);
      
      // Fill article form
      await page.getByPlaceholder(/article title/i).fill(testArticle.title);
      await page.getByPlaceholder(/what.*about/i).fill(testArticle.description);
      await page.getByPlaceholder(/write your article/i).fill(testArticle.body);
      await page.getByPlaceholder(/enter tags/i).fill(testArticle.tags);
      
      // Submit form
      await page.getByRole('button', { name: /publish/i }).click();
      
      // Should redirect to article detail page
      await expect(page).toHaveURL(/\/article\/.+/, { timeout: 10000 });
      
      // Verify article displays with correct title and body
      await expect(page.getByRole('heading', { name: testArticle.title })).toBeVisible();
      await expect(page.getByText(testArticle.body)).toBeVisible();
    });
    
    // ==========================================
    // GATE 6: View article in global feed
    // ==========================================
    await test.step('G6: View article in global feed', async () => {
      // Navigate back to home
      await page.getByRole('link', { name: /home/i }).first().click();
      // G6: Accept home URL with or without pagination query params
      await expect(page).toHaveURL(/\/(\?.*)?$/, { timeout: 5000 });
      
      // Click "Global Feed" tab to ensure we're viewing all articles
      const globalFeedTab = page.getByRole('link', { name: /global feed/i }).or(page.getByText(/global feed/i));
      await globalFeedTab.click();
      
      // Wait for feed to load
      await page.waitForLoadState('networkidle');
      
      // Verify our article appears in the feed with correct title and author
      const articlePreview = page.locator('.article-preview', { hasText: testArticle.title }).first();
      await expect(articlePreview).toBeVisible({ timeout: 10000 });
      
      // Verify author is our test user
      await expect(articlePreview.getByText(testUser.username)).toBeVisible();
    });
    
    // ==========================================
    // GATE 7: Favorite article
    // ==========================================
    await test.step('G7: Favorite article from feed', async () => {
      // Find the article preview again to get favorite button
      const articlePreview = page.locator('.article-preview', { hasText: testArticle.title }).first();
      await expect(articlePreview).toBeVisible({ timeout: 5000 });
      
      // Find favorite button — simpler selector: any button within article preview
      const favoriteButton = articlePreview.locator('button').first();
      await expect(favoriteButton).toBeVisible({ timeout: 5000 });
      
      // Get initial favorite count text (may contain heart icon + number)
      const initialText = await favoriteButton.textContent() || '0';
      const initialCountMatch = initialText.match(/\d+/);
      const initialCount = initialCountMatch ? parseInt(initialCountMatch[0], 10) : 0;
      
      // Click favorite button
      await favoriteButton.click();
      
      // Wait for API request to complete
      await page.waitForResponse(response => 
        response.url().includes('/favorite') && response.status() === 200,
        { timeout: 10000 }
      );
      
      // Wait a moment for UI to update
      await page.waitForTimeout(500);
      
      // Verify count incremented by 1 (button text should now contain the new count)
      const newText = await favoriteButton.textContent() || '0';
      const newCountMatch = newText.match(/\d+/);
      const newCount = newCountMatch ? parseInt(newCountMatch[0], 10) : 0;
      expect(newCount).toBe(initialCount + 1);
    });
    
    // Test complete — all 7 gates passed
  });
});
