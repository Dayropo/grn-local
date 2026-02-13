import { createFileRoute } from "@tanstack/react-router"
import { useState, useCallback } from "react"
import { toast } from "sonner"
import { useSearchDeliveriesMutation, useExportDeliveryMutation } from "@/lib/api/transfers"
import { ViewGrnSearchForm } from "@/components/view-grn-search-form"
import { ViewGrnListView } from "@/components/view-grn-list-view"
import { ViewGrnDetailView } from "@/components/view-grn-detail-view"

export const Route = createFileRoute("/grn-transfer/_protected/view-grn/search/")({
  component: SearchDeliveriesPage,
})

type ViewState = "search" | "list" | "detail"

function SearchDeliveriesPage() {
  const [currentView, setCurrentView] = useState<ViewState>("search")
  const [results, setResults] = useState<IDelivery[]>([])
  const [selectedGrn, setSelectedGrn] = useState<IDelivery | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { mutate: searchDeliveries, isPending } = useSearchDeliveriesMutation()
  const { mutate: exportDeliveries, isPending: isExporting } = useExportDeliveryMutation()
  const [lastFilters, setLastFilters] = useState<Record<string, any>>({})

  const handleSearch = useCallback(
    (filters: {
      deliveryId?: number
      sourceLocationName?: string
      destinationStore?: string
      deliveryDate?: string
      deliveryStatusCode?: string
    }) => {
      setError(null)
      const params = {
        deliveryId: filters.deliveryId,
        source_location_name: filters.sourceLocationName,
        destination_store: filters.destinationStore,
        delivery_date: filters.deliveryDate,
        delivery_status_code: filters.deliveryStatusCode,
      }
      setLastFilters(params)
      searchDeliveries(params, {
        onSuccess: data => {
          if (data.results.length === 0) {
            setError("No GRNs found matching your criteria")
            setResults([])
            setCurrentView("search")
          } else {
            setResults(data.results)
            setCurrentView("list")
          }
        },
        onError: () => {
          setError("Failed to search GRNs")
          toast.error("Failed to search GRNs")
        },
      })
    },
    [searchDeliveries],
  )

  const handleSelectGrn = useCallback((grn: IDelivery) => {
    setSelectedGrn(grn)
    setCurrentView("detail")
  }, [])

  const handleBackToList = useCallback(() => {
    setCurrentView("list")
  }, [])

  const handleBackToSearch = useCallback(() => {
    setCurrentView("search")
    setResults([])
    setSelectedGrn(null)
  }, [])

  const handleExport = useCallback(() => {
    exportDeliveries(
      {
        source_location_name: lastFilters.source_location_name,
        destination_store: lastFilters.destination_store,
        delivery_date: lastFilters.delivery_date,
        delivery_status_code: lastFilters.delivery_status_code,
        delivery_id: lastFilters.deliveryId,
      },
      {
        onSuccess: data => {
          const url = data.download_url
          if (url) {
            const a = document.createElement("a")
            a.href = url
            a.download = ""
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
          }

          toast.success("Deliveries exported successfully")
        },
        onError: () => {
          toast.error("Unable to export deliveries. Please try again later.")
        },
      },
    )
  }, [exportDeliveries, lastFilters])

  return (
    <div className="space-y-6">
      {currentView === "search" && (
        <ViewGrnSearchForm onSubmit={handleSearch} isLoading={isPending} error={error} />
      )}

      {currentView === "list" && (
        <ViewGrnListView
          results={results}
          onSelectGrn={handleSelectGrn}
          onBackToSearch={handleBackToSearch}
          onExport={handleExport}
          isExporting={isExporting}
        />
      )}

      {currentView === "detail" && selectedGrn && (
        <ViewGrnDetailView
          grn={selectedGrn}
          receiptId={selectedGrn.receipts?.find(r => r.approval_status === "receipt_submitted")?.id}
          onBackToList={handleBackToList}
        />
      )}
    </div>
  )
}
