'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('common');

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold">⚠️</h1>
        <h2 className="text-2xl font-semibold">{t('error')}</h2>
        <p className="text-muted-foreground">
          Something went wrong. Please try again.
        </p>
        <Button onClick={() => reset()}>{t('tryAgain')}</Button>
      </div>
    </div>
  );
}
