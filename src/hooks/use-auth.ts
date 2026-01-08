import { useMsal, useIsAuthenticated } from "@azure/msal-react"
import { InteractionRequiredAuthError } from "@azure/msal-browser"

export function useAuth() {
  const { instance, accounts } = useMsal()
  const isAuthenticated = useIsAuthenticated()

  const getAccessToken = async (scopes: string[]) => {
    const account = accounts[0]

    if (!account) throw new Error("No active account")

    try {
      const response = await instance.acquireTokenSilent({
        scopes,
        account,
      })
      return response.accessToken
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        const response = await instance.acquireTokenPopup({
          scopes,
          account,
        })
        return response.accessToken
      }
      throw error
    }
  }

  return {
    isAuthenticated,
    user: accounts[0],
    getAccessToken,
  }
}
