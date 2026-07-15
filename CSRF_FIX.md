# CSRF Token Mismatch Fix (HTTP 419)

**Date**: July 15, 2026  
**Issue**: Login failing with "CSRF token mismatch" error  
**Status**: ✅ FIXED

---

## Problem

The Next.js platform dashboard was failing to authenticate with the Laravel backend due to a CSRF token mismatch (HTTP 419 error).

### Root Cause

Next.js Server Actions don't automatically handle cookies like browser `fetch()` does. The `credentials: 'include'` option doesn't work server-side. This meant:

1. The CSRF cookie request (`/sanctum/csrf-cookie`) would receive cookies
2. But those cookies weren't being passed to the login request
3. Laravel couldn't verify the CSRF token without the session cookie

---

## Solution

### 1. Manual Cookie Handling in Server Action

**File**: `lib/actions/auth-actions.ts`

Changed from using `credentials: 'include'` to manually extracting and forwarding cookies:

```typescript
// Step 1: Get CSRF cookie
const csrfResponse = await fetch(`${baseURL}/sanctum/csrf-cookie`, {
  method: 'GET',
  headers: { 'Accept': 'application/json' },
});

// Step 2: Extract ALL cookies from Set-Cookie headers
const setCookieHeaders = csrfResponse.headers.getSetCookie();
const allCookies: string[] = [];
let xsrfToken = '';

for (const setCookie of setCookieHeaders) {
  // Get cookie name=value pair
  const cookiePair = setCookie.split(';')[0];
  allCookies.push(cookiePair);
  
  // Decode XSRF-TOKEN
  if (setCookie.includes('XSRF-TOKEN=')) {
    const match = setCookie.match(/XSRF-TOKEN=([^;]+)/);
    if (match) {
      xsrfToken = decodeURIComponent(match[1]);
    }
  }
}

// Step 3: Pass cookies to login request
const cookieHeader = allCookies.join('; ');

const loginResponse = await fetch(`${baseURL}/api/v1/platform/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-XSRF-TOKEN': xsrfToken,        // Decoded token in header
    'Cookie': cookieHeader,           // All cookies (XSRF-TOKEN + ecommerce_session)
  },
  body: JSON.stringify(credentials),
});
```

### 2. Updated Sanctum Stateful Domains

**File**: `/home/leader/projects/laravel/v3/tenant/laratenant-backend/.env`

Added `localhost:3001` to the stateful domains:

```env
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000,localhost:3001,localhost:3002,localhost:8000,127.0.0.1,127.0.0.1:8000,justshop.test,justshop.test:3000,.justshop.test,.justshop.test:3000
```

### 3. Fixed Environment Variables

**File**: `platform-dashboard/.env.local`

Updated the app URL to match the actual port:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

---

## Key Points

### Why Manual Cookie Handling?

In Next.js Server Actions (server-side code):
- ❌ `credentials: 'include'` doesn't work
- ❌ Cookies aren't automatically forwarded between fetch requests
- ✅ Must manually extract cookies from `Set-Cookie` headers
- ✅ Must manually pass cookies in `Cookie` header

In Browser JavaScript:
- ✅ `credentials: 'include'` works perfectly
- ✅ Browser automatically manages cookies

### CSRF Flow

```
1. Frontend calls /sanctum/csrf-cookie
   ← Laravel returns: XSRF-TOKEN + ecommerce_session cookies

2. Frontend extracts cookies from Set-Cookie headers
   - XSRF-TOKEN=eyJpdiI6... (URL-encoded)
   - ecommerce_session=abc123...

3. Frontend decodes XSRF-TOKEN
   - From: eyJpdiI6...
   - To: {"iv":"...","value":"..."}

4. Frontend calls /api/v1/platform/auth/login with:
   - Header: X-XSRF-TOKEN: {"iv":"...","value":"..."}
   - Header: Cookie: XSRF-TOKEN=eyJpdiI6...; ecommerce_session=abc123...
   - Body: {"email":"...","password":"..."}

5. Laravel verifies:
   - Session cookie matches
   - XSRF token in header matches cookie
   ✅ Authentication succeeds
```

---

## Testing

### Prerequisites
- Backend running on `http://localhost:8000`
- Frontend running on `http://localhost:3001`
- Test user: `super@test.com` / `password`

### Steps

1. Open browser to: `http://localhost:3001/en/sign-in`
2. Open browser console (F12)
3. Enter credentials and click "Sign In"
4. Check console logs - should see:
   ```
   [signInAction] Step 1: Getting CSRF cookie from: http://localhost:8000/sanctum/csrf-cookie
   [signInAction] Step 2: Received 2 Set-Cookie headers
   [signInAction] Step 3: XSRF Token extracted (first 20 chars): eyJpdiI6...
   [signInAction] Step 4: Cookie header prepared with 2 cookies
   [signInAction] Step 5: Attempting login to: http://localhost:8000/api/v1/platform/auth/login
   [signInAction] Step 6: Using XSRF token and 2 cookies
   [signInAction] Step 7: Login response: { status: 200, success: true, hasData: true }
   [signInAction] Step 8: Setting 2 cookies from login response
   [signInAction] Step 9: Authentication successful, redirecting to dashboard
   ```
5. Should redirect to: `http://localhost:3001/en`

### Expected Result
✅ No CSRF token mismatch error  
✅ Login succeeds  
✅ Redirects to dashboard  

---

## Files Changed

1. **`lib/actions/auth-actions.ts`**
   - Added manual cookie extraction from CSRF response
   - Properly decode XSRF-TOKEN
   - Pass all cookies in Cookie header to login request
   - Enhanced logging for debugging
   - Fixed signOutAction to use proper cookie handling

2. **`.env` (Backend)**
   - Added `localhost:3001` to `SANCTUM_STATEFUL_DOMAINS`

3. **`.env.local` (Frontend)**
   - Updated `NEXT_PUBLIC_APP_URL` from 3000 to 3001

4. **`POSTMAN_TEST.md`**
   - Added frontend testing section
   - Documented the fix and changes

---

## Debug Checklist

If login still fails, check:

1. **Backend is running**: `http://localhost:8000` should be accessible
2. **Console shows all steps**: Open browser console and look for `[signInAction]` logs
3. **Step 2 shows 2 cookies**: Should receive XSRF-TOKEN + ecommerce_session
4. **Step 3 extracts token**: Should show first 20 chars of decoded token
5. **Step 7 shows status 200**: Login request succeeded
6. **Laravel session config**: Check `.env` has correct SESSION_COOKIE name
7. **Sanctum domains**: Verify `localhost:3001` is in SANCTUM_STATEFUL_DOMAINS

---

## Related Files

- **Auth Action**: `lib/actions/auth-actions.ts` (Server Action with CSRF handling)
- **Sign-in Form**: `components/forms/sign-in-form.tsx` (Client component)
- **Sign-in Page**: `app/[locale]/(auth)/sign-in/page.tsx`
- **Backend Docs**: `/home/leader/projects/laravel/v3/tenant/laratenant-backend/POSTMAN_TEST.md`
- **Backend .env**: `/home/leader/projects/laravel/v3/tenant/laratenant-backend/.env`

---

**Status**: Ready for testing  
**Next Step**: Test login with `super@test.com` / `password`
