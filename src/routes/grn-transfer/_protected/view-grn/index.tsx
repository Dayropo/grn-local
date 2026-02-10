import { createFileRoute } from "@tanstack/react-router"
import { useState, useCallback } from "react"
import { toast } from "sonner"
import { useSearchDeliveriesMutation } from "@/lib/api/transfers"
import { ViewGrnSearchForm } from "@/components/view-grn-search-form"
import { ViewGrnListView } from "@/components/view-grn-list-view"
import { ViewGrnDetailView } from "@/components/view-grn-detail-view"

export const Route = createFileRoute("/grn-transfer/_protected/view-grn/")({
  component: ViewGrn,
})

type ViewState = "search" | "list" | "detail"

function ViewGrn() {
  const [currentView, setCurrentView] = useState<ViewState>("search")
  const [results, setResults] = useState<IDelivery[]>([])
  const [selectedGrn, setSelectedGrn] = useState<IDelivery | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { mutate: searchDeliveries, isPending } = useSearchDeliveriesMutation()

  const handleSearch = useCallback(
    (filters: {
      deliveryId?: number
      sourceLocationName?: string
      destinationStore?: string
      deliveryDate?: string
      deliveryStatusCode?: string
    }) => {
      setError(null)
      searchDeliveries(
        {
          deliveryId: filters.deliveryId,
          source_location_name: filters.sourceLocationName,
          destination_store: filters.destinationStore,
          delivery_date: filters.deliveryDate,
          delivery_status_code: filters.deliveryStatusCode,
        },
        {
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
        },
      )
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
        />
      )}

      {currentView === "detail" && selectedGrn && (
        <ViewGrnDetailView grn={selectedGrn} onBackToList={handleBackToList} />
      )}
    </div>
  )
}
