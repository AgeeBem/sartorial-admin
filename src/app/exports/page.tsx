"use client"
import { useMutation } from "@tanstack/react-query"
import { exportApi as exportsApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet, Building2, CreditCard, ShoppingBag, Users } from "lucide-react"

export default function ExportsPage() {
  const exportOrg = useMutation({ mutationFn: () => exportsApi.organizations() })
  const exportSubs = useMutation({ mutationFn: () => exportsApi.subscriptions() })
  const exportTransactions = useMutation({ mutationFn: () => exportsApi.transactions() })
  const exportOrders = useMutation({ mutationFn: () => exportsApi.orders() })

  function downloadCSV(data: any, filename: string) {
    const url = window.URL.createObjectURL(new Blob([data]))
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click()
    window.URL.revokeObjectURL(url)
  }

  const exports = [
    { label: "Organizations", desc: "All organizations with status, plan, revenue", icon: Building2, mutation: exportOrg, filename: "organizations.csv" },
    { label: "Subscriptions", desc: "All subscription records with dates and amounts", icon: CreditCard, mutation: exportSubs, filename: "subscriptions.csv" },
    { label: "Transactions", desc: "All financial transactions", icon: FileSpreadsheet, mutation: exportTransactions, filename: "transactions.csv" },
    { label: "Orders", desc: "All orders across organizations", icon: ShoppingBag, mutation: exportOrders, filename: "orders.csv" },
  ]

  return (
    <AppShell>
      <PageHeader title="Data Exports" description="Download platform data as CSV" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {exports.map((exp) => (
          <Card key={exp.label}>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="rounded-lg bg-indigo-100 p-3"><exp.icon size={24} className="text-indigo-600" /></div>
                <div>
                  <h3 className="text-sm font-semibold">{exp.label}</h3>
                  <p className="text-xs text-slate-600 mt-1">{exp.desc}</p>
                </div>
                <Button size="sm" className="w-full" onClick={() => exp.mutation.mutateAsync().then(r => downloadCSV(r, exp.filename))} disabled={exp.mutation.isPending}>
                  <Download size={14} className="mr-1" /> {exp.mutation.isPending ? "Exporting..." : "Download CSV"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  )
}
