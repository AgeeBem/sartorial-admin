"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Building2, Users, CreditCard, Receipt, ShoppingBag,
  UserCircle, Package, DollarSign, BarChart3, ScrollText, Megaphone,
  Shield, Activity, Download, ChevronLeft, Menu, Settings2,
} from "lucide-react"
import { useState } from "react"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Organizations", href: "/organizations", icon: Building2 },
  { label: "Users", href: "/users", icon: Users },
  { label: "Plans", href: "/plans", icon: CreditCard },
  { label: "Subscriptions", href: "/subscriptions", icon: Receipt },
  { label: "Transactions", href: "/transactions", icon: DollarSign },
  { label: "Orders", href: "/orders", icon: ShoppingBag },
  { label: "Clients", href: "/clients", icon: UserCircle },
  { label: "Inventory", href: "/inventory", icon: Package },
  { label: "Expenses", href: "/expenses", icon: DollarSign },
  { label: "", href: "", icon: undefined, isGroup: true, groupLabel: "TOOLS" },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Audit Log", href: "/audit-log", icon: ScrollText },
  { label: "Announcements", href: "/announcements", icon: Megaphone },
  { label: "System Health", href: "/system", icon: Activity },
  { label: "Security", href: "/security", icon: Shield },
  { label: "Exports", href: "/exports", icon: Download },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-14 items-center border-b border-slate-200 px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <span className="text-sm font-bold text-white">SA</span>
            </div>
            <span className="text-sm font-semibold">Sartorial Admin</span>
          </Link>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className={cn("ml-auto rounded-lg p-1.5 hover:bg-slate-100", collapsed && "mx-auto")}>
          {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {navItems.map((item, i) => {
          if (item.isGroup) {
            return !collapsed ? (
              <div key={i} className="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {item.groupLabel}
              </div>
            ) : null
          }
          const Icon = item.icon!
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-slate-200 p-3">
        <Link href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100",
            collapsed && "justify-center"
          )}
        >
          <Settings2 size={18} />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>
    </aside>
  )
}
