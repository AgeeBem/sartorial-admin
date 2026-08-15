import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string | null | undefined, currency = "NGN"): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Number(amount) || 0)
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—"
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—"
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function formatNumber(num: number | string): string {
  return new Intl.NumberFormat("en-US").format(Number(num))
}

export function getStatusColor(status?: string): string {
  const map: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-800 border-emerald-200",
    inactive: "bg-gray-100 text-gray-800 border-gray-200",
    suspended: "bg-red-100 text-red-800 border-red-200",
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    "in progress": "bg-blue-100 text-blue-800 border-blue-200",
    completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    expired: "bg-red-100 text-red-800 border-red-200",
    trialing: "bg-blue-100 text-blue-800 border-blue-200",
    free: "bg-purple-100 text-purple-800 border-purple-200",
    success: "bg-emerald-100 text-emerald-800 border-emerald-200",
    failed: "bg-red-100 text-red-800 border-red-200",
    past_due: "bg-orange-100 text-orange-800 border-orange-200",
    healthy: "bg-emerald-100 text-emerald-800 border-emerald-200",
    unhealthy: "bg-red-100 text-red-800 border-red-200",
    warning: "bg-amber-100 text-amber-800 border-amber-200",
  }
  return map[status?.toLowerCase() || ""] || "bg-gray-100 text-gray-800 border-gray-200"
}

export function extractErrorMessage(error: any, fallback = "Something went wrong. Please try again."): string {
  if (!error) return fallback
  if (typeof error === "string" && error.trim()) return error

  try {
    const data = error?.response?.data || (error.data !== undefined ? error.data : error)

    if (typeof data === "string" && data.trim()) return data
    if (typeof data?.message === "string" && data.message.trim()) return data.message
    if (typeof data?.detail === "string" && data.detail.trim()) return data.detail
    if (typeof data?.error === "string" && data.error.trim()) return data.error

    if (typeof error?.message === "string" && error.message.trim() && !error?.response) {
      return error.message
    }

    if (data && typeof data === "object" && !Array.isArray(data)) {
      const parts: string[] = []
      for (const [key, value] of Object.entries(data)) {
        if (key === "success" || key === "code") continue
        if (typeof value === "string") parts.push(key === "detail" || key === "message" ? value : `${key}: ${value}`)
        else if (Array.isArray(value)) parts.push(`${key}: ${value.join(", ")}`)
        else if (typeof value === "object" && value !== null) parts.push(`${key}: ${JSON.stringify(value)}`)
      }
      if (parts.length > 0) return parts.join(". ")
    }
  } catch (err) {
    console.error("Error formatting error in admin-fe:", err)
  }

  return fallback
}

