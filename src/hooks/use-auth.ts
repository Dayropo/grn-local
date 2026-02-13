import { useMsal, useIsAuthenticated } from "@azure/msal-react"
import { InteractionRequiredAuthError } from "@azure/msal-browser"
import { loginScopes, extractRoles } from "@/lib/api/auth"

export function useAuth() {
  const { instance, accounts } = useMsal()
  const isAuthenticated = useIsAuthenticated()

  const getAccessToken = async (scopes?: string[]) => {
    const account = accounts[0]

    if (!account) throw new Error("No active account")

    try {
      const response = await instance.acquireTokenSilent({
        scopes: scopes ?? loginScopes,
        account,
      })

      localStorage.setItem("accessToken", response.accessToken)
      localStorage.setItem("roles", JSON.stringify(extractRoles(response.accessToken)))

      return response.accessToken
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        const response = await instance.acquireTokenPopup({
          scopes: scopes ?? loginScopes,
          account,
        })

        localStorage.setItem("accessToken", response.accessToken)
        localStorage.setItem("roles", JSON.stringify(extractRoles(response.accessToken)))

        return response.accessToken
      }
      throw error
    }
  }

  const getRoles = (): string[] => {
    try {
      const roles = localStorage.getItem("roles")
      return roles ? JSON.parse(roles) : []
    } catch {
      return []
    }
  }

  return {
    isAuthenticated,
    user: accounts[0],
    getAccessToken,
    getRoles,
  }
}
