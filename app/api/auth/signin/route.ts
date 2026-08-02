import { NextRequest, NextResponse } from 'next/server';

function decodeXsrfToken(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const requestCookieHeader = request.headers.get('cookie') || '';
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const rawXsrfToken = request.cookies.get('XSRF-TOKEN')?.value;
    const xsrfToken = rawXsrfToken ? decodeXsrfToken(rawXsrfToken) : '';

    console.log('[API /auth/signin] Step 1: Validating browser CSRF cookies', {
      hasCookieHeader: !!requestCookieHeader,
      hasXsrfToken: !!xsrfToken,
    });
    // #region debug-point A:signin-proxy-entry
    fetch('http://127.0.0.1:7777/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: 'signin-session-error', runId: 'post-fix', hypothesisId: 'A', location: 'app/api/auth/signin/route.ts', msg: '[DEBUG] signin proxy received browser request', data: { baseURL, origin, referer, hasCookieHeader: !!requestCookieHeader, cookieHeaderLength: requestCookieHeader.length, hasXsrfToken: !!xsrfToken, cookieNames: requestCookieHeader.split(';').map((value) => value.trim().split('=')[0]).filter(Boolean), host: request.headers.get('host') }, ts: Date.now() }) }).catch(() => {});
    // #endregion

    if (!requestCookieHeader || !xsrfToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'common.error',
          debug: 'Missing Sanctum CSRF cookie. Request /api/sanctum/csrf-cookie first.',
        },
        { status: 419 }
      );
    }

    console.log('[API /auth/signin] Step 2: Attempting login');
    
    const loginResponse = await fetch(`${baseURL}/api/v1/platform/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': xsrfToken,
        Cookie: requestCookieHeader,
        ...(origin && { Origin: origin }),
        ...(referer && { Referer: referer }),
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await loginResponse.json();
    // #region debug-point E:signin-proxy-response
    fetch('http://127.0.0.1:7777/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: 'signin-session-error', runId: 'post-fix', hypothesisId: 'E', location: 'app/api/auth/signin/route.ts', msg: '[DEBUG] signin proxy received backend login response', data: { status: loginResponse.status, ok: loginResponse.ok, success: data?.success ?? null, code: data?.code ?? null, message: data?.message ?? null, debug: data?.debug ?? null, setCookieCount: loginResponse.headers.getSetCookie().length }, ts: Date.now() }) }).catch(() => {});
    // #endregion
    
    console.log('[API /auth/signin] Step 3: Login response:', {
      status: loginResponse.status,
      success: data.success,
    });
    
    if (!loginResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          code: data.code,
          message: data.code === 'AUTH_INVALID_CREDENTIALS'
            || data.code === 'AUTH_001'
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

      const authCookies = loginResponse.headers.getSetCookie();
      console.log('[API /auth/signin] Step 4: Forwarding cookies to browser', {
        authCookies: authCookies.length,
      });
      
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
