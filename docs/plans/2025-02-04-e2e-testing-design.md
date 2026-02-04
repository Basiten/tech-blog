# E2E Testing Implementation Design

**Date:** 2025-02-04
**Author:** Sunqizhen
**Status:** Approved

## Overview

End-to-end testing using Playwright integrated with Astro's build process to catch navigation, routing, and localization bugs before deployment.

## Problem Statement

Recent deployments have introduced bugs that only appear after publishing:
- URL path duplication: `/tech-blog/tech-blog/search`
- Broken navigation links between pages
- Language switching creating invalid URLs
- Missing localized pages

**Solution:** Automated E2E tests that run on every build, blocking deployment if failures occur.

## Architecture

### Tech Stack
- **Playwright** - E2E testing framework
- **@playwright/test** - Astro integration
- **TypeScript** - Test definitions
- **Sanity CMS** - Real content for testing

### Test Execution Flow

```
Developer Changes Code
        ↓
    npm run build
        ↓
┌───────────────────────────────┐
│  1. Start dev server (background)   │
│  2. Run Playwright tests           │
│  3. Shut down dev server          │
└───────────────────────────────┘
        ↓
   Tests Pass? → NO → Stop & Report
        ↓ YES
    Build Artifacts Generated
        ↓
    git push → GitHub Actions
        ↓
┌───────────────────────────────┐
│  1. Checkout code                │
│  2. Run tests (blocking)         │
│  3. Build site                   │
│  4. Deploy to GitHub Pages      │
└───────────────────────────────┘
        ↓
   Deploy Blocked if Tests Fail
```

## Test Scope

### Critical User Flows to Test

**1. Navigation Tests**
- Home page loads in all languages (EN, ZH, FR)
- Navigation: Home → About → Search → Home
- Internal links return 200 status
- No 404 errors on core navigation paths

**2. Language Switching**
- Language dropdown shows all 3 languages
- Switching EN → ZH changes URL to `/zh/`
- Switching ZH → FR changes URL to `/fr/`
- Switching FR → EN changes URL to `/`
- Language state preserved when navigating

**3. Search Functionality**
- Search page loads without errors
- Typing in search shows results
- Clicking result navigates to blog post
- "No results" message shown when appropriate

**4. Link Validation**
- No duplicate base paths in URLs
- All blog card links work
- Footer links (RSS, social) are valid
- Language-specific blog post links work

## File Structure

```
src/
├── tests/
│   ├── fixtures/
│   │   ├── sanity-content.ts    # Test blog posts data
│   │   └── test-helpers.ts       # Reusable test functions
│   └── e2e/
│       ├── navigation.spec.ts
│       ├── language-switching.spec.ts
       ├── search.spec.ts
│       └── links.spec.ts
├── playwright.config.ts
└── astro.config.mjs (updated)
```

## Test Configuration

**`playwright.config.ts`**
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './src/tests/e2e',
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  timeout: 10000,
  use: {
    baseURL: 'http://localhost:4321',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
```

**`astro.config.mjs` update:**
```javascript
export default defineConfig({
  // ... existing config
  experimental: {
    playwright: true
  }
})
```

## Implementation Steps

### Phase 1: Installation & Setup
1. Install Playwright integration
2. Create test directory structure
3. Configure Playwright
4. Update astro.config.mjs

### Phase 2: Fixtures & Helpers
1. Create Sanity content fixtures
2. Create test helper functions
3. Set up test data utilities

### Phase 3: Test Implementation
1. Navigation tests
2. Language switching tests
3. Search tests
4. Link validation tests

### Phase 4: CI/CD Integration
1. Update package.json scripts
2. Modify GitHub Actions workflow
3. Add test reporting

### Phase 5: Validation
1. Create test blog posts in Sanity
2. Run tests locally
3. Verify CI/CD integration
4. Document test usage

## Success Criteria

- ✅ All navigation works across EN/ZH/FR
- ✅ Language switching produces valid URLs
- ✅ No 404 errors on core pages
- ✅ Tests run in under 60 seconds locally
- ✅ GitHub Actions blocks deployment on test failure
- ✅ Zero bugs after deployment

## Testing Philosophy

**Fail Fast:** Tests run quickly and stop immediately on failure

**Real Data:** Use actual Sanity CMS content (catches real API issues)

**Comprehensive Coverage:** Test all critical user paths before deployment

**Developer Experience:**
```bash
# Development (fast, no tests)
npm run dev

# Pre-publish check (includes tests)
npm run build

# Run tests alone
npm run test

# Watch tests interactively
npm run test:ui
```

## Maintenance

- Review and update tests as new features are added
- Remove or update tests as Sanity content structure changes
- Keep test data tagged for easy cleanup (use "test" tag)
- Run tests after any routing/navigation changes
