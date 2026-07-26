"use client"
import { useAuth } from "@/contexts/auth-context"
import { AppShell } from "@/components/layout/app-shell"
import { Lock } from "lucide-react"

/**
 * Gate for pages that expose merchant business data. Support-tier staff are
 * shown a restricted notice instead. The backend also returns 403 for these
 * endpoints, so this is a UX layer, not the security boundary.
 */
export function RequireOwner({ children }: { children: React.ReactNode }) {
  const { isOwner, loading } = useAuth()

  if (loading) {
    return (
      <AppShell>
        <div className="h-8 w-48 animate-pulse rounded bg-slate-100" />
      </AppShell>
    )
  }

  if (!isOwner) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <div className="rounded-full bg-slate-100 p-4">
            <Lock size={28} className="text-slate-500" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Restricted</h2>
          <p className="mt-1 max-w-sm text-sm text-slate-600">
            This section contains merchant business data and is only available to platform owners.
            Support access is limited to accounts, billing, and technical logs.
          </p>
        </div>
      </AppShell>
    )
  }

  return <>{children}</>
}
