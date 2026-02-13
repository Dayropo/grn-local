import { createFileRoute } from "@tanstack/react-router"
import { usePendingApprovalsQuery } from "@/lib/api/transfers"
import { PendingApprovalsView } from "@/components/pending-approvals-view"
import { useCallback, useState } from "react"
import { ViewGrnDetailView } from "@/components/view-grn-detail-view"

export const Route = createFileRoute("/grn-transfer/_protected/view-grn/pending-approvals/")({
  component: PendingApprovalsPage,
})

function PendingApprovalsPage() {
  const { data: pendingApprovals, isLoading } = usePendingApprovalsQuery()
  const [selectedApproval, setSelectedApproval] = useState<IPendingApproval | null>(null)

  const approvalsList = pendingApprovals?.results ?? []

  const handleSelectApproval = useCallback((approval: IPendingApproval) => {
    setSelectedApproval(approval)
  }, [])

  const handleBackToList = useCallback(() => {
    setSelectedApproval(null)
  }, [])

  if (selectedApproval) {
    return (
      <ViewGrnDetailView
        grn={selectedApproval.inbound_delivery}
        receiptId={selectedApproval.id}
        approval={selectedApproval}
        onBackToList={handleBackToList}
      />
    )
  }

  return (
    <PendingApprovalsView
      approvals={approvalsList}
      isLoading={isLoading}
      onSelectApproval={handleSelectApproval}
    />
  )
}
