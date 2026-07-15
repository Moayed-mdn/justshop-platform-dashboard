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
      credentials: 'include',
    });
    
    // Extract cookies from the response
    const setCookieHeaders = csrfResponse.headers.getSetCookie();
    console.log('[signInAction] Step 2: Received cookies:', setCookieHeaders.length);
    
    // Parse XSRF-TOKEN from Set-Cookie headers
    let xsrfToken = '';
    let sessionCookie = '';
    
    for (const setCookie of setCookieHeaders) {
      if (setCookie.includes('XSRF-TOKEN=')) {
        const match = setCookie.match(/XSRF-TOKEN=([^;]+)/);
        if (match) {
          xsrfToken = decodeURIComponent(match[1]);
        }
      }
      if (setCookie.includes('laravel_session=')) {
        sessionCookie = setCookie.split(';')[0];
      }
    }
    
    console.log('[signInAction] Step 3: XSRF Token found:', !!xsrfToken);
    
    if (!xsrfToken) {
      return {
        success: false,
        message: 'common.error',
        debug: 'Failed to get CSRF token from backend',
      };
    }
    
    // Step 2: Make login request with CSRF token
    console.log('[signInAction] Step 4: Attempting login to:', `${baseURL}/api/v1/users/auth/login`);
    
    const loginResponse = await fetch(`${baseURL}/api/v1/users/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-XSRF-TOKEN': xsrfToken,
        'Cookie': sessionCookie,
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });
    
    const data = await loginResponse.json();
    console.log('[signInAction] Step 5: Login response:', { status: loginResponse.status, success: data.success });
    
    if (!loginResponse.ok) {
      return {
        success: false,
        message: data.code === 'AUTH_INVALID_CREDENTIALS' 
          ? 'auth.invalidCredentials' 
          : 'common.error',
        debug: `API Error: ${data.message} (${data.code})`,
      };
    }
    
    if (data.success) {
      // Store auth cookies in Next.js
      const cookieStore = await cookies();
      
      // Forward Laravel cookies to the browser
      const authCookies = loginResponse.headers.getSetCookie();
      for (const setCookie of authCookies) {
        const [cookiePair, ...attributes] = setCookie.split(';');
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
        }
      }
      
      console.log('[signInAction] Step 6: Redirecting to dashboard');
      
      // Redirect to dashboard
      redirect(`/${locale}`);
    }
    
    return {
      success: false,
      message: 'auth.invalidCredentials',
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
    
    await fetch(`${baseURL}/api/v1/users/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    
    // Clear cookies
    const cookieStore = await cookies();
    cookieStore.delete('laravel_session');
    cookieStore.delete('XSRF-TOKEN');
    
  } catch (error) {
    console.error('[signOutAction] Error:', error);
  }
  
  redirect(`/${locale}/sign-in`);
}
