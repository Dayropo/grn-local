import { useExportDeliveryMutation, useSearchDeliveriesQuery } from "@/lib/api/transfers"
import axiosInstance from "@/lib/axios"
import { queryClient } from "@/lib/query-client"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import React, { useState, useCallback } from "react"
import { useDebounce } from "use-debounce"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowUpDown, ChevronRight, ChevronDown, Eye, X, Download } from "lucide-react"
import TableSkeleton from "@/components/table-skeleton"
import { formatDate } from "date-fns"
import { GrnHistoryFilterForm } from "@/components/grn-history-filter-form"
import { DeliveryDetailRow } from "@/components/delivery-detail-row"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export const Route = createFileRoute("/grn-transfer/_protected/grn-history/")({
  component: GrnHistory,
  loader: async () => {
    await queryClient.prefetchQuery({
      queryKey: ["transfers", "deliveries", "search"],
      queryFn: async () => {
        const { data } = await axiosInstance.get("/transfers/v1/search/")

        return data.data as IPaginatedResponse<IDelivery>
      },
    })
  },
})

function GrnHistory() {
  const [sourceLocationId, setSourceLocationId] = useState<number | undefined>()
  const [debouncedSourceLocationId] = useDebounce(sourceLocationId, 1000)
  const [sourceLocationName, setSourceLocationName] = useState<string>("")
  const [debouncedSourceLocationName] = useDebounce(sourceLocationName, 1000)
  const [destinationStore, setDestinationStore] = useState<string>("")
  const [debouncedDestinationStore] = useDebounce(destinationStore, 1000)
  const [deliveryDate, setDeliveryDate] = useState<string>("")
  const [debouncedDeliveryDate] = useDebounce(deliveryDate, 1000)
  const [deliveryStatusCode, setDeliveryStatusCode] = useState<string>("")
  const [debouncedDeliveryStatusCode] = useDebounce(deliveryStatusCode, 1000)
  const [deliveryTypeCode, setDeliveryTypeCode] = useState<string>("")
  const [debouncedDeliveryTypeCode] = useDebounce(deliveryTypeCode, 1000)
  const [salesOrderReference, setSalesOrderReference] = useState<string>("")
  const [debouncedSalesOrderReference] = useDebounce(salesOrderReference, 1000)
  const [deliveryId, setDeliveryId] = useState<number | undefined>()
  const [debouncedDeliveryId] = useDebounce(deliveryId, 1000)
  const [sorting, setSorting] = useState<SortingState>([])
  const [expandedRows, setExpandedRows] = useState<Set<number | string>>(new Set())
  const [clearTrigger, setClearTrigger] = useState(0)
  const navigate = useNavigate()

  const toggleRowExpansion = useCallback((rowId: number | string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(rowId)) {
        newSet.delete(rowId)
      } else {
        newSet.add(rowId)
      }
      return newSet
    })
  }, [])

  const { data, status, error } = useSearchDeliveriesQuery({
    source_location_id: debouncedSourceLocationId || undefined,
    source_location_name: debouncedSourceLocationName || undefined,
    destination_store: debouncedDestinationStore || undefined,
    delivery_date: debouncedDeliveryDate || undefined,
    delivery_status_code: debouncedDeliveryStatusCode || undefined,
    delivery_type_code: debouncedDeliveryTypeCode || undefined,
    sales_order_reference: debouncedSalesOrderReference || undefined,
    delivery_id: debouncedDeliveryId || undefined,
  })
  const { mutate: exportDeliveries, isPending: isExporting } = useExportDeliveryMutation()

  const handleFilterSubmit = useCallback((values: any) => {
    setDeliveryId(values.deliveryId ? Number(values.deliveryId) : undefined)
    setSourceLocationId(values.sourceLocationId ? Number(values.sourceLocationId) : undefined)
    setSourceLocationName(values.sourceLocationName || "")
    setDestinationStore(values.destinationStore || "")
    setDeliveryDate(values.deliveryDate || "")
    setDeliveryStatusCode(values.deliveryStatusCode || "")
    setDeliveryTypeCode(values.deliveryTypeCode || "")
    setSalesOrderReference(values.salesOrderReference || "")
  }, [])

  const handleClearFilters = useCallback(() => {
    setDeliveryId(undefined)
    setSourceLocationId(undefined)
    setSourceLocationName("")
    setDestinationStore("")
    setDeliveryDate("")
    setDeliveryStatusCode("")
    setDeliveryTypeCode("")
    setSalesOrderReference("")
    setClearTrigger(prev => prev + 1)
  }, [])

  const hasActiveFilters = !!(
    deliveryId ||
    sourceLocationId ||
    sourceLocationName ||
    destinationStore ||
    deliveryDate ||
    deliveryStatusCode ||
    deliveryTypeCode ||
    salesOrderReference
  )

  const activeFilters = [
    deliveryId && { label: `GTN: ${deliveryId}`, setter: () => setDeliveryId(undefined) },
    sourceLocationName && {
      label: `Source: ${sourceLocationName}`,
      setter: () => setSourceLocationName(""),
    },
    destinationStore && {
      label: `Destination: ${destinationStore}`,
      setter: () => setDestinationStore(""),
    },
    deliveryDate && { label: `Date: ${deliveryDate}`, setter: () => setDeliveryDate("") },
    deliveryStatusCode && {
      label: `Status: ${deliveryStatusCode}`,
      setter: () => setDeliveryStatusCode(""),
    },
    deliveryTypeCode && {
      label: `Type: ${deliveryTypeCode}`,
      setter: () => setDeliveryTypeCode(""),
    },
    salesOrderReference && {
      label: `Order: ${salesOrderReference}`,
      setter: () => setSalesOrderReference(""),
    },
  ].filter(Boolean) as Array<{ label: string; setter: () => void }>

  const handleExport = () => {
    exportDeliveries(
      {
        source_location_id: debouncedSourceLocationId || undefined,
        source_location_name: debouncedSourceLocationName || undefined,
        destination_store: debouncedDestinationStore || undefined,
        delivery_date: debouncedDeliveryDate || undefined,
        delivery_status_code: debouncedDeliveryStatusCode || undefined,
        delivery_type_code: debouncedDeliveryTypeCode || undefined,
        sales_order_reference: debouncedSalesOrderReference || undefined,
        delivery_id: debouncedDeliveryId || undefined,
      },
      {
        onSuccess: data => {
          const url = data.download_url
          if (url) {
            const a = document.createElement("a")
            a.href = url
            a.download = ""
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
          }

          toast.success("Deliveries exported successfully")
        },
        onError: () => {
          toast.error("Unable to export deliveries. Please try again later.")
        },
      },
    )
  }

  const totalItems: number = data?.count || 0
  const rows: IDelivery[] = data?.results || []
  const columns: ColumnDef<IDelivery>[] = [
    {
      id: "preview",
      cell: ({ row }) => {
        const rowId = row.original.delivery_id || row.index
        const isExpanded = expandedRows.has(rowId)
        return (
          <button
            onClick={() => toggleRowExpansion(rowId)}
            className="cursor-pointer rounded p-1 transition-colors hover:bg-gray-200"
            aria-label={isExpanded ? "Collapse row" : "Expand row"}
          >
            {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
        )
      },
    },
    {
      accessorKey: "delivery_id",
      header: ({ column }) => (
        <Button
          variant="default"
          className="w-full justify-start has-[>svg]:px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          GTN Number
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div className="">{row.original.delivery_id}</div>,
    },
    {
      accessorKey: "source_location_name",
      header: ({ column }) => (
        <Button
          variant="default"
          className="w-full justify-start has-[>svg]:px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Source Location
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div className="">{row.original.source_location_name}</div>,
    },
    {
      accessorKey: "destination_store_name",
      header: ({ column }) => (
        <Button
          variant="default"
          className="w-full justify-start has-[>svg]:px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Destination Store
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div className="">{row.original.destination_store_name}</div>,
    },
    {
      accessorKey: "total_quantity_expected",
      header: ({ column }) => (
        <Button
          variant="default"
          className="w-full justify-start has-[>svg]:px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Expected QTY
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div className="">{row.original.total_quantity_expected.toFixed(2)}</div>,
    },
    {
      accessorKey: "total_quantity_received",
      header: ({ column }) => (
        <Button
          variant="default"
          className="w-full justify-start has-[>svg]:px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Received QTY
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div className="">{row.original.total_quantity_received.toFixed(2)}</div>,
    },
    {
      accessorKey: "delivery_date",
      header: ({ column }) => (
        <Button
          variant="default"
          className="w-full justify-start has-[>svg]:px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Delivery Date
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="">{formatDate(row.original.delivery_date, "MMM dd yyyy")}</div>
      ),
    },
    {
      accessorKey: "delivery_status",
      header: ({ column }) => (
        <Button
          variant="default"
          className="w-full justify-start has-[>svg]:px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Delivery Status
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div className="">{row.original.delivery_status}</div>,
    },
    {
      id: "actions",
      header: () => (
        <Button variant="default" className="w-full justify-start px-0 has-[>svg]:px-0">
          Actions
        </Button>
      ),
      cell: ({ row }) => {
        const deliveryId = row.original.delivery_id
        return (
          <Button
            className="text-primary rounded-xl bg-blue-50 text-sm hover:bg-blue-50/90"
            onClick={() => {
              navigate({ to: `/grn-transfer/delivery/${deliveryId}` })
            }}
            size="sm"
          >
            <Eye className="size-4" />
            View
          </Button>
        )
      },
    },
  ]

  const table = useReactTable({
    data: rows,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  return (
    <div className="h-full space-y-6 rounded-xl bg-white p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">GRN History</h1>

          <Button variant="outline" onClick={handleExport} disabled={isExporting}>
            <Download className="size-4" />
            Export
          </Button>
        </div>
        <GrnHistoryFilterForm onSubmit={handleFilterSubmit} resetTrigger={clearTrigger} />

        {/* Active Filters Section */}
        {hasActiveFilters && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-blue-900">Active:</p>

                <div className="flex flex-wrap gap-2">
                  {activeFilters.map((filter, idx) => (
                    <button
                      key={idx}
                      onClick={filter.setter}
                      className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 transition-colors hover:bg-blue-200"
                    >
                      {filter.label}
                      <X className="size-3" />
                    </button>
                  ))}
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearFilters}
                className="text-blue-600 hover:bg-blue-100 hover:text-blue-700"
              >
                <X className="mr-1 size-4" />
                Clear all filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      {status === "pending" ? (
        <TableSkeleton columns={columns} />
      ) : status === "error" ? (
        <section className="flex flex-col gap-6">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h3 className="text-lg font-semibold text-red-900">Error Loading Data</h3>
            <p className="mt-2 text-red-700">
              {error instanceof Error
                ? error.message
                : "An error occurred while fetching data. Please try again."}
            </p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Reload Page
            </Button>
          </div>
        </section>
      ) : (
        <section className="flex flex-col gap-6">
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow
                      key={headerGroup.id}
                      className="bg-primary hover:bg-primary text-white"
                    >
                      {headerGroup.headers.map(header => (
                        <TableHead key={header.id} className="px-4">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map(row => {
                    const rowId = row.original.delivery_id || row.index
                    const isExpanded = expandedRows.has(rowId)
                    return (
                      <React.Fragment key={row.id}>
                        <TableRow className={cn(isExpanded ? "bg-blue-50" : "")}>
                          {row.getVisibleCells().map(cell => (
                            <TableCell key={cell.id} className="px-4">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                        <DeliveryDetailRow delivery={row.original} isExpanded={isExpanded} isView />
                      </React.Fragment>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* <Pagination
            currentPage={page}
            totalPages={Math.max(1, Math.ceil(totalItems / itemsPerPage))}
            onPageChange={setPage}
            onItemsPerPageChange={setItemsPerPage}
          /> */}
        </section>
      )}
    </div>
  )
}
