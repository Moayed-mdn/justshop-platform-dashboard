export type ContentStatus = 'draft' | 'published' | 'archived' | 'scheduled';
export type PublishState = 'draft' | 'published' | 'scheduled';
export type LocalizedString = Record<string, string> | string;

// Marketing Page Types (corresponds to backend MarketingPageTypeEnum)
export type MarketingPageType = 
  | 'home'
  | 'about'
  | 'contact'
  | 'features'
  | 'enterprise'
  | 'pricing'
  | 'blog'
  | 'documentation'
  | 'demo'
  | 'templates';

export interface LocalizedCategory {
  id: number;
  translations: Record<string, { name: string; slug?: string }>;
}

export interface LocalizedTag {
  id: number;
  translations: Record<string, { name: string; slug?: string }>;
}

export interface BlogAuthor {
  id: number;
  name: string;
  email: string;
}

export interface BlogCreator {
  id: number;
  name: string;
}

export interface BlogTranslations {
  [locale: string]: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    meta_title: string;
    meta_description: string;
    canonical_url: string | null;
    og_image: string | null;
    robots: string;
  };
}

export interface BlogPost {
  id: number;
  author_id: number;
  blog_category_id: number | null;
  featured: boolean;
  is_published: boolean;
  publish_state: PublishState;
  published_at: string | null;
  cover_image: string | null;
  reading_time: number;
  category: LocalizedCategory | null;
  tags: LocalizedTag[];
  author: BlogAuthor | null;
  translations: BlogTranslations;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
  creator: BlogCreator | null;
  updater: BlogCreator | null;
}

export interface Page {
  id: number;
  type?: MarketingPageType | null;
  title: LocalizedString;
  slug: LocalizedString;
  excerpt: LocalizedString;
  content: LocalizedString;
  status: string;
  published_at: string | null;
  seo: Record<string, unknown> | null;
  template: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  creator: BlogCreator | null;
  updater: BlogCreator | null;
}

export interface Documentation {
  id: number;
  section_id: number | null;
  parent_id: number | null;
  version: string;
  title: LocalizedString;
  slug: LocalizedString;
  excerpt: LocalizedString;
  content: LocalizedString;
  sort_order: number;
  is_published: boolean;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  og_image: string | null;
  robots: string | null;
  index_controls: string | null;
  created_at: string;
  updated_at: string;
}

export interface CMSStats {
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
    archived: number;
  };
  docs: {
    total: number;
    published: number;
    draft: number;
    archived: number;
  };
}

export interface ContentFilters {
  type?: MarketingPageType;
  search?: string;
  status?: ContentStatus;
  category?: string;
  author_id?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

// Marketing Page Type Options (for forms and filters)
export const MARKETING_PAGE_TYPES: Array<{ value: MarketingPageType; label: string; description: string }> = [
  { value: 'home', label: 'Home', description: 'Main landing page' },
  { value: 'about', label: 'About', description: 'About us page' },
  { value: 'contact', label: 'Contact', description: 'Contact information page' },
  { value: 'features', label: 'Features', description: 'Product features page' },
  { value: 'enterprise', label: 'Enterprise', description: 'Enterprise solutions page' },
  { value: 'pricing', label: 'Pricing', description: 'Pricing plans page' },
  { value: 'blog', label: 'Blog', description: 'Blog landing page' },
  { value: 'documentation', label: 'Documentation', description: 'Documentation landing page' },
  { value: 'demo', label: 'Demo', description: 'Demo request page' },
  { value: 'templates', label: 'Templates', description: 'Templates showcase page' },
];
