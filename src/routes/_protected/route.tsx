import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { getMsalInstance } from "@/lib/msal"
import { SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "@/layout/app-sidebar"
import Header from "@/layout/header"

export const Route = createFileRoute("/_protected")({
  beforeLoad: async () => {
    const msalInstance = getMsalInstance()
    
    try {
      await msalInstance.initialize()
      const redirectResponse = await msalInstance.handleRedirectPromise()
      
      if (redirectResponse) {
        msalInstance.setActiveAccount(redirectResponse.account)
      }
      
      const accounts = msalInstance.getAllAccounts()
      
      if (accounts.length > 0 && !msalInstance.getActiveAccount()) {
        msalInstance.setActiveAccount(accounts[0])
      }
      
      const activeAccount = msalInstance.getActiveAccount()
      const isAuthenticated = activeAccount !== null
      
      if (!isAuthenticated) {
        console.warn("No active account found, redirecting to login")
        throw redirect({
          to: "/",
          search: {
            redirect: window.location.pathname,
          },
        })
      }
    } catch (error) {
      console.error("Auth check error:", error)
      throw redirect({
        to: "/",
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
