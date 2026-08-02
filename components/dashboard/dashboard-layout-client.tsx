'use client';

import { createContext, useContext } from 'react';
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
  user: User;
}

const DashboardUserContext = createContext<User | null>(null);

export function useDashboardUser() {
  return useContext(DashboardUserContext);
}

export function DashboardLayoutClient({
  children,
  user,
}: DashboardLayoutClientProps) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <DashboardUserContext.Provider value={user}>
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
    </DashboardUserContext.Provider>
  );
}
