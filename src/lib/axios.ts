import axios from "axios"
import { msalInstance } from "@/lib/msal"
import { InteractionRequiredAuthError } from "@azure/msal-browser"

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

axiosInstance.interceptors.request.use(
  async config => {
    const accounts = msalInstance.getAllAccounts()
    if (accounts.length === 0) {
      return config
    }

    const account = accounts[0]
    const scopes = [import.meta.env.VITE_API_SCOPE]

    try {
      const response = await msalInstance.acquireTokenSilent({
        scopes,
        account,
      })
      config.headers.Authorization = `Bearer ${response.accessToken}`
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        try {
          const response = await msalInstance.acquireTokenPopup({
            scopes,
            account,
          })
          config.headers.Authorization = `Bearer ${response.accessToken}`
        } catch (popupError) {
          console.error("Failed to acquire token:", popupError)
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
