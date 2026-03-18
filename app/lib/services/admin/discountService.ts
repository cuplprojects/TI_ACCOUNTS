import axiosInstance from "../../axiosConfig";
import {
  showSuccessMessage,
  showErrorMessage,
  showLoading,
  closeLoading,
  showConfirmation,
} from "../../swalConfig";
import { AxiosError } from "axios";

// Types for associations
export interface DiscountProduct {
  id: string;
  name: string;
}
export interface DiscountCategory {
  id: string;
  name: string;
}
export interface DiscountCustomer {
  id: string;
  first_name: string;
  last_name: string;
}

// Discount interface
export interface Discount {
  discount_category: any;
  id?: string;
  method: "Discount Code" | "Automatic Discount";
  discount_code?: string | null;
  discount_type: "percent" | "flat" | "free";
  discount_value: number;
  minimum_type: "NA" | "amount" | "quantity";
  minimum_value: number;
  eligibility: "all customers" | "specific segment" | "specific customer";
  uses: "one use per customer" | "no of times";
  max_uses?: number | null;
  applicability_type:
  | "all products"
  | "specific products"
  | "specific categories"
  | "buy x get y";
  buy_from?: "any" | "specific";
  productIds?: string[];
  collectionIds?: string[];
  customerIds?: string[];
  countryIds?: string[];
  customer_ids?: string[];
  country_ids?: string[];
  buy_quantity?: number | null;

  get_quantity?: number | null;
  start_date: string;
  start_time: string;
  set_end: boolean;
  end_date?: string | null;
  end_time?: string | null;
  countries?: string;
  excludeShipping?: boolean;
  combinations?: {
    product?: boolean;
    order?: boolean;
  };
  appliesToType?: string;
  createdAt?: string;
  updatedAt?: string;
  Products?: DiscountProduct[];
  Categories?: DiscountCategory[];
  Customers?: DiscountCustomer[];
}


interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Response type for applyDiscount
interface ApplyDiscountResponse {
  discountId: string;
  discountAmount: number;
  cartTotalBeforeDiscount: number;
  cartTotalAfterDiscount: number;
}

const BASE_URL = "/admin/discount";

// Get all discounts
export const getAllDiscounts = async (): Promise<Discount[]> => {
  try {
    showLoading("Loading discounts...");
    const response = await axiosInstance.get<ApiResponse<Discount[]>>(
      `${BASE_URL}/get-discounts`
    );
    closeLoading();
    if (response.data.success) {
      return response.data.data || [];
    } else {
      throw new Error(response.data.message || "No discounts found");
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      throw new Error(
        axiosError.response.data?.message || "Error loading discounts"
      );
    } else {
      throw new Error("Failed to load discounts. Please try again later.");
    }
  }
};

// Get single discount
export const getDiscount = async (
  discountId: string
): Promise<Discount | null> => {
  try {
    showLoading("Loading discount details...");
    const response = await axiosInstance.get<ApiResponse<Discount>>(
      `${BASE_URL}/get-discount/${discountId}`
    );
    closeLoading();
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      showErrorMessage(response.data.message || "Discount not found");
      return null;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error loading discount details"
      );
    } else {
      showErrorMessage(
        "Failed to load discount details. Please try again later."
      );
    }
    return null;
  }
};

// Create discount
export const createDiscount = async (
  discountData: Partial<Discount>
): Promise<boolean> => {
  try {
    showLoading("Creating discount...");
    const response = await axiosInstance.post<ApiResponse<Discount>>(
      `${BASE_URL}/create-discount`,
      discountData
    );
    closeLoading();
    if (response.data.success) {
      showSuccessMessage(
        response.data.message || "Discount created successfully!"
      );
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to create discount");
      return false;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error creating discount"
      );
    } else {
      showErrorMessage("Failed to create discount. Please try again later.");
    }
    return false;
  }
};

// Update discount
export const updateDiscount = async (
  discountId: string,
  discountData: Partial<Discount>
): Promise<boolean> => {
  try {
    showLoading("Updating discount...");
    const response = await axiosInstance.put<ApiResponse<Discount>>(
      `${BASE_URL}/update-discount/${discountId}`,
      discountData
    );
    closeLoading();
    if (response.data.success) {
      showSuccessMessage(
        response.data.message || "Discount updated successfully!"
      );
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to update discount");
      return false;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error updating discount"
      );
    } else {
      showErrorMessage("Failed to update discount. Please try again later.");
    }
    return false;
  }
};

// Delete discount
export const deleteDiscount = async (discountId: string): Promise<boolean> => {
  try {
    showLoading("Deleting discount...");
    const response = await axiosInstance.delete<ApiResponse<null>>(
      `${BASE_URL}/delete-discount/${discountId}`
    );
    closeLoading();
    if (response.data.success) {
      showSuccessMessage(
        response.data.message || "Discount deleted successfully!"
      );
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to delete discount");
      return false;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error deleting discount"
      );
    } else {
      showErrorMessage("Failed to delete discount. Please try again later.");
    }
    return false;
  }
};

// Apply discount
export const applyDiscount = async (
  discount_code?: string
): Promise<ApplyDiscountResponse | null> => {
  try {
    showLoading("Applying discount...");
    const response = await axiosInstance.post<
      ApiResponse<ApplyDiscountResponse>
    >(`${BASE_URL}/apply-discount`, discount_code ? { discount_code } : {});
    closeLoading();
    if (response.data.success && response.data.data) {
      showSuccessMessage("Discount applied!");
      return response.data.data;
    } else {
      showErrorMessage(response.data.message || "Failed to apply discount");
      return null;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error applying discount"
      );
    } else {
      showErrorMessage("Failed to apply discount. Please try again later.");
    }
    return null;
  }
};

// Utility to generate a random discount code
export function generateRandomDiscountCode(length = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}


// Bulk delete discounts
export const bulkDeleteDiscounts = async (discountIds: string[]): Promise<{ success: boolean; confirmed: boolean; deletedCount?: number }> => {
  try {
    if (discountIds.length === 0) {
      showErrorMessage("Please select at least one discount to delete");
      return { success: false, confirmed: false };
    }

    const result = await showConfirmation(
      "Delete Multiple Discounts?",
      `Are you sure you want to delete ${discountIds.length} discount(s)? This action cannot be undone.`
    );

    if (!result.isConfirmed) {
      return { success: false, confirmed: false };
    }

    showLoading(`Deleting ${discountIds.length} discount(s)...`);
    const response = await axiosInstance.post<ApiResponse<{ deletedCount: number }>>(
      `${BASE_URL}/bulk-delete-discounts`,
      { discountIds }
    );
    closeLoading();

    if (response.data.success) {
      const { deletedCount = 0 } = response.data.data || {};
      showSuccessMessage(
        response.data.message || `Successfully deleted ${deletedCount} discount(s)`
      );

      return {
        success: true,
        confirmed: true,
        deletedCount
      };
    } else {
      showErrorMessage(response.data.message || "Failed to delete discounts");
      return { success: false, confirmed: true };
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error deleting discounts"
      );
    } else {
      showErrorMessage("Failed to delete discounts. Please try again later.");
    }
    return { success: false, confirmed: true };
  }
};
