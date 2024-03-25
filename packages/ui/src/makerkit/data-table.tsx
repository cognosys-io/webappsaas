'use client';

import { Fragment, useCallback, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  Table as ReactTable,
  Row,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

import { Button } from '../shadcn/button';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../shadcn/table';
import { cn } from '../utils';
import Trans from './trans';

interface ReactTableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T>[];
  renderSubComponent?: (props: { row: Row<T> }) => React.ReactElement;
  pageIndex?: number;
  pageSize?: number;
  pageCount?: number;
  onPaginationChange?: (pagination: PaginationState) => void;
  tableProps?: React.ComponentProps<typeof Table> &
    Record<`data-${string}`, string>;
}

export function DataTable<T extends object>({
  data,
  columns,
  renderSubComponent,
  pageIndex,
  pageSize,
  pageCount,
  onPaginationChange,
  tableProps,
}: ReactTableProps<T>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: pageIndex ?? 0,
    pageSize: pageSize ?? 15,
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const navigateToPage = useNavigateToNewPage();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    pageCount,
    state: {
      pagination,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onPaginationChange: (updater) => {
      const navigate = (page: number) => setTimeout(() => navigateToPage(page));

      if (typeof updater === 'function') {
        setPagination((prevState) => {
          const nextState = updater(prevState);

          if (onPaginationChange) {
            onPaginationChange(nextState);
          } else {
            navigate(nextState.pageIndex);
          }

          return nextState;
        });
      } else {
        setPagination(updater);

        if (onPaginationChange) {
          onPaginationChange(updater);
        } else {
          navigate(updater.pageIndex);
        }
      }
    },
  });

  return (
    <div
      className={'dark:border-dark-800 rounded-md border border-gray-50 p-1'}
    >
      <Table {...tableProps}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  colSpan={header.colSpan}
                  style={{
                    width: header.column.getSize(),
                  }}
                  key={header.id}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <Fragment key={row.id}>
              <TableRow
                className={cn({
                  'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted':
                    row.getIsExpanded(),
                })}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    style={{
                      width: cell.column.getSize(),
                    }}
                    key={cell.id}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>

              {renderSubComponent ? (
                <TableRow key={row.id + '-expanded'}>
                  <TableCell colSpan={columns.length}>
                    {renderSubComponent({ row })}
                  </TableCell>
                </TableRow>
              ) : null}
            </Fragment>
          ))}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell colSpan={columns.length}>
              <Pagination table={table} />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}

function Pagination<T>({
  table,
}: React.PropsWithChildren<{
  table: ReactTable<T>;
}>) {
  return (
    <div className="flex w-full items-center gap-2">
      <Button
        size={'icon'}
        onClick={() => table.setPageIndex(0)}
        disabled={!table.getCanPreviousPage()}
      >
        <ChevronsLeft className={'h-4'} />
      </Button>

      <Button
        size={'icon'}
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        <ChevronLeft className={'h-4'} />
      </Button>

      <Button
        size={'icon'}
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        <ChevronRight className={'h-4'} />
      </Button>

      <Button
        size={'icon'}
        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
        disabled={!table.getCanNextPage()}
      >
        <ChevronsRight className={'h-4'} />
      </Button>

      <span className="flex items-center text-sm">
        <Trans
          i18nKey={'common:pageOfPages'}
          values={{
            page: table.getState().pagination.pageIndex + 1,
            total: table.getPageCount(),
          }}
        />
      </span>
    </div>
  );
}

/**
 * Navigates to a new page using the provided page index and optional page parameter.
 */
function useNavigateToNewPage(
  props: { pageParam?: string } = {
    pageParam: 'page',
  },
) {
  const router = useRouter();
  const param = props.pageParam ?? 'page';

  return useCallback(
    (pageIndex: number) => {
      const url = new URL(window.location.href);
      url.searchParams.set(param, String(pageIndex + 1));

      router.push(url.pathname + url.search);
    },
    [param, router],
  );
}
