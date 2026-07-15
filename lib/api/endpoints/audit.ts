import { apiClient } from '../client';
import type { PaginatedResponse } from '@/lib/types/user';
import type { AuditLog, AuditFilters } from '@/lib/types/audit';

export const auditEndpoints = {
  /**
   * Get audit logs
   */
  async getAuditLogs(filters?: AuditFilters): Promise<PaginatedResponse<AuditLog>> {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.user_id) params.append('user_id', filters.user_id.toString());
    if (filters?.action) params.append('action', filters.action);
    if (filters?.resource_type) params.append('resource_type', filters.resource_type);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.sort) params.append('sort', filters.sort);
    if (filters?.order) params.append('order', filters.order);

    const response = await apiClient.get<PaginatedResponse<AuditLog>>(
      `/api/v1/platform/audit-logs?${params.toString()}`
    );

    return response.data;
  },

  /**
   * Get single audit log
   */
  async getAuditLog(id: number): Promise<AuditLog> {
    const response = await apiClient.get<AuditLog>(
      `/api/v1/platform/audit-logs/${id}`
    );
    
    return response.data;
  },

  /**
   * Export audit logs (placeholder)
   */
  async exportAuditLogs(format: 'csv' | 'json', filters?: AuditFilters): Promise<string> {
    const params = new URLSearchParams();
    params.append('format', format);
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.user_id) params.append('user_id', filters.user_id.toString());
    if (filters?.action) params.append('action', filters.action);
    if (filters?.resource_type) params.append('resource_type', filters.resource_type);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);

    const response = await apiClient.post<{ download_url: string }>(
      '/api/v1/platform/audit-logs/export',
      Object.fromEntries(params)
    );
    
    return response.data.download_url;
  },
};
