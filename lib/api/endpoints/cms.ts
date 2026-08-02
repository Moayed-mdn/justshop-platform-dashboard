import { apiClient } from '../client';
import type { PaginatedResponse } from '@/lib/types/user';
import type { 
  BlogPost, 
  Page, 
  Documentation, 
  CMSStats, 
  ContentFilters
} from '@/lib/types/cms';

type PaginatedApiListResponse<T> = {
  data: T[];
  meta: PaginatedResponse<T>['meta'];
};

export const cmsEndpoints = {
  /**
   * Get CMS statistics
   */
  async getStats(): Promise<CMSStats> {
    const response = await apiClient.get<CMSStats>(
      '/api/v1/platform/cms/stats'
    );
    
    return response.data;
  },

  /**
   * Get blog posts
   */
  async getBlogPosts(filters?: ContentFilters): Promise<PaginatedResponse<BlogPost>> {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);

    // Backend returns: { success, data: BlogPost[], meta: {...} }
    const response = (await apiClient.get<BlogPost[]>(
      `/api/v1/platform/cms/blog?${params.toString()}`
    )) as unknown as PaginatedApiListResponse<BlogPost>;

    return {
      data: response.data,
      meta: response.meta
    };
  },

  /**
   * Get single blog post
   */
  async getBlogPost(id: number): Promise<BlogPost> {
    const response = await apiClient.get<BlogPost>(
      `/api/v1/platform/cms/blog/${id}`
    );
    
    return response.data;
  },

  /**
   * Get pages
   */
  async getPages(filters?: ContentFilters): Promise<PaginatedResponse<Page>> {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);

    // Backend returns: { success, data: Page[], meta: {...} }
    const response = (await apiClient.get<Page[]>(
      `/api/v1/platform/cms/pages?${params.toString()}`
    )) as unknown as PaginatedApiListResponse<Page>;

    return {
      data: response.data,
      meta: response.meta
    };
  },

  /**
   * Get documentation
   */
  async getDocs(filters?: ContentFilters): Promise<PaginatedResponse<Documentation>> {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);

    // Backend returns: { success, data: Documentation[], meta: {...} }
    const response = (await apiClient.get<Documentation[]>(
      `/api/v1/platform/cms/docs?${params.toString()}`
    )) as unknown as PaginatedApiListResponse<Documentation>;

    return {
      data: response.data,
      meta: response.meta
    };
  },

  /**
   * Delete blog post
   */
  async deleteBlogPost(id: number): Promise<void> {
    await apiClient.delete(`/api/v1/platform/cms/blog/${id}`);
  },

  /**
   * Get single page
   */
  async getPage(id: number): Promise<Page> {
    const response = await apiClient.get<{ data: Page }>(
      `/api/v1/platform/cms/pages/${id}`
    );
    return response.data.data;
  },

  /**
   * Create a new page
   */
  async createPage(payload: CreatePagePayload): Promise<Page> {
    const response = await apiClient.post<{ data: Page }>(
      '/api/v1/platform/cms/pages',
      payload
    );
    return response.data.data;
  },

  /**
   * Update page
   */
  async updatePage(id: number, payload: UpdatePagePayload): Promise<Page> {
    const response = await apiClient.put<{ data: Page }>(
      `/api/v1/platform/cms/pages/${id}`,
      payload
    );
    return response.data.data;
  },

  /**
   * Publish page
   */
  async publishPage(id: number): Promise<Page> {
    const response = await apiClient.post<{ data: Page }>(
      `/api/v1/platform/cms/pages/${id}/publish`
    );
    return response.data.data;
  },

  /**
   * Delete page
   */
  async deletePage(id: number): Promise<void> {
    await apiClient.delete(`/api/v1/platform/cms/pages/${id}`);
  },

  /**
   * Delete documentation
   */
  async deleteDoc(id: number): Promise<void> {
    await apiClient.delete(`/api/v1/platform/cms/docs/${id}`);
  },
};

// Payload types for create/update operations
export interface CreatePagePayload {
  type?: string;
  title: Record<string, string>;
  slug: Record<string, string>;
  excerpt?: Record<string, string>;
  content: Record<string, string>;
  status: 'draft' | 'scheduled' | 'published';
  published_at?: string;
  seo?: Record<string, unknown>;
  template?: string;
  sort_order?: number;
}

export interface UpdatePagePayload extends Partial<CreatePagePayload> {
  title: Record<string, string>;
  slug: Record<string, string>;
  content: Record<string, string>;
  status: 'draft' | 'scheduled' | 'published';
}
