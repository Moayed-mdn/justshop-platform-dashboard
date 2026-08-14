'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Store, DollarSign, ShoppingCart, TrendingUp, AlertCircle, Receipt, CreditCard } from 'lucide-react';
import { useDashboardUser } from '@/components/dashboard/dashboard-layout-client';
import { StatCard } from '@/components/dashboard/stat-card';
import { LineChart } from '@/components/dashboard/charts/line-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { DashboardStats, TimeSeriesData } from '@/lib/types/dashboard';
import { getDashboardStats, getUserGrowthData, getStoreGrowthData } from '@/lib/api/endpoints/dashboard';

export default function HomePage() {
  const user = useDashboardUser();
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'en';
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userGrowth, setUserGrowth] = useState<TimeSeriesData | null>(null);
  const [storeGrowth, setStoreGrowth] = useState<TimeSeriesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all dashboard data in parallel
        const [statsData, userGrowthData, storeGrowthData] = await Promise.all([
          getDashboardStats(),
          getUserGrowthData('30d'),
          getStoreGrowthData('30d'),
        ]);

        setStats(statsData);
        setUserGrowth(userGrowthData);
        setStoreGrowth(storeGrowthData);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="space-y-8">
      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900 dark:text-red-100">
                Failed to Load Dashboard Data
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {loading ? 'Welcome!' : `Welcome, ${user?.name || 'User'}! 👋`}
        </h1>
        <p className="text-muted-foreground mt-2">
          {loading ? 'Platform Dashboard' : `Here's what's happening with your platform today.`}
        </p>
      </div>

      {/* Store Activity Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Store Activity</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats ? formatNumber(stats.users.total) : '0'}
            change={stats?.users.growth_percentage}
            trend={stats && stats.users.growth_percentage > 0 ? 'up' : stats && stats.users.growth_percentage < 0 ? 'down' : undefined}
            icon={Users}
            description="from last month"
            loading={loading}
          />
          <StatCard
            title="Active Stores"
            value={stats ? formatNumber(stats.stores.active) : '0'}
            change={undefined}
            icon={Store}
            description={stats ? `${stats.stores.total} total` : ''}
            loading={loading}
          />
          <StatCard
            title="Store Sales (GMV)"
            value={stats ? formatCurrency(stats.revenue.total) : '$0'}
            change={stats?.revenue.growth_percentage}
            trend={stats && stats.revenue.growth_percentage > 0 ? 'up' : stats && stats.revenue.growth_percentage < 0 ? 'down' : undefined}
            icon={DollarSign}
            description="all time order volume"
            loading={loading}
          />
          <StatCard
            title="Orders"
            value={stats ? formatNumber(stats.orders.total) : '0'}
            change={stats?.orders.growth_percentage}
            trend={stats && stats.orders.growth_percentage && stats.orders.growth_percentage > 0 ? 'up' : stats && stats.orders.growth_percentage && stats.orders.growth_percentage < 0 ? 'down' : undefined}
            icon={ShoppingCart}
            description={stats ? `${stats.orders.pending} pending` : 'from last month'}
            loading={loading}
          />
        </div>
      </div>

      {/* Platform Revenue (Subscriptions) Section */}
      {stats?.subscription_revenue && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Platform Revenue</h2>
            <Button variant="outline" asChild>
              <Link href={`/${locale}/billing/subscriptions`}>
                <Receipt className="mr-2 h-4 w-4" />
                View All Subscriptions
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Subscription Revenue"
              value={formatCurrency(stats.subscription_revenue.total)}
              change={stats.subscription_revenue.trend.change}
              trend={stats.subscription_revenue.trend.direction}
              icon={CreditCard}
              description="SaaS income"
              loading={loading}
            />
            <StatCard
              title="Active Subscriptions"
              value={stats.subscriptions ? formatNumber(stats.subscriptions.active) : '0'}
              change={undefined}
              icon={Receipt}
              description={stats.subscriptions ? `${stats.subscriptions.total} total` : ''}
              loading={loading}
            />
            <StatCard
              title="Trialing"
              value={stats.subscriptions ? formatNumber(stats.subscriptions.trialing) : '0'}
              change={undefined}
              icon={Users}
              description="trial period"
              loading={loading}
            />
            <StatCard
              title="Past Due"
              value={stats.subscriptions ? formatNumber(stats.subscriptions.past_due) : '0'}
              change={undefined}
              icon={AlertCircle}
              description="requires attention"
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <LineChart
          title="User Growth"
          description="New user registrations over the last 30 days"
          data={userGrowth?.data || []}
          loading={loading}
        />
        <LineChart
          title="Store Growth"
          description="New stores created over the last 30 days"
          data={storeGrowth?.data || []}
          loading={loading}
        />
      </div>

      {/* Stats Overview */}
      {stats && !loading && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="col-span-2">
            <div className="grid gap-4">
              {/* Total Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Platform Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold">{formatNumber(stats.users.total)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatNumber(stats.users.active)} active users
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Stores</p>
                      <p className="text-2xl font-bold">{formatNumber(stats.stores.total)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatNumber(stats.stores.active)} active stores
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Store Sales (GMV)</p>
                      <p className="text-2xl font-bold">{formatCurrency(stats.revenue.total)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Order volume (not platform income)
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-bold">{formatNumber(stats.orders.total)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatNumber(stats.orders.pending)} pending orders
                      </p>
                    </div>
                    {stats.subscription_revenue && (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground">Subscription Revenue</p>
                          <p className="text-2xl font-bold">{formatCurrency(stats.subscription_revenue.total)}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Actual platform SaaS income
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Subscriptions</p>
                          <p className="text-2xl font-bold">{stats.subscriptions ? formatNumber(stats.subscriptions.total) : '0'}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {stats.subscriptions ? formatNumber(stats.subscriptions.active) : '0'} active subscriptions
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Store Status & Subscription Status */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Store Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Active</span>
                      <span className="text-sm font-semibold">{stats.stores.active}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: stats.stores.total > 0 ? `${(stats.stores.active / stats.stores.total) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Pending</span>
                      <span className="text-sm font-semibold">{stats.stores.pending}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: stats.stores.total > 0 ? `${(stats.stores.pending / stats.stores.total) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Suspended</span>
                      <span className="text-sm font-semibold">{stats.stores.suspended}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: stats.stores.total > 0 ? `${(stats.stores.suspended / stats.stores.total) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Status Breakdown */}
            {stats.subscriptions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Subscription Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Active</span>
                        <span className="text-sm font-semibold">{stats.subscriptions.active}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full"
                          style={{ width: stats.subscriptions.total > 0 ? `${(stats.subscriptions.active / stats.subscriptions.total) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Trialing</span>
                        <span className="text-sm font-semibold">{stats.subscriptions.trialing}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: stats.subscriptions.total > 0 ? `${(stats.subscriptions.trialing / stats.subscriptions.total) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Past Due</span>
                        <span className="text-sm font-semibold">{stats.subscriptions.past_due}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: stats.subscriptions.total > 0 ? `${(stats.subscriptions.past_due / stats.subscriptions.total) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Canceled</span>
                        <span className="text-sm font-semibold">{stats.subscriptions.canceled}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: stats.subscriptions.total > 0 ? `${(stats.subscriptions.canceled / stats.subscriptions.total) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
