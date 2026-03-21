import axiosInstance from "../../axiosConfig";
import { showErrorMessage, showLoading, closeLoading, showConfirmation, showSuccessMessage } from "../../swalConfig";
import { AxiosError } from "axios";

// Cart Item interface
export interface CartItem {
  id: string;
  cart_id: string;
  variant_id: string;
  product_id?: string; // For backward compatibility
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
  Variant?: {
    id: string;
    title?: string;
    brand?: string;
    type?: string;
    price?: number;
    compare_price?: number;
    sku?: string;
    stock_qty?: number;
    image_urls?: {
      url: string;
      position: number;
      key?: string;
      originalName?: string;
    }[];
    option_values?: {
      [key: string]: string;
    };
    Product?: {
      id: string;
      title: string;
      description: string;
      short_description: string;
      image_urls?: {
        url: string;
        position: number;
      }[];
      default_image_urls?: {
        url: string;
        position: number;
        key?: string;
        originalName?: string;
      }[];
      price: number;
      compare_price: number;
      brand: string;
      type: string;
      stock_qty: number;
      status: string;
    };
  };
  Product?: {
    id: string;
    title: string;
    description: string;
    short_description: string;
    image_urls: {
      url: string;
      position: number;
    }[];
    price: number;
    compare_price: number;
    brand: string;
    type: string;
    stock_qty: number;
    status: string;
  };
}

// User interface for abandoned cart
export interface AbandonedCartUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  is_marketing_emails: boolean;
  is_marketing_sms: boolean;
}

// Abandoned Cart interface
export interface AbandonedCart {
  id: string;
  user_id: string;
  status: "abandoned";
  total_price: number;
  currency?: string;
  recovery_email_sent?: boolean;
  shipping_carrier?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  CartItems: CartItem[];
  User?: AbandonedCartUser;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface AbandonedCartsResponse {
  carts: AbandonedCart[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCarts: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AbandonedCartsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: 'newest' | 'oldest';
  sort_by?: 'createdAt' | 'total_price';
  sort_order?: 'ASC' | 'DESC';
}

const BASE_URL = "/admin/abandoned";

// Get all abandoned carts
export const getAllAbandonedCarts = async (
  params?: AbandonedCartsQueryParams
): Promise<AbandonedCartsResponse> => {
  try {
    // showLoading("Loading abandoned carts...");

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);
    if (params?.sort) queryParams.append("sort", params.sort);

    const response = await axiosInstance.get<ApiResponse<AbandonedCartsResponse>>(
      `${BASE_URL}/get-abandoned-carts?${queryParams.toString()}`
    );

    closeLoading();

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      console.log(response.data.message || "No abandoned carts found");
      return {
        carts: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalCarts: 0,
          limit: 20,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      const status = axiosError.response.status;

      if (status === 401) {
        showErrorMessage("Unauthorized access. Admin authentication required.");
      } else if (status === 403) {
        showErrorMessage("Insufficient admin privileges.");
      } else {
        showErrorMessage(
          axiosError.response.data?.message || "Error loading abandoned carts"
        );
      }
    } else {
      showErrorMessage(
        "Failed to load abandoned carts. Please try again later."
      );
    }

    return {
      carts: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCarts: 0,
        limit: 20,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
};

// Get single abandoned cart by ID
export const getAbandonedCart = async (
  cartId: string
): Promise<AbandonedCart | null> => {
  try {
    showLoading("Loading abandoned cart details...");

    const response = await axiosInstance.get<ApiResponse<AbandonedCart>>(
      `${BASE_URL}/get-abandoned-cart/${cartId}`
    );

    closeLoading();

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      showErrorMessage(response.data.message || "Abandoned cart not found");
      return null;
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      const status = axiosError.response.status;

      if (status === 400) {
        showErrorMessage("Invalid cart ID format");
      } else if (status === 401) {
        showErrorMessage("Unauthorized access. Admin authentication required.");
      } else if (status === 403) {
        showErrorMessage("Insufficient admin privileges.");
      } else if (status === 404) {
        showErrorMessage("Abandoned cart not found");
      } else {
        showErrorMessage(
          axiosError.response.data?.message ||
            "Error loading abandoned cart details"
        );
      }
    } else {
      showErrorMessage(
        "Failed to load abandoned cart details. Please try again later."
      );
    }

    return null;
  }
};

// Helper function to calculate cart statistics
export const calculateAbandonedCartStats = (carts: AbandonedCart[]) => {
  if (!carts || carts.length === 0) {
    return {
      totalCarts: 0,
      totalValue: 0,
      averageValue: 0,
      totalItems: 0,
      averageItems: 0,
    };
  }

  const totalValue = carts.reduce(
    (sum, cart) => sum + (cart.total_price || 0),
    0
  );
  const totalItems = carts.reduce(
    (sum, cart) =>
      sum +
      cart.CartItems.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );

  return {
    totalCarts: carts.length,
    totalValue: totalValue,
    averageValue: totalValue / carts.length,
    totalItems: totalItems,
    averageItems: totalItems / carts.length,
  };
};

// Helper function to get unique users with abandoned carts
export const getUniqueAbandonedUsers = (
  carts: AbandonedCart[]
): AbandonedCartUser[] => {
  const uniqueUsers = new Map<string, AbandonedCartUser>();

  carts.forEach((cart) => {
    if (cart.User && !uniqueUsers.has(cart.User.id)) {
      uniqueUsers.set(cart.User.id, cart.User);
    }
  });

  return Array.from(uniqueUsers.values());
};

// Helper function to get most frequently abandoned products
export const getMostAbandonedProducts = (carts: AbandonedCart[]) => {
  const productCount = new Map<
    string,
    { count: number; totalQuantity: number }
  >();

  carts.forEach((cart) => {
    cart.CartItems.forEach((item) => {
      const productId = item.variant_id || item.product_id || item.id;
      const existing = productCount.get(productId) || {
        count: 0,
        totalQuantity: 0,
      };
      productCount.set(productId, {
        count: existing.count + 1,
        totalQuantity: existing.totalQuantity + item.quantity,
      });
    });
  });

  return Array.from(productCount.entries())
    .map(([productId, stats]) => ({
      productId,
      abandonmentCount: stats.count,
      totalQuantityAbandoned: stats.totalQuantity,
    }))
    .sort((a, b) => b.abandonmentCount - a.abandonmentCount);
};

// Helper function to filter carts by date range
export const filterCartsByDateRange = (
  carts: AbandonedCart[],
  startDate: Date,
  endDate: Date
): AbandonedCart[] => {
  return carts.filter((cart) => {
    const cartDate = new Date(cart.createdAt);
    return cartDate >= startDate && cartDate <= endDate;
  });
};

// Helper function to filter carts by minimum value
export const filterCartsByMinValue = (
  carts: AbandonedCart[],
  minValue: number
): AbandonedCart[] => {
  return carts.filter((cart) => (cart.total_price || 0) >= minValue);
};

// Helper function to get carts by user
export const getCartsByUser = (
  carts: AbandonedCart[],
  userId: string
): AbandonedCart[] => {
  return carts.filter((cart) => cart.user_id === userId);
};

// Helper function to format cart data for export
export const formatCartsForExport = (carts: AbandonedCart[]) => {
  return carts.map((cart) => ({
    cartId: cart.id,
    userId: cart.user_id,
    userEmail: cart.User?.email || "N/A",
    userName: cart.User
      ? `${cart.User.first_name} ${cart.User.last_name}`
      : "N/A",
    userPhone: cart.User?.phone || "N/A",
    totalAmount: cart.total_price || 0,
    currency: cart.currency,
    itemCount: cart.CartItems.length,
    totalQuantity: cart.CartItems.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
    items: cart.CartItems.map((item) => ({
      productId: item.variant_id || item.product_id || item.id,
      variantId: item.variant_id,
      quantity: item.quantity,
      price: item.price,
      totalValue: item.quantity * item.price,
    })),
  }));
};

// Helper function to validate cart ID format (UUID)
export const isValidCartId = (cartId: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(cartId);
};

// Helper function to get abandonment insights
export const getAbandonmentInsights = (carts: AbandonedCart[]) => {
  const insights = {
    recentAbandonments: carts
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 10),
    highValueAbandonments: carts
      .filter((cart) => (cart.total_price || 0) > 100)
      .sort((a, b) => (b.total_price || 0) - (a.total_price || 0))
      .slice(0, 10),
    frequentAbandonerUsers: getUniqueAbandonedUsers(carts)
      .map((user) => ({
        user,
        abandonmentCount: carts.filter((cart) => cart.user_id === user.id)
          .length,
        totalAbandonedValue: carts
          .filter((cart) => cart.user_id === user.id)
          .reduce((sum, cart) => sum + (cart.total_price || 0), 0),
      }))
      .filter((userStats) => userStats.abandonmentCount > 1)
      .sort((a, b) => b.abandonmentCount - a.abandonmentCount)
      .slice(0, 10),
    topAbandonedProducts: getMostAbandonedProducts(carts).slice(0, 10),
  };

  return insights;
};

// Bulk delete abandoned carts
export const bulkDeleteAbandonedCarts = async (
  cartIds: string[]
): Promise<{ success: boolean; confirmed: boolean }> => {
  try {
    if (!cartIds || cartIds.length === 0) {
      showErrorMessage("No carts selected for deletion");
      return { success: false, confirmed: false };
    }

    const result = await showConfirmation(
      "Delete Abandoned Carts?",
      `Are you sure you want to delete ${cartIds.length} abandoned cart${cartIds.length !== 1 ? "s" : ""}? This action cannot be undone.`
    );

    if (!result.isConfirmed) {
      return { success: false, confirmed: false };
    }

    showLoading(`Deleting ${cartIds.length} cart${cartIds.length !== 1 ? "s" : ""}...`);

    const response = await axiosInstance.post<
      ApiResponse<{ deletedCount: number }>
    >(`/admin/abandoned/bulk-delete-abandoned-carts`, {
      cartIds,
    });

    closeLoading();

    if (response.data.success) {
      showSuccessMessage(
        response.data.message || `Successfully deleted ${response.data.data?.deletedCount || cartIds.length} cart${response.data.data?.deletedCount !== 1 ? "s" : ""}`
      );
      return { success: true, confirmed: true };
    } else {
      showErrorMessage(
        response.data.message || "Failed to delete abandoned carts"
      );
      return { success: false, confirmed: true };
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      console.error("Error response:", axiosError.response.data);
      showErrorMessage(
        axiosError.response.data?.message || "Error deleting abandoned carts"
      );
    } else {
      console.error("Error:", error);
      showErrorMessage("Failed to delete abandoned carts. Please try again.");
    }
    return { success: false, confirmed: true };
  }
};
