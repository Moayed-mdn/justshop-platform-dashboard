import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    console.log('[API /auth/signin] Step 1: Getting CSRF cookie');
    
    // Step 1: Get CSRF cookie
    const csrfResponse = await fetch(`${baseURL}/sanctum/csrf-cookie`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    // Extract cookies from the response
    const setCookieHeaders = csrfResponse.headers.getSetCookie();
    console.log('[API /auth/signin] Step 2: Received', setCookieHeaders.length, 'Set-Cookie headers');
    
    // Parse XSRF-TOKEN and session cookie from Set-Cookie headers
    let xsrfToken = '';
    const allCookies: string[] = [];
    
    for (const setCookie of setCookieHeaders) {
      const cookiePair = setCookie.split(';')[0];
      allCookies.push(cookiePair);
      
      if (setCookie.includes('XSRF-TOKEN=')) {
        const match = setCookie.match(/XSRF-TOKEN=([^;]+)/);
        if (match) {
          xsrfToken = decodeURIComponent(match[1]);
        }
      }
    }
    
    const cookieHeader = allCookies.join('; ');
    
    if (!xsrfToken || allCookies.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'common.error',
          debug: 'Failed to get CSRF token from backend',
        },
        { status: 500 }
      );
    }
    
    // Step 2: Make login request
    console.log('[API /auth/signin] Step 3: Attempting login');
    
    const loginResponse = await fetch(`${baseURL}/api/v1/platform/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-XSRF-TOKEN': xsrfToken,
        'Cookie': cookieHeader,
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await loginResponse.json();
    
    console.log('[API /auth/signin] Step 4: Login response:', {
      status: loginResponse.status,
      success: data.success,
    });
    
    if (!loginResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.code === 'AUTH_INVALID_CREDENTIALS'
            ? 'auth.invalidCredentials'
            : 'common.error',
          debug: `API Error: ${data.message || loginResponse.statusText}`,
        },
        { status: loginResponse.status }
      );
    }
    
    if (data.success) {
      // Create response with success
      const response = NextResponse.json({
        success: true,
        redirect: true,
      });
      
      // Forward all Laravel cookies to the browser
      const authCookies = loginResponse.headers.getSetCookie();
      console.log('[API /auth/signin] Step 5: Forwarding', authCookies.length, 'cookies to browser');
      
      // Forward cookies EXACTLY as Laravel sent them
      for (const setCookieHeader of authCookies) {
        // Add the Set-Cookie header directly to the response
        response.headers.append('Set-Cookie', setCookieHeader);
        
        const cookieName = setCookieHeader.split('=')[0];
        console.log('[API /auth/signin] Forwarded cookie:', cookieName);
      }
      
      return response;
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'auth.invalidCredentials',
      },
      { status: 401 }
    );
  } catch (error) {
    console.error('[API /auth/signin] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'common.error',
        debug: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
