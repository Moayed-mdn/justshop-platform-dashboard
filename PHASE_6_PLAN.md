# Phase 6: CMS Management

**Goal**: Build content management system for Blog posts, Pages, and Documentation

---

## Features to Implement

### 1. CMS Overview Page
- Dashboard showing content statistics
- Quick access to Blog, Pages, Documentation sections
- Recent content activity
- Content status breakdown

### 2. Blog Management
- **List Page**: All blog posts with search/filter
- **Detail Page**: View single blog post
- **Create/Edit**: Rich text editor for creating posts
- Categories and tags
- Featured images
- SEO metadata

### 3. Pages Management
- **List Page**: All static pages
- **Detail Page**: View single page
- **Create/Edit**: Page builder or editor
- Page templates
- Navigation hierarchy

### 4. Documentation Management
- **List Page**: All documentation articles
- **Detail Page**: View single doc
- **Create/Edit**: Markdown or rich text editor
- Categories/sections
- Version control
- Search indexing

---

## UI Components Needed

All major components already exist:
- ✅ Data Table
- ✅ Search Input
- ✅ Pagination
- ✅ Badge
- ✅ Dropdown Menu
- ✅ Dialog

New components needed:
- Tabs component (for Blog/Pages/Docs sections)
- Status indicator for draft/published
- Content preview card
- Rich text editor (optional for this phase)

---

## Backend API Endpoints Needed

```typescript
// Blog Posts
GET /api/v1/platform/cms/blog
GET /api/v1/platform/cms/blog/:id
POST /api/v1/platform/cms/blog
PUT /api/v1/platform/cms/blog/:id
DELETE /api/v1/platform/cms/blog/:id

// Pages
GET /api/v1/platform/cms/pages
GET /api/v1/platform/cms/pages/:id
POST /api/v1/platform/cms/pages
PUT /api/v1/platform/cms/pages/:id
DELETE /api/v1/platform/cms/pages/:id

// Documentation
GET /api/v1/platform/cms/docs
GET /api/v1/platform/cms/docs/:id
POST /api/v1/platform/cms/docs
PUT /api/v1/platform/cms/docs/:id
DELETE /api/v1/platform/cms/docs/:id

// CMS Stats
GET /api/v1/platform/cms/stats
```

---

## Data Types

```typescript
interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  status: 'draft' | 'published' | 'archived';
  author_id: number;
  author_name: string;
  author_avatar?: string;
  category: string;
  tags: string[];
  views_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  template: string;
  status: 'draft' | 'published' | 'archived';
  author_id: number;
  author_name: string;
  parent_id?: number;
  order: number;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

interface Documentation {
  id: number;
  title: string;
  slug: string;
  content: string;
  category: string;
  order: number;
  status: 'draft' | 'published' | 'archived';
  author_id: number;
  author_name: string;
  version: string;
  views_count: number;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

interface CMSStats {
  blog: {
    total: number;
    published: number;
    draft: number;
    archived: number;
  };
  pages: {
    total: number;
    published: number;
    draft: number;
  };
  docs: {
    total: number;
    published: number;
    draft: number;
  };
}
```

---

## Implementation Steps

### Step 1: Create Types
- `lib/types/cms.ts`
- BlogPost, Page, Documentation, CMSStats

### Step 2: Create API Client
- `lib/api/endpoints/cms.ts`
- Mock data for blog posts, pages, docs
- CRUD operations for all three

### Step 3: Create Tabs Component
- `components/ui/tabs.tsx`
- For switching between Blog/Pages/Docs

### Step 4: Build CMS Overview Page
- `app/[locale]/(dashboard)/cms/page.tsx`
- Stats cards for blog/pages/docs
- Tabs for switching content types
- Combined content list

### Step 5: Build Blog List Page
- `app/[locale]/(dashboard)/cms/blog/page.tsx`
- List of blog posts
- Search, filter by category, status
- View/edit/delete actions

### Step 6: Build Blog Detail Page
- `app/[locale]/(dashboard)/cms/blog/[id]/page.tsx`
- Full post display
- Author info, stats, metadata

### Step 7: Build Pages List Page
- `app/[locale]/(dashboard)/cms/pages/page.tsx`
- Similar to blog but for static pages

### Step 8: Build Documentation List Page
- `app/[locale]/(dashboard)/cms/docs/page.tsx`
- Similar to blog but for documentation

### Step 9: Add Translations
- Update locale files

---

## Mock Data

For development without backend:
- 30+ blog posts
- 15+ static pages
- 20+ documentation articles
- Different statuses and categories
- Various authors (link to mock users)
- Realistic content snippets

---

## Success Criteria

Phase 6 is complete when:

- ✅ CMS overview page displays statistics
- ✅ Blog list page works with search/filter
- ✅ Blog detail page displays full content
- ✅ Pages list page works
- ✅ Docs list page works
- ✅ All CRUD operations work
- ✅ Tabs component works
- ✅ Status badges work
- ✅ Navigation updated
- ✅ Responsive design
- ✅ Mock data in place

---

## Timeline Estimate

- **Step 1**: Types - 15 min
- **Step 2**: API Client - 30 min
- **Step 3**: Tabs Component - 15 min
- **Step 4**: CMS Overview - 30 min
- **Step 5**: Blog Pages - 40 min
- **Step 6**: Blog Detail - 20 min
- **Step 7**: Pages List - 20 min
- **Step 8**: Docs List - 20 min
- **Step 9**: Translations - 10 min

**Total**: ~3 hours

---

## Simplified Approach

For this phase, we'll focus on:
1. **CMS Overview** - Main hub with stats and tabs
2. **Blog Management** - Full implementation
3. **Pages List** - Basic implementation
4. **Docs List** - Basic implementation

We won't build full editors (that's a complex feature). Instead:
- View and list content
- Mock create/edit dialogs
- Focus on management and organization

---

**Ready to start!** 🚀

