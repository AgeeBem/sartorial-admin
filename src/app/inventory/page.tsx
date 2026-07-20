"use client"
import { useQuery } from "@tanstack/react-query"
import { inventoryApi } from "@/lib/api"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageHeader } from "@/components/shared/page-header"
import { AppShell } from "@/components/layout/app-shell"
import { RequireOwner } from "@/components/shared/require-owner"
import { formatCurrency } from "@/lib/utils"
import { useState } from "react"

export default function InventoryPage() {
  return <RequireOwner><InventoryContent /></RequireOwner>
}

function InventoryContent() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const { data, isLoading } = useQuery({
    queryKey: ["inventory", page, search],
    queryFn: () => inventoryApi.list({ page: String(page), page_size: "15", search }),
  })
  const totalPages = data ? Math.ceil(data.count / 15) : 0

  return (
    <AppShell>
      <PageHeader title="Inventory" description="All inventory items across organizations" />
      <DataTable
        columns={[
          { key: "name", header: "Name" },
          { key: "organization", header: "Organization", render: (i: any) => i.organization_email || i.organization || "—" },
          { key: "sku", header: "SKU" },
          { key: "quantity", header: "Qty" },
          { key: "price", header: "Price", render: (i: any) => i.price ? formatCurrency(i.price) : "—" },
          { key: "category", header: "Category" },
          { key: "is_low_stock", header: "Stock", render: (i: any) => i.is_low_stock
            ? <StatusBadge status="low_stock" />
            : <StatusBadge status={i.quantity > 0 ? "in_stock" : "out_of_stock"} />
          },
        ]}
        data={data?.results || []} loading={isLoading}
        searchable onSearch={(q) => { setSearch(q); setPage(1) }}
        page={page} totalPages={totalPages} onPageChange={setPage} total={data?.count}
      />
    </AppShell>
  )
}
