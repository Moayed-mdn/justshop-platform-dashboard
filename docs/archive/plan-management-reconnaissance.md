# Platform Plan Management UI - Reconnaissance Complete

## ✅ Framework & Stack Discovered

### Core Stack
- **Framework**: Next.js 16.2.10 (App Router)
- **React**: 19.2.4
- **Data Fetching**: @tanstack/react-query v5.101.2
- **Forms**: react-hook-form v7.81.0 + zod v4.4.3 + @hookform/resolvers v5.4.0
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS v4 with tailwindcss-rtl for Arabic support
- **State**: Zustand v5.0.14
- **i18n**: next-intl v4.13.2
- **Icons**: lucide-react v1.24.0
- **Toasts**: sonner v2.0.7
- **Tables**: @tanstack/react-table v8.21.3

### Routing Structure
- **Pattern**: File-based routing (Next.js App Router)
- **Platform Routes**: `app/[locale]/(dashboard)/`
- **Existing Admin Pages**: 
  - `/users` - Users management (REFERENCE TEMPLATE)
  - `/stores` - Stores management
  - `/cms/pages` - CMS pages (has localized content)
  - `/features` - Feature flags
  - `/audit` - Audit logs

### Authentication Pattern
**CONFIRMED**: Cookie-based Sanctum SPA auth (NOT Bearer tokens)

```typescript
// From lib/api/client.ts
{
  credentials: 'include',  // httpOnly cookies
  headers: {
    'X-XSRF-TOKEN': csrfToken  // CSRF protection
  }
}
```

**Flow**:
1. GET `/sanctum/csrf-cookie` first (sets XSRF-TOKEN cookie)
2. Extract cookie client-side
3. Send as `X-XSRF-TOKEN` header on mutations
4. All requests use `credentials: 'include'`

## 📁 File Structure Patterns

### Page Structure
```
app/[locale]/(dashboard)/
  ├── billing/                    # NEW - to be created
  │   └── plans/
  │       ├── page.tsx            # List view
  │       ├── new/
  │       │   └── page.tsx        # Create form
  │       ├── [id]/
  │       │   ├── page.tsx        # Detail/Edit view
  │       │   └── migrate/
  │       │       └── page.tsx    # Migration wizard
  │       └── loading.tsx
```

### API Structure
```
lib/api/endpoints/
  └── plans.ts                    # NEW - to be created

Types:
lib/types/
  └── plan.ts                     # NEW - to be created
```

## 🎨 Component Patterns

### Existing Reusable Components
✅ **Available**:
- `DataTable` - from `@/components/ui/data-table`
- `SearchInput` - from `@/components/ui/search-input`
- `Pagination` - from `@/components/ui/pagination`
- All shadcn/ui components (Button, Card, Badge, Dialog, etc.)

❌ **Need to Create**:
- `LocalizedInput` - for {en: string, ar: string} inputs
  - RTL support for Arabic required
  - Tab-based locale switcher (EN/AR)
- `MoneyInput` - for cents input with display formatting
- `FeatureKeyEditor` - for the fixed 8-row feature checklist
- `PriceList` - for managing multiple prices per plan
- `VersionBanner` - prominent warning for versioning
- `MigrationWizard` - multi-step guided migration

### Reference: Users List Pattern
From `app/[locale]/(dashboard)/users/page.tsx`:
```typescript
// 1. React Query with filters
const [filters, setFilters] = useState<UserFilters>({...});
const { data, isLoading, isFetching } = useQuery({
  queryKey: ['platform-users', filters],
  queryFn: () => usersEndpoints.getUsers(filters),
  placeholderData: keepPreviousData,
});

// 2. Optimistic updates with queryClient.setQueryData
queryClient.setQueryData(queryKey, (current) => {...});

// 3. DataTable with columns
const columns: Column<User>[] = [...];

// 4. Filters: SearchInput + Select dropdowns
// 5. Row actions: Dropdown menu with View/Edit/Delete
```

## 💰 Money Formatting

**CRITICAL**: All amounts are stored as **integer cents**.

```typescript
// Reference from laratenant-commerce/src/lib/billing/billing-utils.ts
export function formatCurrency(cents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

// Input: MUST accept integer cents only
// Display: Show formatted with cents / 100
// NEVER send floats to API
```

## 🌍 Localization

### LocalizedString Type
```typescript
type LocalizedString = {
  en: string;
  ar: string;
  [locale: string]: string;
}
```

### Resolver Pattern (from CMS pages)
```typescript
function resolveLocalizedString(
  value: LocalizedString | null | undefined,
  locale: string,
  fallback = ''
): string {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value[locale] ?? value['en'] ?? Object.values(value)[0] ?? fallback;
}
```

### LocalizedInput Component Needed
Ref: `laratenant-commerce` has this pattern - need to port to platform-dashboard:
- Tab switcher (EN | AR)
- RTL rendering for Arabic input
- Used for `name` and `description` fields

## 🔒 Permission Gating

**Pattern**: Route-level protection via middleware

From existing pages - all platform admin routes already protected by:
- `middleware.ts` handles locale + auth
- Dashboard layout wraps all admin routes
- No additional per-page checks needed

## 🎯 API Contract (To Implement)

### Base URL
```
/api/v1/platform/billing/plans
```

### Endpoints to Create
```typescript
// lib/api/endpoints/plans.ts

export const plansEndpoints = {
  // List plans
  async getPlans(filters?: PlanFilters): Promise<PaginatedResponse<Plan>>
  
  // Get single plan
  async getPlan(id: number): Promise<PlanDetail>
  
  // Create plan
  async createPlan(data: CreatePlanData): Promise<Plan>
  
  // Update plan (may return new ID if versioned)
  async updatePlan(id: number, data: UpdatePlanData): Promise<UpdatePlanResponse>
  
  // Archive plan
  async archivePlan(id: number): Promise<Plan>
  
  // Delete plan
  async deletePlan(id: number): Promise<void>
  
  // Price management
  async createPrice(planId: number, data: CreatePriceData): Promise<PlanPrice>
  async archivePrice(planId: number, priceId: number): Promise<void>
  
  // Migration
  async migrateSubscribers(data: MigrationData): Promise<MigrationResult>
}
```

## 📋 Types to Create

```typescript
// lib/types/plan.ts

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

export interface PlanFeature {
  feature_key: FeatureKey;
  value_type: FeatureValueType;
  limit_value?: number | null;
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
```

## 🚧 Components to Build (Priority Order)

### Phase 1: Core Infrastructure
1. **LocalizedInput Component** (`components/plan/LocalizedInput.tsx`)
   - EN/AR tab switcher
   - RTL support for Arabic
   - Integration with react-hook-form

2. **MoneyInput Component** (`components/plan/MoneyInput.tsx`)
   - Integer cents input
   - Display formatted value
   - Validation

3. **API Endpoints** (`lib/api/endpoints/plans.ts`)
   - All CRUD operations
   - Type-safe

4. **Types** (`lib/types/plan.ts`)
   - Complete type definitions

### Phase 2: List & Basic CRUD
5. **Plans List Page** (`app/[locale]/(dashboard)/billing/plans/page.tsx`)
   - DataTable with columns
   - Filters (tier, status, show archived toggle)
   - Search
   - Row actions

6. **Create Plan Page** (`app/[locale]/(dashboard)/billing/plans/new/page.tsx`)
   - Multi-section form
   - Feature checklist (8 fixed rows)
   - Price rows (add multiple)
   - Localized inputs for name/description

### Phase 3: Edit with Versioning
7. **Edit/Detail Page** (`app/[locale]/(dashboard)/billing/plans/[id]/page.tsx`)
   - Pre-filled form
   - **Version warning banner** (if in_use)
   - Breaking vs non-breaking field tracking
   - Confirm dialog before versioning
   - Post-submit versioning modal

8. **Price Management Section**
   - Within detail page
   - Add/archive prices
   - Show active/archived

### Phase 4: Migration Tool
9. **Migration Wizard** (`app/[locale]/(dashboard)/billing/plans/[id]/migrate/page.tsx`)
   - Multi-step wizard
   - Step 1: Choose source/target plans
   - Step 2: Select accounts (needs subscriber endpoint)
   - Step 3: Dry-run analysis table
   - Step 4: Type-to-confirm + execute
   - Step 5: Results

## ⚠️ Critical Implementation Notes

### Versioning UX (MOST IMPORTANT)
```typescript
// Before submit - check if in_use
if (planDetail.in_use && hasBreakingChanges) {
  // Change button text
  submitButton.text = "Save & Create New Version";
  
  // Show persistent banner
  <Alert variant="warning">
    This plan has active subscribers. Changing tier, rank, features, 
    or prices will create a new version. Existing subscribers stay 
    on current version until explicitly migrated.
  </Alert>
  
  // Require confirmation
  await confirm("This will create a new plan version...");
}

// After submit - check response
if (response.meta?.versioned) {
  // Show success modal (NOT just toast)
  <Dialog>
    New version created!
    Old plan #{original_plan_id} archived.
    Viewing new version #{new_plan_id}.
  </Dialog>
  
  // Navigate to new plan
  router.push(`/billing/plans/${response.meta.new_plan_id}`);
}
```

### Error Handling
```typescript
// Map backend error codes to friendly messages
const ERROR_MESSAGES: Record<string, string> = {
  BIL_014: 'Plan code already exists',
  BIL_015: 'Cannot delete plan in use - use archive instead',
  BIL_016: 'No active price for this currency/cycle',
  // ... etc
};

// Special handling for BIL_015
if (error.code === 'BIL_015') {
  toast.error(ERROR_MESSAGES.BIL_015, {
    action: {
      label: 'Archive Instead',
      onClick: () => archivePlan(planId)
    }
  });
}
```

### Defensive Practices (0% backend test coverage)
- NO optimistic updates for create/update/migrate
- Wait for response before updating UI
- Log raw errors in dev console
- Don't retry mutations automatically

## 📝 Next Steps

1. **Create base types** (`lib/types/plan.ts`)
2. **Create API endpoints** (`lib/api/endpoints/plans.ts`)
3. **Build LocalizedInput** (reusable component)
4. **Build MoneyInput** (reusable component)
5. **Create Plans list page** (clone users page pattern)
6. **Create form page** (with feature/price editors)
7. **Add versioning UX** (banners, confirmations)
8. **Build migration wizard** (multi-step)
9. **Manual testing against live backend**
10. **Flag missing backend endpoint** (subscriber list for migration)

## 🔗 Reference Files
- Pattern: `app/[locale]/(dashboard)/users/page.tsx`
- API: `lib/api/endpoints/users.ts`
- CMS Localized: `app/[locale]/(dashboard)/cms/pages/page.tsx`
- Auth: `lib/api/client.ts`

---

**Status**: Reconnaissance complete ✅  
**Ready to**: Begin implementation  
**Estimated**: ~8-12 hours for full feature
