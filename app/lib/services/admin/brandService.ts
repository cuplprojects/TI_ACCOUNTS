import axiosInstance from "../../axiosConfig";
import {
  showSuccessMessage,
  showErrorMessage,
  showLoading,
  closeLoading,
  showConfirmation,
} from "../../swalConfig";
import { AxiosError } from "axios";

// Brand interface
export interface Brand {
  id?: string;
  name: string;
  description?: string;
  logo_url?: string;
  banner_desktop_url?: string;
  banner_mobile_url?: string;
  status: "active" | "inactive";
  seller_count?: number;
  sellers?: Array<{ id: string; firm_name: string; email: string }>;
  ProductTypes?: Array<{ id: string; name: string }>;
  createdAt?: string;
  updatedAt?: string;
}

interface BrandsResponse {
  brands: Brand[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalBrands: number;
    limit: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Get all brands with pagination and search
export const getAllBrands = async (
  page: number = 1,
  limit: number = 20,
  search: string = "",
  status: string = ""
): Promise<BrandsResponse | null> => {
  try {
    const response = await axiosInstance.get<ApiResponse<BrandsResponse>>(
      "/admin/brands/get-brands",
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
      showErrorMessage(response.data.message || "Failed to load brands");
      return null;
    }
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error loading brands"
      );
    } else {
      showErrorMessage("Failed to load brands. Please try again later.");
    }
    return null;
  }
};

// Get single brand
export const getBrandById = async (brandId: string): Promise<Brand | null> => {
  try {
    showLoading("Loading brand details...");

    const response = await axiosInstance.get<ApiResponse<Brand>>(
      `/admin/brands/get-brand/${brandId}`
    );

    closeLoading();

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      showErrorMessage(response.data.message || "Brand not found");
      return null;
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error loading brand details"
      );
    } else {
      showErrorMessage("Failed to load brand details. Please try again later.");
    }

    return null;
  }
};

// Create brand
export const createBrand = async (
  brand: Brand
): Promise<Brand | null> => {
  try {
    showLoading("Creating brand...");

    const response = await axiosInstance.post<ApiResponse<Brand>>(
      "/admin/brands/create-brand",
      brand
    );

    closeLoading();

    if (response.data.success && response.data.data) {
      showSuccessMessage(response.data.message || "Brand created successfully");
      return response.data.data;
    } else {
      showErrorMessage(response.data.message || "Failed to create brand");
      return null;
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error creating brand"
      );
    } else {
      showErrorMessage("Failed to create brand. Please try again later.");
    }

    return null;
  }
};

// Update brand
export const updateBrand = async (
  brandId: string,
  brand: Brand
): Promise<boolean> => {
  try {
    showLoading("Updating brand...");

    const response = await axiosInstance.put<ApiResponse<null>>(
      `/admin/brands/update-brand/${brandId}`,
      brand
    );

    closeLoading();

    if (response.data.success) {
      showSuccessMessage(response.data.message || "Brand updated successfully");
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to update brand");
      return false;
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error updating brand"
      );
    } else {
      showErrorMessage("Failed to update brand. Please try again later.");
    }

    return false;
  }
};

// Delete brand
export const deleteBrand = async (brandId: string): Promise<boolean> => {
  try {
    const result = await showConfirmation(
      "Delete Brand",
      "Are you sure you want to delete this brand? This action cannot be undone."
    );

    if (result.isConfirmed) {
      showLoading("Deleting brand...");

      const response = await axiosInstance.delete<ApiResponse<null>>(
        `/admin/brands/delete-brand/${brandId}`
      );

      closeLoading();

      if (response.data.success) {
        showSuccessMessage(response.data.message || "Brand deleted successfully");
        return true;
      } else {
        showErrorMessage(response.data.message || "Failed to delete brand");
        return false;
      }
    }

    return false;
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    
    // Log the full error for debugging
    console.error("Delete brand error:", {
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      data: axiosError.response?.data,
      message: axiosError.message,
    });

    if (axiosError.response?.status === 400) {
      // Handle validation errors (e.g., brand has sellers or products)
      showErrorMessage(
        axiosError.response.data?.message || "Cannot delete this brand"
      );
    } else if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || 
        `Error deleting brand: ${axiosError.response.statusText}`
      );
    } else if (axiosError.message) {
      showErrorMessage(`Failed to delete brand: ${axiosError.message}`);
    } else {
      showErrorMessage("Failed to delete brand. Please try again later.");
    }

    return false;
  }
};

// Assign brand to sellers
export const assignBrandToSellers = async (
  brandId: string,
  sellerIds: string[]
): Promise<boolean> => {
  try {
    showLoading("Assigning brand to sellers...");

    const response = await axiosInstance.post<ApiResponse<null>>(
      `/admin/brands/assign-brand/${brandId}/sellers`,
      {
        seller_ids: sellerIds,
      }
    );

    closeLoading();

    if (response.data.success) {
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to assign brand");
      return false;
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error assigning brand"
      );
    } else {
      showErrorMessage("Failed to assign brand. Please try again later.");
    }

    return false;
  }
};

// Get brands for a specific seller (admin view)
export const getBrandsBySellerIdForAdmin = async (
  sellerId: string
): Promise<Brand[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Brand[]>>(
      `/admin/brands/seller/${sellerId}/brands`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching seller brands:", error);
    return [];
  }
};

// Assign multiple brands to a seller (replaces all existing brands)
export const assignMultipleBrandsToSeller = async (
  sellerId: string,
  brandIds: string[],
  showMessage: boolean = true
): Promise<boolean> => {
  try {
    showLoading("Assigning brands to seller...");

    // Get all current brands for this seller
    const currentBrands = await getBrandsBySellerIdForAdmin(sellerId);
    const currentBrandIds = currentBrands.map((b) => b.id).filter(Boolean) as string[];

    // Find brands to remove (were assigned but not in new list)
    const brandsToRemove = currentBrandIds.filter(
      (id) => !brandIds.includes(id)
    );

    // Find brands to add (in new list but not currently assigned)
    const brandsToAdd = brandIds.filter((id) => !currentBrandIds.includes(id));

    // For brands to remove, we need to get all sellers for that brand and remove this seller
    const removePromises = brandsToRemove.map(async (brandId) => {
      try {
        const brand = await getBrandById(brandId);
        if (brand && brand.sellers) {
          // Filter out the current seller
          const remainingSellers = brand.sellers
            .filter((s) => s.id !== sellerId)
            .map((s) => s.id)
            .filter(Boolean) as string[];
          
          // Reassign the brand with remaining sellers
          return axiosInstance.post<ApiResponse<null>>(
            `/admin/brands/assign-brand/${brandId}/sellers`,
            {
              seller_ids: remainingSellers,
            }
          );
        }
      } catch (error) {
        console.error(`Error removing seller from brand ${brandId}:`, error);
      }
    });

    // For brands to add, assign this seller
    const addPromises = brandsToAdd.map((brandId) =>
      axiosInstance.post<ApiResponse<null>>(
        `/admin/brands/assign-brand/${brandId}/sellers`,
        {
          seller_ids: [sellerId],
        }
      )
    );

    const allPromises = [...removePromises, ...addPromises].filter(Boolean);
    
    if (allPromises.length > 0) {
      const responses = await Promise.all(allPromises);
      closeLoading();

      // Check if all requests were successful
      const allSuccess = responses.every((response) => response?.data?.success);

      if (allSuccess) {
        if (showMessage) {
          showSuccessMessage("Brands assigned to seller successfully");
        }
        return true;
      } else {
        showErrorMessage("Failed to assign some brands");
        return false;
      }
    } else {
      closeLoading();
      if (showMessage) {
        showSuccessMessage("Brands assigned to seller successfully");
      }
      return true;
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error assigning brands"
      );
    } else {
      showErrorMessage("Failed to assign brands. Please try again later.");
    }

    return false;
  }
};

// Bulk delete brands
export const bulkDeleteBrands = async (brandIds: string[]): Promise<{ success: boolean; confirmed: boolean; deletedCount?: number; failedCount?: number; failedBrandIds?: string[] }> => {
  try {
    if (brandIds.length === 0) {
      showErrorMessage("Please select at least one brand to delete");
      return { success: false, confirmed: false };
    }

    const result = await showConfirmation(
      "Delete Multiple Brands?",
      `Are you sure you want to delete ${brandIds.length} brand(s)? This action cannot be undone.`
    );
    
    if (!result.isConfirmed) {
      return { success: false, confirmed: false };
    }

    showLoading(`Deleting ${brandIds.length} brand(s)...`);
    const response = await axiosInstance.post<ApiResponse<{ deletedCount: number; failedCount: number; failedBrandIds: string[]; partialSuccess?: boolean }>>(
      `/admin/brands/bulk-delete-brands`,
      { brandIds }
    );
    closeLoading();

    if (response.data.success) {
      const { deletedCount = 0, failedCount = 0, partialSuccess = false } = response.data.data || {};
      
      if (partialSuccess) {
        showSuccessMessage(
          response.data.message || `Deleted ${deletedCount} brand(s). ${failedCount} brand(s) could not be deleted (associated with sellers, product types, or products).`
        );
      } else {
        showSuccessMessage(
          response.data.message || `Successfully deleted ${deletedCount} brand(s)`
        );
      }
      
      return { 
        success: true, 
        confirmed: true,
        deletedCount,
        failedCount,
        failedBrandIds: response.data.data?.failedBrandIds || []
      };
    } else {
      showErrorMessage(response.data.message || "Failed to delete brands");
      return { success: false, confirmed: true };
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response?.status === 409) {
      const data = axiosError.response.data as any;
      showErrorMessage(
        data?.message || "All selected brands are associated with sellers, product types, or products and cannot be deleted"
      );
    } else if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error deleting brands"
      );
    } else {
      showErrorMessage("Failed to delete brands. Please try again later.");
    }
    return { success: false, confirmed: true };
  }
};

export const assignBrandToProductTypes = async (
  brandId: string,
  productTypeIds: string[]
): Promise<boolean> => {
  try {
    const response = await axiosInstance.post<ApiResponse<null>>(
      `/admin/brands/assign-brand/${brandId}/product-types`,
      {
        product_type_ids: productTypeIds,
      }
    );

    if (response.data.success) {
      return true;
    } else {
      console.error("Failed to assign brand:", response.data.message);
      return false;
    }
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<null>>;
    console.error("Error assigning brand to product types:", axiosError.response?.data?.message || axiosError.message);
    return false;
  }
};
