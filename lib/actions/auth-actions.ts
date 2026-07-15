'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { signIn, signOut } from '@/lib/api/endpoints/auth';
import type { SignInInput } from '@/lib/validation/auth.schema';
import { ApiException } from '@/lib/api/utils/error-handler';

export async function signInAction(credentials: SignInInput, locale: string) {
  try {
    const response = await signIn(credentials);
    
    if (response.success) {
      // The backend sets the httpOnly cookie automatically
      // Redirect to dashboard
      redirect(`/${locale}`);
    }
    
    return {
      success: false,
      message: 'auth.invalidCredentials',
    };
  } catch (error) {
    if (error instanceof ApiException) {
      return {
        success: false,
        message: error.code === 'AUTH_INVALID_CREDENTIALS' 
          ? 'auth.invalidCredentials' 
          : 'common.error',
        errors: error.errors,
      };
    }
    
    return {
      success: false,
      message: 'common.error',
    };
  }
}

export async function signOutAction(locale: string) {
  try {
    await signOut();
    
    // Clear any client-side cookies if needed
    const cookieStore = await cookies();
    // Note: httpOnly cookies are cleared by the backend
    
    redirect(`/${locale}/sign-in`);
  } catch (error) {
    // Even if the API call fails, redirect to sign-in
    redirect(`/${locale}/sign-in`);
  }
}
