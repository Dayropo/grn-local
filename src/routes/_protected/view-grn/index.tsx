import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_protected/view-grn/")({
  beforeLoad: () => {
    throw redirect({
      to: "/view-grn/pending-approvals",
    })
  },
})
