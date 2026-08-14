'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Save,
  Edit,
  Loader2,
  AlertTriangle,
  Package,
  DollarSign,
  Users,
  Plus,
  Archive as ArchiveIcon,
} from 'lucide-react';
import Link from 'next/link';
import { plansEndpoints } from '@/lib/api/endpoints/plans';
import type {
  PlanDetail,
  UpdatePlanData,
  LocalizedString,
  PlanTier,
  FeatureKey,
  CreatePriceData,
  BillingCycle,
  PlanPrice,
} from '@/lib/types/plan';
import { FEATURE_METADATA, TIER_METADATA, PLAN_ERROR_CODES } from '@/lib/types/plan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  resolveLocalizedString,
  getTierLabel,
  getTierVariant,
  formatCurrency,
  formatFeatureValue,
} from '@/lib/utils/plan-utils';
import { formatDistanceToNow } from 'date-fns';

export default function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params Promise FIRST (before any other hooks)
  const { id } = React.use(params);
  const planId = parseInt(id, 10);
  
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('plans');
  const tCommon = useTranslations('common');
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [isEditMode, setIsEditMode] = React.useState(searchParams.get('edit') === 'true');
  const [versionModalOpen, setVersionModalOpen] = React.useState(false);
  const [versionResult, setVersionResult] = React.useState<any>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [pendingUpdate, setPendingUpdate] = React.useState<UpdatePlanData | null>(null);

  // Fetch plan
  const { data: plan, isLoading } = useQuery({
    queryKey: ['platform-plan', planId],
    queryFn: () => plansEndpoints.getPlan(planId),
  });

  // Form state
  const [name, setName] = React.useState<LocalizedString>({ en: '', ar: '' });
  const [description, setDescription] = React.useState<LocalizedString>({ en: '', ar: '' });
  const [tier, setTier] = React.useState<PlanTier>('starter');
  const [tierRank, setTierRank] = React.useState(1);
  const [isPublic, setIsPublic] = React.useState(true);
  const [isActive, setIsActive] = React.useState(true);
  const [trialDays, setTrialDays] = React.useState(14);
  const [sortOrder, setSortOrder] = React.useState(100);
  const [features, setFeatures] = React.useState<Record<FeatureKey, { type: string; value: number | boolean | null }>>({} as any);

  // New price form
  const [showAddPrice, setShowAddPrice] = React.useState(false);
  const [newPrice, setNewPrice] = React.useState<CreatePriceData>({
    billing_cycle: 'monthly',
    currency: 'USD',
    amount_cents: 0,
  });

  // Initialize form when plan loads
  React.useEffect(() => {
    if (plan) {
      console.log('[Plan Detail] Loading plan data:', {
        id: plan.id,
        code: plan.code,
        tier: plan.tier,
        tier_rank: plan.tier_rank,
      });
      
      setName(plan.name);
      setDescription(plan.description || { en: '', ar: '' });
      
      // Ensure tier is never empty string - fallback to 'starter' if invalid
      const validTier = plan.tier && plan.tier !== '' ? plan.tier : 'starter';
      setTier(validTier as PlanTier);
      setTierRank(plan.tier_rank);
      setIsPublic(plan.is_public);
      setIsActive(plan.is_active);
      setTrialDays(plan.trial_days);
      setSortOrder(plan.sort_order);

      // Initialize features
      const featuresMap: any = {};
      FEATURE_METADATA.forEach((fm) => {
        const planFeature = plan.features.find((f) => f.feature_key === fm.key);
        if (planFeature) {
          let featureValue: number | boolean | null;
          
          if (planFeature.value_type === 'boolean') {
            featureValue = planFeature.boolean_value ?? false;
          } else if (planFeature.value_type === 'unlimited') {
            featureValue = null; // Unlimited
          } else {
            // value_type === 'limit'
            // Ensure we always have a valid number or null, never undefined
            featureValue = typeof planFeature.limit_value === 'number' 
              ? planFeature.limit_value 
              : (fm.defaultValue as number ?? 1);
          }
          
          featuresMap[fm.key] = {
            type: planFeature.value_type,
            value: featureValue,
          };
        } else {
          // Feature not in plan - use default from metadata
          featuresMap[fm.key] = {
            type: fm.type,
            value: fm.defaultValue ?? (fm.type === 'boolean' ? false : 1),
          };
        }
      });
      setFeatures(featuresMap);
    }
  }, [plan]);

  // Detect breaking changes
  const hasBreakingChanges = React.useMemo(() => {
    if (!plan) return false;

    // Check breaking fields
    if (tier !== plan.tier) return true;
    if (tierRank !== plan.tier_rank) return true;

    // Check features
    for (const fm of FEATURE_METADATA) {
      const currentFeature = features[fm.key];
      const originalFeature = plan.features.find((f) => f.feature_key === fm.key);

      if (!currentFeature || !originalFeature) continue;

      if (fm.type === 'boolean') {
        if (currentFeature.value !== originalFeature.boolean_value) return true;
      } else {
        // For limit types, compare considering null (unlimited)
        const currentValue = currentFeature.value;
        const originalValue = originalFeature.value_type === 'unlimited'
          ? null
          : originalFeature.limit_value;
        
        if (currentValue !== originalValue) return true;
      }
    }

    return false;
  }, [plan, tier, tierRank, features]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdatePlanData) => plansEndpoints.updatePlan(planId, data),
    onSuccess: (response) => {
      if (response.meta?.versioned) {
        // Show versioning modal
        setVersionResult(response);
        setVersionModalOpen(true);
      } else {
        toast.success(t('updateSuccess'));
        setIsEditMode(false);
        queryClient.invalidateQueries({ queryKey: ['platform-plan', planId] });
        queryClient.invalidateQueries({ queryKey: ['platform-plans'] });
      }
    },
    onError: (error: any) => {
      console.error('Failed to update plan:', error);
      const errorCode = error?.code;
      const errorMessage = errorCode && PLAN_ERROR_CODES[errorCode as keyof typeof PLAN_ERROR_CODES]
        ? PLAN_ERROR_CODES[errorCode as keyof typeof PLAN_ERROR_CODES]
        : t('updateSuccess');
      toast.error(errorMessage);
    },
  });

  // Add price mutation
  const addPriceMutation = useMutation({
    mutationFn: (data: CreatePriceData) => plansEndpoints.createPrice(planId, data),
    onSuccess: () => {
      toast.success(t('updateSuccess'));
      setShowAddPrice(false);
      setNewPrice({ billing_cycle: 'monthly', currency: 'USD', amount_cents: 0 });
      queryClient.invalidateQueries({ queryKey: ['platform-plan', planId] });
    },
    onError: (error: any) => {
      console.error('Failed to add price:', error);
      const errorCode = error?.code;
      const errorMessage = errorCode && PLAN_ERROR_CODES[errorCode as keyof typeof PLAN_ERROR_CODES]
        ? PLAN_ERROR_CODES[errorCode as keyof typeof PLAN_ERROR_CODES]
        : t('updateSuccess');
      toast.error(errorMessage);
    },
  });

  // Archive price mutation
  const archivePriceMutation = useMutation({
    mutationFn: (priceId: number) => plansEndpoints.archivePrice(planId, priceId),
    onSuccess: () => {
      toast.success(t('archiveSuccess'));
      queryClient.invalidateQueries({ queryKey: ['platform-plan', planId] });
    },
    onError: (error: any) => {
      console.error('Failed to archive price:', error);
      toast.error(t('archiveSuccess'));
    },
  });

  // Handle tier change
  const handleTierChange = (newTier: PlanTier) => {
    console.log('[handleTierChange] Changing tier to:', newTier);
    
    // Guard against empty string or invalid values
    if (!newTier || newTier === '') {
      console.warn('[handleTierChange] Received empty tier, ignoring');
      return;
    }
    
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

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('[handleSubmit] Form state before validation:', {
      tier,
      tierType: typeof tier,
      tierLength: tier?.length,
      tierRank,
      name: name.en,
    });

    // Validate
    if (!name.en.trim()) {
      toast.error(t('planNameEnRequired'));
      return;
    }

    if (!tier || tier === '') {
      console.error('[handleSubmit] Tier is empty!', { tier, tierType: typeof tier });
      toast.error(t('tierRequired'));
      return;
    }

    if (!['starter', 'growth', 'enterprise'].includes(tier)) {
      console.error('[handleSubmit] Invalid tier value!', { tier });
      toast.error(t('tierRequired'));
      return;
    }

    // Build update data
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

    const updateData: UpdatePlanData = {
      name,
      description: description.en || description.ar ? description : null,
      tier,
      tier_rank: tierRank,
      is_public: isPublic,
      is_active: isActive,
      trial_days: trialDays,
      sort_order: sortOrder,
      features: featuresArray as any,
    };

    console.log('[handleSubmit] Submitting update data:', {
      tier: updateData.tier,
      tierType: typeof updateData.tier,
      tier_rank: updateData.tier_rank,
      featuresCount: featuresArray.length,
      fullPayload: updateData,
    });

    // Check if versioning will occur
    if (plan?.in_use && hasBreakingChanges) {
      setPendingUpdate(updateData);
      setConfirmDialogOpen(true);
    } else {
      updateMutation.mutate(updateData);
    }
  };

  // Confirm versioning
  const handleConfirmVersioning = () => {
    if (pendingUpdate) {
      updateMutation.mutate(pendingUpdate);
      setConfirmDialogOpen(false);
      setPendingUpdate(null);
    }
  };

  // Handle version modal close
  const handleVersionModalClose = () => {
    setVersionModalOpen(false);
    if (versionResult?.meta?.new_plan_id) {
      router.push(`/${locale}/billing/plans/${versionResult.meta.new_plan_id}`);
    }
  };

  // Handle archive price
  const handleArchivePrice = (priceId: number) => {
    if (!confirm(t('confirmArchive'))) return;
    archivePriceMutation.mutate(priceId);
  };

  // Handle add price
  const handleAddPrice = () => {
    if (newPrice.amount_cents <= 0) {
      toast.error(t('priceRequired'));
      return;
    }
    addPriceMutation.mutate(newPrice);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/${locale}/billing/plans`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t('planNotFound')}</h1>
          </div>
        </div>
      </div>
    );
  }

  const planName = resolveLocalizedString(plan.name, locale, plan.code);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/${locale}/billing/plans`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{planName}</h1>
            <p className="text-muted-foreground">
              {isEditMode ? t('editPlan') : t('planDetails')}
            </p>
          </div>
        </div>
        {!isEditMode && !plan.superseded_by_plan_id && (
          <Button onClick={() => setIsEditMode(true)}>
            <Edit className="mr-2 h-4 w-4" />
            {t('editPlan')}
          </Button>
        )}
      </div>

      {/* Status Badges */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant={getTierVariant(plan.tier)}>
          {getTierLabel(plan.tier)}
        </Badge>
        {plan.superseded_by_plan_id && (
          <Badge variant="outline">{t('superseded')}</Badge>
        )}
        {!plan.is_active && <Badge variant="secondary">{t('archived')}</Badge>}
        {!plan.is_public && <Badge variant="outline">{t('private')}</Badge>}
        {plan.in_use && <Badge variant="default">{t('inUse')}</Badge>}
        {plan.has_active_subscribers && (
          <Badge variant="default">
            <Users className="mr-1 h-3 w-3" />
            {t('hasSubscribers')}
          </Badge>
        )}
      </div>

      {/* Superseded Warning */}
      {plan.superseded_by_plan_id && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('supersededWarning')}</AlertTitle>
          <AlertDescription>
            {t('viewCurrentVersion')}: {plan.superseded_by_plan_id}.{' '}
            <Link
              href={`/${locale}/billing/plans/${plan.superseded_by_plan_id}`}
              className="underline"
            >
              {t('viewCurrentVersion')}
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Version Warning Banner (Edit Mode) */}
      {isEditMode && plan.in_use && hasBreakingChanges && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('breakingChangesWarning')}</AlertTitle>
          <AlertDescription>
            {t('breakingChangesDescription')}
          </AlertDescription>
        </Alert>
      )}

      {isEditMode ? (
        /* EDIT MODE */
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
                  <Label>{t('planCode')}</Label>
                  <Input value={plan.code} disabled />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('planCodeHelper')}
                  </p>
                </div>

                <div>
                  <Label htmlFor="tier">
                    {t('tier')} <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    key={`tier-select-${plan.id}`}
                    value={tier || 'starter'} 
                    onValueChange={(v) => handleTierChange(v as PlanTier)}
                  >
                    <SelectTrigger id="tier">
                      <SelectValue placeholder={t('selectTier')} />
                    </SelectTrigger>
                    <SelectContent>
                      {TIER_METADATA.map((tm) => (
                        <SelectItem key={tm.value} value={tm.value}>
                          {t(tm.value)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {plan.in_use && tier !== plan.tier && (
                    <p className="text-xs text-destructive mt-1">
                      {t('willCreateNewVersion')}
                    </p>
                  )}
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
                  {plan.in_use && tierRank !== plan.tier_rank && (
                    <p className="text-xs text-destructive mt-1">
                      {t('willCreateNewVersion')}
                    </p>
                  )}
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
              {FEATURE_METADATA.map((fm, index) => {
                const originalFeature = plan.features.find((f) => f.feature_key === fm.key);
                const originalValue = originalFeature
                  ? (originalFeature.value_type === 'unlimited' 
                      ? null 
                      : (fm.type === 'boolean' 
                          ? originalFeature.boolean_value 
                          : originalFeature.limit_value))
                  : null;
                const hasChanged = features[fm.key] && features[fm.key].value !== originalValue;

                return (
                  <div key={fm.key}>
                    {index > 0 && <Separator className="my-4" />}
                    {fm.type === 'boolean' ? (
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <Label className="text-base">{fm.label}</Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              {fm.description}
                            </p>
                            {plan.in_use && hasChanged && (
                              <p className="text-xs text-destructive mt-1">
                                {t('willCreateNewVersion')}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <Switch
                              checked={features[fm.key]?.value as boolean}
                              onCheckedChange={(checked) =>
                                handleFeatureChange(fm.key, checked)
                              }
                            />
                            <span className="text-sm">
                              {features[fm.key]?.value ? t('enabled') : t('disabled')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <LimitInput
                          label={fm.label}
                          description={fm.description}
                          value={features[fm.key]?.value as number | null}
                          onChange={(value) => handleFeatureChange(fm.key, value)}
                          min={1}
                        />
                        {plan.in_use && hasChanged && (
                          <p className="text-xs text-destructive mt-1">
                            {t('willCreateNewVersion')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditMode(false);
                // Reset form
                if (plan) {
                  setName(plan.name);
                  setDescription(plan.description || { en: '', ar: '' });
                  setTier(plan.tier);
                  setTierRank(plan.tier_rank);
                  setIsPublic(plan.is_public);
                  setIsActive(plan.is_active);
                  setTrialDays(plan.trial_days);
                  setSortOrder(plan.sort_order);
                }
              }}
              disabled={updateMutation.isPending}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              variant={plan.in_use && hasBreakingChanges ? 'default' : 'default'}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('saving')}
                </>
              ) : plan.in_use && hasBreakingChanges ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t('saveAndCreateNewVersion')}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t('saveChanges')}
                </>
              )}
            </Button>
          </div>
        </form>
      ) : (
        /* VIEW MODE */
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('basicInformation')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">{t('planCode')}</Label>
                  <p className="font-medium">{plan.code}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('tier')}</Label>
                  <p className="font-medium">{t(plan.tier)}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">{t('tierRank')}</Label>
                  <p className="font-medium">{plan.tier_rank}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('trialDays')}</Label>
                  <p className="font-medium">{plan.trial_days}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">{t('planNameEn')}</Label>
                <p className="font-medium">{plan.name.en}</p>
              </div>

              {plan.name.ar && (
                <div>
                  <Label className="text-muted-foreground">{t('planNameAr')}</Label>
                  <p className="font-medium" dir="rtl">{plan.name.ar}</p>
                </div>
              )}

              {plan.description && (
                <>
                  {plan.description.en && (
                    <div>
                      <Label className="text-muted-foreground">{t('descriptionEn')}</Label>
                      <p className="text-sm">{plan.description.en}</p>
                    </div>
                  )}
                  {plan.description.ar && (
                    <div>
                      <Label className="text-muted-foreground">{t('descriptionAr')}</Label>
                      <p className="text-sm" dir="rtl">{plan.description.ar}</p>
                    </div>
                  )}
                </>
              )}

              <div>
                <Label className="text-muted-foreground">{tCommon('loading')}</Label>
                <p className="text-sm">
                  {formatDistanceToNow(new Date(plan.updated_at), { addSuffix: true })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>{t('featuresAndLimits')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {FEATURE_METADATA.map((fm, index) => {
                const feature = plan.features.find((f) => f.feature_key === fm.key);
                return (
                  <div key={fm.key}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">{fm.label}</Label>
                        <p className="text-sm text-muted-foreground">{fm.description}</p>
                      </div>
                      <p className="font-medium">
                        {feature
                          ? formatFeatureValue(
                              feature.value_type,
                              feature.limit_value,
                              feature.boolean_value
                            )
                          : '-'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t('pricing')}</CardTitle>
                  <CardDescription>{t('planInformation')}</CardDescription>
                </div>
                {!plan.superseded_by_plan_id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddPrice(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Price
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {plan.prices.length === 0 ? (
                <p className="text-sm text-muted-foreground">No prices configured</p>
              ) : (
                plan.prices.map((price) => (
                  <div
                    key={price.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {formatCurrency(price.amount_cents, price.currency)}
                        </p>
                        <Badge variant="outline">
                          {price.billing_cycle === 'monthly' ? 'Monthly' : 'Annual'}
                        </Badge>
                        {!price.is_active && (
                          <Badge variant="secondary">Archived</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {price.currency} • {price.provider}
                        {price.provider_price_id && ` • ${price.provider_price_id}`}
                      </p>
                    </div>
                    {price.is_active && !plan.superseded_by_plan_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchivePrice(price.id)}
                      >
                        <ArchiveIcon className="mr-2 h-4 w-4" />
                        Archive
                      </Button>
                    )}
                  </div>
                ))
              )}

              {/* Add Price Form */}
              {showAddPrice && (
                <div className="p-4 border rounded-lg space-y-4 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Add New Price</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddPrice(false)}
                    >
                      Cancel
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label>Billing Cycle</Label>
                      <Select
                        value={newPrice.billing_cycle}
                        onValueChange={(v) =>
                          setNewPrice({ ...newPrice, billing_cycle: v as BillingCycle })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Currency</Label>
                      <Select
                        value={newPrice.currency}
                        onValueChange={(v) => setNewPrice({ ...newPrice, currency: v })}
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
                      label="Amount"
                      value={newPrice.amount_cents}
                      onChange={(cents) =>
                        setNewPrice({ ...newPrice, amount_cents: cents })
                      }
                      currency={newPrice.currency}
                    />
                  </div>

                  <Button
                    onClick={handleAddPrice}
                    disabled={addPriceMutation.isPending}
                    className="w-full"
                  >
                    {addPriceMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Price'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Plan Version?</DialogTitle>
            <DialogDescription>
              You are about to make breaking changes to a plan with active subscribers.
              This will create a <strong>new plan version</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <p className="text-sm">What will happen:</p>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              <li>A new plan will be created with your changes</li>
              <li>The current plan will be archived and marked as superseded</li>
              <li>Existing subscribers will remain on the current plan</li>
              <li>New subscriptions will use the new version</li>
              <li>You can migrate subscribers later using the Migration Tool</li>
            </ul>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmVersioning}>
              Yes, Create New Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version Success Modal */}
      <Dialog open={versionModalOpen} onOpenChange={setVersionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>✅ New Version Created Successfully!</DialogTitle>
            <DialogDescription>
              Your plan has been versioned due to breaking changes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-medium">Version Details:</p>
              <ul className="text-sm space-y-1">
                <li>
                  <strong>Old Plan ID:</strong> #{versionResult?.meta?.original_plan_id}
                  <Badge variant="secondary" className="ml-2">Archived</Badge>
                </li>
                <li>
                  <strong>New Plan ID:</strong> #{versionResult?.meta?.new_plan_id}
                  <Badge variant="default" className="ml-2">Active</Badge>
                </li>
              </ul>
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Existing Subscribers</AlertTitle>
              <AlertDescription>
                Existing subscribers remain on the old plan (#{versionResult?.meta?.original_plan_id}).
                Use the Migration Tool to move them to the new version.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button onClick={handleVersionModalClose}>
              View New Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
