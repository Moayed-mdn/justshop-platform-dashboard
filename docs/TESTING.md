# Testing Guide

**Note**: Testing will be implemented in Phase 9. This document outlines the testing strategy and will be updated as tests are added.

## Testing Strategy

The Platform Dashboard uses a comprehensive testing approach:

1. **Unit Tests**: Utility functions and business logic
2. **Component Tests**: React components
3. **Integration Tests**: API interactions
4. **E2E Tests**: Critical user workflows
5. **Accessibility Tests**: WCAG 2.1 AA compliance

## Testing Stack

### Planned Dependencies (Phase 9)

```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@playwright/test": "^1.40.0",
    "jest-axe": "^8.0.0",
    "@vitest/ui": "^1.0.0"
  }
}
```

## Unit Tests (Vitest)

### Setup

**vitest.config.ts**:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

### Example: Testing Utility Functions

```typescript
// lib/utils/__tests__/format.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate } from '../format';

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1000, 'USD')).toBe('$1,000.00');
  });

  it('formats SAR correctly', () => {
    expect(formatCurrency(1000, 'SAR')).toBe('SAR 1,000.00');
  });

  it('handles zero', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });

  it('handles negative numbers', () => {
    expect(formatCurrency(-500, 'USD')).toBe('-$500.00');
  });
});

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    expect(formatDate(date, 'en')).toBe('Jan 15, 2024');
  });

  it('formats date in Arabic', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    expect(formatDate(date, 'ar')).toContain('٢٠٢٤');
  });
});
```

### Example: Testing Validation Schemas

```typescript
// lib/validation/__tests__/auth.schema.test.ts
import { describe, it, expect } from 'vitest';
import { signInSchema } from '../auth.schema';

describe('signInSchema', () => {
  it('validates correct input', () => {
    const input = {
      email: 'user@example.com',
      password: 'password123',
    };
    
    expect(() => signInSchema.parse(input)).not.toThrow();
  });

  it('rejects invalid email', () => {
    const input = {
      email: 'invalid-email',
      password: 'password123',
    };
    
    expect(() => signInSchema.parse(input)).toThrow();
  });

  it('rejects short password', () => {
    const input = {
      email: 'user@example.com',
      password: 'short',
    };
    
    expect(() => signInSchema.parse(input)).toThrow();
  });
});
```

### Running Unit Tests

```bash
npm run test              # Run all tests
npm run test:watch        # Run in watch mode
npm run test:coverage     # Generate coverage report
npm run test:ui           # Open Vitest UI
```

## Component Tests (React Testing Library)

### Setup

**test/setup.ts**:
```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/en',
  useSearchParams: () => new URLSearchParams(),
}));
```

### Example: Testing Button Component

```typescript
// components/ui/__tests__/button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies variant classes', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');
  });
});
```

### Example: Testing Form Component

```typescript
// components/forms/__tests__/sign-in-form.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignInForm } from '../sign-in-form';

describe('SignInForm', () => {
  it('renders all form fields', () => {
    render(<SignInForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<SignInForm />);
    
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    render(<SignInForm />);
    
    await userEvent.type(screen.getByLabelText(/email/i), 'invalid-email');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const handleSubmit = vi.fn();
    render(<SignInForm onSubmit={handleSubmit} />);
    
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
    });
  });
});
```

### Example: Testing Table Component

```typescript
// components/tables/__tests__/user-table.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserTable } from '../user-table';

const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'super_admin', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'support_agent', status: 'active' },
];

describe('UserTable', () => {
  it('renders user data', () => {
    render(<UserTable data={mockUsers} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(<UserTable data={[]} />);
    
    expect(screen.getByText(/no users found/i)).toBeInTheDocument();
  });

  it('renders pagination', () => {
    const pagination = { current_page: 1, last_page: 5, total: 100, per_page: 20 };
    render(<UserTable data={mockUsers} pagination={pagination} />);
    
    expect(screen.getByText(/page 1 of 5/i)).toBeInTheDocument();
  });
});
```

## E2E Tests (Playwright)

### Setup

**playwright.config.ts**:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Example: Authentication Flow

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should redirect unauthenticated users to sign in', async ({ page }) => {
    await page.goto('/en');
    await expect(page).toHaveURL(/\/en\/sign-in/);
  });

  test('should sign in successfully', async ({ page }) => {
    await page.goto('/en/sign-in');
    
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/en');
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/en/sign-in');
    
    await page.fill('[name="email"]', 'invalid@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should sign out successfully', async ({ page }) => {
    // Sign in first
    await page.goto('/en/sign-in');
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Sign out
    await page.click('[aria-label="User menu"]');
    await page.click('text=Sign Out');
    
    await expect(page).toHaveURL(/\/en\/sign-in/);
  });
});
```

### Example: User Management Flow

```typescript
// e2e/user-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto('/en/sign-in');
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('should list all users', async ({ page }) => {
    await page.goto('/en/users');
    
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('tbody tr')).toHaveCount(15); // Default page size
  });

  test('should search users', async ({ page }) => {
    await page.goto('/en/users');
    
    await page.fill('[placeholder="Search"]', 'john');
    await page.waitForURL(/search=john/);
    
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.locator('text=John Doe')).toBeVisible();
  });

  test('should suspend a user', async ({ page }) => {
    await page.goto('/en/users');
    
    // Click suspend button on first user
    await page.locator('tbody tr').first().locator('[aria-label="Suspend"]').click();
    
    // Fill reason and confirm
    await page.fill('[name="reason"]', 'Test suspension');
    await page.click('text=Confirm');
    
    // Verify success message
    await expect(page.locator('text=User suspended successfully')).toBeVisible();
    
    // Verify status changed
    await expect(page.locator('tbody tr').first().locator('text=Suspended')).toBeVisible();
  });

  test('should activate a suspended user', async ({ page }) => {
    await page.goto('/en/users?status=suspended');
    
    // Click activate button
    await page.locator('tbody tr').first().locator('[aria-label="Activate"]').click();
    await page.click('text=Confirm');
    
    await expect(page.locator('text=User activated successfully')).toBeVisible();
  });
});
```

### Running E2E Tests

```bash
npm run test:e2e              # Run all E2E tests
npm run test:e2e:headed       # Run with browser visible
npm run test:e2e:debug        # Run in debug mode
npx playwright show-report    # Show test report
```

## Accessibility Tests (jest-axe)

### Example: Component Accessibility

```typescript
// components/ui/__tests__/button.a11y.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../button';

expect.extend(toHaveNoViolations);

describe('Button Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA attributes when disabled', async () => {
    const { container } = render(<Button disabled>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Example: Page Accessibility

```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('sign-in page should not have violations', async ({ page }) => {
    await page.goto('/en/sign-in');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('dashboard should not have violations', async ({ page }) => {
    // Sign in first
    await page.goto('/en/sign-in');
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

## Test Coverage

### Target Coverage

- **Overall**: 80%+
- **Utilities**: 90%+
- **Components**: 75%+
- **Critical paths**: 100%

### Generating Coverage Report

```bash
npm run test:coverage
```

View the report at: `coverage/index.html`

## Testing Checklist

Before merging any feature:

- [ ] Unit tests for utilities pass
- [ ] Component tests pass
- [ ] E2E tests for critical paths pass
- [ ] Accessibility tests pass
- [ ] Test coverage meets targets
- [ ] No console errors during tests
- [ ] Tests run in CI/CD pipeline

## Continuous Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Best Practices

1. **Write tests first**: TDD approach when possible
2. **Test user behavior**: Focus on what users do, not implementation
3. **Use semantic queries**: getByRole, getByLabelText over getByTestId
4. **Mock external dependencies**: API calls, third-party libraries
5. **Keep tests isolated**: Each test should be independent
6. **Use descriptive names**: Test names should explain what they test
7. **Test edge cases**: Empty states, errors, loading states
8. **Test accessibility**: Keyboard navigation, screen readers
9. **Maintain tests**: Update tests when features change
10. **Run tests frequently**: Before commits, in CI/CD

## Debugging Tests

### Vitest

```typescript
// Add breakpoint
debugger;

// Or use console
console.log('Debug info:', data);

// Run single test
npm run test -- --run button.test.ts
```

### Playwright

```bash
# Run in headed mode
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# Open Playwright Inspector
npx playwright test --ui
```

## Additional Resources

- [Vitest Documentation](https://vitest.dev)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev)
- [jest-axe Documentation](https://github.com/nickcolley/jest-axe)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
