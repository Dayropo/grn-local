import { Package } from "lucide-react"
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DeliveryDetailRowProps {
  delivery: IDelivery
  isExpanded: boolean
  isView?: boolean
}

export const DeliveryDetailRow: React.FC<DeliveryDetailRowProps> = ({
  delivery,
  isExpanded,
  isView,
}) => {
  if (!isExpanded) return null

  const lineItems = delivery.line_items || []

  const columns: ColumnDef<IDeliveryLineItem>[] = [
    {
      accessorKey: "product_id",
      header: "Product ID",
      cell: ({ row }) => <div className="font-mono text-sm">{row.original.product_id || "-"}</div>,
    },
    {
      accessorKey: "metadata.Description",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.original.metadata?.Description || "-"}</div>
      ),
    },
    {
      accessorKey: "unit_of_measurement",
      header: "UOM",
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
          {row.original.unit_of_measurement || "-"}
        </span>
      ),
    },
    {
      accessorKey: "unit_of_measurement",
      header: "Unit Price",
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
          {row.original.unit_of_measurement || "-"}
        </span>
      ),
    },
    {
      accessorKey: "quantity_expected",
      header: "Expected Qty",
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {parseFloat(row.original.quantity_expected || "0").toFixed(3)}
        </div>
      ),
    },
    {
      accessorKey: "quantity_received",
      header: "Received Qty",
      cell: ({ row }) => (
        <div className="font-mono text-sm font-semibold text-green-600">
          {parseFloat(row.original.quantity_received || "0").toFixed(3)}
        </div>
      ),
    },
    {
      id: "outstanding",
      header: "Outstanding Qty",
      cell: ({ row }) => {
        const expected = parseFloat(row.original.quantity_expected || "0")
        const received = parseFloat(row.original.quantity_received || "0")
        const outstanding = expected - received
        return <div className="font-mono text-sm text-orange-600">{outstanding.toFixed(3)}</div>
      },
    },
    {
      id: "status",
      header: "Delivery Status",
      cell: ({ row }) => {
        const expected = parseFloat(row.original.quantity_expected || "0")
        const received = parseFloat(row.original.quantity_received || "0")
        const outstanding = expected - received
        const isFullyReceived = outstanding <= 0

        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              isFullyReceived
                ? "bg-green-100 text-green-800"
                : received > 0
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {isFullyReceived ? "Complete" : received > 0 ? "Partial" : "Pending"}
          </span>
        )
      },
    },
  ]

  const table = useReactTable({
    data: lineItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <TableRow className="bg-gray-50">
      <TableCell colSpan={12} className="px-0 py-4">
        <div className="px-4">
          <div className="flex items-center justify-between">
            <h4 className="mb-3 flex items-center text-sm font-semibold text-gray-700">
              <Package className="mr-2 h-4 w-4" />
              Line Items ({lineItems.length} items)
            </h4>

            {isView && <h4>Confirmation Status:</h4>}
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id} className="bg-gray-100 hover:bg-gray-100">
                    {headerGroup.headers.map(header => (
                      <TableHead
                        key={header.id}
                        className="px-4 py-2 text-xs font-medium uppercase"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.id} className="hover:bg-gray-50">
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id} className="px-4 py-2">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="px-4 py-4 text-center text-gray-500">
                      No line items available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}
