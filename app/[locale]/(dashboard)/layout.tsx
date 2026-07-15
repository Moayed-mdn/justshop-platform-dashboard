'use client';

import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { useUIStore } from '@/lib/stores/ui-store';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarCollapsed } = useUIStore();

  // Mock user data - will be replaced with real data in Phase 3
  const user = {
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'super_admin',
  };

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
