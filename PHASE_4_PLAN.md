# Phase 4: User Management

**Goal**: Build comprehensive user management pages for viewing, searching, and managing platform users

---

## Features to Implement

### 1. Users List Page
- **Data Table**: Paginated list of all users
- **Search**: Search by name, email
- **Filters**: Filter by status, role, date joined
- **Sort**: Sort by any column
- **Actions**: View, Edit, Suspend, Delete

### 2. User Detail Page
- **User Info**: Name, email, avatar, role
- **Statistics**: Orders, stores owned, revenue
- **Activity**: Recent user actions
- **Stores**: List of user's stores
- **Actions**: Edit, Suspend, Delete, Impersonate

### 3. Data Table Component
- **Reusable**: Can be used for users, stores, orders
- **Features**: Pagination, sorting, filtering
- **Responsive**: Mobile-friendly
- **Selection**: Bulk actions support

---

## UI Components Needed

### 1. Data Table
- Table header with sortable columns
- Table rows with user data
- Pagination controls
- Empty state
- Loading state

### 2. Search & Filters
- Search input with debounce
- Filter dropdowns (role, status)
- Date range picker
- Clear filters button

### 3. User Avatar
- Display user image or initials
- Fallback to default avatar
- Size variants (sm, md, lg)

### 4. Status Badge
- Visual indicator (active, suspended, etc.)
- Color variants (green, red, yellow)
- Icon support

### 5. Action Buttons
- View button
- Edit button
- Suspend/Activate toggle
- Delete button with confirmation

---

## Backend API Endpoints Needed

```typescript
// List users with pagination
GET /api/v1/platform/users
  ?page=1
  &per_page=20
  &search=john
  &role=merchant
  &status=active
  &sort=created_at
  &order=desc

Response: {
  data: User[],
  meta: {
    current_page: 1,
    total: 150,
    per_page: 20,
    last_page: 8
  }
}

// Get single user
GET /api/v1/platform/users/:id

// Update user
PUT /api/v1/platform/users/:id
Body: { name, email, role, status }

// Suspend user
POST /api/v1/platform/users/:id/suspend

// Activate user
POST /api/v1/platform/users/:id/activate

// Delete user
DELETE /api/v1/platform/users/:id
```

---

## Implementation Steps

### Step 1: Create UI Components
- Badge component for status
- Avatar component for user images
- Data table component (reusable)
- Pagination component
- Search input component

### Step 2: Create API Client
- `lib/api/endpoints/users.ts`
- Functions for CRUD operations
- Mock data for development

### Step 3: Build Users List Page
- `app/[locale]/(dashboard)/users/page.tsx`
- Fetch and display users
- Search and filter functionality
- Pagination

### Step 4: Build User Detail Page
- `app/[locale]/(dashboard)/users/[id]/page.tsx`
- Display user information
- Show user statistics
- Edit/suspend/delete actions

### Step 5: Add to Navigation
- Update sidebar navigation
- Add "Users" menu item
- Icon: Users from lucide-react

---

## Data Types

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  status: 'active' | 'suspended' | 'inactive';
  email_verified: boolean;
  stores_count: number;
  created_at: string;
  updated_at: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}
```

---

## Mock Data

For development without backend:
- Generate 50+ mock users
- Different roles (super_admin, merchant, user)
- Various statuses (active, suspended)
- Realistic names and emails

---

## Success Criteria

Phase 4 is complete when:

- ✅ Users list page displays paginated users
- ✅ Search functionality works
- ✅ Filters work (role, status)
- ✅ Sorting works on all columns
- ✅ User detail page shows full info
- ✅ Suspend/activate actions work
- ✅ Navigation includes Users link
- ✅ Responsive on mobile
- ✅ Loading and empty states work
- ✅ Mock data system in place

---

## Timeline Estimate

- **Step 1**: UI Components - 30 min
- **Step 2**: API Client - 15 min
- **Step 3**: Users List Page - 30 min
- **Step 4**: User Detail Page - 30 min
- **Step 5**: Navigation - 10 min

**Total**: ~2 hours

---

**Ready to start!** 🚀
