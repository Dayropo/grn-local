import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Package, Printer } from "lucide-react"
import React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { formatDate } from "date-fns"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { COMPANY_ADDRESS, COMPANY_LOGO_SMALL, COMPANY_NAME, COMPANY_PHONE } from "@/lib/constants"
import {
  useCreateDeliveryReceiptMutation,
  type CreateDeliveryReceiptPayload,
} from "@/lib/api/transfers"
import { toast } from "sonner"
import { extractErrorInfo } from "@/lib/utils"
import { useNavigate } from "@tanstack/react-router"

export interface ReceiptFormData {
  lineItems: Record<string, number>
  notes: string
}

export interface PreviewViewProps {
  delivery: IDelivery
  formData: ReceiptFormData
  onBackToConfirm: () => void
}

export const CreateGrnPreviewView: React.FC<PreviewViewProps> = ({
  delivery,
  formData,
  onBackToConfirm,
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [isConfirmed, setIsConfirmed] = React.useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = React.useState(false)
  const navigate = useNavigate()

  const { mutate: createDeliveryReceipt, isPending: isCreatingDeliveryReceipt } =
    useCreateDeliveryReceiptMutation()

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
          {parseFloat(row.original.quantity_expected || "0").toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "quantity_outstanding",
      header: "Outstanding Qty",
      cell: ({ row }) => (
        <div className="font-mono text-sm font-semibold text-orange-600">
          {(row.original.quantity_outstanding || 0).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "quantity_received",
      header: "Received Qty",
      cell: ({ row }) => {
        const receivedQty =
          formData.lineItems[row.original.product_id] ??
          parseFloat(row.original.quantity_received || "0")
        return (
          <div className="font-mono text-sm font-semibold text-green-600">
            {receivedQty.toFixed(2)}
          </div>
        )
      },
    },
    {
      accessorKey: "is_fully_received",
      header: "Status",
      cell: ({ row }) => {
        const expected = parseFloat(row.original.quantity_expected || "0")
        const received =
          formData.lineItems[row.original.product_id] ??
          parseFloat(row.original.quantity_received || "0")
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
    data: delivery.line_items || [],
    columns: lineItemColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
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
    doc.text(`Tel: ${COMPANY_PHONE}`, 105, yPosition, { align: "center" })
    yPosition += 12

    doc.setFontSize(11)
    doc.text("GRN Summary", 14, yPosition)
    yPosition += 8

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
      body: (delivery.line_items || []).map(item => [
        item.product_id || "-",
        item.product_name || "-",
        item.unit_of_measurement || "-",
        parseFloat(item.quantity_expected || "0").toFixed(2),
        parseFloat(item.quantity_received || "0").toFixed(2),
        item.quantity_outstanding.toFixed(2),
        item.is_fully_received
          ? "Complete"
          : parseFloat(item.quantity_received || "0") > 0
            ? "Partial"
            : "Pending",
      ]),
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

  const handleSubmit = () => {
    if (!isConfirmed) return
    setShowConfirmDialog(true)
  }

  const handleConfirmSubmit = () => {
    const payload: CreateDeliveryReceiptPayload = {
      delivery: delivery.id,
      line_items: (delivery.line_items || [])
        .map(item => ({
          delivery_line_item: item.id,
          quantity_received: formData.lineItems[item.product_id]?.toString(),
        }))
        .filter(item => item.quantity_received && parseFloat(item.quantity_received) > 0),
      notes: formData.notes,
    }

    createDeliveryReceipt(payload, {
      onSuccess: () => {
        setShowConfirmDialog(false)
        setShowSuccessDialog(true)
      },
      onError: error => {
        const { message: errorMessage } = extractErrorInfo(
          error,
          "Failed to create delivery receipt",
        )
        toast.error(errorMessage)
      },
    })
  }

  return (
    <div className="h-full space-y-6 rounded-xl bg-white p-8">
      <div className="flex items-center justify-between">
        {/* Back Button */}
        <Button variant="ghost" size="sm" onClick={onBackToConfirm} className="mb-4">
          <ArrowLeft className="size-4" />
          Back to Confirm
        </Button>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={handlePrint}>
            <Printer className="size-4" />
            Print
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleDownload(delivery)}>
            <Download className="size-4" />
            Download
          </Button>
        </div>
      </div>

      <div className="grn-receipt">
        {/* Header Section with Company Info */}
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
                    {delivery.total_quantity_expected || 0}
                  </p>
                </div>
                <div className="rounded-lg bg-yellow-50 p-3 text-center">
                  <p className="text-xs font-medium text-gray-600">Outstanding</p>
                  <p className="mt-1 text-lg font-bold text-yellow-600">
                    {(
                      (delivery.total_quantity_expected || 0) -
                      Object.values(formData.lineItems).reduce((sum, qty) => sum + qty, 0)
                    ).toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg bg-green-50 p-3 text-center">
                  <p className="text-xs font-medium text-gray-600">Received</p>
                  <p className="mt-1 text-lg font-bold text-green-600">
                    {Object.values(formData.lineItems)
                      .reduce((sum, qty) => sum + qty, 0)
                      .toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Section */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="flex items-center text-lg font-semibold text-gray-900">
              <Package className="mr-2 size-5" />
              Items Received ({delivery.line_items?.length || 0} item
              {delivery.line_items?.length === 1 ? "" : "s"})
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
                    <TableRow key={row.id} className="hover:bg-gray-50">
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id} className="px-6 py-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={lineItemColumns.length}
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
      </div>

      {/* Notes Section */}
      {formData.notes && (
        <div className="space-y-3 border-t border-gray-200 pt-6">
          <h3 className="text-sm font-semibold text-gray-900">General Notes</h3>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm whitespace-pre-wrap text-gray-700">{formData.notes}</p>
          </div>
        </div>
      )}

      {/* Confirmation Section */}
      <div className="space-y-4 border-t border-gray-200 pt-6">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="confirm-transfer"
            checked={isConfirmed}
            onChange={e => setIsConfirmed(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label
            htmlFor="confirm-transfer"
            className="cursor-pointer text-sm font-medium text-gray-900"
          >
            I confirm that all details above are correct and complete
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onBackToConfirm}>
            Back to Edit
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isConfirmed || isCreatingDeliveryReceipt}
            className="bg-green-600 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreatingDeliveryReceipt ? "Creating..." : "Confirm Transfer"}
          </Button>
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Transfer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit this Goods Received Note? Please ensure all details
              are correct before proceeding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSubmit}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirm
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>GRN Submitted Successfully</AlertDialogTitle>
            <AlertDialogDescription>
              Your Goods Received Note has been submitted successfully. Kindly await confirmation
              from the Supply Chain Department (SCD).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end">
            <AlertDialogAction
              onClick={() => {
                setShowSuccessDialog(false)
                navigate({ to: "/grn-transfer/grn-history" })
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
