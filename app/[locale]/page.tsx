import { useTranslations } from 'next-intl';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const t = useTranslations('common');
  const tDashboard = useTranslations('dashboard');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Temporary Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{tDashboard('title')}</h1>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">
              {t('welcome')} 👋
            </h2>
            <p className="text-xl text-muted-foreground">
              {tDashboard('title')}
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>✅ Project Initialized</CardTitle>
                <CardDescription>
                  Next.js 15 with TypeScript and Tailwind CSS
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Next.js 15 + React 19</li>
                  <li>✓ TypeScript (strict mode)</li>
                  <li>✓ Tailwind CSS v4</li>
                  <li>✓ shadcn/ui components</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🌐 Internationalization</CardTitle>
                <CardDescription>
                  English and Arabic support with RTL
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ next-intl configured</li>
                  <li>✓ English & Arabic translations</li>
                  <li>✓ RTL layout support</li>
                  <li>✓ Language switcher</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🎨 Theme Support</CardTitle>
                <CardDescription>
                  Dark mode and light mode
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Dark/Light/System themes</li>
                  <li>✓ Theme toggle component</li>
                  <li>✓ CSS variables for theming</li>
                  <li>✓ Persistent theme storage</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📦 Dependencies</CardTitle>
                <CardDescription>
                  All core libraries installed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ TanStack Query & Table</li>
                  <li>✓ React Hook Form + Zod</li>
                  <li>✓ Zustand for state</li>
                  <li>✓ date-fns & sonner</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Test Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>🧪 Test Features</CardTitle>
              <CardDescription>
                Try the theme and language switchers above
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Sample Buttons:</p>
                <div className="flex flex-wrap gap-2">
                  <Button>{t('save')}</Button>
                  <Button variant="secondary">{t('cancel')}</Button>
                  <Button variant="destructive">{t('delete')}</Button>
                  <Button variant="outline">{t('edit')}</Button>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Current Language Direction:</p>
                <p className="text-sm text-muted-foreground">
                  This text should align based on the selected language (LTR for English, RTL for Arabic)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>Phase 1: Project Setup & Foundation - ✅ Complete</p>
      </footer>
    </div>
  );
}
