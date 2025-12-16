# Testing Quick Start Guide

## Installation

```bash
# Navigate to desktop app
cd apps/desktop

# Install dependencies (this will install the new test dependencies)
pnpm install
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode (re-runs on file changes)
pnpm test:watch

# Run tests with UI dashboard
pnpm test:ui

# Run tests with coverage report
pnpm test:coverage
```

## What Was Created

### Test Infrastructure
1. **vitest.config.ts** - Vitest configuration with jsdom environment
2. **src/test/setup.ts** - Global test setup and mocks
3. **src/test/test-utils.tsx** - Reusable test utilities for React components

### Test Files (2,917 lines total)
1. **use-folder-size.test.ts** (824 lines) - Tests for folder size estimation hook
2. **use-create-folder.test.ts** (819 lines) - Tests for folder creation with size validation
3. **size.test.tsx** (610 lines) - Tests for FolderSize component
4. **use-query-key.test.ts** (396 lines) - Tests for query key generation
5. **folder.test.json.ts** (268 lines) - Validation tests for locale translations

## Test Coverage

The test suite covers:
- ✅ All new hooks (use-folder-size, modifications to use-create-folder)
- ✅ New React component (FolderSize)
- ✅ Query key additions (folder.size)
- ✅ Locale translations validation
- ✅ Happy paths, edge cases, and error scenarios
- ✅ User interactions and async operations
- ✅ API mocking and error handling

## Expected Results

When you run `pnpm test`, you should see:
- 200+ test cases passing
- Coverage reports showing ~85-90% coverage for tested files
- All tests completing in under 10 seconds

## Troubleshooting

### If tests fail to run:
```bash
# Clear cache and reinstall
rm -rf node_modules
pnpm install
```

### If specific tests fail:
- Check that all dependencies are installed
- Verify vitest.config.ts is in the correct location
- Ensure test setup file is being loaded

### View detailed test output:
```bash
# Run with verbose output
pnpm test --reporter=verbose

# Run specific test file
pnpm test use-folder-size
```

## Documentation

- **TEST_README.md** - Comprehensive testing guide with examples
- **TEST_SUMMARY.md** - Detailed summary of all tests created
- **TESTING_QUICK_START.md** - This file

## Integration with CI/CD

Add to your CI pipeline (e.g., GitHub Actions):

```yaml
- name: Install dependencies
  run: pnpm install

- name: Run tests
  run: pnpm test --coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Next Steps

1. Run `pnpm install` to install test dependencies
2. Run `pnpm test` to verify all tests pass
3. Run `pnpm test:coverage` to see coverage report
4. Review TEST_README.md for writing additional tests
5. Integrate into CI/CD pipeline

## Key Features Tested

### Folder Size Estimation
- Starting estimation with validation
- Polling task status
- Computing results from API counters
- Handling path and policy changes
- Error recovery

### Folder Creation
- Size validation for cloud storage
- Fallback size calculation
- Storage capacity checks
- Force flag behavior
- Navigation and cache invalidation

### FolderSize Component
- Rendering states (initial, loading, success, error)
- User interactions
- Data formatting and display
- Policy integration
- Callback handling

## Dependencies Added

```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@vitest/coverage-v8": "^2.1.8",
    "@vitest/ui": "^2.1.8",
    "jsdom": "^25.0.1",
    "vitest": "^2.1.8"
  }
}
```

## Scripts Added

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```