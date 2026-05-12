import {
  useDeliveryQuery,
  useRefreshDeliveryMutation,
  useUpdateDeliveryReceiptMutation,
} from "@/lib/api/transfers"
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router"
import {
  ArrowLeft,
  Download,
  Package,
  Printer,
  AlertTriangle,
  RefreshCw,
  Edit,
  Loader2,
  X,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { extractErrorInfo, formatQty } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "date-fns"
import TableSkeleton from "@/components/table-skeleton"
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { queryClient } from "@/lib/query-client"
import axiosInstance from "@/lib/axios"
import { COMPANY_NAME, COMPANY_ADDRESS, COMPANY_PHONE, COMPANY_LOGO_SMALL } from "@/lib/constants"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { useAuth } from "@/hooks/use-auth"
import { useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export const Route = createFileRoute("/_protected/delivery/$deliveryId/")({
  component: DeliveryDetail,
  loader: async ({ params }) => {
    await queryClient.prefetchQuery({
      queryKey: ["transfers", "deliveries", params.deliveryId],
      queryFn: async () => {
        const { data } = await axiosInstance.get(`/transfers/v1/deliveries/${params.deliveryId}/`)

        return data.data as IDelivery
      },
      staleTime: 0,
    })
  },
})

function DeliveryDetail() {
  const { deliveryId } = Route.useParams()
  const router = useRouter()
  const { data: delivery, status, error } = useDeliveryQuery({ deliveryId })
  const { mutate: refreshDelivery } = useRefreshDeliveryMutation()
  const { mutate: updateReceipt, isPending: isUpdating } = useUpdateDeliveryReceiptMutation()
  const { getRoles } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [editedQuantities, setEditedQuantities] = useState<Record<number, string>>({})
  const [editNotes, setEditNotes] = useState("")
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const navigate = useNavigate()

  const userRoles = getRoles().map(r => r.toLowerCase())
  const isRestaurantManager = userRoles.includes("restaurant_manager")

  const latestReceipt = delivery?.receipts?.length
    ? delivery.receipts.reduce((latest, r) => (r.id > latest.id ? r : latest))
    : null
  const isRejected = latestReceipt?.approval_status === "rejected"
  const showEditButton = isRestaurantManager && isRejected

  const rejectedReceipt = isRejected ? latestReceipt : null

  const handleStartEdit = () => {
    if (!delivery || !rejectedReceipt) return
    const quantities: Record<number, string> = {}
    // Initialize from the rejected receipt's line items
    rejectedReceipt.line_items.forEach(receiptItem => {
      quantities[receiptItem.delivery_line_item] = parseFloat(
        receiptItem.quantity_received || "0",
      ).toString()
    })
    // Fill in any delivery line items not in the receipt with "0"
    delivery.line_items.forEach(item => {
      if (!(item.id in quantities)) {
        quantities[item.id] = "0"
      }
    })
    setEditedQuantities(quantities)
    setEditNotes("")
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedQuantities({})
    setEditNotes("")
  }

  const handleSaveEdit = () => {
    if (!rejectedReceipt) return
    updateReceipt(
      {
        receiptId: rejectedReceipt.id,
        line_items: rejectedReceipt.line_items.map(receiptItem => ({
          line_item_id: receiptItem.delivery_line_item,
          quantity_received:
            editedQuantities[receiptItem.delivery_line_item] === ""
              ? 0
              : parseFloat(editedQuantities[receiptItem.delivery_line_item] || "0"),
        })),
        notes: editNotes,
      },
      {
        onSuccess: () => {
          setIsEditing(false)
          setEditedQuantities({})
          setEditNotes("")
          setShowSuccessDialog(true)
        },
        onError: () => {
          toast.error("Failed to update receipt")
        },
      },
    )
  }

  const handleRefresh = () => {
    refreshDelivery({ deliveryId })
  }

  const lineItems = delivery?.line_items || []

  // Compute previously received quantities from approved receipts (excluding the rejected one being edited)
  const previouslyReceivedMap: Record<number, number> = {}
  if (delivery && rejectedReceipt) {
    delivery.receipts
      .filter(r => r.id !== rejectedReceipt.id && r.approval_status === "approved")
      .forEach(receipt => {
        receipt.line_items.forEach(item => {
          previouslyReceivedMap[item.delivery_line_item] =
            (previouslyReceivedMap[item.delivery_line_item] || 0) +
            parseFloat(item.quantity_received || "0")
        })
      })
  }

  const handleQuantityChange = (lineItemId: number, value: string) => {
    let numericValue = value.replace(/[^0-9.]/g, "")
    const parts = numericValue.split(".")
    if (parts.length > 2) {
      numericValue = parts[0] + "." + parts.slice(1).join("")
    }
    const parsed = parseFloat(numericValue)
    if (!isNaN(parsed)) {
      const lineItem = delivery?.line_items.find(item => item.id === lineItemId)
      const expected = parseFloat(lineItem?.quantity_expected || "0")
      const prevReceived = previouslyReceivedMap[lineItemId] || 0
      const maxAllowed = Math.max(0, expected - prevReceived)
      if (parsed > maxAllowed) {
        setEditedQuantities(prev => ({ ...prev, [lineItemId]: maxAllowed.toString() }))
        return
      }
    }
    setEditedQuantities(prev => ({ ...prev, [lineItemId]: numericValue }))
  }

  const getLineItemColumns = (): ColumnDef<IDeliveryLineItem>[] => [
    {
      accessorKey: "product_id",
      header: "Product ID",
      cell: ({ row }) => <div className="font-mono text-sm">{row.original.product_id || "-"}</div>,
    },
    {
      accessorKey: "product_name",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.original.product_name || "-"}</div>
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
          {`${parseFloat(String(row.original.unit_price || 0)).toLocaleString(`en-US`, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${row.original.metadata?.currency_code || ``}` ||
            "-"}
        </span>
      ),
    },
    {
      accessorKey: "total_value",
      header: "Total Value",
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {`${parseFloat(String(row.original.total_value || 0)).toLocaleString(`en-US`, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${row.original.metadata?.currency_code || ``}` ||
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
      id: "outstanding",
      header: "Outstanding Qty",
      cell: ({ row }) => {
        const expected = parseFloat(row.original.quantity_expected || "0")
        if (isEditing) {
          // During editing: outstanding = expected - previously approved quantities
          const prevReceived = previouslyReceivedMap[row.original.id] || 0
          const outstanding = expected - prevReceived
          return <div className="font-mono text-sm text-orange-600">{formatQty(outstanding)}</div>
        }
        const received = parseFloat(row.original.quantity_received || "0")
        const outstanding = expected - received
        return <div className="font-mono text-sm text-orange-600">{formatQty(outstanding)}</div>
      },
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

  const columns = getLineItemColumns()

  const table = useReactTable({
    data: lineItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const handlePrint = () => {
    const receipt = document.querySelector(".grn-receipt")
    if (!receipt) return

    const printableContent = receipt.innerHTML
    const originalContent = document.body.innerHTML
    document.body.innerHTML = printableContent
    window.print()
    document.body.innerHTML = originalContent
    window.location.reload()
  }

  const handleDownload = (delivery: IDelivery) => {
    const doc = new jsPDF()
    let yPosition = 20

    doc.setFontSize(16)
    doc.text("GOODS RECEIVED NOTE", 105, yPosition, { align: "center" })
    yPosition += 15

    doc.setFontSize(12)
    doc.text(COMPANY_NAME, 105, yPosition, { align: "center" })
    yPosition += 6
    doc.setFontSize(10)
    doc.text(COMPANY_ADDRESS, 105, yPosition, { align: "center" })
    yPosition += 5
    doc.text(`Tel: ${COMPANY_PHONE}`, 105, yPosition, { align: `center` })
    yPosition += 12

    doc.setFontSize(11)
    doc.text("GRN Summary", 14, yPosition)
    yPosition += 8

    doc.setFontSize(10)
    const summaryData = [
      ["GTN Number:", delivery.delivery_id || "-"],
      ["Source Location:", delivery.source_location_name || "-"],
      ["Destination Store:", delivery.destination_store_name || "-"],
      [
        "Delivery Date:",
        delivery.delivery_date ? formatDate(new Date(delivery.delivery_date), "dd MMM yyyy") : "-",
      ],
    ]

    summaryData.forEach(([label, value]) => {
      doc.text(label, 14, yPosition)
      doc.text(String(value), 100, yPosition)
      yPosition += 6
    })

    yPosition += 8

    // Add rejection info if applicable
    if (isRejected && rejectedReceipt) {
      doc.setFontSize(11)
      doc.setTextColor(180, 0, 0)
      doc.text(`Receipt #${rejectedReceipt.receipt_number} - Rejected`, 14, yPosition)
      yPosition += 6
      doc.setFontSize(9)
      if (rejectedReceipt.rejection_reason) {
        doc.text(`Reason: ${rejectedReceipt.rejection_reason}`, 14, yPosition)
        yPosition += 6
      }
      if (rejectedReceipt.rejection_count > 1) {
        doc.text(`Rejected ${rejectedReceipt.rejection_count} times`, 14, yPosition)
        yPosition += 6
      }
      doc.setTextColor(0, 0, 0)
      yPosition += 4
    }

    autoTable(doc, {
      startY: yPosition,
      head: [
        [
          "Product ID",
          "Product Name",
          "UOM",
          "Expected Qty",
          "Outstanding Qty",
          "Received Qty",
          "Status",
        ],
      ],
      body: lineItems.map(item => {
        const expected = parseFloat(item.quantity_expected || "0")
        const received = parseFloat(item.quantity_received || "0")
        const outstanding = expected - received

        return [
          item.product_id || "-",
          item.product_name || "-",
          item.unit_of_measurement || "-",
          formatQty(expected),
          formatQty(outstanding),
          formatQty(received),
          outstanding <= 0 ? "Complete" : received > 0 ? "Partial" : "Pending",
        ]
      }),
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [3, 78, 162],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
    })

    doc.save(`GRN-${delivery.delivery_id}.pdf`)
  }

  if (status === "pending") {
    return (
      <div className="space-y-4 p-6">
        <TableSkeleton columns={columns} />
      </div>
    )
  }

  if (status === "error" || !delivery) {
    const { message: errorMessage, isAuthError } = extractErrorInfo(
      error,
      "Failed to load delivery details",
    )

    return (
      <div className="h-full space-y-6 rounded-xl bg-white p-8">
        <div className="flex flex-col items-center justify-center space-y-6 py-16">
          <div className="rounded-full bg-red-100 p-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div className="text-center">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {isAuthError ? "Access Denied" : "Unable to Load Delivery"}
            </h3>
            <p className="mb-6 max-w-md text-sm text-gray-600">{errorMessage}</p>
            <Button onClick={() => router.history.back()} variant="outline">
              <ArrowLeft className="mr-2 size-4" />
              Back to List
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full space-y-6 rounded-xl bg-white p-8">
      <div className="flex items-center justify-between">
        {/* Back Button */}
        <Button variant="ghost" size="sm" onClick={() => router.history.back()} className="mb-4">
          <ArrowLeft className="size-4" />
          Back to List
        </Button>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={isUpdating}>
                <X className="size-4" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={isUpdating}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                {isUpdating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                {isUpdating ? "Saving..." : "Save & Resubmit"}
              </Button>
            </>
          ) : (
            <>
              {/* <Button onClick={handleRefresh}>Refresh</Button> */}
              {showEditButton && (
                <Button size="sm" variant="outline" onClick={handleStartEdit}>
                  <Edit className="size-4" />
                  Edit
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={handlePrint}>
                <Printer className="size-4" />
                Print
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleDownload(delivery)}>
                <Download className="size-4" />
                Download
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grn-receipt">
        {/* Header Section with Logo and Company Info */}
        <div className="space-y-6 border-b border-gray-200 pb-6">
          {/* Company Header */}
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <img src={COMPANY_LOGO_SMALL} alt="Company Logo" />
            </div>
            <h2 className="text-primary text-xl font-bold">{COMPANY_NAME}</h2>
            <p className="text-sm text-gray-600">{COMPANY_ADDRESS}</p>
            <p className="text-sm text-gray-600">Tel: {COMPANY_PHONE}</p>
          </div>

          {/* GRN Summary Table */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 print:grid-cols-2">
            {/* Left Column - GRN Summary */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">GRN Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">GRN Number:</span>
                  <span className="font-semibold text-gray-900">{delivery.delivery_id || "-"}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Source Location:</span>
                  <span className="font-semibold text-gray-900">
                    {delivery.source_location_name || "-"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">Destination Store:</span>
                  <span className="font-semibold text-gray-900">
                    {delivery.destination_store_name || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Date:</span>
                  <span className="font-semibold text-gray-900">
                    {delivery.delivery_date
                      ? formatDate(new Date(delivery.delivery_date), "dd MMM yyyy")
                      : "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Quantity Summary */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Quantity Summary</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-blue-50 p-3 text-center">
                  <p className="text-xs font-medium text-gray-600">Expected</p>
                  <p className="mt-1 text-lg font-bold text-blue-600">
                    {formatQty(delivery.total_quantity_expected)}
                  </p>
                </div>
                <div className="rounded-lg bg-green-50 p-3 text-center">
                  <p className="text-xs font-medium text-gray-600">Received</p>
                  <p className="mt-1 text-lg font-bold text-green-600">
                    {formatQty(delivery.total_quantity_received)}
                  </p>
                </div>
                <div className="rounded-lg bg-yellow-50 p-3 text-center">
                  <p className="text-xs font-medium text-gray-600">Outstanding</p>
                  <p className="mt-1 text-lg font-bold text-yellow-600">
                    {formatQty(
                      (delivery.total_quantity_expected || 0) -
                        (delivery.total_quantity_received || 0),
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rejection Banner */}
        {isRejected && rejectedReceipt && !isEditing && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Receipt Rejected</h3>
                <p className="mt-1 text-sm text-red-800">
                  Receipt #{rejectedReceipt.receipt_number} was rejected
                  {rejectedReceipt.rejection_reason && (
                    <span>
                      : <em>{rejectedReceipt.rejection_reason}</em>
                    </span>
                  )}
                </p>
                {rejectedReceipt.rejection_count > 1 && (
                  <p className="mt-1 text-xs text-red-600">
                    This receipt has been rejected {rejectedReceipt.rejection_count} times
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Line Items Table */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="flex items-center text-lg font-semibold text-gray-900">
              <Package className="mr-2 size-5" />
              Line Items ({lineItems.length} item{lineItems.length === 1 ? "" : "s"})
              {isEditing && rejectedReceipt && (
                <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                  Editing Receipt #{rejectedReceipt.receipt_number}
                </span>
              )}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id} className="bg-gray-50 hover:bg-gray-50">
                    {headerGroup.headers.map(header => (
                      <TableHead
                        key={header.id}
                        className="px-6 py-3 text-xs font-medium uppercase"
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
                    <TableRow
                      key={row.id}
                      className={isEditing ? "bg-amber-50/50" : "hover:bg-gray-50"}
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id} className="px-6 py-4">
                          {isEditing && cell.column.id === "quantity_received" ? (
                            <input
                              type="text"
                              placeholder="0"
                              value={editedQuantities[row.original.id] ?? ""}
                              onChange={e => handleQuantityChange(row.original.id, e.target.value)}
                              className="w-24 rounded-md border border-gray-300 px-2 py-1 font-mono text-sm font-semibold text-green-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                          ) : (
                            flexRender(cell.column.columnDef.cell, cell.getContext())
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No line items available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Edit Notes */}
        {isEditing && (
          <div className="mt-4 space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <label htmlFor="edit-notes" className="text-sm font-medium text-gray-900">
              Notes (reason for update)
            </label>
            <textarea
              id="edit-notes"
              value={editNotes}
              onChange={e => setEditNotes(e.target.value)}
              placeholder="Describe the changes made to the received quantities..."
              className="w-full resize-none rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>
        )}
      </div>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Receipt Updated Successfully</AlertDialogTitle>
            <AlertDialogDescription>
              Your updated receipt has been resubmitted for approval. Kindly await confirmation from
              the Supply Chain Department (SCD).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end">
            <AlertDialogAction
              onClick={() => {
                setShowSuccessDialog(false)
                navigate({ to: "/grn-history" })
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Done
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
