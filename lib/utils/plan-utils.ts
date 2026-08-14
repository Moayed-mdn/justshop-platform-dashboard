import type { LocalizedString, PlanTier } from '@/lib/types/plan';

/**
 * Format currency amount from cents to display format
 */
export function formatCurrency(cents: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/**
 * Resolve localized string to a specific locale with fallback
 */
export function resolveLocalizedString(
  value: LocalizedString | null | undefined,
  locale: string,
  fallback = ''
): string {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value[locale] ?? value['en'] ?? Object.values(value)[0] ?? fallback;
}

/**
 * Get tier badge variant
 */
export function getTierVariant(tier: PlanTier): 'default' | 'secondary' | 'outline' {
  switch (tier) {
    case 'starter':
      return 'secondary';
    case 'growth':
      return 'default';
    case 'enterprise':
      return 'outline';
    default:
      return 'secondary';
  }
}

/**
 * Get tier display name
 */
export function getTierLabel(tier: PlanTier): string {
  switch (tier) {
    case 'starter':
      return 'Starter';
    case 'growth':
      return 'Growth';
    case 'enterprise':
      return 'Enterprise';
    default:
      return tier;
  }
}

/**
 * Check if a plan change would be breaking (trigger versioning)
 */
export function isBreakingChange(
  field: string,
  oldValue: any,
  newValue: any
): boolean {
  const breakingFields = [
    'code',
    'tier',
    'tier_rank',
    'features',
    'prices',
  ];

  return breakingFields.includes(field) && oldValue !== newValue;
}

/**
 * Format feature value for display
 */
export function formatFeatureValue(
  valueType: string,
  limitValue?: number | null,
  booleanValue?: boolean | null
): string {
  if (valueType === 'unlimited') {
    return 'Unlimited';
  }
  if (valueType === 'limit') {
    // NULL = Unlimited for limit types
    if (limitValue === null || limitValue === undefined) {
      return 'Unlimited';
    }
    return limitValue.toLocaleString();
  }
  if (valueType === 'boolean') {
    return booleanValue ? 'Enabled' : 'Disabled';
  }
  return '-';
}
