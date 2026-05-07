import { Button } from "@/components/ui/button"
import { Search, Loader2, Package, AlertCircle } from "lucide-react"
import React, { useMemo, useCallback, useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ColumnDef } from "@tanstack/react-table"
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { cn, formatQty } from "@/lib/utils"

const searchFormSchema = z.object({
  deliveryId: z.string().min(1, "Delivery ID is required"),
})

type SearchFormValues = z.infer<typeof searchFormSchema>

export interface ReceiptFormValues {
  lineItems: Record<string, string>
  notes: string
}

export interface ReceiptFormDataSubmitted {
  lineItems: Record<string, number>
  notes: string
}

export interface ConfirmViewProps {
  isLoading: boolean
  results: IDelivery[]
  onSubmit: (values: SearchFormValues) => void
  onBackToSearch: () => void
  onPreviewDelivery?: (delivery: IDelivery, formData: ReceiptFormDataSubmitted) => void
}

export const CreateGrnConfirmView: React.FC<ConfirmViewProps> = ({
  isLoading,
  results,
  onSubmit,
  onBackToSearch,
  onPreviewDelivery,
}) => {
  const searchForm = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      deliveryId: "",
    },
  })

  const delivery = results?.[0]

  const receiptForm = useForm<ReceiptFormValues>({
    defaultValues: {
      lineItems: {},
      notes: "",
    },
  })

  const [hasLineItemValues, setHasLineItemValues] = useState(false)
  const [hasExceedingValues, setHasExceedingValues] = useState(false)

  const lineItemColumns: ColumnDef<IDeliveryLineItem>[] = useMemo(
    () => [
      {
        accessorKey: "product_id",
        header: "Product ID",
        cell: ({ row }) => (
          <div className="font-mono text-sm">{row.original.product_id || "-"}</div>
        ),
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
        accessorKey: "quantity_outstanding",
        header: "Outstanding Qty",
        cell: ({ row }) => (
          <div className="font-mono text-sm font-semibold text-orange-600">
            {formatQty(row.original.quantity_outstanding)}
          </div>
        ),
      },
      {
        accessorKey: "quantity_received",
        header: "Received Qty",
        cell: ({ row }) => (
          <FormField
            control={receiptForm.control}
            name={`lineItems.${row.original.product_id}`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="0"
                    className={cn(
                      "h-9 w-24",
                      field.value &&
                        parseFloat(field.value) > (row.original.quantity_outstanding || 0) &&
                        "border-red-500 focus-visible:ring-red-500",
                    )}
                    disabled={row.original.is_fully_received}
                    {...field}
                    onChange={event => {
                      let value = event.target.value.replace(/[^0-9.]/g, "")
                      const parts = value.split(".")
                      if (parts.length > 2) {
                        value = parts[0] + "." + parts.slice(1).join("")
                      }
                      field.onChange(value)
                    }}
                  />
                </FormControl>
                {field.value &&
                  parseFloat(field.value) > (row.original.quantity_outstanding || 0) && (
                    <p className="text-xs text-red-500">Exceeds outstanding</p>
                  )}
                <FormMessage />
              </FormItem>
            )}
          />
        ),
      },
    ],
    [receiptForm.control],
  )

  const table = useReactTable({
    data: delivery?.line_items || [],
    columns: lineItemColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  useEffect(() => {
    const subscription = receiptForm.watch(data => {
      const lineItems = data.lineItems || {}
      const editableItems = delivery?.line_items?.filter(item => !item.is_fully_received) || []
      const editableCount = editableItems.length
      const filledItemCount = editableItems.filter(item => {
        const value = lineItems[item.product_id]
        return value !== undefined && value.toString().trim() !== ""
      }).length
      setHasLineItemValues(editableCount > 0 && filledItemCount === editableCount)

      const exceeding = editableItems.some(item => {
        const value = lineItems[item.product_id]
        return value && parseFloat(value) > (item.quantity_outstanding || 0)
      })
      setHasExceedingValues(exceeding)
    })
    return () => subscription.unsubscribe()
  }, [receiptForm, delivery?.line_items])

  const handlePreview = (data: ReceiptFormValues) => {
    if (delivery) {
      const submittedData: ReceiptFormDataSubmitted = {
        lineItems: Object.entries(data.lineItems).reduce(
          (acc, [key, value]) => {
            const parsed = parseFloat(value)
            acc[key] = isNaN(parsed) ? 0 : parsed
            return acc
          },
          {} as Record<string, number>,
        ),
        notes: data.notes,
      }
      onPreviewDelivery?.(delivery, submittedData)
    }
  }

  if (!delivery) {
    return (
      <div className="space-y-6 rounded-xl bg-white p-6">
        {/* Search Section */}
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button variant="outline" onClick={onBackToSearch} className="mr-auto">
            Back to Search
          </Button>
          <Form {...searchForm}>
            <form
              onSubmit={searchForm.handleSubmit(onSubmit)}
              className="flex w-full max-w-lg items-end gap-2"
            >
              <FormField
                control={searchForm.control}
                name="deliveryId"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Enter Delivery ID..."
                        disabled={isLoading}
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isLoading || !searchForm.watch("deliveryId").trim()}
                className="h-10"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 py-16">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-blue-100 p-4">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">No Delivery Found</h3>
            <p className="mb-6 text-sm text-gray-600">
              No delivery details were found for the ID you searched. Please try another delivery ID
              or go back to search.
            </p>
            <Button onClick={onBackToSearch} variant="outline">
              Back to Search
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 rounded-xl bg-white p-6">
      {/* Search Section */}
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Button variant="outline" onClick={onBackToSearch} className="mr-auto">
          Back to Search
        </Button>
        <Form {...searchForm}>
          <form
            onSubmit={searchForm.handleSubmit(onSubmit)}
            className="flex w-full max-w-lg items-end gap-2"
          >
            <FormField
              control={searchForm.control}
              name="deliveryId"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      placeholder="Enter Delivery ID..."
                      disabled={isLoading}
                      className="h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isLoading || !searchForm.watch("deliveryId").trim()}
              className="h-10"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>

      {/* Header Section */}
      <div className="bg-primary flex items-center justify-between rounded-lg p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-white/20 p-3">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Confirm Goods Received</h2>
            <p className="text-sm text-blue-100">
              GTN ID: {delivery.delivery_id} • From: {delivery.source_location_name}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-blue-100">Status</p>
          <p className="font-semibold">{delivery.delivery_status}</p>
          <p className="mt-2 text-sm text-blue-100">Sales Order: {delivery.delivery_id}</p>
        </div>
      </div>

      {/* Info Message */}
      <div className="bg-primary/10 text-primary flex gap-3 rounded-lg p-4">
        <AlertCircle className="text-primary h-5 w-5 flex-shrink-0" />
        <p className="text-sm">
          Enter the quantity received for each item below. Only numbers and decimals are allowed.
          Items already fully received are marked as completed.
        </p>
      </div>

      {/* Pending Approval Warning */}
      {delivery.has_pending_approval && (
        <div className="flex gap-3 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            This delivery has a receipt pending approval. You cannot create a new receipt until the
            pending receipt has been approved or rejected.
          </p>
        </div>
      )}

      {/* Receipt Form */}
      <Form {...receiptForm}>
        <form onSubmit={receiptForm.handleSubmit(handlePreview)} className="space-y-6">
          {/* Line Items Table */}
          <div className="space-y-4">
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
                  {table.getRowModel().rows.map(row => (
                    <TableRow key={row.id} className="border-b border-gray-200 hover:bg-gray-50">
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id} className="px-6 py-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-3">
            <FormField
              control={receiptForm.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <label className="block text-sm font-semibold text-gray-900">
                    General Notes (Optional)
                  </label>
                  <FormControl>
                    <textarea
                      placeholder="Add any general notes about this delivery..."
                      className="w-full resize-none rounded-lg border border-gray-300 p-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Preview Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!hasLineItemValues || hasExceedingValues || delivery.has_pending_approval}
            >
              Preview GRN
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
