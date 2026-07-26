import { cn } from "@/lib/utils"

type Tone = "success" | "warning" | "destructive" | "info" | "secondary"

const toneMap: Record<string, Tone> = {
  active: "success", completed: "success", success: "success", healthy: "success", yes: "success", paid: "success",
  trialing: "info", free: "info", no_workers: "warning",
  pending: "warning", past_due: "warning", warning: "warning",
  inactive: "secondary", unknown: "secondary",
  cancelled: "destructive", expired: "destructive", failed: "destructive", unhealthy: "destructive",
  no: "destructive", suspended: "destructive", down: "destructive", critical: "destructive",
}

const styles: Record<Tone, { pill: string; dot: string }> = {
  success: { pill: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", dot: "bg-emerald-500" },
  warning: { pill: "bg-amber-50 text-amber-700 ring-amber-600/20", dot: "bg-amber-500" },
  destructive: { pill: "bg-rose-50 text-rose-700 ring-rose-600/20", dot: "bg-rose-500" },
  info: { pill: "bg-sky-50 text-sky-700 ring-sky-600/20", dot: "bg-sky-500" },
  secondary: { pill: "bg-slate-100 text-slate-600 ring-slate-500/20", dot: "bg-slate-400" },
}

export function StatusBadge({ status }: { status: string }) {
  const tone = toneMap[status?.toLowerCase() || ""] || "secondary"
  const s = styles[tone]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset",
        s.pill,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {(status || "unknown").replace(/_/g, " ")}
    </span>
  )
}
