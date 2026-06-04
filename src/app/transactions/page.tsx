"use client"
import { useQuery } from "@tanstack/react-query"
import { txnsApi as transactionsApi } from "@/lib/api"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { AppShell } from "@/components/layout/app-shell"
import { formatDate, formatCurrency } from "@/lib/utils"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { Transaction } from "@/lib/types"

export default function TransactionsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const { data, isLoading } = useQuery({
    queryKey: ["transactions", page, search],
    queryFn: () => transactionsApi.list({ page: String(page), page_size: "15", search }),
  })
  const totalPages = data ? Math.ceil(data.count / 15) : 0

  return (
    <AppShell>
      <PageHeader title="Transactions" description="All financial transactions across the platform" />

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card><CardContent className="p-4"><p className="text-xs text-slate-600">Total</p><p className="text-lg font-bold">{data?.count ?? "—"}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-slate-600">Total Value</p><p className="text-lg font-bold">{formatCurrency((data?.results || []).reduce((s: number, t: Transaction) => s + (t.amount || 0), 0))}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-slate-600">Page</p><p className="text-lg font-bold">{page} / {totalPages}</p></CardContent></Card>
      </div>

      <DataTable
        columns={[
          { key: "reference", header: "Reference" },
          { key: "organization", header: "Organization", render: (t: any) => t.organization_email || t.organization || "—" },
          { key: "type", header: "Type", render: (t: Transaction) => <StatusBadge status={t.type || "payment"} /> },
          { key: "status", header: "Status", render: (t: Transaction) => <StatusBadge status={t.status} /> },
          { key: "amount", header: "Amount", render: (t: Transaction) => formatCurrency(t.amount) },
          { key: "date", header: "Date", render: (t: Transaction) => formatDate(t.date) },
        ]}
        data={data?.results || []} loading={isLoading}
        searchable onSearch={(q) => { setSearch(q); setPage(1) }}
        page={page} totalPages={totalPages} onPageChange={setPage} total={data?.count}
      />
    </AppShell>
  )
}
