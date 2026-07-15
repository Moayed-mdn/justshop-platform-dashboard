import { apiClient } from '../client';
import type { PaginatedResponse } from '@/lib/types/user';
import type { FeatureFlag, FeatureFlagFilters, TargetType, Environment } from '@/lib/types/feature-flag';

// Mock data generator
const generateMockFeatureFlags = (count: number): FeatureFlag[] => {
  const targetTypes: TargetType[] = ['all', 'percentage', 'users', 'stores'];
  const environments: Environment[] = ['all', 'production', 'staging', 'development'];
  const creators = ['Super Admin', 'John Doe', 'Jane Smith'];
  
  const features = [
    { name: 'New Dashboard', key: 'new-dashboard', desc: 'Redesigned dashboard with improved analytics' },
    { name: 'Beta Checkout', key: 'beta-checkout', desc: 'New checkout flow with one-click payment' },
    { name: 'AI Product Recommendations', key: 'ai-recommendations', desc: 'ML-powered product suggestions' },
    { name: 'Dark Mode', key: 'dark-mode', desc: 'Dark theme for the entire platform' },
    { name: 'Advanced Analytics', key: 'advanced-analytics', desc: 'Detailed metrics and reports' },
    { name: 'Social Login', key: 'social-login', desc: 'Login with Google, Facebook, Twitter' },
    { name: 'Live Chat Support', key: 'live-chat', desc: 'Real-time customer support chat' },
    { name: 'Multi-currency', key: 'multi-currency', desc: 'Support for multiple currencies' },
    { name: 'Store Themes', key: 'store-themes', desc: 'Customizable store themes' },
    { name: 'Email Marketing', key: 'email-marketing', desc: 'Built-in email campaigns' },
    { name: 'Inventory Management', key: 'inventory-mgmt', desc: 'Advanced inventory tracking' },
    { name: 'Loyalty Program', key: 'loyalty-program', desc: 'Customer rewards and points' },
    { name: 'Gift Cards', key: 'gift-cards', desc: 'Digital gift card support' },
    { name: 'Subscription Billing', key: 'subscriptions', desc: 'Recurring payment support' },
    { name: 'Wholesale Mode', key: 'wholesale-mode', desc: 'B2B wholesale features' },
    { name: 'Product Reviews', key: 'product-reviews', desc: 'Customer reviews and ratings' },
    { name: 'Wishlist', key: 'wishlist', desc: 'Save products for later' },
    { name: 'Compare Products', key: 'compare-products', desc: 'Side-by-side product comparison' },
    { name: 'Quick View', key: 'quick-view', desc: 'Preview products without page load' },
    { name: 'Advanced Search', key: 'advanced-search', desc: 'Filters and faceted search' },
  ];

  return Array.from({ length: count }, (_, i) => {
    const feature = features[i % features.length];
    const targetType = targetTypes[i % targetTypes.length];
    let targetValue: string | number | undefined;

    if (targetType === 'percentage') {
      targetValue = [25, 50, 75, 100][i % 4];
    } else if (targetType === 'users') {
      targetValue = '1,5,12,25';
    } else if (targetType === 'stores') {
      targetValue = '3,7,15';
    }

    return {
      id: i + 1,
      name: feature.name,
      key: feature.key + (i >= features.length ? `-${Math.floor(i / features.length)}` : ''),
      description: feature.desc,
      enabled: i % 3 !== 0, // ~66% enabled
      target_type: targetType,
      target_value: targetValue,
      environment: environments[i % environments.length],
      usage_count: Math.floor(Math.random() * 10000) + 100,
      created_by: creators[i % creators.length],
      created_at: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
};

let mockFeatureFlags = generateMockFeatureFlags(24);

export const featureFlagsEndpoints = {
  /**
   * Get feature flags
   */
  async getFeatureFlags(filters?: FeatureFlagFilters): Promise<PaginatedResponse<FeatureFlag>> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filtered = [...mockFeatureFlags];

    // Apply search filter
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (flag) =>
          flag.name.toLowerCase().includes(searchLower) ||
          flag.key.toLowerCase().includes(searchLower) ||
          flag.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters?.status) {
      const enabled = filters.status === 'enabled';
      filtered = filtered.filter((flag) => flag.enabled === enabled);
    }

    // Apply environment filter
    if (filters?.environment && filters.environment !== 'all') {
      filtered = filtered.filter((flag) => flag.environment === filters.environment || flag.environment === 'all');
    }

    // Apply target type filter
    if (filters?.target_type) {
      filtered = filtered.filter((flag) => flag.target_type === filters.target_type);
    }

    // Sort by name
    filtered.sort((a, b) => a.name.localeCompare(b.name));

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
   * Get single feature flag
   */
  async getFeatureFlag(id: number): Promise<FeatureFlag> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const flag = mockFeatureFlags.find((f) => f.id === id);
    if (!flag) {
      throw new Error('Feature flag not found');
    }

    return flag;
  },

  /**
   * Toggle feature flag
   */
  async toggleFeatureFlag(id: number): Promise<FeatureFlag> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const flagIndex = mockFeatureFlags.findIndex((f) => f.id === id);
    if (flagIndex === -1) {
      throw new Error('Feature flag not found');
    }

    mockFeatureFlags[flagIndex] = {
      ...mockFeatureFlags[flagIndex],
      enabled: !mockFeatureFlags[flagIndex].enabled,
      updated_at: new Date().toISOString(),
    };

    return mockFeatureFlags[flagIndex];
  },

  /**
   * Create feature flag
   */
  async createFeatureFlag(data: Omit<FeatureFlag, 'id' | 'usage_count' | 'created_at' | 'updated_at'>): Promise<FeatureFlag> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const newFlag: FeatureFlag = {
      ...data,
      id: mockFeatureFlags.length + 1,
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockFeatureFlags.push(newFlag);
    return newFlag;
  },

  /**
   * Update feature flag
   */
  async updateFeatureFlag(id: number, data: Partial<FeatureFlag>): Promise<FeatureFlag> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const flagIndex = mockFeatureFlags.findIndex((f) => f.id === id);
    if (flagIndex === -1) {
      throw new Error('Feature flag not found');
    }

    mockFeatureFlags[flagIndex] = {
      ...mockFeatureFlags[flagIndex],
      ...data,
      updated_at: new Date().toISOString(),
    };

    return mockFeatureFlags[flagIndex];
  },

  /**
   * Delete feature flag
   */
  async deleteFeatureFlag(id: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const flagIndex = mockFeatureFlags.findIndex((f) => f.id === id);
    if (flagIndex !== -1) {
      mockFeatureFlags.splice(flagIndex, 1);
    }
  },
};
