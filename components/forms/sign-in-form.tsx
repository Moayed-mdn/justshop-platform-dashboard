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
      const csrfResponse = await fetch('/api/sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'include',
      });

      if (!csrfResponse.ok) {
        toast.error(t('common.error'));
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        const message = result.code === 'AUTH_INVALID_CREDENTIALS' || result.code === 'AUTH_001'
          ? 'auth.invalidCredentials'
          : (result.message || 'common.error');
        toast.error(t(message));
        setIsSubmitting(false);
      } else {
        toast.success(t('auth.signInSuccess'));

        setTimeout(() => {
          window.location.href = `/${locale}`;
        }, 500);
      }
    } catch (error) {
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
          value='super@test.com'
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
            value='password'
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
