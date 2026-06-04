"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { plansApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useState } from "react"
import { Plus, Edit, Check, X } from "lucide-react"
import type { Plan } from "@/lib/types"

export default function PlansPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Plan | null>(null)
  const [form, setForm] = useState({ name: "", price: "", max_staff: "", max_clients: "", description: "", features: "", is_active: true })

  const { data, isLoading } = useQuery({ queryKey: ["plans"], queryFn: plansApi.list })

  const createMutation = useMutation({
    mutationFn: () => plansApi.create({
      name: form.name, price: Number(form.price) || 0, max_staff: Number(form.max_staff) || 0,
      max_clients: Number(form.max_clients) || 0, description: form.description,
      features: form.features.split("\n").filter(Boolean), is_active: form.is_active,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["plans"] }); resetForm() },
  })

  const updateMutation = useMutation({
    mutationFn: () => plansApi.update(editing!.id, {
      name: form.name, price: Number(form.price) || 0, max_staff: Number(form.max_staff) || 0,
      max_clients: Number(form.max_clients) || 0, description: form.description,
      features: form.features.split("\n").filter(Boolean), is_active: form.is_active,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["plans"] }); resetForm() },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      plansApi.update(id, { is_active: active } as any),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["plans"] }),
  })

  function resetForm() { setShowForm(false); setEditing(null); setForm({ name: "", price: "", max_staff: "", max_clients: "", description: "", features: "", is_active: true }) }
  function editPlan(p: Plan) {
    setEditing(p); setShowForm(true)
    setForm({ name: p.name, price: String(p.price), max_staff: String(p.max_staff), max_clients: String(p.max_clients), description: p.description || "", features: (p.features || []).join("\n"), is_active: p.is_active })
  }

  return (
    <AppShell>
      <PageHeader title="Subscription Plans" description="Manage pricing plans and features"
        actions={<Button size="sm" onClick={() => { setEditing(null); setShowForm(!showForm); setForm({ name: "", price: "", max_staff: "", max_clients: "", description: "", features: "", is_active: true }) }}>
          <Plus size={14} className="mr-1" /> {showForm ? "Cancel" : "New Plan"}
        </Button>}
      />

      {showForm && (
        <Card className="mb-6 border-slate-200">
          <CardHeader><CardTitle className="text-base">{editing ? "Edit Plan" : "Create Plan"}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
                <input className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Price (₦)</label>
                <input type="number" className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Max Staff</label>
                <input type="number" className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm" value={form.max_staff} onChange={e => setForm(p => ({ ...p, max_staff: e.target.value }))} /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Max Clients</label>
                <input type="number" className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm" value={form.max_clients} onChange={e => setForm(p => ({ ...p, max_clients: e.target.value }))} /></div>
              <div className="sm:col-span-2"><label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <input className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
              <div className="sm:col-span-3"><label className="block text-xs font-medium text-slate-600 mb-1">Features (one per line)</label>
                <textarea className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm h-20" value={form.features} onChange={e => setForm(p => ({ ...p, features: e.target.value }))} /></div>
              <div className="flex items-center gap-2"><input type="checkbox" id="plan-active" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} />
                <label htmlFor="plan-active" className="text-sm">Active</label></div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={() => editing ? updateMutation.mutate() : createMutation.mutate()}>
                {editing ? "Update Plan" : "Create Plan"}
              </Button>
              <Button variant="outline" size="sm" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <DataTable
        columns={[
          { key: "name", header: "Name" },
          { key: "price", header: "Price", render: (p: Plan) => formatCurrency(p.price) },
          { key: "max_staff", header: "Max Staff" },
          { key: "max_clients", header: "Max Clients" },
          { key: "is_active", header: "Active", render: (p: Plan) => p.is_active ? <Check size={16} className="text-emerald-600" /> : <X size={16} className="text-slate-500" /> },
          { key: "subscriber_count", header: "Subscribers" },
          { key: "actions", header: "Actions", render: (p: Plan) => (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => editPlan(p)}><Edit size={14} /></Button>
              <Button variant="ghost" size="sm" onClick={() => toggleMutation.mutate({ id: p.id, active: !p.is_active })}>
                {p.is_active ? <X size={14} className="text-red-500" /> : <Check size={14} className="text-emerald-500" />}
              </Button>
            </div>
          )},
        ]}
        data={data?.results || []} loading={isLoading}
      />
    </AppShell>
  )
}
