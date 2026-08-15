import { apiClient } from '../client';
import type { PaginatedResponse } from '@/lib/types/user';
import type { FeatureFlag, FeatureFlagFilters } from '@/lib/types/feature-flag';

type FeatureFlagsListResponse = {
  success: boolean;
  data: FeatureFlag[];
  meta: PaginatedResponse<FeatureFlag>['meta'];
};

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
    const response = await apiClient.get<FeatureFlagsListResponse['data']>(
      `/api/v1/platform/features?${params.toString()}`
    ) as unknown as FeatureFlagsListResponse;

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
  async toggleFeatureFlag(
    name: string,
    value: boolean
  ): Promise<{ name: string; value: boolean; updated_at: string | null }> {
    const response = await apiClient.request<{ name: string; value: boolean; updated_at: string | null }>(
      `/api/v1/platform/features/${encodeURIComponent(name)}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ value }),
      }
    );

    return {
      name,
      value,
      updated_at: response.data.updated_at ?? new Date().toISOString(),
    };
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
    const response = await apiClient.request<FeatureFlag>(
      `/api/v1/platform/features/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
    
    return response.data;
  },

  /**
   * Delete feature flag
   */
  async deleteFeatureFlag(name: string): Promise<void> {
    await apiClient.delete(`/api/v1/platform/features/${encodeURIComponent(name)}`);
  },
};
