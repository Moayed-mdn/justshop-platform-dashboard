import { redirect } from 'next/navigation';
import { DashboardLayoutClient } from '@/components/dashboard/dashboard-layout-client';
import { getCurrentUserAction } from '@/lib/actions/auth-actions';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const result = await getCurrentUserAction();

  if (!result.authenticated || !result.user) {
    redirect(`/${locale}/sign-in`);
  }

  return (
    <DashboardLayoutClient
      user={{
        name: result.user.name,
        email: result.user.email,
        avatar: result.user.avatar ?? null,
        role: result.user.role || result.session?.actor_type || 'user',
      }}
    >
      {children}
    </DashboardLayoutClient>
  );
}
