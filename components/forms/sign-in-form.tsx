'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { signInSchema, type SignInInput } from '@/lib/validation/auth.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function SignInForm() {
  const t = useTranslations();
  const locale = useLocale();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInInput) => {
    setIsSubmitting(true);
    
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      console.log('[SignIn] Step 1: Getting CSRF cookie...');
      
      // Step 1: Get CSRF cookie
      await fetch(`${baseURL}/sanctum/csrf-cookie`, {
        method: 'GET',
        credentials: 'include',
      });
      
      // Step 2: Get the XSRF-TOKEN from cookies
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
          return parts.pop()?.split(';').shift();
        }
        return null;
      };
      
      const xsrfToken = getCookie('XSRF-TOKEN');
      console.log('[SignIn] Step 2: XSRF Token found:', !!xsrfToken);
      
      if (!xsrfToken) {
        toast.error(t('common.error'));
        setIsSubmitting(false);
        return;
      }
      
      // Decode the token
      const decodedToken = decodeURIComponent(xsrfToken);
      
      console.log('[SignIn] Step 3: Attempting login...');
      
      // Step 3: Login with XSRF token
      const response = await fetch(`${baseURL}/api/v1/platform/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': decodedToken,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      console.log('[SignIn] Step 4: Response:', { status: response.status, success: result.success });
      
      if (!result.success) {
        // Show user-friendly error
        const message = result.code === 'AUTH_INVALID_CREDENTIALS'
          ? 'auth.invalidCredentials'
          : 'common.error';
        toast.error(t(message));
        setIsSubmitting(false);
      } else {
        // Successful login - reload page to apply cookies
        console.log('[SignIn] Login successful! Redirecting...');
        toast.success(t('auth.signInSuccess'));
        
        // Small delay to show success message
        setTimeout(() => {
          window.location.href = `/${locale}`;
        }, 500);
      }
    } catch (error) {
      console.error('[SignIn Error]:', error);
      toast.error(t('common.error'));
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">{t('auth.email')}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          disabled={isSubmitting}
          {...register('email')}
          className={errors.email ? 'border-destructive' : ''}
        />
        {errors.email && (
          <p className="text-sm text-destructive">
            {t(errors.email.message as any)}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t('auth.password')}</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            disabled={isSubmitting}
            {...register('password')}
            className={errors.password ? 'border-destructive' : ''}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 rtl:left-0 rtl:right-auto h-full px-3 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isSubmitting}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="sr-only">
              {showPassword ? 'Hide password' : 'Show password'}
            </span>
          </Button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">
            {t(errors.password.message as any)}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('auth.signingIn')}
          </>
        ) : (
          t('auth.signIn')
        )}
      </Button>
    </form>
  );
}
