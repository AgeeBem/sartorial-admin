"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { subsApi } from "@/lib/api"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatCurrency } from "@/lib/utils"
import { useState } from "react"
import { Plus, RotateCcw, History } from "lucide-react"
import type { Subscription } from "@/lib/types"

export default function SubscriptionsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [showOverride, setShowOverride] = useState(false)
  const [overrideForm, setOverrideForm] = useState({ subscription_id: "", price: "", status: "active", end_date: "" })

  const { data, isLoading } = useQuery({
    queryKey: ["subscriptions", page, search],
    queryFn: () => subsApi.list({ page: String(page), page_size: "15", search }),
  })
  const { data: history } = useQuery({
    queryKey: ["subscriptions-history"],
    queryFn: () => subsApi.history({ limit: "10" }),
  })

  const overrideMutation = useMutation({
    mutationFn: () => subsApi.override({
      subscription_id: Number(overrideForm.subscription_id),
      price: overrideForm.price ? Number(overrideForm.price) : undefined,
      status: overrideForm.status || undefined,
      end_date: overrideForm.end_date || undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["subscriptions"] }); setShowOverride(false); setOverrideForm({ subscription_id: "", price: "", status: "active", end_date: "" }) },
  })

  const totalPages = data ? Math.ceil(data.count / 15) : 0

  return (
    <AppShell>
      <PageHeader title="Subscriptions" description="Manage all subscription records"
        actions={
          <Button size="sm" variant="outline" onClick={() => setShowOverride(!showOverride)}>
            <Plus size={14} className="mr-1" /> Override
          </Button>
        }
      />

      {showOverride && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Subscription Override</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-4">
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Subscription ID</label>
                <input className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm" value={overrideForm.subscription_id} onChange={e => setOverrideForm(f => ({ ...f, subscription_id: e.target.value }))} /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Override Price</label>
                <input type="number" className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm" value={overrideForm.price} onChange={e => setOverrideForm(f => ({ ...f, price: e.target.value }))} /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                <select className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm" value={overrideForm.status} onChange={e => setOverrideForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="active">Active</option><option value="expired">Expired</option><option value="cancelled">Cancelled</option><option value="trial">Trial</option>
                </select></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
                <input type="date" className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm" value={overrideForm.end_date} onChange={e => setOverrideForm(f => ({ ...f, end_date: e.target.value }))} /></div>
            </div>
            <Button size="sm" className="mt-3" onClick={() => overrideMutation.mutate()}>Apply Override</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3 mb-6">
        <Card><CardContent className="p-4"><p className="text-xs text-slate-600">Total</p><p className="text-lg font-bold">{data?.count ?? "—"}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-slate-600">Active</p><p className="text-lg font-bold text-emerald-600">{(data?.results || []).filter((s: Subscription) => s.status === "active").length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-slate-600">Recent History</p><p className="text-lg font-bold">{history?.events?.length || history?.count || 0}</p></CardContent></Card>
      </div>

      <DataTable
        columns={[
          { key: "id", header: "ID" },
          { key: "organization", header: "Organization", render: (s: any) => s.organization_email || s.organization || "—" },
          { key: "plan", header: "Plan", render: (s: any) => s.plan_name || s.plan || "—" },
          { key: "status", header: "Status", render: (s: Subscription) => <StatusBadge status={s.status} /> },
          { key: "amount", header: "Amount", render: (s: Subscription) => formatCurrency(s.amount || s.price || 0) },
          { key: "start_date", header: "Start", render: (s: Subscription) => formatDate(s.start_date) },
          { key: "end_date", header: "End", render: (s: Subscription) => formatDate(s.end_date) },
        ]}
        data={data?.results || []} loading={isLoading}
        searchable onSearch={(q) => { setSearch(q); setPage(1) }}
        page={page} totalPages={totalPages} onPageChange={setPage} total={data?.count}
      />

      {history?.events && history.events.length > 0 && (
        <Card className="mt-6">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><History size={16} /> Recent History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.events.slice(0, 10).map((h: any, i: number) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-2 text-sm">
                  <span><span className="font-medium">{h.action || h.type}</span> — {h.description || h.details || ""}</span>
                  <span className="text-slate-500 text-xs">{formatDate(h.date || h.created_at)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </AppShell>
  )
}
