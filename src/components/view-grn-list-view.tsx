import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Eye,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  Download,
  Package,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "date-fns"
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import React, { useState, useCallback, useMemo } from "react"
import { cn } from "@/lib/utils"
import { DeliveryDetailRow } from "./delivery-detail-row"
import Pagination from "@/components/pagination"

interface ViewGrnListViewProps {
  results: IDelivery[]
  totalItems: number
  onSelectGrn: (grn: IDelivery) => void
  onBackToSearch: () => void
  onExport?: () => void
  isExporting?: boolean
  isLoading?: boolean
  page?: number
  totalPages?: number
  itemsPerPage?: number
  onPageChange?: (page: number) => void
  onItemsPerPageChange?: (perPage: number) => void
}

export const ViewGrnListView: React.FC<ViewGrnListViewProps> = ({
  results,
  totalItems,
  onSelectGrn,
  onBackToSearch,
  onExport,
  isExporting,
  isLoading,
  page = 1,
  totalPages = 1,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<number | string>>(new Set())

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

  const columns: ColumnDef<IDelivery>[] = useMemo(
    () => [
      {
        id: "expand",
        cell: ({ row }) => {
          const rowId = row.original.delivery_id || row.index
          const isExpanded = expandedRows.has(rowId)
          return (
            <button
              onClick={() => toggleRowExpansion(rowId)}
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
        cell: ({ row }) => <div className="">{row.original.total_quantity_expected}</div>,
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
        cell: ({ row }) => <div className="">{row.original.total_quantity_received}</div>,
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
        cell: ({ row }) => (
          <Button
            size="sm"
            className="text-primary rounded-xl bg-blue-50 text-sm hover:bg-blue-50/90"
            onClick={() => onSelectGrn(row.original)}
          >
            <Eye className="size-4" />
            View
          </Button>
        ),
      },
    ],
    [expandedRows, toggleRowExpansion, onSelectGrn],
  )

  const table = useReactTable({
    data: results,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-6 rounded-xl bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{totalItems} GRNs Found</h2>
        </div>
        <div className="flex items-center gap-2">
          {onExport && (
            <Button variant="outline" onClick={onExport} disabled={isExporting}>
              <Download className="size-4" />
              Export
            </Button>
          )}
          <Button variant="outline" onClick={onBackToSearch}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 py-16">
          <div className="rounded-full bg-blue-100 p-4">
            <Package className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No GRNs Found</h3>
          <p className="mt-2 text-sm text-gray-600">
            No delivery receipts match your search criteria. Try a different search.
          </p>
        </div>
      ) : (
        <>
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
                  {table.getRowModel().rows.flatMap(row => {
                    const rowId = row.original.delivery_id || row.index
                    const isExpanded = expandedRows.has(rowId)
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
                          delivery={row.original}
                          isExpanded={isExpanded}
                          isView
                        />,
                      )
                    }
                    return rows
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {onPageChange && onItemsPerPageChange && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              onPageChange={onPageChange}
              onItemsPerPageChange={onItemsPerPageChange}
              loading={isLoading}
            />
          )}
        </>
      )}
    </div>
  )
}
