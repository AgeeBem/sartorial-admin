export interface AdminOverview {
  users: { total: number; super_admins: number; organizations: number; staff: number; inactive: number }
  // Platform activity counts + subscription health (no clients).
  accounts: {
    orders: number; inventory_items: number; expenses: number
    active_subscriptions: number; trialing_subscriptions: number
    expired_subscriptions: number; past_due_subscriptions: number
  }
  // Sartorial's own revenue (what merchants pay Sartorial).
  billing: { subscription_revenue: number; revenue_this_month: number; new_organizations_this_month: number }
}

export interface AdvancedAnalytics {
  revenue: { total_revenue: number; this_month: number; prev_month: number; mrr: number; arr: number; growth_rate: number }
  organizations: { total: number; active: number; inactive: number; this_month_new: number; growth_rate: number }
  subscriptions: { total: number; active: number; churned: number; churn_rate: number; conversion_rate: number; free: number; past_due: number }
  usage: { total_clients: number; total_inventory: number }
}

export interface OrgUsage {
  plan_name: string; plan_active: boolean; usage_warning_pct: number
  features: Record<string, boolean>
  // No client usage — the org's customers are the org's business.
  orders_count: number; orders_limit: number; orders_remaining: number | null; orders_percentage: number
  staff_count: number; staff_limit: number; staff_remaining: number | null; staff_percentage: number
  inventory_count: number; inventory_limit: number; inventory_remaining: number | null; inventory_percentage: number
}

export interface EventLogEntry {
  id: string; level: "info" | "warning" | "error"; event_type: string
  source: string; message: string; path: string; method: string
  status_code: number | null; organization: string | null
  organization_email?: string; created_at: string
}

export interface LoginLogEntry {
  id: string; user: string | null; user_email?: string; user_name?: string
  organization: string | null; organization_email?: string; organization_name?: string
  email: string; role: string; success: boolean
  ip_address: string | null; user_agent: string; created_at: string
}

export interface Organization {
  id: string; email: string; first_name: string; last_name: string; full_name: string; phone_number: string
  is_active: boolean; date_joined: string; last_login: string | null
  // Statistical activity counts only — no clients (the org's own customers).
  staff_count: number; inventory_count: number; order_count: number; expense_count: number
  subscription_status: string | null; subscription_plan: string | null
}

export interface AuditLogEntry {
  id: string; admin: string; admin_email?: string; admin_name?: string
  action?: string; action_type?: string; resource_type?: string; model_name?: string
  resource_id: string | null; resource_repr?: string
  changes?: Record<string, any>; ip_address: string | null; description?: string
  timestamp?: string; created_at: string
}

export interface Announcement {
  id: string; title: string; content: string; body?: string; target_audience?: string; target_type?: string
  target_plan: string | null; plan_name: string | null
  target_subscription_status: string | null; is_active: boolean; is_published?: boolean; email_sent: boolean; sent_count: number
  created_by: string; created_by_email: string; created_by_name: string; created_at: string; updated_at: string
}

export interface Plan {
  id: string; name: string; description: string; price: number; interval: string; currency: string
  max_clients: number; max_orders: number; max_staff: number; max_inventory_items: number
  has_reports: boolean; has_analytics: boolean; has_payroll: boolean; has_vendor_management: boolean
  has_api_access: boolean; has_priority_support: boolean
  is_active: boolean; is_free: boolean; sort_order: number; trial_days: number; is_recommended: boolean
  features?: string[]; active_subscriptions: number; subscriber_count?: number
  created_at: string; updated_at: string
}

export interface Subscription {
  id: string; organization: string; organization_email?: string; organization_name?: string
  plan: string; plan_name?: string; status: string
  amount?: number; price?: number; start_date?: string; end_date?: string
  current_period_start: string | null; current_period_end: string | null
  cancelled_at: string | null; cancel_at_period_end: boolean
  days_remaining: number; is_active_subscription: boolean; created_at: string; updated_at: string
}

export interface Transaction {
  id: string; organization: string; organization_email?: string; plan_name?: string
  reference?: string; subscription?: string
  paystack_reference?: string; paystack_transaction_id: number | null
  amount: number; currency: string; status: string; type?: string
  payment_method: string | null
  card_type: string | null; last4: string | null; bank: string | null
  date?: string; created_at: string
}

export interface TopOrganization {
  id: string; email: string; name: string; value: number
}

export interface GrowthTrend {
  month: string; new: number; cumulative: number
}

export interface RevenueTrends {
  period: { start: string; end: string }
  subscription_revenue: Array<{ month: string; revenue: number; transactions: number }>
}

export interface PlanDistribution {
  plan_id: string; plan_name: string; price: number; interval: string
  active_subscribers: number; total_subscribers: number; revenue: number
}

export interface SystemHealth {
  status: string
  database: { status: string; error: string | null; latency?: number; connections?: number }
  celery: { status: string; error?: string | null; workers?: number }
  storage: { status?: string; used?: string; available?: string; usage_percent?: number; error?: string | null }
  alerts: Array<{ type: string; severity: string; message: string; count: number }>
  summary: Record<string, number>
}

export interface CeleryStatus {
  status: string; workers?: string[]; worker_count?: number; registered_tasks?: string[]
  message?: string
}

export interface StorageUsage {
  organizations: Array<{ organization_id: string; email: string; name: string; clients: number; orders: number; staff: number; inventory_items: number }>
  totals: { total_clients: number; total_orders: number; total_staff: number; total_inventory: number }
}

export interface LoginHistoryEntry {
  id: string; admin_id: string; admin_email: string; admin_name: string
  ip_address: string | null; user_agent: string; timestamp: string
}

export interface ActivityEvent {
  type: string; id: string; title?: string; status?: string; amount?: number
  name?: string; email?: string; plan?: string; action?: string; description?: string
  date: string; timestamp: string
}

export interface PaginatedResponse<T> {
  count: number; next: string | null; previous: string | null; results: T[]
}
