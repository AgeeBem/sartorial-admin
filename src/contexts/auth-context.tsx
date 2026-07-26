"use client"
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { authApi } from "@/lib/api"

interface AdminUser {
  id: string
  email: string
  full_name: string
  is_superuser: boolean
  platform_role?: "none" | "support" | "owner"
  is_platform_owner?: boolean
  is_platform_support?: boolean
}

interface AuthContextType {
  user: AdminUser | null
  token: string | null
  loading: boolean
  /** Full-access platform staff (owner / legacy superuser). */
  isOwner: boolean
  /** Support-tier staff: technical/operational access only. */
  isSupport: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  isOwner: false,
  isSupport: false,
  login: async () => {},
  logout: () => {},
})

// Mirror of the backend's role resolution (owner OR legacy superuser without an
// explicit platform role). Kept resilient to older stored user shapes.
function resolveOwner(u: AdminUser | null): boolean {
  if (!u) return false
  if (u.is_platform_owner) return true
  if (u.platform_role === "owner") return true
  return Boolean(u.is_superuser && (!u.platform_role || u.platform_role === "none"))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("admin_user")
    const tok = localStorage.getItem("admin_access_token")
    if (stored && tok) {
      setUser(JSON.parse(stored))
      setToken(tok)
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login(email, password)
    const access = data.access || data.access_token
    const u = data.user || data
    const userData: AdminUser = {
      id: u?.id || data.id,
      email: u?.email || email,
      full_name: u?.full_name || email,
      is_superuser: u?.is_superuser ?? false,
      platform_role: u?.platform_role,
      is_platform_owner: u?.is_platform_owner,
      is_platform_support: u?.is_platform_support,
    }
    localStorage.setItem("admin_access_token", access)
    localStorage.setItem("admin_user", JSON.stringify(userData))
    setToken(access)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("admin_access_token")
    localStorage.removeItem("admin_user")
    setToken(null)
    setUser(null)
  }, [])

  const isOwner = resolveOwner(user)
  const isSupport = Boolean(user) && !isOwner

  return (
    <AuthContext.Provider value={{ user, token, loading, isOwner, isSupport, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
