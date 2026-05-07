import { Package } from "lucide-react"
import { formatQty } from "@/lib/utils"
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
      accessorKey: "unit_price",
      header: "Unit Price",
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {`${parseFloat(String(row.original.unit_price || 0)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${row.original.metadata?.currency_code || ""}` ||
            "-"}
        </span>
      ),
    },
    {
      accessorKey: "total_value",
      header: "Total Value",
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {`${parseFloat(String(row.original.total_value || 0)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${row.original.metadata?.currency_code || ""}` ||
            "-"}
        </span>
      ),
    },
    {
      accessorKey: "quantity_expected",
      header: "Expected Qty",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{formatQty(row.original.quantity_expected)}</div>
      ),
    },
    {
      accessorKey: "quantity_received",
      header: "Received Qty",
      cell: ({ row }) => (
        <div className="font-mono text-sm font-semibold text-green-600">
          {formatQty(row.original.quantity_received)}
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
        return <div className="font-mono text-sm text-orange-600">{formatQty(outstanding)}</div>
      },
    },
    {
      id: "status",
      header: "Status",
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

            {isView && (
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                Confirmation Status:
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${(() => {
                    const latestReceipt = delivery.receipts?.length
                      ? delivery.receipts.reduce((latest, r) => (r.id > latest.id ? r : latest))
                      : null
                    const latestStatus =
                      latestReceipt?.approval_status || delivery.latest_receipt_status?.status
                    if (!latestReceipt && !delivery.latest_receipt_status)
                      return "bg-gray-100 text-gray-800"
                    if (delivery.has_pending_approval) return "bg-yellow-100 text-yellow-800"
                    if (latestStatus === "rejected") return "bg-red-100 text-red-800"
                    return "bg-green-100 text-green-800"
                  })()}`}
                >
                  {(() => {
                    const latestReceipt = delivery.receipts?.length
                      ? delivery.receipts.reduce((latest, r) => (r.id > latest.id ? r : latest))
                      : null
                    const latestStatus =
                      latestReceipt?.approval_status || delivery.latest_receipt_status?.status
                    if (!latestReceipt && !delivery.latest_receipt_status) return "No Receipt"
                    if (delivery.has_pending_approval) return "Awaiting Approval"
                    if (latestStatus === "rejected") return "Rejected"
                    return "Approved"
                  })()}
                </span>
              </div>
            )}
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
