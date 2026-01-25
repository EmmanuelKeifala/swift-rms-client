'use client';

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown, Inbox } from 'lucide-react';
import { useState } from 'react';

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: (updater: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => void;
  emptyMessage?: string;
  emptyDescription?: string;
}

export function DataTable<TData>({
  data,
  columns,
  globalFilter,
  onGlobalFilterChange,
  columnFilters,
  onColumnFiltersChange,
  emptyMessage = 'No data found',
  emptyDescription = 'Try adjusting your search or filters',
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
      columnFilters,
    },
    onGlobalFilterChange,
    onSortingChange: setSorting,
    onColumnFiltersChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div 
      className="card" 
      style={{ 
        padding: 0, 
        overflow: 'hidden',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr 
                key={headerGroup.id} 
                style={{ 
                  borderBottom: '1px solid var(--border)',
                }}
              >
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    style={{
                      padding: 'var(--space-4) var(--space-5)',
                      textAlign: 'left',
                      fontWeight: 600,
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-tertiary)',
                      background: 'var(--bg-elevated)',
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                      userSelect: 'none',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      transition: 'background 0.15s ease',
                      whiteSpace: 'nowrap',
                    }}
                    onClick={header.column.getToggleSortingHandler()}
                    onMouseEnter={(e) => {
                      if (header.column.getCanSort()) {
                        e.currentTarget.style.background = 'var(--bg-surface)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--bg-elevated)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span 
                          style={{ 
                            opacity: header.column.getIsSorted() ? 1 : 0.4,
                            transition: 'opacity 0.15s ease, color 0.15s ease',
                            color: header.column.getIsSorted() ? 'var(--blue-500)' : 'inherit',
                          }}
                        >
                          {header.column.getIsSorted() === 'asc' ? (
                            <ArrowUp size={14} strokeWidth={2.5} />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ArrowDown size={14} strokeWidth={2.5} />
                          ) : (
                            <ArrowUpDown size={14} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length} 
                  style={{ 
                    padding: 'var(--space-16) var(--space-8)', 
                    textAlign: 'center',
                  }}
                >
                  <div className="empty-state" style={{ padding: 0 }}>
                    <div className="empty-state-icon">
                      <Inbox size={28} strokeWidth={1.5} />
                    </div>
                    <div className="empty-state-title">{emptyMessage}</div>
                    <div className="empty-state-description">{emptyDescription}</div>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, index) => (
                <tr 
                  key={row.id}
                  style={{
                    borderBottom: index === table.getRowModel().rows.length - 1 ? 'none' : '1px solid var(--border)',
                    transition: 'background 0.15s ease',
                    animationDelay: `${index * 30}ms`,
                  }}
                  className="hover-bg animate-fade-in"
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      style={{
                        padding: 'var(--space-4) var(--space-5)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
