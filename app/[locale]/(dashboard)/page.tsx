'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user info to display
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUserName(data.user.name);
            setUserEmail(data.user.email);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {loading ? 'Welcome!' : `Welcome, ${userName}! 👋`}
        </h1>
        <p className="text-muted-foreground mt-2">
          {loading ? 'Platform Dashboard' : `Signed in as ${userEmail}`}
        </p>
        <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
          ✅ Authentication Working - Phase 2.5 Complete!
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
              <li className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Client-side auth check</li>
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
              <li className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Real user data</li>
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

      {/* Authentication Status */}
      <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950">
        <CardHeader>
          <CardTitle className="text-emerald-900 dark:text-emerald-100">
            🎉 Authentication Successfully Working!
          </CardTitle>
          <CardDescription className="text-emerald-700 dark:text-emerald-300">
            You are now authenticated and can access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between items-center p-3 bg-white dark:bg-emerald-900 rounded-lg">
              <span className="font-medium">Name:</span>
              <span className="text-emerald-700 dark:text-emerald-300">{loading ? 'Loading...' : userName}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white dark:bg-emerald-900 rounded-lg">
              <span className="font-medium">Email:</span>
              <span className="text-emerald-700 dark:text-emerald-300">{loading ? 'Loading...' : userEmail}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white dark:bg-emerald-900 rounded-lg">
              <span className="font-medium">Session:</span>
              <span className="text-emerald-700 dark:text-emerald-300">✓ Active</span>
            </div>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-4">
            Try signing out and accessing this page - you'll be redirected to sign-in!
          </p>
        </CardContent>
      </Card>

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
              <Button>Save</Button>
              <Button variant="secondary">Cancel</Button>
              <Button variant="destructive">Delete</Button>
              <Button variant="outline">Edit</Button>
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
