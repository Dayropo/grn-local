import { useMutation } from "@tanstack/react-query"
import { getMsalInstance } from "@/lib/msal"

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async () => {
      const msalInstance = getMsalInstance()
      await msalInstance.loginPopup({
        scopes: ["user.read"],
      })
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
    },
  })
}
