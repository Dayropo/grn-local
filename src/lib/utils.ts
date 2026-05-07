import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatQty(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "0"
  const num = typeof value === "number" ? value : parseFloat(value)
  if (isNaN(num)) return "0"
  // Round to 8 decimal places to strip float artifacts, then strip trailing zeros
  return parseFloat(num.toFixed(8)).toString()
}

export function formatMonetaryValue(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export interface ErrorInfo {
  message: string
  isAuthError: boolean
  statusCode?: number
}

export function extractErrorInfo(error: unknown, defaultMessage = "An error occurred"): ErrorInfo {
  const result: ErrorInfo = {
    message: defaultMessage,
    isAuthError: false,
  }

  if (error instanceof Error) {
    const axiosError = error as any

    if (axiosError.response?.status === 403) {
      result.statusCode = 403
      result.isAuthError = true
      result.message =
        axiosError.response?.data?.message || "You are not authorized to access this resource"
    } else if (axiosError.response?.status === 401) {
      result.statusCode = 401
      result.isAuthError = true
      result.message = axiosError.response?.data?.message || "Authentication required"
    } else if (axiosError.response?.data?.data) {
      result.statusCode = axiosError.response?.status
      const errorData = axiosError.response.data.data
      if (typeof errorData === "object" && !Array.isArray(errorData)) {
        const errorMessages = Object.entries(errorData)
          .flatMap(([, value]) => (Array.isArray(value) ? value : [value]))
          .filter((msg): msg is string => typeof msg === "string")
        result.message =
          errorMessages.length > 0
            ? errorMessages.join(", ")
            : axiosError.response.data.message || defaultMessage
      } else {
        result.message = axiosError.response.data.message || defaultMessage
      }
    } else if (axiosError.response?.data?.message) {
      result.statusCode = axiosError.response?.status
      result.message = axiosError.response.data.message
    } else if (axiosError.message) {
      result.message = axiosError.message
    }
  }

  return result
}

export const getStatusBadgeColor = (status: string) => {
  if (!status) return "bg-gray-100 text-gray-800"
  const normalized = status.trim().toLowerCase()
  switch (normalized) {
    case "open":
      return "bg-blue-100 text-blue-800"
    case "complete":
    case "completed":
      return "bg-green-100 text-green-800"
    case "partial":
      return "bg-yellow-100 text-yellow-800"
    case "closed":
      return "bg-gray-300 text-gray-700"
    case "pending":
      return "bg-red-100 text-red-800"
    case "cancelled":
      return "bg-gray-200 text-gray-500"
    case "in transit":
      return "bg-purple-100 text-purple-800"
    case "processing":
    case "in process":
      return "bg-orange-100 text-orange-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}
