// Subscription types following backend API (snake_case as returned from API)

export type SubscriptionStatus =
  | 'incomplete'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'grace_period'
  | 'paused'
  | 'canceled'
  | 'expired';

export type BillingCycle = 'monthly' | 'annual';

export interface SubscriptionPlan {
  id: number;
  code: string;
  name: string;
}

export interface SubscriptionPlanPrice {
  amount_cents: number;
  currency: string;
  billing_cycle?: BillingCycle;
}

export interface SubscriptionMerchant {
  billing_account_id: string;
  owner_id?: number;
  owner_name: string;
  owner_email: string;
  legal_name?: string;
  billing_email?: string;
  stores?: Array<{
    id: number;
    name: string;
    slug: string;
    status: string;
  }>;
}

export interface Subscription {
  id: number;
  status: SubscriptionStatus;
  billing_cycle: BillingCycle;
  plan: SubscriptionPlan;
  plan_price: SubscriptionPlanPrice | null;
  merchant: SubscriptionMerchant;
  trial_ends_at: string | null;
  current_period_ends_at: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
}

export interface SubscriptionInvoice {
  id: number;
  invoice_number: string;
  status: string;
  currency: string;
  total_cents: number;
  amount_paid_cents: number;
  amount_due_cents: number;
  issued_at: string;
  paid_at: string | null;
  hosted_invoice_url: string | null;
}

export interface SubscriptionEvent {
  id: number;
  event_type: string;
  from_status: string | null;
  to_status: string | null;
  source: string;
  reason: string | null;
  actor: string | null;
  created_at: string;
}

export interface SubscriptionDetail extends Subscription {
  provider: string;
  provider_subscription_id: string | null;
  provider_status: string | null;
  provider_synced_at: string | null;
  pending_plan: SubscriptionPlan | null;
  pending_plan_effective_at: string | null;
  trial_starts_at: string | null;
  current_period_starts_at: string;
  grace_period_ends_at: string | null;
  ended_at: string | null;
  invoices: SubscriptionInvoice[];
  events: SubscriptionEvent[];
}

export interface SubscriptionFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: SubscriptionStatus;
  plan_id?: number;
  sort?: 'created_at' | 'current_period_ends_at' | 'status';
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    pagination: {
      total: number;
      count: number;
      per_page: number;
      current_page: number;
      total_pages: number;
    };
  };
}
