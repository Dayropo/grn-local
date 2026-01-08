import { useMutation } from "@tanstack/react-query"
import { msalInstance } from "@/lib/msal"

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async () => {
      await msalInstance.loginPopup({
        scopes: ["user.read"],
      })
    },
  })
}

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: async () => {
      const accounts = msalInstance.getAllAccounts()
      if (accounts.length > 0) {
        await msalInstance.logoutPopup({
          account: accounts[0],
        })
      }
    },
  })
}
