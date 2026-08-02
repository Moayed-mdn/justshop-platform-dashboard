'use client';

import * as React from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
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
  const handleToggle = async (flagId: number, enabled: boolean) => {
    try {
      const updatedFlag = await featureFlagsEndpoints.toggleFeatureFlag(flagId, enabled);
      queryClient.setQueryData<PaginatedResponse<FeatureFlag>>(flagsQueryKey, (current) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.map((f) =>
            f.id === flagId ? { ...f, ...updatedFlag } : f
          ),
        };
      });
    } catch (error) {
      console.error('Failed to toggle feature flag:', error);
    }
  };

  // Handle delete
  const handleDelete = async (flagId: number) => {
    if (!confirm('Are you sure you want to delete this feature flag?')) return;

    try {
      await featureFlagsEndpoints.deleteFeatureFlag(flagId);
      queryClient.setQueryData<PaginatedResponse<FeatureFlag>>(flagsQueryKey, (current) => {
        if (!current) return current;
        return {
          data: current.data.filter((f) => f.id !== flagId),
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

  // Get target badge
  const getTargetBadge = (flag: FeatureFlag) => {
    switch (flag.target_type) {
      case 'all':
        return <Badge variant="default">All Users</Badge>;
      case 'percentage':
        return (
          <Badge variant="info">
            {flag.target_value}% Rollout
          </Badge>
        );
      case 'users':
        return <Badge variant="secondary">Specific Users</Badge>;
      case 'stores':
        return <Badge variant="secondary">Specific Stores</Badge>;
      default:
        return null;
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
      label: 'Status',
      render: (flag) => (
        <Switch
          checked={flag.enabled}
          onCheckedChange={(checked) => handleToggle(flag.id, checked)}
        />
      ),
    },
    {
      key: 'name',
      label: 'Feature',
      sortable: true,
      render: (flag) => (
        <div>
          <div className="font-medium">{flag.name}</div>
          <div className="text-xs text-muted-foreground">{flag.key}</div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (flag) => (
        <p className="text-sm text-muted-foreground max-w-md truncate">
          {flag.description}
        </p>
      ),
    },
    {
      key: 'target_type',
      label: 'Target',
      render: (flag) => getTargetBadge(flag),
    },
    {
      key: 'environment',
      label: 'Environment',
      render: (flag) => getEnvironmentBadge(flag.environment),
    },
    {
      key: 'usage_count',
      label: 'Usage',
      sortable: true,
      className: 'text-right',
      render: (flag) => (
        <span className="text-sm">{(flag.usage_count ?? 0).toLocaleString()}</span>
      ),
    },
    {
      key: 'updated_at',
      label: 'Updated',
      sortable: true,
      render: (flag) => (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(flag.updated_at), { addSuffix: true })}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (flag) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDelete(flag.id)}
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
          <h1 className="text-3xl font-bold">Feature Flags</h1>
          <p className="text-muted-foreground">
            Control feature rollouts and A/B testing
          </p>
        </div>
        <Button onClick={() => alert('Create Feature Flag - Coming soon!')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Flag
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchInput
          placeholder="Search features..."
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
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="enabled">Enabled</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.environment || 'all'}
            onValueChange={(value) =>
              handleFilterChange('environment', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Environments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Environments</SelectItem>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="development">Development</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.target_type || ALL_TARGETS}
            onValueChange={(value) =>
              handleFilterChange('target_type', value === ALL_TARGETS ? undefined : value)
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Targets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_TARGETS}>All Targets</SelectItem>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="users">Specific Users</SelectItem>
              <SelectItem value="stores">Specific Stores</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {isLoading && flags.length === 0 ? (
        <div className="rounded-md border p-8 text-center">
          <div className="text-muted-foreground">Loading feature flags...</div>
        </div>
      ) : (
        <>
          {isFetching && (
            <div className="text-sm text-muted-foreground">Refreshing feature flags...</div>
          )}
          <DataTable
            columns={columns}
            data={flags}
            keyExtractor={(flag) => flag.id}
            onSort={() => handleSort()}
            emptyMessage="No feature flags found"
          />

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(meta.current_page - 1) * meta.per_page + 1} to{' '}
                {Math.min(meta.current_page * meta.per_page, meta.total)} of{' '}
                {meta.total} flags
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
