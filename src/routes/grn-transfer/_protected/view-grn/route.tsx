import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router"
import { usePendingApprovalsQuery } from "@/lib/api/transfers"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClipboardCheck, Search } from "lucide-react"

export const Route = createFileRoute("/grn-transfer/_protected/view-grn")({
  component: ViewGrnLayout,
})

function ViewGrnLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { data: pendingApprovals } = usePendingApprovalsQuery()

  const approvalCount = pendingApprovals?.results?.length ?? 0

  const currentTab = location.pathname.includes("/search") ? "search" : "pending-approvals"

  const handleTabChange = (value: string) => {
    if (value === "pending-approvals") {
      navigate({ to: "/grn-transfer/view-grn/pending-approvals" })
    } else {
      navigate({ to: "/grn-transfer/view-grn/search" })
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="pending-approvals" className="gap-1.5">
            <ClipboardCheck className="size-4" />
            Pending Approvals
            {approvalCount > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                {approvalCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="search" className="gap-1.5">
            <Search className="size-4" />
            Search Deliveries
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Outlet />
    </div>
  )
}
