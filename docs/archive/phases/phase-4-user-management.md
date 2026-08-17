# Phase 4: User Management

> Merged from the original **PHASE_4_PLAN.md** (proposal) and **PHASE_4_COMPLETE.md** (outcome) files during doc cleanup, content otherwise unchanged.

---

## 📋 Plan


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

---

## ✅ Outcome


**Completion Date**: July 15, 2026

---

## 🎯 Objectives Achieved

Phase 4 successfully implements comprehensive user management features:

1. ✅ Users list page with data table
2. ✅ User detail page with statistics
3. ✅ Search and filter functionality
4. ✅ Sorting on all columns
5. ✅ Pagination
6. ✅ Reusable UI components
7. ✅ Mock data system with 73 users
8. ✅ Responsive design
9. ✅ Dark mode support

---

## 📁 Files Created

### UI Components
- `components/ui/badge.tsx` - Status and role badges with variants
- `components/ui/avatar.tsx` - User avatar with fallback
- `components/ui/search-input.tsx` - Debounced search input
- `components/ui/pagination.tsx` - Pagination controls
- `components/ui/data-table.tsx` - Reusable sortable data table

### Types
- `lib/types/user.ts` - User, UserDetail, PaginatedResponse, UserFilters types

### API Client
- `lib/api/endpoints/users.ts` - Users API endpoints with mock data

### Pages
- `app/[locale]/(dashboard)/users/page.tsx` - Users list page
- `app/[locale]/(dashboard)/users/[id]/page.tsx` - User detail page

### Translations
- Updated `locales/en.json` with user management translations

---

## 🎨 Features Implemented

### Users List Page (`/users`)

**Data Table**:
- Sortable columns (user, role, status, stores, joined)
- Avatar display with fallback to initials
- Badge indicators for status and role
- Action buttons (view, suspend/activate, more)
- Empty state and loading state
- Responsive layout

**Search & Filters**:
- Search by name or email (debounced 300ms)
- Filter by role (super_admin, merchant, user)
- Filter by status (active, suspended, inactive)
- Clear visual feedback

**Pagination**:
- Smart page number display (ellipsis for large page counts)
- Previous/Next navigation
- Shows current range and total count
- Keyboard accessible

### User Detail Page (`/users/:id`)

**User Information**:
- Large avatar with fallback
- Name, email, role, status badges
- Email verification indicator
- Joined date and last login

**Statistics Cards**:
- Active Stores count
- Total Revenue with formatting
- Total Orders count
- Total Stores count (including inactive)

**Recent Activity**:
- Last 5 user actions
- Activity type and description
- Relative time display (e.g., "2 hours ago")

**User Stores**:
- List of all user's stores
- Store name, domain, status, and creation date
- Status badges for each store

**Actions**:
- Edit user button (placeholder)
- Suspend/Activate toggle with confirmation
- Delete user with confirmation dialog
- Back to users list button

---

## 🛠️ Technical Implementation

### Reusable Components

**Badge Component**:
- 7 variants: default, secondary, destructive, outline, success, warning, info
- Uses `class-variance-authority` for type-safe variants
- Accessible and semantic

**Avatar Component**:
- Uses `@radix-ui/react-avatar`
- Image with automatic fallback
- Supports custom sizes via className
- Accessible alt text

**SearchInput Component**:
- Debounced search (300ms default)
- Search icon indicator
- Accessible label support
- Controlled input with React state

**Pagination Component**:
- Smart ellipsis logic (shows max 7 page numbers)
- Always shows first and last page
- Shows pages around current page
- Disabled state for first/last page
- Keyboard accessible buttons

**DataTable Component**:
- Generic TypeScript component `<T>`
- Sortable columns with visual indicators
- Custom render functions for complex cells
- Empty state message
- Hover effects on rows
- Responsive overflow handling

### Mock Data System

**73 Mock Users**:
- Realistic names (English and Arabic names)
- Various roles and statuses
- Random store counts (0-4)
- Email verification status
- Created dates spanning 1 year
- Updated dates within last 30 days

**Mock User Details**:
- Generated statistics (orders, revenue)
- 5 recent activities per user
- Store list based on stores_count
- Last login within past 7 days

### API Client

**Endpoints Implemented**:
- `getUsers(filters)` - Paginated list with search/filter/sort
- `getUser(id)` - Single user with full details
- `updateUser(id, data)` - Update user properties
- `suspendUser(id)` - Set status to suspended
- `activateUser(id)` - Set status to active
- `deleteUser(id)` - Remove user from list

**Features**:
- 500ms simulated API delay for realistic UX
- Client-side filtering and sorting
- Pagination logic
- Error handling

---

## 🎨 UI/UX Highlights

### Design System Consistency
- Uses design tokens from Tailwind CSS
- Consistent spacing and sizing
- Follows shadcn/ui patterns
- Accessible color contrast

### Responsive Design
- Mobile-first approach
- Stacked layout on mobile
- Side-by-side layout on desktop
- Horizontal scroll for table on mobile

### Dark Mode Support
- All components work in dark mode
- Proper contrast ratios
- Themed badge colors
- No hardcoded colors

### User Feedback
- Loading states during data fetch
- Empty states with helpful messages
- Hover effects on interactive elements
- Visual feedback on actions
- Confirmation dialogs for destructive actions

---

## 📊 Data Flow

### Users List Page
```
1. Component mounts
2. Fetch users with initial filters (page 1, 20 per page, sort by created_at desc)
3. Display loading state
4. Render data table with users
5. User interacts (search/filter/sort/paginate)
6. Update filters state
7. Re-fetch users with new filters
8. Display loading state
9. Render updated data table
```

### User Detail Page
```
1. Component mounts with user ID from URL
2. Fetch user details
3. Display loading state
4. Render user information, stats, activity, stores
5. User clicks action (suspend/activate/delete)
6. Show confirmation if needed
7. Call API endpoint
8. Update local state or redirect
```

---

## 🔄 Integration Points

### Ready for Backend Integration

When backend is ready, replace mock data in `lib/api/endpoints/users.ts`:

```typescript
// Replace this:
const mockUsers = generateMockUsers(73);

// With actual API calls:
async getUsers(filters?: UserFilters) {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.role) params.set('role', filters.role);
  // ... add other filters
  
  const response = await apiClient.get(`/api/v1/platform/users?${params}`);
  return response.data;
}
```

**Expected Backend API Format**:
```typescript
GET /api/v1/platform/users?page=1&per_page=20&search=john&role=merchant&status=active&sort=created_at&order=desc

Response: {
  data: User[],
  meta: {
    current_page: number,
    total: number,
    per_page: number,
    last_page: number
  }
}
```

---

## 🧪 Testing Checklist

Manual testing performed:

- ✅ Build succeeds without errors
- ✅ TypeScript type checking passes
- ✅ All routes are accessible
- ✅ Navigation link works
- ✅ Data table renders correctly
- ✅ Search functionality works
- ✅ Role filter works
- ✅ Status filter works
- ✅ Sorting works on all columns
- ✅ Pagination works correctly
- ✅ User detail page renders
- ✅ Back button works
- ✅ Action buttons work
- ✅ Responsive on mobile
- ✅ Dark mode works
- ✅ RTL layout works (Arabic)

---

## 📝 Next Steps (Phase 5 Preview)

Phase 5 will implement **Store Management**:

1. Stores list page with data table
2. Store detail page with metrics
3. Store creation wizard
4. Domain configuration
5. Store suspension/activation
6. Store owner management
7. Revenue and order analytics per store

Similar structure to user management but with store-specific features.

---

## 🔗 Routes

- `/en/users` - Users list page
- `/en/users/:id` - User detail page
- `/ar/users` - Users list (Arabic)
- `/ar/users/:id` - User detail (Arabic)

---

## 📦 Dependencies Added

- `@radix-ui/react-avatar` - Avatar component primitives
- `class-variance-authority` - Type-safe component variants

Existing dependencies used:
- `date-fns` - Date formatting and relative time
- `lucide-react` - Icons
- `next-intl` - Internationalization

---

## 🎉 Phase 4 Success Metrics

- **8 new files** created
- **2 new dependencies** added
- **1 locale file** updated
- **73 mock users** generated
- **6 API endpoints** implemented
- **5 reusable components** created
- **2 pages** built
- **100% TypeScript** type safety
- **0 build errors**
- **Fully responsive** design
- **Dark mode** compatible
- **RTL** ready

---

**Phase 4 is complete and ready for testing!** 🚀

Navigate to `/users` to see the user management features in action.
