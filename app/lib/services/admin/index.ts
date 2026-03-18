// Auth service
export * from "./authService";

// Product service
export {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCollection,
  updateImagePositions,
  createProductWithVariants,
  updateProductWithVariants,
  type Product,
  type ProductImageUrl,
  type ProductTag,
  type ProductCollection,
  type ProductCommonAttributes,
  type VariantProduct,
  type VariationOption,
} from "./productService";

// Tag service
export {
  getAllTags,
  getTag,
  createTag,
  updateTag,
  deleteTag,
  type Tag,
} from "./tagService";

// Seller service
export {
  getAllSellers,
  getSeller,
  createSeller,
  updateSeller,
  deleteSeller,
  addSellerAddress,
  addSellerNote,
  type Seller,
  type SellerRequest,
  type SellerQueryParams,
  type SellersResponse,
  type Address,
} from "./sellerService";

// Collection service
export {
  getAllCollections,
  getCollection,
  createCollection,
  updateCollection,
  deleteCollection,
  prepareCollectionFormData,
  formatConditions,
  getSuperCategories,
  getCategories,
  getSubCategories,
  parseCollection,
  type Collection,
  type CategoryAssociation,
  type SubCategoryAssociation,
  type ProductAssociation,
  type SuperCategoryAssociation,
  type CategoryParentAssociation,
  type Condition,
  type PaginationInfo as CollectionPaginationInfo,
  type CollectionsResponse,
  type CollectionQueryParams,
} from "./collectionService";

// Customer service
export {
  getAllCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addNoteToCustomer,
  type Customer,
  type CustomerAddress,
  type CustomerQueryParams,
  type CustomersResponse,
  type Note,
} from "./customerService";

// Chat service
export * from "./chatService";

// Banner service
export * from "./bannerService";

// Abandoned cart service
export * from "./abandonedService";

// Currency service
export * from "./currencyService";

// Order service
export {
  getAllOrders,
  getOrder,
  getOrderTimelines,
  createOrderTimeline,
  deleteOrderTimeline,
  getShippingRates,
  addTrackingInfo,
  fulfillOrder,
  formatOrderStatus,
  getOrderStatusColor,
  formatOrderDate,
  getSupportedShippingCarriers,
  type Order,
  type OrderAddress,
  type OrderTimeline,
  type OrderShipment,
  type OrderCart,
  type OrderCartItem,
  type OrderUser,
  type OrderFilters,
  type OrdersResponse,
  type ShippingRates,
  type ShippingDebugInfo,
  type TrackingInfo,
  type OrdersPaginationInfo,
  type AdminFulfillOrderItem,
  type AdminFulfillOrderRequest,
  type OrderProduct,
  type OrderVariant,
  type OrderItem,
} from "./orderService";

// Pickup service
export {
  getAllPickups,
  getPickup,
  getPickupStatusColor,
  getPickupStatusBadgeClass,
  formatPickupStatus,
  downloadShippingLabel,
  getAllPickupStatuses,
  getPickupSortOptions,
  getInvoiceStatusOptions,
  formatBusinessHours,
  isPickupReady,
  getPickupDimensions,
  formatPickupDate,
  type Pickup,
  type PickupStatus,
  type PickupSeller,
  type SellerAddress,
  type PickupAddress,
  type BusinessHours,
  type ContactPerson,
  type PickupDetails,
  type PickupOrderItem,
  type OrderAddress as PickupOrderAddress,
  type PickupSortOption,
  type InvoiceStatus,
  type PickupPagination,
  type PickupFilters,
  type PickupSummary,
  type PickupsResponse,
  type PickupQueryParams,
} from "./pickupService";
