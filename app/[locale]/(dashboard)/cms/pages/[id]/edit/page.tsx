'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { toast } from 'sonner';
import { cmsEndpoints, UpdatePagePayload } from '@/lib/api/endpoints/cms';
import type { Page } from '@/lib/types/cms';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageForm } from '@/components/cms/PageForm';

export default function EditPagePage() {
  const locale = useLocale();
  const t = useTranslations('common');
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string, 10);

  const [page, setPage] = React.useState<Page | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      try {
        const data = await cmsEndpoints.getPage(id);
        setPage(data);
      } catch (error: any) {
        console.error('Failed to fetch page:', error);
        toast.error('Failed to load page');
        router.push(`/${locale}/cms/pages`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPage();
    }
  }, [id, locale, router]);

  const handleSubmit = async (data: UpdatePagePayload, shouldPublish = false) => {
    setSaving(true);
    try {
      const updatedPage = await cmsEndpoints.updatePage(id, data);
      
      if (shouldPublish && updatedPage.status !== 'published') {
        await cmsEndpoints.publishPage(id);
      }

      toast.success('Page updated successfully!');
      router.push(`/${locale}/cms/pages/${id}`);
    } catch (error: any) {
      console.error('Failed to update page:', error);
      toast.error(error?.message || 'Failed to update page. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="text-muted-foreground">Loading page...</div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="p-8 text-center">
        <div className="text-muted-foreground">{t('pageNotFound')}</div>
        <Link href={`/${locale}/cms/pages`}>
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToPages')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/cms/pages/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Page</h1>
            <p className="text-muted-foreground">
              Update marketing page content and settings
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Page Details</CardTitle>
        </CardHeader>
        <CardContent>
          <PageForm
            initialData={page}
            onSubmit={handleSubmit}
            submitLabel={
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Page
              </>
            }
            isSubmitting={saving}
            mode="edit"
          />
        </CardContent>
      </Card>
    </div>
  );
}
