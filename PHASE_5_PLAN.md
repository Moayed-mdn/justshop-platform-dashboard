# Phase 5: Store Management

**Goal**: Build comprehensive store management pages for viewing, searching, and managing platform stores

---

## Features to Implement

### 1. Stores List Page
- **Data Table**: Paginated list of all stores
- **Search**: Search by store name, domain
- **Filters**: Filter by status, owner, date created
- **Sort**: Sort by any column
- **Actions**: View, Edit, Suspend, Delete, Configure

### 2. Store Detail Page
- **Store Info**: Name, domain, logo, status, owner
- **Statistics**: Total orders, revenue, products, customers
- **Activity**: Recent store actions
- **Configuration**: Store settings preview
- **Actions**: Edit, Suspend, Delete, View Storefront

### 3. Store Creation (Optional for this phase)
- Multi-step wizard for creating new stores
- Basic info, domain setup, theme selection
- Owner assignment

---

## UI Components Needed

All major components already exist from Phase 4:
- ✅ Data Table
- ✅ Search Input
- ✅ Pagination
- ✅ Badge
- ✅ Avatar (for owner)
- ✅ Dropdown Menu
- ✅ Dialog

New components:
- Store logo display component
- Domain status indicator
- Revenue chart (mini version)

---

## Backend API Endpoints Needed

```typescript
// List stores with pagination
GET /api/v1/platform/stores
  ?page=1
  &per_page=20
  &search=mystore
  &status=active
  &owner_id=5
  &sort=created_at
  &order=desc

Response: {
  data: Store[],
  meta: {
    current_page: 1,
    total: 200,
    per_page: 20,
    last_page: 10
  }
}

// Get single store
GET /api/v1/platform/stores/:id

// Update store
PUT /api/v1/platform/stores/:id
Body: { name, domain, status, theme, settings }

// Suspend store
POST /api/v1/platform/stores/:id/suspend

// Activate store
POST /api/v1/platform/stores/:id/activate

// Delete store
DELETE /api/v1/platform/stores/:id
```

---

## Data Types

```typescript
interface Store {
  id: number;
  name: string;
  domain: string;
  subdomain: string;
  logo?: string;
  status: 'active' | 'suspended' | 'pending' | 'inactive';
  owner_id: number;
  owner_name: string;
  owner_email: string;
  theme: string;
  products_count: number;
  orders_count: number;
  customers_count: number;
  created_at: string;
  updated_at: string;
}

interface StoreDetail extends Store {
  stats: {
    total_orders: number;
    total_revenue: number;
    total_products: number;
    total_customers: number;
    orders_this_month: number;
    revenue_this_month: number;
  };
  recent_orders: {
    id: number;
    order_number: string;
    customer_name: string;
    amount: number;
    status: string;
    created_at: string;
  }[];
  settings: {
    currency: string;
    timezone: string;
    language: string;
    tax_enabled: boolean;
    shipping_enabled: boolean;
  };
}

interface StoreFilters {
  search?: string;
  status?: Store['status'];
  owner_id?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}
```

---

## Implementation Steps

### Step 1: Create Types
- `lib/types/store.ts`
- Store, StoreDetail, StoreFilters, StoreStats

### Step 2: Create API Client
- `lib/api/endpoints/stores.ts`
- Mock data for ~50 stores
- CRUD operations

### Step 3: Build Stores List Page
- `app/[locale]/(dashboard)/stores/page.tsx`
- Reuse DataTable component
- Search, filter, sort, paginate
- Status badges and owner info

### Step 4: Build Store Detail Page
- `app/[locale]/(dashboard)/stores/[id]/page.tsx`
- Store information card
- Statistics cards
- Recent orders table
- Settings preview

### Step 5: Add Edit Functionality
- `components/stores/edit-store-dialog.tsx`
- Form for store name, domain, status
- Owner assignment dropdown

### Step 6: Update Navigation
- Already exists! "Stores" link is in sidebar

### Step 7: Add Translations
- Update `locales/en.json` and `locales/ar.json`
- Store-specific translations

---

## Mock Data

For development without backend:
- Generate 50+ mock stores
- Different statuses (active, pending, suspended)
- Different owners (link to mock users)
- Realistic store names and domains
- Random statistics and orders

---

## Success Criteria

Phase 5 is complete when:

- ✅ Stores list page displays paginated stores
- ✅ Search functionality works
- ✅ Filters work (status, owner)
- ✅ Sorting works on all columns
- ✅ Store detail page shows full info
- ✅ Statistics cards display correctly
- ✅ Recent orders table works
- ✅ Suspend/activate actions work
- ✅ Edit store dialog works
- ✅ Delete store works
- ✅ Navigation includes Stores link (already exists)
- ✅ Responsive on mobile
- ✅ Loading and empty states work
- ✅ Mock data system in place

---

## Timeline Estimate

- **Step 1**: Types - 10 min
- **Step 2**: API Client - 20 min
- **Step 3**: Stores List Page - 30 min
- **Step 4**: Store Detail Page - 40 min
- **Step 5**: Edit Dialog - 20 min
- **Step 6**: Navigation - 0 min (already done)
- **Step 7**: Translations - 10 min

**Total**: ~2 hours

---

## Key Differences from Users

While similar to User Management, stores have:
- **Domain/Subdomain** instead of email
- **Owner relationship** (belongs to a user)
- **Store-specific stats** (products, orders, revenue)
- **Store settings** (currency, timezone, etc.)
- **Recent orders** instead of recent activity
- **Theme/branding** options

---

**Ready to start!** 🚀

