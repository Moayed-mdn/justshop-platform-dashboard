'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  ArrowLeft,
  Globe,
  Calendar,
  User,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Ban,
  CheckCircle,
  Edit,
  Trash2,
  ExternalLink,
  Settings,
  Palette,
} from 'lucide-react';
import { storesEndpoints } from '@/lib/api/endpoints/stores';
import type { StoreDetail } from '@/lib/types/store';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, formatDistanceToNow } from 'date-fns';

export default function StoreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  
  // Extract store ID from params
  const [storeId, setStoreId] = React.useState<number | null>(null);

  const [store, setStore] = React.useState<StoreDetail | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Extract store ID from params
  React.useEffect(() => {
    const extractId = async () => {
      const resolvedParams = await Promise.resolve(params);
      const id = Number(resolvedParams.id);
      setStoreId(id);
    };
    extractId();
  }, [params]);

  // Fetch store
  React.useEffect(() => {
    if (storeId === null || isNaN(storeId)) return;
    
    const fetchStore = async () => {
      setLoading(true);
      try {
        const data = await storesEndpoints.getStore(storeId);
        setStore(data);
      } catch (error) {
        console.error('Failed to fetch store:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [storeId]);

  // Get initials
  const getInitials = (name: string | null | undefined) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
      case 'cancelled':
      case 'refunded':
        return 'destructive';
      case 'pending':
      case 'processing':
        return 'warning';
      case 'completed':
        return 'info';
      case 'inactive':
      default:
        return 'secondary';
    }
  };

  // Handle suspend/activate
  const handleToggleStatus = async () => {
    if (!store) return;

    try {
      const updatedStore =
        store.status === 'active'
          ? await storesEndpoints.suspendStore(store.id)
          : await storesEndpoints.activateStore(store.id);

      setStore({ ...store, ...updatedStore });
    } catch (error) {
      console.error('Failed to update store status:', error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!store) return;
    if (!confirm('Are you sure you want to delete this store? This action cannot be undone.')) return;

    try {
      await storesEndpoints.deleteStore(store.id);
      router.push(`/${locale}/stores`);
    } catch (error) {
      console.error('Failed to delete store:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="text-muted-foreground">Loading store...</div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="p-8 text-center">
        <div className="text-muted-foreground">Store not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/${locale}/stores`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Stores
      </Button>

      {/* Store Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 rounded-lg">
            <AvatarImage src={store.logo} alt={store.name} />
            <AvatarFallback className="rounded-lg text-xl">
              {getInitials(store.name)}
            </AvatarFallback>
          </Avatar>

          <div>
            <h1 className="text-3xl font-bold">{store.name}</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <a 
                href={`https://${store.domain}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground hover:underline"
              >
                {store.domain}
              </a>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant={getStatusVariant(store.status)}>
                {store.status}
              </Badge>
              <Badge variant="outline">
                <Palette className="mr-1 h-3 w-3" />
                {store.theme}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={`https://${store.domain}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Visit
            </a>
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            // TODO: Implement edit store functionality
            alert('Edit store functionality coming soon');
          }}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
          >
            {store.status === 'active' ? (
              <>
                <Ban className="mr-2 h-4 w-4" />
                Suspend
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Activate
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Owner Info */}
      <Card>
        <CardHeader>
          <CardTitle>Store Owner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={store.owner_avatar} alt={store.owner_name} />
              <AvatarFallback>{getInitials(store.owner_name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{store.owner_name}</div>
              <div className="text-sm text-muted-foreground">{store.owner_email}</div>
            </div>
            <Button variant="outline" size="sm" className="ml-auto" asChild>
              <Link href={`/${locale}/users/${store.owner_id}`}>
                <User className="mr-2 h-4 w-4" />
                View Profile
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-500/10 p-3">
                <Package className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {store.stats?.total_products ?? 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Products</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-500/10 p-3">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  ${(store.stats?.total_revenue ?? 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-500/10 p-3">
                <ShoppingCart className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{store.stats?.total_orders ?? 0}</div>
                <div className="text-sm text-muted-foreground">Total Orders</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-orange-500/10 p-3">
                <Users className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{store.stats?.total_customers ?? 0}</div>
                <div className="text-sm text-muted-foreground">Total Customers</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* This Month Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Orders</div>
                <div className="text-2xl font-bold">{store.stats?.orders_this_month ?? 0}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Revenue</div>
                <div className="text-2xl font-bold">${(store.stats?.revenue_this_month ?? 0).toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Store Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Currency</span>
                <span className="font-medium">{store.settings?.currency ?? 'USD'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Language</span>
                <span className="font-medium">{store.settings?.language?.toUpperCase() ?? 'EN'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tax Enabled</span>
                <Badge variant={store.settings?.tax_enabled ? 'success' : 'secondary'}>
                  {store.settings?.tax_enabled ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <Badge variant={store.settings?.shipping_enabled ? 'success' : 'secondary'}>
                  {store.settings?.shipping_enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(store.recent_orders ?? []).length > 0 ? (
              store.recent_orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between pb-4 last:pb-0 border-b last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-medium">{order.order_number}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.customer_name} • {order.items_count} items
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">${order.amount.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
              </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recent orders
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Store Info */}
      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Created</div>
                <div className="font-medium">
                  {format(new Date(store.created_at), 'PPP')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Last Updated</div>
                <div className="font-medium">
                  {formatDistanceToNow(new Date(store.updated_at), { addSuffix: true })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
