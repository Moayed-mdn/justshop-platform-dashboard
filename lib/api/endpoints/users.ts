import { apiClient } from '../client';
import type { User, UserDetail, PaginatedResponse, UserFilters } from '@/lib/types/user';

// Mock data generator
const generateMockUsers = (count: number): User[] => {
  const roles: User['role'][] = ['super_admin', 'merchant', 'user'];
  const statuses: User['status'][] = ['active', 'suspended', 'inactive'];
  const firstNames = ['John', 'Jane', 'Ahmed', 'Sarah', 'Mohamed', 'Fatima', 'Ali', 'Layla', 'Omar', 'Amira'];
  const lastNames = ['Smith', 'Johnson', 'Hassan', 'Williams', 'Brown', 'Jones', 'Garcia', 'Martinez', 'Davis', 'Rodriguez'];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
    email: `user${i + 1}@example.com`,
    avatar: i % 3 === 0 ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}` : undefined,
    role: roles[i % roles.length],
    status: statuses[i % statuses.length],
    email_verified: i % 4 !== 0,
    stores_count: Math.floor(Math.random() * 5),
    created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

const mockUsers = generateMockUsers(73);

export const usersEndpoints = {
  /**
   * Get paginated list of users
   */
  async getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredUsers = [...mockUsers];

    // Apply search filter
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply role filter
    if (filters?.role) {
      filteredUsers = filteredUsers.filter((user) => user.role === filters.role);
    }

    // Apply status filter
    if (filters?.status) {
      filteredUsers = filteredUsers.filter((user) => user.status === filters.status);
    }

    // Apply sorting
    if (filters?.sort) {
      const sortKey = filters.sort as keyof User;
      const order = filters.order === 'desc' ? -1 : 1;

      filteredUsers.sort((a, b) => {
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
    const paginatedData = filteredUsers.slice(start, end);

    return {
      data: paginatedData,
      meta: {
        current_page: page,
        total: filteredUsers.length,
        per_page: perPage,
        last_page: Math.ceil(filteredUsers.length / perPage),
      },
    };
  },

  /**
   * Get single user by ID
   */
  async getUser(id: number): Promise<UserDetail> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const user = mockUsers.find((u) => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      ...user,
      stats: {
        total_orders: Math.floor(Math.random() * 100),
        total_revenue: Math.floor(Math.random() * 50000),
        active_stores: user.stores_count,
        last_login: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      recent_activity: Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        action: ['login', 'order_created', 'store_updated', 'profile_updated'][i % 4],
        description: [
          'Logged in from Chrome on Windows',
          'Created order #12345',
          'Updated store settings',
          'Updated profile information',
        ][i % 4],
        created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      })),
      stores: Array.from({ length: user.stores_count }, (_, i) => ({
        id: i + 1,
        name: `Store ${i + 1}`,
        domain: `store${i + 1}.example.com`,
        status: ['active', 'pending', 'suspended'][i % 3],
        created_at: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      })),
    };
  },

  /**
   * Update user
   */
  async updateUser(id: number, data: Partial<User>): Promise<User> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const userIndex = mockUsers.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...data,
      updated_at: new Date().toISOString(),
    };

    return mockUsers[userIndex];
  },

  /**
   * Suspend user
   */
  async suspendUser(id: number): Promise<User> {
    return this.updateUser(id, { status: 'suspended' });
  },

  /**
   * Activate user
   */
  async activateUser(id: number): Promise<User> {
    return this.updateUser(id, { status: 'active' });
  },

  /**
   * Delete user
   */
  async deleteUser(id: number): Promise<void> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const userIndex = mockUsers.findIndex((u) => u.id === id);
    if (userIndex !== -1) {
      mockUsers.splice(userIndex, 1);
    }
  },
};
