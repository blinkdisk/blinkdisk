# BlinkDisk Desktop Tests

This directory contains comprehensive unit tests for the BlinkDisk Desktop application.

## Testing Stack

- **Vitest**: Fast unit test framework with native ESM support
- **@testing-library/react**: React component testing utilities
- **@testing-library/user-event**: User interaction simulation
- **jsdom**: Browser environment simulation

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run tests for a specific file
pnpm test use-folder-size
```

## Test Structure