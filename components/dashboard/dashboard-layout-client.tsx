'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { useUIStore } from '@/lib/stores/ui-store';
import { cn } from '@/lib/utils';

interface User {
  name: string;
  email: string;
  avatar?: string | null;
  role: string;
}

interface DashboardLayoutClientProps {
  children: React.ReactNode;
}

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const { sidebarCollapsed } = useUIStore();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication on mount
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        
        if (!response.ok) {
          // Not authenticated - redirect to sign-in
          const locale = pathname.split('/')[1] || 'en';
          router.push(`/${locale}/sign-in`);
          return;
        }
        
        const data = await response.json();
        
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          // Not authenticated
          const locale = pathname.split('/')[1] || 'en';
          router.push(`/${locale}/sign-in`);
        }
      } catch (error) {
        console.error('[DashboardLayout] Auth check failed:', error);
        const locale = pathname.split('/')[1] || 'en';
        router.push(`/${locale}/sign-in`);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <Header user={user} />
      
      <main
        className={cn(
          'transition-all duration-300 pt-16',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
