"use client"
import { useQuery } from "@tanstack/react-query"
import { expensesApi } from "@/lib/api"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { AppShell } from "@/components/layout/app-shell"
import { formatDate, formatCurrency } from "@/lib/utils"
import { useState } from "react"

export default function ExpensesPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const { data, isLoading } = useQuery({
    queryKey: ["expenses", page, search],
    queryFn: () => expensesApi.list({ page: String(page), page_size: "15", search }),
  })
  const totalPages = data ? Math.ceil(data.count / 15) : 0

  return (
    <AppShell>
      <PageHeader title="Expenses" description="All expenses and bills across organizations" />
      <DataTable
        columns={[
          { key: "title", header: "Title" },
          { key: "organization", header: "Organization", render: (e: any) => e.organization_email || e.organization || "—" },
          { key: "amount", header: "Amount", render: (e: any) => formatCurrency(e.amount || 0) },
          { key: "status", header: "Status", render: (e: any) => <StatusBadge status={e.status} /> },
          { key: "category", header: "Category" },
          { key: "date", header: "Date", render: (e: any) => formatDate(e.date) },
        ]}
        data={data?.results || []} loading={isLoading}
        searchable onSearch={(q) => { setSearch(q); setPage(1) }}
        page={page} totalPages={totalPages} onPageChange={setPage} total={data?.count}
      />
    </AppShell>
  )
}
