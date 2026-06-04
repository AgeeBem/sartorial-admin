"use client"
import { useQuery } from "@tanstack/react-query"
import { analyticsApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/shared/stat-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { AppShell } from "@/components/layout/app-shell"
import { formatCurrency } from "@/lib/utils"
import {
  TrendingUp, TrendingDown, Users, DollarSign, Activity,
  CreditCard, Target
} from "lucide-react"

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
            {[
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
            ))}
          </CardContent>
        </Card>
      </div>

      {trends && trends.order_payments && trends.order_payments.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Order Payments (Monthly)</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-40">
              {trends.order_payments.slice(-12).map((m: any, i: number) => {
                const totals = trends.order_payments.map((r: any) => Number(r.amount) || 0);
                const max = totals.length > 0 ? Math.max(...totals) : 0;
                const height = max > 0 ? ((Number(m.amount) || 0) / max) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-500">₦{((Number(m.amount) || 0) / 1e3).toFixed(0)}K</span>
                    <div className="w-full rounded-t bg-indigo-500/80" style={{ height: `${Math.max(height, 4)}%` }} />
                    <span className="text-[10px] text-slate-600">{m.month?.slice(0, 3) || ""}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {distribution && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {((distribution as any).plan_distribution || (distribution as any).plans || []).map((p: any, i: number) => (
            <Card key={i}>
              <CardContent className="p-4">
                <p className="text-xs text-slate-600">{p.plan_name || p.name || p.plan}</p>
                <p className="text-2xl font-bold">{p.total_subscribers || p.active_subscribers || p.count || 0}</p>
                <p className="text-xs text-slate-500">{p.percentage?.toFixed(1) || "—"}% of total</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  )
}
