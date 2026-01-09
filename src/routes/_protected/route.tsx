import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { getMsalInstance } from "@/lib/msal"
import { SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "@/layout/app-sidebar"
import Header from "@/layout/header"

export const Route = createFileRoute("/_protected")({
  beforeLoad: async () => {
    const msalInstance = getMsalInstance()
    const accounts = msalInstance.getAllAccounts()
    const isAuthenticated = accounts.length > 0

    if (!isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: window.location.pathname,
        },
      })
    }
  },
  component: ProtectedLayout,
})

function ProtectedLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <div className="flex flex-1 flex-col">
        <Header />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  )
}
