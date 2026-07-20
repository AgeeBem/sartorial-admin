"use client"
import { useQuery } from "@tanstack/react-query"
import { analyticsApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/shared/stat-card"
import { PageHeader } from "@/components/shared/page-header"
import { AppShell } from "@/components/layout/app-shell"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"

function ChartTooltip({ active, payload, label }: any) {
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

export default function AnalyticsPage() {
  const { data: advanced, isLoading } = useQuery({ queryKey: ["analytics-advanced"], queryFn: analyticsApi.advanced })
  const { data: trends } = useQuery({ queryKey: ["analytics-trends"], queryFn: () => analyticsApi.trends() })
  const { data: distribution } = useQuery({ queryKey: ["analytics-distribution"], queryFn: analyticsApi.planDistribution })

  if (isLoading) return <AppShell><div className="h-8 w-48 animate-pulse rounded bg-slate-100" /></AppShell>
  if (!advanced) return <AppShell><p className="text-slate-600">No analytics data available</p></AppShell>

  return (
    <AppShell>
      <PageHeader title="Analytics" description="Platform-wide analytics and insights" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="MRR" value={`₦${((advanced.revenue.mrr || 0) / 1e3).toFixed(0)}K`} icon={TrendingUp}
          trend={{ value: advanced.revenue.growth_rate || 0, positive: (advanced.revenue.growth_rate || 0) >= 0 }} />
        <StatCard title="ARR" value={`₦${((advanced.revenue.arr || 0) / 1e6).toFixed(1)}M`} icon={DollarSign} />
        <StatCard title="Churn Rate" value={`${advanced.subscriptions.churn_rate || 0}%`} icon={TrendingDown}
          trend={{ value: advanced.subscriptions.churn_rate || 0, positive: false }} />
        <StatCard title="Total Revenue" value={formatCurrency(advanced.revenue.total_revenue)} icon={Target} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm font-medium text-slate-600">Revenue Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Total Revenue", formatCurrency(advanced.revenue.total_revenue)],
              ["This Month", formatCurrency(advanced.revenue.this_month)],
              ["Previous Month", formatCurrency(advanced.revenue.prev_month)],
              ["MRR", formatCurrency(advanced.revenue.mrr)],
              ["Growth Rate", `${advanced.revenue.growth_rate}%`],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-slate-600">{label}</span>
                <span className="font-semibold">{val}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium text-slate-600">Subscription Metrics</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Total Subscriptions", advanced.subscriptions.total],
              ["Active", advanced.subscriptions.active],
              ["Free", advanced.subscriptions.free],
              ["Churned", advanced.subscriptions.churned],
              ["Churn Rate", `${advanced.subscriptions.churn_rate}%`],
              ["Conversion Rate", `${advanced.subscriptions.conversion_rate}%`],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-slate-600">{label}</span>
                <span className="font-semibold">{typeof val === "number" ? val.toLocaleString() : val || "—"}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card><CardHeader><CardTitle className="text-sm font-medium text-slate-600">Financial Health</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {advanced.financials ? [
              ["Total Order Value", formatCurrency(advanced.financials.total_order_value)],
              ["Payments Collected", formatCurrency(advanced.financials.total_payments_collected)],
              ["Total Expenses", formatCurrency(advanced.financials.total_expenses)],
              ["Profit", formatCurrency(advanced.financials.profit)],
              ["Profit Margin", `${advanced.financials.profit_margin}%`],
              ["Outstanding Balance", formatCurrency(advanced.financials.outstanding_balance)],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-slate-600">{label}</span>
                <span className="font-semibold">{val}</span>
              </div>
            )) : (
              <p className="text-sm text-slate-500">
                Merchant financial figures are available to platform owners only.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {trends && trends.order_payments && trends.order_payments.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Monthly Order Payments</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trends.order_payments.slice(-12).map((m: any) => ({ month: m.month?.slice(0, 3) || "", amount: Number(m.amount) || 0 }))}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false}
                  tickFormatter={(v: number) => v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : `${(v / 1e3).toFixed(0)}K`} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f1f5f9" }} />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-slate-600">Organizations</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Total", advanced.organizations.total],
              ["Active", advanced.organizations.active],
              ["Inactive", advanced.organizations.inactive],
              ["New This Month", advanced.organizations.this_month_new],
              ["Growth Rate", `${advanced.organizations.growth_rate}%`],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-slate-600">{label}</span>
                <span className="font-semibold">{typeof val === "number" ? formatNumber(val) : val || "—"}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-slate-600">Operations</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Total Clients", advanced.operations.total_clients],
              ["Total Orders", advanced.operations.total_orders],
              ["Pending", advanced.operations.pending_orders],
              ["In Progress", advanced.operations.in_progress_orders],
              ["Completed", advanced.operations.completed_orders],
              ["Overdue", advanced.operations.overdue_orders],
              ["Inventory Items", advanced.operations.total_inventory],
              ["Low Stock", advanced.operations.low_stock_items],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-slate-600">{label}</span>
                <span className="font-semibold">{formatNumber(val)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {distribution && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {((distribution as any).plan_distribution || (distribution as any).plans || []).map((p: any, i: number) => {
            const plans = ((distribution as any).plan_distribution || (distribution as any).plans || [])
            const total = plans.reduce((s: number, x: any) => s + (x.total_subscribers || x.active_subscribers || x.count || 0), 0)
            const subs = p.total_subscribers || p.active_subscribers || p.count || 0
            return (
              <Card key={i}>
                <CardContent className="p-4">
                  <p className="text-xs text-slate-600">{p.plan_name || p.name || p.plan}</p>
                  <p className="text-2xl font-bold">{subs}</p>
                  <p className="text-xs text-slate-500">{total > 0 ? ((subs / total) * 100).toFixed(1) : "0.0"}% of total</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </AppShell>
  )
}
