"use client"
import { useQuery } from "@tanstack/react-query"
import { clientsApi } from "@/lib/api"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { AppShell } from "@/components/layout/app-shell"
import { formatDate } from "@/lib/utils"
import { useState } from "react"

export default function ClientsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const { data, isLoading } = useQuery({
    queryKey: ["clients", page, search],
    queryFn: () => clientsApi.list({ page: String(page), page_size: "15", search }),
  })
  const totalPages = data ? Math.ceil(data.count / 15) : 0

  return (
    <AppShell>
      <PageHeader title="Clients" description="All clients across organizations" />
      <DataTable
        columns={[
          { key: "name", header: "Name" },
          { key: "phone_number", header: "Phone" },
          { key: "email", header: "Email" },
          { key: "organization", header: "Organization", render: (c: any) => c.organization_email || c.organization || "—" },
          { key: "order_count", header: "Orders" },
          { key: "total_spent", header: "Spent", render: (c: any) => `₦${(c.total_spent || 0).toLocaleString()}` },
          { key: "is_active", header: "Status", render: (c: any) => <StatusBadge status={c.is_active ? "active" : "inactive"} /> },
          { key: "created_at", header: "Created", render: (c: any) => formatDate(c.created_at) },
        ]}
        data={data?.results || []} loading={isLoading}
        searchable onSearch={(q) => { setSearch(q); setPage(1) }}
        page={page} totalPages={totalPages} onPageChange={setPage} total={data?.count}
      />
    </AppShell>
  )
}
