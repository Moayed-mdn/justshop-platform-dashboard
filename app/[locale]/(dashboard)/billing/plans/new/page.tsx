'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { plansEndpoints } from '@/lib/api/endpoints/plans';
import type {
  CreatePlanData,
  LocalizedString,
  PlanTier,
  FeatureKey,
  BillingCycle,
  CreatePriceData,
} from '@/lib/types/plan';
import { FEATURE_METADATA, TIER_METADATA, PLAN_ERROR_CODES } from '@/lib/types/plan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LocalizedInput } from '@/components/plan/LocalizedInput';
import { MoneyInput } from '@/components/plan/MoneyInput';
import { LimitInput } from '@/components/plan/LimitInput';
import { Separator } from '@/components/ui/separator';

export default function CreatePlanPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('plans');
  const tCommon = useTranslations('common');

  // Form state
  const [code, setCode] = React.useState('');
  const [name, setName] = React.useState<LocalizedString>({ en: '', ar: '' });
  const [description, setDescription] = React.useState<LocalizedString>({ en: '', ar: '' });
  const [tier, setTier] = React.useState<PlanTier>('starter');
  const [tierRank, setTierRank] = React.useState(1);
  const [isPublic, setIsPublic] = React.useState(true);
  const [isActive, setIsActive] = React.useState(true);
  const [trialDays, setTrialDays] = React.useState(14);
  const [sortOrder, setSortOrder] = React.useState(100);

  // Features state (all 8 features) - using null for unlimited
  const [features, setFeatures] = React.useState<Record<FeatureKey, { type: string; value: number | boolean | null }>>(() => {
    const initial: any = {};
    FEATURE_METADATA.forEach((fm) => {
      initial[fm.key] = {
        type: fm.type,
        value: fm.defaultValue ?? (fm.type === 'boolean' ? false : 1),
      };
    });
    return initial;
  });

  // Prices state
  const [prices, setPrices] = React.useState<CreatePriceData[]>([
    { billing_cycle: 'monthly', currency: 'USD', amount_cents: 0 },
  ]);

  // Handle tier change
  const handleTierChange = (newTier: PlanTier) => {
    setTier(newTier);
    const tierMeta = TIER_METADATA.find((t) => t.value === newTier);
    if (tierMeta) {
      setTierRank(tierMeta.rank);
    }
  };

  // Handle feature change
  const handleFeatureChange = (key: FeatureKey, value: number | boolean | null) => {
    setFeatures((prev) => ({
      ...prev,
      [key]: { ...prev[key], value },
    }));
  };

  // Handle add price
  const handleAddPrice = () => {
    setPrices((prev) => [
      ...prev,
      { billing_cycle: 'monthly', currency: 'USD', amount_cents: 0 },
    ]);
  };

  // Handle remove price
  const handleRemovePrice = (index: number) => {
    setPrices((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle price change
  const handlePriceChange = (
    index: number,
    field: keyof CreatePriceData,
    value: any
  ) => {
    setPrices((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreatePlanData) => plansEndpoints.createPlan(data),
    onSuccess: (plan) => {
      toast.success(t('createSuccess'));
      router.push(`/${locale}/billing/plans/${plan.id}`);
    },
    onError: (error: any) => {
      console.error('Failed to create plan:', error);
      const errorCode = error?.code;
      const errorMessage = errorCode && PLAN_ERROR_CODES[errorCode as keyof typeof PLAN_ERROR_CODES]
        ? PLAN_ERROR_CODES[errorCode as keyof typeof PLAN_ERROR_CODES]
        : t('createSuccess');
      toast.error(errorMessage);
    },
  });

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!code.trim()) {
      toast.error(t('planCodeRequired'));
      return;
    }
    if (!name.en.trim()) {
      toast.error(t('planNameEnRequired'));
      return;
    }

    // Build features array
    const featuresArray = FEATURE_METADATA.map((fm) => {
      const feature = features[fm.key];
      if (fm.type === 'boolean') {
        return {
          feature_key: fm.key,
          value_type: 'boolean',
          boolean_value: feature.value as boolean,
        };
      } else {
        // Limit type
        const limitValue = feature.value as number | null;
        if (limitValue === null) {
          // Unlimited - use value_type 'unlimited' with null limit_value
          return {
            feature_key: fm.key,
            value_type: 'unlimited',
            limit_value: null,
          };
        } else {
          // Limited - use value_type 'limit' with numeric value
          return {
            feature_key: fm.key,
            value_type: 'limit',
            limit_value: limitValue,
          };
        }
      }
    });

    const data: CreatePlanData = {
      code: code.trim(),
      name,
      description: description.en || description.ar ? description : null,
      tier,
      tier_rank: tierRank,
      is_public: isPublic,
      is_active: isActive,
      trial_days: trialDays,
      sort_order: sortOrder,
      features: featuresArray as any,
      prices: prices.filter((p) => p.amount_cents > 0),
    };

    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${locale}/billing/plans`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{t('createNewPlan')}</h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('basicInformation')}</CardTitle>
            <CardDescription>
              {t('planInformation')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="code">
                  {t('planCode')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={t('enterPlanCode')}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('planCodeHelper')}
                </p>
              </div>

              <div>
                <Label htmlFor="tier">
                  {t('tier')} <span className="text-destructive">*</span>
                </Label>
                <Select value={tier} onValueChange={(v) => handleTierChange(v as PlanTier)}>
                  <SelectTrigger id="tier">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIER_METADATA.map((tm) => (
                      <SelectItem key={tm.value} value={tm.value}>
                        {t(tm.value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="tier-rank">
                  {t('tierRank')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tier-rank"
                  type="number"
                  min="1"
                  value={tierRank}
                  onChange={(e) => setTierRank(parseInt(e.target.value) || 1)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('tierRankHelper')}
                </p>
              </div>

              <div>
                <Label htmlFor="trial-days">{t('trialDays')}</Label>
                <Input
                  id="trial-days"
                  type="number"
                  min="0"
                  value={trialDays}
                  onChange={(e) => setTrialDays(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <LocalizedInput
              label={t('planName')}
              value={name}
              onChange={setName}
              required
              placeholder={t('enterPlanName')}
            />

            <LocalizedInput
              label={t('descriptionEn')}
              value={description}
              onChange={setDescription}
              type="textarea"
              placeholder={t('enterDescription')}
            />

            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="is-public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <Label htmlFor="is-public" className="cursor-pointer">
                  {t('public')}
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is-active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="is-active" className="cursor-pointer">
                  {t('active')}
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>{t('featuresAndLimits')}</CardTitle>
            <CardDescription>
              {t('planInformation')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {FEATURE_METADATA.map((fm, index) => (
              <div key={fm.key}>
                {index > 0 && <Separator className="my-4" />}
                {fm.type === 'boolean' ? (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Label className="text-base">{fm.label}</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {fm.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Switch
                        checked={features[fm.key].value as boolean}
                        onCheckedChange={(checked) =>
                          handleFeatureChange(fm.key, checked)
                        }
                      />
                      <span className="text-sm">
                        {features[fm.key].value ? t('enabled') : t('disabled')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <LimitInput
                    label={fm.label}
                    description={fm.description}
                    value={features[fm.key].value as number | null}
                    onChange={(value) => handleFeatureChange(fm.key, value)}
                    min={1}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>{t('pricing')}</CardTitle>
            <CardDescription>
              {t('planInformation')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {prices.map((price, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{t('pricing')} {index + 1}</h4>
                  {prices.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePrice(index)}
                    >
                      {t('delete')}
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label>{t('billingCycle')}</Label>
                    <Select
                      value={price.billing_cycle}
                      onValueChange={(v) =>
                        handlePriceChange(index, 'billing_cycle', v as BillingCycle)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">{t('monthly')}</SelectItem>
                        <SelectItem value="annual">{t('annual')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{t('currency')}</Label>
                    <Select
                      value={price.currency}
                      onValueChange={(v) => handlePriceChange(index, 'currency', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="SAR">SAR</SelectItem>
                        <SelectItem value="AED">AED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <MoneyInput
                    label={t('amount')}
                    value={price.amount_cents}
                    onChange={(cents) =>
                      handlePriceChange(index, 'amount_cents', cents)
                    }
                    currency={price.currency}
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={handleAddPrice}
              className="w-full"
            >
              {t('addPrice')}
            </Button>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/${locale}/billing/plans`)}
            disabled={createMutation.isPending}
          >
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('saving')}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t('createPlan')}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
