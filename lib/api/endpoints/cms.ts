import { apiClient } from '../client';
import type { PaginatedResponse } from '@/lib/types/user';
import type { 
  BlogPost, 
  Page, 
  Documentation, 
  CMSStats, 
  ContentFilters,
  ContentStatus 
} from '@/lib/types/cms';

// Mock data generators
const generateMockBlogPosts = (count: number): BlogPost[] => {
  const statuses: ContentStatus[] = ['draft', 'published', 'archived'];
  const categories = ['Technology', 'Business', 'Marketing', 'Tutorial', 'News', 'Product Updates'];
  const titles = [
    'Getting Started with Our Platform',
    'Top 10 E-commerce Tips for 2026',
    'How to Optimize Your Online Store',
    'The Future of Multi-tenant Architecture',
    'Building Successful Online Businesses',
    'Customer Success Stories',
    'New Features Released This Month',
    'Best Practices for Store Management',
    'Understanding Platform Analytics',
    'Scaling Your E-commerce Business',
  ];
  const authors = [
    { id: 1, name: 'John Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
    { id: 2, name: 'Jane Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
    { id: 3, name: 'Ahmed Hassan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' },
  ];

  return Array.from({ length: count }, (_, i) => {
    const author = authors[i % authors.length];
    const title = `${titles[i % titles.length]} ${i > 9 ? `Part ${Math.floor(i / 10)}` : ''}`.trim();
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    return {
      id: i + 1,
      title,
      slug,
      content: `This is the full content of the blog post "${title}". Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
      excerpt: `This is a short excerpt of "${title}". Learn more about this topic...`,
      featured_image: i % 3 === 0 ? `https://picsum.photos/seed/${i}/800/400` : undefined,
      status: statuses[i % statuses.length],
      author_id: author.id,
      author_name: author.name,
      author_avatar: author.avatar,
      category: categories[i % categories.length],
      tags: ['tag1', 'tag2', 'tag3'].slice(0, (i % 3) + 1),
      views_count: Math.floor(Math.random() * 1000) + 50,
      comments_count: Math.floor(Math.random() * 50),
      published_at: i % 3 === 0 ? new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
};

const generateMockPages = (count: number): Page[] => {
  const statuses: ContentStatus[] = ['draft', 'published', 'archived'];
  const templates = ['default', 'landing', 'about', 'contact', 'faq'];
  const pageTitles = [
    'About Us', 'Contact', 'Privacy Policy', 'Terms of Service', 'FAQ',
    'Pricing', 'Features', 'Support', 'Partners', 'Careers',
  ];
  const authors = [
    { id: 1, name: 'John Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
    { id: 2, name: 'Jane Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
  ];

  return Array.from({ length: count }, (_, i) => {
    const author = authors[i % authors.length];
    const title = pageTitles[i % pageTitles.length] + (i >= pageTitles.length ? ` ${i}` : '');
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    return {
      id: i + 1,
      title,
      slug,
      content: `This is the content of the page "${title}". Full page content goes here.`,
      template: templates[i % templates.length],
      status: statuses[i % statuses.length],
      author_id: author.id,
      author_name: author.name,
      author_avatar: author.avatar,
      parent_id: i > 5 && i % 3 === 0 ? Math.floor(Math.random() * 5) + 1 : undefined,
      parent_title: i > 5 && i % 3 === 0 ? pageTitles[Math.floor(Math.random() * 5)] : undefined,
      order: i + 1,
      seo_title: `${title} | Platform`,
      seo_description: `Learn more about ${title.toLowerCase()} on our platform.`,
      views_count: Math.floor(Math.random() * 2000) + 100,
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
};

const generateMockDocs = (count: number): Documentation[] => {
  const statuses: ContentStatus[] = ['draft', 'published', 'archived'];
  const categories = ['Getting Started', 'API Reference', 'Guides', 'Troubleshooting', 'Advanced'];
  const docTitles = [
    'Installation Guide',
    'Quick Start Tutorial',
    'API Authentication',
    'REST API Endpoints',
    'Webhooks Setup',
    'Error Handling',
    'Best Practices',
    'Performance Optimization',
  ];
  const authors = [
    { id: 1, name: 'John Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
    { id: 3, name: 'Ahmed Hassan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' },
  ];

  return Array.from({ length: count }, (_, i) => {
    const author = authors[i % authors.length];
    const title = docTitles[i % docTitles.length] + (i >= docTitles.length ? ` (${i})` : '');
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    return {
      id: i + 1,
      title,
      slug,
      content: `# ${title}\n\nThis is the documentation content for "${title}".\n\n## Overview\n\nDetailed documentation goes here...`,
      category: categories[i % categories.length],
      order: i + 1,
      status: statuses[i % statuses.length],
      author_id: author.id,
      author_name: author.name,
      author_avatar: author.avatar,
      version: `1.${Math.floor(i / 5)}.0`,
      views_count: Math.floor(Math.random() * 3000) + 200,
      helpful_count: Math.floor(Math.random() * 100) + 10,
      not_helpful_count: Math.floor(Math.random() * 20),
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
};

const mockBlogPosts = generateMockBlogPosts(35);
const mockPages = generateMockPages(18);
const mockDocs = generateMockDocs(25);

export const cmsEndpoints = {
  /**
   * Get CMS statistics
   */
  async getStats(): Promise<CMSStats> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const countByStatus = (items: any[]) => {
      return {
        total: items.length,
        published: items.filter(i => i.status === 'published').length,
        draft: items.filter(i => i.status === 'draft').length,
        archived: items.filter(i => i.status === 'archived').length,
      };
    };

    return {
      blog: countByStatus(mockBlogPosts),
      pages: countByStatus(mockPages),
      docs: countByStatus(mockDocs),
    };
  },

  /**
   * Get blog posts
   */
  async getBlogPosts(filters?: ContentFilters): Promise<PaginatedResponse<BlogPost>> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filtered = [...mockBlogPosts];

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.status) {
      filtered = filtered.filter(post => post.status === filters.status);
    }

    if (filters?.category) {
      filtered = filtered.filter(post => post.category === filters.category);
    }

    const page = filters?.page || 1;
    const perPage = filters?.per_page || 20;
    const start = (page - 1) * perPage;
    const paginatedData = filtered.slice(start, start + perPage);

    return {
      data: paginatedData,
      meta: {
        current_page: page,
        total: filtered.length,
        per_page: perPage,
        last_page: Math.ceil(filtered.length / perPage),
      },
    };
  },

  /**
   * Get single blog post
   */
  async getBlogPost(id: number): Promise<BlogPost> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const post = mockBlogPosts.find(p => p.id === id);
    if (!post) throw new Error('Blog post not found');
    
    return post;
  },

  /**
   * Get pages
   */
  async getPages(filters?: ContentFilters): Promise<PaginatedResponse<Page>> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filtered = [...mockPages];

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(page =>
        page.title.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.status) {
      filtered = filtered.filter(page => page.status === filters.status);
    }

    const page = filters?.page || 1;
    const perPage = filters?.per_page || 20;
    const start = (page - 1) * perPage;
    const paginatedData = filtered.slice(start, start + perPage);

    return {
      data: paginatedData,
      meta: {
        current_page: page,
        total: filtered.length,
        per_page: perPage,
        last_page: Math.ceil(filtered.length / perPage),
      },
    };
  },

  /**
   * Get documentation
   */
  async getDocs(filters?: ContentFilters): Promise<PaginatedResponse<Documentation>> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filtered = [...mockDocs];

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.status) {
      filtered = filtered.filter(doc => doc.status === filters.status);
    }

    if (filters?.category) {
      filtered = filtered.filter(doc => doc.category === filters.category);
    }

    const page = filters?.page || 1;
    const perPage = filters?.per_page || 20;
    const start = (page - 1) * perPage;
    const paginatedData = filtered.slice(start, start + perPage);

    return {
      data: paginatedData,
      meta: {
        current_page: page,
        total: filtered.length,
        per_page: perPage,
        last_page: Math.ceil(filtered.length / perPage),
      },
    };
  },

  /**
   * Delete blog post
   */
  async deleteBlogPost(id: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = mockBlogPosts.findIndex(p => p.id === id);
    if (index !== -1) mockBlogPosts.splice(index, 1);
  },

  /**
   * Delete page
   */
  async deletePage(id: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = mockPages.findIndex(p => p.id === id);
    if (index !== -1) mockPages.splice(index, 1);
  },

  /**
   * Delete documentation
   */
  async deleteDoc(id: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = mockDocs.findIndex(d => d.id === id);
    if (index !== -1) mockDocs.splice(index, 1);
  },
};
