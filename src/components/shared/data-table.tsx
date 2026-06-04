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
        <div className="flex items-center justify-between mb-4">
          {searchable && (
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <Input
                placeholder={searchPlaceholder}
                value={localSearch}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          )}
          {total !== undefined && (
            <p className="text-sm text-slate-600">{total.toLocaleString()} total</p>
          )}
        </div>
      )}
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              {columns.map((col) => (
                <TableHead key={col.key} className={cn("text-xs font-semibold uppercase tracking-wider text-slate-600", col.className)}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.key}><div className="h-4 w-24 animate-pulse rounded bg-slate-100" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-sm text-slate-600">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, i) => (
                <TableRow key={item.id || i} className={cn(onRowClick && "cursor-pointer hover:bg-slate-50")} onClick={() => onRowClick?.(item)}>
                  {columns.map((col) => (
                    <TableCell key={col.key} className={cn("text-sm", col.className)}>
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
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-600">Page {page} of {totalPages}</p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)}>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange?.(page + 1)}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
