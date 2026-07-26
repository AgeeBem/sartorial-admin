"use client"
import { useQuery } from "@tanstack/react-query"
import { loginLogsApi } from "@/lib/api"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { AppShell } from "@/components/layout/app-shell"
import { formatDateTime } from "@/lib/utils"
import { useState } from "react"
import { CheckCircle, XCircle } from "lucide-react"
import type { LoginLogEntry } from "@/lib/types"

const OUTCOMES: { key: string; label: string }[] = [
  { key: "", label: "All" },
  { key: "true", label: "Successful" },
  { key: "false", label: "Failed" },
]

export default function LoginLogsPage() {
  const [page, setPage] = useState(1)
  const [success, setSuccess] = useState("")
  const [search, setSearch] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["login-logs", page, success, search],
    queryFn: () =>
      loginLogsApi.list({
        page: String(page),
        page_size: "20",
        ...(success ? { success } : {}),
        ...(search ? { search } : {}),
      }),
  })
  const totalPages = data ? Math.ceil(data.count / 20) : 0

  return (
    <AppShell>
      <PageHeader
        title="Login Logs"
        description="Every organization login — owners and their staff — with timestamps and IP, no business data"
      />

      <div className="mb-4 flex gap-2">
        {OUTCOMES.map((o) => (
          <button
            key={o.key || "all"}
            onClick={() => { setSuccess(o.key); setPage(1) }}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              success === o.key ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={[
          {
            key: "success",
            header: "Result",
            render: (e: LoginLogEntry) =>
              e.success ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 text-sm"><CheckCircle size={14} /> Success</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-red-600 text-sm"><XCircle size={14} /> Failed</span>
              ),
          },
          {
            key: "organization_email",
            header: "Organization",
            render: (e: LoginLogEntry) => e.organization_email || "—",
          },
          {
            key: "email",
            header: "Account",
            render: (e: LoginLogEntry) => (
              <div>
                <p className="font-medium">{e.user_email || e.email || "—"}</p>
                {e.user_name && <p className="text-xs text-slate-500">{e.user_name}</p>}
              </div>
            ),
          },
          { key: "role", header: "Role", render: (e: LoginLogEntry) => e.role || "—" },
          { key: "ip_address", header: "IP", render: (e: LoginLogEntry) => <span className="font-mono text-xs">{e.ip_address || "—"}</span> },
          { key: "created_at", header: "When", render: (e: LoginLogEntry) => formatDateTime(e.created_at) },
        ]}
        data={data?.results || []}
        loading={isLoading}
        searchable
        onSearch={(q) => { setSearch(q); setPage(1) }}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        total={data?.count}
      />
    </AppShell>
  )
}
