// Dashboard Statistics Types

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    new_this_month: number;
    growth_percentage: number;
  };
  stores: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
  };
  revenue: {
    total: number;
    this_month: number;
    last_month: number;
    growth_percentage: number;
  };
  orders: {
    total: number;
    this_month: number;
    pending: number;
  };
}

// Chart Data Types

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface TimeSeriesData {
  data: ChartDataPoint[];
  period: string;
}

// Recent Activity Types

export interface RecentUser {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  created_at: string;
}

export interface RecentStore {
  id: number;
  name: string;
  owner: string;
  status: 'active' | 'pending' | 'suspended';
  created_at: string;
}

export interface RecentTransaction {
  id: number;
  store_name: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

export interface RecentActivity {
  users: RecentUser[];
  stores: RecentStore[];
  transactions: RecentTransaction[];
}

// Stat Card Types

export interface StatCardData {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  description?: string;
}
