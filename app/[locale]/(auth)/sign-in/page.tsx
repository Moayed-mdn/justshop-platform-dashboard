import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
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
  
  // Check if user has session cookie
  const sessionCookie = cookieStore.get('ecommerce_session');
  
  // If session cookie exists, check if it's valid by calling backend
  if (sessionCookie) {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const allCookiesHeader = cookieStore.getAll()
        .map(c => `${c.name}=${c.value}`)
        .join('; ');
      
      const response = await fetch(`${baseURL}/api/v1/platform/auth/me`, {
        headers: {
          'Accept': 'application/json',
          'Cookie': allCookiesHeader,
        },
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
