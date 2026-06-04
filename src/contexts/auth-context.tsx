"use client"
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { authApi } from "@/lib/api"

interface AdminUser {
  id: string
  email: string
  full_name: string
  is_superuser: boolean
}

interface AuthContextType {
  user: AdminUser | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: () => {},
})

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
    const userData: AdminUser = {
      id: data.user?.id || data.id,
      email: data.user?.email || data.email || email,
      full_name: data.user?.full_name || data.full_name || email,
      is_superuser: data.user?.is_superuser ?? true,
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

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
