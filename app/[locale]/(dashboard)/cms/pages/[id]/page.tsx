'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  FileText,
  Calendar,
  Tag,
  Globe,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { cmsEndpoints } from '@/lib/api/endpoints/cms';
import type { Page, LocalizedString } from '@/lib/types/cms';
import { MARKETING_PAGE_TYPES } from '@/lib/types/cms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { format } from 'date-fns';

function resolveLocalizedString(
  value: LocalizedString | null | undefined,
  locale: string,
  fallback = ''
): string {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value[locale] ?? value['en'] ?? Object.values(value)[0] ?? fallback;
}

export default function PageDetailPage() {
  const locale = useLocale();
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string, 10);

  const [page, setPage] = React.useState<Page | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      try {
        const data = await cmsEndpoints.getPage(id);
        console.log('Page data received:', data);
        console.log('Page content:', data.content);
        console.log('Page content type:', typeof data.content);
        setPage(data);
      } catch (error) {
        console.error('Failed to fetch page:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPage();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!page) return;
    
    const title = resolveLocalizedString(page.title, locale, 'Untitled');
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await cmsEndpoints.deletePage(page.id);
      toast.success('Page deleted successfully');
      router.push(`/${locale}/cms/pages`);
    } catch (error) {
      console.error('Failed to delete page:', error);
      toast.error('Failed to delete page. Please try again.');
    }
  };

  const handlePublish = async () => {
    if (!page) return;

    try {
      const updatedPage = await cmsEndpoints.publishPage(page.id);
      setPage(updatedPage);
      toast.success('Page published successfully!');
    } catch (error) {
      console.error('Failed to publish page:', error);
      toast.error('Failed to publish page. Please try again.');
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'scheduled':
        return 'outline';
      default:
        return 'secondary';
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
        <div className="text-muted-foreground">Page not found</div>
        <Link href={`/${locale}/cms/pages`}>
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pages
          </Button>
        </Link>
      </div>
    );
  }

  const title = resolveLocalizedString(page.title, locale, 'Untitled');
  const slug = resolveLocalizedString(page.slug, locale, '-');
  const excerpt = resolveLocalizedString(page.excerpt, locale, '');
  const content = resolveLocalizedString(page.content, locale, '');
  const typeInfo = page.type
    ? MARKETING_PAGE_TYPES.find((t) => t.value === page.type)
    : null;

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
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{title}</h1>
              <Badge variant={getStatusVariant(page.status)}>{page.status}</Badge>
              {typeInfo && (
                <Badge variant="secondary">{typeInfo.label}</Badge>
              )}
            </div>
            <p className="text-muted-foreground">/{slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {page.status !== 'published' && (
            <Button onClick={handlePublish}>
              <Send className="mr-2 h-4 w-4" />
              Publish
            </Button>
          )}
          <Link href={`/${locale}/cms/pages/${page.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {excerpt && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Excerpt
                  </h3>
                  <p className="text-sm">{excerpt}</p>
                </div>
              )}

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Content
                </h3>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-xs overflow-auto whitespace-pre-wrap">
                    {typeof page.content === 'string' 
                      ? page.content 
                      : JSON.stringify(page.content, null, 2)}
                  </pre>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Structured JSON content for rendering
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SEO Information */}
          {page.seo && Object.keys(page.seo).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  SEO Metadata
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                  {JSON.stringify(page.seo, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Meta Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Page Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {/* Type */}
              {typeInfo && (
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Tag className="h-4 w-4" />
                    <span>Type</span>
                  </div>
                  <div className="font-medium">
                    {typeInfo.label}
                    <p className="text-xs text-muted-foreground mt-1">
                      {typeInfo.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Template */}
              {page.template && (
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <FileText className="h-4 w-4" />
                    <span>Template</span>
                  </div>
                  <Badge variant="outline">{page.template}</Badge>
                </div>
              )}

              {/* Sort Order */}
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <span>Sort Order</span>
                </div>
                <div className="font-medium">{page.sort_order}</div>
              </div>

              <Separator />

              {/* Published Date */}
              {page.published_at && (
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    <span>Published</span>
                  </div>
                  <div className="font-medium">
                    {format(new Date(page.published_at), 'PPP')}
                  </div>
                </div>
              )}

              {/* Created */}
              <div>
                <div className="text-muted-foreground mb-1">Created</div>
                <div className="font-medium">
                  {formatDistanceToNow(new Date(page.created_at), {
                    addSuffix: true,
                  })}
                </div>
                {page.creator && (
                  <div className="text-xs text-muted-foreground mt-1">
                    by {page.creator.name}
                  </div>
                )}
              </div>

              {/* Updated */}
              <div>
                <div className="text-muted-foreground mb-1">Last Updated</div>
                <div className="font-medium">
                  {formatDistanceToNow(new Date(page.updated_at), {
                    addSuffix: true,
                  })}
                </div>
                {page.updater && (
                  <div className="text-xs text-muted-foreground mt-1">
                    by {page.updater.name}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* All Translations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Available Translations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {typeof page.title === 'object' &&
                  Object.keys(page.title).map((lang) => (
                    <div key={lang} className="flex items-center justify-between">
                      <span className="font-medium uppercase">{lang}</span>
                      <Badge variant="outline">
                        {resolveLocalizedString(page.slug, lang, '-')}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
