'use client';

import * as React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  Activity,
  Download,
  Filter,
  User,
  Store,
  FileText,
  File,
  BookOpen,
  Server,
} from 'lucide-react';
import { auditEndpoints } from '@/lib/api/endpoints/audit';
import type { AuditLog, AuditFilters } from '@/lib/types/audit';
import { Card, CardContent } from '@/components/ui/card';
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
import { formatDistanceToNow, format } from 'date-fns';

export default function AuditLogsPage() {
  const locale = useLocale();

  const [logs, setLogs] = React.useState<AuditLog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filters, setFilters] = React.useState<AuditFilters>({
    page: 1,
    per_page: 20,
  });
  const [meta, setMeta] = React.useState({
    current_page: 1,
    total: 0,
    per_page: 20,
    last_page: 1,
  });

  // Fetch audit logs
  React.useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await auditEndpoints.getAuditLogs(filters);
        setLogs(response.data);
        setMeta(response.meta);
      } catch (error) {
        console.error('Failed to fetch audit logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [filters.page, filters.per_page, filters.search, filters.action, filters.resource_type, filters.user_id]);

  // Handle search
  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  // Handle filter change
  const handleFilterChange = (key: keyof AuditFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Handle export
  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const url = await auditEndpoints.exportAuditLogs(format, filters);
      alert(`Export started! Download URL: ${url}\n\nNote: This is a mock implementation.`);
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  // Get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get action badge variant
  const getActionVariant = (action: string) => {
    switch (action) {
      case 'created':
      case 'published':
      case 'activated':
      case 'login':
        return 'success';
      case 'updated':
      case 'exported':
        return 'info';
      case 'deleted':
      case 'suspended':
        return 'destructive';
      case 'archived':
      case 'logout':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Get resource icon
  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'store':
        return <Store className="h-4 w-4" />;
      case 'blog_post':
        return <FileText className="h-4 w-4" />;
      case 'page':
        return <File className="h-4 w-4" />;
      case 'documentation':
        return <BookOpen className="h-4 w-4" />;
      case 'system':
        return <Server className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  // Get resource link
  const getResourceLink = (log: AuditLog) => {
    if (!log.resource_id) return null;

    switch (log.resource_type) {
      case 'user':
        return `/${locale}/users/${log.resource_id}`;
      case 'store':
        return `/${locale}/stores/${log.resource_id}`;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">
            Track all platform activities and user actions
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Export Format</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('json')}>
              Export as JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchInput
          placeholder="Search activities..."
          onSearch={handleSearch}
          className="w-full sm:w-80"
        />

        <div className="flex gap-2 flex-wrap">
          <Select
            value={filters.action || 'all'}
            onValueChange={(value) =>
              handleFilterChange('action', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="activated">Activated</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.resource_type || 'all'}
            onValueChange={(value) =>
              handleFilterChange('resource_type', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Resources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Resources</SelectItem>
              <SelectItem value="user">Users</SelectItem>
              <SelectItem value="store">Stores</SelectItem>
              <SelectItem value="blog_post">Blog Posts</SelectItem>
              <SelectItem value="page">Pages</SelectItem>
              <SelectItem value="documentation">Documentation</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Activity Timeline */}
      {loading ? (
        <div className="rounded-md border p-8 text-center">
          <div className="text-muted-foreground">Loading audit logs...</div>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {logs.map((log) => {
              const resourceLink = getResourceLink(log);

              return (
                <Card key={log.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      {/* User Avatar */}
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={log.user_avatar} alt={log.user_name} />
                        <AvatarFallback>{getInitials(log.user_name)}</AvatarFallback>
                      </Avatar>

                      {/* Activity Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{log.user_name}</span>
                          <Badge variant={getActionVariant(log.action)}>
                            {log.action}
                          </Badge>
                          {log.resource_type !== 'system' && (
                            <Badge variant="outline" className="gap-1">
                              {getResourceIcon(log.resource_type)}
                              {log.resource_type.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {log.description}
                          {log.resource_name && resourceLink ? (
                            <>
                              {': '}
                              <Link
                                href={resourceLink}
                                className="text-primary hover:underline font-medium"
                              >
                                {log.resource_name}
                              </Link>
                            </>
                          ) : log.resource_name ? (
                            <>: <span className="font-medium">{log.resource_name}</span></>
                          ) : null}
                        </p>

                        {log.changes && log.changes.length > 0 && (
                          <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
                            <div className="font-medium mb-1">Changes:</div>
                            {log.changes.map((change, idx) => (
                              <div key={idx}>
                                <span className="font-medium">{change.field}</span>:{' '}
                                <span className="line-through">{String(change.before)}</span> →{' '}
                                <span className="text-foreground">{String(change.after)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span title={format(new Date(log.created_at), 'PPpp')}>
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                          </span>
                          {log.ip_address && (
                            <>
                              <span>•</span>
                              <span>{log.ip_address}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(meta.current_page - 1) * meta.per_page + 1} to{' '}
                {Math.min(meta.current_page * meta.per_page, meta.total)} of{' '}
                {meta.total} activities
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
