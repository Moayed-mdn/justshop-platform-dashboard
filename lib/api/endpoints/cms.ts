import { apiClient } from '../client';
import type { PaginatedResponse } from '@/lib/types/user';
import type { 
  BlogPost, 
  Page, 
  Documentation, 
  CMSStats, 
  ContentFilters
} from '@/lib/types/cms';

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
    const response: any = await apiClient.get(
      `/api/v1/platform/cms/blog?${params.toString()}`
    );

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

    // Backend returns: { success, data: Page[], meta: {...} }
    const response: any = await apiClient.get(
      `/api/v1/platform/cms/pages?${params.toString()}`
    );

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
    const response: any = await apiClient.get(
      `/api/v1/platform/cms/docs?${params.toString()}`
    );

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
