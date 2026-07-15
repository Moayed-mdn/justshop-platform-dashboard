'use client';

import { useEffect, useState } from 'react';
import { Users, Store, DollarSign, ShoppingCart, TrendingUp, AlertCircle } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { LineChart } from '@/components/dashboard/charts/line-chart';
import { BarChart } from '@/components/dashboard/charts/bar-chart';
import { getMockDashboardStats, getMockUserGrowth, getMockRevenueData } from '@/lib/api/endpoints/dashboard';
import type { DashboardStats, TimeSeriesData } from '@/lib/types/dashboard';

export default function HomePage() {
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userGrowth, setUserGrowth] = useState<TimeSeriesData | null>(null);
  const [revenueData, setRevenueData] = useState<TimeSeriesData | null>(null);

  useEffect(() => {
    // Fetch user info and dashboard data
    const fetchData = async () => {
      try {
        // Fetch authenticated user
        const userResponse = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.success && userData.user) {
            setUserName(userData.user.name);
            setUserEmail(userData.user.email);
          }
        }

        // For now, use mock data
        // TODO: Replace with real API calls when backend endpoints are ready
        setStats(getMockDashboardStats());
        setUserGrowth(getMockUserGrowth());
        setRevenueData(getMockRevenueData());
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {loading ? 'Welcome!' : `Welcome, ${userName}! 👋`}
        </h1>
        <p className="text-muted-foreground mt-2">
          {loading ? 'Platform Dashboard' : `Here's what's happening with your platform today.`}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats ? formatNumber(stats.users.total) : '0'}
          change={stats?.users.growth_percentage}
          trend={stats && stats.users.growth_percentage > 0 ? 'up' : 'down'}
          icon={Users}
          description="from last month"
          loading={loading}
        />
        <StatCard
          title="Active Stores"
          value={stats ? formatNumber(stats.stores.active) : '0'}
          change={undefined}
          icon={Store}
          description={stats ? `${stats.stores.pending} pending` : ''}
          loading={loading}
        />
        <StatCard
          title="Revenue (This Month)"
          value={stats ? formatCurrency(stats.revenue.this_month) : '$0'}
          change={stats?.revenue.growth_percentage}
          trend={stats && stats.revenue.growth_percentage > 0 ? 'up' : 'down'}
          icon={DollarSign}
          description="from last month"
          loading={loading}
        />
        <StatCard
          title="Orders (This Month)"
          value={stats ? formatNumber(stats.orders.this_month) : '0'}
          change={undefined}
          icon={ShoppingCart}
          description={stats ? `${stats.orders.pending} pending` : ''}
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <LineChart
          title="User Growth"
          description="New user registrations over the last 30 days"
          data={userGrowth?.data || []}
          loading={loading}
        />
        <BarChart
          title="Monthly Revenue"
          description="Revenue breakdown by month"
          data={revenueData?.data || []}
          loading={loading}
        />
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="col-span-2">
            <div className="grid gap-4">
              {/* Total Stats Card */}
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Platform Overview
                </h3>
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
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.revenue.total)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      All-time revenue
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{formatNumber(stats.orders.total)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatNumber(stats.orders.pending)} pending
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Store Status */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Store Status
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Active</span>
                  <span className="text-sm font-semibold">{stats.stores.active}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${(stats.stores.active / stats.stores.total) * 100}%` }}
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
                    style={{ width: `${(stats.stores.pending / stats.stores.total) * 100}%` }}
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
                    style={{ width: `${(stats.stores.suspended / stats.stores.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Using Mock Data
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              The statistics and charts shown are using mock data for demonstration. 
              Connect the backend API endpoints to see real platform data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
