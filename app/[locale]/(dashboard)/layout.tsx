import { DashboardLayoutClient } from '@/components/dashboard/dashboard-layout-client';

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Note: Auth check moved to client-side to properly handle cookies
  // See DashboardLayoutClient component
  
  return (
    <DashboardLayoutClient>
      {children}
    </DashboardLayoutClient>
  );
}
