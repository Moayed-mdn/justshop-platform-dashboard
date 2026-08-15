import type { DashboardStats, TimeSeriesData, RecentActivity } from '@/lib/types/dashboard';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Backend Response Types
 */
interface BackendDashboardResponse {
  success: boolean;
  data: {
    totalUsers: number;
    activeUsers: number;
    totalStores: number;
    activeStores: number;
    pendingStores: number;
    suspendedStores: number;
    totalRevenue: number;
    revenueThisMonth: number;
    totalLeads: number;
    totalOrders: number;
    ordersThisMonth: number;
    pendingOrders: number;
    usersTrend: {
      change: number;
      direction: 'up' | 'down' | 'neutral';
    };
    storesTrend: {
      change: number;
      direction: 'up' | 'down' | 'neutral';
    };
    revenueTrend: {
      change: number;
      direction: 'up' | 'down' | 'neutral';
    };
    ordersTrend: {
      change: number;
      direction: 'up' | 'down' | 'neutral';
    };
    leadsTrend: {
      change: number;
      direction: 'up' | 'down' | 'neutral';
    };
    // New subscription fields (camelCase as per backend)
    totalSubscriptions?: number;
    activeSubscriptions?: number;
    trialingSubscriptions?: number;
    pastDueSubscriptions?: number;
    canceledSubscriptions?: number;
    subscriptionsThisMonth?: number;
    subscriptionsTrend?: {
      change: number;
      direction: 'up' | 'down' | 'neutral';
    };
    totalSubscriptionRevenue?: number;
    subscriptionRevenueThisMonth?: number;
    subscriptionRevenueTrend?: {
      change: number;
      direction: 'up' | 'down' | 'neutral';
    };
  };
}

interface BackendAnalyticsResponse {
  success: boolean;
  data: {
    summary: {
      total_revenue: number;
      total_orders: number;
      total_users: number;
      total_stores: number;
    };
    charts: {
      revenue_trend: Array<{ date: string; value: number }>;
      orders_trend: Array<{ date: string; value: number }>;
      users_trend: Array<{ date: string; value: number }>;
      stores_trend: Array<{ date: string; value: number }>;
    };
    top_stores: Array<{ name: string; revenue: number }>;
    recent_activity: Array<any>;
  };
}

/**
 * Fetch dashboard statistics
 * Maps backend response to frontend DashboardStats type
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${BASE_URL}/api/v1/platform/dashboard`, {
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }

  const result: BackendDashboardResponse = await response.json();
  const data = result.data;

  // Map backend response to frontend type
  return {
    users: {
      total: data.totalUsers,
      active: data.activeUsers,
      new_this_month: 0, // Can be calculated as usersThisMonth if backend provides it
      growth_percentage: data.usersTrend.direction === 'up' ? data.usersTrend.change : -data.usersTrend.change,
    },
    stores: {
      total: data.totalStores,
      active: data.activeStores,
      pending: data.pendingStores,
      suspended: data.suspendedStores,
    },
    revenue: {
      total: data.totalRevenue,
      this_month: data.revenueThisMonth,
      last_month: 0, // Backend doesn't track this separately yet
      growth_percentage: data.revenueTrend.direction === 'up' ? data.revenueTrend.change : -data.revenueTrend.change,
    },
    orders: {
      total: data.totalOrders,
      this_month: data.ordersThisMonth,
      pending: data.pendingOrders,
      growth_percentage: data.ordersTrend.direction === 'up' ? data.ordersTrend.change : -data.ordersTrend.change,
    },
    // Map new subscription fields if present
    subscriptions: data.totalSubscriptions !== undefined ? {
      total: data.totalSubscriptions,
      active: data.activeSubscriptions || 0,
      trialing: data.trialingSubscriptions || 0,
      past_due: data.pastDueSubscriptions || 0,
      canceled: data.canceledSubscriptions || 0,
      this_month: data.subscriptionsThisMonth || 0,
      trend: data.subscriptionsTrend || { change: 0, direction: 'neutral' },
    } : undefined,
    subscription_revenue: data.totalSubscriptionRevenue !== undefined ? {
      total: data.totalSubscriptionRevenue,
      this_month: data.subscriptionRevenueThisMonth || 0,
      trend: data.subscriptionRevenueTrend || { change: 0, direction: 'neutral' },
    } : undefined,
  };
}

/**
 * Fetch analytics data (includes all chart data)
 * Backend combines all analytics into a single endpoint
 */
export async function getAnalyticsData(): Promise<BackendAnalyticsResponse['data']> {
  const response = await fetch(`${BASE_URL}/api/v1/platform/analytics`, {
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch analytics data');
  }

  const result: BackendAnalyticsResponse = await response.json();
  return result.data;
}

/**
 * Fetch user growth chart data
 */
export async function getUserGrowthData(period: string = '30d'): Promise<TimeSeriesData> {
  const analytics = await getAnalyticsData();
  
  return {
    data: (analytics.charts.users_trend || []).map(item => ({
      date: item.date,
      value: item.value,
      label: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    })),
    period,
  };
}

/**
 * Fetch store growth chart data
 */
export async function getStoreGrowthData(period: string = '30d'): Promise<TimeSeriesData> {
  const analytics = await getAnalyticsData();
  
  return {
    data: (analytics.charts.stores_trend || []).map(item => ({
      date: item.date,
      value: item.value,
      label: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    })),
    period,
  };
}

/**
 * Fetch revenue chart data
 */
export async function getRevenueData(period: string = '12m'): Promise<TimeSeriesData> {
  const analytics = await getAnalyticsData();
  
  return {
    data: (analytics.charts.revenue_trend || []).map(item => ({
      date: item.date,
      value: item.value,
      label: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    })),
    period,
  };
}

/**
 * Fetch recent activity
 * Note: Backend doesn't implement this endpoint yet
 */
export async function getRecentActivity(limit: number = 10): Promise<RecentActivity> {
  // Backend endpoint not implemented yet
  // Return empty data structure
  return {
    users: [],
    stores: [],
    transactions: [],
  };
}


