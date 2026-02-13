import { createFileRoute } from "@tanstack/react-router"
import { useState, useCallback } from "react"
import { toast } from "sonner"
import { useDeliveriesMutation, useExportDeliveryMutation } from "@/lib/api/transfers"
import { ViewGrnSearchForm } from "@/components/view-grn-search-form"
import { ViewGrnListView } from "@/components/view-grn-list-view"
import { ViewGrnDetailView } from "@/components/view-grn-detail-view"

export const Route = createFileRoute("/_protected/view-grn/search/")({
  component: SearchDeliveriesPage,
})

type ViewState = "search" | "list" | "detail"

function SearchDeliveriesPage() {
  const [currentView, setCurrentView] = useState<ViewState>("search")
  const [selectedGrn, setSelectedGrn] = useState<IDelivery | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [filters, setFilters] = useState<{
    delivery_id?: number
    source_location_name?: string
    destination_store?: string
    delivery_date?: string
    delivery_status_code?: string
  }>({})
  const [results, setResults] = useState<IDelivery[]>([])
  const [totalItems, setTotalItems] = useState(0)

  const { mutate: searchDeliveries, isPending } = useDeliveriesMutation()
  const { mutate: exportDeliveries, isPending: isExporting } = useExportDeliveryMutation()

  const doSearch = useCallback(
    (searchPage: number, searchSize: number, searchFilters: typeof filters) => {
      searchDeliveries(
        {
          page: searchPage,
          size: searchSize,
          delivery_id: searchFilters.delivery_id,
          source_location_name: searchFilters.source_location_name,
          destination_store: searchFilters.destination_store,
          delivery_date: searchFilters.delivery_date,
          delivery_status_code: searchFilters.delivery_status_code,
        },
        {
          onSuccess: data => {
            if (data.results.length === 0 && searchPage === 1) {
              setError("No GRNs found matching your criteria")
              setResults([])
              setTotalItems(0)
              setCurrentView("search")
            } else {
              setResults(data.results)
              setTotalItems(data.count)
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

  const handleSearch = useCallback(
    (searchFilters: {
      deliveryId?: number
      sourceLocationName?: string
      destinationStore?: string
      deliveryDate?: string
      deliveryStatusCode?: string
    }) => {
      setError(null)
      setPage(1)
      const newFilters = {
        delivery_id: searchFilters.deliveryId,
        source_location_name: searchFilters.sourceLocationName,
        destination_store: searchFilters.destinationStore,
        delivery_date: searchFilters.deliveryDate,
        delivery_status_code: searchFilters.deliveryStatusCode,
      }
      setFilters(newFilters)
      doSearch(1, itemsPerPage, newFilters)
    },
    [doSearch, itemsPerPage],
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
    setSelectedGrn(null)
    setResults([])
    setTotalItems(0)
  }, [])

  const handleExport = useCallback(() => {
    exportDeliveries(
      {
        source_location_name: filters.source_location_name,
        destination_store: filters.destination_store,
        delivery_date: filters.delivery_date,
        delivery_status_code: filters.delivery_status_code,
        delivery_id: filters.delivery_id,
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
  }, [exportDeliveries, filters])

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
          isLoading={isPending}
          page={page}
          totalPages={Math.max(1, Math.ceil(totalItems / itemsPerPage))}
          itemsPerPage={itemsPerPage}
          onPageChange={newPage => {
            setPage(newPage)
            doSearch(newPage, itemsPerPage, filters)
          }}
          onItemsPerPageChange={val => {
            setItemsPerPage(val)
            setPage(1)
            doSearch(1, val, filters)
          }}
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
