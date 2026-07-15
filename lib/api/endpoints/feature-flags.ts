import { apiClient } from '../client';
import type { PaginatedResponse } from '@/lib/types/user';
import type { FeatureFlag, FeatureFlagFilters } from '@/lib/types/feature-flag';

export const featureFlagsEndpoints = {
  /**
   * Get feature flags
   */
  async getFeatureFlags(filters?: FeatureFlagFilters): Promise<PaginatedResponse<FeatureFlag>> {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.environment) params.append('environment', filters.environment);
    if (filters?.target_type) params.append('target_type', filters.target_type);

    // Backend returns: { success, data: FeatureFlag[], meta: {...} }
    const response: any = await apiClient.get(
      `/api/v1/platform/features?${params.toString()}`
    );

    return {
      data: response.data,
      meta: response.meta
    };
  },

  /**
   * Get single feature flag
   */
  async getFeatureFlag(id: number): Promise<FeatureFlag> {
    const response = await apiClient.get<FeatureFlag>(
      `/api/v1/platform/feature-flags/${id}`
    );
    
    return response.data;
  },

  /**
   * Toggle feature flag
   */
  async toggleFeatureFlag(id: number): Promise<FeatureFlag> {
    const response = await apiClient.post<FeatureFlag>(
      `/api/v1/platform/feature-flags/${id}/toggle`
    );
    
    return response.data;
  },

  /**
   * Create feature flag
   */
  async createFeatureFlag(data: Omit<FeatureFlag, 'id' | 'usage_count' | 'created_at' | 'updated_at'>): Promise<FeatureFlag> {
    const response = await apiClient.post<FeatureFlag>(
      '/api/v1/platform/feature-flags',
      data
    );
    
    return response.data;
  },

  /**
   * Update feature flag
   */
  async updateFeatureFlag(id: number, data: Partial<FeatureFlag>): Promise<FeatureFlag> {
    const response = await apiClient.put<FeatureFlag>(
      `/api/v1/platform/feature-flags/${id}`,
      data
    );
    
    return response.data;
  },

  /**
   * Delete feature flag
   */
  async deleteFeatureFlag(id: number): Promise<void> {
    await apiClient.delete(`/api/v1/platform/feature-flags/${id}`);
  },
};
