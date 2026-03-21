import axiosInstance from "../../axiosConfig";
import { uploadImagesWithPresignedUrls } from "../presignedUrlService";
import {
  showSuccessMessage,
  showErrorMessage,
  showLoading,
  closeLoading,
} from "../../swalConfig";
import { AxiosError } from "axios";

export interface CategoryBanner {
  id?: string;
  category_id: string;
  position: number;
  image_url: string;
  image_alt_text: string;
  redirect_url?: string;
  is_active: boolean;
  display_order: number;
}

export interface CategoryBannersResponse {
  success: boolean;
  data: CategoryBanner[];
  message?: string;
}

export interface CategoriesResponse {
  success: boolean;
  data: Array<{
    id: string;
    title: string;
    category_type?: string;
  }>;
  message?: string;
}

const handleApiError = (error: unknown, defaultMessage: string) => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || defaultMessage;
    showErrorMessage(message);
    console.error("API Error:", message);
  } else {
    showErrorMessage(defaultMessage);
    console.error("Error:", error);
  }
};

// Get all super categories only (no children)
export const getCategories = async (): Promise<
  Array<{ id: string; title: string; category_type?: string }> | null
> => {
  try {
    console.log("Calling /admin/collection/get-all-super-categories");
    const response = await axiosInstance.get("/admin/collection/get-all-super-categories");
    
    console.log("API Response:", response.data);
    
    let superCategories = [];
    
    // Handle different response structures
    if (response.data?.data) {
      superCategories = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
    } else if (Array.isArray(response.data)) {
      superCategories = response.data;
    }
    
    console.log("Processed super categories:", superCategories);
    
    return superCategories.length > 0 ? superCategories : null;
  } catch (error) {
    console.error("Error fetching super categories:", error);
    handleApiError(error, "Failed to fetch super categories");
    return null;
  }
};

// Get banners for a specific category
export const getCategoryBanners = async (
  categoryId: string
): Promise<CategoryBanner[] | null> => {
  try {
    const response = await axiosInstance.get(
      `/admin/category-banners?categoryId=${categoryId}`
    );
    const banners = response.data.data || [];
    return banners.length > 0 ? banners : [];
  } catch (error) {
    handleApiError(error, "Failed to fetch category banners");
    return null;
  }
};

// Upload banner image
export const uploadCategoryBannerImage = async (
  file: File,
  categoryId: string
): Promise<string | null> => {
  try {
    showLoading("Uploading banner image...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("categoryId", categoryId);

    const response = await axiosInstance.post(
      "/admin/category-banners/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    closeLoading();
    showSuccessMessage("Banner image uploaded successfully");
    return response.data.data?.imageUrl || response.data.imageUrl;
  } catch (error) {
    closeLoading();
    handleApiError(error, "Failed to upload banner image");
    return null;
  }
};

// Save/Update category banners
export const saveCategoryBanners = async (
  categoryId: string,
  banners: CategoryBanner[]
): Promise<CategoryBanner[] | null> => {
  try {
    showLoading("Saving banners...");

    const response = await axiosInstance.post("/admin/category-banners", {
      categoryId,
      banners,
    });

    closeLoading();
    showSuccessMessage("Banners saved successfully");
    return response.data.data || [];
  } catch (error) {
    closeLoading();
    handleApiError(error, "Failed to save banners");
    return null;
  }
};

// Delete a category banner
export const deleteCategoryBanner = async (
  bannerId: string
): Promise<boolean> => {
  try {
    await axiosInstance.delete(`/admin/category-banners/${bannerId}`);
    showSuccessMessage("Banner deleted successfully");
    return true;
  } catch (error) {
    handleApiError(error, "Failed to delete banner");
    return false;
  }
};

// Update a single banner
export const updateCategoryBanner = async (
  bannerId: string,
  updates: Partial<CategoryBanner>
): Promise<CategoryBanner | null> => {
  try {
    const response = await axiosInstance.put(
      `/admin/category-banners/${bannerId}`,
      updates
    );
    showSuccessMessage("Banner updated successfully");
    return response.data.data || null;
  } catch (error) {
    handleApiError(error, "Failed to update banner");
    return null;
  }
};
