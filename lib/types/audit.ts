export type AuditAction = 
  | 'created' 
  | 'updated' 
  | 'deleted' 
  | 'suspended' 
  | 'activated' 
  | 'login' 
  | 'logout'
  | 'published'
  | 'archived'
  | 'exported';

export type ResourceType = 
  | 'user' 
  | 'store' 
  | 'blog_post' 
  | 'page' 
  | 'documentation'
  | 'system';

export interface AuditLog {
  id: number;
  user_id: number;
  user_name: string;
  user_avatar?: string;
  action: AuditAction;
  resource_type: ResourceType;
  resource_id?: number;
  resource_name?: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  changes?: {
    field: string;
    before: any;
    after: any;
  }[];
  created_at: string;
}

export interface AuditFilters {
  search?: string;
  user_id?: number;
  action?: AuditAction;
  resource_type?: ResourceType;
  date_from?: string;
  date_to?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}
