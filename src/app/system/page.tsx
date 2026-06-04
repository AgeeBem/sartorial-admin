"use client"
import { useQuery } from "@tanstack/react-query"
import { systemApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { AppShell } from "@/components/layout/app-shell"
import { formatDate } from "@/lib/utils"
import { Server, Database, HardDrive, Activity, AlertTriangle, RefreshCw } from "lucide-react"

export default function SystemPage() {
  const { data: health, isLoading, refetch } = useQuery({ queryKey: ["system-health"], queryFn: systemApi.health })
  const { data: alerts } = useQuery({ queryKey: ["system-alerts"], queryFn: () => systemApi.alerts() })

  if (isLoading) return <AppShell><div className="h-8 w-48 animate-pulse rounded bg-slate-100" /></AppShell>
  if (!health) return <AppShell><p className="text-slate-500">No system data available</p></AppShell>

  return (
    <AppShell>
      <PageHeader title="System Health" description="Platform infrastructure and service status"
        actions={
          <button onClick={() => refetch()} className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm font-medium"><Database size={16} /> Database</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600">Status</span><StatusBadge status={health.database?.status || "unknown"} /></div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600">Latency</span><span className="text-sm font-medium">{health.database?.latency || "—"}ms</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600">Connections</span><span className="text-sm font-medium">{health.database?.connections ?? "—"}</span></div>
            {health.database?.error && <p className="text-xs text-red-500">{health.database.error}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm font-medium"><Server size={16} /> Celery</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600">Status</span><StatusBadge status={health.celery?.status || "unknown"} /></div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600">Workers</span><span className="text-sm font-medium">{health.celery?.workers ?? "—"}</span></div>
            {health.celery?.error && <p className="text-xs text-red-500">{health.celery.error}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm font-medium"><HardDrive size={16} /> Storage</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600">Used</span><span className="text-sm font-medium">{health.storage?.used ?? "—"}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600">Available</span><span className="text-sm font-medium">{health.storage?.available ?? "—"}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-600">Usage</span>
              {health.storage?.usage_percent != null && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${Math.min(health.storage.usage_percent, 100)}%` }} />
                  </div>
                  <span className="text-sm font-medium">{health.storage.usage_percent}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {health.alerts && health.alerts.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm font-medium text-amber-800"><AlertTriangle size={16} /> Active Alerts</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {health.alerts.map((a: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={a.severity || "warning"} />
                    <span className="text-sm">{a.message}</span>
                  </div>
                  {a.count != null && <span className="text-xs text-amber-600 font-medium">Count: {a.count}</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {alerts?.results && alerts.results.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm font-medium"><Activity size={16} /> Alert History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.results.map((a: any, i: number) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-2 text-sm">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={a.severity || a.level || "info"} />
                    <span>{a.message || a.title}</span>
                  </div>
                  <span className="text-xs text-slate-400">{formatDate(a.created_at || a.timestamp)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </AppShell>
  )
}
