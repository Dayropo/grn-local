interface IPaginatedResponse<T = any> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
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
  ParentObjectID: string
  CancellationStatusCode: string
  CancellationStatusCodeText: string
  OutboundDelivery?: { __deferred: { uri: string } }
  ItemSalesOrderReference?: { __deferred: { uri: string } }
  ItemLogisticsRequestResponsibleParty?: { __deferred: { uri: string } }
  IdentifiedStockID: string
  ItemDeliveryQuantity?: Record<string, any>
  __metadata?: {
    uri: string
    type: string
  }
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
  quantity_outstanding: number
  is_fully_received: boolean
  metadata?: IDeliveryLineItemMetadata
}
