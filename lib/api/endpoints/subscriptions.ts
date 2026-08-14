import { apiClient } from '../client';
import type {
  Subscription,
  SubscriptionDetail,
  SubscriptionFilters,
  PaginatedResponse,
} from '@/lib/types/subscription';

export const subscriptionsEndpoints = {
  /**
   * Get paginated list of subscriptions
   */
  async getSubscriptions(
    filters?: SubscriptionFilters
  ): Promise<PaginatedResponse<Subscription>> {
    const params = new URLSearchParams();

    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.plan_id) params.append('plan_id', filters.plan_id.toString());
    if (filters?.sort) params.append('sort', filters.sort);
    if (filters?.order) params.append('order', filters.order);

    // Backend returns: { success, message, data: Subscription[], meta: { pagination: {...} } }
    const response: any = await apiClient.get(
      `/api/v1/platform/billing/subscriptions?${params.toString()}`
    );

    return {
      data: response.data,
      meta: response.meta,
    };
  },

  /**
   * Get single subscription by ID
   */
  async getSubscription(id: number): Promise<SubscriptionDetail> {
    const response = await apiClient.get<SubscriptionDetail>(
      `/api/v1/platform/billing/subscriptions/${id}`
    );

    return response.data;
  },
};
