import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { type LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: { value: number; positive: boolean }
  className?: string
}

export function StatCard({ title, value, icon: Icon, description, trend, className }: StatCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
            <Icon size={18} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {trend && (
            <span className={cn("text-sm font-medium", trend.positive ? "text-emerald-600" : "text-red-600")}>
              {trend.positive ? "+" : ""}{trend.value}%
            </span>
          )}
        </div>
        {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
      </CardContent>
    </Card>
  )
}
