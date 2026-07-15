import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const t = useTranslations('common');
  const tDashboard = useTranslations('dashboard');

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {tDashboard('welcome')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {tDashboard('title')} - Phase 2 Complete ✅
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>✅ Authentication</CardTitle>
            <CardDescription>
              Sign-in system implemented
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✓ API Client configured</li>
              <li>✓ Sign-in page with validation</li>
              <li>✓ Session management</li>
              <li>✓ Protected routes</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>✅ Dashboard Shell</CardTitle>
            <CardDescription>
              Complete layout with navigation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✓ Collapsible sidebar</li>
              <li>✓ Header with user menu</li>
              <li>✓ Sign-out functionality</li>
              <li>✓ Responsive design</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🌐 Internationalization</CardTitle>
            <CardDescription>
              Full i18n support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✓ English & Arabic</li>
              <li>✓ RTL layout</li>
              <li>✓ Language switcher</li>
              <li>✓ Bilingual forms</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🎨 UI Features</CardTitle>
            <CardDescription>
              Complete theming system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✓ Dark/Light modes</li>
              <li>✓ Theme persistence</li>
              <li>✓ shadcn/ui components</li>
              <li>✓ Toast notifications</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Test Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 Test Features</CardTitle>
          <CardDescription>
            All Phase 1 & 2 features are working
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Navigation:</p>
            <p className="text-sm text-muted-foreground">
              Try collapsing the sidebar, switching languages, and toggling dark mode.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Sample Buttons:</p>
            <div className="flex flex-wrap gap-2">
              <Button>{t('save')}</Button>
              <Button variant="secondary">{t('cancel')}</Button>
              <Button variant="destructive">{t('delete')}</Button>
              <Button variant="outline">{t('edit')}</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Next: Phase 3</CardTitle>
          <CardDescription>
            Dashboard Home & Analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>• KPI cards with platform statistics</li>
            <li>• Analytics charts (user growth, revenue, etc.)</li>
            <li>• Date range filters</li>
            <li>• Real-time data from backend</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
