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
  type Product,
  type ProductImage,
  type ProductFormData,
  type ProductQueryParams,
  type Pagination,
  type ProductSummary,
  type ProductsResponse,
  type Tag as ProductTag,
  type Collection as ProductCollection,
} from "./productService";

// Tag service
export {
  getAllTags,
  getTag,
  createTag,
  type Tag,
  type CreateTagData,
} from "./tagService";

// Collection service
export {
  getSuperCategories,
  getCategories,
  getSubCategories,
  getCategoriesBySuperId,
  getSubCategoriesByCategoryId,
  type Collection,
} from "./collectionService";

// Chat service
export * from "./chatService";

// Order service
export {
  getAllOrders,
  getOrder,
  fulfillOrder,
  createInvoice,
  getInvoiceData,
  raisePickup,
  downloadShippingLabel,
  canFulfillOrder,
  canCreateInvoice,
  hasInvoice,
  canRaisePickup,
  canDownloadLabel,
  getOrderStatusColor,
  formatOrderDate,
  getTotalFulfilledQuantity,
  getTotalRequestedQuantity,
  type Order,
  type OrderAddress,
  type OrderProduct,
  type OrderVariant,
  type OrderItem,
  type OrderShipment,
  type FulfillOrderItem,
  type FulfillOrderRequest,
  type InvoiceItem,
  type InvoiceResponse,
  type InvoiceData,
  type PickupResponse,
} from "./orderService";
