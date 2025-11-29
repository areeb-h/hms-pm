// ============================================================================
// components/data/server-table.tsx
// Reusable Server Table with Date Range, Filters, Sorting, Pagination
// Enterprise-grade: Defensive defaults + client-safe constants
// ============================================================================

'use client'

import { DateRangePicker } from '@/components/date-range-picker'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AccessorFn,
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, Calendar, ChevronDown, Filter, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import * as React from 'react'

import {
  DEFAULT_PAGE as CONFIG_PAGE,
  DEFAULT_PAGE_SIZE as CONFIG_PAGE_SIZE,
  DEFAULT_SORT_ORDER as CONFIG_SORT_ORDER,
} from '@/lib/config/constants'

// ============================================================================
// 🔒 Safe Fallback Defaults (resilient if constants are missing)
// ============================================================================
const DEFAULT_PAGE = CONFIG_PAGE ?? 1
const DEFAULT_PAGE_SIZE = CONFIG_PAGE_SIZE ?? 10
const DEFAULT_SORT_ORDER: 'asc' | 'desc' = CONFIG_SORT_ORDER ?? 'desc'

// ============================================================================
// Types
// ============================================================================
export interface FilterOption {
  label: string
  value: string
}

export interface FilterField {
  label: string
  paramName: string
  type: 'select'
  options: FilterOption[]
}

interface UseServerTableStateOptions {
  defaultPageSize?: number
  includeDateFilter?: boolean
  customFilters?: string[]
}

// ============================================================================
// 🧭 Server Table State Hook
// ============================================================================
export function useServerTableState({
  defaultPageSize = DEFAULT_PAGE_SIZE,
  includeDateFilter = true,
  customFilters = [],
}: UseServerTableStateOptions = {}) {
  const router = useRouter()

  // Build custom filter params dynamically
  const customFilterParams = customFilters.reduce((acc, filterName) => {
    acc[filterName] = parseAsString
    return acc
  }, {} as Record<string, any>)

  const [urlState, setUrlState] = useQueryStates(
    {
      page: parseAsInteger.withDefault(DEFAULT_PAGE),
      pageSize: parseAsInteger.withDefault(defaultPageSize),
      sortBy: parseAsString,
      sortOrder: parseAsString.withDefault(DEFAULT_SORT_ORDER),
      filter: parseAsString.withDefault(''),
      status: parseAsString,
      role: parseAsString,
      ...customFilterParams,
      ...(includeDateFilter && {
        startDate: parseAsString,
        endDate: parseAsString,
      }),
    },
    {
      history: 'replace',
      shallow: false,
      throttleMs: 300,
      clearOnDefault: true,
    }
  )

  const safeRefresh = () => {
    try {
      router.refresh()
    } catch (err) {
      console.warn('[ServerTable] router.refresh failed:', err)
    }
  }

  return {
    ...urlState,

    setPage: (page: number) => setUrlState({ page }),
    setPageSize: (pageSize: number) => setUrlState({ pageSize, page: 1 }),
    setFilter: (filter: string) => setUrlState({ filter: filter || null, page: 1 }),
    setFilterParam: (paramName: string, value: string | null) =>
      setUrlState({ [paramName]: value, page: 1 }),

    toggleSort: (columnId: string) => {
      const { sortBy, sortOrder } = urlState
      if (sortBy === columnId) {
        if (sortOrder === 'asc') {
          setUrlState({ sortBy: columnId, sortOrder: 'desc', page: 1 })
        } else {
          setUrlState({ sortBy: null, sortOrder: null, page: 1 })
        }
      } else {
        setUrlState({ sortBy: columnId, sortOrder: 'asc', page: 1 })
      }
    },

    clearFilters: () => {
      try {
        const params = new URLSearchParams(window.location.search)
        for (const key of Array.from(params.keys())) {
          if (key !== 'page' && key !== 'pageSize') params.delete(key)
        }
        const newUrl = `${window.location.pathname}?${params.toString()}`
        router.replace(newUrl)
        safeRefresh()
      } catch (err) {
        console.error('[ServerTable] clearFilters failed:', err)
      }
    },

    refresh: safeRefresh,
  }
}

// ============================================================================
// Sortable Column Helper
// ============================================================================
function SortableColumn({
  label,
  columnId,
  currentSortBy,
  currentSortOrder,
  onToggleSort,
}: {
  label: string
  columnId: string
  currentSortBy?: string
  currentSortOrder?: 'asc' | 'desc'
  onToggleSort: (columnId: string) => void
}) {
  const isSorted = currentSortBy === columnId
  const isAsc = isSorted && currentSortOrder === 'asc'
  const isDesc = isSorted && currentSortOrder === 'desc'

  return (
    <Button
      variant="ghost"
      onClick={() => onToggleSort(columnId)}
      className="-ml-4 hover:bg-transparent"
    >
      <span className={isSorted ? 'font-semibold' : ''}>{label}</span>
      <span className="ml-2 h-4 w-4">
        {!isSorted && <ArrowUpDown className="h-4 w-4 text-muted-foreground" />}
        {isAsc && <ArrowUp className="h-4 w-4 text-primary" />}
        {isDesc && <ArrowDown className="h-4 w-4 text-primary" />}
      </span>
    </Button>
  )
}

// ============================================================================
// Column Helper
// ============================================================================
type ExtendedColumnDef<TData = any, TValue = any> = ColumnDef<TData, TValue> & {
  sortable?: boolean
  getUniqueValues?: AccessorFn<TData, unknown[]>
}

// ============================================================================
// 🎯 Enhanced Column Creation Function
// ============================================================================
function createColumn<TData = any, TValue = any>(
  column: ExtendedColumnDef<TData, TValue>,
  sortBy: string | null,
  sortOrder: 'asc' | 'desc',
  toggleSort: (columnId: string) => void
): ColumnDef<TData, TValue> {
  if (column.sortable) {
    return {
      ...column,
      header: ({ column: tableColumn }) => (
        <SortableColumn
          label={typeof column.header === 'string' ? column.header : tableColumn.id}
          columnId={tableColumn.id}
          currentSortBy={sortBy || undefined}
          currentSortOrder={sortOrder}
          onToggleSort={toggleSort}
        />
      ),
    } as ColumnDef<TData, TValue>
  }
  return column
}

// ============================================================================
// 🧱 ServerTable Component
// ============================================================================
interface ServerTableProps<TData, TValue> {
  columns: ExtendedColumnDef<TData, TValue>[]
  data: TData[]
  totalCount: number
  searchPlaceholder?: string
  enableSearch?: boolean
  secondarySearchPlaceholder?: string
  secondarySearchParamName?: string
  filterFields?: FilterField[]
  pageSizeOptions?: number[]
  enableRowSelection?: boolean
  onRowSelectionChange?: (rows: TData[]) => void
  defaultPageSize?: number
  enableDateFilter?: boolean
  dateParamNames?: [string, string]
  background?: string
}

export function ServerTable<TData, TValue>({
  columns,
  data,
  totalCount,
  searchPlaceholder = 'Search...',
  enableSearch = true,
  secondarySearchPlaceholder,
  secondarySearchParamName,
  filterFields = [],
  pageSizeOptions = [10, 20, 30, 50],
  enableRowSelection = false,
  onRowSelectionChange,
  defaultPageSize = DEFAULT_PAGE_SIZE,
  enableDateFilter = false,
  dateParamNames = ['startDate', 'endDate'],
  background = 'bg-card/30',
}: ServerTableProps<TData, TValue>) {
  const tableState = useServerTableState({
    defaultPageSize,
    includeDateFilter: enableDateFilter,
    customFilters: [
      ...filterFields.map(f => f.paramName),
      ...(secondarySearchParamName ? [secondarySearchParamName] : []),
    ],
  })

  const {
    page,
    pageSize,
    filter,
    sortBy,
    sortOrder,
    startDate,
    endDate,
    setPage,
    setPageSize,
    setFilter,
    toggleSort,
    clearFilters,
    setFilterParam,
  } = tableState

  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})
  const [inputValue, setInputValue] = React.useState(filter)
  const [secondaryInputValue, setSecondaryInputValue] = React.useState(
    secondarySearchParamName ? (tableState as any)[secondarySearchParamName] || '' : ''
  )

  // Sync secondary input value with URL state
  React.useEffect(() => {
    if (secondarySearchParamName) {
      const urlValue = (tableState as any)[secondarySearchParamName] || ''
      if (urlValue !== secondaryInputValue) {
        setSecondaryInputValue(urlValue)
      }
    }
  }, [secondarySearchParamName, tableState, secondaryInputValue])

  const processedColumns = React.useMemo(
    () =>
      columns.map(col =>
        createColumn(col, sortBy, (sortOrder || DEFAULT_SORT_ORDER) as 'asc' | 'desc', toggleSort)
      ),
    [columns, sortBy, sortOrder, toggleSort]
  )

  React.useEffect(() => setInputValue(filter), [filter])

  React.useEffect(() => {
    if (enableRowSelection && onRowSelectionChange) {
      const selectedRows = Object.keys(rowSelection)
        .filter(key => rowSelection[key])
        .map(key => data[parseInt(key, 10)])
        .filter(Boolean)
      onRowSelectionChange(selectedRows)
    }
  }, [rowSelection, data, enableRowSelection, onRowSelectionChange])

  const table = useReactTable({
    data,
    columns: processedColumns,
    state: { columnVisibility, rowSelection },
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableRowSelection,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  })

  const totalPages = Math.max(1, Math.ceil(totalCount / (pageSize || 1)))

  const hasAnyFilter =
    (filter?.length ?? 0) > 0 ||
    (secondarySearchParamName &&
      ((tableState as any)[secondarySearchParamName]?.length ?? 0) > 0) ||
    filterFields.some(f => {
      const value = (tableState as any)[f.paramName]
      return value !== undefined && value !== null
    }) ||
    (enableDateFilter && startDate && endDate)

  const activeFilterCount =
    (filter?.length ? 1 : 0) +
    (secondarySearchParamName && ((tableState as any)[secondarySearchParamName]?.length ?? 0) > 0
      ? 1
      : 0) +
    filterFields.filter(f => {
      const value = (tableState as any)[f.paramName]
      return value !== undefined && value !== null
    }).length +
    (enableDateFilter && startDate && endDate ? 1 : 0)

  // ========================================================================
  // Render
  // ========================================================================
  return (
    <div className="w-full space-y-4">
      {/* --- Toolbar --- */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex flex-1 items-center gap-2 flex-wrap">
          {/* Search */}
          {enableSearch && (
            <Input
              placeholder={searchPlaceholder}
              value={inputValue}
              onChange={e => {
                setInputValue(e.target.value)
                setFilter(e.target.value)
              }}
              className="h-8 w-[150px] lg:w-[250px]"
            />
          )}

          {/* Secondary Search */}
          {secondarySearchParamName && secondarySearchPlaceholder && (
            <Input
              placeholder={secondarySearchPlaceholder}
              value={secondaryInputValue}
              onChange={e => {
                setSecondaryInputValue(e.target.value)
                setFilterParam(secondarySearchParamName, e.target.value || null)
              }}
              className="h-8 w-[150px] lg:w-[250px]"
            />
          )}

          {/* Date Range Filter */}
          {enableDateFilter && (
            <DateRangePicker paramNames={dateParamNames} icon={<Calendar className="h-4 w-4" />} />
          )}

          {/* Dropdown Filters */}
          {filterFields.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[250px]">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="space-y-4 p-2">
                  {filterFields.map(field => (
                    <div key={field.paramName} className="space-y-2">
                      <Label className="text-xs font-medium">{field.label}</Label>
                      <Select
                        value={((tableState as any)[field.paramName] as string) || 'all'}
                        onValueChange={v => setFilterParam(field.paramName, v === 'all' ? null : v)}
                      >
                        <SelectTrigger className="h-8 w-full">
                          <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          {field.options.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Clear Filters */}
          {hasAnyFilter && (
            <Button
              variant="ghost"
              onClick={() => {
                setInputValue('')
                setSecondaryInputValue('')
                clearFilters()
              }}
              className="h-8 px-2 lg:px-3"
            >
              Clear
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Column Visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[150px]">
            {table
              .getAllColumns()
              .filter(col => col.accessorFn !== undefined && col.getCanHide())
              .map(col => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  className="capitalize"
                  checked={col.getIsVisible()}
                  onCheckedChange={v => col.toggleVisibility(!!v)}
                >
                  {col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* --- Table --- */}
      <div className={`rounded-md border ${background} border-border/80`}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id}>
                {hg.headers.map(header => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns?.length ?? 1}
                  className="h-24 text-center text-muted-foreground"
                >
                  No data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- Pagination --- */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1">
          {enableRowSelection && (
            <div className="text-sm text-muted-foreground">
              {Object.keys(rowSelection).length} of {totalCount} selected
            </div>
          )}
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows</p>
            <Select value={String(pageSize)} onValueChange={v => setPageSize(Number(v))}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map(s => (
                  <SelectItem key={s} value={String(s)}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex w-[100px] justify-center text-sm font-medium">
            Page {page} of {totalPages || 1}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              «
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              ‹
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
            >
              ›
            </Button>

            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
            >
              »
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
