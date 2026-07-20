"use client"
import { useQuery } from "@tanstack/react-query"
import { eventLogApi } from "@/lib/api"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { AppShell } from "@/components/layout/app-shell"
import { formatDateTime } from "@/lib/utils"
import { useState } from "react"

const LEVELS = ["", "error", "warning", "info"]

export default function EventLogPage() {
  const [page, setPage] = useState(1)
  const [level, setLevel] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["event-log", page, level],
    queryFn: () => eventLogApi.list({ page: String(page), page_size: "20", ...(level ? { level } : {}) }),
  })
  const totalPages = data ? Math.ceil(data.count / 20) : 0

  return (
    <AppShell>
      <PageHeader
        title="Event Log"
        description="Technical errors and events merchants encountered — with timestamps, no business data"
      />

      <div className="mb-4 flex gap-2">
        {LEVELS.map((lv) => (
          <button
            key={lv || "all"}
            onClick={() => { setLevel(lv); setPage(1) }}
            className={`rounded-lg px-3 py-1.5 text-sm capitalize transition-colors ${
              level === lv ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {lv || "All"}
          </button>
        ))}
      </div>

      <DataTable
        columns={[
          { key: "level", header: "Level", render: (e: any) => <StatusBadge status={e.level} /> },
          { key: "event_type", header: "Type" },
          { key: "status_code", header: "Status", render: (e: any) => e.status_code ?? "—" },
          { key: "method", header: "Method", render: (e: any) => e.method || "—" },
          { key: "path", header: "Path", render: (e: any) => <span className="font-mono text-xs">{e.path || "—"}</span> },
          { key: "organization_email", header: "Organization", render: (e: any) => e.organization_email || "—" },
          { key: "source", header: "Source" },
          { key: "created_at", header: "When", render: (e: any) => formatDateTime(e.created_at) },
        ]}
        data={data?.results || []}
        loading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        total={data?.count}
      />
    </AppShell>
  )
}
