// Plan Management Types

export type PlanTier = 'starter' | 'growth' | 'enterprise';

export type FeatureKey =
  | 'stores.max'
  | 'products.max'
  | 'users.max'
  | 'analytics.advanced'
  | 'api.access'
  | 'custom_domain.enabled'
  | 'support.priority'
  | 'webhooks.enabled';

export type FeatureValueType = 'limit' | 'boolean' | 'unlimited';

export type BillingCycle = 'monthly' | 'annual';

export interface LocalizedString {
  en: string;
  ar: string;
  [locale: string]: string;
}

export interface PlanFeature {
  feature_key: FeatureKey;
  value_type: FeatureValueType;
  limit_value?: number | null;  // null = unlimited
  boolean_value?: boolean | null;
}

export interface PlanPrice {
  id: number;
  billing_cycle: BillingCycle;
  currency: string;
  amount_cents: number;
  is_active: boolean;
  provider: string;
  provider_price_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: number;
  code: string;
  name: LocalizedString;
  description: LocalizedString | null;
  tier: PlanTier;
  tier_rank: number;
  is_public: boolean;
  is_active: boolean;
  trial_days: number;
  sort_order: number;
  superseded_by_plan_id?: number | null;
  provider_product_id?: string | null;
  features: PlanFeature[];
  prices: PlanPrice[];
  created_at: string;
  updated_at: string;
}

export interface PlanDetail extends Plan {
  // From meta in show response
  in_use?: boolean;
  has_active_subscribers?: boolean;
  is_superseded?: boolean;
  is_current?: boolean;
}

export interface UpdatePlanResponse {
  data: Plan;
  message: string;
  meta?: {
    versioned: boolean;
    original_plan_id: number;
    new_plan_id: number;
  };
}

export interface PlanFilters {
  search?: string;
  tier?: PlanTier;
  is_active?: boolean;
  is_public?: boolean;
  include_archived?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface CreatePlanData {
  code: string;
  name: LocalizedString;
  description?: LocalizedString | null;
  tier: PlanTier;
  tier_rank: number;
  is_public: boolean;
  is_active: boolean;
  trial_days?: number;
  sort_order?: number;
  features: Omit<PlanFeature, 'id'>[];
  prices?: CreatePriceData[];
}

export interface UpdatePlanData {
  name?: LocalizedString;
  description?: LocalizedString | null;
  tier?: PlanTier;
  tier_rank?: number;
  is_public?: boolean;
  is_active?: boolean;
  trial_days?: number;
  sort_order?: number;
  features?: Omit<PlanFeature, 'id'>[];
}

export interface CreatePriceData {
  billing_cycle: BillingCycle;
  currency: string;
  amount_cents: number;
}

export interface MigrateSubscribersData {
  from_plan_id: number;
  to_plan_id: number;
  billing_account_ids: number[];
  grandfather_existing?: boolean;
  dry_run?: boolean;
}

export interface MigrationAnalysis {
  billing_account_id: number;
  owner_email: string;
  current_usage: Record<string, number>;
  new_limits: Record<string, number | boolean>;
  would_exceed: {
    feature: string;
    current: number;
    new_limit: number;
  }[];
  has_conflicts: boolean;
}

export interface MigrationResult {
  dry_run: boolean;
  from_plan: Pick<Plan, 'id' | 'code'>;
  to_plan: Pick<Plan, 'id' | 'code'>;
  total_accounts: number;
  accounts_with_conflicts: number;
  migrated_count?: number;
  failed_count?: number;
  analysis?: MigrationAnalysis[];
}

// Feature metadata for UI
export interface FeatureMetadata {
  key: FeatureKey;
  label: string;
  description: string;
  type: FeatureValueType;
  defaultValue?: number | boolean;
  canBeUnlimited?: boolean; // For limit types, indicates if NULL is allowed
}

export const FEATURE_METADATA: FeatureMetadata[] = [
  {
    key: 'stores.max',
    label: 'Maximum Stores',
    description: 'Number of stores allowed per account',
    type: 'limit',
    defaultValue: 1,
    canBeUnlimited: true,
  },
  {
    key: 'products.max',
    label: 'Maximum Products',
    description: 'Total products across all stores',
    type: 'limit',
    defaultValue: 100,
    canBeUnlimited: true,
  },
  {
    key: 'users.max',
    label: 'Maximum Users',
    description: 'Team members per account',
    type: 'limit',
    defaultValue: 1,
    canBeUnlimited: true,
  },
  {
    key: 'analytics.advanced',
    label: 'Advanced Analytics',
    description: 'Access to detailed analytics and reports',
    type: 'boolean',
    defaultValue: false,
  },
  {
    key: 'api.access',
    label: 'API Access',
    description: 'Access to REST API',
    type: 'boolean',
    defaultValue: false,
  },
  {
    key: 'custom_domain.enabled',
    label: 'Custom Domain',
    description: 'Connect custom domain to store',
    type: 'boolean',
    defaultValue: false,
  },
  {
    key: 'support.priority',
    label: 'Priority Support',
    description: 'Priority customer support',
    type: 'boolean',
    defaultValue: false,
  },
  {
    key: 'webhooks.enabled',
    label: 'Webhooks',
    description: 'Real-time webhooks for events',
    type: 'boolean',
    defaultValue: false,
  },
];

export const TIER_METADATA = [
  { value: 'starter', label: 'Starter', rank: 1 },
  { value: 'growth', label: 'Growth', rank: 2 },
  { value: 'enterprise', label: 'Enterprise', rank: 3 },
] as const;

// Error codes from backend
export const PLAN_ERROR_CODES = {
  BIL_014: 'Plan code already exists',
  BIL_015: 'Cannot delete plan in use - use archive instead',
  BIL_016: 'No active price for this currency and billing cycle',
  BIL_017: 'Invalid feature configuration',
  BIL_018: 'Plan has active subscribers - some changes will create a new version',
  BIL_019: 'Cannot archive plan with active subscribers',
  BIL_020: 'Invalid tier rank',
  BIL_021: 'Cannot update superseded plan',
  BIL_022: 'Migration would cause limit violations',
  BIL_023: 'Source and target plans cannot be the same',
  BIL_024: 'No billing accounts specified for migration',
  BIL_025: 'One or more billing accounts not found',
  BIL_026: 'Plan not found',
} as const;
