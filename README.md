# JustShop Platform Dashboard

A production-grade admin dashboard for the **JustShop multi-tenant commerce platform**.

This application is used by platform administrators to manage users, stores, CMS content, audit logs, feature flags, and support-oriented platform workflows.

## Related Repositories

* [JustShop Multi-Tenant Commerce Platform](https://github.com/Moayed-mdn/justshop-multitenant-commerce-platform)
* [JustShop API](https://github.com/Moayed-mdn/justshop-api)
* [JustShop Merchant Dashboard](https://github.com/Moayed-mdn/justshop-merchant-dashboard)
* [JustShop Storefront](https://github.com/Moayed-mdn/justshop-storefront)

## Overview

The Platform Dashboard provides a centralized workspace for platform-level operations, including:

* User management
* Store management
* CMS management
* Analytics
* Audit logs
* Feature flags
* Support tools
* Arabic and English localization
* RTL support
* Dark and light themes

It is intentionally separate from the merchant dashboard and storefront so platform authority stays clearly isolated from merchant operations.

## Technology Stack

* Next.js 16
* React 19
* TypeScript
* Tailwind CSS v4
* shadcn/ui
* Radix UI
* TanStack Query
* TanStack Table
* Zod
* React Hook Form
* Zustand
* next-intl
* Recharts

## Architecture

The dashboard is a frontend client of the JustShop API.

```text
Platform Admin
    ↓
Next.js Platform Dashboard
    ↓
Typed API layer / route handlers
    ↓
Laravel API
    ↓
MySQL / Redis / Storage / External services
```

The backend remains the source of truth for authentication, authorization, tenant boundaries, and data integrity.

## Main Features

* Platform-wide user administration
* Tenant and store monitoring
* CMS content management
* Audit log viewing
* Feature flag management
* Dashboard analytics and summaries
* Support-oriented workflows
* Bilingual UI in English and Arabic
* Full RTL layout support
* Responsive dashboard layout
* Dark and light mode support

## Local Development

### Prerequisites

* Node.js
* npm
* Running `justshop-api`
* Correct Laravel Sanctum and CORS configuration

### Install

```bash
git clone https://github.com/Moayed-mdn/justshop-platform-dashboard.git
cd justshop-platform-dashboard
npm install
cp .env.example .env.local
```

### Run

```bash
npm run dev
```

The dashboard should run on:

```text
http://localhost:3001
```

> `package.json`'s `dev` script pins this to port 3001 (`next dev --webpack -p 3001`). If you're
> coming from an older note that says 3000 or 3002, this is the current, correct port.

## Environment Variables

Use the variable names from `.env.example`.

Typical values include:

* API base URL
* Application URL
* Default locale
* Any public runtime configuration needed by the frontend

Do not commit real credentials or session-related values.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

Use `package.json` as the source of truth for the current scripts.

## Project Structure

```text
app/            Next.js App Router pages and layouts
components/     Reusable UI and feature components
lib/            API clients, helpers, providers, stores
locales/        English and Arabic translation files
public/         Static assets
docs/           Project documentation
  guides/         How-to guides (quick start, CSS utilities, plan management)
  features/       Living reference docs for what's currently implemented
  archive/        Historical build logs, phase by phase and feature by feature
```

## Documentation

- Start with [`docs/README.md`](./docs/README.md) for a map of everything below.
- [`CHANGELOG.md`](./CHANGELOG.md) tracks notable changes release over release.
- [`docs/guides/quick-start.md`](./docs/guides/quick-start.md) gets a fresh checkout running.

## Screenshots

Recommended screenshots to add:

* Dashboard home
* Users page
* Store details page
* CMS page management
* Audit logs
* Feature flags
* Arabic RTL view

Put them in:

```text
docs/screenshots/
```

## Security Notes

* Do not expose secrets in the repository.
* Do not rely on frontend route hiding as authorization.
* Keep session and CSRF handling on the backend side.
* Avoid committing debug traces or request dumps.

## Status

Active portfolio project.

Docker and GitHub Actions will be added in the next phase.
