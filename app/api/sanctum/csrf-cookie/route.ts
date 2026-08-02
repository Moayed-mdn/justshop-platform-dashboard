import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_URL ||
  'http://localhost:8000';

/**
 * CSRF Cookie Proxy
 * 
 * Proxies /api/sanctum/csrf-cookie to Laravel's /sanctum/csrf-cookie
 * This gets the CSRF token from Laravel
 */
export async function GET(request: NextRequest) {
  try {
    const backendUrl = `${BACKEND_URL}/sanctum/csrf-cookie`;
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    
    console.log('[CSRF Cookie Proxy] Requesting CSRF token');

    // Get cookies from the request
    const cookieHeader = request.headers.get('cookie');

    // Forward the request to Laravel backend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(origin && { 'Origin': origin }),
        ...(referer && { 'Referer': referer }),
        ...(cookieHeader && { 'Cookie': cookieHeader }),
      },
      credentials: 'include',
    });

    console.log('[CSRF Cookie Proxy] Backend response:', response.status);

    // Forward every Set-Cookie header from Laravel to the browser.
    const setCookieHeaders = response.headers.getSetCookie();

    // Create Next.js response
    const nextResponse = new NextResponse(null, {
      status: 204, // Laravel returns 204 No Content
    });

    // Forward cookies to browser
    if (setCookieHeaders.length > 0) {
      for (const setCookieHeader of setCookieHeaders) {
        nextResponse.headers.append('Set-Cookie', setCookieHeader);
      }
      console.log('[CSRF Cookie Proxy] Forwarding Set-Cookie headers:', setCookieHeaders.length);
    }

    return nextResponse;
  } catch (error) {
    console.error('[CSRF Cookie Proxy Error]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to get CSRF token',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
