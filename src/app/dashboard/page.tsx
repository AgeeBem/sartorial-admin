"use client"
import { useQuery } from "@tanstack/react-query"
import { overviewApi, analyticsApi, systemApi } from "@/lib/api"
import { StatCard } from "@/components/shared/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { AppShell } from "@/components/layout/app-shell"
import { formatCurrency } from "@/lib/utils"
import {
  Building2, Users, DollarSign, ShoppingBag, AlertTriangle,
  Activity, Clock, Package, CreditCard, TrendingUp, TrendingDown,
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
          {entry.name}: {typeof entry.value === "number" && entry.value > 1e6
            ? `₦${(entry.value / 1e6).toFixed(1)}M`
            : `₦${(entry.value / 1e3).toFixed(0)}K`}
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
  const { data: overview, isLoading: ovLoading } = useQuery({ queryKey: ["overview"], queryFn: overviewApi.get })
  const { data: advanced } = useQuery({ queryKey: ["analytics-advanced"], queryFn: analyticsApi.advanced })
  const { data: health } = useQuery({ queryKey: ["system-health"], queryFn: systemApi.health })
  const { data: trends } = useQuery({ queryKey: ["analytics-trends"], queryFn: () => analyticsApi.trends() })
  const { data: distribution } = useQuery({ queryKey: ["analytics-distribution"], queryFn: analyticsApi.planDistribution })

  const revenueData = trends?.order_payments?.slice(-12).map((m: any) => ({
    month: m.month?.slice(0, 3) || "",
    revenue: Number(m.amount) || 0,
  })) || []

  const planData = ((distribution as any)?.plan_distribution || (distribution as any)?.plans || []).map((p: any) => ({
    name: p.plan_name || p.name || p.plan || "Unknown",
    value: p.total_subscribers || p.active_subscribers || p.count || 0,
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
          <p className="mt-1 text-sm text-slate-600">Platform overview and key metrics</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Organizations" value={overview?.users.organizations ?? "—"} icon={Building2}
            description={`${overview?.users.organizations ?? 0} total`} />
          <StatCard title="Total Users" value={overview?.users.total ?? "—"} icon={Users} />
          <StatCard title="Orders" value={overview?.business.orders ?? "—"} icon={ShoppingBag}
            description={`${overview?.business.orders_this_month ?? 0} this month`} />
          {overview?.money && (
            <StatCard title="Revenue" value={`₦${((overview.money.payments_collected || 0) / 1e6).toFixed(1)}M`} icon={DollarSign} />
          )}
          <StatCard title="Active Subs" value={overview?.business.active_subscriptions ?? "—"} icon={CreditCard} />
          <StatCard title="Clients" value={overview?.business.clients ?? "—"} icon={Users} />
          <StatCard title="Inventory" value={advanced?.operations.total_inventory ?? "—"} icon={Package} />
          <StatCard title="Low Stock" value={overview?.operations.low_stock_items ?? "—"} icon={AlertTriangle}
            className={overview?.operations.low_stock_items ? "border-red-200 bg-red-50" : ""} />
        </div>

        {advanced && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="MRR" value={`₦${((advanced.revenue.mrr || 0) / 1e3).toFixed(0)}K`} icon={TrendingUp}
              trend={{ value: advanced.revenue.growth_rate || 0, positive: (advanced.revenue.growth_rate || 0) >= 0 }} />
            <StatCard title="ARR" value={`₦${((advanced.revenue.arr || 0) / 1e6).toFixed(1)}M`} icon={TrendingUp} />
            <StatCard title="Churn Rate" value={`${advanced.subscriptions.churn_rate || 0}%`} icon={TrendingDown}
              trend={{ value: advanced.subscriptions.churn_rate || 0, positive: false }} />
            {advanced.financials && (
              <StatCard title="Profit Margin" value={`${advanced.financials.profit_margin || 0}%`} icon={Activity} />
            )}
          </div>
        )}

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
            <CardHeader><CardTitle className="text-sm font-medium text-slate-600">Monthly Revenue Trend</CardTitle></CardHeader>
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
                <div className="flex h-[280px] items-center justify-center text-sm text-slate-500">No revenue data available</div>
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
                      paddingAngle={3} dataKey="value"
                      stroke="none"
                    >
                      {(planData.length > 0 ? planData : subPieData).map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                      formatter={(value: string) => <span className="text-slate-700">{value}</span>}
                    />
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
            <CardHeader><CardTitle className="text-sm font-medium text-slate-600">Operations Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Pending Orders", value: overview?.operations.pending_orders, icon: Clock },
                { label: "Overdue Orders", value: overview?.operations.overdue_orders, icon: AlertTriangle },
                { label: "Unpaid Bills", value: health?.summary.unpaid_bills, icon: DollarSign },
                { label: "Expired Subs", value: overview?.business.expired_subscriptions, icon: CreditCard },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-slate-600">
                    <item.icon size={14} className="text-slate-500" />
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold">{item.value ?? "—"}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          {(advanced?.financials || overview?.money) ? (
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium text-slate-600">Financial Breakdown</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {(advanced?.financials ? [
                  { label: "Total Order Value", value: formatCurrency(advanced.financials.total_order_value) },
                  { label: "Payments Collected", value: formatCurrency(advanced.financials.total_payments_collected) },
                  { label: "Total Expenses", value: formatCurrency(advanced.financials.total_expenses) },
                  { label: "Outstanding", value: formatCurrency(advanced.financials.outstanding_balance) },
                ] : [
                  { label: "Order Value", value: `₦${(overview?.money?.order_value ?? 0).toLocaleString()}` },
                  { label: "Payments Collected", value: `₦${(overview?.money?.payments_collected ?? 0).toLocaleString()}` },
                  { label: "Expenses", value: `₦${(overview?.money?.expenses ?? 0).toLocaleString()}` },
                  { label: "Transactions", value: `₦${(overview?.money?.transactions_successful ?? 0).toLocaleString()}` },
                ]).map((item: any) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium text-slate-600">Operations Overview</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Total Clients", value: overview?.business.clients },
                  { label: "Total Orders", value: overview?.business.orders },
                  { label: "Active Subscriptions", value: overview?.business.active_subscriptions },
                  { label: "Inventory Items", value: advanced?.operations.total_inventory },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-semibold">{item.value ?? "—"}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium text-slate-600">System Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Database</span>
                <StatusBadge status={health?.database?.status || "unknown"} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Organizations</span>
                <span className="text-sm font-semibold">{overview?.users.organizations ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Total Orders</span>
                <span className="text-sm font-semibold">{overview?.business.orders ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Inventory Items</span>
                <span className="text-sm font-semibold">{advanced?.operations.total_inventory ?? "—"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
