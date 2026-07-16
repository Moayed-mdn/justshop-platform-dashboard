'use client';

import * as React from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  Store,
  DollarSign,
  ShoppingCart,
  Clock,
  Ban,
  CheckCircle,
  Edit,
  Trash2,
} from 'lucide-react';
import { usersEndpoints } from '@/lib/api/endpoints/users';
import type { UserDetail } from '@/lib/types/user';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditUserDialog } from '@/components/users/edit-user-dialog';
import { format, formatDistanceToNow } from 'date-fns';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const userId = Number(params.id);

  const [user, setUser] = React.useState<UserDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);

  // Check if edit query param is present
  React.useEffect(() => {
    if (searchParams.get('edit') === 'true' && user) {
      setEditDialogOpen(true);
    }
  }, [searchParams, user]);

  // Fetch user
  React.useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const data = await usersEndpoints.getUser(userId);
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  // Get user initials
  const getInitials = (name: string) => {
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
        return 'destructive';
      case 'inactive':
        return 'warning';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Handle suspend/activate
  const handleToggleStatus = async () => {
    if (!user) return;

    try {
      const updatedUser =
        user.status === 'active'
          ? await usersEndpoints.suspendUser(user.id)
          : await usersEndpoints.activateUser(user.id);

      setUser({ ...user, ...updatedUser });
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await usersEndpoints.deleteUser(user.id);
      router.push(`/${locale}/users`);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="text-muted-foreground">Loading user...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <div className="text-muted-foreground">User not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/${locale}/users`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Users
      </Button>

      {/* User Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-xl">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant={getStatusVariant(user.status)}>
                {user.status}
              </Badge>
              <Badge variant="info">{user.role ? user.role.replace('_', ' ') : 'N/A'}</Badge>
              {user.email_verified && (
                <Badge variant="success">Email Verified</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
          >
            {user.status === 'active' ? (
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

      {/* Edit Dialog */}
      {user && (
        <EditUserDialog
          user={user}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={(updatedUser) => {
            setUser({ ...user, ...updatedUser });
          }}
        />
      )}

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-medium">{user.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Role</div>
                <div className="font-medium">{user.role.replace('_', ' ')}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Joined</div>
                <div className="font-medium">
                  {format(new Date(user.created_at), 'PPP')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Last Login</div>
                <div className="font-medium">
                  {user.stats.last_login
                    ? formatDistanceToNow(new Date(user.stats.last_login), {
                        addSuffix: true,
                      })
                    : 'Never'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-500/10 p-3">
                <Store className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {user.stats.active_stores}
                </div>
                <div className="text-sm text-muted-foreground">Active Stores</div>
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
                  ${user.stats.total_revenue.toLocaleString()}
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
                <div className="text-2xl font-bold">{user.stats.total_orders}</div>
                <div className="text-sm text-muted-foreground">Total Orders</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-orange-500/10 p-3">
                <Store className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{user.stores_count}</div>
                <div className="text-sm text-muted-foreground">Total Stores</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {user.recent_activity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 pb-4 last:pb-0 border-b last:border-0"
              >
                <div className="rounded-full bg-muted p-2">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{activity.action.replace('_', ' ')}</div>
                  <div className="text-sm text-muted-foreground">
                    {activity.description}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.created_at), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stores */}
      {user.stores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Stores ({user.stores.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.stores.map((store) => (
                <div
                  key={store.id}
                  className="flex items-center justify-between pb-4 last:pb-0 border-b last:border-0"
                >
                  <div>
                    <div className="font-medium">{store.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {store.domain}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusVariant(store.status)}>
                      {store.status}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(store.created_at), 'PP')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
