'use client';

import * as React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  sortKey,
  sortOrder,
  onSort,
  emptyMessage = 'No data available',
  className,
}: DataTableProps<T>) {
  const handleSort = (key: string) => {
    if (onSort) {
      onSort(key);
    }
  };

  const getSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="ms-2 h-4 w-4" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="ms-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ms-2 h-4 w-4" />
    );
  };

  if (data.length === 0) {
    return (
      <div className="rounded-[var(--radius-md)] bg-card [box-shadow:var(--shadow-sm)]">
        <div className="p-8 text-center text-muted-foreground">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-[var(--radius-md)] bg-card [box-shadow:var(--shadow-sm)] overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-start text-xs font-semibold tracking-wide text-muted-foreground',
                    column.key === 'stores' || column.key === 'orders' || column.key === 'id' ? 'numeric-cell' : '',
                    column.className
                  )}
                >
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ms-3 h-8 hover:bg-transparent"
                      onClick={() => handleSort(column.key)}
                    >
                      {column.label}
                      {getSortIcon(column.key)}
                    </Button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_tr:nth-child(even)]:bg-muted/20">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className="hover:bg-muted/40 transition-colors cursor-pointer"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-4 py-3 text-sm',
                      column.key === 'stores' || column.key === 'orders' || column.key === 'id' ? 'numeric-cell' : '',
                      column.className
                    )}
                  >
                    {column.render
                      ? column.render(item)
                      : String((item as any)[column.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
