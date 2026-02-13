import { useMutation } from "@tanstack/react-query"
import { getMsalInstance } from "@/lib/msal"
import { jwtDecode } from "jwt-decode"

const scope = import.meta.env.VITE_MSAL_SCOPE as string
export const loginScopes = [scope]

export const extractRoles = (token: string): string[] => {
  try {
    const decoded: Record<string, any> = jwtDecode(token)
    return decoded.roles || []
  } catch (error) {
    console.error("Error extracting roles from token:", error)
    return []
  }
}

const storeAuthData = (accessToken: string, roles: string[]) => {
  localStorage.setItem("accessToken", accessToken)
  localStorage.setItem("roles", JSON.stringify(roles))
}

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async () => {
      const msalInstance = getMsalInstance()

      const currentAccounts = msalInstance.getAllAccounts()

      if (currentAccounts && currentAccounts.length === 1) {
        try {
          const silentResponse = await msalInstance.acquireTokenSilent({
            scopes: loginScopes,
            account: currentAccounts[0],
          })
          const roles = extractRoles(silentResponse.accessToken)
          storeAuthData(silentResponse.accessToken, roles)
          return { accessToken: silentResponse.accessToken, roles }
        } catch {
          // Fall through to popup login
        }
      }

      const loginResponse = await msalInstance.loginPopup({
        scopes: loginScopes,
      })

      const roles = extractRoles(loginResponse.accessToken)
      storeAuthData(loginResponse.accessToken, roles)
      return { accessToken: loginResponse.accessToken, roles }
    },
  })
}

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: async () => {
      const msalInstance = getMsalInstance()
      const accounts = msalInstance.getAllAccounts()
      if (accounts.length > 0) {
        await msalInstance.logoutPopup({
          account: accounts[0],
        })
      }
      localStorage.removeItem("accessToken")
      localStorage.removeItem("roles")
    },
  })
}
