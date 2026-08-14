import { apiClient } from '../client';
import type {
  Plan,
  PlanDetail,
  PlanFilters,
  CreatePlanData,
  UpdatePlanData,
  UpdatePlanResponse,
  CreatePriceData,
  PlanPrice,
  MigrateSubscribersData,
  MigrationResult,
} from '@/lib/types/plan';
import type { PaginatedResponse } from '@/lib/types/user';

export const plansEndpoints = {
  /**
   * Get paginated list of plans
   */
  async getPlans(filters?: PlanFilters): Promise<PaginatedResponse<Plan>> {
    const params = new URLSearchParams();

    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.tier) params.append('tier', filters.tier);
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active ? '1' : '0');
    if (filters?.is_public !== undefined) params.append('is_public', filters.is_public ? '1' : '0');
    if (filters?.include_archived) params.append('include_archived', '1');
    if (filters?.sort) params.append('sort', filters.sort);
    if (filters?.order) params.append('order', filters.order);

    const response: any = await apiClient.get(
      `/api/v1/platform/billing/plans?${params.toString()}`
    );

    return {
      data: response.data,
      meta: response.meta,
    };
  },

  /**
   * Get single plan by ID
   */
  async getPlan(id: number): Promise<PlanDetail> {
    const response: any = await apiClient.get(
      `/api/v1/platform/billing/plans/${id}`
    );

    // Merge meta fields into data for PlanDetail
    return {
      ...response.data,
      ...(response.meta || {}),
    };
  },

  /**
   * Create new plan
   */
  async createPlan(data: CreatePlanData): Promise<Plan> {
    const response = await apiClient.post<Plan>(
      `/api/v1/platform/billing/plans`,
      data
    );

    return response.data;
  },

  /**
   * Update plan (may return new ID if versioned)
   */
  async updatePlan(id: number, data: UpdatePlanData): Promise<UpdatePlanResponse> {
    const response: any = await apiClient.put(
      `/api/v1/platform/billing/plans/${id}`,
      data
    );

    return {
      data: response.data,
      message: response.message,
      meta: response.meta,
    };
  },

  /**
   * Archive plan
   */
  async archivePlan(id: number): Promise<Plan> {
    const response = await apiClient.request<{ success: boolean; message: string; data: Plan }>(
      `/api/v1/platform/billing/plans/${id}/archive`,
      { method: 'PATCH' }
    );

    return response.data.data;
  },

  /**
   * Delete plan (only if never used)
   */
  async deletePlan(id: number): Promise<void> {
    await apiClient.delete(`/api/v1/platform/billing/plans/${id}`);
  },

  /**
   * Create or update price for a plan
   */
  async createPrice(planId: number, data: CreatePriceData): Promise<PlanPrice> {
    const response = await apiClient.post<PlanPrice>(
      `/api/v1/platform/billing/plans/${planId}/prices`,
      data
    );

    return response.data;
  },

  /**
   * Archive a price
   */
  async archivePrice(planId: number, priceId: number): Promise<void> {
    await apiClient.request(
      `/api/v1/platform/billing/plans/${planId}/prices/${priceId}/archive`,
      { method: 'PATCH' }
    );
  },

  /**
   * Migrate subscribers between plans
   */
  async migrateSubscribers(data: MigrateSubscribersData): Promise<MigrationResult> {
    const response = await apiClient.post<MigrationResult>(
      `/api/v1/platform/billing/plans/migrate-subscribers`,
      data
    );

    return response.data;
  },
};
