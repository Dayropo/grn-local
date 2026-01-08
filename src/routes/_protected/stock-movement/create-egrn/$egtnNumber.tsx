import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/stock-movement/create-egrn/$egtnNumber',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected/stock-movement/create-egrn/$egtnNumber"!</div>
}
