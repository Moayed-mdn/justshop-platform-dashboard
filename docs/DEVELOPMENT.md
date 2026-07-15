# Development Guide

## Local Development Setup

### Prerequisites

1. **Node.js & npm**
   ```bash
   node --version  # Should be v18.18.0+
   npm --version   # Should be v10.0.0+
   ```

2. **Laravel Backend**
   - Backend must be running at `http://localhost:8000`
   - See backend README for setup instructions

### Initial Setup

1. **Install dependencies**:
   ```bash
   cd /home/leader/projects/laravel/v3/tenant/laratenant-backend/platform-dashboard
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_APP_NAME=Platform Dashboard
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_DEFAULT_LOCALE=en
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**:
   ```
   http://localhost:3000
   ```

## Running Backend + Frontend Together

You need both servers running simultaneously.

### Option 1: Two Terminal Windows

**Terminal 1 - Backend**:
```bash
cd /home/leader/projects/laravel/v3/tenant/laratenant-backend
php artisan serve
```

**Terminal 2 - Frontend**:
```bash
cd /home/leader/projects/laravel/v3/tenant/laratenant-backend/platform-dashboard
npm run dev
```

### Option 2: Using tmux (Recommended)

```bash
# Create a new tmux session
tmux new -s dev

# Split window horizontally
Ctrl+b "

# In first pane (backend)
cd /home/leader/projects/laravel/v3/tenant/laratenant-backend
php artisan serve

# Switch to second pane
Ctrl+b ↓

# In second pane (frontend)
cd /home/leader/projects/laravel/v3/tenant/laratenant-backend/platform-dashboard
npm run dev

# Navigate between panes: Ctrl+b ↑/↓
# Detach from session: Ctrl+b d
# Reattach to session: tmux attach -t dev
```

## Project Structure

```
platform-dashboard/
├── app/
│   ├── [locale]/          # Localized routes
│   │   ├── (auth)/        # Authentication pages
│   │   ├── (dashboard)/   # Platform admin pages
│   │   └── (support)/     # Support agent pages
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout (redirects to locale)
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── dashboard/         # Dashboard components
│   ├── forms/             # Form components
│   ├── tables/            # Table components
│   └── shared/            # Shared components
├── lib/
│   ├── api/               # API client & endpoints
│   ├── providers/         # React providers
│   ├── stores/            # Zustand stores
│   └── utils.ts           # Utility functions
├── locales/               # Translation files
│   ├── en.json
│   └── ar.json
├── public/                # Static assets
└── docs/                  # Documentation
```

## Development Workflow

### 1. Creating a New Page

```tsx
// app/[locale]/(dashboard)/new-feature/page.tsx
import { useTranslations } from 'next-intl';

export default function NewFeaturePage() {
  const t = useTranslations('newFeature');
  
  return (
    <div>
      <h1>{t('title')}</h1>
    </div>
  );
}
```

### 2. Adding Translations

```json
// locales/en.json
{
  "newFeature": {
    "title": "New Feature"
  }
}

// locales/ar.json
{
  "newFeature": {
    "title": "ميزة جديدة"
  }
}
```

### 3. Creating API Endpoints

```typescript
// lib/api/endpoints/new-feature.ts
import { apiClient } from '../client';

export interface NewFeature {
  id: string;
  name: string;
}

export async function fetchNewFeatures() {
  return apiClient.request<NewFeature[]>('/api/v1/platform/new-features');
}

export async function createNewFeature(data: Partial<NewFeature>) {
  return apiClient.request<NewFeature>('/api/v1/platform/new-features', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

### 4. Creating Server Actions

```typescript
// lib/actions/new-feature-actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createNewFeature } from '@/lib/api/endpoints/new-feature';

export async function createNewFeatureAction(data: FormData) {
  const name = data.get('name') as string;
  
  const result = await createNewFeature({ name });
  
  revalidatePath('/new-features');
  
  return result;
}
```

### 5. Creating Forms

```tsx
// components/forms/new-feature-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const schema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
});

type FormData = z.infer<typeof schema>;

export function NewFeatureForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    // Call server action
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('name')} />
      {errors.name && <p className="text-red-500">{errors.name.message}</p>}
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

## Hot Reload

Next.js automatically reloads when you save files:
- **Fast Refresh**: React components reload without losing state
- **CSS Hot Reload**: Styles update instantly
- **Route Hot Reload**: New routes available immediately

If hot reload stops working:
```bash
# Clear .next cache
rm -rf .next
npm run dev
```

## Debugging

### Browser DevTools

1. **React DevTools**: Install React DevTools extension
2. **Network Tab**: Monitor API calls
3. **Console**: Check for errors and logs

### VS Code Debugging

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Logging

```typescript
// Development only
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

## Common Development Issues

### Issue: Port 3000 Already in Use

**Solution**:
```bash
# Option 1: Kill the process
lsof -ti:3000 | xargs kill -9

# Option 2: Use a different port
npm run dev -- -p 3001
```

### Issue: Backend API Not Responding

**Checklist**:
- ✅ Laravel backend running? `php artisan serve`
- ✅ Correct API URL in `.env.local`?
- ✅ CORS configured in backend?
- ✅ Check network tab for error details

### Issue: Translations Not Loading

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Issue: TypeScript Errors

**Solution**:
```bash
# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

# Or clear cache
rm -rf .next node_modules
npm install
```

### Issue: Dark Mode Not Working

**Solution**:
- Clear browser localStorage
- Check browser DevTools console
- Verify theme provider is wrapping app

### Issue: RTL Layout Not Working

**Checklist**:
- ✅ `dir` attribute set on `<html>` tag?
- ✅ Using RTL-aware Tailwind classes? (`rtl:ml-4`)
- ✅ Locale is 'ar'?

## Code Style

### Prettier (Auto-format on save)

Configuration in `.prettierrc`:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

**VS Code Settings**:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### ESLint

```bash
npm run lint         # Check for issues
npm run lint -- --fix # Auto-fix issues
```

### TypeScript

- **Strict Mode**: Enabled in `tsconfig.json`
- **No `any` Types**: Use proper types or `unknown`
- **Type Imports**: Use `import type` for types

```typescript
// ✅ Good
import type { User } from '@/lib/api/types';
const user: User = await fetchUser();

// ❌ Bad
const user: any = await fetchUser();
```

## Git Workflow

### Branch Naming
```
feature/user-management
bugfix/sign-in-error
refactor/api-client
```

### Commit Messages
```
feat: add user suspend functionality
fix: resolve sign-in redirect loop
refactor: extract API client logic
docs: update development guide
style: format code with prettier
test: add user table tests
chore: update dependencies
```

### Before Committing
```bash
npm run lint        # Check linting
npm run build       # Ensure build works
# Run tests (once implemented)
```

## Environment-Specific Configuration

### Development (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Staging (`.env.staging`)
```env
NEXT_PUBLIC_API_URL=https://staging-api.example.com
NEXT_PUBLIC_APP_URL=https://staging.example.com
```

### Production (`.env.production`)
```env
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_APP_URL=https://dashboard.example.com
```

## Performance Monitoring

### Web Vitals

Next.js tracks Core Web Vitals automatically:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

View in browser DevTools → Lighthouse.

### Bundle Analysis

```bash
# Install bundle analyzer
npm install -D @next/bundle-analyzer

# Add to next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

# Run analysis
ANALYZE=true npm run build
```

## Tips & Best Practices

### 1. Server Components by Default
Use Server Components unless you need interactivity.

### 2. Use URL for State
Store filters, pagination, search in URL params.

### 3. Validate Everywhere
Client-side (UX) + Server-side (security).

### 4. Error Boundaries
Wrap components in error boundaries for graceful failures.

### 5. Loading States
Always show loading UI for async operations.

### 6. Accessibility
- Use semantic HTML
- Add ARIA labels
- Test keyboard navigation

### 7. Mobile-First
Design for mobile, enhance for desktop.

### 8. Test Incrementally
Test after each phase, don't wait until the end.

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Cleanup
rm -rf .next             # Clear Next.js cache
rm -rf node_modules      # Remove dependencies
npm install              # Reinstall dependencies

# Package Management
npm outdated             # Check for outdated packages
npm update               # Update dependencies
npm audit                # Check for vulnerabilities
npm audit fix            # Fix vulnerabilities

# Git
git status               # Check status
git add .                # Stage changes
git commit -m "message"  # Commit changes
git push                 # Push to remote

# Backend (Laravel)
cd ../                   # Go to backend directory
php artisan serve        # Start backend server
php artisan migrate      # Run migrations
php artisan test         # Run backend tests
```

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [TanStack Query Documentation](https://tanstack.com/query)
- [React Hook Form Documentation](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)
