# Architecture Overview

## Technology Stack

### Core Framework
- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **TypeScript 5**: Type-safe JavaScript
- **Node.js 18+**: Runtime environment

### Styling & UI
- **Tailwind CSS v4**: Utility-first CSS framework
- **shadcn/ui**: Accessible component library built on Radix UI
- **Lucide React**: Icon library
- **tailwindcss-rtl**: RTL layout support

### State Management & Data Fetching
- **TanStack Query**: Server state management and caching
- **Zustand**: Client state management (UI state)
- **React Hook Form**: Form state management
- **Zod**: Schema validation

### Internationalization
- **next-intl**: i18n for Next.js with server components support
- Supported locales: English (`en`), Arabic (`ar`)
- Full RTL layout support for Arabic

### Data Visualization
- **Recharts**: Charting library (coming in Phase 3)
- **TanStack Table**: Headless table library

### Utilities
- **date-fns**: Date manipulation and formatting
- **clsx** + **tailwind-merge**: Conditional class names
- **sonner**: Toast notifications

## Architecture Patterns

### 1. Server Components First

By default, all components are React Server Components (RSC). Only add `'use client'` when needed for:
- Event handlers and interactivity
- Browser APIs (localStorage, window, etc.)
- React hooks (useState, useEffect, etc.)
- Third-party libraries requiring client-side

**Example**:
```tsx
// ✅ Server Component (default) - for data fetching
export default async function UsersPage({ searchParams }) {
  const users = await fetchUsers(searchParams);
  return <UserTable data={users} />;
}

// ✅ Client Component - for interactivity
'use client';
export function UserTable({ data }) {
  const table = useReactTable({ data, columns });
  // Interactive table logic
}
```

### 2. URL-Driven State

All filterable, sortable, and paginated data uses URL search params as the source of truth:
- **Pagination**: `?page=2`
- **Search**: `?search=john`
- **Filters**: `?role=admin&status=active`
- **Sorting**: `?sort=name&order=asc`

**Benefits**:
- Shareable URLs
- Browser back/forward navigation
- Server-side rendering with filters
- No prop drilling

**Example**:
```tsx
export default async function UsersPage({ searchParams }: {
  searchParams: Promise<{ page?: string; search?: string; role?: string }>
}) {
  const params = await searchParams;
  const filters = {
    page: Number(params.page) || 1,
    search: params.search || '',
    role: params.role || 'all',
  };
  
  const users = await fetchUsers(filters);
  return <UserTable data={users} filters={filters} />;
}
```

### 3. Centralized API Client

All backend communication goes through a centralized API client:
- Automatic authentication (httpOnly cookies)
- Consistent error handling
- Request/response interceptors
- TypeScript types for all responses

**Structure**:
```
lib/api/
├── client.ts              # Base API client
├── types.ts               # Shared types
├── endpoints/             # API endpoint modules
│   ├── auth.ts
│   ├── users.ts
│   ├── stores.ts
│   └── platform.ts
└── utils/
    └── error-handler.ts   # Error mapping
```

**Example**:
```typescript
// lib/api/client.ts
export class ApiClient {
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(baseURL + endpoint, {
      ...options,
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      throw await this.handleError(response);
    }
    
    return response.json();
  }
}
```

### 4. Server Actions for Mutations

All data mutations (create, update, delete) use Next.js Server Actions:
- Server-side execution
- Type-safe
- Automatic revalidation
- Built-in security

**Example**:
```typescript
// lib/actions/user-actions.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function suspendUser(userId: string, reason?: string) {
  const response = await apiClient.request(`/api/v1/platform/users/${userId}/suspend`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
  
  // Revalidate the users page
  revalidatePath('/users');
  
  return response;
}
```

### 5. Form Validation with Zod

All forms use React Hook Form + Zod for validation:
- Type-safe schemas
- Reusable validation logic
- Client and server validation
- Error message localization

**Example**:
```typescript
// lib/validation/auth.schema.ts
import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email('emailInvalid'),
  password: z.string().min(8, 'passwordMin'),
});

export type SignInInput = z.infer<typeof signInSchema>;
```

### 6. Consistent Error Handling

Errors from the Laravel backend are mapped to user-friendly messages:
- Backend uses `ErrorCode` enum
- Frontend maps codes to translated messages
- Toast notifications for user feedback

**Example**:
```typescript
// lib/api/utils/error-handler.ts
export function mapErrorToMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'AUTH_INVALID_CREDENTIALS': 'auth.invalidCredentials',
    'USER_NOT_FOUND': 'errors.userNotFound',
    // ... more mappings
  };
  
  return errorMessages[errorCode] || 'common.error';
}
```

### 7. Component Composition

Components follow a compositional architecture:
- Small, focused components
- Single responsibility principle
- Prop interfaces for type safety
- Reusable across features

**Structure**:
```
components/
├── ui/                    # Base components (shadcn/ui)
│   ├── button.tsx
│   ├── input.tsx
│   └── card.tsx
├── dashboard/             # Dashboard-specific
│   ├── sidebar.tsx
│   ├── header.tsx
│   └── kpi-card.tsx
├── forms/                 # Form components
│   ├── sign-in-form.tsx
│   └── user-form.tsx
├── tables/                # Table components
│   ├── data-table.tsx     # Generic reusable table
│   ├── user-table.tsx
│   └── columns/
│       └── user-columns.tsx
└── shared/                # Shared utilities
    ├── theme-toggle.tsx
    └── language-switcher.tsx
```

### 8. Internationalized Routing

All routes are prefixed with locale (`/en/*` or `/ar/*`):
- Middleware handles locale detection
- Locale-specific layouts
- RTL layout for Arabic
- Translated content

**Structure**:
```
app/
├── [locale]/              # Locale-based routing
│   ├── layout.tsx         # Main layout with i18n
│   ├── page.tsx           # Home page
│   ├── (auth)/            # Auth route group
│   │   └── sign-in/
│   │       └── page.tsx
│   └── (dashboard)/       # Dashboard route group
│       ├── layout.tsx     # Dashboard shell
│       ├── page.tsx       # Dashboard home
│       ├── users/
│       └── stores/
├── layout.tsx             # Root redirect to locale
└── globals.css
```

### 9. Route Groups for Layout Variants

Route groups organize pages by layout:
- `(auth)`: Authentication pages (sign-in, forgot password)
- `(dashboard)`: Platform admin pages (users, stores, CMS)
- `(support)`: Support agent pages (tickets, impersonation)

**Example**:
```
app/[locale]/
├── (auth)/
│   ├── layout.tsx         # Centered auth layout
│   └── sign-in/page.tsx
├── (dashboard)/
│   ├── layout.tsx         # Sidebar + header layout
│   ├── page.tsx
│   ├── users/
│   └── stores/
└── (support)/
    ├── layout.tsx         # Support-specific layout
    ├── page.tsx
    └── tickets/
```

### 10. Dark Mode with CSS Variables

Theme system uses CSS variables for colors:
- Light and dark mode definitions in `globals.css`
- CSS variables mapped to Tailwind utilities
- System preference detection
- Persistent theme storage

**Example**:
```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  /* ... more variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  /* ... more variables */
}
```

```tsx
// Usage in components
<div className="bg-background text-foreground">
  <Button className="bg-primary text-primary-foreground">
    Click me
  </Button>
</div>
```

## Folder Structure Details

### `/app` - Application Routes
- **App Router**: Next.js 15 file-based routing
- **Nested Layouts**: Shared layouts for route groups
- **Server Components**: Default rendering strategy
- **Loading & Error States**: Built-in UI for loading and errors

### `/components` - React Components
- **UI Components**: Base components from shadcn/ui
- **Feature Components**: Domain-specific components
- **Shared Components**: Reusable across features

### `/lib` - Utility Libraries
- **API Client**: Backend communication
- **Providers**: React context providers
- **Stores**: Client-side state (Zustand)
- **Utils**: Helper functions
- **Validation**: Zod schemas

### `/locales` - Translation Files
- **JSON Files**: Translation keys by locale
- **Structured**: Organized by feature/domain

### `/public` - Static Assets
- **Images**: Logos, icons, illustrations
- **Fonts**: Custom fonts (if needed)

## Security Architecture

### 1. Authentication
- **httpOnly Cookies**: Laravel Sanctum tokens stored securely
- **No Token Exposure**: Tokens never accessible to JavaScript
- **Automatic Inclusion**: Cookies sent with every request

### 2. Authorization
- **Server-Side Checks**: All authorization happens in Server Components/Actions
- **Middleware Protection**: Routes protected at middleware level
- **Role-Based Access**: Super Admin vs Support Agent permissions

### 3. Input Validation
- **Client Validation**: Zod schemas for immediate feedback
- **Server Validation**: Duplicate validation on server
- **XSS Prevention**: React escapes output by default
- **SQL Injection**: Backend uses parameterized queries

### 4. CSRF Protection
- **Cookie-Based**: Laravel Sanctum provides CSRF protection
- **SameSite Cookies**: Cookies set with SameSite=Lax

## Performance Optimizations

### 1. Static Generation
- Marketing pages statically generated
- Incremental Static Regeneration (ISR) for CMS content

### 2. Server-Side Rendering
- Dynamic pages rendered on server
- Fast initial page load
- SEO-friendly

### 3. Code Splitting
- Automatic code splitting by route
- Dynamic imports for heavy components
- Reduced bundle sizes

### 4. Image Optimization
- Next.js Image component
- Automatic WebP conversion
- Lazy loading

### 5. Caching Strategy
- **TanStack Query**: Cache API responses
- **Next.js Cache**: Cached fetch requests
- **Stale-While-Revalidate**: Show cached data while fetching

## Testing Strategy (Phase 9)

### Unit Tests
- **Vitest**: Fast unit test runner
- **Coverage**: 80%+ for utility functions

### Component Tests
- **React Testing Library**: Component testing
- **User-Centric**: Test user interactions

### E2E Tests
- **Playwright**: End-to-end testing
- **Critical Paths**: Sign-in, user CRUD, store management

### Accessibility Tests
- **jest-axe**: Automated accessibility testing
- **Manual Testing**: Keyboard navigation, screen readers

## Deployment (Future)

### Production Build
```bash
npm run build     # Create production build
npm run start     # Start production server
```

### Environment Variables
- All secrets in environment variables
- Never commit `.env.local`
- Use Vercel/Railway for hosting

### Monitoring
- Error tracking (Sentry)
- Analytics (Vercel Analytics)
- Performance monitoring (Web Vitals)

## Design Principles

1. **Server Components First**: Prefer server rendering for performance
2. **Progressive Enhancement**: Works without JavaScript (where possible)
3. **Accessibility**: WCAG 2.1 AA compliance
4. **Mobile-First**: Responsive design starting from mobile
5. **Type Safety**: TypeScript strict mode, no `any` types
6. **Error Handling**: Graceful degradation and user-friendly errors
7. **Performance**: Fast initial load, optimized images, code splitting
8. **Security**: Defense in depth, least privilege, secure by default
9. **Testability**: Easy to test, isolated components
10. **Maintainability**: Clear structure, consistent patterns
