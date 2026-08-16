'use client';

import * as React from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Plus, Trash2 } from 'lucide-react';
import { featureFlagsEndpoints } from '@/lib/api/endpoints/feature-flags';
import type { FeatureFlag, FeatureFlagFilters } from '@/lib/types/feature-flag';
import type { PaginatedResponse } from '@/lib/types/user';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';

const ALL_TARGETS = '__all_targets__';

export default function FeatureFlagsPage() {
  const queryClient = useQueryClient();
  const t = useTranslations('features');
  const [filters, setFilters] = React.useState<FeatureFlagFilters>({
    page: 1,
    per_page: 20,
  });
  const flagsQueryKey = React.useMemo(() => ['feature-flags', filters] as const, [filters]);
  const { data, isLoading, isFetching } = useQuery({
    queryKey: flagsQueryKey,
    queryFn: () => featureFlagsEndpoints.getFeatureFlags(filters),
    placeholderData: keepPreviousData,
  });
  const flags = data?.data ?? [];
  const meta = data?.meta ?? {
    current_page: 1,
    total: 0,
    per_page: filters.per_page ?? 20,
    last_page: 1,
  };

  // Handle search
  const handleSearch = React.useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  // Handle filter change
  const handleFilterChange = (
    key: keyof FeatureFlagFilters,
    value: FeatureFlagFilters[keyof FeatureFlagFilters]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle sort
  const handleSort = () => {
    // Sorting handled by API (currently just alphabetical)
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Handle toggle
  const handleToggle = async (flagName: string, enabled: boolean) => {
    try {
      const updatedFlag = await featureFlagsEndpoints.toggleFeatureFlag(flagName, enabled);
      queryClient.setQueryData<PaginatedResponse<FeatureFlag>>(flagsQueryKey, (current) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.map((f) =>
            f.name === flagName ? { ...f, ...updatedFlag } : f
          ),
        };
      });
    } catch (error) {
      console.error('Failed to toggle feature flag:', error);
    }
  };

  // Handle delete
  const handleDelete = async (flagName: string) => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      await featureFlagsEndpoints.deleteFeatureFlag(flagName);
      queryClient.setQueryData<PaginatedResponse<FeatureFlag>>(flagsQueryKey, (current) => {
        if (!current) return current;
        return {
          data: current.data.filter((f) => f.name !== flagName),
          meta: {
            ...current.meta,
            total: Math.max(0, current.meta.total - 1),
          },
        };
      });
    } catch (error) {
      console.error('Failed to delete feature flag:', error);
    }
  };

  // Get environment badge
  const getEnvironmentBadge = (env: string) => {
    const variants: Record<string, BadgeProps['variant']> = {
      all: 'default',
      production: 'destructive',
      staging: 'warning',
      development: 'secondary',
    };
    return <Badge variant={variants[env] || 'default'}>{env}</Badge>;
  };

  // Define columns
  const columns: Column<FeatureFlag>[] = [
    {
      key: 'enabled',
      label: t('status'),
      render: (flag) => (
        <Switch
          checked={flag.value}
          onCheckedChange={(checked) => handleToggle(flag.name, checked)}
        />
      ),
    },
    {
      key: 'name',
      label: t('feature'),
      sortable: true,
      render: (flag) => (
        <div>
          <div className="font-medium">{flag.name}</div>
          <div className="text-xs text-muted-foreground">{flag.metadata?.description || '-'}</div>
        </div>
      ),
    },
    {
      key: 'description',
      label: t('description'),
      render: (flag) => (
        <p className="text-sm text-muted-foreground max-w-md truncate">
          {flag.metadata?.owner || '-'} / {flag.metadata?.category || '-'}
        </p>
      ),
    },
    {
      key: 'target_type',
      label: t('target'),
      render: (flag) => (
        <Badge variant={flag.has_override ? 'warning' : 'default'}>
          {flag.has_override ? 'Override' : 'Default'}
        </Badge>
      ),
    },
    {
      key: 'environment',
      label: t('environment'),
      render: (flag) => (
        <Badge variant="secondary">
          {flag.metadata?.introduced_wave || 'N/A'}
        </Badge>
      ),
    },
    {
      key: 'usage_count',
      label: t('usage'),
      sortable: true,
      className: 'text-right',
      render: (flag) => (
        <span className="text-sm text-muted-foreground">
          {flag.metadata?.blast_radius || 'N/A'}
        </span>
      ),
    },
    {
      key: 'updated_at',
      label: t('updated'),
      sortable: true,
      render: (flag) => (
        <span className="text-sm text-muted-foreground">
          {flag.updated_at ? formatDistanceToNow(new Date(flag.updated_at), { addSuffix: true }) : 'Never'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: t('actions'),
      className: 'text-right',
      render: (flag) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDelete(flag.name)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <Button onClick={() => alert(t('createComingSoon'))}>
          <Plus className="mr-2 h-4 w-4" />
          {t('createFlag')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchInput
          placeholder={t('searchPlaceholder')}
          onSearch={handleSearch}
          className="w-full sm:w-80"
        />

        <div className="flex gap-2 flex-wrap">
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) =>
              handleFilterChange('status', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t('allStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatus')}</SelectItem>
              <SelectItem value="enabled">{t('enabled')}</SelectItem>
              <SelectItem value="disabled">{t('disabled')}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.environment || 'all'}
            onValueChange={(value) =>
              handleFilterChange('environment', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t('allEnvironments')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allEnvironments')}</SelectItem>
              <SelectItem value="production">{t('production')}</SelectItem>
              <SelectItem value="staging">{t('staging')}</SelectItem>
              <SelectItem value="development">{t('development')}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.target_type || ALL_TARGETS}
            onValueChange={(value) =>
              handleFilterChange('target_type', value === ALL_TARGETS ? undefined : value)
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t('allTargets')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_TARGETS}>{t('allTargets')}</SelectItem>
              <SelectItem value="all">{t('allUsers')}</SelectItem>
              <SelectItem value="percentage">{t('percentage')}</SelectItem>
              <SelectItem value="users">{t('specificUsers')}</SelectItem>
              <SelectItem value="stores">{t('specificStores')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {isLoading && flags.length === 0 ? (
        <div className="rounded-md border p-8 text-center">
          <div className="text-muted-foreground">{t('loading')}</div>
        </div>
      ) : (
        <>
          {isFetching && (
            <div className="text-sm text-muted-foreground">{t('refreshing')}</div>
          )}
          <DataTable
            columns={columns}
            data={flags}
            keyExtractor={(flag) => flag.name}
            onSort={() => handleSort()}
            emptyMessage={t('noFlags')}
          />

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {t('showingFlags', {
                  from: (meta.current_page - 1) * meta.per_page + 1,
                  to: Math.min(meta.current_page * meta.per_page, meta.total),
                  total: meta.total,
                })}
              </div>
              <Pagination
                currentPage={meta.current_page}
                totalPages={meta.last_page}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
