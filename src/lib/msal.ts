import { PublicClientApplication, LogLevel, type Configuration } from "@azure/msal-browser"

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID,
    authority: import.meta.env.VITE_AUTHORITY,
    redirectUri: import.meta.env.VITE_REDIRECT_URI,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return
        }

        switch (level) {
          case LogLevel.Error:
            console.error(message)
            return
          case LogLevel.Info:
            console.info(message)
            return
          case LogLevel.Warning:
            console.warn(message)
            return
          case LogLevel.Verbose:
            console.debug(message)
            return
          default:
            console.log(message)
            return
        }
      },
    },
  },
}

export const msalInstance = new PublicClientApplication(msalConfig)
