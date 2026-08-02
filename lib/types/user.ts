export type UserRole = 'super_admin' | 'store_admin' | 'staff' | 'customer';
export type UserStatus = 'active' | 'suspended' | 'inactive';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole | null; // Backend returns null when role is not set
  status: UserStatus;
  email_verified: boolean;
  stores_count: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface UserStats {
  total_orders?: number;
  total_revenue?: number;
  active_stores?: number;
  last_login?: string | null;
}

export interface UserDetail extends User {
  stats?: UserStats;
  recent_activity?: {
    id: number;
    action: string;
    description: string;
    created_at: string;
  }[];
  stores?: {
    id: number;
    name: string;
    domain: string;
    status: string;
    created_at: string;
  }[];
  last_login_at?: string | null;
  orders_count?: number;
}
