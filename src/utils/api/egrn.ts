import axiosInstance from "@/lib/axios"
import { useQuery, useMutation } from "@tanstack/react-query"

// GET /egrn/v1/vendors/search
export const useSearchVendorQuery = ({ search }: { search: string }) => {
  return useQuery({
    queryKey: ["egrn", "vendors", "search"],
    queryFn: async () => {
      const params = new URLSearchParams({
        search,
      })

      const { data } = await axiosInstance.get("/egrn/v1/vendors/search", {
        params,
      })

      return data
    },
    enabled: !!search,
  })
}

// GET /egrn/v1/purchaseorders/{purchaseOrderId}/grns
export const usePOLineItemsQuery = ({ purchaseOrderId }: { purchaseOrderId: string }) => {
  return useQuery({
    queryKey: ["egrn", "purchaseorders", purchaseOrderId, "grns"],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/egrn/v1/purchaseorders/${purchaseOrderId}/grns`)

      return data
    },
    enabled: !!purchaseOrderId,
  })
}

// GET /egrn/v1/filter-grns
export const useFilterGrnsQuery = ({
  page,
  size,
  po_id,
  vendor_internal_id,
  delivery_stores,
  date_created,
  start_date,
  end_date,
  delivery_status_code,
  invoice_status_code,
}: {
  page: number
  size: number
  po_id?: number
  vendor_internal_id?: string
  delivery_stores?: string
  date_created?: string
  start_date?: string
  end_date?: string
  delivery_status_code?: number
  invoice_status_code?: number
}) => {
  return useQuery({
    queryKey: [],
    queryFn: async () => {
      const params = new URLSearchParams()

      params.append("page", page.toString())
      params.append("size", size.toString())

      if (po_id) params.append("po_id", po_id.toString())
      if (vendor_internal_id) params.append("vendor_internal_id", vendor_internal_id)
      if (delivery_stores) params.append("delivery_stores", delivery_stores)
      if (date_created) params.append("date_created", date_created)
      if (start_date) params.append("start_date", start_date)
      if (end_date) params.append("end_date", end_date)
      if (delivery_status_code)
        params.append("delivery_status_code", delivery_status_code.toString())
      if (invoice_status_code) params.append("invoice_status_code", invoice_status_code.toString())

      const { data } = await axiosInstance.get("/egrn/v1/filter-grns", {
        params,
      })

      return data
    },
  })
}
