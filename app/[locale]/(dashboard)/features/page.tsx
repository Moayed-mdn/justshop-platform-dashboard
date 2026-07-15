'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import { Plus, Trash2 } from 'lucide-react';
import { featureFlagsEndpoints } from '@/lib/api/endpoints/feature-flags';
import type { FeatureFlag, FeatureFlagFilters } from '@/lib/types/feature-flag';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
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

export default function FeatureFlagsPage() {
  const locale = useLocale();

  const [flags, setFlags] = React.useState<FeatureFlag[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filters, setFilters] = React.useState<FeatureFlagFilters>({
    page: 1,
    per_page: 20,
  });
  const [meta, setMeta] = React.useState({
    current_page: 1,
    total: 0,
    per_page: 20,
    last_page: 1,
  });

  // Fetch feature flags
  React.useEffect(() => {
    const fetchFlags = async () => {
      setLoading(true);
      try {
        const response = await featureFlagsEndpoints.getFeatureFlags(filters);
        setFlags(response.data);
        setMeta(response.meta);
      } catch (error) {
        console.error('Failed to fetch feature flags:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlags();
  }, [filters.page, filters.per_page, filters.search, filters.status, filters.environment, filters.target_type]);

  // Handle search
  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  // Handle filter change
  const handleFilterChange = (key: keyof FeatureFlagFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle sort
  const handleSort = (key: string) => {
    // Sorting handled by API (currently just alphabetical)
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Handle toggle
  const handleToggle = async (flagId: number) => {
    try {
      const updatedFlag = await featureFlagsEndpoints.toggleFeatureFlag(flagId);
      setFlags((prev) =>
        prev.map((f) => (f.id === flagId ? updatedFlag : f))
      );
    } catch (error) {
      console.error('Failed to toggle feature flag:', error);
    }
  };

  // Handle delete
  const handleDelete = async (flagId: number) => {
    if (!confirm('Are you sure you want to delete this feature flag?')) return;

    try {
      await featureFlagsEndpoints.deleteFeatureFlag(flagId);
      setFlags((prev) => prev.filter((f) => f.id !== flagId));
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
    const variants: Record<string, any> = {
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
          onCheckedChange={() => handleToggle(flag.id)}
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
        <span className="text-sm">{flag.usage_count.toLocaleString()}</span>
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
            value={filters.target_type || 'all'}
            onValueChange={(value) =>
              handleFilterChange('target_type', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Targets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Targets</SelectItem>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="users">Specific Users</SelectItem>
              <SelectItem value="stores">Specific Stores</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-md border p-8 text-center">
          <div className="text-muted-foreground">Loading feature flags...</div>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={flags}
            keyExtractor={(flag) => flag.id}
            onSort={handleSort}
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
