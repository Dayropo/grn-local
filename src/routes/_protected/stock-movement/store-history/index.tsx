import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/stock-movement/store-history/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected/stock-movement/store-history/"!</div>
}
