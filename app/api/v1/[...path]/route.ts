import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

/**
 * API Proxy Route
 * 
 * Proxies all /api/v1/* requests to the Laravel backend
 * This allows cookies to be sent with same-origin requests
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'PUT');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'PATCH');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'DELETE');
}

async function proxyRequest(
  request: NextRequest,
  path: string[],
  method: string
) {
  try {
    // Construct the backend URL
    const pathString = path.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const backendUrl = `${BACKEND_URL}/api/v1/${pathString}${searchParams ? `?${searchParams}` : ''}`;

    console.log(`[API Proxy ${method}] ${backendUrl}`);

    // Get cookies from the request
    const cookieHeader = request.headers.get('cookie');
    console.log(`[API Proxy] Forwarding cookies, length: ${cookieHeader?.length || 0}`);

    // Get request body for POST/PUT/PATCH
    let body = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const text = await request.text();
      body = text || undefined;
    }

    // Forward the request to Laravel backend
    const response = await fetch(backendUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(cookieHeader && { 'Cookie': cookieHeader }),
        // Forward XSRF token if present
        ...(request.headers.get('x-xsrf-token') && {
          'X-XSRF-TOKEN': request.headers.get('x-xsrf-token')!
        }),
      },
      body,
      credentials: 'include',
    });

    console.log(`[API Proxy] Backend response: ${response.status}`);

    // Get response body
    const responseData = await response.text();

    // Forward Set-Cookie headers from Laravel to browser
    const setCookieHeaders = response.headers.get('set-cookie');

    // Create Next.js response
    const nextResponse = new NextResponse(responseData, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Forward cookies to browser
    if (setCookieHeaders) {
      nextResponse.headers.set('Set-Cookie', setCookieHeaders);
    }

    return nextResponse;
  } catch (error) {
    console.error('[API Proxy Error]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Proxy error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
