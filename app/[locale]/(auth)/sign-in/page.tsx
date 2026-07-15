import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SignInForm } from '@/components/forms/sign-in-form';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { ThemeToggle } from '@/components/shared/theme-toggle';

export default function SignInPage() {
  const t = useTranslations('auth');
  const tDashboard = useTranslations('dashboard');

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
            {tDashboard('title')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('signInToAccount')}
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
