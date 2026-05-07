import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, AlertCircle, Loader2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "date-fns"
import { COMPANY_ADDRESS, COMPANY_LOGO_SMALL, COMPANY_NAME, COMPANY_PHONE } from "@/lib/constants"
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import {
  useApproveDeliveryReceiptMutation,
  useRejectDeliveryReceiptMutation,
} from "@/lib/api/transfers"
import { useState } from "react"
import { toast } from "sonner"
import { formatQty } from "@/lib/utils"

interface ViewGrnDetailViewProps {
  grn: IDelivery
  onBackToList: () => void
  receiptId?: number
  approval?: IPendingApproval
}

export const ViewGrnDetailView: React.FC<ViewGrnDetailViewProps> = ({
  grn,
  onBackToList,
  receiptId,
  approval,
}) => {
  const [confirmed, setConfirmed] = useState(false)
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  const { mutate: approveReceipt, isPending: isApproving } = useApproveDeliveryReceiptMutation()
  const { mutate: rejectReceipt, isPending: isRejecting } = useRejectDeliveryReceiptMutation()

  const handleApprove = () => {
    if (!receiptId) return
    approveReceipt(
      { receiptId },
      {
        onSuccess: () => {
          toast.success("Receipt approved successfully")
          onBackToList()
        },
        onError: () => {
          toast.error("Failed to approve receipt")
        },
      },
    )
  }

  const handleReject = () => {
    if (!receiptId || !rejectionReason.trim()) return
    rejectReceipt(
      { receiptId, rejectionReason: rejectionReason.trim() },
      {
        onSuccess: () => {
          toast.success("Receipt rejected")
          onBackToList()
        },
        onError: () => {
          toast.error("Failed to reject receipt")
        },
      },
    )
  }

  const calculateVariance = (expected: number, received: number) => {
    if (expected === 0) return 0
    return ((received - expected) / expected) * 100
  }

  const lineItems = grn.line_items || []

  const lineItemColumns: ColumnDef<IDeliveryLineItem>[] = [
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
      id: "variance",
      header: "Variance",
      cell: ({ row }) => {
        const expected = parseFloat(row.original.quantity_expected || "0")
        const received = parseFloat(row.original.quantity_received || "0")
        const variance = calculateVariance(expected, received)
        const isVarianceHigh = Math.abs(variance) > 5

        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              isVarianceHigh ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
            }`}
          >
            {variance > 0 ? "+" : ""}
            {variance.toFixed(1)}%
          </span>
        )
      },
    },
  ]

  const table = useReactTable({
    data: lineItems,
    columns: lineItemColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  const hasVariances = lineItems.some(item => {
    const expected = parseFloat(item.quantity_expected || "0")
    const received = parseFloat(item.quantity_received || "0")
    return Math.abs(calculateVariance(expected, received)) > 5
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between rounded-xl bg-white p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GRN Details</h1>
          <p className="mt-1 text-sm text-gray-600">Review and confirm delivery receipt</p>
        </div>
        <Button variant="outline" onClick={onBackToList}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
      </div>

      {/* Variance Warning */}
      {hasVariances && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-900">Quantity Variances Detected</h3>
              <p className="mt-1 text-sm text-yellow-800">
                Some items have significant differences between expected and received quantities.
                Please review carefully.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* GRN Details Card */}
      <div className="space-y-6 rounded-xl bg-white p-6">
        {/* Company Header */}
        <div className="flex flex-col items-center space-y-2 border-b border-gray-200 pb-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <img src={COMPANY_LOGO_SMALL} alt="Company Logo" />
          </div>
          <h2 className="text-primary text-xl font-bold">{COMPANY_NAME}</h2>
          <p className="text-sm text-gray-600">{COMPANY_ADDRESS}</p>
          <p className="text-sm text-gray-600">Tel: {COMPANY_PHONE}</p>
        </div>

        {/* GRN Summary */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">GRN Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">GRN Number:</span>
                <span className="font-semibold text-gray-900">{grn.delivery_id || "-"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Source Location:</span>
                <span className="font-semibold text-gray-900">
                  {grn.source_location_name || "-"}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-600">Destination Store:</span>
                <span className="font-semibold text-gray-900">
                  {grn.destination_store_name || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Date:</span>
                <span className="font-semibold text-gray-900">
                  {grn.delivery_date ? formatDate(new Date(grn.delivery_date), "dd MMM yyyy") : "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Quantity Summary */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Quantity Summary</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-blue-50 p-3 text-center">
                <p className="text-xs font-medium text-gray-600">Expected</p>
                <p className="mt-1 text-lg font-bold text-blue-600">
                  {formatQty(grn.total_quantity_expected)}
                </p>
              </div>
              <div className="rounded-lg bg-yellow-50 p-3 text-center">
                <p className="text-xs font-medium text-gray-600">Outstanding</p>
                <p className="mt-1 text-lg font-bold text-yellow-600">
                  {formatQty(
                    (grn.total_quantity_expected || 0) - (grn.total_quantity_received || 0),
                  )}
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-3 text-center">
                <p className="text-xs font-medium text-gray-600">Received</p>
                <p className="mt-1 text-lg font-bold text-green-600">
                  {formatQty(grn.total_quantity_received)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-4 border-t border-gray-200 pt-6">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-gray-700" />
            <h3 className="font-semibold text-gray-900">Line Items</h3>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id} className="bg-gray-50 hover:bg-gray-50">
                    {headerGroup.headers.map(header => (
                      <TableHead key={header.id} className="px-4 py-3 text-gray-900">
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
                  const expected = parseFloat(row.original.quantity_expected || "0")
                  const received = parseFloat(row.original.quantity_received || "0")
                  const variance = calculateVariance(expected, received)
                  const isVarianceHigh = Math.abs(variance) > 5

                  return (
                    <TableRow
                      key={row.id}
                      className={`border-b border-gray-200 ${isVarianceHigh ? "bg-yellow-50" : "hover:bg-gray-50"}`}
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id} className="px-4 py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Confirmation Section */}
        <div className="space-y-4 border-t border-gray-200 pt-6">
          {receiptId && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="confirm-grn"
                checked={confirmed}
                onChange={e => setConfirmed(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="confirm-grn"
                className="cursor-pointer text-sm font-medium text-gray-900"
              >
                I have reviewed all details and confirm this GRN is correct
              </label>
            </div>
          )}

          {showRejectInput && (
            <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-4">
              <label htmlFor="rejection-reason" className="text-sm font-medium text-gray-900">
                Reason for rejection
              </label>
              <textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejecting this receipt..."
                className="w-full resize-none rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowRejectInput(false)
                    setRejectionReason("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={!rejectionReason.trim() || isRejecting}
                  onClick={handleReject}
                >
                  {isRejecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm Rejection
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onBackToList}>
              Back to List
            </Button>
            {receiptId && (
              <>
                <Button
                  disabled={!confirmed || isApproving || showRejectInput}
                  className="bg-green-600 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={handleApprove}
                >
                  {isApproving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Approve GRN
                </Button>
                <Button
                  variant="destructive"
                  disabled={isRejecting || isApproving}
                  onClick={() => setShowRejectInput(true)}
                >
                  Reject GRN
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
