import axiosInstance from "@/lib/axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export interface CreateDeliveryReceiptPayload {
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
    queryKey: ["transfers", "deliveries", page, size],
    queryFn: async () => {
      const params = new URLSearchParams()

      params.append("page", page.toString())
      params.append("size", size.toString())

      const { data } = await axiosInstance.get("/transfers/v1/deliveries/", {
        params,
      })

      return data as IPaginatedResponse<IDelivery>
    },
    enabled: page > 0 && size > 0,
  })
}

// GET /transfers/v1/deliveries/{deliveryId}/
export const useDeliveryQuery = ({ deliveryId }: { deliveryId: string }) => {
  return useQuery({
    queryKey: ["transfers", "deliveries", deliveryId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/transfers/v1/deliveries/${deliveryId}/`)

      return data.data as IDelivery
    },
    enabled: !!deliveryId,
  })
}

export const useFetchDeliveryMutation = () => {
  return useMutation({
    mutationFn: async ({ deliveryId }: { deliveryId: string }) => {
      const { data } = await axiosInstance.get(`/transfers/v1/deliveries/${deliveryId}/`)

      return data.data as IDelivery
    },
  })
}

// GET /transfers/v1/search/
export const useSearchDeliveriesQuery = ({
  source_location_id,
  source_location_name,
  destination_store,
  delivery_date,
  delivery_status_code,
  delivery_type_code,
  sales_order_reference,
  delivery_id,
}: {
  source_location_id?: number
  source_location_name?: string
  destination_store?: string
  delivery_date?: string
  delivery_status_code?: string
  delivery_type_code?: string
  sales_order_reference?: string
  delivery_id?: number
}) => {
  return useQuery({
    queryKey: [
      "transfers",
      "deliveries",
      "search",
      source_location_id,
      source_location_name,
      destination_store,
      delivery_date,
      delivery_status_code,
      delivery_type_code,
      sales_order_reference,
      delivery_id,
    ],
    queryFn: async () => {
      const params = new URLSearchParams()

      if (source_location_id) params.append("source_location_id", source_location_id.toString())
      if (source_location_name) params.append("source_location_name", source_location_name)
      if (destination_store) params.append("destination_store", destination_store)
      if (delivery_date) params.append("delivery_date", delivery_date)
      if (delivery_status_code) params.append("delivery_status_code", delivery_status_code)
      if (delivery_type_code) params.append("delivery_type_code", delivery_type_code)
      if (sales_order_reference) params.append("sales_order_reference", sales_order_reference)
      if (delivery_id) params.append("delivery_id", delivery_id.toString())

      const { data } = await axiosInstance.get(`/transfers/v1/search/`, {
        params,
      })

      return data.data as IPaginatedResponse<IDelivery>
    },
  })
}

export const useSearchDeliveriesMutation = () => {
  return useMutation({
    mutationFn: async ({
      source_location_id,
      source_location_name,
      destination_store,
      delivery_date,
      delivery_status_code,
      delivery_type_code,
      sales_order_reference,
      deliveryId,
    }: {
      source_location_id?: number
      source_location_name?: string
      destination_store?: string
      delivery_date?: string
      delivery_status_code?: string
      delivery_type_code?: string
      sales_order_reference?: string
      deliveryId?: number
    }) => {
      const params = new URLSearchParams()

      if (source_location_id) params.append("source_location_id", source_location_id.toString())
      if (source_location_name) params.append("source_location_name", source_location_name)
      if (destination_store) params.append("destination_store", destination_store)
      if (delivery_date) params.append("delivery_date", delivery_date)
      if (delivery_status_code) params.append("delivery_status_code", delivery_status_code)
      if (delivery_type_code) params.append("delivery_type_code", delivery_type_code)
      if (sales_order_reference) params.append("sales_order_reference", sales_order_reference)
      if (deliveryId) params.append("delivery_id", deliveryId.toString())

      const { data } = await axiosInstance.get(`/transfers/v1/search/`, {
        params,
      })

      return data.data as IPaginatedResponse<IDelivery>
    },
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
