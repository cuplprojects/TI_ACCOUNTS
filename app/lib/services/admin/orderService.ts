import axiosInstance from "../../axiosConfig";
import {
  showSuccessMessage,
  showErrorMessage,
  showLoading,
  closeLoading,
} from "../../swalConfig";
import { AxiosError } from "axios";

// Base URL for order API
const BASE_URL = "/admin/order";

// Order interfaces
export interface OrderAddress {
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  zip_code: string;
  country_code_iso: string;
  country?: string;
  phone?: string;
}

export interface OrderTimeline {
  id: string;
  order_id: string;
  event: string;
  details: string;
  is_automated: boolean;
  attached_files:
    | {
        id: number;
        url: string;
      }[]
    | null;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderShipment {
  id: string;
  orderId: string;
  shippingMethod: string;
  trackingNumber: string;
  shippingCost: string;
  status: string;
  createdAt: string;
}

export interface OrderCartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  Product: {
    id: string;
    title: string;
    price: string;
    option_values: string[];
    image_urls: {
      url: string;
      position: number;
    }[];
    seller_id: string;
  };
}

// Variant interface for order items
export interface OrderVariant {
  id: string;
  price: string;
  compare_price?: string;
  sku: string;
  stock_qty: number;
  option_values: { [key: string]: string };
  image_urls: {
    url: string;
    position: number;
  }[];
  weight?: number;
  length?: number;
  breadth?: number;
  height?: number;
}

// Product interface for order items
export interface OrderProduct {
  id: string;
  title: string;
  description?: string;
  brand?: string;
  seller_id: string;
  has_variant?: boolean;
  // For non-variant products, these fields come directly from Product
  price?: string;
  sku: string;
  stock_qty?: number;
  weight?: string;
  image_urls?: (
    | string
    | {
        url: string;
        position: number;
      }
  )[];
  default_image_urls?: {
    url: string;
    position: number;
  }[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string;
  product_id: string;
  seller_id: string;
  quantityRequested: number;
  quantityFulfilled: number;
  unitPrice: string;
  status: "pending" | "fulfilled" | "partially_fulfilled" | "canceled";
  createdAt: string;
  updatedAt: string;
  // Primary data source - Variant (always present)
  Variant: OrderVariant;
  // Secondary data source - Product (for product-level info)
  Product: OrderProduct;
}

export interface OrderCart {
  id: string;
  user_id: string;
  status: string;
  CartItems: OrderCartItem[];
}

export interface OrderUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country_code?: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  user_id: string;
  cart_id: string;
  payment_id: string;
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
  refundAmount?: string;
  discount_id?: string;
  discountAmount?: number;
  finalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  invoiceCreated?: boolean;
  tracking_number?: string;
  shipping_carrier?: string;
  shipping_address: OrderAddress;
  billing_address: OrderAddress;
  createdAt: string;
  updatedAt: string;
  OrderTimelines?: OrderTimeline[];
  OrderItems?: OrderItem[];
  Cart?: OrderCart;
  User?: OrderUser;
  OrderShipments?: OrderShipment[];
  Payment?: {
    id: string;
    amount: number;
    currency: string;
    conversion_rate: number;
    status: string;
    gateway: string;
  };
}

// Pagination interface
export interface OrdersPaginationInfo {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

// Filter interface
export interface OrderFilters {
  search?: string;
  status?: string;
  user_id?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
  page?: number;
  limit?: number;
  offset?: number; // Added for export
}

// Order statistics interface
export interface OrderStatistics {
  orders: {
    total: number;
    today: number;
  };
  itemsOrdered: {
    total: number;
  };
  returns: {
    total: number;
  };
  ordersFulfilled: {
    total: number;
  };
  ordersDelivered: {
    total: number;
  };
}

// Orders response interface
export interface OrdersResponse {
  orders: Order[];
  pagination: OrdersPaginationInfo;
  filters: OrderFilters;
  statistics: OrderStatistics;
}

// Shipping rate interface
export interface ShippingRates {
  aramex: number;
  dhl: number;
  shipGlobal: number;
  domestic: number;
}

// Tracking info interface
export interface TrackingInfo {
  tracking_number: string;
  carrier: string;
  status: string;
  estimated_delivery: string;
  tracking_events: {
    timestamp: string;
    location: string;
    status: string;
    description: string;
  }[];
}

// Shipping debug info interface
export interface ShippingDebugInfo {
  finalWeight: number;
  finalQuantity: number;
  destination: {
    city: string;
    state: string;
    zip_code: string;
    country_code_iso: string;
  };
}

// Invoice Data interface for PDF generation
export interface InvoiceData {
  company: {
    name: string;
    gstin: string;
    address: string;
    iecPan: string;
    contact: string;
    email: string;
    fssai: string;
    shippingPolicy: string;
    refundPolicy: string;
  };
  invoice: {
    number: string;
    date: string;
    currency: string;
    exportType: string;
    terms: string;
  };
  shipping: {
    logistics: string;
    port: string;
    airwayBill: string;
    shippingBill: string;
    date: string;
    egmNumber: string;
    countryOfSupply: string;
    countryCode: string;
  };
  billTo: {
    name: string;
    address1: string;
    address2: string;
  };
  shipTo: {
    name: string;
    address1: string;
    address2: string;
  };
  products: Array<{
    description: string;
    hsnCode: string;
    unit: string;
    quantity: number;
    rate: string;
    discount: string;
    discountPercent: string;
    netRate: string;
    igst: string;
    amount: string;
  }>;
  totals: {
    totalQuantity: number;
    taxableAmount: string;
    igst: string;
    totalAmount: string;
    amountInWords: string;
    freight: string;
    insurance: string;
  };
  bankDetails: {
    accountName: string;
    accountNumber: string;
    ifscCode: string;
    swiftCode: string;
    adCode: string;
  };
}

// API response interface
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

/**
 * Fetches all orders from the API.
 */
export const getAllOrders = async (
  filters: OrderFilters
): Promise<OrdersResponse | null> => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.user_id) queryParams.append("user_id", filters.user_id);
    if (filters.date_from) queryParams.append("date_from", filters.date_from);
    if (filters.date_to) queryParams.append("date_to", filters.date_to);
    if (filters.sort_by) queryParams.append("sort_by", filters.sort_by);
    if (filters.sort_order)
      queryParams.append("sort_order", filters.sort_order);
    // For getAllOrders, send 'page' and 'limit' for pagination
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());

    const response = await axiosInstance.get<{
      success: boolean;
      data: OrdersResponse;
    }>(`${BASE_URL}/get-orders?${queryParams.toString()}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching orders:", error);
    showErrorMessage("Failed to fetch orders.");
    return null;
  }
};

/**
 * Export orders to CSV/XLSX
 */
export const exportOrders = async (
  params: OrderFilters = {},
  format: "csv" | "xlsx"
): Promise<boolean> => {
  try {
    showLoading(`Exporting orders to ${format.toUpperCase()}...`);

    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append("status", params.status);
    if (params.user_id) queryParams.append("user_id", params.user_id);
    if (params.date_from) queryParams.append("date_from", params.date_from);
    if (params.date_to) queryParams.append("date_to", params.date_to);
    if (params.search) queryParams.append("search", params.search);
    if (params.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params.sort_order) queryParams.append("sort_order", params.sort_order);
    // For exportOrders, we use 'offset' and 'limit' directly from the params
    if (params.offset) queryParams.append("offset", params.offset.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    queryParams.append("format", format);

    const response = await axiosInstance.get(
      `${BASE_URL}/export-orders?${queryParams.toString()}`,
      { responseType: "blob" } // Important: responseType must be 'blob' for file downloads
    );
    closeLoading();

    if (response.status === 200) {
      const disposition = response.headers["content-disposition"];
      let filename = "orders.csv";
      if (disposition && disposition.indexOf("attachment") !== -1) {
        const filenameRegex = /filename\*=UTF-8''(.*)$/;
        const matches = filenameRegex.exec(disposition);
        if (matches && matches[1]) {
          filename = decodeURIComponent(matches[1]);
        } else {
          const oldFilenameRegex = /filename="(.*?)"/;
          const oldMatches = oldFilenameRegex.exec(disposition);
          if (oldMatches && oldMatches[1]) {
            filename = oldMatches[1];
          }
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename); // Set the filename for download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccessMessage("Orders exported successfully!");
      return true;
    } else {
      // Attempt to read error message from blob if it's an error response
      const errorText = await response.data.text();
      let errorMessage = "Failed to export orders";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch (error) {
        console.warn("Could not parse error response as JSON:", error);
      }
      showErrorMessage(errorMessage);
      return false;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      if (axiosError.response.data instanceof Blob) {
        // Try to read error message from blob
        const errorBlob = axiosError.response.data;
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const errorJson = JSON.parse(e.target?.result as string);
            showErrorMessage(errorJson.message || "Error exporting orders");
          } catch (error) {
            console.warn("Could not parse error response as JSON:", error);
            showErrorMessage(
              "Error exporting orders. Could not parse error response."
            );
          }
        };
        reader.onerror = () => {
          showErrorMessage(
            "Error exporting orders. Failed to read error response."
          );
        };
        reader.readAsText(errorBlob);
      } else if (axiosError.response && axiosError.response.data) {
        // Assuming error response data has a 'message' property
        const errorData = axiosError.response.data as { message?: string };
        showErrorMessage(errorData.message || "Error exporting orders");
      } else if (axiosError.code === "ECONNABORTED") {
        showErrorMessage(
          "Export request timed out. Please try again or reduce the export range."
        );
      } else {
        showErrorMessage("Failed to export orders. Please try again later.");
      }
    }
  }
  return false;
};

/**
 * Get a single order by ID
 */
export const getOrder = async (orderId: string): Promise<Order | null> => {
  try {
    showLoading("Loading order details...");
    const response = await axiosInstance.get<ApiResponse<Order>>(
      `${BASE_URL}/get-order/${orderId}`
    );
    closeLoading();

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      showErrorMessage(response.data.message || "Order not found");
      return null;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error loading order details"
      );
    } else {
      showErrorMessage("Failed to load order details. Please try again later.");
    }
    return null;
  }
};

/**
 * Get order timelines
 */
export const getOrderTimelines = async (
  orderId: string
): Promise<OrderTimeline[] | null> => {
  try {
    showLoading("Loading order timelines...");
    const response = await axiosInstance.get<ApiResponse<OrderTimeline[]>>(
      `${BASE_URL}/get-timelines/${orderId}`
    );
    closeLoading();

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      showErrorMessage(
        response.data.message || "Failed to load order timelines"
      );
      return null;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error loading order timelines"
      );
    } else {
      showErrorMessage(
        "Failed to load order timelines. Please try again later."
      );
    }
    return null;
  }
};

/**
 * Create order timeline entry
 */
export const createOrderTimeline = async (
  orderId: string,
  details: string,
  attachments?: File[]
): Promise<OrderTimeline | null> => {
  try {
    showLoading("Creating timeline entry...");

    const formData = new FormData();
    formData.append("details", details);

    if (attachments && attachments.length > 0) {
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });
    }

    const response = await axiosInstance.post<ApiResponse<OrderTimeline>>(
      `${BASE_URL}/create-timeline/${orderId}`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    closeLoading();

    if (response.data.success && response.data.data) {
      showSuccessMessage("Timeline entry created successfully");
      return response.data.data;
    } else {
      showErrorMessage(
        response.data.message || "Failed to create timeline entry"
      );
      return null;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error creating timeline entry"
      );
    } else {
      showErrorMessage(
        "Failed to create timeline entry. Please try again later."
      );
    }
    return null;
  }
};

/**
 * Delete order timeline entry
 */
export const deleteOrderTimeline = async (
  timelineId: string
): Promise<boolean> => {
  try {
    showLoading("Deleting timeline entry...");
    const response = await axiosInstance.delete<ApiResponse<null>>(
      `${BASE_URL}/delete-timeline/${timelineId}`
    );
    closeLoading();

    if (response.data.success) {
      showSuccessMessage(
        response.data.message || "Timeline entry deleted successfully"
      );
      return true;
    } else {
      showErrorMessage(
        response.data.message || "Failed to delete timeline entry"
      );
      return false;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error deleting timeline entry"
      );
    } else {
      showErrorMessage(
        "Failed to delete timeline entry. Please try again later."
      );
    }
    return false;
  }
};

/**
 * Get shipping rates for an order
 */
export const getShippingRates = async (
  cartId: string,
  destinationId: string
): Promise<ShippingRates | null> => {
  try {
    showLoading("Calculating shipping rates...");
    const response = await axiosInstance.post<
      ApiResponse<{ rates: ShippingRates; debug: ShippingDebugInfo }>
    >(`${BASE_URL}/get-shipping-rates/${cartId}`, {
      destination_id: destinationId,
    });
    closeLoading();

    if (response.data.success && response.data.data) {
      return response.data.data.rates;
    } else {
      showErrorMessage(
        response.data.message || "Failed to calculate shipping rates"
      );
      return null;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error calculating shipping rates"
      );
    } else {
      showErrorMessage(
        "Failed to calculate shipping rates. Please try again later."
      );
    }
    return null;
  }
};

/**
 * Add tracking information to an order
 */
export const addTrackingInfo = async (
  orderId: string,
  trackingNumber: string,
  shippingCarrier: string
): Promise<{ tracking_info: TrackingInfo; order_updated: Order } | null> => {
  try {
    showLoading("Adding tracking information...");
    const response = await axiosInstance.post<
      ApiResponse<{ tracking_info: TrackingInfo; order_updated: Order }>
    >(`${BASE_URL}/add-tracking/${orderId}`, {
      tracking_number: trackingNumber,
      shipping_carrier: shippingCarrier,
    });
    closeLoading();

    if (response.data.success && response.data.data) {
      showSuccessMessage("Tracking information added successfully");
      return response.data.data;
    } else {
      showErrorMessage(
        response.data.message || "Failed to add tracking information"
      );
      return null;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error adding tracking information"
      );
    } else {
      showErrorMessage(
        "Failed to add tracking information. Please try again later."
      );
    }
    return null;
  }
};

// Helper function to format order status for display
export const formatOrderStatus = (status: string): string => {
  switch (status.toLowerCase()) {
    case "pending":
      return "Pending";
    case "processing":
      return "Processing";
    case "shipped":
      return "Shipped";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

// Helper function to get status color for UI
export const getOrderStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "pending":
      return "#FFA500"; // Orange
    case "processing":
      return "#3498DB"; // Blue
    case "shipped":
      return "#9B59B6"; // Purple
    case "delivered":
      return "#2ECC71"; // Green
    case "cancelled":
      return "#E74C3C"; // Red
    default:
      return "#95A5A6"; // Gray
  }
};

// Helper function to format date for display - DD/MM/YYYY HH:MM
export const formatOrderDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

// Helper function to get supported shipping carriers
export const getSupportedShippingCarriers = (): {
  value: string;
  label: string;
}[] => {
  return [
    { value: "aramex", label: "Aramex International" },
    { value: "dhl", label: "DHL Express" },
    { value: "shipglobal", label: "ShipGlobal International" },
    { value: "domestic", label: "Local/Domestic Carriers" },
  ];
};

/**
 * Get invoice data for PDF generation
 */
export const getInvoiceData = async (
  orderId: string
): Promise<InvoiceData | null> => {
  try {
    showLoading("Loading invoice data...");
    const response = await axiosInstance.get<ApiResponse<InvoiceData>>(
      `${BASE_URL}/buyer-invoice/${orderId}`
    );
    closeLoading();

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      showErrorMessage(response.data.message || "Failed to load invoice data");
      return null;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      let errorMessage = "Failed to load invoice data";

      if (status === 404) {
        errorMessage = "Invoice not found for this order.";
      }

      showErrorMessage(errorMessage);
    } else {
      showErrorMessage("Failed to load invoice data. Please try again later.");
    }
    return null;
  }
};

// Fulfill Order Item interface for admin
export interface AdminFulfillOrderItem {
  orderItemId: string;
  quantityFulfilled: number;
}

// Fulfill Order Request interface for admin
export interface AdminFulfillOrderRequest {
  items: AdminFulfillOrderItem[];
}

export interface AdminAddTrackingRequest {
  tracking_number: string;
  shipping_carrier: string;
}

/**
 * Fulfill an order (Admin)
 */
export const fulfillOrder = async (
  orderId: string,
  fulfillmentData: AdminFulfillOrderRequest
): Promise<boolean> => {
  try {
    showLoading("Processing order fulfillment...");
    const response = await axiosInstance.put<ApiResponse<null>>(
      `${BASE_URL}/fulfill-order/${orderId}`,
      fulfillmentData
    );
    closeLoading();

    if (response.data.success) {
      showSuccessMessage(
        response.data.message || "Order fulfilled successfully"
      );
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to fulfill order");
      return false;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      let errorMessage = "Failed to fulfill order";

      if (status === 400) {
        errorMessage =
          axiosError.response.data?.message ||
          "Invalid fulfillment data. Please check quantities and try again.";
      } else if (status === 403) {
        errorMessage = "You don't have permission to fulfill this order item.";
      } else if (status === 404) {
        errorMessage = "Order not found.";
      }

      showErrorMessage(errorMessage);
    } else {
      showErrorMessage("Failed to fulfill order. Please try again later.");
    }
    return false;
  }
};

/**
 * Add tracking information to an order (Admin)
 */
export const addTracking = async (
  orderId: string,
  trackingData: AdminAddTrackingRequest
): Promise<boolean> => {
  try {
    showLoading("Adding tracking information...");
    const response = await axiosInstance.post<ApiResponse<null>>(
      `${BASE_URL}/add-tracking/${orderId}`,
      trackingData
    );
    closeLoading();

    if (response.data.success) {
      showSuccessMessage(
        "Tracking information added successfully! Order status updated to shipped."
      );
      return true;
    } else {
      showErrorMessage(
        response.data.message ||
          "Failed to add tracking information. Please try again."
      );
      return false;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<{ message: string }>;

    if (axiosError.response) {
      const status = axiosError.response.status;
      let errorMessage: string;

      if (status === 400) {
        errorMessage =
          axiosError.response.data?.message ||
          "Invalid tracking data. Please check your input and try again.";
      } else if (status === 404) {
        errorMessage = "Order not found.";
      } else {
        errorMessage = "Failed to add tracking information. Please try again.";
      }

      showErrorMessage(errorMessage);
    } else {
      showErrorMessage(
        "Failed to add tracking information. Please try again later."
      );
    }
    return false;
  }
};

/**
 * Create an invoice for an order (Admin)
 */
export const createInvoice = async (orderId: string): Promise<boolean> => {
  try {
    showLoading("Creating invoice...");
    const response = await axiosInstance.put<ApiResponse<null>>(
      `${BASE_URL}/create-invoice/${orderId}`
    );
    closeLoading();

    if (response.data.success) {
      showSuccessMessage(
        response.data.message || "Invoice created successfully"
      );
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to create invoice");
      return false;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      let errorMessage = "Failed to create invoice";

      if (status === 400) {
        errorMessage =
          axiosError.response.data?.message ||
          "Cannot create invoice. Please check if order is fulfilled.";
      } else if (status === 404) {
        errorMessage = "Order not found.";
      }

      // Add a small delay to ensure loading popup is fully closed
      setTimeout(() => {
        showErrorMessage(errorMessage);
      }, 100);
    } else {
      setTimeout(() => {
        showErrorMessage("Failed to create invoice. Please try again later.");
      }, 100);
    }
    return false;
  }
};

/**
 * Check if an order has an invoice created
 */
export const hasInvoice = (order: Order): boolean => {
  return !!order.invoiceCreated;
};

/**
 * Check if invoice can be created (Admin)
 * Sequential workflow: Can create invoice after fulfillment is done
 */
export const canCreateInvoice = (order: Order): boolean => {
  // Invoice can be created if not already created AND order has been fulfilled
  return !order.invoiceCreated && hasOrderBeenFulfilled(order);
};

/**
 * Check if order can be fulfilled (Admin)
 * Sequential workflow: Can fulfill if:
 * - All OrderItems are not pending
 * - OrderShipments array is not empty
 * - Invoice is NOT yet created (fulfill comes before invoice)
 * - Order is not already shipped
 */
export const canFulfillOrder = (order: Order): boolean => {
  // OrderShipments array must not be empty
  if (!order.OrderShipments || order.OrderShipments.length === 0) {
    return false;
  }

  // All OrderItems must not be pending
  if (order.OrderItems && order.OrderItems.length > 0) {
    const hasPendingItems = order.OrderItems.some(
      (item) => item.status === "pending"
    );
    if (hasPendingItems) {
      return false;
    }
  }

  // Cannot fulfill if order is already shipped (tracking added)
  if (order.status === "shipped" || order.tracking_number) {
    return false;
  }

  // Sequential workflow: Can fulfill if invoice is NOT yet created
  // OR if invoice is created but no tracking info yet (allow update fulfillment)
  return !order.invoiceCreated || !hasTrackingInfo(order);
};

/**
 * Check if order has been fulfilled
 * Order is considered fulfilled if it has moved beyond pending status
 */
export const hasOrderBeenFulfilled = (order: Order): boolean => {
  // Order is fulfilled if all items are fulfilled or partially fulfilled (not pending or canceled)
  if (!order.OrderItems || order.OrderItems.length === 0) {
    return false;
  }
  
  // Check if all items are either fulfilled or partially_fulfilled (not pending or canceled)
  return order.OrderItems.every(
    (item) => item.status === "fulfilled" || item.status === "partially_fulfilled"
  );
};

/**
 * Check if tracking can be added (Admin)
 * Can add tracking if order is fulfilled but not yet shipped
 */
export const canAddTracking = (order: Order): boolean => {
  // Must be fulfilled first
  if (!hasOrderBeenFulfilled(order)) {
    return false;
  }

  // Cannot add if already shipped
  if (order.status === "shipped" || order.tracking_number) {
    return false;
  }

  return true;
};

/**
 * Check if order has tracking information
 */
export const hasTrackingInfo = (order: Order): boolean => {
  return !!(order.tracking_number && order.shipping_carrier);
};

// Revert step request interface
export interface RevertStepRequest {
  seller_id: string;
}

// Revert step response interface
export interface RevertStepResponse {
  success: boolean;
  message: string;
}

/**
 * Revert order fulfillment steps (Admin)
 *
 * Reverts various order fulfillment steps including:
 * - Pickup cancellation (if shippingOrderId exists and status is 'Not Started' or 'Pickup Pending')
 * - Invoice creation reversal (if invoiceCreated is true)
 * - Order fulfillment reversal (default case - destroys OrderShipment and resets OrderItems)
 *
 * @param orderId - Order ID (UUID) to revert steps for
 * @param sellerId - Seller ID (UUID) whose shipment needs to be reverted
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export const revertOrderStep = async (
  orderId: string,
  sellerId: string
): Promise<boolean> => {
  try {
    showLoading("Reverting order step...");

    const payload: RevertStepRequest = {
      seller_id: sellerId,
    };

    const response = await axiosInstance.put<RevertStepResponse>(
      `${BASE_URL}/revert-step/${orderId}`,
      payload
    );

    closeLoading();

    if (response.data.success) {
      showSuccessMessage(
        response.data.message || "Order step reverted successfully"
      );
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to revert order step");
      return false;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<RevertStepResponse>;

    if (axiosError.response) {
      const status = axiosError.response.status;
      const errorData = axiosError.response.data;
      let errorMessage = "Failed to revert order step";

      switch (status) {
        case 400:
          // Cannot revert picked up order
          errorMessage =
            errorData?.message || "Cannot revert order already picked up!";
          break;
        case 404:
          // Order not found or Shipment not found
          if (errorData?.message?.includes("Order not found")) {
            errorMessage = "Order not found";
          } else {
            errorMessage =
              errorData?.message || "Shipment not exist cannot be reverted!";
          }
          break;
        case 401:
          errorMessage = "Access denied. Admin authentication required.";
          break;
        case 500:
          errorMessage = errorData?.message || "Database transaction failed";
          break;
        default:
          errorMessage = errorData?.message || "Failed to revert order step";
      }

      showErrorMessage(errorMessage);
    } else {
      showErrorMessage("Failed to revert order step. Please try again later.");
    }

    return false;
  }
};

/**
 * Cancel an order or specific items in an order (Admin)
 * Sets order status to 'cancelled' and cancels all order items, or specific items if provided
 *
 * @param orderId - Order ID to cancel
 * @param itemIds - Optional array of specific item IDs to cancel. If not provided, cancels entire order
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export const cancelOrder = async (orderId: string, itemIds?: string[]): Promise<boolean> => {
  try {
    showLoading(itemIds ? "Cancelling items..." : "Cancelling order...");

    const payload = itemIds && itemIds.length > 0 ? { itemIds } : {};

    // Use the revert-step endpoint with a special payload to cancel the entire order
    // This will revert all fulfillment steps and cancel the order
    const response = await axiosInstance.put<{ success: boolean; message: string }>(
      `${BASE_URL}/cancel-order/${orderId}`,
      payload
    );

    closeLoading();

    if (response.data.success) {
      showSuccessMessage(response.data.message || (itemIds ? "Items cancelled successfully" : "Order cancelled successfully"));
      return true;
    } else {
      showErrorMessage(response.data.message || (itemIds ? "Failed to cancel items" : "Failed to cancel order"));
      return false;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<{ success: boolean; message: string }>;

    if (axiosError.response) {
      const status = axiosError.response.status;
      const errorData = axiosError.response.data;
      let errorMessage = itemIds ? "Failed to cancel items" : "Failed to cancel order";

      switch (status) {
        case 400:
          errorMessage = errorData?.message || (itemIds ? "Cannot cancel these items" : "Cannot cancel this order");
          break;
        case 404:
          errorMessage = "Cancel order endpoint not found. Please contact support.";
          break;
        case 401:
          errorMessage = "Access denied. Admin authentication required.";
          break;
        default:
          errorMessage = errorData?.message || (itemIds ? "Failed to cancel items" : "Failed to cancel order");
      }

      showErrorMessage(errorMessage);
    } else {
      showErrorMessage(itemIds ? "Failed to cancel items. Please try again later." : "Failed to cancel order. Please try again later.");
    }

    return false;
  }
};


/**
 * Get all orders for a specific customer (sorted by date DESC)
 */
export const getOrdersByCustomer = async (
  customerId: string
): Promise<{ orders: Order[]; total: number } | null> => {
  try {
    const response = await axiosInstance.get<ApiResponse<{
      orders: Order[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    }>>(
      `${BASE_URL}/get-orders-by-user/${customerId}`
    );

    if (response.data.success && response.data.data) {
      return {
        orders: response.data.data.orders,
        total: response.data.data.total
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return null;
  }
};

/**
 * Get total order count for a customer
 */
export const getCustomerOrderCount = async (
  customerId: string
): Promise<number> => {
  try {
    const result = await getOrdersByCustomer(customerId);
    return result ? result.total : 0;
  } catch (error) {
    console.error("Error fetching customer order count:", error);
    return 0;
  }
};

/**
 * Get the sequence number of an order for a customer
 * Returns the position of this order when sorted by date (ASC)
 * Oldest order = 1, Newest order = highest number
 * Example: If customer has 27 orders and this is the 5th oldest, returns 5
 */
export const getOrderSequenceNumber = async (
  customerId: string,
  orderId: string
): Promise<number> => {
  try {
    const result = await getOrdersByCustomer(customerId);
    if (!result || !result.orders || result.orders.length === 0) return 0;

    // Orders come sorted by date DESC from backend, so reverse to get ASC (oldest first)
    const reversedOrders = [...result.orders].reverse();
    const sequenceNumber = reversedOrders.findIndex((order) => order.id === orderId) + 1;
    return sequenceNumber > 0 ? sequenceNumber : 0;
  } catch (error) {
    console.error("Error getting order sequence number:", error);
    return 0;
  }
};

/**
 * Get order info including total count and sequence number
 */
export interface CustomerOrderInfo {
  totalOrders: number;
  sequenceNumber: number;
  isFirstOrder: boolean;
}

export const getCustomerOrderInfo = async (
  customerId: string,
  orderId: string
): Promise<CustomerOrderInfo> => {
  try {
    const result = await getOrdersByCustomer(customerId);
    
    if (!result || !result.orders || result.orders.length === 0) {
      return {
        totalOrders: 0,
        sequenceNumber: 0,
        isFirstOrder: false,
      };
    }

    // Orders come sorted by date DESC from backend, so reverse to get ASC (oldest first)
    const reversedOrders = [...result.orders].reverse();
    const sequenceNumber = reversedOrders.findIndex((order) => order.id === orderId) + 1;
    const isFirstOrder = sequenceNumber === 1; // First in ASC order = oldest = first order

    return {
      totalOrders: result.total, // Use the total from API, not the orders array length
      sequenceNumber,
      isFirstOrder,
    };
  } catch (error) {
    console.error("Error getting customer order info:", error);
    return {
      totalOrders: 0,
      sequenceNumber: 0,
      isFirstOrder: false,
    };
  }
};
