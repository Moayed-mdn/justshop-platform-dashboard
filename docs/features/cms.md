# Platform CMS - Marketing Pages Management

## Overview

The Platform CMS provides a complete interface for managing marketing pages that are displayed on customer-facing storefronts. Platform administrators can create, edit, publish, and delete marketing content in both English and Arabic.

## Features

### ✅ Complete CRUD Operations
- **Create** new marketing pages with bilingual content
- **Read/View** page details with full metadata
- **Update** existing pages with version tracking
- **Delete** pages with confirmation
- **Publish** workflow for content approval

### ✅ Bilingual Support
- Full English and Arabic content support
- RTL (Right-to-Left) layout for Arabic
- Per-language fields: title, slug, excerpt, content, SEO metadata
- Automatic fallback to English if translation missing

### ✅ Marketing Page Types
Categorize pages by their purpose:
- **Home** - Main landing page
- **About** - About us page
- **Contact** - Contact information
- **Features** - Product features showcase
- **Enterprise** - Enterprise solutions
- **Pricing** - Pricing plans
- **Blog** - Blog landing page
- **Documentation** - Docs landing page
- **Demo** - Demo request page
- **Templates** - Templates showcase

### ✅ Publishing Workflow
- **Draft** - Work in progress, not visible publicly
- **Scheduled** - Set future publish date
- **Published** - Live and visible via public API

### ✅ SEO Optimization
- Meta title per language
- Meta description per language
- URL-friendly slugs with auto-generation
- Template selection for custom layouts

### ✅ Content Management
- Rich content fields (HTML support)
- Excerpt/summary fields
- Sort order for navigation
- Creator/updater tracking
- Timestamps (created, updated, published)

## User Interface

### Pages List (`/cms/pages`)
- Table view of all marketing pages
- **Search**: by title or slug
- **Filters**: 
  - Type (home, pricing, features, etc.)
  - Status (draft, published, scheduled)
- **Pagination**: Navigate through pages
- **Actions**: View, Edit, Delete
- **Quick Stats**: See page counts by status

### Page Detail (`/cms/pages/[id]`)
- Full page preview
- Content rendering (HTML)
- SEO metadata display
- Page information sidebar
  - Type and template
  - Sort order
  - Published date
  - Creator/updater
- **Actions**: Edit, Delete, Publish
- **Translations**: List of available languages

### Page Edit (`/cms/pages/[id]/edit`)
- Pre-filled form with existing data
- All fields editable
- **Actions**:
  - Update Page (save changes)
  - Save & Publish (save and publish in one click)

### Page Create (`/cms/pages/new`)
- Clean form for new pages
- Auto-slug generation from title
- **Actions**:
  - Create Page (save as draft/scheduled/published)
  - Save & Publish (quick publish)

## Form Fields

### Required Fields
- **Title (EN)** - English page title
- **Title (AR)** - Arabic page title
- **Slug (EN)** - English URL slug
- **Slug (AR)** - Arabic URL slug
- **Content (EN)** - English page content
- **Content (AR)** - Arabic page content
- **Status** - Draft, Scheduled, or Published

### Optional Fields
- **Type** - Page type categorization
- **Excerpt (EN/AR)** - Brief description
- **Template** - Custom layout template
- **Sort Order** - For navigation ordering
- **Published At** - Schedule publish date
- **SEO Meta Title (EN/AR)** - For search engines
- **SEO Meta Description (EN/AR)** - For search engines

## API Integration

### Backend Routes
```
GET    /api/v1/platform/cms/pages          # List pages
POST   /api/v1/platform/cms/pages          # Create page
GET    /api/v1/platform/cms/pages/{id}     # Get page
PUT    /api/v1/platform/cms/pages/{id}     # Update page
DELETE /api/v1/platform/cms/pages/{id}     # Delete page
POST   /api/v1/platform/cms/pages/{id}/publish # Publish page
```

### Public API (Storefront)
```
GET /api/v1/public/cms/pages/{slug}?locale=en
```

This endpoint is used by customer-facing storefronts to retrieve published marketing pages.

### Request Example
```json
POST /api/v1/platform/cms/pages

{
  "type": "pricing",
  "title": {
    "en": "Our Pricing Plans",
    "ar": "خطط الأسعار"
  },
  "slug": {
    "en": "pricing",
    "ar": "الأسعار"
  },
  "excerpt": {
    "en": "Choose the perfect plan for your business",
    "ar": "اختر الخطة المثالية لعملك"
  },
  "content": {
    "en": "<h1>Pricing</h1><p>Our flexible pricing...</p>",
    "ar": "<h1>الأسعار</h1><p>أسعارنا المرنة...</p>"
  },
  "status": "published",
  "template": "pricing",
  "sort_order": 3,
  "seo": {
    "meta_title": {
      "en": "Pricing Plans | LaraTenant",
      "ar": "خطط الأسعار | لارا تينانت"
    },
    "meta_description": {
      "en": "Flexible pricing for businesses of all sizes",
      "ar": "أسعار مرنة للشركات من جميع الأحجام"
    }
  }
}
```

### Response Example
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": "pricing",
    "title": { "en": "Our Pricing Plans", "ar": "خطط الأسعار" },
    "slug": { "en": "pricing", "ar": "الأسعار" },
    "excerpt": { ... },
    "content": { ... },
    "status": "published",
    "published_at": "2026-07-16T10:00:00.000000Z",
    "seo": { ... },
    "template": "pricing",
    "sort_order": 3,
    "created_at": "2026-07-16T09:00:00.000000Z",
    "updated_at": "2026-07-16T10:00:00.000000Z",
    "creator": { "id": 1, "name": "Super Admin" },
    "updater": { "id": 1, "name": "Super Admin" }
  }
}
```

## Permissions

The backend enforces these permissions:
- `MARKETING_PLATFORM_CREATE` - Create pages
- `MARKETING_PLATFORM_UPDATE` - Update pages
- `MARKETING_PLATFORM_PUBLISH` - Publish pages

Only users with **SUPER_ADMIN** role have access to the Platform CMS.

## Usage Guide

### Creating a New Page

1. Navigate to `/en/cms/pages`
2. Click **"Create Page"**
3. Fill in the English content (required):
   - Title
   - Slug (auto-generated from title)
   - Content
4. Fill in the Arabic content (required):
   - Title
   - Slug
   - Content
5. Optionally:
   - Select a page type
   - Add excerpt
   - Set template
   - Configure SEO metadata
6. Choose status:
   - **Draft** - Save without publishing
   - **Published** - Make live immediately
   - **Scheduled** - Set future publish date
7. Click **"Create Page"** or **"Save & Publish"**

### Editing an Existing Page

1. Navigate to `/en/cms/pages`
2. Find the page you want to edit
3. Click **Edit icon** or go to detail page and click **Edit**
4. Modify any fields
5. Click **"Update Page"** to save

### Publishing a Draft Page

1. Go to page detail view (`/cms/pages/{id}`)
2. Click **"Publish"** button
3. Confirm the action
4. Page status changes to "published"

### Deleting a Page

1. From list or detail view, click **Delete icon**
2. Confirm the deletion
3. Page is permanently removed

⚠️ **Warning**: Deletion cannot be undone!

## Best Practices

### Content Guidelines
- ✅ Always provide both English and Arabic content
- ✅ Use semantic HTML for content structure
- ✅ Keep excerpts brief (1-2 sentences)
- ✅ Use descriptive, SEO-friendly slugs
- ✅ Add meta descriptions for better SEO

### Type Selection
- ✅ Use types to categorize pages logically
- ✅ Each type should only be used once (e.g., one "pricing" page)
- ✅ Types help with navigation and site structure

### Publishing Workflow
- ✅ Create as draft first
- ✅ Review content thoroughly
- ✅ Preview if possible
- ✅ Publish when ready
- ✅ Update published pages carefully (changes are immediate)

### SEO Optimization
- ✅ Use unique meta titles for each page
- ✅ Write compelling meta descriptions (150-160 characters)
- ✅ Include target keywords naturally
- ✅ Keep slugs short and descriptive

## Troubleshooting

### Page Not Appearing in Public API
- Check page status is "published"
- Verify `published_at` date is in the past
- Check the slug is correct
- Ensure backend permissions are set correctly

### Form Validation Errors
- Required fields: title, slug, content (both EN and AR)
- Slug must be URL-friendly (no spaces or special characters)
- Status must be: draft, scheduled, or published

### 403 Forbidden Errors
- User needs `MARKETING_PLATFORM_CREATE` or `MARKETING_PLATFORM_UPDATE` permission
- Only SUPER_ADMIN role has these permissions

### Changes Not Saving
- Check browser console for errors
- Verify backend server is running
- Check network tab for failed requests
- Ensure session is still valid (re-login if needed)

## Technical Details

### File Structure
```
platform-dashboard/
├── app/[locale]/(dashboard)/cms/
│   ├── page.tsx                    # CMS overview
│   └── pages/
│       ├── page.tsx                # Pages list
│       ├── new/
│       │   └── page.tsx            # Create page
│       └── [id]/
│           ├── page.tsx            # Page detail
│           └── edit/
│               └── page.tsx        # Edit page
├── components/cms/
│   └── PageForm.tsx                # Reusable form component
└── lib/api/endpoints/
    └── cms.ts                      # API client methods
```

### Component Architecture
```
PageForm (Reusable)
├── Mode: create | edit
├── Bilingual tabs (EN/AR)
├── Content fields per language
├── SEO section per language
├── Publish settings
├── Page settings
└── Form validation

Used by:
├── Create Page (/cms/pages/new)
└── Edit Page (/cms/pages/[id]/edit)
```

### State Management
- React hooks (useState, useEffect)
- React Hook Form for form validation
- Local state for loading/saving states
- No global state management needed

## Testing

### Manual Testing
1. Start backend: `php artisan serve`
2. Start frontend: `cd platform-dashboard && npm run dev`
3. Login at `http://localhost:3001/login`
4. Navigate to `/en/cms/pages`
5. Test all CRUD operations

### API Testing
Run the test script:
```bash
cd /home/leader/projects/laravel/v3/tenant/laratenant-backend
./test-cms-api.sh
```

This tests all API endpoints automatically.

## Future Enhancements

### Planned Features
- [ ] **Rich Text Editor** - WYSIWYG editor instead of textarea
- [ ] **Media Library** - Upload and manage images
- [ ] **Page Preview** - Preview before publishing
- [ ] **Duplicate Page** - Clone existing pages
- [ ] **Version History** - Track changes over time
- [ ] **Bulk Actions** - Publish/delete multiple pages
- [ ] **A/B Testing** - Test different content versions
- [ ] **Analytics** - Track page views and engagement

### Known Limitations
- No rich text editor (plain HTML textarea)
- No image upload (manual HTML embedding)
- No version history
- No preview modal
- No bulk operations

## Support

### Documentation
- `CMS_IMPLEMENTATION_COMPLETE.md` - Technical implementation details
- `CMS_REBUILD_SUMMARY.md` - Quick reference summary
- `AGENTS.md` - Repository rules and guidelines

### Getting Help
- Check the console for error messages
- Review the network tab for API failures
- Consult the backend logs for server errors
- Review validation errors in form fields

## Summary

The Platform CMS provides a professional, production-ready interface for managing marketing content. With complete bilingual support, SEO optimization, and a streamlined publishing workflow, platform administrators can easily create and maintain the marketing pages that power customer-facing storefronts.

**Status**: ✅ **Production Ready**
