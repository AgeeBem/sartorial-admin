"use client"
import { useQuery } from "@tanstack/react-query"
import { overviewApi, analyticsApi, systemApi } from "@/lib/api"
import { StatCard } from "@/components/shared/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { AppShell } from "@/components/layout/app-shell"
import {
  Building2, Users, DollarSign, ShoppingBag, AlertTriangle,
  Activity, Clock, Package, CreditCard, TrendingUp, TrendingDown,
} from "lucide-react"

export default function DashboardPage() {
  const { data: overview, isLoading: ovLoading } = useQuery({ queryKey: ["overview"], queryFn: overviewApi.get })
  const { data: advanced } = useQuery({ queryKey: ["analytics-advanced"], queryFn: analyticsApi.advanced })
  const { data: health } = useQuery({ queryKey: ["system-health"], queryFn: systemApi.health })

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
          <StatCard title="Revenue" value={overview ? `₦${((overview.money.payments_collected || 0) / 1e6).toFixed(1)}M` : "—"} icon={DollarSign} />
          <StatCard title="Active Subs" value={overview?.business.active_subscriptions ?? "—"} icon={CreditCard} />
          <StatCard title="Clients" value={overview?.business.clients ?? "—"} icon={Users} />
          <StatCard title="Inventory" value={overview?.business.inventory_items ?? "—"} icon={Package} />
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
            <StatCard title="Profit Margin" value={`${advanced.financials.profit_margin || 0}%`} icon={Activity} />
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

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium text-slate-600">Operations Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Pending Orders", value: overview?.operations.pending_orders, icon: Clock },
                { label: "Overdue Orders", value: overview?.operations.overdue_orders, icon: AlertTriangle },
                { label: "Unpaid Bills", value: overview?.operations.unpaid_bills, icon: DollarSign },
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
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium text-slate-600">Financial Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Order Value", value: overview?.money.order_value },
                { label: "Payments Collected", value: overview?.money.payments_collected },
                { label: "Expenses", value: overview?.money.expenses },
                { label: "Sub Revenue", value: overview?.money.subscription_revenue },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <span className="text-sm font-semibold">₦{(item.value ?? 0).toLocaleString()}</span>
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
                <span className="text-sm text-slate-600">Organizations</span>
                <span className="text-sm font-semibold">{overview?.users.organizations ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Total Orders</span>
                <span className="text-sm font-semibold">{overview?.business.orders ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Vendors</span>
                <span className="text-sm font-semibold">{overview?.business.vendors ?? "—"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
