import axiosInstance from "../../axiosConfig";
import { AxiosError } from "axios";

// Collection interface
export interface Collection {
  id?: string;
  category_type: "super-category" | "category" | "sub-category";
  title: string;
  description?: string;
  collection_type?: "Manual" | "Smart" | null;
  conditions?: unknown;
  conditionMatchType?: "all" | "any" | null;
  text_me?: string | null;
  footer_text?: string | null;
  image?: string | null;
  caption?: string | null;
  page_title?: string | null;
  page_description?: string | null;
  page_url?: string | null;
  image_url?: string | null;
  superCategoryId?: string | null;
  categoryId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  Categories?: Array<{ id: string; title: string; category_type: "category" }>;
  SubCategories?: Array<{ id: string; title: string; category_type: "sub-category" }>;
  Products?: Array<{ id: string; title: string }>;
  SuperCategory?: { id: string; title: string; category_type: "super-category" } | null;
  Category?: { id: string; title: string; category_type: "category" } | null;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Get categories by super category ID (for cascading selector)
 */
export const getCategoriesBySuperId = async (superCategoryId: string): Promise<Collection[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Collection[]>>(
      `/seller/collections/get-categories-by-super/${superCategoryId}`
    );

    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching categories by super ID:", error);
    return [];
  }
};

/**
 * Get sub-categories by category ID (for cascading selector)
 */
export const getSubCategoriesByCategoryId = async (categoryId: string): Promise<Collection[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Collection[]>>(
      `/seller/collections/get-subcategories-by-category/${categoryId}`
    );

    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching sub-categories by category ID:", error);
    return [];
  }
};

/**
 * Get all super categories
 */
export const getSuperCategories = async (): Promise<Collection[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<{
      superCategories: Collection[];
      pagination: any;
      filters: any;
    }>>(
      "/seller/collections/get-super-categories"
    );
    
    if (response.data.success && response.data.data) {
      const superCategoriesData = response.data.data.superCategories;
      
      if (Array.isArray(superCategoriesData)) {
        return superCategoriesData;
      } else {
        console.error("superCategories is not an array:", superCategoriesData);
        return [];
      }
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error in getSuperCategories:", error);
    return [];
  }
};

/**
 * Get all categories
 */
export const getCategories = async (): Promise<Collection[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<{
      categories: Collection[];
      pagination: any;
      filters: any;
    }>>(
      "/seller/collections/get-categories"
    );
    
    if (response.data.success && response.data.data) {
      const categoriesData = response.data.data.categories;
      
      if (Array.isArray(categoriesData)) {
        return categoriesData;
      } else {
        console.error("categories is not an array:", categoriesData);
        return [];
      }
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error in getCategories:", error);
    return [];
  }
};

/**
 * Get all sub-categories
 */
export const getSubCategories = async (): Promise<Collection[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<{
      subCategories: Collection[];
      pagination: any;
      filters: any;
    }>>(
      "/seller/collections/get-sub-categories"
    );
    
    if (response.data.success && response.data.data) {
      const subCategoriesData = response.data.data.subCategories;
      
      if (Array.isArray(subCategoriesData)) {
        return subCategoriesData;
      } else {
        console.error("subCategories is not an array:", subCategoriesData);
        return [];
      }
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error in getSubCategories:", error);
    return [];
  }
};
