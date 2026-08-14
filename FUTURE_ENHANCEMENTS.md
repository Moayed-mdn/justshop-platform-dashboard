# Platform Dashboard - Future Enhancements

## Overview
This document outlines planned enhancements for the platform dashboard to be implemented when backend support is ready.

---

## 1. Revenue Tracking 💰

### Backend Requirements
**Controller:** `PlatformDashboardController` or new `PlatformRevenueController`

**Endpoint:** `GET /api/v1/platform/dashboard/revenue`

**Required Data:**
```json
{
  "success": true,
  "data": {
    "total": 125000.00,
    "thisMonth": 15000.00,
    "lastMonth": 12000.00,
    "growth": 25.0,
    "direction": "up",
    "byMonth": [
      { "month": "2024-01", "revenue": 10000, "label": "Jan" },
      { "month": "2024-02", "revenue": 12000, "label": "Feb" }
    ],
    "byStore": [
      { "storeId": 1, "storeName": "Store A", "revenue": 50000 },
      { "storeName": "Store B", "revenue": 45000 }
    ],
    "topProducts": [
      { "productName": "Product X", "revenue": 8000, "units": 120 }
    ]
  }
}
```

### Frontend Changes Needed
1. Update `lib/api/endpoints/dashboard.ts`:
   - Implement proper `getRevenueData()` function
   - Map backend response to chart format

2. Update `app/[locale]/(dashboard)/page.tsx`:
   - Fetch revenue data in useEffect
   - Display revenue chart
   - Show monthly breakdown

3. Add new components (optional):
   - `<RevenueChart />` - Dedicated revenue visualization
   - `<TopStoresWidget />` - Top performing stores
   - `<RevenueBreakdown />` - Revenue by category

---

## 2. Orders Tracking 📦

### Backend Requirements
**Controller:** `PlatformOrderController`

**Endpoint:** `GET /api/v1/platform/dashboard/orders`

**Required Data:**
```json
{
  "success": true,
  "data": {
    "total": 5420,
    "thisMonth": 450,
    "lastMonth": 380,
    "pending": 23,
    "processing": 45,
    "completed": 5300,
    "cancelled": 52,
    "growth": 18.4,
    "direction": "up",
    "byDate": [
      { "date": "2024-01-01", "count": 15 },
      { "date": "2024-01-02", "count": 18 }
    ],
    "byStatus": [
      { "status": "Pending", "count": 23 },
      { "status": "Processing", "count": 45 },
      { "status": "Completed", "count": 5300 },
      { "status": "Cancelled", "count": 52 }
    ]
  }
}
```

### Frontend Changes Needed
1. Update KPI cards to show real order counts
2. Add orders growth chart
3. Add orders status breakdown widget
4. Link to detailed orders management page

---

## 3. Recent Activity Feed 📋

### Backend Requirements
**Controller:** `PlatformActivityController`

**Endpoint:** `GET /api/v1/platform/dashboard/recent-activity`

**Query Parameters:**
- `limit` - Number of activities to return (default: 10)
- `type` - Filter by activity type (optional)
- `userId` - Filter by user (optional)

**Required Data:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": 1,
        "type": "user_registered",
        "title": "New user registered",
        "description": "John Doe signed up",
        "userId": 123,
        "userName": "John Doe",
        "timestamp": "2024-01-15T10:30:00Z",
        "icon": "user-plus",
        "metadata": { "email": "john@example.com" }
      },
      {
        "id": 2,
        "type": "store_created",
        "title": "New store created",
        "description": "Store 'Fashion Hub' was created",
        "storeId": 45,
        "storeName": "Fashion Hub",
        "timestamp": "2024-01-15T09:15:00Z",
        "icon": "store",
        "metadata": { "status": "pending" }
      },
      {
        "id": 3,
        "type": "order_completed",
        "title": "Order completed",
        "description": "Order #12345 was completed",
        "orderId": 12345,
        "timestamp": "2024-01-15T08:45:00Z",
        "icon": "check-circle",
        "metadata": { "total": 150.00 }
      }
    ],
    "hasMore": true,
    "total": 1250
  }
}
```

**Activity Types:**
- `user_registered` - New user signup
- `user_suspended` - User account suspended
- `store_created` - New store created
- `store_activated` - Store approved/activated
- `store_suspended` - Store suspended
- `order_completed` - Order completed
- `payment_received` - Payment processed
- `subscription_started` - New subscription
- `subscription_cancelled` - Subscription cancelled
- `feature_flag_toggled` - Feature flag changed
- `cms_published` - Content published

### Frontend Changes Needed
1. Create `<RecentActivityWidget />` component
2. Update `lib/api/endpoints/dashboard.ts`:
   ```typescript
   export async function getRecentActivity(limit: number = 10): Promise<RecentActivity> {
     const response = await fetch(
       `${BASE_URL}/api/v1/platform/dashboard/recent-activity?limit=${limit}`,
       {
         credentials: 'include',
         headers: { 'Accept': 'application/json' },
       }
     );
     
     if (!response.ok) {
       throw new Error('Failed to fetch recent activity');
     }
     
     const result = await response.json();
     return result.data;
   }
   ```

3. Add to dashboard page:
   ```typescript
   const [activities, setActivities] = useState<RecentActivity | null>(null);
   
   // In useEffect:
   const activityData = await getRecentActivity(10);
   setActivities(activityData);
   ```

4. Display activity feed with:
   - Icon for each activity type
   - Timestamp (relative: "2 hours ago")
   - Link to related resource
   - "View All" link to full activity log

---

## 4. Store Status Details 🏪

### Backend Enhancement
**Endpoint:** `GET /api/v1/platform/dashboard` (enhance existing)

**Add to response:**
```json
{
  "stores": {
    "total": 45,
    "active": 40,
    "pending": 3,
    "suspended": 2,
    "statusBreakdown": [
      { "status": "active", "count": 40, "percentage": 88.9 },
      { "status": "pending", "count": 3, "percentage": 6.7 },
      { "status": "suspended", "count": 2, "percentage": 4.4 }
    ]
  }
}
```

### Frontend Changes
Already partially implemented - just needs backend to return the breakdown data.

---

## 5. Advanced Analytics 📊

### New Features to Add

#### A. User Demographics
- User growth by country/region
- User retention rate
- Active vs inactive users
- User engagement metrics

#### B. Store Performance
- Average revenue per store
- Product count distribution
- Store activity levels
- Time to first sale

#### C. Platform Health
- API response times
- Error rates
- Uptime percentage
- Database performance metrics

#### D. Financial Metrics
- Monthly Recurring Revenue (MRR)
- Customer Lifetime Value (CLV)
- Churn rate
- Average order value

---

## 6. Filtering and Date Ranges 📅

### Feature Description
Allow users to filter dashboard data by date ranges.

### UI Components Needed
```typescript
<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
  presets={[
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'Last 90 days', value: '90d' },
    { label: 'Last 12 months', value: '12m' },
    { label: 'Custom', value: 'custom' }
  ]}
/>
```

### Backend Changes
All endpoints should accept date range parameters:
- `startDate` - ISO 8601 date string
- `endDate` - ISO 8601 date string
- `period` - Shorthand like '30d', '12m'

---

## 7. Export Functionality 📥

### Features
1. Export dashboard stats as PDF
2. Export charts as PNG/SVG
3. Export data as CSV/Excel
4. Schedule automated reports

### Backend Endpoints
```
POST /api/v1/platform/dashboard/export
POST /api/v1/platform/reports/schedule
GET  /api/v1/platform/reports/:id/download
```

---

## 8. Real-time Updates 🔄

### Implementation
Use WebSockets or Server-Sent Events (SSE) for real-time dashboard updates.

### Events to Stream
- New user registration
- New store creation
- Order completion
- Payment received
- Critical system events

### Frontend Implementation
```typescript
useEffect(() => {
  const eventSource = new EventSource(
    `${BASE_URL}/api/v1/platform/dashboard/stream`
  );
  
  eventSource.addEventListener('stats_update', (event) => {
    const data = JSON.parse(event.data);
    setStats(data);
  });
  
  return () => eventSource.close();
}, []);
```

---

## 9. Dashboard Customization 🎨

### Features
- Drag-and-drop widget reordering
- Show/hide specific widgets
- Custom KPI selection
- Save user preferences
- Multiple dashboard views

---

## 10. Alerts and Notifications 🔔

### Alert Types
- Low revenue warning
- High order volume
- Store suspension needed
- System health issues
- Unusual activity patterns

### UI Components
```typescript
<AlertsWidget
  alerts={[
    {
      type: 'warning',
      title: 'High pending stores',
      description: '5 stores awaiting approval',
      action: 'Review stores',
      link: '/stores?status=pending'
    }
  ]}
/>
```

---

## Implementation Priority

### High Priority (Next Sprint)
1. ✅ Revenue tracking - Essential for business metrics
2. ✅ Orders tracking - Core e-commerce functionality
3. ✅ Recent activity feed - Improves oversight

### Medium Priority (Future Sprint)
4. Store status details - Already partially implemented
5. Date range filtering - Improves data exploration
6. Advanced analytics - Adds business value

### Low Priority (Future Enhancement)
7. Export functionality - Nice to have
8. Real-time updates - Performance consideration needed
9. Dashboard customization - UX improvement
10. Alerts and notifications - Operational improvement

---

## Notes for Implementation

1. **Incremental Approach**: Implement features one at a time, test thoroughly
2. **Backend First**: Always implement backend endpoints before frontend
3. **Error Handling**: Ensure graceful degradation if data is not available
4. **Performance**: Consider caching for expensive queries
5. **Security**: All endpoints must be protected with proper authentication
6. **Documentation**: Update API docs with each new endpoint

---

## Related Files

- Frontend API Client: `lib/api/endpoints/dashboard.ts`
- Dashboard Page: `app/[locale]/(dashboard)/page.tsx`
- Backend Routes: `laratenant-backend/routes/api/v1/platform/platform.php`
- Backend Controller: `laratenant-backend/app/Http/Controllers/Api/Platform/PlatformDashboardController.php`

---

**Last Updated:** January 2024
**Status:** Planning Document
