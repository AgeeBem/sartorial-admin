"use client"
import { useQuery } from "@tanstack/react-query"
import { auditApi } from "@/lib/api"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { AppShell } from "@/components/layout/app-shell"
import { formatDateTime } from "@/lib/utils"
import { useState } from "react"

export default function AuditLogPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const { data, isLoading } = useQuery({
    queryKey: ["audit-log", page, search],
    queryFn: () => auditApi.list({ page: String(page), page_size: "20", search }),
  })
  const totalPages = data ? Math.ceil(data.count / 20) : 0

  return (
    <AppShell>
      <PageHeader title="Audit Log" description="Complete trail of all admin actions" />
      <DataTable
        columns={[
          { key: "admin", header: "Admin", render: (a: any) => a.admin_email || a.admin || "—" },
          { key: "action", header: "Action", render: (a: any) => <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{a.action}</code> },
          { key: "resource_type", header: "Resource", render: (a: any) => (
            <span className="text-sm">
              <span className="capitalize">{a.resource_type || a.model_name || "—"}</span>
              {a.resource_repr && a.resource_repr !== "[hidden]" && (
                <span className="text-slate-500"> · {a.resource_repr}</span>
              )}
            </span>
          ) },
          { key: "ip_address", header: "IP" },
          { key: "timestamp", header: "Timestamp", render: (a: any) => formatDateTime(a.timestamp) },
        ]}
        data={data?.results || []} loading={isLoading}
        searchable onSearch={(q) => { setSearch(q); setPage(1) }}
        page={page} totalPages={totalPages} onPageChange={setPage} total={data?.count}
      />
    </AppShell>
  )
}
