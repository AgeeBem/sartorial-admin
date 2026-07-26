"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { orgApi, bulkApi } from "@/lib/api"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { formatDate, formatDateTime } from "@/lib/utils"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, XCircle, Building2 } from "lucide-react"
import type { Organization } from "@/lib/types"

const AVATAR_TONES = [
  "bg-indigo-100 text-indigo-700", "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700",
  "bg-sky-100 text-sky-700", "bg-violet-100 text-violet-700", "bg-rose-100 text-rose-700",
]
function avatarFor(seed: string) {
  const initials = (seed || "?").trim().slice(0, 2).toUpperCase()
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return { initials, tone: AVATAR_TONES[Math.abs(h) % AVATAR_TONES.length] }
}

export default function OrganizationsPage() {
  const router = useRouter()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string[]>([])

  const { data, isLoading } = useQuery({
    queryKey: ["organizations", page, search],
    queryFn: () => orgApi.list({ page: String(page), page_size: "15", search }),
  })

  const activateMutation = useMutation({ mutationFn: (ids: string[]) => bulkApi.activate(ids),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organizations"] }); setSelected([]) }
  })
  const suspendMutation = useMutation({ mutationFn: (ids: string[]) => bulkApi.suspend(ids),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organizations"] }); setSelected([]) }
  })

  const totalPages = data ? Math.ceil(data.count / 15) : 0

  const columns = [
    { key: "email", header: "Organization", render: (o: Organization) => {
      const av = avatarFor(o.full_name || o.email)
      return (
        <div className="flex items-center gap-3">
          <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${av.tone}`}>
            {av.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-800">{o.email}</p>
            <p className="truncate text-xs text-slate-500">{o.full_name || "—"}</p>
          </div>
        </div>
      )
    }},
    { key: "is_active", header: "Status", render: (o: Organization) => <StatusBadge status={o.is_active ? "active" : "inactive"} /> },
    { key: "subscription_plan", header: "Plan", render: (o: Organization) => (
      <span className="text-sm">{o.subscription_plan || "—"}</span>
    )},
    { key: "subscription_status", header: "Sub Status", render: (o: Organization) => o.subscription_status ? <StatusBadge status={o.subscription_status} /> :               <span className="text-slate-500">—</span> },
    { key: "staff_count", header: "Staff" },
    { key: "order_count", header: "Orders" },
    { key: "inventory_count", header: "Inventory" },
    { key: "expense_count", header: "Expenses" },
    { key: "date_joined", header: "Joined", render: (o: Organization) => formatDate(o.date_joined) },
    { key: "last_login", header: "Last Login", render: (o: Organization) => o.last_login ? formatDateTime(o.last_login) : "Never" },
  ]

  return (
    <AppShell>
      <PageHeader title="Organizations" description="Manage all registered organizations" eyebrow="Accounts" icon={Building2}
        actions={
          <div className="flex gap-2">
            {selected.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={() => activateMutation.mutate(selected)}>
                  <CheckCircle size={14} className="mr-1 text-emerald-600" /> Activate ({selected.length})
                </Button>
                <Button variant="outline" size="sm" onClick={() => suspendMutation.mutate(selected)}>
                  <XCircle size={14} className="mr-1 text-red-600" /> Suspend ({selected.length})
                </Button>
              </>
            )}
          </div>
        }
      />
      <DataTable
        columns={columns} data={data?.results || []} loading={isLoading}
        searchable onSearch={(q) => { setSearch(q); setPage(1) }}
        page={page} totalPages={totalPages} onPageChange={setPage} total={data?.count}
        onRowClick={(org: Organization) => router.push(`/organizations/${org.id}`)}
      />
    </AppShell>
  )
}
