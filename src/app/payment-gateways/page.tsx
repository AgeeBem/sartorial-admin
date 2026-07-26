"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { gatewaysApi } from "@/lib/api"
import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Copy, Check, RefreshCw, CheckCircle, XCircle, Power } from "lucide-react"
import type { PaymentGatewayConfig } from "@/lib/types"

function CopyField({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <div className="flex items-stretch gap-2">
        <input
          readOnly
          value={value}
          placeholder="—"
          className={`flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm ${mono ? "font-mono" : ""}`}
        />
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-lg border border-slate-300 px-3 text-slate-600 hover:bg-slate-100"
          title="Copy"
        >
          {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
        </button>
      </div>
    </div>
  )
}

function Toggle({ checked, onChange, labelOn, labelOff }: { checked: boolean; onChange: (v: boolean) => void; labelOn: string; labelOff: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        checked ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${checked ? "bg-amber-500" : "bg-slate-400"}`} />
      {checked ? labelOn : labelOff}
    </button>
  )
}

function GatewayCard({ config }: { config: PaymentGatewayConfig }) {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ["gateways"] })
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)

  // Draft: secret inputs start blank (masked, write-only); public keys prefilled.
  const [testSecret, setTestSecret] = useState("")
  const [liveSecret, setLiveSecret] = useState("")
  const [testPublic, setTestPublic] = useState(config.test_public_key || "")
  const [livePublic, setLivePublic] = useState(config.live_public_key || "")
  const [testMode, setTestMode] = useState(config.test_mode)
  const [enabled, setEnabled] = useState(config.is_enabled)

  const save = useMutation({
    mutationFn: () => {
      const payload: Record<string, string | boolean> = {
        test_mode: testMode,
        is_enabled: enabled,
        test_public_key: testPublic,
        live_public_key: livePublic,
      }
      if (testSecret) payload.test_secret_key = testSecret
      if (liveSecret) payload.live_secret_key = liveSecret
      return gatewaysApi.update(config.gateway, payload)
    },
    onSuccess: () => { setTestSecret(""); setLiveSecret(""); setFeedback({ ok: true, text: "Saved." }); invalidate() },
    onError: (e: any) => setFeedback({ ok: false, text: e?.response?.data?.detail || "Save failed." }),
  })
  const activate = useMutation({
    mutationFn: () => gatewaysApi.activate(config.gateway),
    onSuccess: () => { setFeedback({ ok: true, text: `${config.gateway_display} is now the active gateway.` }); invalidate() },
    onError: (e: any) => setFeedback({ ok: false, text: e?.response?.data?.detail || "Could not activate." }),
  })
  const genSecret = useMutation({
    mutationFn: () => gatewaysApi.generateWebhookSecret(config.gateway),
    onSuccess: () => { setFeedback({ ok: true, text: "New webhook secret generated — paste it into the Flutterwave dashboard." }); invalidate() },
  })
  const testConn = useMutation({
    mutationFn: () => gatewaysApi.testConnection(config.gateway),
    onSuccess: (r) => setFeedback({ ok: r.success, text: r.message }),
    onError: (e: any) => setFeedback({ ok: false, text: e?.response?.data?.message || "Connection test failed." }),
  })

  const secretPlaceholder = (isSet: boolean, masked: string) => (isSet ? `${masked} (leave blank to keep)` : "Not set")

  return (
    <Card className={config.is_active ? "ring-2 ring-amber-400" : ""}>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CreditCard size={16} className="text-slate-500" />
          {config.gateway_display}
          {config.is_active && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">ACTIVE</span>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Toggle checked={testMode} onChange={setTestMode} labelOn="Test mode" labelOff="Live mode" />
          <Toggle checked={enabled} onChange={setEnabled} labelOn="Enabled" labelOff="Disabled" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Credentials */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Test secret key</label>
            <input
              type="password"
              value={testSecret}
              onChange={(e) => setTestSecret(e.target.value)}
              placeholder={secretPlaceholder(config.test_secret_key_set, config.test_secret_key_masked)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Test public key</label>
            <input
              value={testPublic}
              onChange={(e) => setTestPublic(e.target.value)}
              placeholder="pk_test_…"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Live secret key</label>
            <input
              type="password"
              value={liveSecret}
              onChange={(e) => setLiveSecret(e.target.value)}
              placeholder={secretPlaceholder(config.live_secret_key_set, config.live_secret_key_masked)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Live public key</label>
            <input
              value={livePublic}
              onChange={(e) => setLivePublic(e.target.value)}
              placeholder="pk_live_…"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
            />
          </div>
        </div>

        {/* Webhook */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Webhook</p>
          <CopyField label={`Webhook URL — paste into the ${config.gateway_display} dashboard`} value={config.webhook_url} />
          {config.uses_webhook_secret ? (
            <div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <CopyField label="Secret hash — set the same value in Flutterwave → Settings → Webhooks" value={config.webhook_secret} />
                </div>
                <Button variant="outline" size="sm" disabled={genSecret.isPending} onClick={() => genSecret.mutate()}>
                  <RefreshCw size={14} className="mr-1" /> Generate
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Paystack signs webhooks with your secret key — no separate secret to set. Just add the URL above in
              Paystack → Settings → API Keys &amp; Webhooks.
            </p>
          )}
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${feedback.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
            {feedback.ok ? <CheckCircle size={14} /> : <XCircle size={14} />}
            {feedback.text}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending ? "Saving…" : "Save"}
          </Button>
          <Button variant="outline" size="sm" disabled={testConn.isPending} onClick={() => testConn.mutate()}>
            {testConn.isPending ? "Testing…" : "Test connection"}
          </Button>
          {!config.is_active && (
            <Button variant="outline" size="sm" disabled={activate.isPending} onClick={() => activate.mutate()}>
              <Power size={14} className="mr-1" /> Set active
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function PaymentGatewaysPage() {
  const { data, isLoading } = useQuery({ queryKey: ["gateways"], queryFn: () => gatewaysApi.list() })

  return (
    <AppShell>
      <PageHeader
        title="Payment Gateways"
        description="Configure Paystack and Flutterwave, choose the active gateway, and set up webhooks. Credentials are encrypted and never shown in full."
      />
      {data?.active_gateway == null && !isLoading && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No active gateway yet — merchants can't pay for plans until you add credentials and click <b>Set active</b>.
        </div>
      )}
      {isLoading ? (
        <div className="h-40 animate-pulse rounded-lg bg-slate-100" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {(data?.gateways || []).map((g) => (
            <GatewayCard key={g.gateway} config={g} />
          ))}
        </div>
      )}
    </AppShell>
  )
}
