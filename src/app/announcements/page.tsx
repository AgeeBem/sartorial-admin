"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { announcementsApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { useState } from "react"
import { Plus, Send, Edit, Trash2 } from "lucide-react"
import type { Announcement } from "@/lib/types"

export default function AnnouncementsPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [form, setForm] = useState({ title: "", content: "", target_audience: "all", is_published: false })

  const { data, isLoading } = useQuery({ queryKey: ["announcements"], queryFn: announcementsApi.list })

  const createMutation = useMutation({
    mutationFn: () => announcementsApi.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["announcements"] }); resetForm() },
  })
  const updateMutation = useMutation({
    mutationFn: () => announcementsApi.update(editing!.id, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["announcements"] }); resetForm() },
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => announcementsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  })
  const publishMutation = useMutation({
    mutationFn: (id: string) => announcementsApi.update(id, { is_published: true } as any),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  })

  function resetForm() { setShowForm(false); setEditing(null); setForm({ title: "", content: "", target_audience: "all", is_published: false }) }
  function editItem(a: Announcement) { setEditing(a); setShowForm(true); setForm({ title: a.title, content: a.content, target_audience: a.target_audience || "all", is_published: !!a.is_published }) }

  const announcements = data?.results || data || []

  return (
    <AppShell>
      <PageHeader title="Announcements" description="Create and manage platform announcements"
        actions={<Button size="sm" onClick={() => { setEditing(null); setShowForm(!showForm); setForm({ title: "", content: "", target_audience: "all", is_published: false }) }}>
          <Plus size={14} className="mr-1" /> New
        </Button>}
      />

      {showForm && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">{editing ? "Edit" : "New"} Announcement</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
                <input className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Content</label>
                <textarea className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm h-24" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} /></div>
              <div className="flex gap-4">
                <div><label className="block text-xs font-medium text-slate-600 mb-1">Audience</label>
                  <select className="rounded border border-slate-300 px-3 py-1.5 text-sm" value={form.target_audience} onChange={e => setForm(f => ({ ...f, target_audience: e.target.value }))}>
                    <option value="all">All</option><option value="admins">Admins</option><option value="organizations">Organizations</option>
                  </select></div>
                <div className="flex items-end pb-1"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} /> Published</label></div>
              </div>
              <Button size="sm" onClick={() => editing ? updateMutation.mutate() : createMutation.mutate()}>
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 animate-pulse rounded-lg bg-slate-100" />)}</div>
      ) : (
        <div className="space-y-3">
          {(Array.isArray(announcements) ? announcements : []).map((a: Announcement) => (
            <Card key={a.id} className={a.is_published ? "" : "border-dashed border-slate-300"}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{a.title}</h3>
                      {a.is_published ? <StatusBadge status="published" /> : <StatusBadge status="draft" />}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{a.content}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                      <span>Audience: {a.target_audience || "all"}</span>
                      <span>{formatDate(a.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-4">
                    {!a.is_published && <Button variant="ghost" size="sm" onClick={() => publishMutation.mutate(a.id)}><Send size={14} className="text-emerald-600" /></Button>}
                    <Button variant="ghost" size="sm" onClick={() => editItem(a)}><Edit size={14} /></Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(a.id)}><Trash2 size={14} className="text-red-500" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  )
}
