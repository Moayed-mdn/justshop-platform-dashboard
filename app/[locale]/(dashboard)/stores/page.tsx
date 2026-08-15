'use client';

import * as React from 'react';
import Link from 'next/link';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
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
  const t = useTranslations('stores');
  const tCommon = useTranslations('common');

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
    if (!confirm(t('confirmDelete'))) return;

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
      label: tCommon('store'),
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
      label: t('owner'),
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
            <div className="text-sm font-medium">{store.owner?.name ?? t('unassigned')}</div>
            <div className="text-xs text-muted-foreground">{store.owner?.email ?? '-'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: t('status'),
      sortable: true,
      render: (store) => (
        <Badge variant={getStatusVariant(store.status)}>
          {store.status}
        </Badge>
      ),
    },
    {
      key: 'products_count',
      label: t('products'),
      sortable: true,
      className: 'text-center',
    },
    {
      key: 'orders_count',
      label: t('orders'),
      sortable: true,
      className: 'text-center',
    },
    {
      key: 'created_at',
      label: t('created'),
      sortable: true,
      render: (store) => (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(store.created_at), { addSuffix: true })}
        </span>
      ),
    },
    {
      key: 'actions',
      label: t('actions'),
      className: 'text-right',
      render: (store) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" asChild title={t('viewStore')}>
            <Link href={`/${locale}/stores/${store.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {store.status === 'active' ? (
            <Button
              variant="ghost"
              size="icon"
              title={t('suspendStore')}
              onClick={() => handleToggleStatus(store.id, store.status)}
            >
              <Ban className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              title={t('activateStore')}
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
              <DropdownMenuLabel>{tCommon('actions')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/stores/${store.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  {t('viewDetails')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/stores/${store.id}?edit=true`}>
                  <Edit className="mr-2 h-4 w-4" />
                  {t('editStore')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={`https://${store.domain}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {t('visitStorefront')}
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleToggleStatus(store.id, store.status)}
              >
                {store.status === 'active' ? (
                  <>
                    <Ban className="mr-2 h-4 w-4" />
                    {t('suspendStore')}
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {t('activateStore')}
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                {t('configure')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(store.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('deleteStore')}
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
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          placeholder={t('searchPlaceholder')}
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
              <SelectValue placeholder={t('allStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatus')}</SelectItem>
              <SelectItem value="active">{t('active')}</SelectItem>
              <SelectItem value="pending">{t('pending')}</SelectItem>
              <SelectItem value="suspended">{t('suspended')}</SelectItem>
              <SelectItem value="inactive">{t('inactive')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {isLoading && stores.length === 0 ? (
        <div className="rounded-md border p-8 text-center">
          <div className="text-muted-foreground">{t('loadingStores')}</div>
        </div>
      ) : (
        <>
          {isFetching && (
            <div className="text-sm text-muted-foreground">{t('refreshingStores')}</div>
          )}
          <DataTable
            columns={columns}
            data={stores}
            keyExtractor={(store) => store.id}
            sortKey={filters.sort}
            sortOrder={filters.order}
            onSort={handleSort}
            emptyMessage={t('noStoresFound')}
          />

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {t('showingStores', {
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
