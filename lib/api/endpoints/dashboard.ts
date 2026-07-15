import type { DashboardStats, TimeSeriesData, RecentActivity } from '@/lib/types/dashboard';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Fetch dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${BASE_URL}/api/v1/platform/dashboard/stats`, {
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Fetch user growth chart data
 */
export async function getUserGrowthData(period: string = '30d'): Promise<TimeSeriesData> {
  const response = await fetch(`${BASE_URL}/api/v1/platform/dashboard/charts/users?period=${period}`, {
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user growth data');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Fetch store growth chart data
 */
export async function getStoreGrowthData(period: string = '30d'): Promise<TimeSeriesData> {
  const response = await fetch(`${BASE_URL}/api/v1/platform/dashboard/charts/stores?period=${period}`, {
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch store growth data');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Fetch revenue chart data
 */
export async function getRevenueData(period: string = '12m'): Promise<TimeSeriesData> {
  const response = await fetch(`${BASE_URL}/api/v1/platform/dashboard/charts/revenue?period=${period}`, {
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch revenue data');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Fetch recent activity
 */
export async function getRecentActivity(limit: number = 10): Promise<RecentActivity> {
  const response = await fetch(`${BASE_URL}/api/v1/platform/dashboard/recent-activity?limit=${limit}`, {
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch recent activity');
  }

  const data = await response.json();
  return data.data;
}

/**
 * Generate mock data for development
 * Remove this once backend endpoints are ready
 */
export function getMockDashboardStats(): DashboardStats {
  return {
    users: {
      total: 1234,
      active: 980,
      new_this_month: 145,
      growth_percentage: 12.5,
    },
    stores: {
      total: 89,
      active: 67,
      pending: 12,
      suspended: 10,
    },
    revenue: {
      total: 125430.50,
      this_month: 23450.75,
      last_month: 19230.00,
      growth_percentage: 21.9,
    },
    orders: {
      total: 3456,
      this_month: 567,
      pending: 23,
    },
  };
}

export function getMockUserGrowth(): TimeSeriesData {
  const data = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 50) + 20,
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }
  
  return {
    data,
    period: '30d',
  };
}

export function getMockRevenueData(): TimeSeriesData {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const data = months.map((month, i) => ({
    date: `2024-${String(i + 1).padStart(2, '0')}-01`,
    value: Math.floor(Math.random() * 30000) + 10000,
    label: month,
  }));
  
  return {
    data,
    period: '12m',
  };
}
