import axios from "axios"
import { getMsalInstance } from "@/lib/msal"
import { InteractionRequiredAuthError } from "@azure/msal-browser"
import { loginScopes, extractRoles } from "@/lib/api/auth"

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

axiosInstance.interceptors.request.use(
  async config => {
    const msalInstance = getMsalInstance()
    await msalInstance.initialize()
    const accounts = msalInstance.getAllAccounts()
    if (accounts.length === 0) {
      console.warn("No MSAL accounts found - request will be sent without Authorization header")
      return config
    }

    const account = accounts[0]

    try {
      const response = await msalInstance.acquireTokenSilent({
        scopes: loginScopes,
        account,
      })

      localStorage.setItem("accessToken", response.accessToken)
      localStorage.setItem("roles", JSON.stringify(extractRoles(response.accessToken)))

      config.headers.Authorization = `Bearer ${response.accessToken}`
    } catch (error) {
      console.error("Failed to acquire token silently:", error)
      if (error instanceof InteractionRequiredAuthError) {
        try {
          const response = await msalInstance.acquireTokenPopup({
            scopes: loginScopes,
            account,
          })

          localStorage.setItem("accessToken", response.accessToken)
          localStorage.setItem("roles", JSON.stringify(extractRoles(response.accessToken)))

          config.headers.Authorization = `Bearer ${response.accessToken}`
        } catch (popupError) {
          console.error("Failed to acquire token via popup:", popupError)
        }
      }
    }

    return config
  },
  error => {
    return Promise.reject(error)
  },
)

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.error("Unauthorized - token may be expired")
    }
    return Promise.reject(error)
  },
)

export default axiosInstance
