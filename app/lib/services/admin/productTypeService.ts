import axiosInstance from "../../axiosConfig";
import {
  showSuccessMessage,
  showErrorMessage,
  showLoading,
  closeLoading,
  showConfirmation,
} from "../../swalConfig";
import { AxiosError } from "axios";

// Shipping Markup interface
export interface ShippingMarkup {
  agencyId: string;
  agencyName: string;
  markupType: "fixed" | "percentage";
  markupValue: number;
}

// Shipping Agency interface
export interface ShippingAgency {
  id?: number;
  key: string;
  name: string;
  amount: number;
}

// ProductType interface
export interface ProductType {
  id?: string;
  name: string;
  description?: string;
  icon_url?: string;
  status: "active" | "inactive";
  brand_count?: number;
  brands?: Array<{ id: string; name: string; logo_url?: string }>;
  super_categories?: Array<{ id: string; title: string }>;
  shipping_markups?: ShippingMarkup[];
  shipping_agencies?: ShippingAgency[];
  createdAt?: string;
  updatedAt?: string;
}

interface ProductTypesResponse {
  productTypes: ProductType[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProductTypes: number;
    limit: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Get all product types with pagination and search
export const getAllProductTypes = async (
  page: number = 1,
  limit: number = 20,
  search: string = "",
  status: string = ""
): Promise<ProductTypesResponse | null> => {
  try {
    const response = await axiosInstance.get<ApiResponse<ProductTypesResponse>>(
      "/admin/product-types/get-product-types",
      {
        params: {
          page,
          limit,
          search,
          status,
        },
      }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      showErrorMessage(response.data.message || "Failed to load product types");
      return null;
    }
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error loading product types"
      );
    } else {
      showErrorMessage("Failed to load product types. Please try again later.");
    }
    return null;
  }
};

// Get single product type
export const getProductTypeById = async (productTypeId: string): Promise<ProductType | null> => {
  try {
    showLoading("Loading product type details...");

    const response = await axiosInstance.get<ApiResponse<ProductType>>(
      `/admin/product-types/get-product-type/${productTypeId}`
    );

    closeLoading();

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      showErrorMessage(response.data.message || "Product type not found");
      return null;
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error loading product type details"
      );
    } else {
      showErrorMessage("Failed to load product type details. Please try again later.");
    }

    return null;
  }
};

// Create product type
export const createProductType = async (
  productType: ProductType,
  superCategoryIds: string[] = [],
  shippingAgencies: ShippingAgency[] = []
): Promise<boolean> => {
  try {
    showLoading("Creating product type...");

    // Transform amount to markup_value for backend
    const transformedAgencies = shippingAgencies.map(agency => ({
      key: agency.key,
      markup_value: agency.amount,
    }));

    const response = await axiosInstance.post<ApiResponse<null>>(
      "/admin/product-types/create-product-type",
      {
        ...productType,
        super_category_ids: superCategoryIds,
        shipping_agencies: transformedAgencies,
      }
    );

    closeLoading();

    if (response.data.success) {
      showSuccessMessage(response.data.message || "Product type created successfully");
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to create product type");
      return false;
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error creating product type"
      );
    } else {
      showErrorMessage("Failed to create product type. Please try again later.");
    }

    return false;
  }
};

// Update product type
export const updateProductType = async (
  productTypeId: string,
  productType: ProductType,
  superCategoryIds: string[] = [],
  shippingAgencies: ShippingAgency[] = []
): Promise<boolean> => {
  try {
    showLoading("Updating product type...");

    // Transform amount to markup_value for backend
    const transformedAgencies = shippingAgencies.map(agency => ({
      key: agency.key,
      markup_value: agency.amount,
    }));

    const response = await axiosInstance.put<ApiResponse<null>>(
      `/admin/product-types/update-product-type/${productTypeId}`,
      {
        ...productType,
        super_category_ids: superCategoryIds,
        shipping_agencies: transformedAgencies,
      }
    );

    closeLoading();

    if (response.data.success) {
      showSuccessMessage(response.data.message || "Product type updated successfully");
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to update product type");
      return false;
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error updating product type"
      );
    } else {
      showErrorMessage("Failed to update product type. Please try again later.");
    }

    return false;
  }
};

// Delete product type
export const deleteProductType = async (productTypeId: string): Promise<boolean> => {
  try {
    const result = await showConfirmation(
      "Delete Product Type",
      "Are you sure you want to delete this product type? This action cannot be undone."
    );

    if (result.isConfirmed) {
      showLoading("Deleting product type...");

      const response = await axiosInstance.delete<ApiResponse<null>>(
        `/admin/product-types/delete-product-type/${productTypeId}`
      );

      closeLoading();

      if (response.data.success) {
        showSuccessMessage(response.data.message || "Product type deleted successfully");
        return true;
      } else {
        showErrorMessage(response.data.message || "Failed to delete product type");
        return false;
      }
    }

    return false;
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error deleting product type"
      );
    } else {
      showErrorMessage("Failed to delete product type. Please try again later.");
    }

    return false;
  }
};

// Bulk delete product types
export const bulkDeleteProductTypes = async (productTypeIds: string[]): Promise<{ success: boolean; confirmed: boolean; deletedCount?: number }> => {
  try {
    if (productTypeIds.length === 0) {
      showErrorMessage("Please select at least one product type to delete");
      return { success: false, confirmed: false };
    }

    const result = await showConfirmation(
      "Delete Multiple Product Types?",
      `Are you sure you want to delete ${productTypeIds.length} product type(s)? This action cannot be undone.`
    );
    
    if (!result.isConfirmed) {
      return { success: false, confirmed: false };
    }

    showLoading(`Deleting ${productTypeIds.length} product type(s)...`);
    const response = await axiosInstance.post<ApiResponse<{ deletedCount: number }>>(
      `/admin/product-types/bulk-delete-product-types`,
      { productTypeIds }
    );
    closeLoading();

    if (response.data.success) {
      const { deletedCount = 0 } = response.data.data || {};
      showSuccessMessage(
        response.data.message || `Successfully deleted ${deletedCount} product type(s)`
      );
      
      return { 
        success: true, 
        confirmed: true,
        deletedCount
      };
    } else {
      showErrorMessage(response.data.message || "Failed to delete product types");
      return { success: false, confirmed: true };
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error deleting product types"
      );
    } else {
      showErrorMessage("Failed to delete product types. Please try again later.");
    }
    return { success: false, confirmed: true };
  }
};
