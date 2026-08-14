'use client';

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface LineChartProps {
  title: string;
  description?: string;
  data: Array<{ date: string; value: number; label?: string }>;
  dataKey?: string;
  loading?: boolean;
}

export function LineChart({
  title,
  description,
  data,
  dataKey = 'value',
  loading = false,
}: LineChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-5 w-48 bg-muted animate-pulse rounded" />
          {description && <div className="h-4 w-64 bg-muted animate-pulse rounded mt-1.5" />}
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center">
            <div className="space-y-3 w-full">
              <div className="h-2 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-2 bg-muted animate-pulse rounded w-full" />
              <div className="h-2 bg-muted animate-pulse rounded w-5/6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isEmpty = !data || data.length === 0;

  if (isEmpty) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex flex-col items-center justify-center text-center space-y-3">
            <div className="rounded-full bg-muted/50 p-3">
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">No data available</p>
              <p className="text-xs text-muted-foreground/70">Chart will appear once data is collected</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsLineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
            <XAxis
              dataKey="label"
              className="text-xs"
              stroke="var(--color-muted-foreground)"
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              className="text-xs"
              stroke="var(--color-muted-foreground)"
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-popover)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-popover-foreground)',
                boxShadow: 'var(--shadow-md)',
              }}
              labelStyle={{ 
                color: 'var(--color-foreground)',
                fontWeight: 500,
                fontSize: '0.875rem',
              }}
              itemStyle={{
                fontSize: '0.875rem',
              }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="var(--color-chart-1)"
              strokeWidth={2.5}
              dot={{ fill: 'var(--color-chart-1)', r: 4 }}
              activeDot={{ r: 6, fill: 'var(--color-chart-1)' }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
