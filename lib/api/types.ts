// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  code: string;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'support_agent';
  status: 'active' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
}

// Request Parameter Types
export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface SearchParams {
  search?: string;
}

export interface SortParams {
  sort?: string;
  order?: 'asc' | 'desc';
}

export type QueryParams = PaginationParams & SearchParams & SortParams;
