# Phase 7: Audit Logs

**Goal**: Build audit log system to track all platform activities and user actions

---

## Features to Implement

### 1. Audit Logs Page
- **Activity Timeline**: Chronological list of all activities
- **Search**: Search by action, user, resource
- **Filters**: Filter by date range, user, action type, resource type
- **Sort**: Sort by date, user, action
- **Export**: Export logs to CSV/JSON (placeholder)

### 2. Activity Types to Track
- User actions (login, logout, profile updates)
- Store actions (create, update, suspend, delete)
- Content actions (blog post created, page published)
- System events (errors, warnings, maintenance)
- Admin actions (user suspended, store deleted)

### 3. Log Details
- Timestamp (precise date and time)
- User who performed the action
- Action type (created, updated, deleted, etc.)
- Resource type (user, store, blog post, etc.)
- Resource ID and name
- IP address (optional)
- User agent (optional)
- Changes made (before/after values)

---

## UI Components Needed

All major components already exist:
- ✅ Data Table
- ✅ Search Input
- ✅ Pagination
- ✅ Badge
- ✅ Avatar
- ✅ Dropdown Menu

New components needed:
- Timeline component (for visual activity feed)
- Date range picker (for filtering)
- Export button with dropdown

---

## Backend API Endpoints Needed

```typescript
// Get audit logs
GET /api/v1/platform/audit
  ?page=1
  &per_page=20
  &search=john
  &user_id=5
  &action=created
  &resource_type=store
  &date_from=2026-01-01
  &date_to=2026-12-31
  &sort=created_at
  &order=desc

Response: {
  data: AuditLog[],
  meta: {
    current_page: 1,
    total: 1000,
    per_page: 20,
    last_page: 50
  }
}

// Get single audit log detail
GET /api/v1/platform/audit/:id

// Export audit logs
POST /api/v1/platform/audit/export
Body: { format: 'csv' | 'json', filters: {...} }
```

---

## Data Types

```typescript
interface AuditLog {
  id: number;
  user_id: number;
  user_name: string;
  user_avatar?: string;
  action: string; // 'created', 'updated', 'deleted', 'suspended', 'activated', 'login', 'logout'
  resource_type: string; // 'user', 'store', 'blog_post', 'page', 'doc', 'system'
  resource_id?: number;
  resource_name?: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  changes?: {
    before: any;
    after: any;
  };
  created_at: string;
}

interface AuditFilters {
  search?: string;
  user_id?: number;
  action?: string;
  resource_type?: string;
  date_from?: string;
  date_to?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}
```

---

## Implementation Steps

### Step 1: Create Types
- `lib/types/audit.ts`
- AuditLog, AuditFilters types

### Step 2: Create API Client
- `lib/api/endpoints/audit.ts`
- Mock data for 200+ audit logs
- Various action types and resource types

### Step 3: Build Audit Logs Page
- `app/[locale]/(dashboard)/audit/page.tsx`
- Timeline view of activities
- Search and filters
- Pagination

### Step 4: Add Timeline Component (Optional)
- `components/audit/timeline.tsx`
- Visual activity feed
- Color-coded by action type

### Step 5: Add Export Button
- Export dropdown (CSV/JSON)
- Placeholder functionality

### Step 6: Add Translations
- Update locale files

---

## Mock Data

For development without backend:
- 200+ audit log entries
- Various users performing actions
- Different resource types (users, stores, content)
- Mix of action types (create, update, delete, login, etc.)
- Realistic timestamps (last 30 days)
- Some with IP addresses and user agents
- Some with before/after changes

---

## Success Criteria

Phase 7 is complete when:

- ✅ Audit logs page displays timeline
- ✅ Search functionality works
- ✅ Filters work (user, action, resource, date)
- ✅ Sorting works
- ✅ Pagination works
- ✅ Action badges are color-coded
- ✅ User avatars display
- ✅ Resource links work (navigate to resource)
- ✅ Export button shows options
- ✅ Responsive design
- ✅ Mock data in place

---

## Timeline Estimate

- **Step 1**: Types - 10 min
- **Step 2**: API Client - 30 min
- **Step 3**: Audit Page - 45 min
- **Step 4**: Timeline Component - 20 min (optional)
- **Step 5**: Export Button - 10 min
- **Step 6**: Translations - 10 min

**Total**: ~2 hours

---

## Key Features

### Visual Activity Feed
- Timeline view with icons
- Color-coded by action type (green=create, blue=update, red=delete)
- User avatars
- Relative timestamps

### Advanced Filtering
- Date range picker
- User selector
- Action type filter
- Resource type filter
- Combine multiple filters

### Detailed Information
- Who did what, when
- Before/after values for updates
- IP address and user agent
- Direct links to resources

---

**Ready to start!** 🚀

