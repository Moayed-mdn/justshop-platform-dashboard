'use client';

import * as React from 'react';
import Link from 'next/link';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { 
  Eye, 
  Ban, 
  CheckCircle, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  ExternalLink,
  Settings 
} from 'lucide-react';
import { storesEndpoints } from '@/lib/api/endpoints/stores';
import type { PaginatedResponse } from '@/lib/types/user';
import type { Store, StoreFilters } from '@/lib/types/store';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
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
import { formatDistanceToNow } from 'date-fns';

export default function StoresPage() {
  const locale = useLocale();
  const queryClient = useQueryClient();

  const [filters, setFilters] = React.useState<StoreFilters>({
    page: 1,
    per_page: 20,
    sort: 'created_at',
    order: 'desc',
  });
  const storesQueryKey = React.useMemo(() => ['platform-stores', filters] as const, [filters]);
  const { data, isLoading, isFetching } = useQuery({
    queryKey: storesQueryKey,
    queryFn: () => storesEndpoints.getStores(filters),
    placeholderData: keepPreviousData,
  });
  const stores = data?.data ?? [];
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
    key: keyof StoreFilters,
    value: StoreFilters[keyof StoreFilters]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle sort
  const handleSort = (key: string) => {
    setFilters((prev) => ({
      ...prev,
      sort: key,
      order: prev.sort === key && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Handle suspend/activate
  const handleToggleStatus = async (storeId: number, currentStatus: Store['status']) => {
    try {
      const updatedStore =
        currentStatus === 'active'
          ? await storesEndpoints.suspendStore(storeId)
          : await storesEndpoints.activateStore(storeId);

      queryClient.setQueryData<PaginatedResponse<Store>>(storesQueryKey, (current) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.map((s) =>
            s.id === storeId ? { ...s, status: updatedStore.status } : s
          ),
        };
      });
    } catch (error) {
      console.error('Failed to update store status:', error);
    }
  };

  // Handle delete
  const handleDelete = async (storeId: number) => {
    if (!confirm('Are you sure you want to delete this store? This action cannot be undone.')) return;

    try {
      await storesEndpoints.deleteStore(storeId);
      queryClient.setQueryData<PaginatedResponse<Store>>(storesQueryKey, (current) => {
        if (!current) return current;
        return {
          data: current.data.filter((s) => s.id !== storeId),
          meta: {
            ...current.meta,
            total: Math.max(0, current.meta.total - 1),
          },
        };
      });
    } catch (error) {
      console.error('Failed to delete store:', error);
    }
  };

  // Get initials
  const getInitials = (name: string | null | undefined) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get status badge variant
  const getStatusVariant = (status: Store['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'destructive';
      case 'pending':
        return 'warning';
      case 'inactive':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Define columns
  const columns: Column<Store>[] = [
    {
      key: 'store',
      label: 'Store',
      sortable: true,
      render: (store) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-md">
            <AvatarImage src={store.logo} alt={store.name} />
            <AvatarFallback className="rounded-md">{getInitials(store.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{store.name}</div>
            <div className="text-xs text-muted-foreground">{store.domain}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'owner',
      label: 'Owner',
      sortable: true,
      render: (store) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={store.owner?.avatar} alt={store.owner?.name} />
            <AvatarFallback className="text-xs">
              {getInitials(store.owner?.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium">{store.owner?.name ?? 'Unassigned'}</div>
            <div className="text-xs text-muted-foreground">{store.owner?.email ?? '-'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (store) => (
        <Badge variant={getStatusVariant(store.status)}>
          {store.status}
        </Badge>
      ),
    },
    {
      key: 'products_count',
      label: 'Products',
      sortable: true,
      className: 'text-center',
    },
    {
      key: 'orders_count',
      label: 'Orders',
      sortable: true,
      className: 'text-center',
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (store) => (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(store.created_at), { addSuffix: true })}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (store) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" asChild title="View store">
            <Link href={`/${locale}/stores/${store.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {store.status === 'active' ? (
            <Button
              variant="ghost"
              size="icon"
              title="Suspend store"
              onClick={() => handleToggleStatus(store.id, store.status)}
            >
              <Ban className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              title="Activate store"
              onClick={() => handleToggleStatus(store.id, store.status)}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/stores/${store.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/stores/${store.id}?edit=true`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Store
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={`https://${store.domain}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit Storefront
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleToggleStatus(store.id, store.status)}
              >
                {store.status === 'active' ? (
                  <>
                    <Ban className="mr-2 h-4 w-4" />
                    Suspend Store
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Activate Store
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Configure
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(store.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Store
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Stores</h1>
        <p className="text-muted-foreground">
          Manage platform stores, configurations, and owners
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          placeholder="Search stores..."
          onSearch={handleSearch}
          className="w-full sm:w-80"
        />

        <div className="flex gap-2">
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {isLoading && stores.length === 0 ? (
        <div className="rounded-md border p-8 text-center">
          <div className="text-muted-foreground">Loading stores...</div>
        </div>
      ) : (
        <>
          {isFetching && (
            <div className="text-sm text-muted-foreground">Refreshing stores...</div>
          )}
          <DataTable
            columns={columns}
            data={stores}
            keyExtractor={(store) => store.id}
            sortKey={filters.sort}
            sortOrder={filters.order}
            onSort={handleSort}
            emptyMessage="No stores found"
          />

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(meta.current_page - 1) * meta.per_page + 1} to{' '}
                {Math.min(meta.current_page * meta.per_page, meta.total)} of{' '}
                {meta.total} stores
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
