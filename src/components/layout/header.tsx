"use client"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { LogOut, User } from "lucide-react"

export function Header() {
  const { user, logout, isOwner } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-slate-200 bg-white/95 backdrop-blur px-6">
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          isOwner ? "bg-slate-900 text-white" : "bg-amber-100 text-amber-800"
        }`}>
          {isOwner ? "Owner" : "Support"}
        </span>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <User size={16} />
          <span>{user?.full_name || user?.email}</span>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </header>
  )
}
