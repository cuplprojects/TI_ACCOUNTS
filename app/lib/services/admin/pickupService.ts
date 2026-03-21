import axiosInstance from "../../axiosConfig";
import {
  showSuccessMessage,
  showErrorMessage,
  showLoading,
  closeLoading,
} from "../../swalConfig";
import { AxiosError } from "axios";

// Base URL for pickup API
const BASE_URL = "/admin/pickup";

// Address interface
export interface PickupAddress {
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  zip_code: string;
  country_code_iso: string;
  landmark?: string;
}

// Business hours interface
export interface BusinessHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

// Contact person interface
export interface ContactPerson {
  name: string;
  designation: string;
  phone: string;
  email: string;
}

// Seller Address interface
export interface SellerAddress {
  id: string;
  seller_id: string;
  type: string;
  country: string;
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2: string;
  company: string;
  city: string;
  state: string;
  zip_code: string;
  country_code: string;
  country_code_iso: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Seller interface
export interface PickupSeller {
  id: string;
  firm_name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  country_code: string;
  phone: string;
  alternate_phone?: string;
  entity_type: string;
  is_gst_registered: boolean;
  gstin: string;
  password: string;
  is_marketing_emails: boolean;
  is_marketing_sms: boolean;
  last_order_received: string | null;
  shipping_criteria: string;
  warehouse_id: string;
  isFirstLogin: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  Addresses?: SellerAddress[];
  pickup_address?: PickupAddress;
  business_hours?: BusinessHours;
  contact_person?: ContactPerson;
  special_instructions?: string;
  preferred_pickup_time?: string;
}

// Order item interface
export interface PickupOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  seller_id: string;
  quantityRequested: number;
  quantityFulfilled: number;
  unitPrice: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Order address interface
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

// Pickup details (order) interface
export interface PickupDetails {
  id: string;
  user_id: string;
  cart_id: string;
  payment_id: string;
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
  finalAmount: string;
  status: string;
  shipping_address: OrderAddress;
  billing_address: OrderAddress;
  createdAt: string;
  updatedAt: string;
  OrderItems: PickupOrderItem[];
}

// Pickup interface
export interface Pickup {
  id: string;
  order_id: string;
  seller_id: string;
  shippingOrderId: string;
  labelImage: string | null;
  weight: string;
  length: string;
  breadth: string;
  height: string;
  totalPrice: string;
  invoiceCreated: boolean;
  status: PickupStatus;
  trackingNumber?: string;
  shippingCarrier?: string;
  createdAt: string;
  updatedAt: string;
  Seller: PickupSeller;
  pickupDetails?: PickupDetails;
  Order?: {
    id: string;
    OrderItems: Array<{
      id: string;
      product_id: string;
      quantityRequested: number;
      quantityFulfilled: number;
      unitPrice: string;
      status: string;
      Product: {
        id: string;
        serial_no: string;
        title: string;
        description: string;
        short_description: string;
        default_image_urls: Array<{
          url: string;
          position: number;
        }>;
        region_of_origin: string;
        hs_code: string;
        page_title: string;
        page_description: string;
        page_url: string;
        type: string;
        brand: string;
        margin_contribution: number;
        gst_percent: number;
        seller_id: string;
        status: string;
        has_variant: boolean;
        default_variant: string;
        variant_id: string;
        createdAt: string;
        updatedAt: string;
        deletedAt: string | null;
      };
      Variant: {
        id: string;
        image_urls: Array<{
          url: string;
          position: number;
        }>;
        price: number;
        compare_price: number;
        cost_per_item: number;
        physical_product: boolean;
        is_tracking_inventory: boolean;
        stock_qty: number;
        sell_out_of_stock: boolean;
        sku: string;
        barcode: string | null;
        weight: number;
        length: number;
        breadth: number;
        height: number;
        option_values: Record<string, string>;
        createdAt: string;
        updatedAt: string;
        deletedAt: string | null;
      };
    }>;
  };
}

// Pickup status enum
export type PickupStatus =
  | "Not started"
  | "Ready for pickup"
  | "Pickup scheduled"
  | "Pickup in progress"
  | "Picked up"
  | "In transit"
  | "Out for delivery"
  | "Delivered"
  | "Failed pickup"
  | "Cancelled";

// Sort options type
export type PickupSortOption =
  | "newest"
  | "oldest"
  | "status_asc"
  | "status_desc"
  | "weight_asc"
  | "weight_desc"
  | "price_asc"
  | "price_desc";

// Invoice status type
export type InvoiceStatus = "created" | "pending";

// Pagination interface
export interface PickupPagination {
  currentPage: number;
  totalPages: number;
  totalPickups: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

// Filter interface
export interface PickupFilters {
  search: string | null;
  status: PickupStatus | null;
  seller_id: string | null;
  invoice_status: InvoiceStatus | null;
  date_from: string | null;
  date_to: string | null;
  sort: PickupSortOption;
}

// Summary interface
export interface PickupSummary {
  totalPickups: number;
  statusBreakdown: {
    readyForPickup: number;
    pickupScheduled: number;
    pickedUp: number;
    inTransit: number;
    delivered: number;
  };
  invoiceBreakdown: {
    created: number;
    pending: number;
  };
}

// Pickups response interface
export interface PickupsResponse {
  pickups: Pickup[];
  pagination: PickupPagination;
  filters: PickupFilters;
  summary?: PickupSummary;
}

// Query parameters interface
export interface PickupQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PickupStatus;
  seller_id?: string;
  invoice_status?: InvoiceStatus;
  date_from?: string;
  date_to?: string;
  sort?: PickupSortOption;
}

// API response interface
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

/**
 * Get all pickups with pagination and filtering
 */
export const getAllPickups = async (
  params: PickupQueryParams = {}
): Promise<PickupsResponse | null> => {
  try {
    // Build query string
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.status) queryParams.append("status", params.status);
    if (params.seller_id) queryParams.append("seller_id", params.seller_id);
    if (params.invoice_status)
      queryParams.append("invoice_status", params.invoice_status);
    if (params.date_from) queryParams.append("date_from", params.date_from);
    if (params.date_to) queryParams.append("date_to", params.date_to);
    if (params.sort) queryParams.append("sort", params.sort);

    const response = await axiosInstance.get<ApiResponse<PickupsResponse>>(
      `${BASE_URL}/get-pickups${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      console.error("API Error:", response.data.message);
      showErrorMessage(response.data.message || "Failed to load pickups");
      return null;
    }
  } catch (error) {
    console.error("Fetch Error:", error);
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error loading pickups"
      );
    } else {
      showErrorMessage("Failed to load pickups. Please try again later.");
    }
    return null;
  }
};

/**
 * Get a single pickup by ID
 */
export const getPickup = async (pickupId: string): Promise<Pickup | null> => {
  try {
    showLoading("Loading pickup details...");
    const response = await axiosInstance.get<ApiResponse<Pickup>>(
      `${BASE_URL}/get-pickup/${pickupId}`
    );
    closeLoading();

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      showErrorMessage(response.data.message || "Pickup not found");
      return null;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error loading pickup details"
      );
    } else {
      showErrorMessage(
        "Failed to load pickup details. Please try again later."
      );
    }
    return null;
  }
};

/**
 * Get pickup status color for UI display
 */
export const getPickupStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "not started":
      return "#FFA500"; // Orange
    case "ready for pickup":
      return "#2ECC71"; // Green
    case "pickup scheduled":
      return "#3498DB"; // Blue
    case "pickup in progress":
      return "#00BCD4"; // Cyan
    case "picked up":
      return "#9B59B6"; // Purple
    case "in transit":
      return "#FF9800"; // Orange
    case "out for delivery":
      return "#FFC107"; // Amber
    case "delivered":
      return "#4CAF50"; // Green
    case "failed pickup":
      return "#E74C3C"; // Red
    case "cancelled":
      return "#95A5A6"; // Gray
    default:
      return "#95A5A6"; // Gray
  }
};

/**
 * Get pickup status badge class for UI display
 */
export const getPickupStatusBadgeClass = (status: PickupStatus): string => {
  const classes: Record<PickupStatus, string> = {
    "Not started": "bg-yellow-100 text-yellow-800",
    "Ready for pickup": "bg-green-100 text-green-800",
    "Pickup scheduled": "bg-blue-100 text-blue-800",
    "Pickup in progress": "bg-cyan-100 text-cyan-800",
    "Picked up": "bg-purple-100 text-purple-800",
    "In transit": "bg-orange-100 text-orange-800",
    "Out for delivery": "bg-amber-100 text-amber-800",
    Delivered: "bg-green-100 text-green-800",
    "Failed pickup": "bg-red-100 text-red-800",
    Cancelled: "bg-gray-100 text-gray-800",
  };
  return classes[status] || "bg-gray-100 text-gray-800";
};

/**
 * Format pickup status for display
 */
export const formatPickupStatus = (status: string): string => {
  return status;
};

/**
 * Download shipping label
 */
export const downloadShippingLabel = (
  labelImage: string,
  shippingOrderId: string
): void => {
  if (!labelImage) {
    showErrorMessage("Shipping label not available");
    return;
  }

  try {
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${labelImage}`;
    link.download = `shipping-label-${shippingOrderId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccessMessage("Shipping label downloaded successfully");
  } catch {
    showErrorMessage("Failed to download shipping label");
  }
};

/**
 * Get all pickup statuses
 */
export const getAllPickupStatuses = (): {
  value: PickupStatus | "";
  label: string;
}[] => {
  return [
    { value: "", label: "All Statuses" },
    { value: "Not started", label: "Not Started" },
    { value: "Ready for pickup", label: "Ready for Pickup" },
    { value: "Pickup scheduled", label: "Pickup Scheduled" },
    { value: "Pickup in progress", label: "Pickup in Progress" },
    { value: "Picked up", label: "Picked Up" },
    { value: "In transit", label: "In Transit" },
    { value: "Out for delivery", label: "Out for Delivery" },
    { value: "Delivered", label: "Delivered" },
    { value: "Failed pickup", label: "Failed Pickup" },
    { value: "Cancelled", label: "Cancelled" },
  ];
};

/**
 * Get sort options
 */
export const getPickupSortOptions = (): {
  value: PickupSortOption;
  label: string;
}[] => {
  return [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "status_asc", label: "Status A-Z" },
    { value: "status_desc", label: "Status Z-A" },
    { value: "weight_asc", label: "Lightest First" },
    { value: "weight_desc", label: "Heaviest First" },
    { value: "price_asc", label: "Lowest Value" },
    { value: "price_desc", label: "Highest Value" },
  ];
};

/**
 * Get invoice status options
 */
export const getInvoiceStatusOptions = (): {
  value: InvoiceStatus | "";
  label: string;
}[] => {
  return [
    { value: "", label: "All Invoices" },
    { value: "created", label: "Invoice Created" },
    { value: "pending", label: "Invoice Pending" },
  ];
};

/**
 * Format business hours for display
 */
export const formatBusinessHours = (hours: BusinessHours): string => {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const currentDay = days[new Date().getDay()] as keyof BusinessHours;

  const todayHours = hours[currentDay];
  if (todayHours.toLowerCase() === "closed") {
    return "Closed today";
  }

  return `Today: ${todayHours}`;
};

/**
 * Check if pickup is ready for collection
 */
export const isPickupReady = (pickup: Pickup): boolean => {
  return (
    pickup.status === "Ready for pickup" &&
    pickup.invoiceCreated &&
    pickup.labelImage !== null
  );
};

/**
 * Get pickup dimensions string
 */
export const getPickupDimensions = (pickup: Pickup): string => {
  return `${pickup.length} × ${pickup.breadth} × ${pickup.height} cm`;
};

/**
 * Format date for display - DD/MM/YYYY HH:MM
 */
export const formatPickupDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};
