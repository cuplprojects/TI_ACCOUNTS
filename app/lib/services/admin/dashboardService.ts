import axiosInstance from "../../axiosConfig";
import {
  showSuccessMessage,
  showErrorMessage,
  showLoading,
  closeLoading,
} from "../../swalConfig";
import { AxiosError } from "axios";

const BASE_URL = "/admin/dashboard";

// API Response interface
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Types
export interface SummaryData {
  sales: {
    total: number;
    growth: number;
  };
  orders: {
    total: number;
    growth: number;
  };
  visitors: {
    total: number;
    growth: number;
  };
}

export interface RevenueTrendItem {
  date: string;
  revenue: number;
  orders: number;
}

export interface RevenueData {
  revenueTrend: RevenueTrendItem[];
  monthlyTarget: {
    target: number;
    achieved: number;
    percentage: number;
  };
  topCategories: Array<{
    name: string;
    amount: number;
  }>;
}

export interface ConversionData {
  activeUsers: {
    total: number;
    countries: Array<{
      name: string;
      percent: number;
      count?: number;
    }>;
  };
  conversion: {
    views: number;
    addToCart: number;
    checkout: number;
    completed: number;
    abandoned: number;
  };
}

export interface BrandData {
  id?: string;
  name: string;
  percent: number;
  itemCount?: number;
}

export interface CategoryData {
  id?: string;
  name: string;
  itemCount?: number;
  amount?: number;
}

export interface TrafficData {
  sources: BrandData[];
  totalOrders: number;
}

export interface ProductData {
  id: string;
  title: string;
  brand: string;
  orderCount: number;
  totalAmount: number;
  percent?: number;
}

export interface SellerData {
  id: string;
  name: string;
  email?: string;
  orderCount: number;
  totalAmount: number;
  percent?: number;
}

export interface OrderItemData {
  orderId: string;
  customer: string;
  date: string;
  qty: number;
  total: number;
  status: string;
}

export interface ActivityData {
  orders: OrderItemData[];
  activities: string[];
}

// Get Summary KPI data
export const getSummary = async (): Promise<SummaryData | null> => {
  try {
    const response = await axiosInstance.get<SummaryData>(`${BASE_URL}/summary`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error loading summary data"
      );
    } else {
      showErrorMessage("Failed to load summary data. Please try again later.");
    }
    return null;
  }
};

// Get Revenue Analytics data
export const getRevenue = async (range: string = "month", startDate?: string, endDate?: string): Promise<RevenueData | null> => {
  try {
    const params: any = { range };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await axiosInstance.get<RevenueData>(`${BASE_URL}/revenue`, {
      params,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error loading revenue data"
      );
    } else {
      showErrorMessage("Failed to load revenue data. Please try again later.");
    }
    return null;
  }
};

// Get Conversion Analytics data
export const getConversion = async (period: string = "week"): Promise<ConversionData | null> => {
  try {
    const response = await axiosInstance.get<ConversionData>(`${BASE_URL}/conversion`, {
      params: { period },
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error loading conversion data"
      );
    } else {
      showErrorMessage("Failed to load conversion data. Please try again later.");
    }
    return null;
  }
};

// Get Top Brands data
export const getTopBrands = async (): Promise<RevenueData | null> => {
  try {
    const response = await axiosInstance.get<RevenueData>(`${BASE_URL}/traffic`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error loading top brands data"
      );
    } else {
      showErrorMessage("Failed to load top brands data. Please try again later.");
    }
    return null;
  }
};

// Get Top Sellers data
export const getTopSellers = async (): Promise<any | null> => {
  try {
    const response = await axiosInstance.get<any>(`${BASE_URL}/top-sellers`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error loading top sellers data"
      );
    } else {
      showErrorMessage("Failed to load top sellers data. Please try again later.");
    }
    return null;
  }
};

// Get Top Products data
export const getTopProducts = async (): Promise<any | null> => {
  try {
    const response = await axiosInstance.get<any>(`${BASE_URL}/top-products`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error loading top products data"
      );
    } else {
      showErrorMessage("Failed to load top products data. Please try again later.");
    }
    return null;
  }
};

// Get Activity and Recent Orders
export const getActivity = async (
  page: number = 1,
  limit: number = 5
): Promise<ActivityData | null> => {
  try {
    const response = await axiosInstance.get<ActivityData>(`${BASE_URL}/activity`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error loading activity data"
      );
    } else {
      showErrorMessage("Failed to load activity data. Please try again later.");
    }
    return null;
  }
};

// Get all dashboard data in parallel
export const getAllDashboardData = async () => {
  try {
    showLoading("Loading dashboard...");
    const [summary, revenue, conversion, topBrands, activity] = await Promise.all([
      getSummary(),
      getRevenue("month"),
      getConversion(),
      getTopBrands(),
      getActivity(1, 5),
    ]);
    closeLoading();

    if (summary && revenue && conversion && topBrands && activity) {
      return {
        summary,
        revenue,
        conversion,
        topBrands,
        activity,
      };
    } else {
      showErrorMessage("Failed to load some dashboard data");
      return null;
    }
  } catch (error) {
    closeLoading();
    showErrorMessage("Error loading dashboard data");
    console.error("Error fetching dashboard data:", error);
    return null;
  }
};

export default {
  getSummary,
  getRevenue,
  getConversion,
  getTopBrands,
  getTopSellers,
  getTopProducts,
  getActivity,
  getAllDashboardData,
};
