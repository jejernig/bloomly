# Taylor Collection Canvas Editor - Testing Suite

This comprehensive testing suite provides end-to-end, accessibility, performance, and manual testing for the Taylor Collection canvas editor application.

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
npm run test:install  # Install Playwright browsers
```

### Run Tests
```bash
# Run all automated tests
npm run test:all

# Run specific test suites
npm run test:e2e        # End-to-end integration tests
npm run test:mobile     # Mobile touch testing
npm run test:accessibility  # Accessibility compliance tests
npm run test:performance    # Performance benchmarking

# Run tests by priority
npm run test:smoke      # Smoke tests (critical functionality)
npm run test:critical   # All critical tests

# View test reports
npm run test:report
```

## 📁 Test Structure

```
tests/
├── e2e/                    # End-to-end integration tests
│   ├── canvas-integration.spec.ts   # Core canvas functionality
│   └── mobile-touch.spec.ts         # Mobile-specific tests
├── accessibility/          # WCAG 2.2 compliance tests
│   └── canvas-accessibility.spec.ts # Screen reader, keyboard, contrast
├── performance/            # Performance benchmarking
│   └── canvas-performance.spec.ts   # Load time, rendering, memory
├── manual/                 # Manual testing documentation
│   └── canvas-testing-checklist.md  # Comprehensive manual test guide
└── utils/                  # Test helper utilities
    └── test-helpers.ts     # Reusable test functions
```

## 🎯 Test Coverage

### Integration Tests (canvas-integration.spec.ts)
- ✅ Canvas initialization and loading
- ✅ Drag and drop from sidebar to canvas
- ✅ Object selection and manipulation
- ✅ Property panel functionality  
- ✅ Layer management
- ✅ Undo/redo operations
- ✅ Zoom and pan controls
- ✅ Save and load functionality

### Mobile Touch Tests (mobile-touch.spec.ts)
- ✅ Mobile layout responsiveness
- ✅ Touch drag and drop
- ✅ Pinch-to-zoom gestures
- ✅ Pan gestures  
- ✅ Touch object manipulation
- ✅ Mobile panel management
- ✅ Device-specific testing

### Accessibility Tests (canvas-accessibility.spec.ts)
- ✅ WCAG 2.2 Level AA compliance
- ✅ Screen reader compatibility
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Color contrast ratios
- ✅ ARIA labels and roles
- ✅ Mobile accessibility features

### Performance Tests (canvas-performance.spec.ts)
- ✅ Page load performance (Core Web Vitals)
- ✅ Canvas rendering benchmarks
- ✅ Memory usage optimization
- ✅ Mobile performance testing
- ✅ Auto-save performance
- ✅ Performance budget compliance

## 🔧 Test Configuration

### Playwright Configuration
The test suite runs across multiple browsers and devices:

**Desktop Browsers:**
- Chrome/Chromium
- Firefox  
- Safari/WebKit
- Microsoft Edge

**Mobile Devices:**
- iPhone 12 (390x844)
- Pixel 5 (393x851)
- iPad (various orientations)

### Performance Targets
| Metric | Target | Critical Threshold |
|--------|--------|--------------------|
| Page Load | <3s | <5s |
| Canvas Init | <2s | <3s |  
| 10 Objects Render | <100ms | <200ms |
| 50 Objects Render | <250ms | <500ms |
| Memory Usage | <100MB | <200MB |

### Accessibility Standards
- WCAG 2.2 Level AA compliance
- Color contrast ratio ≥4.5:1 (normal text)
- Color contrast ratio ≥3:1 (large text 18pt+)
- Keyboard navigation support
- Screen reader compatibility
- Touch target size ≥44x44px

## 🏃‍♂️ Running Tests

### Development Testing
```bash
# Run tests while developing
npm run test:e2e:headed    # Run with browser UI visible
npm run test:e2e:debug     # Run with debugger

# Watch mode for rapid feedback
npm run test:watch
```

### CI/CD Integration
```bash
# Production test pipeline
npm run test:all           # Run all automated tests
npm run test:critical      # Verify critical functionality
npm run lint              # Code quality checks
npm run type-check        # TypeScript validation
```

### Test Debugging
```bash
# Debug specific test files
npx playwright test tests/e2e/canvas-integration.spec.ts --debug

# Run tests with detailed output
npx playwright test --reporter=verbose

# Generate and view HTML report
npm run test:e2e
npm run test:report
```

## 📊 Test Reporting

### Automated Reports
- **HTML Report**: Detailed test results with screenshots and videos
- **JSON Report**: Machine-readable results for CI/CD integration
- **JUnit Report**: Compatible with most CI/CD systems

### Manual Testing
- **Testing Checklist**: Comprehensive manual test procedures
- **Bug Report Template**: Standardized bug reporting format
- **Cross-browser Compatibility Matrix**: Browser support tracking

## 🐛 Bug Reporting

Use the standardized bug report template in `tests/manual/canvas-testing-checklist.md`:

**Priority Levels:**
- **P0 - Critical**: Blocks core functionality
- **P1 - High**: Significant user impact  
- **P2 - Medium**: Minor functionality issues
- **P3 - Low**: Nice to have improvements

**Required Information:**
- Environment details (OS, browser, device)
- Steps to reproduce
- Expected vs actual results
- Screenshots/videos
- Console errors

## 🚀 Best Practices

### Writing Tests
1. **Use descriptive test names** that explain what is being tested
2. **Tag tests appropriately** (@smoke, @critical, @mobile, @a11y, @performance)
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Use test helpers** to reduce code duplication
5. **Test user behavior**, not implementation details

### Test Maintenance
1. **Keep tests independent** - no dependencies between tests
2. **Use stable selectors** - prefer data-testid over CSS selectors
3. **Handle async operations** properly with waitForSelector/waitForFunction
4. **Clean up test data** - each test should start with clean state
5. **Update tests with code changes** - maintain test relevance

### Performance Considerations
1. **Parallelize where possible** - use test.describe.parallel() for independent tests
2. **Use appropriate timeouts** - longer for complex operations
3. **Mock external services** - avoid network dependencies
4. **Clean up resources** - close pages, clear storage between tests

## 📈 Quality Gates

### Pre-commit Requirements
- [ ] All unit tests passing
- [ ] Critical E2E tests passing
- [ ] No accessibility violations
- [ ] Performance within budget
- [ ] No TypeScript errors

### Pre-release Requirements  
- [ ] Full test suite passing (100%)
- [ ] Cross-browser compatibility verified
- [ ] Mobile testing completed
- [ ] Performance benchmarks met
- [ ] Accessibility compliance verified
- [ ] Manual testing checklist completed

## 🔄 Continuous Integration

### GitHub Actions Example
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:install
      - run: npm run test:all
      - uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## 📚 Resources

### Testing Documentation
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [Core Web Vitals](https://web.dev/vitals/)

### Tools and Extensions
- [axe-playwright](https://github.com/abhinaba-ghosh/axe-playwright) - Accessibility testing
- [Playwright Test Generator](https://playwright.dev/docs/codegen) - Generate tests from user actions
- [WAVE Web Accessibility Evaluator](https://wave.webaim.org/) - Manual accessibility testing

## 🆘 Troubleshooting

### Common Issues
1. **Tests timing out**: Increase timeout or use more specific wait conditions
2. **Flaky tests**: Add proper wait conditions, avoid hardcoded delays
3. **Browser not launching**: Run `npm run test:install` to install browsers
4. **Mobile tests failing**: Ensure mobile viewport is properly set
5. **Accessibility tests failing**: Check for missing ARIA labels or contrast issues

### Getting Help
1. Check browser console for JavaScript errors
2. Review Playwright traces and screenshots
3. Verify test data and mock configurations
4. Check for recent code changes that might affect tests
5. Consult manual testing checklist for expected behavior

---

**Testing Standards Compliance:**
- ✅ Team Teddy Standards (70-80% line coverage, 80-90% branch coverage)
- ✅ WCAG 2.2 Level AA Accessibility  
- ✅ Core Web Vitals Performance Targets
- ✅ Cross-browser Compatibility
- ✅ Mobile-first Responsive Design
- ✅ TDD/BDD Methodologies