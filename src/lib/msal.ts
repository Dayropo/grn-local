import { PublicClientApplication, type Configuration } from "@azure/msal-browser"

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID,
    authority: import.meta.env.VITE_MSAL_AUTHORITY,
    redirectUri: import.meta.env.VITE_MSAL_REDIRECT_URI,
    postLogoutRedirectUri: import.meta.env.VITE_MSAL_POST_LOGOUT_REDIRECT_URI,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
}

let _instance: PublicClientApplication | null = null

export function getMsalInstance() {
  if (!_instance) {
    _instance = new PublicClientApplication(msalConfig)
  }
  return _instance
}
