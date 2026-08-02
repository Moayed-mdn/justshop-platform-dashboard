import type { ApiResponse } from './types';
import { handleApiError } from './utils/error-handler';

export class ApiClient {
  private baseURL: string;
  private csrfToken: string | null = null;

  constructor(baseURL?: string) {
    // If baseURL is empty or not provided, use empty string (relative URLs through Next.js proxy)
    // Otherwise use the provided URL (e.g., http://localhost:8000 for direct backend access)
    this.baseURL = baseURL !== undefined ? baseURL : (process.env.NEXT_PUBLIC_API_URL || '');
  }

  /**
   * Get CSRF token from Laravel
   */
  private async getCsrfToken(): Promise<string> {
    if (this.csrfToken) {
      return this.csrfToken;
    }

    try {
      // Laravel Sanctum CSRF cookie endpoint (through Next.js proxy)
      await fetch(`${this.baseURL}/sanctum/csrf-cookie`, {
        credentials: 'include',
      });
      
      // Extract XSRF-TOKEN from cookies
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'XSRF-TOKEN') {
          this.csrfToken = decodeURIComponent(value);
          return this.csrfToken;
        }
      }
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
    }

    return '';
  }

  /**
   * Make an API request
   */
  async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    // Get CSRF token for state-changing methods
    const method = options?.method?.toUpperCase();
    let csrfToken = '';
    if (method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      csrfToken = await this.getCsrfToken();
    }

    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include', // Include httpOnly cookies
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(csrfToken && { 'X-XSRF-TOKEN': csrfToken }),
          ...options?.headers,
        },
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      // Re-throw ApiException
      if (error instanceof Error && error.name === 'ApiException') {
        throw error;
      }

      // Handle network errors
      throw new Error('Network error. Please check your connection.');
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();