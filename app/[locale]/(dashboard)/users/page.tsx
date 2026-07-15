'use client';

import * as React from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Eye, Ban, CheckCircle, MoreHorizontal } from 'lucide-react';
import { usersEndpoints } from '@/lib/api/endpoints/users';
import type { User, UserFilters } from '@/lib/types/user';
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
import { formatDistanceToNow } from 'date-fns';

export default function UsersPage() {
  const t = useTranslations('users');
  const locale = useLocale();

  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filters, setFilters] = React.useState<UserFilters>({
    page: 1,
    per_page: 20,
    sort: 'created_at',
    order: 'desc',
  });
  const [meta, setMeta] = React.useState({
    current_page: 1,
    total: 0,
    per_page: 20,
    last_page: 1,
  });

  // Fetch users
  React.useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await usersEndpoints.getUsers(filters);
        setUsers(response.data);
        setMeta(response.meta);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [filters.page, filters.per_page, filters.search, filters.role, filters.status, filters.sort, filters.order]);

  // Handle search
  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  // Handle filter change
  const handleFilterChange = (key: keyof UserFilters, value: any) => {
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
      case 'merchant':
        return 'info';
      case 'user':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Define columns
  const columns: Column<User>[] = [
    {
      key: 'user',
      label: 'User',
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
      label: 'Role',
      sortable: true,
      render: (user) => (
        <Badge variant={getRoleVariant(user.role)}>
          {user.role.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (user) => (
        <Badge variant={getStatusVariant(user.status)}>
          {user.status}
        </Badge>
      ),
    },
    {
      key: 'stores_count',
      label: 'Stores',
      sortable: true,
      className: 'text-center',
    },
    {
      key: 'created_at',
      label: 'Joined',
      sortable: true,
      render: (user) => (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (user) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/${locale}/users/${user.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {user.status === 'active' ? (
            <Button variant="ghost" size="icon" title="Suspend user">
              <Ban className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" title="Activate user">
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">
          Manage platform users, roles, and permissions
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          placeholder="Search users..."
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
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="merchant">Merchant</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>

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
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-md border p-8 text-center">
          <div className="text-muted-foreground">Loading users...</div>
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={users}
            keyExtractor={(user) => user.id}
            sortKey={filters.sort}
            sortOrder={filters.order}
            onSort={handleSort}
            emptyMessage="No users found"
          />

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(meta.current_page - 1) * meta.per_page + 1} to{' '}
                {Math.min(meta.current_page * meta.per_page, meta.total)} of{' '}
                {meta.total} users
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
