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
  ChevronLeft,
  ChevronRight
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
    { name: t('cms'), href: `/${locale}/cms`, icon: FileText },
    { name: t('audit'), href: `/${locale}/audit`, icon: ScrollText },
    { name: t('features'), href: `/${locale}/features`, icon: Flag },
  ];

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-40 h-screen transition-all duration-300 border-r bg-card',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!sidebarCollapsed && (
          <span className="text-lg font-semibold">Platform</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn('h-8 w-8', sidebarCollapsed && 'mx-auto')}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isActive
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground',
                sidebarCollapsed && 'justify-center'
              )}
              title={sidebarCollapsed ? item.name : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
