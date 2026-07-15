import { apiClient } from '../client';
import type { PaginatedResponse } from '@/lib/types/user';
import type { AuditLog, AuditFilters, AuditAction, ResourceType } from '@/lib/types/audit';

// Mock data generator
const generateMockAuditLogs = (count: number): AuditLog[] => {
  const actions: AuditAction[] = ['created', 'updated', 'deleted', 'suspended', 'activated', 'login', 'logout', 'published', 'archived', 'exported'];
  const resourceTypes: ResourceType[] = ['user', 'store', 'blog_post', 'page', 'documentation', 'system'];
  
  const users = [
    { id: 1, name: 'Super Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
    { id: 2, name: 'John Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
    { id: 3, name: 'Jane Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' },
    { id: 4, name: 'Ahmed Hassan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4' },
  ];

  const descriptions = {
    user: {
      created: ['Created new user account', 'Registered new platform user', 'Added user to the system'],
      updated: ['Updated user profile', 'Modified user information', 'Changed user settings'],
      deleted: ['Deleted user account', 'Removed user from system', 'Permanently deleted user'],
      suspended: ['Suspended user account', 'Temporarily disabled user', 'Blocked user access'],
      activated: ['Activated user account', 'Re-enabled user', 'Restored user access'],
    },
    store: {
      created: ['Created new store', 'Launched new storefront', 'Added store to platform'],
      updated: ['Updated store settings', 'Modified store configuration', 'Changed store details'],
      deleted: ['Deleted store', 'Removed storefront', 'Permanently deleted store'],
      suspended: ['Suspended store operations', 'Temporarily disabled store', 'Blocked store access'],
      activated: ['Activated store', 'Re-enabled storefront', 'Restored store operations'],
    },
    blog_post: {
      created: ['Created new blog post', 'Drafted blog article', 'Added blog content'],
      updated: ['Updated blog post', 'Modified article content', 'Revised blog post'],
      deleted: ['Deleted blog post', 'Removed article', 'Permanently deleted post'],
      published: ['Published blog post', 'Made article live', 'Published content'],
      archived: ['Archived blog post', 'Moved post to archive', 'Removed from active posts'],
    },
    page: {
      created: ['Created new page', 'Added static page', 'Built new page'],
      updated: ['Updated page content', 'Modified page', 'Revised page'],
      deleted: ['Deleted page', 'Removed page', 'Permanently deleted page'],
      published: ['Published page', 'Made page live', 'Published content'],
    },
    documentation: {
      created: ['Created new documentation', 'Added doc article', 'Wrote new guide'],
      updated: ['Updated documentation', 'Modified doc content', 'Revised guide'],
      deleted: ['Deleted documentation', 'Removed doc', 'Permanently deleted guide'],
      published: ['Published documentation', 'Made doc live', 'Published guide'],
    },
    system: {
      login: ['Logged into dashboard', 'Accessed platform', 'Authenticated successfully'],
      logout: ['Logged out of dashboard', 'Ended session', 'Signed out'],
      exported: ['Exported data', 'Downloaded report', 'Generated export'],
    },
  };

  const resourceNames = {
    user: ['John Smith', 'Jane Doe', 'Bob Wilson', 'Alice Cooper', 'Mike Johnson'],
    store: ['TechGear Store', 'Fashion Hub', 'Home Decor', 'Sports World', 'Book Haven'],
    blog_post: ['Getting Started Guide', 'Top 10 Tips', 'Best Practices', 'Feature Update', 'Tutorial'],
    page: ['About Us', 'Contact', 'Privacy Policy', 'Terms', 'FAQ'],
    documentation: ['Installation Guide', 'API Reference', 'Quick Start', 'Webhooks', 'Authentication'],
  };

  const ips = ['192.168.1.100', '10.0.0.50', '172.16.0.25', '192.168.2.75'];
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) Firefox/121.0',
  ];

  return Array.from({ length: count }, (_, i) => {
    const user = users[i % users.length];
    const resourceType = resourceTypes[i % resourceTypes.length];
    const action = actions[i % actions.length];

    // Get appropriate description based on resource and action
    let description = '';
    let resourceName: string | undefined;
    let resourceId: number | undefined;

    if (resourceType === 'system') {
      const systemActions = descriptions.system[action as keyof typeof descriptions.system];
      description = systemActions ? systemActions[i % systemActions.length] : `Performed ${action} action`;
      resourceName = undefined;
      resourceId = undefined;
    } else {
      const resourceDesc = descriptions[resourceType as keyof typeof descriptions];
      const actionDesc = resourceDesc?.[action as keyof typeof resourceDesc] as string[] | undefined;
      description = actionDesc && Array.isArray(actionDesc) ? actionDesc[i % actionDesc.length] : `${action} ${resourceType}`;
      
      const names = resourceNames[resourceType as keyof typeof resourceNames];
      resourceName = names ? names[i % names.length] : `Resource ${i}`;
      resourceId = (i % 50) + 1;
    }

    // Add changes for update actions
    let changes;
    if (action === 'updated') {
      changes = [
        { field: 'status', before: 'active', after: 'suspended' },
        { field: 'name', before: 'Old Name', after: 'New Name' },
      ];
    }

    return {
      id: i + 1,
      user_id: user.id,
      user_name: user.name,
      user_avatar: user.avatar,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      resource_name: resourceName,
      description,
      ip_address: i % 3 === 0 ? ips[i % ips.length] : undefined,
      user_agent: i % 4 === 0 ? userAgents[i % userAgents.length] : undefined,
      changes: changes,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
};

const mockAuditLogs = generateMockAuditLogs(250);

export const auditEndpoints = {
  /**
   * Get audit logs
   */
  async getAuditLogs(filters?: AuditFilters): Promise<PaginatedResponse<AuditLog>> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filtered = [...mockAuditLogs];

    // Apply search filter
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.description.toLowerCase().includes(searchLower) ||
          log.user_name.toLowerCase().includes(searchLower) ||
          log.resource_name?.toLowerCase().includes(searchLower)
      );
    }

    // Apply user filter
    if (filters?.user_id) {
      filtered = filtered.filter((log) => log.user_id === filters.user_id);
    }

    // Apply action filter
    if (filters?.action) {
      filtered = filtered.filter((log) => log.action === filters.action);
    }

    // Apply resource type filter
    if (filters?.resource_type) {
      filtered = filtered.filter((log) => log.resource_type === filters.resource_type);
    }

    // Apply date filters
    if (filters?.date_from) {
      const fromDate = new Date(filters.date_from);
      filtered = filtered.filter((log) => new Date(log.created_at) >= fromDate);
    }

    if (filters?.date_to) {
      const toDate = new Date(filters.date_to);
      filtered = filtered.filter((log) => new Date(log.created_at) <= toDate);
    }

    // Apply sorting
    if (filters?.sort) {
      const sortKey = filters.sort as keyof AuditLog;
      const order = filters.order === 'desc' ? -1 : 1;

      filtered.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return aVal.localeCompare(bVal) * order;
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return (aVal - bVal) * order;
        }
        return 0;
      });
    } else {
      // Default sort by created_at desc
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    // Pagination
    const page = filters?.page || 1;
    const perPage = filters?.per_page || 20;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedData = filtered.slice(start, end);

    return {
      data: paginatedData,
      meta: {
        current_page: page,
        total: filtered.length,
        per_page: perPage,
        last_page: Math.ceil(filtered.length / perPage),
      },
    };
  },

  /**
   * Get single audit log
   */
  async getAuditLog(id: number): Promise<AuditLog> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const log = mockAuditLogs.find((l) => l.id === id);
    if (!log) {
      throw new Error('Audit log not found');
    }

    return log;
  },

  /**
   * Export audit logs (placeholder)
   */
  async exportAuditLogs(format: 'csv' | 'json', filters?: AuditFilters): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // In real implementation, this would return a download URL or file blob
    return `https://example.com/exports/audit-${format}-${Date.now()}.${format}`;
  },
};
