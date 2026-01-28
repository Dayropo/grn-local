import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { getMsalInstance } from "@/lib/msal"
import { SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "@/layout/app-sidebar"
import Header from "@/layout/header"

export const Route = createFileRoute("/grn-transfer/_protected")({
  beforeLoad: async () => {
    const msalInstance = getMsalInstance()
    const accounts = msalInstance.getAllAccounts()
    const isAuthenticated = accounts.length > 0

    if (!isAuthenticated) {
      throw redirect({
        to: "/grn-transfer",
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

      <div className="flex w-full grow flex-col md:w-[calc(100%-var(--sidebar-width))]">
        <Header />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  )
}
