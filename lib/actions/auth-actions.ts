'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { SignInInput } from '@/lib/validation/auth.schema';

async function getRequestOrigin() {
  const requestHeaders = await headers();
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host');

  if (!host) {
    return null;
  }

  const protocol = requestHeaders.get('x-forwarded-proto')
    || (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');

  return `${protocol}://${host}`;
}

export async function signInAction(credentials: SignInInput, locale: string) {
  try {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const requestOrigin = await getRequestOrigin();
    const requestReferer = requestOrigin ? `${requestOrigin}/${locale}/sign-in` : undefined;
    
    console.log('[signInAction] Step 1: Getting CSRF cookie from:', `${baseURL}/sanctum/csrf-cookie`);
    
    // Step 1: Get CSRF cookie
    const csrfResponse = await fetch(`${baseURL}/sanctum/csrf-cookie`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(requestOrigin && { Origin: requestOrigin }),
        ...(requestReferer && { Referer: requestReferer }),
      },
    });
    
    // Extract cookies from the response
    const setCookieHeaders = csrfResponse.headers.getSetCookie();
    console.log('[signInAction] Step 2: Received', setCookieHeaders.length, 'Set-Cookie headers');
    
    // Parse XSRF-TOKEN and session cookie from Set-Cookie headers
    let xsrfToken = '';
    const allCookies: string[] = [];
    
    for (const setCookie of setCookieHeaders) {
      // Extract the cookie name=value pair (before first semicolon)
      const cookiePair = setCookie.split(';')[0];
      allCookies.push(cookiePair);
      
      // Extract and decode XSRF-TOKEN specifically
      if (setCookie.includes('XSRF-TOKEN=')) {
        const match = setCookie.match(/XSRF-TOKEN=([^;]+)/);
        if (match) {
          xsrfToken = decodeURIComponent(match[1]);
          console.log('[signInAction] Step 3: XSRF Token extracted (first 20 chars):', xsrfToken.substring(0, 20) + '...');
        }
      }
    }
    
    const cookieHeader = allCookies.join('; ');
    console.log('[signInAction] Step 4: Cookie header prepared with', allCookies.length, 'cookies');
    
    if (!xsrfToken || allCookies.length === 0) {
      return {
        success: false,
        message: 'common.error',
        debug: `Failed to get CSRF token from backend. Found ${allCookies.length} cookies, XSRF token: ${!!xsrfToken}`,
      };
    }
    
    // Step 2: Make login request with CSRF token and cookies
    const loginEndpoint = `${baseURL}/api/v1/platform/auth/login`;
    console.log('[signInAction] Step 5: Attempting login to:', loginEndpoint);
    console.log('[signInAction] Step 6: Using XSRF token and', allCookies.length, 'cookies');
    
    const loginResponse = await fetch(loginEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': xsrfToken,
        'Cookie': cookieHeader,
        ...(requestOrigin && { Origin: requestOrigin }),
        ...(requestReferer && { Referer: requestReferer }),
      },
      body: JSON.stringify(credentials),
    });
    
    const data = await loginResponse.json();
    console.log('[signInAction] Step 7: Login response:', { 
      status: loginResponse.status, 
      success: data.success,
      hasData: !!data.data,
    });
    
    if (!loginResponse.ok) {
      const errorCode = data.code || `HTTP_${loginResponse.status}`;
      return {
        success: false,
        message: data.code === 'AUTH_INVALID_CREDENTIALS' 
          ? 'auth.invalidCredentials' 
          : 'common.error',
        debug: `API Error: ${data.message || loginResponse.statusText} (${errorCode})`,
      };
    }
    
    if (data.success) {
      // Store auth cookies in Next.js
      const cookieStore = await cookies();
      
      // Forward Laravel cookies to the browser
      const authCookies = loginResponse.headers.getSetCookie();
      console.log('[signInAction] Step 8: Setting', authCookies.length, 'cookies from login response');
      
      for (const setCookie of authCookies) {
        // Parse the full Set-Cookie string to preserve all attributes
        const [cookiePair, ...attributes] = setCookie.split(';').map(s => s.trim());
        const [name, value] = cookiePair.split('=');
        
        if (name && value) {
          // Parse cookie attributes
          const attrs: any = {
            name: name.trim(),
            value: value.trim(),
            path: '/',
          };
          
          // Parse attributes from original Set-Cookie header
          for (const attr of attributes) {
            const [key, val] = attr.split('=').map(s => s.trim());
            const lowerKey = key.toLowerCase();
            
            if (lowerKey === 'httponly') {
              attrs.httpOnly = true;
            } else if (lowerKey === 'secure') {
              attrs.secure = true;
            } else if (lowerKey === 'samesite') {
              attrs.sameSite = val?.toLowerCase() || 'lax';
            } else if (lowerKey === 'max-age') {
              attrs.maxAge = parseInt(val || '0', 10);
            } else if (lowerKey === 'expires') {
              attrs.expires = new Date(val);
            } else if (lowerKey === 'path') {
              attrs.path = val || '/';
            }
          }
          
          // For development, don't use httpOnly so cookies work across server/client
          if (process.env.NODE_ENV === 'development') {
            attrs.httpOnly = false;
          }
          
          cookieStore.set(attrs);
          console.log('[signInAction] Set cookie:', name.trim(), 'with attributes:', 
            Object.keys(attrs).filter(k => k !== 'name' && k !== 'value'));
        }
      }
      
      console.log('[signInAction] Step 9: Authentication successful, redirecting to dashboard');
      
      // Redirect to dashboard
      redirect(`/${locale}`);
    }
    
    return {
      success: false,
      message: 'auth.invalidCredentials',
      debug: 'Login response success was false',
    };
  } catch (error) {
    console.error('[signInAction] Error:', error);
    
    if (error instanceof Error) {
      // Don't catch redirect
      if (error.message.includes('NEXT_REDIRECT')) {
        throw error;
      }
      
      return {
        success: false,
        message: 'common.error',
        debug: `Error: ${error.message}`,
      };
    }
    
    return {
      success: false,
      message: 'common.error',
      debug: 'Unknown error occurred',
    };
  }
}

export async function getCurrentUserAction() {
  try {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const cookieStore = await cookies();
    const requestOrigin = await getRequestOrigin();
    const requestReferer = requestOrigin ? `${requestOrigin}/` : undefined;
    
    // Get ALL cookies to see what we have
    const allCookies = cookieStore.getAll();
    console.log('[getCurrentUserAction] ALL cookies available:', allCookies.map(c => ({ name: c.name, valuePreview: c.value.substring(0, 20) })));
    
    // Get cookies for authenticated request
    const xsrfToken = cookieStore.get('XSRF-TOKEN')?.value;
    const sessionCookie = cookieStore.get('ecommerce_session')?.value;
    
    console.log('[getCurrentUserAction] Checking cookies:', {
      hasXsrfToken: !!xsrfToken,
      hasSessionCookie: !!sessionCookie,
      xsrfTokenPreview: xsrfToken?.substring(0, 20),
      sessionCookiePreview: sessionCookie?.substring(0, 20),
    });
    
    if (!xsrfToken || !sessionCookie) {
      console.log('[getCurrentUserAction] Missing cookies, returning unauthenticated');
      return {
        success: false,
        authenticated: false,
        user: null,
      };
    }
    
    const cookieHeader = `XSRF-TOKEN=${xsrfToken}; ecommerce_session=${sessionCookie}`;
    
    console.log('[getCurrentUserAction] Calling /api/v1/platform/auth/me with cookies');
    console.log('[getCurrentUserAction] Cookie header length:', cookieHeader.length);
    
    const response = await fetch(`${baseURL}/api/v1/platform/auth/me`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Cookie': cookieHeader,
        ...(requestOrigin && { Origin: requestOrigin }),
        ...(requestReferer && { Referer: requestReferer }),
      },
    });
    
    const responseText = await response.text();
    console.log('[getCurrentUserAction] Response:', {
      status: response.ok,
      httpStatus: response.status,
      bodyPreview: responseText.substring(0, 200),
    });
    
    if (!response.ok) {
      console.log('[getCurrentUserAction] Auth check failed, returning unauthenticated');
      return {
        success: false,
        authenticated: false,
        user: null,
      };
    }
    
    const data = JSON.parse(responseText);
    
    if (data.success && data.data) {
      console.log('[getCurrentUserAction] Authenticated as:', data.data.user.email);
      return {
        success: true,
        authenticated: true,
        user: data.data.user,
        session: data.data.session,
        config: data.data.config,
      };
    }
    
    return {
      success: false,
      authenticated: false,
      user: null,
    };
  } catch (error) {
    console.error('[getCurrentUserAction] Error:', error);
    return {
      success: false,
      authenticated: false,
      user: null,
    };
  }
}

export async function signOutAction(locale: string) {
  try {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const cookieStore = await cookies();
    const requestOrigin = await getRequestOrigin();
    const requestReferer = requestOrigin ? `${requestOrigin}/${locale}` : undefined;
    
    // Get cookies to send with logout request
    const xsrfToken = cookieStore.get('XSRF-TOKEN')?.value;
    const sessionCookie = cookieStore.get('ecommerce_session')?.value;
    
    if (xsrfToken && sessionCookie) {
      const cookieHeader = `XSRF-TOKEN=${xsrfToken}; ecommerce_session=${sessionCookie}`;
      
      await fetch(`${baseURL}/api/v1/platform/auth/logout`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-XSRF-TOKEN': decodeURIComponent(xsrfToken),
          'Cookie': cookieHeader,
          ...(requestOrigin && { Origin: requestOrigin }),
          ...(requestReferer && { Referer: requestReferer }),
        },
      });
    }
    
    // Clear cookies
    cookieStore.delete('ecommerce_session');
    cookieStore.delete('XSRF-TOKEN');
    
  } catch (error) {
    console.error('[signOutAction] Error:', error);
  }
  
  redirect(`/${locale}/sign-in`);
}
