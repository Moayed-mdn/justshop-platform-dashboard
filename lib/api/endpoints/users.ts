import { apiClient } from '../client';
import type { User, UserDetail, PaginatedResponse, UserFilters } from '@/lib/types/user';

export const usersEndpoints = {
  /**
   * Get paginated list of users
   */
  async getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.sort) params.append('sort', filters.sort);
    if (filters?.order) params.append('order', filters.order);

    // Backend returns: { success, data: User[], meta: {...} }
    const response: any = await apiClient.get(
      `/api/v1/platform/users?${params.toString()}`
    );

    return {
      data: response.data,
      meta: response.meta
    };
  },

  /**
   * Get single user by ID
   */
  async getUser(id: number): Promise<UserDetail> {
    const response = await apiClient.get<UserDetail>(
      `/api/v1/platform/users/${id}`
    );
    
    return response.data;
  },

  /**
   * Update user
   */
  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>(
      `/api/v1/platform/users/${id}`,
      data
    );
    
    return response.data;
  },

  /**
   * Suspend user
   */
  async suspendUser(id: number): Promise<User> {
    const response = await apiClient.request<{ success: boolean; message: string; data: User }>(
      `/api/v1/platform/users/${id}/suspend`,
      { method: 'PATCH' }
    );
    
    return response.data.data;
  },

  /**
   * Activate user
   */
  async activateUser(id: number): Promise<User> {
    const response = await apiClient.request<{ success: boolean; message: string; data: User }>(
      `/api/v1/platform/users/${id}/activate`,
      { method: 'PATCH' }
    );
    
    return response.data.data;
  },

  /**
   * Delete user
   */
  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/api/v1/platform/users/${id}`);
  },
};
