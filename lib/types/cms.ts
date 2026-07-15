export type ContentStatus = 'draft' | 'published' | 'archived';

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  status: ContentStatus;
  author_id: number;
  author_name: string;
  author_avatar?: string;
  category: string;
  tags: string[];
  views_count: number;
  comments_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  template: string;
  status: ContentStatus;
  author_id: number;
  author_name: string;
  author_avatar?: string;
  parent_id?: number;
  parent_title?: string;
  order: number;
  seo_title?: string;
  seo_description?: string;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface Documentation {
  id: number;
  title: string;
  slug: string;
  content: string;
  category: string;
  order: number;
  status: ContentStatus;
  author_id: number;
  author_name: string;
  author_avatar?: string;
  version: string;
  views_count: number;
  helpful_count: number;
  not_helpful_count: number;
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
  search?: string;
  status?: ContentStatus;
  category?: string;
  author_id?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}
