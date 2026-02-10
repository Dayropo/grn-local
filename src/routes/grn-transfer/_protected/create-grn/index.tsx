import { createFileRoute } from "@tanstack/react-router"
import { useState, useCallback } from "react"
import { toast } from "sonner"
import { useFetchDeliveryMutation } from "@/lib/api/transfers"
import { CreateGrnSearchForm } from "@/components/create-grn-search-form"
import { CreateGrnConfirmView } from "@/components/create-grn-confirm-view"
import { CreateGrnPreviewView, type ReceiptFormData } from "@/components/create-grn-preview-view"
import { CreateGrnErrorDialog } from "@/components/create-grn-error-dialog"
import { CreateGrnLoadingDialog } from "@/components/create-grn-loading-dialog"
import { extractErrorInfo } from "@/lib/utils"

export const Route = createFileRoute("/grn-transfer/_protected/create-grn/")({
  component: CreateGrn,
})

export type ViewState = "search" | "confirm" | "preview"

function CreateGrn() {
  const [currentView, setCurrentView] = useState<ViewState>("search")
  const [results, setResults] = useState<IDelivery[]>([])
  const [selectedDelivery, setSelectedDelivery] = useState<IDelivery | null>(null)
  const [formData, setFormData] = useState<ReceiptFormData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastDeliveryId, setLastDeliveryId] = useState<string>("")

  const { mutate: fetchDelivery, isPending: isFetchingDelivery } = useFetchDeliveryMutation()

  const handleSearch = useCallback(
    (values: { deliveryId: string }) => {
      const id = values.deliveryId.trim()

      if (!id) {
        toast.error("Please enter a Delivery ID to search")
        return
      }

      setLastDeliveryId(id)
      setError(null)

      fetchDelivery(
        { deliveryId: id },
        {
          onSuccess: (data: IDelivery) => {
            setResults([data])
            setCurrentView("confirm")
            toast.success("Delivery details loaded successfully")
          },
          onError: error => {
            const errorMessage =
              extractErrorInfo(error).message || "Failed to fetch delivery details"
            setError(errorMessage)
            toast.error(errorMessage)
          },
        },
      )
    },
    [fetchDelivery],
  )

  const handleRetry = useCallback(() => {
    if (lastDeliveryId) {
      handleSearch({ deliveryId: lastDeliveryId })
    }
  }, [lastDeliveryId, handleSearch])

  const handleNewSearch = useCallback(() => {
    setCurrentView("search")
    setError(null)
    setResults([])
    setLastDeliveryId("")
  }, [])

  const handleCloseError = useCallback(() => {
    setError(null)
  }, [])

  const handleBackToSearch = useCallback(() => {
    setCurrentView("search")
    setSelectedDelivery(null)
  }, [])

  const handlePreviewDelivery = useCallback((delivery: IDelivery, data: ReceiptFormData) => {
    setSelectedDelivery(delivery)
    setFormData(data)
    setCurrentView("preview")
  }, [])

  const handleBackToConfirm = useCallback(() => {
    setCurrentView("confirm")
    setSelectedDelivery(null)
  }, [])

  return (
    <div className="h-full">
      {currentView === "search" && (
        <CreateGrnSearchForm isLoading={isFetchingDelivery} onSubmit={handleSearch} />
      )}

      {currentView === "confirm" && (
        <CreateGrnConfirmView
          isLoading={isFetchingDelivery}
          results={results}
          onSubmit={handleSearch}
          onBackToSearch={handleBackToSearch}
          onPreviewDelivery={handlePreviewDelivery}
        />
      )}

      {currentView === "preview" && selectedDelivery && formData && (
        <CreateGrnPreviewView
          delivery={selectedDelivery}
          formData={formData}
          onBackToConfirm={handleBackToConfirm}
        />
      )}

      <CreateGrnLoadingDialog open={isFetchingDelivery} deliveryId={lastDeliveryId} />
      <CreateGrnErrorDialog
        open={!!error}
        error={error}
        onRetry={handleRetry}
        onNewSearch={handleNewSearch}
        onClose={handleCloseError}
      />
    </div>
  )
}
