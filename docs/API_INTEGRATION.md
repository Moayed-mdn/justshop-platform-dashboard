# API Integration Guide

## Overview

The Platform Dashboard connects to a Laravel REST API backend. This document explains how the frontend integrates with the backend API.

## Backend Location

The Laravel backend is located in the same workspace:
```
/home/leader/projects/laravel/v3/tenant/laratenant-backend/
```

**API Base URL**: `http://localhost:8000`

## API Client Architecture

### Base API Client

Location: `lib/api/client.ts`

```typescript
export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Include httpOnly cookies
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json();
  }

  private async handleError(response: Response) {
    const error = await response.json();
    return new ApiError(error.message, error.code, response.status);
  }
}

export const apiClient = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
);
```

## Authentication Flow

### 1. Sign-In

**Frontend Request**:
```typescript
// lib/api/endpoints/auth.ts
export async function signIn(email: string, password: string) {
  return apiClient.request('/api/v1/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
```

**Backend Response** (Laravel):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "super_admin"
    }
  }
}
```

**Cookie**: Backend sets httpOnly cookie with Sanctum token

### 2. Authenticated Requests

All subsequent requests automatically include the httpOnly cookie:

```typescript
// The cookie is automatically sent
const users = await apiClient.request('/api/v1/platform/users');
```

**Request Headers**:
```
GET /api/v1/platform/users HTTP/1.1
Host: localhost:8000
Cookie: laravel_session=...; XSRF-TOKEN=...
Content-Type: application/json
Accept: application/json
```

### 3. Sign-Out

```typescript
// lib/api/endpoints/auth.ts
export async function signOut() {
  return apiClient.request('/api/v1/users/logout', {
    method: 'POST',
  });
}
```

Backend clears the cookie.

## API Response Format

### Success Response

```typescript
interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
}
```

**Example**:
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [...],
    "pagination": {
      "current_page": 1,
      "per_page": 15,
      "total": 100,
      "last_page": 7
    }
  }
}
```

### Error Response

```typescript
interface ApiError {
  success: false;
  message: string;
  code: string;
  errors?: Record<string, string[]>;
}
```

**Example**:
```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

## Error Handling

### Backend Error Codes

The backend uses an `ErrorCode` enum. Map these to frontend messages:

```typescript
// lib/api/utils/error-handler.ts
export function mapErrorToMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    // Authentication
    'AUTH_INVALID_CREDENTIALS': 'auth.invalidCredentials',
    'AUTH_SESSION_EXPIRED': 'auth.sessionExpired',
    
    // Users
    'USER_NOT_FOUND': 'errors.userNotFound',
    'USER_ALREADY_SUSPENDED': 'errors.userAlreadySuspended',
    'USER_CANNOT_SUSPEND_SELF': 'errors.cannotSuspendSelf',
    
    // Stores
    'STORE_NOT_FOUND': 'errors.storeNotFound',
    'STORE_ALREADY_SUSPENDED': 'errors.storeAlreadySuspended',
    
    // Generic
    'INTERNAL_SERVER_ERROR': 'errors.serverError',
    'VALIDATION_ERROR': 'errors.validationError',
    'UNAUTHORIZED': 'errors.unauthorized',
    'FORBIDDEN': 'errors.forbidden',
  };

  return errorMessages[errorCode] || 'common.error';
}
```

### Using Error Handler

```typescript
// In a Server Action
import { toast } from 'sonner';

export async function suspendUserAction(userId: string, reason?: string) {
  try {
    await suspendUser(userId, reason);
    toast.success(t('users.suspendSuccess'));
  } catch (error) {
    const message = mapErrorToMessage(error.code);
    toast.error(t(message));
  }
}
```

## API Endpoints Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users/login` | Sign in |
| POST | `/api/v1/users/logout` | Sign out |
| GET | `/api/v1/users/me` | Get current user |

### Platform - Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/platform/dashboard` | Get dashboard stats |
| GET | `/api/v1/platform/analytics` | Get analytics data |

### Platform - Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/platform/users` | List users |
| GET | `/api/v1/platform/users/{id}` | Get user details |
| POST | `/api/v1/platform/users/{id}/suspend` | Suspend user |
| POST | `/api/v1/platform/users/{id}/activate` | Activate user |

### Platform - Stores

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/platform/stores` | List stores |
| GET | `/api/v1/platform/stores/{id}` | Get store details |
| POST | `/api/v1/platform/stores/{id}/suspend` | Suspend store |
| POST | `/api/v1/platform/stores/{id}/activate` | Activate store |

### Platform - Audit Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/platform/audit/logs` | List audit logs |

### Platform - Feature Flags

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/platform/features` | List feature flags |
| POST | `/api/v1/platform/features/{id}/enable` | Enable feature |
| POST | `/api/v1/platform/features/{id}/disable` | Disable feature |

### Platform - Leads

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/platform/leads` | List leads |
| GET | `/api/v1/platform/leads/{id}` | Get lead details |
| PUT | `/api/v1/platform/leads/{id}` | Update lead |
| DELETE | `/api/v1/platform/leads/{id}` | Delete lead |

### Platform - CMS (Blog)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/platform/cms/blog` | List blog posts |
| GET | `/api/v1/platform/cms/blog/{id}` | Get blog post |
| POST | `/api/v1/platform/cms/blog` | Create blog post |
| PUT | `/api/v1/platform/cms/blog/{id}` | Update blog post |
| DELETE | `/api/v1/platform/cms/blog/{id}` | Delete blog post |
| POST | `/api/v1/platform/cms/blog/{id}/publish` | Publish post |
| POST | `/api/v1/platform/cms/blog/{id}/unpublish` | Unpublish post |

### Support - Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/support/dashboard` | Get support dashboard stats |

### Support - Tickets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/support/tickets` | List tickets |
| GET | `/api/v1/support/tickets/{id}` | Get ticket details |
| POST | `/api/v1/support/tickets/{id}/assign` | Assign ticket |
| POST | `/api/v1/support/tickets/{id}/resolve` | Resolve ticket |
| POST | `/api/v1/support/tickets/{id}/notes` | Add internal note |

### Support - Impersonation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/support/impersonation/request` | Request impersonation |
| POST | `/api/v1/support/impersonation/terminate` | Terminate impersonation |

## Pagination

The backend uses Laravel pagination:

**Request**:
```
GET /api/v1/platform/users?page=2&per_page=15
```

**Response**:
```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "current_page": 2,
      "per_page": 15,
      "total": 100,
      "last_page": 7,
      "from": 16,
      "to": 30
    }
  }
}
```

**Frontend Usage**:
```typescript
const page = Number(searchParams.page) || 1;
const { users, pagination } = await fetchUsers({ page });
```

## Filtering & Sorting

**Request**:
```
GET /api/v1/platform/users?search=john&role=admin&status=active&sort=name&order=asc
```

**Frontend Usage**:
```typescript
const filters = {
  search: searchParams.search || '',
  role: searchParams.role || 'all',
  status: searchParams.status || 'all',
  sort: searchParams.sort || 'created_at',
  order: searchParams.order || 'desc',
};

const users = await fetchUsers(filters);
```

## CORS Configuration

The backend must allow requests from the frontend:

**Laravel Backend** (`config/cors.php`):
```php
'paths' => ['api/*'],
'allowed_origins' => [
    'http://localhost:3000',
    'http://localhost:3001',
],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => true, // Important for cookies
```

## Example: Complete API Integration

### 1. Define TypeScript Types

```typescript
// lib/api/types.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'support_agent';
  status: 'active' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}
```

### 2. Create API Endpoint Functions

```typescript
// lib/api/endpoints/users.ts
import { apiClient } from '../client';
import type { User, UsersResponse } from '../types';

export interface FetchUsersParams {
  page?: number;
  per_page?: number;
  search?: string;
  role?: string;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export async function fetchUsers(params: FetchUsersParams = {}) {
  const query = new URLSearchParams(params as any).toString();
  const response = await apiClient.request<UsersResponse>(
    `/api/v1/platform/users?${query}`
  );
  return response.data;
}

export async function fetchUser(id: string) {
  const response = await apiClient.request<{ user: User }>(
    `/api/v1/platform/users/${id}`
  );
  return response.data.user;
}

export async function suspendUser(id: string, reason?: string) {
  return apiClient.request(`/api/v1/platform/users/${id}/suspend`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function activateUser(id: string) {
  return apiClient.request(`/api/v1/platform/users/${id}/activate`, {
    method: 'POST',
  });
}
```

### 3. Use in Server Component

```tsx
// app/[locale]/(dashboard)/users/page.tsx
import { fetchUsers } from '@/lib/api/endpoints/users';
import { UserTable } from '@/components/tables/user-table';

export default async function UsersPage({ 
  searchParams 
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams;
  const { users, pagination } = await fetchUsers({
    page: Number(params.page) || 1,
    search: params.search || '',
  });

  return (
    <div>
      <h1>Users</h1>
      <UserTable data={users} pagination={pagination} />
    </div>
  );
}
```

### 4. Use in Server Action

```typescript
// lib/actions/user-actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { suspendUser } from '@/lib/api/endpoints/users';

export async function suspendUserAction(
  userId: string, 
  reason?: string
) {
  try {
    await suspendUser(userId, reason);
    revalidatePath('/users');
    return { success: true, message: 'User suspended successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
```

### 5. Call Server Action from Client Component

```tsx
// components/users/suspend-user-dialog.tsx
'use client';

import { suspendUserAction } from '@/lib/actions/user-actions';
import { toast } from 'sonner';

export function SuspendUserDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');

  const handleSuspend = async () => {
    const result = await suspendUserAction(userId, reason);
    
    if (result.success) {
      toast.success(result.message);
      setOpen(false);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Dialog content */}
    </Dialog>
  );
}
```

## Debugging API Calls

### 1. Browser Network Tab

- Open DevTools → Network
- Filter by "Fetch/XHR"
- Click on a request to see:
  - Request headers
  - Request payload
  - Response headers
  - Response body

### 2. Log API Calls

```typescript
// lib/api/client.ts (development only)
if (process.env.NODE_ENV === 'development') {
  console.log('[API Request]', method, endpoint, options);
  console.log('[API Response]', response.status, data);
}
```

### 3. Backend Logs

Check Laravel logs:
```bash
cd /home/leader/projects/laravel/v3/tenant/laratenant-backend
tail -f storage/logs/laravel.log
```

## Security Best Practices

1. **Never expose tokens**: httpOnly cookies only
2. **Validate all inputs**: Client + server validation
3. **Use HTTPS in production**: Encrypt all traffic
4. **CSRF protection**: Laravel Sanctum handles this
5. **Rate limiting**: Backend should implement rate limiting
6. **Error messages**: Don't expose sensitive information

## Testing API Integration

Coming in Phase 9:

```typescript
// __tests__/api/users.test.ts
import { fetchUsers, suspendUser } from '@/lib/api/endpoints/users';

describe('Users API', () => {
  it('fetches users successfully', async () => {
    const { users } = await fetchUsers({ page: 1 });
    expect(users).toBeInstanceOf(Array);
  });

  it('suspends a user', async () => {
    const result = await suspendUser('1', 'Test reason');
    expect(result.success).toBe(true);
  });
});
```
