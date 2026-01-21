import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/direct-supply/grn-history/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected/direct-supply/store-history/"!</div>
}
