import { Badge } from "@/components/ui/badge"

const variantMap: Record<string, "success" | "warning" | "destructive" | "info" | "secondary" | "default"> = {
  active: "success",
  completed: "success",
  success: "success",
  healthy: "success",
  yes: "success",
  trialing: "info",
  pending: "warning",
  past_due: "warning",
  warning: "warning",
  free: "info",
  inactive: "secondary",
  cancelled: "destructive",
  expired: "destructive",
  failed: "destructive",
  unhealthy: "destructive",
  no: "destructive",
  suspended: "destructive",
}

export function StatusBadge({ status }: { status: string }) {
  const v = variantMap[status?.toLowerCase() || ""] || "secondary"
  return <Badge variant={v}>{status}</Badge>
}
