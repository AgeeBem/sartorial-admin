import axios from "axios"
import type {
  ActivityEvent, AdminOverview, AdvancedAnalytics, Announcement, AuditLogEntry,
  CeleryStatus, EventLogEntry, GrowthTrend, LoginHistoryEntry, LoginLogEntry, OrgUsage, Organization, PaginatedResponse,
  Plan, PlanDistribution, RevenueTrends, StorageUsage, Subscription, SystemHealth,
  TopOrganization, Transaction,
} from "./types"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1/admin",
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_access_token")
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("admin_access_token")
      localStorage.removeItem("admin_user")
      window.location.href = "/login"
    }
    return Promise.reject(err)
  }
)

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/login/", { email, password }).then((r) => r.data),
}

// Overview
export const overviewApi = {
  get: () => api.get<AdminOverview>("/overview/").then((r) => r.data),
}

// Analytics
export const analyticsApi = {
  get: (params?: Record<string, string>) =>
    api.get("/analytics/", { params }).then((r) => r.data),
  advanced: () =>
    api.get<AdvancedAnalytics>("/analytics/advanced/").then((r) => r.data),
  topOrganizations: (metric = "revenue", limit = 20) =>
    api.get<{ metric: string; limit: number; results: TopOrganization[] }>(
      "/analytics/top-organizations/", { params: { metric, limit } }
    ).then((r) => r.data),
  growthTrend: (params?: Record<string, string>) =>
    api.get<any>("/analytics/organization-growth/", { params }).then((r) => r.data),
  revenueTrends: (params?: Record<string, string>) =>
    api.get<RevenueTrends>("/analytics/revenue-trends/", { params }).then((r) => r.data),
  trends: (params?: Record<string, string>) =>
    api.get<RevenueTrends>("/analytics/revenue-trends/", { params }).then((r) => r.data),
  planDistribution: () =>
    api.get<{ plan_distribution: PlanDistribution[] }>("/analytics/plan-distribution/").then((r) => r.data),
}

// Organizations
export const orgApi = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<Organization>>("/organizations/", { params }).then((r) => r.data),
  get: (id: string) =>
    api.get<Organization>(`/organizations/${id}/`).then((r) => r.data),
  action: (id: string, action: string) =>
    api.post(`/organizations/${id}/${action}/`).then((r) => r.data),
  activity: (id: string) =>
    api.get<{ organization: any; events: ActivityEvent[] }>(`/organizations/${id}/activity/`).then((r) => r.data),
  usage: (id: string) =>
    api.get<OrgUsage>(`/organizations/${id}/usage/`).then((r) => r.data),
}

// Bulk Operations
export const bulkApi = {
  activate: (ids: string[]) => api.post("/bulk/activate-organizations/", { ids }).then((r) => r.data),
  suspend: (ids: string[]) => api.post("/bulk/suspend-organizations/", { ids }).then((r) => r.data),
  changePlan: (organization_ids: string[], plan_id: string) =>
    api.post("/bulk/change-plan/", { organization_ids, plan_id }).then((r) => r.data),
  delete: (ids: string[]) => api.post("/bulk/delete-organizations/", { ids }).then((r) => r.data),
}

// Users
export const usersApi = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<any>>("/users/", { params }).then((r) => r.data),
  get: (id: string) => api.get<any>(`/users/${id}/`).then((r) => r.data),
  update: (id: string, data: any) => api.patch(`/users/${id}/`, data).then((r) => r.data),
}

// Plans
export const plansApi = {
  list: () => api.get<PaginatedResponse<Plan>>("/plans/").then((r) => r.data),
  get: (id: string) => api.get<Plan>(`/plans/${id}/`).then((r) => r.data),
  create: (data: Partial<Plan>) => api.post<Plan>("/plans/", data).then((r) => r.data),
  update: (id: string, data: Partial<Plan>) => api.patch<Plan>(`/plans/${id}/`, data).then((r) => r.data),
}

// Subscriptions
export const subsApi = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<Subscription>>("/subscriptions/", { params }).then((r) => r.data),
  get: (id: string) =>
    api.get<Subscription>(`/subscriptions/${id}/`).then((r) => r.data),
  override: (id: string | any, data?: any) => {
    if (data === undefined) { data = id; id = data.subscription_id }
    return api.post(`/subscriptions/${id}/override/`, data).then((r) => r.data)
  },
  history: (id: string | any) => {
    if (typeof id === "object") return api.get("/subscriptions/activity/", { params: id }).then((r) => r.data)
    return api.get(`/subscriptions/${id}/history/`).then((r) => r.data)
  },
  extendTrial: (id: string, days: number) =>
    api.post(`/subscriptions/${id}/extend-trial/`, { days }).then((r) => r.data),
  activateTrial: (id: string, days: number) =>
    api.post(`/subscriptions/${id}/activate-trial/`, { days }).then((r) => r.data),
  forOrganization: (organizationId: string) =>
    api.get<PaginatedResponse<Subscription>>("/subscriptions/", { params: { organization_id: organizationId } })
      .then((r) => r.data.results?.[0] ?? null),
}

// Transactions
export const txnsApi = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<Transaction>>("/transactions/", { params }).then((r) => r.data),
}

// Orders
export const ordersApi = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<any>>("/orders/", { params }).then((r) => r.data),
}

// Clients
export const clientsApi = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<any>>("/clients/", { params }).then((r) => r.data),
}

// Inventory
export const inventoryApi = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<any>>("/inventory/", { params }).then((r) => r.data),
}

// Expenses
export const expensesApi = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<any>>("/expenses/", { params }).then((r) => r.data),
}

// Audit Log
export const auditApi = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<AuditLogEntry>>("/audit-log/", { params }).then((r) => r.data),
  get: (id: string) =>
    api.get<AuditLogEntry>(`/audit-log/${id}/`).then((r) => r.data),
}

// Event / Error Log (technical support surface)
export const eventLogApi = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<EventLogEntry>>("/event-log/", { params }).then((r) => r.data),
}

// Organization Login Logs
export const loginLogsApi = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<LoginLogEntry>>("/login-logs/", { params }).then((r) => r.data),
}

// Announcements
export const announcementsApi = {
  list: () =>
    api.get<PaginatedResponse<Announcement>>("/announcements/").then((r) => r.data),
  get: (id: string) =>
    api.get<Announcement>(`/announcements/${id}/`).then((r) => r.data),
  create: (data: Partial<Announcement>) =>
    api.post<Announcement>("/announcements/", data).then((r) => r.data),
  update: (id: string, data: Partial<Announcement>) =>
    api.patch<Announcement>(`/announcements/${id}/`, data).then((r) => r.data),
  delete: (id: string) =>
    api.delete(`/announcements/${id}/`).then((r) => r.data),
}

// System Health
export const systemApi = {
  health: () => api.get<SystemHealth>("/system/health/").then((r) => r.data),
  celery: () => api.get<CeleryStatus>("/system/celery-status/").then((r) => r.data),
  storage: () => api.get<StorageUsage>("/system/storage-usage/").then((r) => r.data),
  alerts: (params?: Record<string, string>) =>
    api.get("/system/alerts/", { params }).then((r) => r.data),
}

// Security
export const securityApi = {
  loginHistory: (limit = 100) =>
    api.get<{ login_history: LoginHistoryEntry[] }>("/security/login-history/", { params: { limit } }).then((r) => r.data),
  revokeSessions: (admin_id?: string) =>
    api.post("/security/revoke-sessions/", { admin_id }).then((r) => r.data),
}

// Impersonation
export const impersonationApi = {
  list: (params?: Record<string, string>) =>
    api.get("/impersonation/sessions/", { params }).then((r) => r.data),
  // Read-only by default, matching the backend's safer default.
  generate: (user_id: string, read_only = true) =>
    api.post("/impersonation/token/", { user_id, read_only }).then((r) => r.data),
  impersonate: (data: { email: string; read_only?: boolean }) =>
    api.post("/impersonation/token/", { read_only: true, ...data }).then((r) => r.data),
  revoke: (session_id: string) =>
    api.post("/impersonation/revoke/", { session_id }).then((r) => r.data),
  revokeImpersonation: (id: string) =>
    api.post(`/impersonation/${id}/revoke/`).then((r) => r.data),
}

// Exports (return CSV blob)
export const exportApi = {
  organizations: () =>
    api.get("/exports/organizations/", { responseType: "blob" }).then((r) => r.data),
  subscriptions: () =>
    api.get("/exports/subscriptions/", { responseType: "blob" }).then((r) => r.data),
  transactions: () =>
    api.get("/exports/transactions/", { responseType: "blob" }).then((r) => r.data),
  orders: () =>
    api.get("/exports/orders/", { responseType: "blob" }).then((r) => r.data),
}

export default api
