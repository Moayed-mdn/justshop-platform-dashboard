'use client';

import * as React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  FileText,
  File,
  BookOpen,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Plus,
} from 'lucide-react';
import { cmsEndpoints } from '@/lib/api/endpoints/cms';
import type { CMSStats, BlogPost, Page, Documentation } from '@/lib/types/cms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

export default function CMSPage() {
  const locale = useLocale();
  const [stats, setStats] = React.useState<CMSStats | null>(null);
  const [blogPosts, setBlogPosts] = React.useState<BlogPost[]>([]);
  const [pages, setPages] = React.useState<Page[]>([]);
  const [docs, setDocs] = React.useState<Documentation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  // Fetch all data
  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsData, blogData, pagesData, docsData] = await Promise.all([
          cmsEndpoints.getStats(),
          cmsEndpoints.getBlogPosts({ per_page: 10 }),
          cmsEndpoints.getPages({ per_page: 10 }),
          cmsEndpoints.getDocs({ per_page: 10 }),
        ]);
        setStats(statsData);
        setBlogPosts(blogData.data);
        setPages(pagesData.data);
        setDocs(docsData.data);
      } catch (error) {
        console.error('Failed to fetch CMS data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const handleDelete = async (type: 'blog' | 'page' | 'doc', id: number) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      if (type === 'blog') {
        await cmsEndpoints.deleteBlogPost(id);
        setBlogPosts(prev => prev.filter(p => p.id !== id));
      } else if (type === 'page') {
        await cmsEndpoints.deletePage(id);
        setPages(prev => prev.filter(p => p.id !== id));
      } else {
        await cmsEndpoints.deleteDoc(id);
        setDocs(prev => prev.filter(d => d.id !== id));
      }
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
    }
  };

  if (loading || !stats) {
    return (
      <div className="p-8 text-center">
        <div className="text-muted-foreground">Loading CMS data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">
            Manage blog posts, pages, and documentation
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Content
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.blog.total}</div>
            <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
              <span>{stats.blog.published} published</span>
              <span>•</span>
              <span>{stats.blog.draft} drafts</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pages</CardTitle>
            <File className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pages.total}</div>
            <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
              <span>{stats.pages.published} published</span>
              <span>•</span>
              <span>{stats.pages.draft} drafts</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentation</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.docs.total}</div>
            <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
              <span>{stats.docs.published} published</span>
              <span>•</span>
              <span>{stats.docs.draft} drafts</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="blog" className="space-y-4">
        <TabsList>
          <TabsTrigger value="blog">
            <FileText className="mr-2 h-4 w-4" />
            Blog Posts
          </TabsTrigger>
          <TabsTrigger value="pages">
            <File className="mr-2 h-4 w-4" />
            Pages
          </TabsTrigger>
          <TabsTrigger value="docs">
            <BookOpen className="mr-2 h-4 w-4" />
            Documentation
          </TabsTrigger>
        </TabsList>

        {/* Blog Posts Tab */}
        <TabsContent value="blog" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Blog Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {blogPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between pb-4 last:pb-0 border-b last:border-0"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      {post.featured_image && (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-20 h-20 object-cover rounded-md"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{post.title}</h4>
                          <Badge variant={getStatusVariant(post.status)}>
                            {post.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={post.author_avatar} />
                              <AvatarFallback className="text-xs">
                                {getInitials(post.author_name)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{post.author_name}</span>
                          </div>
                          <span>•</span>
                          <span>{post.category}</span>
                          <span>•</span>
                          <span>{post.views_count} views</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete('blog', post.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  View All Blog Posts
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pages.map((page) => (
                  <div
                    key={page.id}
                    className="flex items-center justify-between pb-4 last:pb-0 border-b last:border-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{page.title}</h4>
                        <Badge variant={getStatusVariant(page.status)}>
                          {page.status}
                        </Badge>
                        <Badge variant="outline">{page.template}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>/{page.slug}</span>
                        <span>•</span>
                        <span>{page.views_count} views</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(page.updated_at), { addSuffix: true })}</span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete('page', page.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  View All Pages
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between pb-4 last:pb-0 border-b last:border-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{doc.title}</h4>
                        <Badge variant={getStatusVariant(doc.status)}>
                          {doc.status}
                        </Badge>
                        <Badge variant="outline">v{doc.version}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{doc.category}</span>
                        <span>•</span>
                        <span>{doc.views_count} views</span>
                        <span>•</span>
                        <span>{doc.helpful_count} helpful</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true })}</span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete('doc', doc.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  View All Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
