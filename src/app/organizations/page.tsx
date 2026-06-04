"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { orgApi, bulkApi } from "@/lib/api"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { formatDate, formatCurrency } from "@/lib/utils"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import type { Organization } from "@/lib/types"

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
    { key: "email", header: "Email", render: (o: Organization) => (
      <div><p className="font-medium">{o.email}</p>                    <p className="text-xs text-slate-600">{o.full_name}</p></div>
    )},
    { key: "is_active", header: "Status", render: (o: Organization) => <StatusBadge status={o.is_active ? "active" : "inactive"} /> },
    { key: "subscription_plan", header: "Plan", render: (o: Organization) => (
      <span className="text-sm">{o.subscription_plan || "—"}</span>
    )},
    { key: "subscription_status", header: "Sub Status", render: (o: Organization) => o.subscription_status ? <StatusBadge status={o.subscription_status} /> :               <span className="text-slate-500">—</span> },
    { key: "staff_count", header: "Staff" },
    { key: "client_count", header: "Clients" },
    { key: "order_count", header: "Orders" },
    { key: "inventory_count", header: "Inventory" },
    { key: "revenue", header: "Revenue", render: (o: Organization) => formatCurrency(o.revenue) },
    { key: "date_joined", header: "Joined", render: (o: Organization) => formatDate(o.date_joined) },
  ]

  return (
    <AppShell>
      <PageHeader title="Organizations" description="Manage all registered organizations"
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
