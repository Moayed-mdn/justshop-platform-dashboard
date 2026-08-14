'use client';

import * as React from 'react';
import Link from 'next/link';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { Eye, MoreHorizontal } from 'lucide-react';
import { subscriptionsEndpoints } from '@/lib/api/endpoints/subscriptions';
import type { Subscription, SubscriptionFilters } from '@/lib/types/subscription';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
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

export default function SubscriptionsPage() {
  const t = useTranslations('subscriptions');
  const locale = useLocale();

  const [filters, setFilters] = React.useState<SubscriptionFilters>({
    page: 1,
    per_page: 20,
    sort: 'created_at',
    order: 'desc',
  });

  const subscriptionsQueryKey = React.useMemo(
    () => ['platform-subscriptions', filters] as const,
    [filters]
  );

  const { data, isLoading, isFetching } = useQuery({
    queryKey: subscriptionsQueryKey,
    queryFn: () => subscriptionsEndpoints.getSubscriptions(filters),
    placeholderData: keepPreviousData,
  });

  const subscriptions = data?.data ?? [];
  const meta = data?.meta.pagination ?? {
    current_page: 1,
    total: 0,
    per_page: filters.per_page ?? 20,
    total_pages: 1,
  };

  // Handle search
  const handleSearch = React.useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  // Handle filter change
  const handleFilterChange = (
    key: keyof SubscriptionFilters,
    value: SubscriptionFilters[keyof SubscriptionFilters]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle sort
  const handleSort = (key: string) => {
    setFilters((prev) => ({
      ...prev,
      sort: key as SubscriptionFilters['sort'],
      order: prev.sort === key && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Get status badge variant
  const getStatusVariant = (status: Subscription['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'trialing':
        return 'info';
      case 'past_due':
      case 'grace_period':
        return 'warning';
      case 'canceled':
      case 'expired':
        return 'destructive';
      case 'paused':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Format currency
  const formatCurrency = (cents: number, currency: string) => {
    const amount = cents / 100;
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  // Define columns
  const columns: Column<Subscription>[] = [
    {
      key: 'status',
      label: t('status'),
      sortable: true,
      render: (subscription) => (
        <Badge variant={getStatusVariant(subscription.status)}>
          {t(subscription.status)}
        </Badge>
      ),
    },
    {
      key: 'plan',
      label: t('plan'),
      render: (subscription) => (
        <div>
          <div className="font-medium">{subscription.plan.name}</div>
          {subscription.plan_price && (
            <div className="text-xs text-muted-foreground">
              {formatCurrency(
                subscription.plan_price.amount_cents,
                subscription.plan_price.currency
              )}{' '}
              {t(subscription.billing_cycle === 'monthly' ? 'perMonth' : 'perYear')}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'merchant',
      label: t('merchant'),
      render: (subscription) => (
        <div>
          <div className="font-medium">{subscription.merchant.owner_name}</div>
          <div className="text-xs text-muted-foreground">
            {subscription.merchant.owner_email}
          </div>
        </div>
      ),
    },
    {
      key: 'current_period_ends_at',
      label: t('currentPeriodEnds'),
      sortable: true,
      render: (subscription) => (
        <div>
          <span className="text-sm">
            {formatDistanceToNow(new Date(subscription.current_period_ends_at), {
              addSuffix: true,
            })}
          </span>
          {subscription.cancel_at_period_end && (
            <Badge variant="warning" className="ml-2">
              {t('ending')}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      label: t('created'),
      sortable: true,
      render: (subscription) => (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(subscription.created_at), {
            addSuffix: true,
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      label: t('actions'),
      className: 'text-right',
      render: (subscription) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" asChild title={t('view')}>
            <Link href={`/${locale}/billing/subscriptions/${subscription.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/billing/subscriptions/${subscription.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  {t('view')}
                </Link>
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
        <p className="text-muted-foreground">{t('subtitle')}</p>
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
              handleFilterChange('status', value === 'all' ? undefined : (value as any))
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t('allStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatus')}</SelectItem>
              <SelectItem value="incomplete">{t('incomplete')}</SelectItem>
              <SelectItem value="trialing">{t('trialing')}</SelectItem>
              <SelectItem value="active">{t('active')}</SelectItem>
              <SelectItem value="past_due">{t('pastDue')}</SelectItem>
              <SelectItem value="grace_period">{t('gracePeriod')}</SelectItem>
              <SelectItem value="paused">{t('paused')}</SelectItem>
              <SelectItem value="canceled">{t('canceled')}</SelectItem>
              <SelectItem value="expired">{t('expired')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {isLoading && subscriptions.length === 0 ? (
        <div className="rounded-md border p-8 text-center">
          <div className="text-muted-foreground">{t('loadingSubscriptions')}</div>
        </div>
      ) : (
        <>
          {isFetching && (
            <div className="text-sm text-muted-foreground">
              {t('loadingSubscriptions')}
            </div>
          )}
          <DataTable
            columns={columns}
            data={subscriptions}
            keyExtractor={(subscription) => subscription.id}
            sortKey={filters.sort}
            sortOrder={filters.order}
            onSort={handleSort}
            emptyMessage={t('noSubscriptionsFound')}
          />

          {/* Pagination */}
          {meta.total_pages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(meta.current_page - 1) * meta.per_page + 1} to{' '}
                {Math.min(meta.current_page * meta.per_page, meta.total)} of{' '}
                {meta.total} subscriptions
              </div>
              <Pagination
                currentPage={meta.current_page}
                totalPages={meta.total_pages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
