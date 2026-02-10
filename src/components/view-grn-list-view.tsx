import { Button } from "@/components/ui/button"
import { ArrowLeft, Eye, ChevronRight, ChevronDown, ArrowUpDown } from "lucide-react"
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

interface ViewGrnListViewProps {
  results: IDelivery[]
  onSelectGrn: (grn: IDelivery) => void
  onBackToSearch: () => void
}

export const ViewGrnListView: React.FC<ViewGrnListViewProps> = ({
  results,
  onSelectGrn,
  onBackToSearch,
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
          <h2 className="text-xl font-bold text-gray-900">GRNs Found</h2>
          <p className="mt-1 text-sm text-gray-600">
            {results.length} delivery receipt{results.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <Button variant="outline" onClick={onBackToSearch}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Search
        </Button>
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
    </div>
  )
}
