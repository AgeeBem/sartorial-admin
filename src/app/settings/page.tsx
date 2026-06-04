"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { AppShell } from "@/components/layout/app-shell"
import { Shield, Bell, Palette, Key } from "lucide-react"

export default function SettingsPage() {
  return (
    <AppShell>
      <PageHeader title="Settings" description="Platform configuration and preferences" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:border-slate-300 transition-colors">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="rounded-lg bg-indigo-100 p-3"><Shield size={20} className="text-indigo-600" /></div>
            <div><h3 className="font-semibold text-sm">Security</h3><p className="text-xs text-slate-500">Access control, sessions, MFA</p></div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-slate-300 transition-colors">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="rounded-lg bg-emerald-100 p-3"><Bell size={20} className="text-emerald-600" /></div>
            <div><h3 className="font-semibold text-sm">Notifications</h3><p className="text-xs text-slate-500">Email alerts, webhooks</p></div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-slate-300 transition-colors">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="rounded-lg bg-amber-100 p-3"><Palette size={20} className="text-amber-600" /></div>
            <div><h3 className="font-semibold text-sm">Appearance</h3><p className="text-xs text-slate-500">Theme, branding, localization</p></div>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader><CardTitle className="flex items-center gap-2"><Key size={16} /> API Keys</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">API key management coming soon.</p>
        </CardContent>
      </Card>
    </AppShell>
  )
}
