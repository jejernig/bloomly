# Bloomly.io - Comprehensive Testing Guide

## Overview

This document provides a complete guide to the testing infrastructure implemented for the Bloomly.io Next.js 14 application. The testing suite covers unit tests, integration tests, end-to-end tests, accessibility tests, performance tests, and smoke tests.

## Testing Stack

- **Unit Testing**: Jest + React Testing Library
- **E2E Testing**: Playwright with axe-playwright for accessibility
- **Coverage**: Built-in Jest coverage reporting
- **CI/CD Ready**: All tests configured for continuous integration

## Test Structure

```
├── src/
│   ├── __tests__/
│   │   └── test-utils.tsx                 # Custom render functions and utilities
│   ├── components/
│   │   ├── auth/__tests__/
│   │   │   └── SignInForm.test.tsx        # Authentication form tests
│   │   └── ui/__tests__/
│   │       ├── Button.test.tsx            # Button component tests
│   │       └── Input.test.tsx             # Input component tests
│   └── stores/__tests__/
│       └── useAuthStore.test.ts           # Zustand store tests
├── tests/
│   ├── e2e/
│   │   ├── auth-flows.spec.ts             # Authentication E2E flows
│   │   ├── navigation.spec.ts             # Navigation and page load tests
│   │   └── smoke-tests.spec.ts            # Critical functionality smoke tests
│   ├── accessibility/
│   │   ├── auth-forms.spec.ts             # WCAG 2.1 AA compliance tests
│   │   ├── keyboard-navigation.spec.ts    # Keyboard accessibility tests
│   │   └── color-contrast.spec.ts         # Color contrast compliance tests
│   └── performance/
│       ├── core-web-vitals.spec.ts        # Core Web Vitals measurements
│       └── load-testing.spec.ts           # Load and stress testing
├── jest.config.js                        # Jest configuration
├── jest.setup.js                         # Test environment setup
└── playwright.config.ts                  # Playwright configuration
```

## Quick Start

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
# Run all unit tests
npm run test

# Run unit tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run specific test categories
npm run test:accessibility
npm run test:performance
npm run test:smoke
npm run test:critical
```

### Generate Coverage Report
```bash
npm run test -- --coverage
```

## Test Categories

### 🧪 Unit Tests

**Location**: `src/components/**/__tests__/`, `src/stores/__tests__/`

**Coverage Targets**:
- Overall: 75% line coverage
- Critical components: 85% line/function coverage
- Auth components: 80% branch coverage

**Key Features**:
- React Testing Library for user-centric testing
- Custom render functions with proper providers
- Comprehensive form validation testing
- Store state management testing
- Mock implementations for Supabase auth

**Example Commands**:
```bash
# Run all unit tests
npm run test

# Run specific component tests
npm run test -- SignInForm
npm run test -- Button

# Run with coverage
npm run test -- --coverage --watchAll=false
```

### 🎭 End-to-End Tests

**Location**: `tests/e2e/`

**Features**:
- Multi-browser testing (Chromium, Firefox, WebKit)
- Authentication flow testing
- Navigation and routing tests
- Form submission and validation
- Error handling scenarios

**Example Commands**:
```bash
# Run all E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode with DevTools
npm run test:e2e:debug

# Run specific tags
npm run test:smoke
npm run test:critical
```

### ♿ Accessibility Tests

**Location**: `tests/accessibility/`

**Standards**: WCAG 2.1 AA Compliance

**Coverage**:
- Form accessibility and ARIA labels
- Keyboard navigation patterns
- Color contrast validation
- Screen reader compatibility
- High contrast mode support

**Features**:
- axe-playwright integration for automated accessibility testing
- Comprehensive keyboard navigation testing
- Color contrast compliance validation
- Focus management testing
- Mobile accessibility testing

**Example Commands**:
```bash
# Run all accessibility tests
npm run test:accessibility

# Run specific accessibility test suites
npx playwright test tests/accessibility/auth-forms.spec.ts
npx playwright test tests/accessibility/keyboard-navigation.spec.ts
npx playwright test tests/accessibility/color-contrast.spec.ts
```

### 🚀 Performance Tests

**Location**: `tests/performance/`

**Metrics**:
- Core Web Vitals (LCP, CLS, FID)
- Page load times
- Form interaction responsiveness
- Memory usage monitoring
- Resource loading optimization

**Features**:
- Core Web Vitals measurement and validation
- Load testing with concurrent users
- Network throttling simulation
- Memory leak detection
- Cache effectiveness testing

**Thresholds**:
- LCP: < 2.5s (good), < 4s (acceptable)
- CLS: < 0.1 (good), < 0.25 (acceptable)
- FID: < 100ms (good), < 300ms (acceptable)
- Page Load: < 3s (standard), < 5s (3G)

**Example Commands**:
```bash
# Run all performance tests
npm run test:performance

# Run specific performance test suites
npx playwright test tests/performance/core-web-vitals.spec.ts
npx playwright test tests/performance/load-testing.spec.ts
```

### 💨 Smoke Tests

**Location**: `tests/e2e/smoke-tests.spec.ts`

**Purpose**: Critical functionality verification after deployments

**Coverage**:
- Essential page load verification
- Core user flow validation
- Infrastructure health checks
- Performance threshold validation
- Cross-browser compatibility

**Features**:
- Critical page load testing (< 2-minute execution)
- Core Web Vitals validation
- API endpoint health checks
- Static asset verification
- Error page testing

**Example Commands**:
```bash
# Run smoke tests (fast execution)
npm run test:smoke

# Run critical path tests
npm run test:critical
```

## Configuration Details

### Jest Configuration

**File**: `jest.config.js`

**Key Settings**:
- JSDOM environment for React components
- Next.js module resolution
- Coverage thresholds:
  - Global: 75% line coverage
  - Auth components: 85% line/function coverage
  - Critical components: 80% branch coverage

### Playwright Configuration

**File**: `playwright.config.ts`

**Key Settings**:
- Multi-browser testing (Chromium, Firefox, WebKit)
- Base URL: `http://localhost:3060`
- Trace on first retry
- Screenshots on failure
- Video recording on failure
- Parallel execution

### Test Utilities

**File**: `src/__tests__/test-utils.tsx`

**Features**:
- Custom render function with providers
- Mock data for users, profiles, Instagram accounts
- Helper functions for API response mocking
- Custom Jest matchers for form validation
- Supabase client mocking

## Running Tests in CI/CD

### GitHub Actions Example

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test -- --coverage --watchAll=false
      
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
      
  accessibility-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:accessibility
```

## Test Data and Mocking

### Authentication Mocking

Tests use comprehensive Supabase authentication mocking:
- Sign in/sign up flows
- Google OAuth simulation
- Session management
- Error scenario simulation

### Mock Data

Predefined mock data includes:
- User profiles
- Instagram account data
- API response templates
- Form validation scenarios

## Coverage Reports

### Generating Coverage

```bash
# Generate coverage report
npm run test -- --coverage --watchAll=false

# Coverage files location
open coverage/lcov-report/index.html
```

### Coverage Thresholds

- **Global**: 75% line coverage minimum
- **Auth Components**: 85% line/function coverage
- **UI Components**: 80% branch coverage
- **Store Logic**: 85% statement coverage

## Performance Testing Guidelines

### Core Web Vitals Targets

- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1  
- **First Input Delay (FID)**: < 100ms
- **First Contentful Paint (FCP)**: < 1.8s

### Load Testing Scenarios

- Concurrent user simulation (5+ users)
- Rapid navigation stress testing
- Form submission stress testing
- Memory leak detection
- Network throttling simulation

## Accessibility Testing Standards

### WCAG 2.1 AA Compliance

- **Color Contrast**: 4.5:1 minimum for normal text
- **Keyboard Navigation**: Full keyboard accessibility
- **Form Labels**: Proper ARIA labeling
- **Focus Management**: Logical tab order
- **Screen Reader**: Compatible with assistive technologies

### Testing Coverage

- Authentication forms
- Navigation components  
- Interactive elements
- Error states
- Success feedback

## Troubleshooting

### Common Issues

1. **Tests failing locally but passing in CI**
   - Check Node.js version compatibility
   - Verify environment variables
   - Clear Jest cache: `npx jest --clearCache`

2. **Playwright browser installation issues**
   ```bash
   npx playwright install
   npx playwright install-deps
   ```

3. **Coverage thresholds not met**
   - Run with coverage to identify gaps: `npm run test -- --coverage`
   - Focus on critical business logic
   - Add tests for uncovered branches

4. **E2E tests flaky**
   - Increase timeout values
   - Add proper wait conditions
   - Use `waitForLoadState('networkidle')`

### Debug Commands

```bash
# Debug specific test
npm run test -- --verbose SignInForm

# Debug E2E test with browser open
npm run test:e2e:debug

# Run single E2E test
npx playwright test tests/e2e/auth-flows.spec.ts --headed

# Generate detailed test report
npx playwright show-report
```

## Best Practices

### Writing Tests

1. **Test user behavior, not implementation**
2. **Use descriptive test names**
3. **Keep tests isolated and independent**
4. **Mock external dependencies**
5. **Test error scenarios**
6. **Use proper async/await patterns**

### Accessibility Testing

1. **Test with actual assistive technologies**
2. **Include keyboard navigation testing**
3. **Verify proper ARIA attributes**
4. **Test color contrast in different modes**
5. **Validate form accessibility**

### Performance Testing

1. **Set realistic performance budgets**
2. **Test on various network conditions**
3. **Monitor memory usage over time**
4. **Validate Core Web Vitals**
5. **Test mobile performance**

## Maintenance

### Regular Tasks

- **Weekly**: Run full test suite and review failures
- **Monthly**: Update test dependencies and review coverage
- **Per Release**: Run smoke tests and performance benchmarks
- **Quarterly**: Review and update performance budgets

### Updating Tests

When adding new features:
1. Write unit tests for new components
2. Add E2E tests for new user flows  
3. Update accessibility tests for new UI
4. Add performance tests for critical paths
5. Update smoke tests for new critical functionality

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [axe-playwright](https://github.com/abhinaba-ghosh/axe-playwright)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Core Web Vitals](https://web.dev/vitals/)