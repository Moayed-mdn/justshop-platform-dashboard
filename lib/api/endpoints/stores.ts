import { apiClient } from '../client';
import type { PaginatedResponse } from '@/lib/types/user';
import type { Store, StoreDetail, StoreFilters } from '@/lib/types/store';

export const storesEndpoints = {
  /**
   * Get paginated list of stores
   */
  async getStores(filters?: StoreFilters): Promise<PaginatedResponse<Store>> {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.owner_id) params.append('owner_id', filters.owner_id.toString());
    if (filters?.sort) params.append('sort', filters.sort);
    if (filters?.order) params.append('order', filters.order);

    // Backend returns: { success, data: Store[], meta: {...} }
    const response: any = await apiClient.get(
      `/api/v1/platform/stores?${params.toString()}`
    );

    return {
      data: response.data,
      meta: response.meta
    };
  },

  /**
   * Get single store by ID
   */
  async getStore(id: number): Promise<StoreDetail> {
    const response = await apiClient.get<StoreDetail>(
      `/api/v1/platform/stores/${id}`
    );
    
    return response.data;
  },

  /**
   * Update store
   */
  async updateStore(id: number, data: Partial<Store>): Promise<Store> {
    const response = await apiClient.put<Store>(
      `/api/v1/platform/stores/${id}`,
      data
    );
    
    return response.data;
  },

  /**
   * Suspend store
   */
  async suspendStore(id: number): Promise<Store> {
    const response = await apiClient.post<Store>(
      `/api/v1/platform/stores/${id}/suspend`
    );
    
    return response.data;
  },

  /**
   * Activate store
   */
  async activateStore(id: number): Promise<Store> {
    const response = await apiClient.post<Store>(
      `/api/v1/platform/stores/${id}/activate`
    );
    
    return response.data;
  },

  /**
   * Delete store
   */
  async deleteStore(id: number): Promise<void> {
    await apiClient.delete(`/api/v1/platform/stores/${id}`);
  },
};
