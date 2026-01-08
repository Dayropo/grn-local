import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/direct-supply/egrn-report/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected/direct-supply/egrn-report/"!</div>
}
