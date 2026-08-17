# Plan Management UI - Quick Start Guide

## 🚀 Getting Started (5 Minutes)

### Prerequisites
- Backend deployed with plan management endpoints
- Platform admin account with authentication token
- Node.js 18+ and npm/yarn installed

### 1. Environment Setup
```bash
cd platform-dashboard

# Create .env.local if not exists
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Or for production
echo "NEXT_PUBLIC_API_URL=https://api.yourdomain.com" > .env.local
```

### 2. Install & Run
```bash
npm install
npm run dev
```

### 3. Access Plan Management
1. Navigate to: `http://localhost:3000/en/billing/plans`
2. Login as platform admin
3. You should see the plans list page

---

## 📍 Route Map

```
/[locale]/billing/plans              → Plans list (browse, search, filter)
/[locale]/billing/plans/new          → Create new plan
/[locale]/billing/plans/{id}         → View plan details
/[locale]/billing/plans/{id}?edit=true → Edit plan
```

---

## 🎯 Quick Testing Flow

### Test 1: Create a Plan (2 minutes)
1. Go to `/en/billing/plans`
2. Click "Create Plan"
3. Fill in:
   - Code: `test-starter`
   - Name (EN): `Test Starter`
   - Tier: Starter
   - Features: Set some limits (e.g., stores: 1, products: 100)
   - Price: Add monthly USD price (e.g., $9.99)
4. Click "Create Plan"
5. Should redirect to detail page

### Test 2: Edit Plan (No Versioning) (2 minutes)
1. From detail page, click "Edit Plan"
2. Change name to `Test Starter Updated`
3. Change description
4. Click "Save Changes"
5. Should update in-place (no version created)

### Test 3: Test Versioning UX (5 minutes)
**Setup**: First, create a subscription on the plan (via backend/Postman):
```bash
# Using backend API or tinker
POST /api/v1/subscriptions
{
  "billing_account_id": 1,
  "plan_id": <your-plan-id>
}
```

**Then test versioning**:
1. Go back to plan detail page
2. Click "Edit Plan"
3. **Look for**: "In Use" badge should appear
4. Change a breaking field (e.g., tier from Starter to Growth)
5. **Look for**: Red warning banner at top
6. **Look for**: Inline warning under tier field
7. **Look for**: Button text changes to "Save & Create New Version"
8. Click "Save & Create New Version"
9. **Look for**: Confirmation dialog explaining versioning
10. Click "Yes, Create New Version"
11. **Look for**: Success modal showing old/new plan IDs
12. Click "View New Version"
13. Should navigate to new plan ID
14. Original plan should show "Superseded" badge

### Test 4: Delete Plan with Subscribers (1 minute)
1. Go to plans list
2. Find a plan with subscribers (has "In Use" badge)
3. Click dropdown → "Delete Plan"
4. Confirm deletion
5. **Look for**: Error toast with "Archive Instead" action button
6. Click "Archive Instead" in the toast
7. Plan should be archived

---

## 🔍 Key Components Reference

### Types Location
```typescript
// All plan types
import type { Plan, PlanDetail, PlanFilters } from '@/lib/types/plan';

// Error codes
import { PLAN_ERROR_CODES } from '@/lib/types/plan';
```

### API Endpoints
```typescript
import { plansEndpoints } from '@/lib/api/endpoints/plans';

// Usage examples
const plans = await plansEndpoints.getPlans({ tier: 'starter' });
const plan = await plansEndpoints.getPlan(123);
const newPlan = await plansEndpoints.createPlan(data);
const result = await plansEndpoints.updatePlan(123, data);
```

### Reusable Components
```typescript
// Localized input (EN/AR tabs)
import { LocalizedInput } from '@/components/plan/LocalizedInput';

<LocalizedInput
  label="Plan Name"
  value={{ en: 'Starter', ar: 'المبتدئ' }}
  onChange={setName}
  required
/>

// Money input (cents)
import { MoneyInput } from '@/components/plan/MoneyInput';

<MoneyInput
  label="Price"
  value={9900} // 9900 cents = $99.00
  onChange={setCents}
  currency="USD"
/>
```

### Utility Functions
```typescript
import {
  formatCurrency,
  resolveLocalizedString,
  getTierLabel,
  getTierVariant,
} from '@/lib/utils/plan-utils';

// Format 9900 cents as "$99.00"
const display = formatCurrency(9900, 'USD');

// Get localized string
const name = resolveLocalizedString(plan.name, 'en', 'Untitled');

// Get tier display name
const tierName = getTierLabel('starter'); // "Starter"
```

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch" errors
**Solution**: Check `NEXT_PUBLIC_API_URL` in `.env.local` and ensure backend is accessible

### Issue: CORS errors
**Solution**: Backend must allow frontend origin in CORS config:
```php
// config/cors.php
'allowed_origins' => ['http://localhost:3000', 'https://yourdomain.com'],
'supports_credentials' => true,
```

### Issue: 401 Unauthorized
**Solution**: Ensure you're logged in as platform admin. Check cookies in DevTools.

### Issue: CSRF token errors
**Solution**: Backend must have Sanctum configured:
```php
// config/sanctum.php
'stateful' => [
    'localhost:3000',
    'yourdomain.com',
],
```

### Issue: Versioning not triggering
**Solution**: Plan must have `in_use: true` (has subscribers). Check by looking at plan detail - should show "In Use" badge.

### Issue: LocalizedInput not showing Arabic
**Solution**: Arabic content must be in the `ar` field of the object. Check browser console for errors.

### Issue: Money amounts wrong
**Solution**: Remember all amounts are in CENTS (integer). $99.00 = 9900 cents.

---

## 📝 Common Tasks

### Add a New Feature
1. Add to `FEATURE_METADATA` in `lib/types/plan.ts`
2. Component will auto-render it in forms
3. No other changes needed

### Add a New Currency
1. Update currency Select in Create/Edit pages
2. Add symbol mapping in `MoneyInput.tsx` `getCurrencySymbol()`

### Change Tier Options
1. Update `TIER_METADATA` in `lib/types/plan.ts`
2. Components will auto-update

### Add a New Error Code
1. Add to `PLAN_ERROR_CODES` in `lib/types/plan.ts`
2. Error handling will auto-map it

---

## 🎨 Customization

### Change Warning Banner Color
```typescript
// In app/[locale]/(dashboard)/billing/plans/[id]/page.tsx
<Alert variant="destructive"> // Current
<Alert variant="warning">     // Alternative
```

### Change Success Modal Behavior
```typescript
// In handleVersionModalClose()
// Current: Auto-navigate to new plan
router.push(`/${locale}/billing/plans/${versionResult.meta.new_plan_id}`);

// Alternative: Stay on list page
router.push(`/${locale}/billing/plans`);
```

### Add Custom Validation
```typescript
// In handleSubmit() of Create/Edit pages
if (!name.en.trim()) {
  toast.error('English name is required');
  return;
}

// Add your custom validation here
if (trialDays > 90) {
  toast.error('Trial cannot exceed 90 days');
  return;
}
```

---

## 📖 Further Reading

- **Backend API Contract**: See `PLAN_MANAGEMENT_COMPLETE.md`
- **Architecture Details**: See `PLAN_MANAGEMENT_UI_RECONNAISSANCE.md`
- **Progress Tracking**: See `PLAN_MANAGEMENT_UI_PROGRESS.md`
- **Full Implementation**: See `PLAN_MANAGEMENT_UI_COMPLETE.md`

---

## 🆘 Getting Help

### For Development Issues
1. Check browser console for errors
2. Check Network tab for API responses
3. Check backend logs: `storage/logs/billing-*.log`
4. Review error code in `PLAN_ERROR_CODES`

### For Questions
- Backend team: API endpoint issues, error codes, Stripe integration
- Frontend team: UI/UX, component usage, routing
- QA team: Testing scenarios, edge cases

---

**Happy coding!** 🚀

