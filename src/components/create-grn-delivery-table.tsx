import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Eye } from "lucide-react"

export interface DeliveryTableProps {
  data: IDelivery[]
  onPreviewDelivery?: (delivery: IDelivery) => void
}

export const CreateGrnDeliveryTable: React.FC<DeliveryTableProps> = ({
  data,
  onPreviewDelivery,
}) => {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns: ColumnDef<IDelivery>[] = [
    {
      accessorKey: "delivery_id",
      header: ({ column }) => {
        return (
          <Button
            variant="default"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full justify-start has-[>svg]:px-0"
          >
            Delivery ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <span className="font-medium">{row.original.delivery_id}</span>,
    },
    {
      accessorKey: "source_location_name",
      header: ({ column }) => {
        return (
          <Button
            variant="default"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="w-full justify-start has-[>svg]:px-0"
          >
            Source Location
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => row.original.source_location_name,
    },
    {
      accessorKey: "total_quantity_expected",
      header: "Expected QTY",
      cell: ({ row }) => row.original.total_quantity_expected,
    },
    {
      accessorKey: "total_quantity_received",
      header: "Received QTY",
      cell: ({ row }) => row.original.total_quantity_received,
    },
    {
      accessorKey: "delivery_status",
      header: "Status",
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
          {row.original.delivery_status}
        </span>
      ),
    },
    {
      accessorKey: "created_date",
      header: "Date Created",
      cell: ({ row }) => new Date(row.original.created_date).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          size="sm"
          className="text-primary rounded-xl bg-blue-50 text-sm hover:bg-blue-50/90"
          onClick={() => onPreviewDelivery?.(row.original)}
        >
          <Eye className="size-4" />
          Preview
        </Button>
      ),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  })

  if (data.length === 0) {
    return <div className="p-8 text-center text-gray-500">No delivery details to display</div>
  }

  return (
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
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id} className="px-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
