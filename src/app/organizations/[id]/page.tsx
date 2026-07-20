"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { orgApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { formatDate, formatCurrency, formatDateTime } from "@/lib/utils"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Building2, Users, ShoppingBag, DollarSign, Calendar, Activity } from "lucide-react"
import type { ActivityEvent } from "@/lib/types"

export default function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const qc = useQueryClient()

  const { data: org, isLoading } = useQuery({
    queryKey: ["organization", id],
    queryFn: () => orgApi.get(id),
  })
  const { data: activity } = useQuery({
    queryKey: ["organization-activity", id],
    queryFn: () => orgApi.activity(id),
  })

  const actionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) => orgApi.action(id, action),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["organization", id] }),
  })

  if (isLoading) return <AppShell><div className="h-8 w-48 animate-pulse rounded bg-slate-100" /></AppShell>
  if (!org) return <AppShell><p>Organization not found</p></AppShell>

  return (
    <AppShell>
      <PageHeader title={org.email} description={`${org.full_name} — Joined ${formatDate(org.date_joined)}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/organizations")}>
              <ArrowLeft size={14} className="mr-1" /> Back
            </Button>
            <Button variant="outline" size="sm"
              onClick={() => actionMutation.mutate({ id, action: org.is_active ? "suspend" : "activate" })}>
              {org.is_active ? "Suspend" : "Activate"}
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2"><Building2 size={18} className="text-blue-600" /></div>
                  <div><p className="text-xs text-slate-600">Status</p><StatusBadge status={org.is_active ? "active" : "inactive"} /></div>
        </div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-100 p-2"><ShoppingBag size={18} className="text-emerald-600" /></div>
                            <div><p className="text-xs text-slate-600">Orders</p><p className="text-lg font-bold">{org.order_count}</p></div>
        </div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-2"><Users size={18} className="text-purple-600" /></div>
                            <div><p className="text-xs text-slate-600">Staff / Clients</p><p className="text-lg font-bold">{org.staff_count} / {org.client_count}</p></div>
        </div></CardContent></Card>
        {org.revenue !== undefined && (
          <Card><CardContent className="p-4"><div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2"><DollarSign size={18} className="text-amber-600" /></div>
                              <div><p className="text-xs text-slate-600">Revenue</p><p className="text-lg font-bold">{formatCurrency(org.revenue)}</p></div>
          </div></CardContent></Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Plan", org.subscription_plan || "—"],
              ["Sub Status", org.subscription_status || "—"],
              ["Phone", org.phone_number || "—"],
              ["Staff Count", String(org.staff_count)],
              ["Client Count", String(org.client_count)],
              ["Inventory", String(org.inventory_count)],
              // Owner-only business financials — omitted for support.
              ...(org.expense_total !== undefined ? [["Expenses", formatCurrency(org.expense_total)]] : []),
              ...(org.outstanding_balance !== undefined ? [["Outstanding", formatCurrency(org.outstanding_balance)]] : []),
              ["Last Login", org.last_login ? formatDateTime(org.last_login) : "Never"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
              <span className="text-slate-600">{label}</span>
              <span className="font-medium text-slate-800">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Activity Timeline</CardTitle></CardHeader>
          <CardContent className="max-h-[400px] overflow-y-auto space-y-3">
            {activity?.events?.slice(0, 30).map((event: ActivityEvent, i: number) => (
              <div key={i} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0">
                <div className="mt-0.5 rounded-full bg-slate-100 p-1.5">
                  <Activity size={12} className="text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium capitalize">{event.type}</p>
                  <p className="text-xs text-slate-600 truncate">{event.title || event.name || event.description || event.action || event.type}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(event.date)}</p>
                </div>
                {event.amount && <span className="text-sm font-medium">{formatCurrency(event.amount)}</span>}
              </div>
            ))}
            {(!activity?.events || activity.events.length === 0) && (
              <p className="text-sm text-slate-600 text-center py-4">No activity recorded</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
