import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Get ALL cookies from the browser request and forward them
    const cookieHeader = request.headers.get('cookie') || '';
    
    console.log('[API /auth/me] Forwarding cookies, length:', cookieHeader.length);
    
    if (!cookieHeader) {
      return NextResponse.json(
        {
          success: false,
          message: 'No cookies found',
        },
        { status: 401 }
      );
    }
    
    // Forward ALL cookies to Laravel
    const response = await fetch(`${baseURL}/api/v1/platform/auth/me`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cookie': cookieHeader,
      },
    });
    
    console.log('[API /auth/me] Backend response:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('[API /auth/me] Error response:', errorText.substring(0, 200));
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication failed',
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    if (data.success && data.data) {
      console.log('[API /auth/me] Authenticated as:', data.data.user.email);
      return NextResponse.json({
        success: true,
        user: {
          name: data.data.user.name,
          email: data.data.user.email,
          avatar: data.data.user.avatar,
          role: data.data.session?.actor_type || 'user',
        },
        session: data.data.session,
      });
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid response',
      },
      { status: 401 }
    );
  } catch (error) {
    console.error('[API /auth/me] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Internal error',
      },
      { status: 500 }
    );
  }
}
