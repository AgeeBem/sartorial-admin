"use client"
import { useQuery } from "@tanstack/react-query"
import { ordersApi } from "@/lib/api"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { AppShell } from "@/components/layout/app-shell"
import { formatDate, formatCurrency } from "@/lib/utils"
import { useState } from "react"

export default function OrdersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const { data, isLoading } = useQuery({
    queryKey: ["orders", page, search],
    queryFn: () => ordersApi.list({ page: String(page), page_size: "15", search }),
  })
  const totalPages = data ? Math.ceil(data.count / 15) : 0

  return (
    <AppShell>
      <PageHeader title="Orders" description="All orders across the platform" />
      <DataTable
        columns={[
          { key: "order_title", header: "Title" },
          { key: "organization_email", header: "Organization", render: (o: any) => o.organization_email || "—" },
          { key: "client_name", header: "Client", render: (o: any) => o.client_name || "—" },
          { key: "order_price", header: "Total", render: (o: any) => formatCurrency(o.order_price) },
          { key: "total_paid", header: "Paid", render: (o: any) => formatCurrency(o.total_paid) },
          { key: "balance_amount", header: "Balance", render: (o: any) => formatCurrency(o.balance_amount) },
          { key: "order_status", header: "Status", render: (o: any) => <StatusBadge status={o.order_status} /> },
          { key: "end_date", header: "End Date", render: (o: any) => formatDate(o.end_date) },
          { key: "created_at", header: "Created", render: (o: any) => formatDate(o.created_at) },
        ]}
        data={data?.results || []} loading={isLoading}
        searchable onSearch={(q) => { setSearch(q); setPage(1) }}
        page={page} totalPages={totalPages} onPageChange={setPage} total={data?.count}
      />
    </AppShell>
  )
}
