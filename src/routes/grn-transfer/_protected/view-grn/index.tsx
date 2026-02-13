import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/grn-transfer/_protected/view-grn/")({
  beforeLoad: () => {
    throw redirect({
      to: "/grn-transfer/view-grn/pending-approvals",
    })
  },
})
