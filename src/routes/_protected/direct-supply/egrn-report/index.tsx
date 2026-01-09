import axiosInstance from "@/lib/axios"
import { queryClient } from "@/lib/query-client"
import { useDownloadGrnMutation, useFilterGrnsQuery } from "@/lib/api/egrn"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { useDebounce } from "use-debounce"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowUpDown, ChevronRight, Download, MoreHorizontal, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Pagination from "@/components/pagination"
import { formatMonetaryValue } from "@/lib/utils"
import { formatDate } from "date-fns"
import { DateRangePicker } from "@/components/date-range-picker"
import TableSkeleton from "@/components/table-skeleton"

export const Route = createFileRoute("/_protected/direct-supply/egrn-report/")({
  component: EgrnReportPage,
  pendingComponent: () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  ),
  loader: async () => {
    await queryClient.prefetchQuery({
      queryKey: ["egrn", "filter-grns"],
      queryFn: async () => {
        const { data } = await axiosInstance.get("/egrn/v1/filter-grns", {
          params: {
            page: 1,
            size: 10,
          },
        })

        return data
      },
    })
  },
})

function EgrnReportPage() {
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [poId, setPoId] = useState<number | undefined>()
  const [debouncedPoId] = useDebounce(poId, 500)
  const [vendorInternalId, setVendorInternalId] = useState<string>("")
  const [debouncedVendorInternalId] = useDebounce(vendorInternalId, 500)
  const [deliveryStores, setDeliveryStores] = useState<string>("")
  const [debouncedDeliveryStores] = useDebounce(deliveryStores, 500)
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [deliveryStatusCode, setDeliveryStatusCode] = useState<number | undefined>()
  const [invoiceStatusCode, setInvoiceStatusCode] = useState<number | undefined>()
  const [sorting, setSorting] = useState<SortingState>([])

  const { data, status, error } = useFilterGrnsQuery({
    page,
    size: itemsPerPage,
    po_id: debouncedPoId || undefined,
    vendor_internal_id: debouncedVendorInternalId || undefined,
    delivery_stores: debouncedDeliveryStores || undefined,
    start_date: startDate ? formatDate(startDate, "yyyy-MM-dd") : undefined,
    end_date: endDate ? formatDate(endDate, "yyyy-MM-dd") : undefined,
    delivery_status_code: deliveryStatusCode || undefined,
    invoice_status_code: invoiceStatusCode || undefined,
  })
  const { mutate: downloadGrn, isPending: isDownloadingGrn } = useDownloadGrnMutation()

  const deliveryStatusOptions = [
    { value: 1, label: "Not Delivered" },
    { value: 2, label: "Partially Delivered" },
    { value: 3, label: "Completely Delivered" },
  ]

  const invoiceStatusOptions = [
    { value: 1, label: "Not Started" },
    { value: 2, label: "In Process" },
    { value: 3, label: "Finished" },
  ]

  const handleDownload = () => {
    downloadGrn({
      page,
      size: itemsPerPage,
      po_id: debouncedPoId || undefined,
      vendor_internal_id: debouncedVendorInternalId || undefined,
      delivery_stores: debouncedDeliveryStores || undefined,
      start_date: startDate ? formatDate(startDate, "yyyy-MM-dd") : undefined,
      end_date: endDate ? formatDate(endDate, "yyyy-MM-dd") : undefined,
      delivery_status_code: deliveryStatusCode || undefined,
      invoice_status_code: invoiceStatusCode || undefined,
    })
  }

  const totalItems: number = data?.count || 0
  const rows: IGrn[] = data?.results || []
  const columns: ColumnDef<IGrn>[] = [
    {
      id: "preview",
      cell: ({ row }) => (
        <div className="">
          <ChevronRight className="size-4" />
        </div>
      ),
    },
    {
      id: "po_id",
      accessorFn: row => row.purchase_order?.po_id,
      header: ({ column }) => (
        <Button
          variant="default"
          className="w-full justify-start has-[>svg]:px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          PO Number
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div className="">{row.original.purchase_order?.po_id}</div>,
    },
    {
      accessorKey: "grn_number",
      header: ({ column }) => (
        <Button
          variant="default"
          className="w-full justify-start has-[>svg]:px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          GRN Number
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div className="">{row.getValue("grn_number")}</div>,
    },
    {
      id: "vendor",
      accessorFn: row => row.purchase_order?.vendor,
      header: ({ column }) => (
        <Button
          variant="default"
          className="w-full justify-start has-[>svg]:px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Vendor ID
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div className="">{row.original.purchase_order?.vendor}</div>,
    },
    {
      accessorKey: "created",
      header: ({ column }) => (
        <Button
          variant="default"
          className="w-full justify-start has-[>svg]:px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date Created
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div className="">{formatDate(row.original.created, "MMM dd yyyy")}</div>,
    },
    {
      id: "store_code",
      accessorFn: row => row.stores?.[0]?.byd_cost_center_code,
      header: ({ column }) => (
        <Button
          variant="default"
          className="w-full justify-start has-[>svg]:px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Store Code
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div className="">{row.original.stores?.[0]?.byd_cost_center_code}</div>,
    },
    {
      id: "delivery_status",
      accessorFn: row => row.purchase_order?.delivery_status_text,
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
      cell: ({ row }) => (
        <div className="">{row.original.purchase_order?.delivery_status_text}</div>
      ),
    },
    {
      accessorKey: "invoice_status_text",
      header: ({ column }) => (
        <Button
          variant="default"
          className="w-full justify-start has-[>svg]:px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Invoice Status
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div className="">{row.getValue("invoice_status_text")}</div>,
    },
    {
      accessorKey: "total_value_received",
      header: ({ column }) => (
        <Button
          variant="default"
          className="w-full justify-end has-[>svg]:px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Value
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-right">{formatMonetaryValue(row.original.total_value_received)}</div>
      ),
    },
    {
      id: "actions",
      header: () => (
        <Button variant="default" className="w-full justify-center px-0 has-[>svg]:px-0">
          Actions
        </Button>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md p-0 text-gray-700 outline-none hover:bg-gray-50">
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem
                  className="cursor-pointer text-gray-700 outline-none hover:bg-gray-50"
                  // onClick={() => {
                  //   setSelectedTraining(row.original)
                  //   setShowDetailsSheet(true)
                  // }}
                >
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-gray-700 outline-none hover:bg-gray-50"
                  // onClick={() => navigate(`${row.original.id}/edit`)}
                >
                  View GRN
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
    <div className="flex flex-col gap-6">
      {/* Filters and Export */}
      <section className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900">GRN History</h1>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Filters</h2>
          <Button
            onClick={handleDownload}
            disabled={isDownloadingGrn}
            className="flex items-center gap-2"
          >
            <Download className="size-4" />
            {isDownloadingGrn ? "Exporting..." : "Export"}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* PO ID Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">PO Number</label>
            <Input
              placeholder="Enter PO ID"
              value={poId || ""}
              onChange={event => {
                const numericValue = event.target.value.replace(/\D/g, "")
                setPoId(numericValue ? Number(numericValue) : undefined)
              }}
              className="h-9"
            />
          </div>

          {/* Vendor ID Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Vendor ID</label>
            <Input
              type="text"
              placeholder="Enter Vendor ID"
              value={vendorInternalId}
              onChange={e => setVendorInternalId(e.target.value)}
              className="h-9"
            />
          </div>

          {/* Delivery Stores Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Store Code</label>
            <Input
              type="text"
              placeholder="Enter Store Code"
              value={deliveryStores}
              onChange={e => setDeliveryStores(e.target.value)}
              className="h-9"
            />
          </div>

          {/* Delivery Status Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Delivery Status</label>
            <Select
              value={deliveryStatusCode ? String(deliveryStatusCode) : "all"}
              onValueChange={value =>
                setDeliveryStatusCode(value === "all" ? undefined : Number(value))
              }
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {deliveryStatusOptions.map(option => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Invoice Status Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Invoice Status</label>
            <Select
              value={invoiceStatusCode ? String(invoiceStatusCode) : "all"}
              onValueChange={value =>
                setInvoiceStatusCode(value === "all" ? undefined : Number(value))
              }
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {invoiceStatusOptions.map(option => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="flex flex-col gap-2 lg:col-span-2">
            <label className="text-sm font-medium text-gray-700">Date Range</label>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setPoId(undefined)
                setVendorInternalId("")
                setDeliveryStores("")
                setStartDate(undefined)
                setEndDate(undefined)
                setDeliveryStatusCode(undefined)
                setInvoiceStatusCode(undefined)
              }}
              className="flex w-full items-center gap-2"
            >
              <X className="size-4" />
              Clear
            </Button>
          </div>
        </div>
      </section>

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
                      {headerGroup.headers.map((header, idx) => (
                        <TableHead key={header.id} className={`px-4`}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map(row => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell, idx) => (
                        <TableCell key={cell.id} className={`px-4`}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <Pagination
            currentPage={page}
            totalPages={Math.max(1, Math.ceil(totalItems / itemsPerPage))}
            onPageChange={setPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </section>
      )}
    </div>
  )
}
