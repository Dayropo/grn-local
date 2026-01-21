import { useSearchDeliveriesQuery } from "@/lib/api/transfers"
import axiosInstance from "@/lib/axios"
import { queryClient } from "@/lib/query-client"
import { createFileRoute } from "@tanstack/react-router"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { useState } from "react"
import { useDebounce } from "use-debounce"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Pagination from "@/components/pagination"
import { ArrowUpDown, ChevronRight, Eye } from "lucide-react"
import TableSkeleton from "@/components/table-skeleton"
import { formatDate } from "date-fns"

export const Route = createFileRoute("/grn-transfer/_protected/grn-history/")({
  component: GrnHistory,
  loader: async () => {
    await queryClient.prefetchQuery({
      queryKey: ["transfers", "deliveries", "search"],
      queryFn: async () => {
        const { data } = await axiosInstance.get("/transfers/v1/search")

        return data
      },
    })
  },
})

function GrnHistory() {
  const [sourceLocationId, setSourceLocationId] = useState<number | undefined>()
  const [debouncedSourceLocationId] = useDebounce(sourceLocationId, 500)
  const [sourceLocationName, setSourceLocationName] = useState<string>("")
  const [debouncedSourceLocationName] = useDebounce(sourceLocationName, 500)
  const [destinationStore, setDestinationStore] = useState<string>("")
  const [debouncedDestinationStore] = useDebounce(destinationStore, 500)
  const [deliveryDate, setDeliveryDate] = useState<string>("")
  const [deliveryStatusCode, setDeliveryStatusCode] = useState<string>("")
  const [debouncedDeliveryStatusCode] = useDebounce(deliveryStatusCode, 500)
  const [deliveryTypeCode, setDeliveryTypeCode] = useState<string>("")
  const [debouncedDeliveryTypeCode] = useDebounce(deliveryTypeCode, 500)
  const [salesOrderReference, setSalesOrderReference] = useState<string>("")
  const [debouncedSalesOrderReference] = useDebounce(salesOrderReference, 500)
  const [deliveryId, setDeliveryId] = useState<number | undefined>()
  const [debouncedDeliveryId] = useDebounce(deliveryId, 500)

  const { data, status, error } = useSearchDeliveriesQuery({
    source_location_id: debouncedSourceLocationId || undefined,
    source_location_name: debouncedSourceLocationName || undefined,
    destination_store: debouncedDestinationStore || undefined,
    delivery_date: deliveryDate || undefined,
    delivery_status_code: debouncedDeliveryStatusCode || undefined,
    delivery_type_code: debouncedDeliveryTypeCode || undefined,
    sales_order_reference: debouncedSalesOrderReference || undefined,
    delivery_id: debouncedDeliveryId || undefined,
  })

  const totalItems: number = data?.count || 0
  const rows: IDelivery[] = data?.results || []
  const columns: ColumnDef<IDelivery>[] = [
    {
      id: "preview",
      cell: ({ row }) => (
        <div className="">
          <ChevronRight className="size-4" />
        </div>
      ),
    },
    // GTN Number
    {
      accessorKey: "delivery_id",
      header: ({ column }) => (
        <Button
          variant="secondary"
          className="w-full justify-start has-[>svg]:px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          GRN Number
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div className="">{row.original.delivery_id}</div>,
    },
    // Source Location
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
    // Expected QTY
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
      cell: ({ row }) => <div className="">{row.original.total_quantity_expected}</div>,
    },
    // Received QTY
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
      cell: ({ row }) => <div className="">{row.original.total_quantity_received}</div>,
    },
    // Status
    {
      accessorKey: "delivery_status",
      header: ({ column }) => (
        <Button
          variant="default"
          className="w-full justify-start has-[>svg]:px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <div className="">{row.original.delivery_status}</div>,
    },
    // Date Created
    {
      accessorKey: "created_date",
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
      cell: ({ row }) => (
        <div className="">{formatDate(row.original.created_date, "MMM dd yyyy")}</div>
      ),
    },
    // Actions
    {
      id: "actions",
      header: () => (
        <Button variant="default" className="w-full justify-center px-0 has-[>svg]:px-0">
          Actions
        </Button>
      ),
      cell: ({ row }) => (
        <Button>
          <Eye />
          View
        </Button>
      ),
    },
  ]

  return <div>Hello "/grn-transfer/_protected/grn-history/"!</div>
}
