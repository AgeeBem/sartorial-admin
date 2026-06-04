"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { impersonationApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { formatDate, formatDateTime } from "@/lib/utils"
import { useState } from "react"
import { Shield, Eye, EyeOff, Ban, Check } from "lucide-react"

export default function SecurityPage() {
  const qc = useQueryClient()
  const { data: impersonations, isLoading } = useQuery({ queryKey: ["security-impersonations"], queryFn: () => impersonationApi.list() })
  const [showImpersonateForm, setShowImpersonateForm] = useState(false)
  const [impersonateEmail, setImpersonateEmail] = useState("")

  const impersonateMutation = useMutation({
    mutationFn: (email: string) => impersonationApi.impersonate({ email }),
    onSuccess: (data) => { alert(`Impersonation token generated. Redirect to: ${data.redirect_url || data.url || "N/A"}`); setShowImpersonateForm(false); setImpersonateEmail("") },
  })
  const revokeMutation = useMutation({
    mutationFn: (id: string) => impersonationApi.revokeImpersonation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["security-impersonations"] }),
  })

  return (
    <AppShell>
      <PageHeader title="Security" description="Impersonation, access control, and platform security"
        actions={
          <Button size="sm" variant="outline" onClick={() => setShowImpersonateForm(!showImpersonateForm)}>
            <Eye size={14} className="mr-1" /> Impersonate
          </Button>
        }
      />

      {showImpersonateForm && (
        <Card className="mb-6 border-amber-200">
          <CardHeader><CardTitle className="flex items-center gap-2 text-amber-800"><Eye size={16} /> Impersonate User</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <input className="flex-1 rounded border border-slate-300 px-3 py-1.5 text-sm" value={impersonateEmail}
                onChange={e => setImpersonateEmail(e.target.value)} placeholder="user@organization.com" />
              <Button size="sm" onClick={() => impersonateMutation.mutate(impersonateEmail)}>
                Generate Token
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setShowImpersonateForm(false); setImpersonateEmail("") }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <DataTable
        columns={[
          { key: "admin", header: "Admin", render: (s: any) => s.admin_email || s.admin_user || "—" },
          { key: "target", header: "Target User", render: (s: any) => s.target_email || s.target_user || s.organization || "—" },
          { key: "is_active", header: "Active", render: (s: any) => <StatusBadge status={s.is_active ? "active" : "ended"} /> },
          { key: "started_at", header: "Started", render: (s: any) => formatDateTime(s.started_at || s.created_at) },
          { key: "ended_at", header: "Ended", render: (s: any) => s.ended_at ? formatDateTime(s.ended_at) : <span className="text-slate-500">—</span> },
          { key: "actions", header: "Actions", render: (s: any) => s.is_active ? (
            <Button variant="ghost" size="sm" onClick={() => revokeMutation.mutate(s.id)}>
              <Ban size={14} className="text-red-500" />
            </Button>
          ) : null},
        ]}
        data={impersonations?.results || impersonations || []} loading={isLoading}
      />
    </AppShell>
  )
}
