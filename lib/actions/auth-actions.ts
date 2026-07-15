'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { SignInInput } from '@/lib/validation/auth.schema';

export async function signInAction(credentials: SignInInput, locale: string) {
  try {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    console.log('[signInAction] Step 1: Getting CSRF cookie from:', `${baseURL}/sanctum/csrf-cookie`);
    
    // Step 1: Get CSRF cookie
    const csrfResponse = await fetch(`${baseURL}/sanctum/csrf-cookie`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
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
        'X-XSRF-TOKEN': xsrfToken,
        'Cookie': cookieHeader,
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
        const [cookiePair] = setCookie.split(';');
        const [name, value] = cookiePair.split('=');
        
        if (name && value) {
          cookieStore.set({
            name: name.trim(),
            value: value.trim(),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
          });
          console.log('[signInAction] Set cookie:', name.trim());
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

export async function signOutAction(locale: string) {
  try {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const cookieStore = await cookies();
    
    // Get cookies to send with logout request
    const xsrfToken = cookieStore.get('XSRF-TOKEN')?.value;
    const sessionCookie = cookieStore.get('ecommerce_session')?.value;
    
    if (xsrfToken && sessionCookie) {
      const cookieHeader = `XSRF-TOKEN=${xsrfToken}; ecommerce_session=${sessionCookie}`;
      
      await fetch(`${baseURL}/api/v1/platform/auth/logout`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'X-XSRF-TOKEN': decodeURIComponent(xsrfToken),
          'Cookie': cookieHeader,
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
