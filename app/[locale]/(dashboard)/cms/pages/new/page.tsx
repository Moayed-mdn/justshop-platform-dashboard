'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { cmsEndpoints, CreatePagePayload } from '@/lib/api/endpoints/cms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageForm } from '@/components/cms/PageForm';

export default function CreatePagePage() {
  const locale = useLocale();
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);

  const handleSubmit = async (data: CreatePagePayload, shouldPublish = false) => {
    setSaving(true);
    try {
      const newPage = await cmsEndpoints.createPage(data);
      
      if (shouldPublish && newPage.status !== 'published') {
        await cmsEndpoints.publishPage(newPage.id);
      }

      toast.success('Page created successfully!');
      router.push(`/${locale}/cms/pages`);
    } catch (error: any) {
      console.error('Failed to create page:', error);
      toast.error(error?.message || 'Failed to create page. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/cms/pages`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Create Marketing Page</h1>
            <p className="text-muted-foreground">
              Add a new platform marketing page
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
            onSubmit={handleSubmit}
            submitLabel={
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Page
              </>
            }
            isSubmitting={saving}
            mode="create"
          />
        </CardContent>
      </Card>
    </div>
  );
}
