import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SignInForm } from '@/components/forms/sign-in-form';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { ThemeToggle } from '@/components/shared/theme-toggle';

export default async function SignInPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const requestHeaders = await headers();
  
  // Check if user has session cookie
  const sessionCookie = cookieStore.get('ecommerce_session');
  
  // If session cookie exists, check if it's valid by calling backend
  if (sessionCookie) {
    try {
      const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host');
      const protocol = requestHeaders.get('x-forwarded-proto')
        || (host?.startsWith('localhost') || host?.startsWith('127.0.0.1') ? 'http' : 'https');

      if (!host) {
        throw new Error('Missing host header');
      }

      const response = await fetch(new URL('/api/auth/me', `${protocol}://${host}`), {
        headers: {
          Cookie: cookieStore.toString(),
        },
        cache: 'no-store',
      });

      if (response.ok) {
        // User is authenticated, redirect to dashboard
        redirect(`/${locale}`);
      }
    } catch (error) {
      // If check fails, let them sign in
      console.log('[SignInPage] Auth check failed:', error);
    }
  }

  return (
    <>
      {/* Theme and Language Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      {/* Sign-in Card */}
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Platform Dashboard
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm />
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Platform Dashboard v0.1.0
      </p>
    </>
  );
}
