export type StoreStatus = 'active' | 'suspended' | 'pending' | 'inactive';

export interface StoreOwner {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export interface Store {
  id: number;
  name: string;
  domain: string;
  subdomain?: string;
  logo?: string;
  slug?: string;
  status: StoreStatus;
  owner: StoreOwner | null;
  theme?: string;
  products_count?: number;
  orders_count?: number;
  customers_count?: number;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreStats {
  total_orders: number;
  total_revenue: number;
  total_products: number;
  total_customers: number;
  orders_this_month: number;
  revenue_this_month: number;
}

export interface StoreSettings {
  currency: string;
  timezone: string;
  language: string;
  tax_enabled: boolean;
  shipping_enabled: boolean;
  email_notifications: boolean;
}

export interface StoreOrder {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  items_count: number;
  created_at: string;
}

export interface StoreDetail extends Store {
  stats: StoreStats;
  recent_orders: StoreOrder[];
  settings: StoreSettings;
}

export interface StoreFilters {
  search?: string;
  status?: StoreStatus;
  owner_id?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}
