interface IPaginatedResponse<T = any> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
  download_url?: string
}

interface IGrn {
  grn_number: number
  created: string
  total_value_received: number
  invoiced_quantity: number
  invoice_status_code: string
  invoice_status_text: string
  stores: Array<IStore>
  purchase_order: IPurchaseOrder
  grn_line_items: Array<IGrnLineItem>
}

interface IStore {
  id: number
  store_name: string
  store_email: string
  icg_warehouse_name: string
  icg_warehouse_code: string
  byd_cost_center_code: string
}

interface IPurchaseOrder {
  po_id: number
  object_id: string
  vendor: string
  total_net_amount: string
  date: string
  delivery_status_code: string
  delivery_status_text: string
  delivery_completed: boolean
  BuyerParty: IBuyerParty
  Supplier: ISupplier
}

interface IBuyerParty {
  PartyID: string
  ObjectID: string
  BuyerPartyName: Array<{
    FormattedName: string
  }>
  ParentObjectID: string
}

interface ISupplier {
  PartyID: string
  ObjectID: string
  SupplierName: Array<{
    FormattedName: string
  }>
  ParentObjectID: string
  SupplierFormattedAddress: Array<{
    FormattedPostalAddressDescription: string
  }>
}

interface IGrnLineItem {
  id: number
  grn_number: number
  quantity_received: string
  gross_value_received: string
  net_value_received: string
  invoiced_quantity: number
  is_invoiced: boolean
  tax_value: number
  date_received: string
  purchase_order_line_item: IPurchaseOrderLineItem
}

interface IPurchaseOrderLineItem {
  object_id: string
  delivery_store: IStore
  product_name: string
  unit_price: string
  quantity: string
  tax_rates: Array<{
    id: number
    code: number
    rate: number
    type: string
    description: string
  }>
  unit_of_measurement: string
  delivery_status_code: string
  delivery_status_text: string
  delivered_quantity: number
  delivery_outstanding_quantity: number
  delivery_completed: boolean
  extra_fields: Array<{
    name: string
    type: string
    properties: {
      min: number
      required: boolean
      placeholder: string
    }
  }>
}

interface IGrnDetail {
  grn_number: number
  store: number
  created: string
  purchase_order: IPurchaseOrder
  line_items: Array<{
    grn_number: number
    quantity_received: string
    date_received: string
    purchase_order_line_item: {
      id: number
      purchase_order: number
      object_id: string
      product_name: string
      quantity: number
      unit_price: number
      unit_of_measurement: string
    }
  }>
}

interface IDeliveryMetadata {
  ID: string
  UUID: string
  ObjectID: string
  TypeCode: string
  TypeCodeText: string
  DeliveryTypeCode: string
  DeliveryTypeCodeText: string
  ReleaseStatusCode: string
  ReleaseStatusCodeText: string
  ConsistencyStatusCode: string
  ConsistencyStatusCodeText: string
  CancellationStatusCode: string
  CancellationStatusCodeText: string
  DataOriginTypeCode: string
  DataOriginTypeCodeText: string
  DeliveryProcessingStatusCode: string
  DeliveryProcessingStatusCodeText: string
  CreationDateTime: string
  PickupIndicator: boolean
  IncotermsClassificationCode: string
  IncotermsClassificationCodeText: string
  IncotermsLocationName: string
  Item?: Array<any>
  BuyerParty?: { __deferred: { uri: string } }
  SellerParty?: { __deferred: { uri: string } }
  PickupPeriod?: { __deferred: { uri: string } }
  ArrivalPeriod?: Record<string, any>
  ShippingPeriod?: Record<string, any>
  ShipFromLocation?: Record<string, any>
  GrossVolumeMeasure?: { __deferred: { uri: string } }
  GrossWeightMeasure?: { __deferred: { uri: string } }
  FreightForwarderParty?: { __deferred: { uri: string } }
  ProductRecipientParty?: Record<string, any>
  __metadata?: {
    uri: string
    type: string
  }
}

interface IDeliveryLineItemMetadata {
  ID: string
  UUID: string
  ObjectID: string
  ProductID: string
  InternalID: string
  unit_price: number
  Description: string
  currency_code: string
  ParentObjectID: string
  valuation_date: string
  CancellationStatusCode: string
  CancellationStatusCodeText: string
  OutboundDelivery?: { __deferred: { uri: string } }
  ItemSalesOrderReference?: { __deferred: { uri: string } }
  ItemLogisticsRequestResponsibleParty?: { __deferred: { uri: string } }
  IdentifiedStockID: string
  BaseMeasureUnitCode?: string
  BaseMeasureUnitCodeText?: string
  DescriptionLanguageCode?: string
  DescriptionLanguageCodeText?: string
  IdentifiedStockTypeCode?: string
  IdentifiedStockTypeCodeText?: string
  ItemDeliveryQuantity?: Record<string, any>
  __metadata?: {
    uri: string
    type: string
  }
}

interface IDeliveryReceipt {
  id: number
  receipt_number: number
  notes: string
  created_date: string
  created_by: string
  approval_status: string
  approval_status_display: string
  submitted_at: string | null
  approved_at: string | null
  approved_by_name: string | null
  rejection_reason: string | null
  rejection_count: number
  synced_to_sap: boolean
  posted_to_icg: boolean
}

interface IDeliveryLatestReceiptStatus {
  status: string
  status_display: string
  receipt_number: number
}

interface IDelivery {
  id: number
  object_id: string
  delivery_id: string
  source_location_id: string
  source_location_name: string
  destination_store: number
  delivery_date: string
  delivery_status_code: string
  delivery_status: string
  delivery_type_code: string
  sales_order_reference: string | null
  total_quantity_expected: number
  total_quantity_received: number
  is_fully_received: boolean
  destination_store_name: string
  line_items: Array<IDeliveryLineItem>
  receipts: Array<IDeliveryReceipt>
  latest_receipt_status: IDeliveryLatestReceiptStatus | null
  has_pending_approval: boolean
  created_date: string
  metadata?: IDeliveryMetadata
}

interface IDeliveryLineItem {
  id: number
  object_id: string
  product_id: string
  product_name: string
  quantity_expected: string
  quantity_received: string
  unit_of_measurement: string
  unit_price: string
  total_value: number
  quantity_outstanding: number
  is_fully_received: boolean
  metadata?: IDeliveryLineItemMetadata
}

interface IPendingApprovalLineItem {
  id: number
  inbound_delivery_line_item: IDeliveryLineItem
  product_id: string
  quantity_expected: string
  quantity_received: string
  unit_price: string
  unit_of_measurement: string
  value_received: number
  metadata: Record<string, any>
}

interface IPendingApproval {
  id: number
  receipt_number: number
  inbound_delivery: IDelivery
  notes: string
  source_location: string
  source_location_id: string
  destination_store: string
  created_date: string
  created_by: string
  posted_to_icg: boolean
  line_items: Array<IPendingApprovalLineItem>
  metadata: Record<string, any>
  approval_status: string
  approval_status_display: string
  submitted_at: string | null
  approved_at: string | null
  approved_by_name: string | null
  rejection_reason: string | null
  rejection_count: number
  synced_to_sap: boolean
  total_value_received: number
}
