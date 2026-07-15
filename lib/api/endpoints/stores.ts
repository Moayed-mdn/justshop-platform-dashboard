import { apiClient } from '../client';
import type { PaginatedResponse } from '@/lib/types/user';
import type { Store, StoreDetail, StoreFilters, StoreStatus, StoreOrder } from '@/lib/types/store';

// Mock data generator
const generateMockStores = (count: number): Store[] => {
  const statuses: StoreStatus[] = ['active', 'suspended', 'pending', 'inactive'];
  const storeNames = [
    'TechGear', 'Fashion Hub', 'Home Decor', 'Sports World', 'Book Haven',
    'Pet Paradise', 'Beauty Box', 'Toy Kingdom', 'Garden Center', 'Music Store',
    'Auto Parts', 'Kitchen Essentials', 'Gadget Galaxy', 'Jewelry Boutique', 'Shoe Palace',
    'Vintage Finds', 'Organic Market', 'Craft Corner', 'Gaming Zone', 'Fitness Pro',
  ];
  const themes = ['modern', 'classic', 'minimal', 'colorful', 'dark', 'light'];
  const firstNames = ['John', 'Jane', 'Ahmed', 'Sarah', 'Mohamed', 'Fatima', 'Ali', 'Layla'];
  const lastNames = ['Smith', 'Johnson', 'Hassan', 'Williams', 'Brown', 'Jones', 'Garcia', 'Martinez'];

  return Array.from({ length: count }, (_, i) => {
    const ownerFirstName = firstNames[i % firstNames.length];
    const ownerLastName = lastNames[i % lastNames.length];
    const storeName = `${storeNames[i % storeNames.length]} ${i > 19 ? i - 19 : ''}`.trim();
    const subdomain = storeName.toLowerCase().replace(/\s+/g, '-');

    return {
      id: i + 1,
      name: storeName,
      domain: `${subdomain}.mystore.com`,
      subdomain: subdomain,
      logo: i % 4 === 0 ? `https://api.dicebear.com/7.x/shapes/svg?seed=${i}` : undefined,
      status: statuses[i % statuses.length],
      owner_id: (i % 20) + 1,
      owner_name: `${ownerFirstName} ${ownerLastName}`,
      owner_email: `owner${(i % 20) + 1}@example.com`,
      owner_avatar: i % 3 === 0 ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}` : undefined,
      theme: themes[i % themes.length],
      products_count: Math.floor(Math.random() * 200) + 10,
      orders_count: Math.floor(Math.random() * 500) + 5,
      customers_count: Math.floor(Math.random() * 1000) + 20,
      created_at: new Date(Date.now() - Math.random() * 730 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
};

const mockStores = generateMockStores(56);

export const storesEndpoints = {
  /**
   * Get paginated list of stores
   */
  async getStores(filters?: StoreFilters): Promise<PaginatedResponse<Store>> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredStores = [...mockStores];

    // Apply search filter
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredStores = filteredStores.filter(
        (store) =>
          store.name.toLowerCase().includes(searchLower) ||
          store.domain.toLowerCase().includes(searchLower) ||
          store.owner_name.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters?.status) {
      filteredStores = filteredStores.filter((store) => store.status === filters.status);
    }

    // Apply owner filter
    if (filters?.owner_id) {
      filteredStores = filteredStores.filter((store) => store.owner_id === filters.owner_id);
    }

    // Apply sorting
    if (filters?.sort) {
      const sortKey = filters.sort as keyof Store;
      const order = filters.order === 'desc' ? -1 : 1;

      filteredStores.sort((a, b) => {
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
    }

    // Pagination
    const page = filters?.page || 1;
    const perPage = filters?.per_page || 20;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedData = filteredStores.slice(start, end);

    return {
      data: paginatedData,
      meta: {
        current_page: page,
        total: filteredStores.length,
        per_page: perPage,
        last_page: Math.ceil(filteredStores.length / perPage),
      },
    };
  },

  /**
   * Get single store by ID
   */
  async getStore(id: number): Promise<StoreDetail> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const store = mockStores.find((s) => s.id === id);
    if (!store) {
      throw new Error('Store not found');
    }

    // Generate mock orders
    const orderStatuses: StoreOrder['status'][] = ['pending', 'processing', 'completed', 'cancelled', 'refunded'];
    const customerNames = ['Alice Cooper', 'Bob Smith', 'Carol White', 'David Brown', 'Emma Wilson'];

    const recentOrders: StoreOrder[] = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      order_number: `ORD-${String(1000 + i).padStart(5, '0')}`,
      customer_name: customerNames[i % customerNames.length],
      customer_email: `customer${i + 1}@example.com`,
      amount: Math.floor(Math.random() * 500) + 20,
      status: orderStatuses[i % orderStatuses.length],
      items_count: Math.floor(Math.random() * 5) + 1,
      created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    }));

    return {
      ...store,
      stats: {
        total_orders: store.orders_count,
        total_revenue: Math.floor(Math.random() * 100000) + 10000,
        total_products: store.products_count,
        total_customers: store.customers_count,
        orders_this_month: Math.floor(Math.random() * 50) + 5,
        revenue_this_month: Math.floor(Math.random() * 10000) + 1000,
      },
      recent_orders: recentOrders,
      settings: {
        currency: ['USD', 'EUR', 'GBP', 'AED'][Math.floor(Math.random() * 4)],
        timezone: 'UTC',
        language: ['en', 'ar'][Math.floor(Math.random() * 2)],
        tax_enabled: Math.random() > 0.5,
        shipping_enabled: Math.random() > 0.3,
        email_notifications: Math.random() > 0.4,
      },
    };
  },

  /**
   * Update store
   */
  async updateStore(id: number, data: Partial<Store>): Promise<Store> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const storeIndex = mockStores.findIndex((s) => s.id === id);
    if (storeIndex === -1) {
      throw new Error('Store not found');
    }

    mockStores[storeIndex] = {
      ...mockStores[storeIndex],
      ...data,
      updated_at: new Date().toISOString(),
    };

    return mockStores[storeIndex];
  },

  /**
   * Suspend store
   */
  async suspendStore(id: number): Promise<Store> {
    return this.updateStore(id, { status: 'suspended' });
  },

  /**
   * Activate store
   */
  async activateStore(id: number): Promise<Store> {
    return this.updateStore(id, { status: 'active' });
  },

  /**
   * Delete store
   */
  async deleteStore(id: number): Promise<void> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const storeIndex = mockStores.findIndex((s) => s.id === id);
    if (storeIndex !== -1) {
      mockStores.splice(storeIndex, 1);
    }
  },
};
