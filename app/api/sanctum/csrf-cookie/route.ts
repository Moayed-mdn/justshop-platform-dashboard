import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

/**
 * CSRF Cookie Proxy
 * 
 * Proxies /api/sanctum/csrf-cookie to Laravel's /sanctum/csrf-cookie
 * This gets the CSRF token from Laravel
 */
export async function GET(request: NextRequest) {
  try {
    const backendUrl = `${BACKEND_URL}/sanctum/csrf-cookie`;
    
    console.log('[CSRF Cookie Proxy] Requesting CSRF token');

    // Get cookies from the request
    const cookieHeader = request.headers.get('cookie');

    // Forward the request to Laravel backend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(cookieHeader && { 'Cookie': cookieHeader }),
      },
      credentials: 'include',
    });

    console.log('[CSRF Cookie Proxy] Backend response:', response.status);

    // Forward Set-Cookie headers from Laravel to browser
    const setCookieHeaders = response.headers.get('set-cookie');

    // Create Next.js response
    const nextResponse = new NextResponse(null, {
      status: 204, // Laravel returns 204 No Content
    });

    // Forward cookies to browser
    if (setCookieHeaders) {
      nextResponse.headers.set('Set-Cookie', setCookieHeaders);
      console.log('[CSRF Cookie Proxy] Forwarding Set-Cookie headers');
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
