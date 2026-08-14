'use client';

import * as React from 'react';
import Link from 'next/link';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Archive,
  TrendingUp,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { plansEndpoints } from '@/lib/api/endpoints/plans';
import type { Plan, PlanFilters } from '@/lib/types/plan';
import type { PaginatedResponse } from '@/lib/types/user';
import { PLAN_ERROR_CODES } from '@/lib/types/plan';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import {
  resolveLocalizedString,
  getTierVariant,
  getTierLabel,
  formatCurrency,
} from '@/lib/utils/plan-utils';

export default function PlansPage() {
  const locale = useLocale();
  const t = useTranslations('plans');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();

  const [filters, setFilters] = React.useState<PlanFilters>({
    page: 1,
    per_page: 20,
    sort: 'tier_rank',
    order: 'asc',
    include_archived: false,
  });

  const plansQueryKey = React.useMemo(
    () => ['platform-plans', filters] as const,
    [filters]
  );

  const { data, isLoading, isFetching } = useQuery({
    queryKey: plansQueryKey,
    queryFn: () => plansEndpoints.getPlans(filters),
    placeholderData: keepPreviousData,
  });

  const plans = data?.data ?? [];
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
    key: keyof PlanFilters,
    value: PlanFilters[keyof PlanFilters]
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

  // Handle archive
  const handleArchive = async (planId: number, planName: string) => {
    if (!confirm(t('confirmArchive') + ` "${planName}"?`)) return;

    try {
      await plansEndpoints.archivePlan(planId);

      // Update cache
      queryClient.setQueryData<PaginatedResponse<Plan>>(plansQueryKey, (current) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.map((p) =>
            p.id === planId ? { ...p, is_active: false, is_public: false } : p
          ),
        };
      });

      toast.success(t('archiveSuccess'));
    } catch (error: any) {
      console.error('Failed to archive plan:', error);
      const errorCode = error?.code;
      const errorMessage = errorCode && PLAN_ERROR_CODES[errorCode as keyof typeof PLAN_ERROR_CODES]
        ? PLAN_ERROR_CODES[errorCode as keyof typeof PLAN_ERROR_CODES]
        : t('archiveSuccess');
      toast.error(errorMessage);
    }
  };

  // Handle delete
  const handleDelete = async (planId: number, planName: string) => {
    if (!confirm(t('confirmDelete') + ` "${planName}"?`)) return;

    try {
      await plansEndpoints.deletePlan(planId);

      // Update cache
      queryClient.setQueryData<PaginatedResponse<Plan>>(plansQueryKey, (current) => {
        if (!current) return current;
        return {
          data: current.data.filter((p) => p.id !== planId),
          meta: {
            ...current.meta,
            total: Math.max(0, current.meta.total - 1),
          },
        };
      });

      toast.success(t('deleteSuccess'));
    } catch (error: any) {
      console.error('Failed to delete plan:', error);
      const errorCode = error?.code;
      
      if (errorCode === 'BIL_015') {
        // Special handling for in-use plans
        toast.error(PLAN_ERROR_CODES.BIL_015, {
          action: {
            label: t('archive'),
            onClick: () => handleArchive(planId, planName),
          },
        });
      } else {
        const errorMessage = errorCode && PLAN_ERROR_CODES[errorCode as keyof typeof PLAN_ERROR_CODES]
          ? PLAN_ERROR_CODES[errorCode as keyof typeof PLAN_ERROR_CODES]
          : t('deleteSuccess');
        toast.error(errorMessage);
      }
    }
  };

  // Get status badge
  const getStatusBadge = (plan: Plan) => {
    if (plan.superseded_by_plan_id) {
      return <Badge variant="outline">{t('superseded')}</Badge>;
    }
    if (!plan.is_active) {
      return <Badge variant="secondary">{t('archived')}</Badge>;
    }
    if (!plan.is_public) {
      return <Badge variant="outline">{t('private')}</Badge>;
    }
    return <Badge variant="default">{t('active')}</Badge>;
  };

  // Get price summary
  const getPriceSummary = (plan: Plan) => {
    const activePrices = plan.prices.filter((p) => p.is_active);
    if (activePrices.length === 0) return t('noPricesConfigured');

    const monthlyPrice = activePrices.find((p) => p.billing_cycle === 'monthly');
    if (monthlyPrice) {
      return formatCurrency(monthlyPrice.amount_cents, monthlyPrice.currency);
    }

    return formatCurrency(activePrices[0].amount_cents, activePrices[0].currency);
  };

  // Define columns
  const columns: Column<Plan>[] = [
    {
      key: 'name',
      label: t('planName'),
      sortable: true,
      render: (plan) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-medium">
              {resolveLocalizedString(plan.name, locale, plan.code)}
            </div>
            <div className="text-xs text-muted-foreground">{plan.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'tier',
      label: t('tier'),
      sortable: true,
      render: (plan) => (
        <Badge variant={getTierVariant(plan.tier)}>
          {getTierLabel(plan.tier)}
        </Badge>
      ),
    },
    {
      key: 'tier_rank',
      label: t('tierRank'),
      sortable: true,
      className: 'text-center',
    },
    {
      key: 'pricing',
      label: t('prices'),
      render: (plan) => (
        <span className="font-medium">{getPriceSummary(plan)}</span>
      ),
    },
    {
      key: 'trial_days',
      label: t('trialDays'),
      sortable: true,
      className: 'text-center',
      render: (plan) => (
        <span className="text-sm">
          {plan.trial_days > 0 ? `${plan.trial_days} ${t('trialDays').toLowerCase()}` : t('trialDays')}
        </span>
      ),
    },
    {
      key: 'status',
      label: t('status'),
      render: (plan) => getStatusBadge(plan),
    },
    {
      key: 'updated_at',
      label: tCommon('updated'),
      sortable: true,
      render: (plan) => (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(plan.updated_at), { addSuffix: true })}
        </span>
      ),
    },
    {
      key: 'actions',
      label: t('actions'),
      className: 'text-right',
      render: (plan) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" asChild title={t('view')}>
            <Link href={`/${locale}/billing/plans/${plan.id}`}>
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
                <Link href={`/${locale}/billing/plans/${plan.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  {t('planDetails')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/billing/plans/${plan.id}?edit=true`}>
                  <Edit className="mr-2 h-4 w-4" />
                  {t('editPlan')}
                </Link>
              </DropdownMenuItem>
              {!plan.superseded_by_plan_id && (
                <>
                  <DropdownMenuSeparator />
                  {plan.is_active && (
                    <DropdownMenuItem
                      onClick={() =>
                        handleArchive(
                          plan.id,
                          resolveLocalizedString(plan.name, locale, plan.code)
                        )
                      }
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      {t('archive')}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() =>
                      handleDelete(
                        plan.id,
                        resolveLocalizedString(plan.name, locale, plan.code)
                      )
                    }
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('delete')}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
        <Button asChild>
          <Link href={`/${locale}/billing/plans/new`}>
            <Plus className="mr-2 h-4 w-4" />
            {t('createPlan')}
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          placeholder={t('searchPlaceholder')}
          onSearch={handleSearch}
          className="w-full sm:w-80"
        />

        <div className="flex gap-2 items-center flex-wrap">
          <Select
            value={filters.tier || 'all'}
            onValueChange={(value) =>
              handleFilterChange('tier', value === 'all' ? undefined : value as any)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t('allTiers')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allTiers')}</SelectItem>
              <SelectItem value="starter">{t('starter')}</SelectItem>
              <SelectItem value="growth">{t('growth')}</SelectItem>
              <SelectItem value="enterprise">{t('enterprise')}</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Switch
              id="show-archived"
              checked={filters.include_archived || false}
              onCheckedChange={(checked) =>
                handleFilterChange('include_archived', checked)
              }
            />
            <Label htmlFor="show-archived" className="text-sm cursor-pointer">
              {t('filterByStatus')}
            </Label>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading && plans.length === 0 ? (
        <div className="rounded-md border p-8 text-center">
          <div className="text-muted-foreground">{t('loadingPlans')}</div>
        </div>
      ) : (
        <>
          {isFetching && (
            <div className="text-sm text-muted-foreground">{t('loadingPlans')}</div>
          )}
          <DataTable
            columns={columns}
            data={plans}
            keyExtractor={(plan) => plan.id}
            sortKey={filters.sort}
            sortOrder={filters.order}
            onSort={handleSort}
            emptyMessage={t('noPlansFound')}
          />

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {tCommon('loading')} {(meta.current_page - 1) * meta.per_page + 1} {tCommon('search')}{' '}
                {Math.min(meta.current_page * meta.per_page, meta.total)} {tCommon('search')}{' '}
                {meta.total} {t('title').toLowerCase()}
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
