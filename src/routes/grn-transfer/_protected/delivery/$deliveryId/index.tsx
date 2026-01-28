import { useDeliveryQuery } from "@/lib/api/transfers"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { ArrowLeft, Download, Package, Printer, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { extractErrorInfo } from "@/lib/utils"
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

export const Route = createFileRoute("/grn-transfer/_protected/delivery/$deliveryId/")({
  component: DeliveryDetail,
  loader: async ({ params }) => {
    await queryClient.prefetchQuery({
      queryKey: ["transfers", "deliveries", params.deliveryId],
      queryFn: async () => {
        const { data } = await axiosInstance.get(`/transfers/v1/deliveries/${params.deliveryId}/`)

        return data.data as IDelivery
      },
    })
  },
})

function DeliveryDetail() {
  const { deliveryId } = Route.useParams()
  const router = useRouter()
  const { data: delivery, status, error } = useDeliveryQuery({ deliveryId })

  const lineItems = delivery?.line_items || []

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
      accessorKey: "quantity_expected",
      header: "Expected Qty",
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {parseFloat(row.original.quantity_expected || "0").toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "quantity_received",
      header: "Received Qty",
      cell: ({ row }) => (
        <div className="font-mono text-sm font-semibold text-green-600">
          {parseFloat(row.original.quantity_received || "0").toFixed(2)}
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
        return <div className="font-mono text-sm text-orange-600">{outstanding.toFixed(2)}</div>
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
    doc.text(`Tel: ${COMPANY_PHONE}`, 105, yPosition, { align: "center" })
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

    autoTable(doc, {
      startY: yPosition,
      head: [
        [
          "Product ID",
          "Product Name",
          "UOM",
          "Expected Qty",
          "Received Qty",
          "Outstanding Qty",
          "Status",
        ],
      ],
      body: lineItems.map(item => [
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
                    {delivery.total_quantity_expected || 0}
                  </p>
                </div>
                <div className="rounded-lg bg-green-50 p-3 text-center">
                  <p className="text-xs font-medium text-gray-600">Received</p>
                  <p className="mt-1 text-lg font-bold text-green-600">
                    {delivery.total_quantity_received || 0}
                  </p>
                </div>
                <div className="rounded-lg bg-orange-50 p-3 text-center">
                  <p className="text-xs font-medium text-gray-600">Outstanding</p>
                  <p className="mt-1 text-lg font-bold text-orange-600">
                    {(delivery.total_quantity_expected || 0) -
                      (delivery.total_quantity_received || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="flex items-center text-lg font-semibold text-gray-900">
              <Package className="mr-2 size-5" />
              Line Items ({lineItems.length} item{lineItems.length === 1 ? "" : "s"})
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
      </div>
    </div>
  )
}
