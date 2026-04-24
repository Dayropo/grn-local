import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { routeTree } from "@/routeTree.gen"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/query-client"
import "./index.css"
import { MsalProvider } from "@azure/msal-react"
import { getMsalInstance } from "@/lib/msal"
import { Toaster } from "sonner"
import { CircleAlert, CircleCheck, CircleX } from "lucide-react"

const router = createRouter({
  routeTree,
  basepath: "/grn-transfer",
  context: {
    queryClient,
  },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const msalInstance = getMsalInstance()
await msalInstance.initialize()
await msalInstance.handleRedirectPromise()

const accounts = msalInstance.getAllAccounts()
if (accounts.length > 0 && !msalInstance.getActiveAccount()) {
  msalInstance.setActiveAccount(accounts[0])
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster
          richColors
          icons={{
            success: <CircleCheck fill="green" stroke="white" />,
            info: <CircleAlert fill="blue" stroke="white" />,
            warning: <CircleAlert fill="yellow" stroke="white" />,
            error: <CircleX fill="red" stroke="white" />,
          }}
          className="group text-sm font-semibold capitalize"
        />
      </QueryClientProvider>
    </MsalProvider>
  </StrictMode>,
)
