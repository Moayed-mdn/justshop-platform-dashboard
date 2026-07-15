# Platform Dashboard

A production-grade Next.js 15 dashboard for platform administrators to manage a multi-tenant e-commerce platform.

## 🎯 Overview

The Platform Dashboard provides comprehensive management tools for Super Admins and Support Agents to:

- **User Management**: View, suspend, and activate platform users
- **Store Management**: Monitor and manage tenant stores
- **CMS Management**: Manage blog posts, documentation, and marketing pages
- **Analytics**: View platform-wide statistics and growth metrics
- **Support Tools**: Handle support tickets, user lookups, and governed impersonation
- **Audit Logs**: Track all administrative actions
- **Feature Flags**: Control platform-wide feature rollouts
- **Lead Management**: Track and manage potential customers

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v18.18.0 or higher
- **npm**: v10.0.0 or higher
- **Laravel Backend**: The backend must be running at `http://localhost:8000`

### Installation

1. **Clone and navigate to the project**:
   ```bash
   cd /home/leader/projects/laravel/v3/tenant/laratenant-backend/platform-dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and configure:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_APP_NAME=Platform Dashboard
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_DEFAULT_LOCALE=en
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   ```
   http://localhost:3000
   ```

   The app will automatically redirect to `http://localhost:3000/en` (English) or `/ar` (Arabic).

## 📁 Project Structure

```
platform-dashboard/
├── app/                      # Next.js App Router
│   ├── [locale]/            # Localized routes
│   │   ├── layout.tsx       # Main layout with providers
│   │   ├── page.tsx         # Home page
│   │   ├── error.tsx        # Error boundary
│   │   └── not-found.tsx    # 404 page
│   └── globals.css          # Global styles with Tailwind
├── components/              # React components
│   ├── ui/                  # shadcn/ui base components
│   ├── dashboard/           # Dashboard-specific components
│   ├── forms/               # Form components
│   ├── tables/              # Table components
│   └── shared/              # Shared utilities (theme toggle, language switcher)
├── lib/                     # Utility functions and libraries
│   ├── api/                 # API client and endpoints
│   ├── providers/           # React context providers
│   ├── stores/              # Zustand state stores
│   └── utils.ts             # Utility functions (cn, etc.)
├── locales/                 # i18n translation files
│   ├── en.json              # English translations
│   └── ar.json              # Arabic translations
├── public/                  # Static assets
├── docs/                    # Documentation
│   ├── ARCHITECTURE.md      # Architecture overview
│   ├── DEVELOPMENT.md       # Development guide
│   ├── API_INTEGRATION.md   # API integration details
│   └── TESTING.md           # Testing guide
├── .env.local               # Environment variables (not in git)
├── .env.example             # Environment template
├── i18n.ts                  # i18n configuration
├── middleware.ts            # Next.js middleware (locale routing)
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration (v4)
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## 🛠️ Available Scripts

### Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Testing (Coming in Phase 9)
```bash
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run E2E tests
```

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Laravel backend API URL | `http://localhost:8000` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `Platform Dashboard` |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | `http://localhost:3000` |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | Default language | `en` |

## 🌍 Internationalization

The dashboard supports English and Arabic with full RTL (Right-to-Left) layout support:

- **English**: `http://localhost:3000/en`
- **Arabic**: `http://localhost:3000/ar`

Switch languages using the language switcher in the header.

## 🎨 Features

### Completed (Phase 1)
- ✅ Next.js 15 + React 19 + TypeScript
- ✅ Tailwind CSS v4 with dark mode
- ✅ shadcn/ui components
- ✅ Internationalization (English & Arabic)
- ✅ RTL layout support
- ✅ Theme toggle (Light/Dark/System)
- ✅ Project foundation and configuration

### In Progress
- 🚧 Authentication & Authorization (Phase 2)
- 🚧 Dashboard Analytics (Phase 3)
- 🚧 User Management (Phase 4)
- 🚧 Store Management (Phase 5)
- 🚧 CMS Management (Phase 7)
- 🚧 Support Tools (Phase 8)

## 🔗 Backend Integration

This frontend connects to the Laravel backend located at:
```
../laratenant-backend/
```

**API Base URL**: `http://localhost:8000`

### Running Both Projects

1. **Terminal 1 - Backend**:
   ```bash
   cd /home/leader/projects/laravel/v3/tenant/laratenant-backend
   php artisan serve
   ```

2. **Terminal 2 - Frontend**:
   ```bash
   cd /home/leader/projects/laravel/v3/tenant/laratenant-backend/platform-dashboard
   npm run dev
   ```

## 🧪 Testing

Testing will be implemented in Phase 9. The dashboard will include:

- **Unit Tests**: Utility functions and business logic (Vitest)
- **Component Tests**: React components (React Testing Library)
- **E2E Tests**: Critical user workflows (Playwright)
- **Accessibility Tests**: WCAG compliance (jest-axe)

## 📚 Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Development Guide](./docs/DEVELOPMENT.md)
- [API Integration](./docs/API_INTEGRATION.md)
- [Testing Guide](./docs/TESTING.md)

## 🐛 Troubleshooting

### Issue: Port 3000 already in use
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9
# Or use a different port
npm run dev -- -p 3001
```

### Issue: Backend API not responding
- Ensure Laravel backend is running: `php artisan serve`
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify CORS is configured in backend

### Issue: Translation keys not working
- Clear `.next` cache: `rm -rf .next`
- Restart dev server: `npm run dev`

### Issue: Dark mode not working
- Clear browser localStorage
- Check browser console for errors

## 📝 License

This project is proprietary and confidential.

## 🤝 Contributing

This is an internal project. Follow the development workflow in `docs/DEVELOPMENT.md`.

## 📞 Support

For issues or questions, contact the development team.
