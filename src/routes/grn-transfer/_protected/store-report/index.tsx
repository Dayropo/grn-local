import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/grn-transfer/_protected/store-report/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/grn-transfer/_protected/store-report/"!</div>
}
