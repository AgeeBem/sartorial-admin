"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { orgApi, subsApi, plansApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { formatDate, formatCurrency, formatDateTime } from "@/lib/utils"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, Building2, Users, ShoppingBag, CreditCard, Activity, Clock, Sparkles, CheckCircle, Gauge } from "lucide-react"
import type { ActivityEvent, Plan, Subscription } from "@/lib/types"

// Colour-coded urgency for the remaining trial/period window.
function expiryTone(sub: Subscription | null): { label: string; tone: string } {
  if (!sub) return { label: "—", tone: "text-slate-500" }
  if (sub.status === "free") return { label: "Free plan · no expiry", tone: "text-slate-600" }
  if (!sub.current_period_end) return { label: "No active period", tone: "text-slate-500" }
  const days = sub.days_remaining ?? 0
  if (days <= 0) return { label: `Expired ${formatDate(sub.current_period_end)}`, tone: "text-red-600" }
  if (days <= 7) return { label: `Expires in ${days} day${days === 1 ? "" : "s"}`, tone: "text-amber-600" }
  return { label: `${days} days remaining`, tone: "text-emerald-600" }
}

export default function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const qc = useQueryClient()

  const [trialDays, setTrialDays] = useState(14)
  const [planId, setPlanId] = useState("")
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)

  const { data: org, isLoading } = useQuery({ queryKey: ["organization", id], queryFn: () => orgApi.get(id) })
  const { data: activity } = useQuery({ queryKey: ["organization-activity", id], queryFn: () => orgApi.activity(id) })
  const { data: sub } = useQuery({ queryKey: ["organization-subscription", id], queryFn: () => subsApi.forOrganization(id) })
  const { data: plans } = useQuery({ queryKey: ["plans"], queryFn: () => plansApi.list() })
  const { data: usage } = useQuery({ queryKey: ["organization-usage", id], queryFn: () => orgApi.usage(id) })

  const invalidateSub = () => {
    qc.invalidateQueries({ queryKey: ["organization-subscription", id] })
    qc.invalidateQueries({ queryKey: ["organization", id] })
  }
  const onSubError = (e: any) => setFeedback({ ok: false, text: e?.response?.data?.detail || e?.response?.data?.message || "Something went wrong." })

  const actionMutation = useMutation({
    mutationFn: ({ action }: { action: string }) => orgApi.action(id, action),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["organization", id] }),
  })
  const activateTrial = useMutation({
    mutationFn: () => subsApi.activateTrial(sub!.id, trialDays),
    onSuccess: (r: any) => { invalidateSub(); setFeedback({ ok: true, text: r?.detail || `${trialDays}-day trial activated.` }) },
    onError: onSubError,
  })
  const extendTrial = useMutation({
    mutationFn: () => subsApi.extendTrial(sub!.id, trialDays),
    onSuccess: (r: any) => { invalidateSub(); setFeedback({ ok: true, text: r?.detail || `Extended by ${trialDays} days.` }) },
    onError: onSubError,
  })
  const changePlan = useMutation({
    mutationFn: () => subsApi.override(sub!.id, { plan_id: planId }),
    onSuccess: () => { invalidateSub(); setFeedback({ ok: true, text: "Plan updated." }) },
    onError: onSubError,
  })

  if (isLoading) return <AppShell><div className="h-8 w-48 animate-pulse rounded bg-slate-100" /></AppShell>
  if (!org) return <AppShell><p>Organization not found</p></AppShell>

  const busy = activateTrial.isPending || extendTrial.isPending || changePlan.isPending
  const expiry = expiryTone(sub ?? null)
  const planList = (plans?.results || []) as Plan[]

  return (
    <AppShell>
      <PageHeader title={org.email} description={`${org.full_name} · Joined ${formatDate(org.date_joined)}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/organizations")}>
              <ArrowLeft size={14} className="mr-1" /> Back
            </Button>
            <Button variant="outline" size="sm"
              onClick={() => actionMutation.mutate({ action: org.is_active ? "suspend" : "activate" })}>
              {org.is_active ? "Suspend" : "Activate"}
            </Button>
          </div>
        }
      />

      {/* Usage counts and account status — what Sartorial needs, not merchant records */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2"><Building2 size={18} className="text-blue-600" /></div>
          <div><p className="text-xs text-slate-600">Status</p><StatusBadge status={org.is_active ? "active" : "inactive"} /></div>
        </div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-2"><Users size={18} className="text-purple-600" /></div>
          <div><p className="text-xs text-slate-600">Staff</p><p className="text-lg font-bold">{org.staff_count}</p></div>
        </div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-100 p-2"><ShoppingBag size={18} className="text-emerald-600" /></div>
          <div><p className="text-xs text-slate-600">Orders / Inventory</p><p className="text-lg font-bold">{org.order_count} / {org.inventory_count}</p></div>
        </div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-100 p-2"><CreditCard size={18} className="text-amber-600" /></div>
          <div><p className="text-xs text-slate-600">Plan</p><p className="text-sm font-bold">{org.subscription_plan || "—"}</p></div>
        </div></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Subscription & trial management */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Sparkles size={16} className="text-indigo-500" /> Subscription</CardTitle>
            {sub && <StatusBadge status={sub.status} />}
          </CardHeader>
          <CardContent>
            {!sub ? (
              <p className="text-sm text-slate-500">No subscription record for this organization.</p>
            ) : (
              <>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Current plan</p>
                    <p className="text-xl font-bold text-slate-900">{sub.plan_name || org.subscription_plan || "—"}</p>
                    <p className={`mt-1 flex items-center gap-1.5 text-sm font-medium ${expiry.tone}`}>
                      <Clock size={14} /> {expiry.label}
                    </p>
                  </div>
                  {sub.current_period_end && (
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Period ends</p>
                      <p className="text-sm font-medium text-slate-700">{formatDate(sub.current_period_end)}</p>
                    </div>
                  )}
                </div>

                <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Free trial</p>
                  <div className="flex flex-wrap items-end gap-3">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Length (days)</label>
                      <input type="number" min={1} value={trialDays}
                        onChange={(e) => setTrialDays(Math.max(1, Number(e.target.value) || 1))}
                        className="w-24 rounded border border-slate-300 px-3 py-1.5 text-sm" />
                    </div>
                    <Button size="sm" disabled={busy} onClick={() => activateTrial.mutate()}>
                      {activateTrial.isPending ? "Activating…" : "Start / reset trial"}
                    </Button>
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => extendTrial.mutate()}>
                      {extendTrial.isPending ? "Extending…" : `Extend by ${trialDays}d`}
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Start sets a fresh {trialDays}-day window from today; Extend adds days to the current expiry.
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs text-slate-600 mb-1">Change plan</label>
                    <select value={planId} onChange={(e) => setPlanId(e.target.value)}
                      className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm bg-white">
                      <option value="">Select a plan…</option>
                      {planList.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.price)}/{p.interval}</option>
                      ))}
                    </select>
                  </div>
                  <Button size="sm" variant="outline" disabled={busy || !planId} onClick={() => changePlan.mutate()}>
                    {changePlan.isPending ? "Updating…" : "Apply plan"}
                  </Button>
                </div>

                {feedback && (
                  <div className={`mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${feedback.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                    {feedback.ok && <CheckCircle size={14} />}
                    {feedback.text}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Account details */}
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Plan", org.subscription_plan || "—"],
              ["Sub Status", org.subscription_status || "—"],
              ["Phone", org.phone_number || "—"],
              ["Staff", String(org.staff_count)],
              ["Orders", String(org.order_count)],
              ["Inventory", String(org.inventory_count)],
              ["Expenses", String(org.expense_count)],
              ["Last Login", org.last_login ? formatDateTime(org.last_login) : "Never"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-slate-600">{label}</span>
                <span className="font-medium text-slate-800">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Plan usage — how the org tracks against its plan limits */}
      {usage && (
        <Card className="mb-6">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Gauge size={16} /> Plan Usage</CardTitle>
            <span className="text-xs text-slate-500">
              {usage.plan_name}{usage.plan_active === false ? " · lapsed" : ""}
            </span>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {([
                ["Orders", "orders"],
                ["Team", "staff"],
                ["Inventory", "inventory"],
              ] as const).map(([label, key]) => {
                const count = (usage as any)[`${key}_count`] ?? 0
                const limit = (usage as any)[`${key}_limit`]
                const pctRaw = (usage as any)[`${key}_percentage`] ?? 0
                const unlimited = limit === -1
                const remaining = (usage as any)[`${key}_remaining`]
                const atLimit = !unlimited && (remaining ?? 0) <= 0
                const warnAt = usage.usage_warning_pct ?? 80
                const barColor = atLimit ? "bg-red-500" : pctRaw >= warnAt ? "bg-amber-500" : "bg-indigo-500"
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600">{label}</span>
                      <span className={atLimit ? "font-semibold text-red-600" : "font-medium text-slate-700"}>
                        {count} / {unlimited ? "∞" : limit}
                      </span>
                    </div>
                    {!unlimited && (
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${Math.min(pctRaw, 100)}%` }} />
                      </div>
                    )}
                    <p className="mt-1 text-[11px] text-slate-500">
                      {unlimited ? "Unlimited" : atLimit ? "Limit reached" : `${remaining} left · ${pctRaw}%`}
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}


      {/* Activity timeline */}
      <Card>
        <CardHeader><CardTitle>Activity Timeline</CardTitle></CardHeader>
        <CardContent className="max-h-[400px] overflow-y-auto space-y-3">
          {activity?.events?.slice(0, 30).map((event: ActivityEvent, i: number) => (
            <div key={i} className="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0">
              <div className="mt-0.5 rounded-full bg-slate-100 p-1.5"><Activity size={12} className="text-slate-600" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium capitalize">{event.type}{event.status ? ` · ${event.status}` : ""}</p>
                <p className="text-xs text-slate-500">{event.timestamp ? formatDateTime(event.date) : "—"}</p>
              </div>
              {event.amount !== undefined && <span className="text-sm font-medium">{formatCurrency(event.amount)}</span>}
            </div>
          ))}
          {(!activity?.events || activity.events.length === 0) && (
            <p className="text-sm text-slate-600 text-center py-4">No activity recorded</p>
          )}
        </CardContent>
      </Card>
    </AppShell>
  )
}
