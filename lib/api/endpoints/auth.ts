import { apiClient } from '../client';
import type { AuthResponse, User } from '../types';

export interface SignInCredentials {
  email: string;
  password: string;
}

/**
 * Sign in user
 */
export async function signIn(credentials: SignInCredentials) {
  return apiClient.post<AuthResponse>('/api/v1/users/auth/login', credentials);
}

/**
 * Sign out user
 */
export async function signOut() {
  return apiClient.post('/api/v1/users/auth/logout');
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  return apiClient.get<{ user: User }>('/api/v1/users/auth/me');
}
