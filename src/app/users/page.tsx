"use client"
import { useQuery } from "@tanstack/react-query"
import { usersApi } from "@/lib/api"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { AppShell } from "@/components/layout/app-shell"
import { formatDate } from "@/lib/utils"
import { useState } from "react"

export default function UsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const { data, isLoading } = useQuery({
    queryKey: ["users", page, search],
    queryFn: () => usersApi.list({ page: String(page), page_size: "15", search }),
  })
  const totalPages = data ? Math.ceil(data.count / 15) : 0

  return (
    <AppShell>
      <PageHeader title="Users" description="All registered platform users" />
      <DataTable
        columns={[
          { key: "email", header: "Email" },
          { key: "full_name", header: "Name" },
          { key: "role", header: "Role", render: (u: any) => <StatusBadge status={u.role || "user"} /> },
          { key: "organization", header: "Organization" },
          { key: "is_active", header: "Status", render: (u: any) => <StatusBadge status={u.is_active ? "active" : "inactive"} /> },
          { key: "date_joined", header: "Joined", render: (u: any) => formatDate(u.date_joined) },
        ]}
        data={data?.results || []} loading={isLoading}
        searchable onSearch={(q) => { setSearch(q); setPage(1) }}
        page={page} totalPages={totalPages} onPageChange={setPage} total={data?.count}
      />
    </AppShell>
  )
}
