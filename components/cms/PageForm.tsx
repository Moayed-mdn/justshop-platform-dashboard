'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useLocale } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MARKETING_PAGE_TYPES, type Page, type LocalizedString } from '@/lib/types/cms';
import type { CreatePagePayload, UpdatePagePayload } from '@/lib/api/endpoints/cms';
import { Globe, FileText, Settings, Send } from 'lucide-react';

interface PageFormProps {
  initialData?: Page | null;
  onSubmit: (data: CreatePagePayload | UpdatePagePayload, shouldPublish?: boolean) => Promise<void>;
  submitLabel: React.ReactNode;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
}

interface FormData {
  type: string;
  title_en: string;
  title_ar: string;
  slug_en: string;
  slug_ar: string;
  excerpt_en: string;
  excerpt_ar: string;
  content_en: string;
  content_ar: string;
  status: 'draft' | 'scheduled' | 'published';
  published_at: string;
  template: string;
  sort_order: number;
  seo_meta_title_en: string;
  seo_meta_title_ar: string;
  seo_meta_description_en: string;
  seo_meta_description_ar: string;
}

function resolveLocalizedString(
  value: LocalizedString | null | undefined,
  locale: string,
  fallback = ''
): string {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value[locale] ?? fallback;
}

export function PageForm({
  initialData,
  onSubmit,
  submitLabel,
  isSubmitting,
  mode,
}: PageFormProps) {
  const locale = useLocale();
  const [activeTab, setActiveTab] = React.useState('en');

  // Helper to extract content as string for editing
  const getContentString = (content: any, locale: string): string => {
    if (!content) return '';
    if (typeof content === 'string') return content;
    
    // If content has the locale key, return it
    if (content[locale]) {
      const localeContent = content[locale];
      if (typeof localeContent === 'string') return localeContent;
      return JSON.stringify(localeContent, null, 2);
    }
    
    // Otherwise, it's structured content (same for all locales)
    return JSON.stringify(content, null, 2);
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      type: initialData?.type || '',
      title_en: resolveLocalizedString(initialData?.title, 'en', ''),
      title_ar: resolveLocalizedString(initialData?.title, 'ar', ''),
      slug_en: resolveLocalizedString(initialData?.slug, 'en', ''),
      slug_ar: resolveLocalizedString(initialData?.slug, 'ar', ''),
      excerpt_en: resolveLocalizedString(initialData?.excerpt, 'en', ''),
      excerpt_ar: resolveLocalizedString(initialData?.excerpt, 'ar', ''),
      content_en: getContentString(initialData?.content, 'en'),
      content_ar: getContentString(initialData?.content, 'ar'),
      status: initialData?.status || 'draft',
      published_at: initialData?.published_at || '',
      template: initialData?.template || '',
      sort_order: initialData?.sort_order || 0,
      seo_meta_title_en: (initialData?.seo as any)?.meta_title?.en || '',
      seo_meta_title_ar: (initialData?.seo as any)?.meta_title?.ar || '',
      seo_meta_description_en: (initialData?.seo as any)?.meta_description?.en || '',
      seo_meta_description_ar: (initialData?.seo as any)?.meta_description?.ar || '',
    },
  });

  const statusValue = watch('status');
  const typeValue = watch('type');

  // Auto-generate slug from title
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (locale: 'en' | 'ar', value: string) => {
    const slugField = `slug_${locale}` as keyof FormData;
    const currentSlug = watch(slugField) as string;
    
    // Only auto-generate if slug is empty or matches previous title
    if (!currentSlug || mode === 'create') {
      setValue(slugField, generateSlug(value));
    }
  };

  const processFormData = (data: FormData): CreatePagePayload | UpdatePagePayload => {
    // Helper to parse content - try JSON first, fallback to string
    const parseContent = (contentString: string): any => {
      if (!contentString) return '';
      
      // Try to parse as JSON
      try {
        return JSON.parse(contentString);
      } catch {
        // If it fails, return as string (it's probably HTML)
        return contentString;
      }
    };

    const payload: CreatePagePayload | UpdatePagePayload = {
      type: data.type || undefined,
      title: {
        en: data.title_en,
        ar: data.title_ar,
      },
      slug: {
        en: data.slug_en,
        ar: data.slug_ar,
      },
      excerpt: {
        en: data.excerpt_en || '',
        ar: data.excerpt_ar || '',
      },
      content: parseContent(data.content_en) || parseContent(data.content_ar),
      status: data.status,
      template: data.template || undefined,
      sort_order: data.sort_order,
    };

    // Add published_at if status is published or scheduled
    if (data.status === 'published' || data.status === 'scheduled') {
      payload.published_at = data.published_at || new Date().toISOString();
    }

    // Build SEO object if any SEO fields are filled
    if (
      data.seo_meta_title_en ||
      data.seo_meta_title_ar ||
      data.seo_meta_description_en ||
      data.seo_meta_description_ar
    ) {
      payload.seo = {
        meta_title: {
          en: data.seo_meta_title_en || '',
          ar: data.seo_meta_title_ar || '',
        },
        meta_description: {
          en: data.seo_meta_description_en || '',
          ar: data.seo_meta_description_ar || '',
        },
      };
    }

    return payload;
  };

  const handleFormSubmit = async (data: FormData) => {
    const payload = processFormData(data);
    await onSubmit(payload, false);
  };

  const handleSaveAndPublish = async (data: FormData) => {
    const payload = processFormData(data);
    payload.status = 'published';
    await onSubmit(payload, true);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Language Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="en" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                English
              </TabsTrigger>
              <TabsTrigger value="ar" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                العربية
              </TabsTrigger>
            </TabsList>

            {/* English Content */}
            <TabsContent value="en" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title_en">
                  Title (English) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title_en"
                  {...register('title_en', { required: 'English title is required' })}
                  onChange={(e) => {
                    register('title_en').onChange(e);
                    handleTitleChange('en', e.target.value);
                  }}
                  placeholder="Enter page title in English"
                />
                {errors.title_en && (
                  <p className="text-sm text-destructive">{errors.title_en.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug_en">
                  Slug (English) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="slug_en"
                  {...register('slug_en', { required: 'English slug is required' })}
                  placeholder="page-url-slug"
                />
                {errors.slug_en && (
                  <p className="text-sm text-destructive">{errors.slug_en.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt_en">Excerpt (English)</Label>
                <Textarea
                  id="excerpt_en"
                  {...register('excerpt_en')}
                  placeholder="Brief description of the page"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content_en">
                  Content (English) <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="content_en"
                  {...register('content_en', { required: 'English content is required' })}
                  placeholder="Page content (HTML or JSON structure)"
                  rows={12}
                  className="font-mono text-sm"
                />
                {errors.content_en && (
                  <p className="text-sm text-destructive">{errors.content_en.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Supports HTML or structured JSON (e.g., &#123;"hero": &#123;...&#125;, "plans": [...]&#125;)
                </p>
              </div>
            </TabsContent>

            {/* Arabic Content */}
            <TabsContent value="ar" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title_ar">
                  العنوان (عربي) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title_ar"
                  {...register('title_ar', { required: 'Arabic title is required' })}
                  onChange={(e) => {
                    register('title_ar').onChange(e);
                    handleTitleChange('ar', e.target.value);
                  }}
                  placeholder="أدخل عنوان الصفحة بالعربية"
                  dir="rtl"
                />
                {errors.title_ar && (
                  <p className="text-sm text-destructive">{errors.title_ar.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug_ar">
                  الرابط (عربي) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="slug_ar"
                  {...register('slug_ar', { required: 'Arabic slug is required' })}
                  placeholder="رابط-الصفحة"
                  dir="rtl"
                />
                {errors.slug_ar && (
                  <p className="text-sm text-destructive">{errors.slug_ar.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt_ar">المقتطف (عربي)</Label>
                <Textarea
                  id="excerpt_ar"
                  {...register('excerpt_ar')}
                  placeholder="وصف مختصر للصفحة"
                  rows={3}
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content_ar">
                  المحتوى (عربي) <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="content_ar"
                  {...register('content_ar', { required: 'Arabic content is required' })}
                  placeholder="محتوى الصفحة (HTML أو بنية JSON)"
                  rows={12}
                  className="font-mono text-sm"
                  dir="rtl"
                />
                {errors.content_ar && (
                  <p className="text-sm text-destructive">{errors.content_ar.message}</p>
                )}
                <p className="text-xs text-muted-foreground" dir="rtl">
                  يدعم HTML أو JSON منظم
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* SEO Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4" />
                SEO Settings (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="en">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="en">English SEO</TabsTrigger>
                  <TabsTrigger value="ar">Arabic SEO</TabsTrigger>
                </TabsList>

                <TabsContent value="en" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="seo_meta_title_en">Meta Title</Label>
                    <Input
                      id="seo_meta_title_en"
                      {...register('seo_meta_title_en')}
                      placeholder="SEO optimized title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seo_meta_description_en">Meta Description</Label>
                    <Textarea
                      id="seo_meta_description_en"
                      {...register('seo_meta_description_en')}
                      placeholder="SEO meta description"
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="ar" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="seo_meta_title_ar">عنوان SEO</Label>
                    <Input
                      id="seo_meta_title_ar"
                      {...register('seo_meta_title_ar')}
                      placeholder="العنوان المحسن لمحركات البحث"
                      dir="rtl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seo_meta_description_ar">وصف SEO</Label>
                    <Textarea
                      id="seo_meta_description_ar"
                      {...register('seo_meta_description_ar')}
                      placeholder="الوصف التعريفي لمحركات البحث"
                      rows={3}
                      dir="rtl"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">
                  Status <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={statusValue}
                  onValueChange={(value) =>
                    setValue('status', value as 'draft' | 'scheduled' | 'published')
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(statusValue === 'scheduled' || statusValue === 'published') && (
                <div className="space-y-2">
                  <Label htmlFor="published_at">Publish Date</Label>
                  <Input
                    id="published_at"
                    type="datetime-local"
                    {...register('published_at')}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Page Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Page Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Page Type</Label>
                <Select value={typeValue} onValueChange={(value) => setValue('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {MARKETING_PAGE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {typeValue && (
                  <p className="text-xs text-muted-foreground">
                    {MARKETING_PAGE_TYPES.find((t) => t.value === typeValue)?.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="template">Template</Label>
                <Select
                  value={watch('template') || ''}
                  onValueChange={(value) => setValue('template', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Default</SelectItem>
                    <SelectItem value="home">Home Template</SelectItem>
                    <SelectItem value="pricing">Pricing Template</SelectItem>
                    <SelectItem value="features">Features Template</SelectItem>
                    <SelectItem value="about">About Template</SelectItem>
                    <SelectItem value="generic">Generic Template</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose a template for custom page layouts
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  {...register('sort_order', { valueAsNumber: true })}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">
                  Used for ordering pages in navigation
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {submitLabel}
            </Button>

            {statusValue !== 'published' && (
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={handleSubmit(handleSaveAndPublish)}
                disabled={isSubmitting}
              >
                <Send className="mr-2 h-4 w-4" />
                Save & Publish
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
