import axiosInstance from "../../axiosConfig";
import {
  showSuccessMessage,
  showErrorMessage,
  showLoading,
  closeLoading,
} from "../../swalConfig";
import { AxiosError } from "axios";

// Base URL for order API
const BASE_URL = "/seller/order";

// Address interface
export interface OrderAddress {
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  zip_code: string;
  country_code_iso: string;
  phone?: string;
}

// Variant interface for order items
export interface OrderVariant {
  id: string;
  price: string;
  seller_price?: string;
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

// Product interface (for order items)
export interface OrderProduct {
  id: string;
  title: string;
  description?: string;
  brand?: string;
  seller_id: string;
  has_variant?: boolean;
  // For non-variant products, these fields come directly from Product
  price?: string;
  sku?: string;
  image_urls?: string[] | { url: string; position: number }[];
  default_image_urls?: {
    url: string;
    position: number;
  }[];
  stock_qty?: number;
  weight?: string;
  status?: string;
}

// Order Item interface
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

// Order Shipment interface
export interface OrderShipment {
  id: string;
  order_id: string;
  seller_id: string;
  shippingOrderId: string;
  weight: string;
  length: string;
  breadth: string;
  height: string;
  totalPrice: string;
  invoiceCreated: boolean;
  labelImage?: string;
  status: string;
  createdAt: string;
}

// User interface
export interface OrderUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country_code: string;
  dob: string;
  gender: string;
  language: string;
}

// Order interface
export interface Order {
  id: string;
  user_id: string;
  cart_id: string;
  payment_id: string;
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
  refundAmount?: string;
  finalAmount: string;
  status: string;
  orderDate: string;
  shipping_address: OrderAddress;
  shipping_carrier: string;
  billing_address: OrderAddress;
  createdAt: string;
  updatedAt: string;
  OrderItems: OrderItem[];
  OrderShipments: OrderShipment[];
  User?: OrderUser;
}

// Fulfill Order Item interface
export interface FulfillOrderItem {
  orderItemId: string;
  quantityFulfilled: number;
}

// Fulfill Order Request interface
export interface FulfillOrderRequest {
  seller_id: string;
  items: FulfillOrderItem[];
}

// Invoice Item interface
export interface InvoiceItem {
  productName: string;
  quantityFulfilled: number;
  unitPrice: string;
  total: string;
}

// Invoice Response interface
export interface InvoiceResponse {
  order_id: string;
  seller_id: string;
  totalPrice: string;
  consignment: {
    weight: string;
    length: string;
    breadth: string;
    height: string;
  };
  items: InvoiceItem[];
  invoiceDate: string;
}

// Invoice Data interface for PDF generation
export interface InvoiceData {
  company: {
    name: string;
    gstin: string;
    address: string;
    pan: string;
    contact: string;
    email: string;
    fssai: string;
  };
  invoice: {
    number: string;
    date: string;
  };
  shipping: {
    placeOfSupply: string;
  };
  billTo: {
    name: string;
    address1: string;
    address2: string;
    gstin: string;
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
    igst: string;
  }>;
  totals: {
    totalQuantity: number;
    taxableAmount: string;
    igst: string;
    totalAmount: string;
    amountInWords: string;
  };
  bankDetails: {
    accountName: string;
    accountNumber: string;
    ifscCode: string;
  };
}

// Pickup Response interface
export interface PickupResponse {
  shippingOrderId: string;
}

// Download Label Response interface
export interface DownloadLabelResponse {
  labelImage: string;
  shippingOrderId: string;
  filename: string;
}

// Order statistics interface
export interface SellerOrderStatistics {
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

// Seller orders response interface
export interface SellerOrdersResponse {
  orders: Order[];
  statistics: SellerOrderStatistics;
  pagination: {
    totalOrders: number;
    currentPage: number;
    totalPages: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
  filters: {
    search?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    sort_by?: string;
    sort_order?: string;
    limit: number;
    offset: number;
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
 * Get all orders for a seller
 */
export const getAllOrders = async (
  sellerId: string,
  params: {
    offset: number;
    limit: number;
    search?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    sort_by?: string;
    sort_order?: string;
  } = { offset: 0, limit: 100 }
): Promise<SellerOrdersResponse> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("offset", params.offset.toString());
    queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.status) queryParams.append("status", params.status);
    if (params.date_from) queryParams.append("date_from", params.date_from);
    if (params.date_to) queryParams.append("date_to", params.date_to);
    if (params.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params.sort_order) queryParams.append("sort_order", params.sort_order);

    const response = await axiosInstance.get<ApiResponse<SellerOrdersResponse>>(
      `${BASE_URL}/get-orders/${sellerId}?${queryParams.toString()}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      showErrorMessage(response.data.message || "Failed to load orders");
      // Return a default structure to avoid undefined errors
      return {
        orders: [],
        statistics: {
          orders: { total: 0, today: 0 },
          itemsOrdered: { total: 0 },
          returns: { total: 0 },
          ordersFulfilled: { total: 0 },
          ordersDelivered: { total: 0 },
        },
        pagination: {
          totalOrders: 0,
          currentPage: 1,
          totalPages: 1,
          limit: params.limit,
          hasNextPage: false,
          hasPrevPage: false,
          nextPage: null,
          prevPage: null,
        },
        filters: params,
      };
    }
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response?.data?.message || "Failed to load orders"
      );
    } else {
      showErrorMessage("Failed to load orders. Please try again later.");
    }
    // Return a default structure to avoid undefined errors
    return {
      orders: [],
      statistics: {
        orders: { total: 0, today: 0 },
        itemsOrdered: { total: 0 },
        returns: { total: 0 },
        ordersFulfilled: { total: 0 },
        ordersDelivered: { total: 0 },
      },
      pagination: {
        totalOrders: 0,
        currentPage: 1,
        totalPages: 1,
        limit: params.limit,
        hasNextPage: false,
        hasPrevPage: false,
        nextPage: null,
        prevPage: null,
      },
      filters: params,
    };
  }
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
      setTimeout(() => {
        showErrorMessage(response.data.message || "Order not found");
      }, 100);
      return null;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      setTimeout(() => {
        showErrorMessage(
          axiosError.response?.data?.message || "Failed to load order details"
        );
      }, 100);
    } else {
      setTimeout(() => {
        showErrorMessage(
          "Failed to load order details. Please try again later."
        );
      }, 100);
    }
    return null;
  }
};

/**
 * Fulfill an order
 */
export const fulfillOrder = async (
  orderId: string,
  fulfillmentData: FulfillOrderRequest
): Promise<boolean> => {
  try {
    showLoading("Processing order fulfillment...");
    const response = await axiosInstance.post<ApiResponse<null>>(
      `${BASE_URL}/fulfill-order/${orderId}`,
      fulfillmentData
    );
    closeLoading();

    if (response.data.success) {
      // Add a small delay to ensure loading popup is fully closed
      setTimeout(() => {
        showSuccessMessage(
          response.data.message || "Order fulfilled successfully"
        );
      }, 100);
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

      // Add a small delay to ensure loading popup is fully closed
      setTimeout(() => {
        showErrorMessage(errorMessage);
      }, 100);
    } else {
      setTimeout(() => {
        showErrorMessage("Failed to fulfill order. Please try again later.");
      }, 100);
    }
    return false;
  }
};

/**
 * Create an invoice for an order
 */
export const createInvoice = async (
  orderId: string,
  sellerId: string
): Promise<InvoiceResponse | null> => {
  try {
    showLoading("Creating invoice...");
    const response = await axiosInstance.put<ApiResponse<InvoiceResponse>>(
      `${BASE_URL}/create-invoice/${orderId}`,
      { seller_id: sellerId }
    );
    closeLoading();

    if (response.data.success && response.data.data) {
      // Add a small delay to ensure loading popup is fully closed
      setTimeout(() => {
        showSuccessMessage(
          response.data.message || "Invoice created successfully"
        );
      }, 100);
      return response.data.data;
    } else {
      setTimeout(() => {
        showErrorMessage(response.data.message || "Failed to create invoice");
      }, 100);
      return null;
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
        errorMessage = "Order fulfillment details not found.";
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
    return null;
  }
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
      `${BASE_URL}/seller-invoice/${orderId}`
    );
    closeLoading();

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      setTimeout(() => {
        showErrorMessage(
          response.data.message || "Failed to load invoice data"
        );
      }, 100);
      return null;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      let errorMessage = "Failed to load invoice data";

      if (status === 404) {
        errorMessage = "Invoice not found. Please create invoice first.";
      }

      setTimeout(() => {
        showErrorMessage(errorMessage);
      }, 100);
    } else {
      setTimeout(() => {
        showErrorMessage(
          "Failed to load invoice data. Please try again later."
        );
      }, 100);
    }
    return null;
  }
};

/**
 * Raise a pickup request for an order
 */
export const raisePickup = async (
  orderId: string,
  sellerId: string,
  shipmentDetails: {
    weight: number;
    height: number;
    breadth: number;
    length: number;
  }
): Promise<PickupResponse | null> => {
  try {
    showLoading("Raising pickup request...");
    const response = await axiosInstance.put<ApiResponse<PickupResponse>>(
      `${BASE_URL}/raise-pickup/${orderId}`,
      {
        seller_id: sellerId,
        weight: shipmentDetails.weight,
        height: shipmentDetails.height,
        breadth: shipmentDetails.breadth,
        length: shipmentDetails.length,
      }
    );
    closeLoading();

    if (response.data.success && response.data.data) {
      // Add a small delay to ensure loading popup is fully closed
      setTimeout(() => {
        showSuccessMessage(
          response.data.message || "Pickup request raised successfully"
        );
      }, 100);
      return response.data.data;
    } else {
      setTimeout(() => {
        showErrorMessage(
          response.data.message || "Failed to raise pickup request"
        );
      }, 100);
      return null;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      let errorMessage = "Failed to raise pickup request";

      if (status === 400) {
        errorMessage =
          axiosError.response.data?.message ||
          "Cannot raise pickup. Please ensure invoice is created first.";
      } else if (status === 404) {
        errorMessage =
          axiosError.response.data?.message ||
          "Order or seller details not found.";
      } else if (
        status === 500 &&
        axiosError.response.data?.message?.includes("ShipMozo")
      ) {
        errorMessage =
          "Failed to connect with shipping partner. Please try again.";
      }

      // Add a small delay to ensure loading popup is fully closed
      setTimeout(() => {
        showErrorMessage(errorMessage);
      }, 100);
    } else {
      setTimeout(() => {
        showErrorMessage(
          "Failed to raise pickup request. Please try again later."
        );
      }, 100);
    }
    return null;
  }
};

/**
 * Download shipping label
 * This will trigger a file download directly in the browser
 *
 * Updated to handle base64 image data sent as JSON response
 */
export const downloadShippingLabel = async (
  orderId: string,
  sellerId: string
): Promise<boolean> => {
  try {
    showLoading("Downloading shipping label...");
    const response = await axiosInstance.post<
      ApiResponse<DownloadLabelResponse>
    >(`${BASE_URL}/download-label/${orderId}`, { seller_id: sellerId });
    closeLoading();

    if (response.data.success && response.data.data) {
      const { labelImage, filename } = response.data.data;

      // Convert base64 to blob
      const base64Data = labelImage.replace(/^data:image\/png;base64,/, "");
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setTimeout(() => {
        showSuccessMessage("Shipping label downloaded successfully");
      }, 100);
      return true;
    } else {
      setTimeout(() => {
        showErrorMessage(
          response.data.message || "Failed to download shipping label"
        );
      }, 100);
      return false;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      let errorMessage = "Failed to download shipping label";

      if (status === 404) {
        errorMessage = "Shipping label not found for this order.";
      } else if (axiosError.response.data?.message) {
        errorMessage = axiosError.response.data.message;
      }

      // Add a small delay to ensure loading popup is fully closed
      setTimeout(() => {
        showErrorMessage(errorMessage);
      }, 100);
    } else {
      setTimeout(() => {
        showErrorMessage(
          "Failed to download shipping label. Please try again later."
        );
      }, 100);
    }
    return false;
  }
};

// Helper functions for order management

/**
 * Check if order can be fulfilled
 */
export const canFulfillOrder = (order: Order, sellerId: string): boolean => {
  // Check if there are pending items for this seller
  const hasPendingItems = order.OrderItems.some(
    (item) => item.status === "pending" && item.seller_id === sellerId
  );

  // Check if invoice has been created for this seller
  const sellerShipment = order.OrderShipments.find(
    (shipment) => shipment.seller_id === sellerId
  );

  // Can fulfill if there are pending items OR if fulfillment exists but invoice hasn't been created
  return (
    hasPendingItems || (sellerShipment ? !sellerShipment.invoiceCreated : false)
  );
};

/**
 * Check if invoice can be created
 */
export const canCreateInvoice = (order: Order, sellerId: string): boolean => {
  // Check if there's a shipment for this seller without invoice
  const sellerShipment = order.OrderShipments.find(
    (shipment) => shipment.seller_id === sellerId
  );
  return sellerShipment ? !sellerShipment.invoiceCreated : false;
};

/**
 * Check if invoice already exists for an order
 */
export const hasInvoice = (order: Order, sellerId: string): boolean => {
  // Check if there's a shipment for this seller with invoice created
  const sellerShipment = order.OrderShipments.find(
    (shipment) => shipment.seller_id === sellerId
  );
  return sellerShipment ? sellerShipment.invoiceCreated : false;
};

/**
 * Check if pickup can be raised
 */
export const canRaisePickup = (order: Order, sellerId: string): boolean => {
  // Check if there's a shipment with invoice but no shipping order ID
  const sellerShipment = order.OrderShipments.find(
    (shipment) => shipment.seller_id === sellerId
  );
  return sellerShipment
    ? sellerShipment.invoiceCreated && !sellerShipment.shippingOrderId
    : false;
};

/**
 * Check if label can be downloaded
 */
export const canDownloadLabel = (order: Order, sellerId: string): boolean => {
  // Check if there's a shipment with shipping order ID
  const sellerShipment = order.OrderShipments.find(
    (shipment) => shipment.seller_id === sellerId
  );
  return sellerShipment ? !!sellerShipment.shippingOrderId : false;
};

/**
 * Get order status badge color
 */
export const getOrderStatusColor = (status: string): string => {
  const statusColors: { [key: string]: string } = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    fulfilled: "bg-green-100 text-green-800",
    partially_fulfilled: "bg-orange-100 text-orange-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    canceled: "bg-red-100 text-red-800",
  };
  return statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
};

/**
 * Format order date
 */
export const formatOrderDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Calculate total fulfilled quantity for an order
 */
export const getTotalFulfilledQuantity = (
  order: Order,
  sellerId: string
): number => {
  return order.OrderItems.filter((item) => item.seller_id === sellerId).reduce(
    (total, item) => total + item.quantityFulfilled,
    0
  );
};

/**
 * Calculate total requested quantity for an order
 */
export const getTotalRequestedQuantity = (
  order: Order,
  sellerId: string
): number => {
  return order.OrderItems.filter((item) => item.seller_id === sellerId).reduce(
    (total, item) => total + item.quantityRequested,
    0
  );
};

/**
 * Export seller orders to CSV/XLSX
 */
export const exportSellerOrders = async (
  sellerId: string,
  params: {
    offset: number;
    limit: number;
    search?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    sort_by?: string;
    sort_order?: string;
  },
  format: "csv" | "xlsx"
): Promise<boolean> => {
  try {
    showLoading(`Exporting seller orders to ${format.toUpperCase()}...`);

    const queryParams = new URLSearchParams();
    queryParams.append("offset", params.offset.toString());
    queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.status) queryParams.append("status", params.status);
    if (params.date_from) queryParams.append("date_from", params.date_from);
    if (params.date_to) queryParams.append("date_to", params.date_to);
    if (params.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params.sort_order) queryParams.append("sort_order", params.sort_order);
    queryParams.append("format", format);

    const response = await axiosInstance.get(
      `${BASE_URL}/export-orders/${sellerId}?${queryParams.toString()}`,
      { responseType: "blob" } // Important: responseType must be 'blob' for file downloads
    );
    closeLoading();

    if (response.status === 200) {
      const disposition = response.headers["content-disposition"];
      let filename = "seller_orders.csv";
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

      showSuccessMessage("Seller orders exported successfully!");
      return true;
    } else {
      const errorText = await response.data.text();
      let errorMessage = "Failed to export seller orders";
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
        const errorBlob = axiosError.response.data;
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const errorJson = JSON.parse(e.target?.result as string);
            showErrorMessage(
              errorJson.message || "Error exporting seller orders"
            );
          } catch (error) {
            console.warn("Could not parse error response as JSON:", error);
            showErrorMessage(
              "Error exporting seller orders. Could not parse error response."
            );
          }
        };
        reader.onerror = () => {
          showErrorMessage(
            "Error exporting seller orders. Failed to read error response."
          );
        };
        reader.readAsText(errorBlob);
      } else if (axiosError.response && axiosError.response.data) {
        const errorData = axiosError.response.data as { message?: string };
        showErrorMessage(errorData.message || "Error exporting seller orders");
      } else if (axiosError.code === "ECONNABORTED") {
        showErrorMessage(
          "Export request timed out. Please try again or reduce the export range."
        );
      } else {
        showErrorMessage(
          "Failed to export seller orders. Please try again later."
        );
      }
    }
    return false;
  }
};
