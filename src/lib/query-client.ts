import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes("Network")) {
          return failureCount < 3
        }
        return false
      },
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      gcTime: 10 * 60 * 1000,
      throwOnError: false,
    },
    mutations: {
      retry: false,
      throwOnError: false,
      onError: (error: Error) => {
        console.error("Mutation error:", error)
      },
    },
  },
})
