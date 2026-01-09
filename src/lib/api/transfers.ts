import axiosInstance from "@/lib/axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

interface CreateDeliveryReceiptPayload {
  delivery: number
  line_items: Array<{
    delivery_line_item: number
    quantity_received: string
  }>
  notes: string
}

// GET /transfers/v1/deliveries/
export const useDeliveriesQuery = ({ page, size }: { page: number; size: number }) => {
  return useQuery({
    queryKey: ["transfers", "deliveries"],
    queryFn: async () => {
      const params = new URLSearchParams()

      params.append("page", page.toString())
      params.append("size", size.toString())

      const { data } = await axiosInstance.get("/transfers/v1/deliveries", {
        params,
      })

      return data
    },
  })
}

// GET /transfers/v1/deliveries/{deliveryId}/
export const useDeliveryQuery = ({ deliveryId }: { deliveryId: string }) => {
  return useQuery({
    queryKey: ["transfers", "deliveries", deliveryId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/transfers/v1/deliveries/${deliveryId}`)

      return data
    },
    enabled: !!deliveryId,
  })
}

// GET /transfers/v1/search/?delivery_id=44415
export const useSearchDeliveriesQuery = ({ deliveryId }: { deliveryId: number }) => {
  return useQuery({
    queryKey: ["transfers", "deliveries", deliveryId, "search"],
    queryFn: async () => {
      const params = new URLSearchParams()

      params.append("delivery_id", deliveryId.toString())

      const { data } = await axiosInstance.get(`/transfers/v1/search/`, {
        params,
      })

      return data
    },
    enabled: !!deliveryId,
  })
}

// POST /transfers/v1/deliveries/receive
export const useCreateDeliveryReceiptMutation = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateDeliveryReceiptPayload) => {
      const { data } = await axiosInstance.post("/transfers/v1/deliveries/receive", payload)

      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transfers", "deliveries"], type: "all" })
    },
  })
}
