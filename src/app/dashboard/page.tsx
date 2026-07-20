"use client"
import { useQuery } from "@tanstack/react-query"
import { overviewApi, analyticsApi, systemApi } from "@/lib/api"
import { StatCard } from "@/components/shared/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { AppShell } from "@/components/layout/app-shell"
import { formatCurrency } from "@/lib/utils"
import {
  Building2, Users, DollarSign, UserCircle, AlertTriangle,
  CreditCard, TrendingUp, TrendingDown, Sparkles,
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts"

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#f97316", "#ef4444"]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-lg">
      <p className="text-xs text-slate-600 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          ₦{Number(entry.value).toLocaleString()}
        </p>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold">{entry.name}</p>
      <p className="text-xs text-slate-600">{entry.value} subscribers</p>
    </div>
  )
}

export default function DashboardPage() {
  const { data: overview } = useQuery({ queryKey: ["overview"], queryFn: overviewApi.get })
  const { data: advanced } = useQuery({ queryKey: ["analytics-advanced"], queryFn: analyticsApi.advanced })
  const { data: health } = useQuery({ queryKey: ["system-health"], queryFn: systemApi.health })
  const { data: trends } = useQuery({ queryKey: ["analytics-trends"], queryFn: () => analyticsApi.trends() })
  const { data: distribution } = useQuery({ queryKey: ["analytics-distribution"], queryFn: analyticsApi.planDistribution })

  const revenueData = trends?.subscription_revenue?.slice(-12).map((m) => ({
    month: m.month?.slice(0, 7) || "",
    revenue: Number(m.revenue) || 0,
  })) || []

  const planData = ((distribution as any)?.plan_distribution || []).map((p: any) => ({
    name: p.plan_name || p.plan || "Unknown",
    value: p.total_subscribers || p.active_subscribers || 0,
  })).filter((p: any) => p.value > 0)

  const subPieData = advanced ? [
    { name: "Active", value: advanced.subscriptions.active },
    { name: "Free", value: advanced.subscriptions.free },
    { name: "Past Due", value: advanced.subscriptions.past_due },
    { name: "Churned", value: advanced.subscriptions.churned },
  ].filter(d => d.value > 0) : []

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Platform accounts, subscriptions and billing</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Organizations" value={overview?.users.organizations ?? "—"} icon={Building2}
            description={`${overview?.billing.new_organizations_this_month ?? 0} new this month`} />
          <StatCard title="Total Users" value={overview?.users.total ?? "—"} icon={Users}
            description={`${overview?.users.staff ?? 0} staff`} />
          <StatCard title="Clients" value={overview?.accounts.clients ?? "—"} icon={UserCircle} />
          <StatCard title="Active Subs" value={overview?.accounts.active_subscriptions ?? "—"} icon={CreditCard}
            description={`${overview?.accounts.trialing_subscriptions ?? 0} trialing`} />
          <StatCard title="MRR" value={`₦${((advanced?.revenue.mrr || 0) / 1e3).toFixed(0)}K`} icon={TrendingUp}
            trend={{ value: advanced?.revenue.growth_rate || 0, positive: (advanced?.revenue.growth_rate || 0) >= 0 }} />
          <StatCard title="ARR" value={`₦${((advanced?.revenue.arr || 0) / 1e6).toFixed(1)}M`} icon={TrendingUp} />
          <StatCard title="Churn Rate" value={`${advanced?.subscriptions.churn_rate || 0}%`} icon={TrendingDown}
            trend={{ value: advanced?.subscriptions.churn_rate || 0, positive: false }} />
          <StatCard title="Subscription Revenue" value={formatCurrency(overview?.billing.subscription_revenue || 0)} icon={DollarSign}
            description={`${formatCurrency(overview?.billing.revenue_this_month || 0)} this month`} />
        </div>

        {health && health.alerts.length > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader><CardTitle className="flex items-center gap-2 text-amber-800"><AlertTriangle size={18} /> System Alerts</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {health.alerts.map((alert, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <StatusBadge status={alert.severity} />
                    <span className="text-amber-900">{alert.message}</span>
                    <span className="text-amber-600">({alert.count})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium text-slate-600">Monthly Subscription Revenue</CardTitle></CardHeader>
            <CardContent>
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={revenueData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false}
                      tickFormatter={(v: number) => v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : `${(v / 1e3).toFixed(0)}K`} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9" }} />
                    <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[280px] items-center justify-center text-sm text-slate-500">No revenue data yet</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-medium text-slate-600">Subscription Distribution</CardTitle></CardHeader>
            <CardContent>
              {(subPieData.length > 0 || planData.length > 0) ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={planData.length > 0 ? planData : subPieData}
                      cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                      paddingAngle={3} dataKey="value" stroke="none">
                      {(planData.length > 0 ? planData : subPieData).map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                      formatter={(value: string) => <span className="text-slate-700">{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[280px] items-center justify-center text-sm text-slate-500">No subscription data available</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-600"><Sparkles size={14} /> Subscriptions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Active", value: overview?.accounts.active_subscriptions },
                { label: "Trialing", value: overview?.accounts.trialing_subscriptions },
                { label: "Past Due", value: overview?.accounts.past_due_subscriptions },
                { label: "Expired", value: overview?.accounts.expired_subscriptions },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-semibold">{item.value ?? "—"}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium text-slate-600">Billing</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Total Revenue", value: formatCurrency(overview?.billing.subscription_revenue || 0) },
                { label: "This Month", value: formatCurrency(overview?.billing.revenue_this_month || 0) },
                { label: "MRR", value: formatCurrency(advanced?.revenue.mrr || 0) },
                { label: "Conversion", value: `${advanced?.subscriptions.conversion_rate || 0}%` },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium text-slate-600">System Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Database</span>
                <StatusBadge status={health?.database?.status || "unknown"} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Workers</span>
                <StatusBadge status={health?.celery?.status || "unknown"} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Organizations</span>
                <span className="text-sm font-semibold">{overview?.users.organizations ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Clients</span>
                <span className="text-sm font-semibold">{overview?.accounts.clients ?? "—"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
