import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
    } else if (axiosError.response?.data?.message) {
      result.statusCode = axiosError.response?.status
      result.message = axiosError.response.data.message
    } else if (axiosError.message) {
      result.message = axiosError.message
    }
  }

  return result
}
