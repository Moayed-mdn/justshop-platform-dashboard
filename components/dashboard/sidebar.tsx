'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  FileText, 
  Flag, 
  ScrollText,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Receipt
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/stores/ui-store';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const t = useTranslations('navigation');
  const locale = useLocale();
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  const navigation = [
    { name: t('home'), href: `/${locale}`, icon: LayoutDashboard },
    { name: t('users'), href: `/${locale}/users`, icon: Users },
    { name: t('stores'), href: `/${locale}/stores`, icon: Store },
    { name: t('billing'), href: `/${locale}/billing/plans`, icon: CreditCard },
    { name: t('subscriptions'), href: `/${locale}/billing/subscriptions`, icon: Receipt },
    { name: t('cms'), href: `/${locale}/cms/pages`, icon: FileText },
    { name: t('audit'), href: `/${locale}/audit`, icon: ScrollText },
    { name: t('features'), href: `/${locale}/features`, icon: Flag },
  ];

  return (
    <aside
      className={cn(
        'fixed top-0 start-0 z-40 h-screen transition-all duration-300 bg-card [box-shadow:var(--shadow-lg)]',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4">
        {!sidebarCollapsed && (
          <span className="text-lg font-semibold tracking-tight">Platform</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn('h-8 w-8', sidebarCollapsed && 'mx-auto')}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 p-2 overflow-y-auto">
        {navigation.map((item) => {
          // Fix: Exact match for home, startsWith for others
          const isActive = item.href === `/${locale}` 
            ? pathname === item.href 
            : pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-all',
                'hover:bg-accent/50 hover:text-accent-foreground',
                isActive
                  ? 'bg-accent text-accent-foreground before:absolute before:start-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-1 before:rounded-e-full before:bg-primary'
                  : 'text-muted-foreground',
                sidebarCollapsed && 'justify-center'
              )}
              title={sidebarCollapsed ? item.name : undefined}
            >
              <Icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-colors",
                isActive && "text-primary"
              )} />
              {!sidebarCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
