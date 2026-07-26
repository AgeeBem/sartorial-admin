"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
  className?: string
  sortable?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  total?: number
  onRowClick?: (item: T) => void
  emptyMessage?: string
}

export function DataTable<T extends Record<string, any>>({
  columns, data, loading, searchable, searchPlaceholder = "Search...",
  onSearch, page, totalPages, onPageChange, total, onRowClick, emptyMessage = "No data found."
}: DataTableProps<T>) {
  const [localSearch, setLocalSearch] = useState("")

  const handleSearch = (val: string) => {
    setLocalSearch(val)
    onSearch?.(val)
  }

  return (
    <div>
      {(searchable || total !== undefined) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {searchable && (
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input
                placeholder={searchPlaceholder}
                value={localSearch}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-10 rounded-xl border-slate-200 bg-white pl-9 shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500/30"
              />
            </div>
          )}
          {total !== undefined && (
            <span className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {total.toLocaleString()} total
            </span>
          )}
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_16px_-8px_rgba(15,23,42,0.08)]">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200/70 bg-slate-50/80 hover:bg-slate-50/80">
              {columns.map((col) => (
                <TableHead key={col.key} className={cn("h-11 text-[11px] font-semibold uppercase tracking-wider text-slate-500", col.className)}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i} className="border-slate-100">
                  {columns.map((col) => (
                    <TableCell key={col.key}><div className="h-4 w-24 animate-pulse rounded bg-slate-100" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center text-sm text-slate-400">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, i) => (
                <TableRow
                  key={item.id || i}
                  className={cn(
                    "border-slate-100 transition-colors",
                    onRowClick && "cursor-pointer hover:bg-indigo-50/40",
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className={cn("py-3.5 text-sm text-slate-700", col.className)}>
                      {col.render ? col.render(item) : item[col.key] ?? "—"}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {page !== undefined && totalPages !== undefined && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page <span className="font-semibold text-slate-700">{page}</span> of {totalPages}
          </p>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" className="rounded-lg" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)}>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="outline" size="sm" className="rounded-lg" disabled={page >= totalPages} onClick={() => onPageChange?.(page + 1)}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
