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
export const useDeliveriesQuery = ({
  page,
  size,
  source_location_id,
  source_location_name,
  destination_store,
  delivery_date_from,
  delivery_date_to,
  delivery_status_code,
  delivery_type_code,
  sales_order_reference,
  delivery_id,
}: {
  page: number
  size: number
  source_location_id?: number
  source_location_name?: string
  destination_store?: string
  delivery_date_from?: string
  delivery_date_to?: string
  delivery_status_code?: string
  delivery_type_code?: string
  sales_order_reference?: string
  delivery_id?: number
}) => {
  return useQuery({
    queryKey: [
      "transfers",
      "deliveries",
      page,
      size,
      source_location_id,
      source_location_name,
      destination_store,
      delivery_date_from,
      delivery_date_to,
      delivery_status_code,
      delivery_type_code,
      sales_order_reference,
      delivery_id,
    ],
    queryFn: async () => {
      const params = new URLSearchParams()

      params.append("page", page.toString())
      params.append("size", size.toString())

      if (source_location_id) params.append("source_location_id", source_location_id.toString())
      if (source_location_name) params.append("source_location_name", source_location_name)
      if (destination_store) params.append("destination_store", destination_store)
      if (delivery_date_from) params.append("delivery_date_from", delivery_date_from)
      if (delivery_date_to) params.append("delivery_date_to", delivery_date_to)
      if (delivery_status_code) params.append("delivery_status_code", delivery_status_code)
      if (delivery_type_code) params.append("delivery_type_code", delivery_type_code)
      if (sales_order_reference) params.append("sales_order_reference", sales_order_reference)
      if (delivery_id) params.append("delivery_id", delivery_id.toString())

      const { data } = await axiosInstance.get("/transfers/v1/deliveries/", {
        params,
      })

      return data.data as IPaginatedResponse<IDelivery>
    },
    enabled: page > 0 && size > 0,
    staleTime: 0,
  })
}

export const useDeliveriesMutation = () => {
  return useMutation({
    mutationFn: async ({
      page,
      size,
      source_location_id,
      source_location_name,
      destination_store,
      delivery_date_from,
      delivery_date_to,
      delivery_status_code,
      delivery_type_code,
      sales_order_reference,
      delivery_id,
    }: {
      page: number
      size: number
      source_location_id?: number
      source_location_name?: string
      destination_store?: string
      delivery_date_from?: string
      delivery_date_to?: string
      delivery_status_code?: string
      delivery_type_code?: string
      sales_order_reference?: string
      delivery_id?: number
    }) => {
      const params = new URLSearchParams()

      params.append("page", page.toString())
      params.append("size", size.toString())

      if (source_location_id) params.append("source_location_id", source_location_id.toString())
      if (source_location_name) params.append("source_location_name", source_location_name)
      if (destination_store) params.append("destination_store", destination_store)
      if (delivery_date_from) params.append("delivery_date_from", delivery_date_from)
      if (delivery_date_to) params.append("delivery_date_to", delivery_date_to)
      if (delivery_status_code) params.append("delivery_status_code", delivery_status_code)
      if (delivery_type_code) params.append("delivery_type_code", delivery_type_code)
      if (sales_order_reference) params.append("sales_order_reference", sales_order_reference)
      if (delivery_id) params.append("delivery_id", delivery_id.toString())

      const { data } = await axiosInstance.get("/transfers/v1/deliveries/", {
        params,
      })

      return data.data as IPaginatedResponse<IDelivery>
    },
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
    staleTime: 0,
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
      qc.invalidateQueries({ queryKey: ["transfers", "approvals", "pending"], type: "all" })
    },
  })
}

// POST /transfers/v1/receipts/{{receiptId}}/approve/
export const useApproveDeliveryReceiptMutation = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { receiptId: number }) => {
      const { data } = await axiosInstance.post(
        `/transfers/v1/receipts/${payload.receiptId}/approve/`,
      )

      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transfers", "deliveries"], type: "all" })
      qc.invalidateQueries({ queryKey: ["transfers", "approvals", "pending"], type: "all" })
    },
  })
}

// POST /transfers/v1/receipts/{{receiptId}}/reject/
export const useRejectDeliveryReceiptMutation = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { receiptId: number; rejectionReason: string }) => {
      const { data } = await axiosInstance.post(
        `/transfers/v1/receipts/${payload.receiptId}/reject/`,
        { rejection_reason: payload.rejectionReason },
      )

      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transfers", "deliveries"], type: "all" })
      qc.invalidateQueries({ queryKey: ["transfers", "approvals", "pending"], type: "all" })
    },
  })
}

export interface UpdateDeliveryReceiptPayload {
  receiptId: number
  line_items: Array<{
    line_item_id: number
    quantity_received: number
  }>
  notes: string
}

// PUT /transfers/v1/receipts/{{receiptId}}/update/
export const useUpdateDeliveryReceiptMutation = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ receiptId, ...payload }: UpdateDeliveryReceiptPayload) => {
      const { data } = await axiosInstance.put(
        `/transfers/v1/receipts/${receiptId}/update/`,
        payload,
      )

      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transfers", "deliveries"], type: "all" })
      qc.invalidateQueries({ queryKey: ["transfers", "approvals", "pending"], type: "all" })
    },
  })
}

// GET /transfers/v1/approvals/pending
export const usePendingApprovalsQuery = () => {
  return useQuery({
    queryKey: ["transfers", "approvals", "pending"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/transfers/v1/approvals/pending")

      return data.data as IPaginatedResponse<IPendingApproval>
    },
    staleTime: 0
  })
}

// GET /transfers/v1/deliveries/{{deliveryId}}/?refresh=true
export const useRefreshDeliveryMutation = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (payload: { deliveryId: string }) => {
      const { data } = await axiosInstance.get(
        `/transfers/v1/deliveries/${payload.deliveryId}/?refresh=true`,
      )

      return data.data as IDelivery
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transfers", "deliveries"], type: "all" })
    },
  })
}

// GET /transfers/v1/search/?download=true
export const useExportDeliveryMutation = () => {
  return useMutation({
    mutationFn: async ({
      source_location_id,
      source_location_name,
      destination_store,
      delivery_date_from,
      delivery_date_to,
      delivery_status_code,
      delivery_type_code,
      sales_order_reference,
      delivery_id,
    }: {
      source_location_id?: number
      source_location_name?: string
      destination_store?: string
      delivery_date_from?: string
      delivery_date_to?: string
      delivery_status_code?: string
      delivery_type_code?: string
      sales_order_reference?: string
      delivery_id?: number
    }) => {
      const params = new URLSearchParams()

      if (source_location_id) params.append("source_location_id", source_location_id.toString())
      if (source_location_name) params.append("source_location_name", source_location_name)
      if (destination_store) params.append("destination_store", destination_store)
      if (delivery_date_from) params.append("delivery_date_from", delivery_date_from)
      if (delivery_date_to) params.append("delivery_date_to", delivery_date_to)
      if (delivery_status_code) params.append("delivery_status_code", delivery_status_code)
      if (delivery_type_code) params.append("delivery_type_code", delivery_type_code)
      if (sales_order_reference) params.append("sales_order_reference", sales_order_reference)
      if (delivery_id) params.append("delivery_id", delivery_id.toString())

      params.append("download", "true")

      const { data } = await axiosInstance.get("/transfers/v1/search/", {
        params,
      })

      return data.data as IPaginatedResponse<IDelivery>
    },
  })
}
