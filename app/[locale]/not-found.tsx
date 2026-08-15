import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const t = useTranslations('common');

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">{t('pageNotFoundTitle')}</h2>
        <p className="text-muted-foreground">
          {t('pageNotFoundDescription')}
        </p>
        <Button asChild>
          <Link href="/">{t('dashboard')}</Link>
        </Button>
      </div>
    </div>
  );
}
