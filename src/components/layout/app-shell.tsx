"use client"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" /></div>
  if (!user) return null

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/60">
      <Sidebar />
      <div className="ml-64 flex flex-1 flex-col">
        <Header />
        <main className="mx-auto w-full max-w-[1400px] flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
