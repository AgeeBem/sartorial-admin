import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { type LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react"

type Accent = "indigo" | "emerald" | "amber" | "rose" | "sky" | "violet" | "slate"

const ACCENTS: Record<Accent, { chip: string; ring: string; glow: string }> = {
  indigo: { chip: "bg-indigo-50 text-indigo-600", ring: "hover:border-indigo-200", glow: "from-indigo-500/5" },
  emerald: { chip: "bg-emerald-50 text-emerald-600", ring: "hover:border-emerald-200", glow: "from-emerald-500/5" },
  amber: { chip: "bg-amber-50 text-amber-600", ring: "hover:border-amber-200", glow: "from-amber-500/5" },
  rose: { chip: "bg-rose-50 text-rose-600", ring: "hover:border-rose-200", glow: "from-rose-500/5" },
  sky: { chip: "bg-sky-50 text-sky-600", ring: "hover:border-sky-200", glow: "from-sky-500/5" },
  violet: { chip: "bg-violet-50 text-violet-600", ring: "hover:border-violet-200", glow: "from-violet-500/5" },
  slate: { chip: "bg-slate-100 text-slate-600", ring: "hover:border-slate-300", glow: "from-slate-500/5" },
}

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: { value: number; positive: boolean }
  accent?: Accent
  className?: string
}

export function StatCard({ title, value, icon: Icon, description, trend, accent = "slate", className }: StatCardProps) {
  const a = ACCENTS[accent]
  return (
    <Card
      className={cn(
        "group relative overflow-hidden p-5 transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md",
        a.ring,
        className,
      )}
    >
      {/* subtle corner glow on hover */}
      <div className={cn("pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br to-transparent opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100", a.glow)} />
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-medium text-slate-500">{title}</p>
        <div className={cn("rounded-xl p-2.5 ring-1 ring-inset ring-black/5", a.chip)}>
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <p className="text-[28px] font-bold leading-none tracking-tight text-slate-900">{value}</p>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold",
              trend.positive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600",
            )}
          >
            {trend.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      {description && <p className="mt-1.5 text-xs text-slate-400">{description}</p>}
    </Card>
  )
}
