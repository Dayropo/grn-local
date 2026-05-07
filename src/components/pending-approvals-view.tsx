import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "date-fns"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import React, { useState, useCallback, useMemo } from "react"
import Pagination from "@/components/pagination"
import {
  Eye,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
} from "lucide-react"
import { cn, formatQty } from "@/lib/utils"
import { DeliveryDetailRow } from "./delivery-detail-row"

interface PendingApprovalsViewProps {
  approvals: IPendingApproval[]
  isLoading?: boolean
  onSelectApproval: (approval: IPendingApproval) => void
}

export const PendingApprovalsView: React.FC<PendingApprovalsViewProps> = ({
  approvals,
  isLoading,
  onSelectApproval,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const toggleRowExpansion = useCallback((rowId: number) => {
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

  const columns: ColumnDef<IPendingApproval>[] = useMemo(
    () => [
      {
        id: "expand",
        cell: ({ row }) => {
          const isExpanded = expandedRows.has(row.original.id)
          return (
            <button
              onClick={() => toggleRowExpansion(row.original.id)}
              className="rounded p-1 transition-colors hover:bg-gray-200"
              aria-label={isExpanded ? "Collapse row" : "Expand row"}
            >
              {isExpanded ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </button>
          )
        },
      },
      {
        accessorKey: "receipt_number",
        header: ({ column }) => (
          <Button
            variant="default"
            className="w-full justify-start has-[>svg]:px-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Receipt #
            <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-mono font-medium">{row.original.receipt_number}</div>
        ),
      },
      {
        accessorKey: "inbound_delivery.delivery_id",
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
        cell: ({ row }) => <div>{row.original.inbound_delivery?.delivery_id || "-"}</div>,
      },
      {
        accessorKey: "source_location",
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
        cell: ({ row }) => <div>{row.original.source_location}</div>,
      },
      {
        accessorKey: "destination_store",
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
        cell: ({ row }) => <div>{row.original.destination_store}</div>,
      },
      {
        accessorKey: "inbound_delivery.total_quantity_expected",
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
        cell: ({ row }) => (
          <div className="">
            {formatQty(row.original.inbound_delivery?.total_quantity_expected)}
          </div>
        ),
      },
      {
        accessorKey: "inbound_delivery.total_quantity_received",
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
        cell: ({ row }) => (
          <div className="">
            {formatQty(row.original.inbound_delivery?.total_quantity_received)}
          </div>
        ),
      },
      {
        accessorKey: "created_date",
        header: ({ column }) => (
          <Button
            variant="default"
            className="w-full justify-start has-[>svg]:px-0"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            {row.original.created_date ? formatDate(row.original.created_date, "MMM dd yyyy") : "-"}
          </div>
        ),
      },
      {
        accessorKey: "approval_status_display",
        header: () => (
          <Button variant="default" className="w-full justify-start has-[>svg]:px-0">
            Status
          </Button>
        ),
        cell: ({ row }) => {
          const status = row.original.approval_status
          return (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                status === "receipt_submitted" && "bg-yellow-100 text-yellow-800",
                status === "resubmitted" && "bg-blue-100 text-blue-800",
                status === "approved" && "bg-green-100 text-green-800",
                status === "rejected" && "bg-red-100 text-red-800",
              )}
            >
              {status === "receipt_submitted" && <Clock className="size-3" />}
              {status === "resubmitted" && <RefreshCw className="size-3" />}
              {status === "approved" && <CheckCircle2 className="size-3" />}
              {status === "rejected" && <XCircle className="size-3" />}
              {row.original.approval_status_display}
            </span>
          )
        },
      },
      {
        id: "actions",
        header: () => (
          <Button variant="default" className="w-full justify-start px-0 has-[>svg]:px-0">
            Actions
          </Button>
        ),
        cell: ({ row }) => (
          <Button
            size="sm"
            className="text-primary rounded-xl bg-blue-50 text-sm hover:bg-blue-50/90"
            onClick={() => onSelectApproval(row.original)}
          >
            <Eye className="size-4" />
            Review
          </Button>
        ),
      },
    ],
    [expandedRows, toggleRowExpansion, onSelectApproval],
  )

  const table = useReactTable({
    data: approvals,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize: itemsPerPage,
      },
    },
    onPaginationChange: updater => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex: page - 1, pageSize: itemsPerPage })
        setPage(newState.pageIndex + 1)
        setItemsPerPage(newState.pageSize)
      }
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl bg-white p-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (approvals.length === 0) {
    return (
      <div className="rounded-xl bg-white p-12 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-400" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">No Pending Approvals</h3>
        <p className="mt-2 text-sm text-gray-500">
          All receipts have been reviewed. Check back later.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 rounded-xl bg-white p-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Pending Approvals</h2>
        <p className="mt-1 text-sm text-gray-600">
          {approvals.length} receipt{approvals.length !== 1 ? "s" : ""} awaiting review
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id} className="bg-primary hover:bg-primary text-white">
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
              {table.getRowModel().rows.flatMap(row => {
                const isExpanded = expandedRows.has(row.original.id)
                const rows = [
                  <TableRow key={row.id} className={cn(isExpanded ? "bg-blue-50" : "")}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className="px-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>,
                ]
                if (isExpanded) {
                  rows.push(
                    <DeliveryDetailRow
                      key={`detail-${row.id}`}
                      delivery={row.original.inbound_delivery}
                      isExpanded={isExpanded}
                    />,
                  )
                }
                return rows
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {approvals.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={table.getPageCount()}
          itemsPerPage={itemsPerPage}
          onPageChange={setPage}
          onItemsPerPageChange={val => {
            setItemsPerPage(val)
            setPage(1)
          }}
        />
      )}
    </div>
  )
}
