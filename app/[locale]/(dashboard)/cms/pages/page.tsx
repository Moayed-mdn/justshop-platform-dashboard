'use client';

import * as React from 'react';
import Link from 'next/link';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { cmsEndpoints } from '@/lib/api/endpoints/cms';
import type { ContentStatus, Page, MarketingPageType, LocalizedString } from '@/lib/types/cms';
import type { PaginatedResponse } from '@/lib/types/user';
import { MARKETING_PAGE_TYPES } from '@/lib/types/cms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';

function resolveLocalizedString(
  value: LocalizedString | null | undefined,
  locale: string,
  fallback = ''
): string {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value[locale] ?? value['en'] ?? Object.values(value)[0] ?? fallback;
}

export default function PagesListPage() {
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<ContentStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = React.useState<MarketingPageType | 'all'>('all');
  const [currentPage, setCurrentPage] = React.useState(1);
  const filters = React.useMemo(
    () => ({
      page: currentPage,
      per_page: 20,
      ...(searchQuery ? { search: searchQuery } : {}),
      ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
      ...(typeFilter !== 'all' ? { type: typeFilter } : {}),
    }),
    [currentPage, searchQuery, statusFilter, typeFilter]
  );
  const pagesQueryKey = React.useMemo(() => ['cms-pages', filters] as const, [filters]);
  const { data, isLoading, isFetching } = useQuery({
    queryKey: pagesQueryKey,
    queryFn: () => cmsEndpoints.getPages(filters),
    placeholderData: keepPreviousData,
  });
  const pages = data?.data ?? [];
  const totalPages = data?.meta?.last_page ?? 1;

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await cmsEndpoints.deletePage(id);
      queryClient.setQueryData<PaginatedResponse<Page>>(pagesQueryKey, (current) => {
        if (!current) return current;
        return {
          data: current.data.filter((p) => p.id !== id),
          meta: {
            ...current.meta,
            total: Math.max(0, current.meta.total - 1),
          },
        };
      });
      toast.success('Page deleted successfully');
    } catch (error) {
      console.error('Failed to delete page:', error);
      toast.error('Failed to delete page. Please try again.');
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

  const getTypeInfo = (type: MarketingPageType | null | undefined) => {
    if (!type) return null;
    return MARKETING_PAGE_TYPES.find((t) => t.value === type);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing Pages</h1>
          <p className="text-muted-foreground">
            Manage platform marketing pages with type categorization
          </p>
        </div>
        <Link href={`/${locale}/cms/pages/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Page
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search pages by title or slug..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Type Filter */}
            <Select
              value={typeFilter}
              onValueChange={(value) => {
                setTypeFilter(value as MarketingPageType | 'all');
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {MARKETING_PAGE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as ContentStatus | 'all');
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pages Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Pages ({pages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && pages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading pages...
            </div>
          ) : pages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pages found</p>
              <p className="text-sm mt-2">
                {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first marketing page'}
              </p>
            </div>
          ) : (
            <>
              {isFetching && (
                <div className="mb-3 text-sm text-muted-foreground">Refreshing pages...</div>
              )}
              <div className="rounded-[var(--radius-md)] overflow-hidden [box-shadow:var(--shadow-sm)]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-end">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pages.map((page) => {
                      const title = resolveLocalizedString(page.title, locale, 'Untitled');
                      const slug = resolveLocalizedString(page.slug, locale, '-');
                      const typeInfo = getTypeInfo(page.type);

                      return (
                        <TableRow key={page.id}>
                          <TableCell className="font-medium">{title}</TableCell>
                          <TableCell>
                            {typeInfo ? (
                              <Badge variant="secondary" className="font-normal">
                                {typeInfo.label}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            /{slug}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(page.status)}>
                              {page.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {page.template ? (
                              <Badge variant="outline">{page.template}</Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(page.updated_at), {
                              addSuffix: true,
                            })}
                          </TableCell>
                          <TableCell className="text-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="action-icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/${locale}/cms/pages/${page.id}`)
                                  }
                                >
                                  <Eye className="me-2 h-4 w-4" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/${locale}/cms/pages/${page.id}/edit`)
                                  }
                                >
                                  <Edit className="me-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(page.id, title)}
                                >
                                  <Trash2 className="me-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
