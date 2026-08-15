'use client';

import * as React from 'react';
import Link from 'next/link';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { Eye, Ban, CheckCircle, MoreHorizontal, Edit, Trash2, UserCog } from 'lucide-react';
import { usersEndpoints } from '@/lib/api/endpoints/users';
import type { User, UserFilters, PaginatedResponse } from '@/lib/types/user';
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
import { formatUserRole } from '@/lib/utils';

export default function UsersPage() {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const t = useTranslations('users');
  const tCommon = useTranslations('common');

  const [filters, setFilters] = React.useState<UserFilters>({
    page: 1,
    per_page: 20,
    sort: 'created_at',
    order: 'desc',
  });
  const usersQueryKey = React.useMemo(() => ['platform-users', filters] as const, [filters]);
  const { data, isLoading, isFetching } = useQuery({
    queryKey: usersQueryKey,
    queryFn: () => usersEndpoints.getUsers(filters),
    placeholderData: keepPreviousData,
  });
  const users = data?.data ?? [];
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
    key: keyof UserFilters,
    value: UserFilters[keyof UserFilters]
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
  const handleToggleStatus = async (userId: number, currentStatus: User['status']) => {
    try {
      const updatedUser =
        currentStatus === 'active'
          ? await usersEndpoints.suspendUser(userId)
          : await usersEndpoints.activateUser(userId);

      queryClient.setQueryData<PaginatedResponse<User>>(usersQueryKey, (current) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.map((u) =>
            u.id === userId ? { ...u, status: updatedUser.status } : u
          ),
        };
      });
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  // Handle delete
  const handleDelete = async (userId: number) => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      await usersEndpoints.deleteUser(userId);
      queryClient.setQueryData<PaginatedResponse<User>>(usersQueryKey, (current) => {
        if (!current) return current;
        return {
          data: current.data.filter((u) => u.id !== userId),
          meta: {
            ...current.meta,
            total: Math.max(0, current.meta.total - 1),
          },
        };
      });
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  // Get user initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get status badge variant
  const getStatusVariant = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'destructive';
      case 'inactive':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Get role badge variant
  const getRoleVariant = (role: User['role']) => {
    switch (role) {
      case 'super_admin':
        return 'default';
      case 'store_admin':
        return 'info';
      case 'staff':
        return 'secondary';
      case 'customer':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Define columns
  const columns: Column<User>[] = [
    {
      key: 'user',
      label: t('role'),
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: t('role'),
      sortable: true,
      render: (user) => (
        <Badge variant={getRoleVariant(user.role)}>
          {formatUserRole(user.role)}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: t('status'),
      sortable: true,
      render: (user) => (
        <Badge variant={getStatusVariant(user.status)}>
          {user.status}
        </Badge>
      ),
    },
    {
      key: 'stores_count',
      label: t('stores'),
      sortable: true,
      className: 'text-center',
    },
    {
      key: 'created_at',
      label: t('joined'),
      sortable: true,
      render: (user) => (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
        </span>
      ),
    },
    {
      key: 'actions',
      label: t('actions'),
      className: 'text-right',
      render: (user) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" asChild title={t('viewUser')}>
            <Link href={`/${locale}/users/${user.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {user.status === 'active' ? (
            <Button
              variant="ghost"
              size="icon"
              title={t('suspendUser')}
              onClick={() => handleToggleStatus(user.id, user.status)}
            >
              <Ban className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              title={t('activateUser')}
              onClick={() => handleToggleStatus(user.id, user.status)}
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
                <Link href={`/${locale}/users/${user.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  {t('viewDetails')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/users/${user.id}?edit=true`}>
                  <Edit className="mr-2 h-4 w-4" />
                  {t('editUser')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleToggleStatus(user.id, user.status)}
              >
                {user.status === 'active' ? (
                  <>
                    <Ban className="mr-2 h-4 w-4" />
                    {t('suspendUser')}
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {t('activateUser')}
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserCog className="mr-2 h-4 w-4" />
                {t('changeRole')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(user.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('deleteUser')}
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
            value={filters.role || 'all'}
            onValueChange={(value) =>
              handleFilterChange('role', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t('allRoles')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allRoles')}</SelectItem>
              <SelectItem value="super_admin">{t('superAdmin')}</SelectItem>
              <SelectItem value="store_admin">{t('storeAdmin')}</SelectItem>
              <SelectItem value="staff">{t('staff')}</SelectItem>
              <SelectItem value="customer">{t('customer')}</SelectItem>
            </SelectContent>
          </Select>

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
              <SelectItem value="suspended">{t('suspended')}</SelectItem>
              <SelectItem value="inactive">{t('inactive')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {isLoading && users.length === 0 ? (
        <div className="rounded-md border p-8 text-center">
          <div className="text-muted-foreground">{t('loadingUsers')}</div>
        </div>
      ) : (
        <>
          {isFetching && (
            <div className="text-sm text-muted-foreground">{t('refreshingUsers')}</div>
          )}
          <DataTable
            columns={columns}
            data={users}
            keyExtractor={(user) => user.id}
            sortKey={filters.sort}
            sortOrder={filters.order}
            onSort={handleSort}
            emptyMessage={t('noUsersFound')}
          />

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {t('showingUsers', {
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
