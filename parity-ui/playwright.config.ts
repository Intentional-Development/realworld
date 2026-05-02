import { defineConfig, devices } from '@playwright/test';

/**
 * T2b UI Parity — Playwright Configuration
 * 
 * IMPORTANT: This test suite does NOT manage server lifecycle.
 * You MUST run `bash realworld/run-demo.sh` BEFORE executing tests.
 * 
 * Expected state:
 * - Backend: http://localhost:3000/api (app/node-api)
 * - Frontend: http://localhost:4100 (yurisldk/realworld-react-fsd)
 * 
 * Scope: 7-gate smoke flow per Stark's T2b spec
 * - NOT visual pixel parity
 * - NOT full feature set coverage
 * - NOT performance benchmarks
 * 
 * See: .squad/decisions/inbox/stark-conduit-frontend-scope.md (Section 4.1)
 */
export default defineConfig({
  testDir: './tests',
  
  // T2b runs in CI + locally — moderate timeout
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  
  fullyParallel: false, // Sequential for smoke (7 gates are interdependent)
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker — smoke tests create/modify user state
  
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  
  use: {
    // Frontend base URL (Stark's spec: port 4100)
    baseURL: 'http://localhost:4100',
    
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Reasonable defaults for smoke tests
    actionTimeout: 10000,
    navigationTimeout: 10000,
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // T2b scope: Chromium only (not cross-browser)
  ],
  
  // NO webServer config — assumes run-demo.sh is already running
  // If you see connection errors, verify:
  // 1. Backend is up: curl http://localhost:3000/api/tags
  // 2. Frontend is up: curl http://localhost:4100
});
