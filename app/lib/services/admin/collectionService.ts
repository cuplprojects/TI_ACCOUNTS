import axiosInstance from "../../axiosConfig";
import {
  showSuccessMessage,
  showErrorMessage,
  showLoading,
  closeLoading,
  showConfirmation,
} from "../../swalConfig";
import { AxiosError } from "axios";
import { uploadImagesWithPresignedUrls } from "../../services/presignedUrlService";

// Association types
export interface CategoryAssociation {
  id: string;
  title: string;
  category_type: "category";
}
export interface SubCategoryAssociation {
  id: string;
  title: string;
  category_type: "sub-category";
}
export interface ProductAssociation {
  id: string;
  title: string;
}
export interface SuperCategoryAssociation {
  id: string;
  title: string;
  category_type: "super-category";
}
export interface CategoryParentAssociation {
  id: string;
  title: string;
  category_type: "category";
}

// Collection interface matching the backend model
export interface Collection {
  id?: string;
  category_type: "super-category" | "category" | "sub-category";
  title: string;
  description?: string;
  collection_type?: "Manual" | "Smart" | null;
  conditions?: unknown; // object or null
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
  Categories?: CategoryAssociation[];
  SubCategories?: SubCategoryAssociation[];
  Products?: ProductAssociation[];
  SuperCategory?: SuperCategoryAssociation | null;
  Category?: CategoryParentAssociation | null;
}

// Collection query parameters interface
export interface CollectionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category_type?: "super-category" | "category" | "sub-category" | "";
  collection_type?: "Manual" | "Smart" | "";
  sort?: "newest" | "oldest" | "title_asc" | "title_desc";
}

// Pagination info interface
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCollections: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Collections response interface
export interface CollectionsResponse {
  collections: Collection[];
  pagination: PaginationInfo;
  filters: {
    search: string | null;
    category_type: string | null;
    collection_type: string | null;
    sort: string;
  };
  summary?: {
    totalCollections: number;
    superCategories: number;
    categories: number;
    subCategories: number;
    manualCollections: number;
    smartCollections: number;
  };
}

// Condition interface for smart collections
export interface Condition {
  field: "price" | "vendor" | "tag";
  operator: "gt" | "lt" | "eq" | "not_eq" | "contains";
  value: string | number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Get all collections with pagination and filtering
export const getAllCollections = async (
  params?: CollectionQueryParams
): Promise<CollectionsResponse> => {
  try {
    // showLoading("Loading collections...");

    // Build query string
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.category_type)
      queryParams.append("category_type", params.category_type);
    if (params?.collection_type)
      queryParams.append("collection_type", params.collection_type);
    if (params?.sort) queryParams.append("sort", params.sort);

    const response = await axiosInstance.get<ApiResponse<CollectionsResponse>>(
      `/admin/collection/get-collections?${queryParams.toString()}`
    );
    closeLoading();

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      // Return empty response structure on error
      return {
        collections: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalCollections: 0,
          limit: 20,
          hasNext: false,
          hasPrev: false,
        },
        filters: {
          search: null,
          category_type: null,
          collection_type: null,
          sort: "newest",
        },
      };
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    console.error("Error loading collections:", axiosError);
    // Return empty response structure on error
    return {
      collections: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCollections: 0,
        limit: 20,
        hasNext: false,
        hasPrev: false,
      },
      filters: {
        search: null,
        category_type: null,
        collection_type: null,
        sort: "newest",
      },
    };
  }
};

// Get single collection by ID
export const getCollection = async (
  collectionId: string
): Promise<Collection | null> => {
  try {
    showLoading("Loading collection details...");
    const response = await axiosInstance.get<ApiResponse<Collection>>(
      `/admin/collection/get-collection/${collectionId}`
    );
    closeLoading();
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Collection not found");
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      throw new Error(
        axiosError.response.data?.message || "Error loading collection"
      );
    } else {
      throw new Error("Failed to load collection. Please try again later.");
    }
  }
  return null;
};

// Create a new collection
export const createCollection = async (
  collectionData: FormData
): Promise<{ success: boolean; data?: Collection }> => {
  try {
    showLoading("Creating collection...");
    const response = await axiosInstance.post<ApiResponse<Collection>>(
      "/admin/collection/create-collection",
      collectionData
      // Don't set Content-Type header - let browser handle FormData
    );
    closeLoading();

    if (response.data.success) {
      showSuccessMessage("Collection created successfully!");
      return { success: true, data: response.data.data };
    } else {
      showErrorMessage(response.data.message || "Failed to create collection");
      return { success: false };
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Failed to create collection"
      );
    } else {
      showErrorMessage("Failed to create collection. Please try again later.");
    }
    return { success: false };
  }
};

// Update an existing collection
export const updateCollection = async (
  collectionId: string,
  collectionData: FormData
): Promise<{ success: boolean; data?: Collection }> => {
  try {
    showLoading("Updating collection...");
    const response = await axiosInstance.put<ApiResponse<Collection>>(
      `/admin/collection/update-collection/${collectionId}`,
      collectionData
      // Don't set Content-Type header - let browser handle FormData
    );
    closeLoading();

    if (response.data.success) {
      showSuccessMessage("Collection updated successfully!");
      return { success: true, data: response.data.data };
    } else {
      showErrorMessage(response.data.message || "Failed to update collection");
      return { success: false };
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Failed to update collection"
      );
    } else {
      showErrorMessage("Failed to update collection. Please try again later.");
    }
    return { success: false };
  }
};

// Delete a collection
export const deleteCollection = async (
  collectionId: string
): Promise<boolean> => {
  try {
    const result = await showConfirmation(
      "Delete Collection",
      "Are you sure you want to delete this collection? This action cannot be undone."
    );

    if (!result.isConfirmed) {
      return false;
    }

    showLoading("Deleting collection...");
    const response = await axiosInstance.delete<ApiResponse<null>>(
      `/admin/collection/delete-collection/${collectionId}`
    );
    closeLoading();

    if (response.data.success) {
      showSuccessMessage("Collection deleted successfully!");
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to delete collection");
      return false;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Failed to delete collection"
      );
    } else {
      showErrorMessage("Failed to delete collection. Please try again later.");
    }
    return false;
  }
};

// Helper function to prepare form data for collection creation/update
export const prepareCollectionFormData = async (
  collection: Partial<Collection>,
  imageFile?: File,
  categoryIds?: string[],
  subCategoryIds?: string[],
  productIds?: string[]
): Promise<FormData> => {
  const formData = new FormData();
  if (collection.category_type)
    formData.append("category_type", collection.category_type);
  if (collection.title) formData.append("title", collection.title);
  // Always append description (even if empty) to ensure it's sent
  formData.append("description", collection.description || "");
  if (collection.collection_type)
    formData.append("collection_type", collection.collection_type);
  
  // Only append conditions and conditionMatchType for Smart collections
  if (collection.collection_type === "Smart") {
    if (collection.conditions)
      formData.append(
        "conditions",
        typeof collection.conditions === "string"
          ? collection.conditions
          : JSON.stringify(collection.conditions)
      );
    if (collection.conditionMatchType)
      formData.append("conditionMatchType", collection.conditionMatchType);
  }
  if (collection.text_me) formData.append("text_me", collection.text_me);
  if (collection.footer_text)
    formData.append("footer_text", collection.footer_text);
  if (collection.image) formData.append("image", collection.image);
  if (collection.caption) formData.append("caption", collection.caption);
  if (collection.page_title)
    formData.append("page_title", collection.page_title);
  if (collection.page_description)
    formData.append("page_description", collection.page_description);
  if (collection.page_url) formData.append("page_url", collection.page_url);
  
  // Handle image file upload using presigned URLs - similar to banner service
  if (imageFile) {
    try {
      // Use uploadImagesWithPresignedUrls to get proper format for moveObjects
      const uploadedImages = await uploadImagesWithPresignedUrls(
        [imageFile],
        "collections/temp",
        "admin"
      );
      
      if (uploadedImages && uploadedImages.length > 0) {
        // Format the image_url as an array with key and originalName
        const image_url = JSON.stringify(uploadedImages);
        formData.append("image_url", image_url);
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  } else if (collection.image_url) {
    formData.append("image_url", collection.image_url);
  }
  
  if (categoryIds && categoryIds.length > 0)
    categoryIds.forEach((id) => formData.append("categoryIds", id));
  if (subCategoryIds && subCategoryIds.length > 0)
    subCategoryIds.forEach((id) => formData.append("subCategoryIds", id));
  if (productIds && productIds.length > 0)
    productIds.forEach((id) => formData.append("productIds", id));
  if (collection.superCategoryId)
    formData.append("superCategoryId", collection.superCategoryId);
  if (collection.categoryId)
    formData.append("categoryId", collection.categoryId);
  return formData;
};

// Helper function to convert conditions array to JSON string
export const formatConditions = (conditions: Condition[]): string => {
  return JSON.stringify(conditions);
};

// Get all super-categories (paginated - for admin list view)
export const getSuperCategories = async (): Promise<Collection[]> => {
  try {
    showLoading("Loading super categories...");
    // Update the type to match the actual response structure
    const response = await axiosInstance.get<ApiResponse<{
      superCategories: Collection[];
      pagination: any;
      filters: any;
    }>>(
      "/admin/collection/get-super-categories"
    );
    closeLoading();
    console.log("Super categories API response:", response.data);
    
    if (response.data.success && response.data.data) {
      // Access the superCategories array from the nested structure
      const superCategoriesData = response.data.data.superCategories;
      
      // Check the structure of the response
      if (Array.isArray(superCategoriesData)) {
        console.log("Number of super categories:", superCategoriesData.length);
        if (superCategoriesData.length > 0) {
          console.log("Sample super category:", superCategoriesData[0]);
        }
        return superCategoriesData;
      } else {
        console.error("superCategories is not an array:", superCategoriesData);
        return [];
      }
    } else {
      throw new Error(response.data.message || "No super categories found");
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    console.error("Error in getSuperCategories:", axiosError.response?.data || axiosError.message);
    
    if (axiosError.response) {
      throw new Error(
        axiosError.response.data?.message || "Error loading super categories"
      );
    } else {
      throw new Error(
        "Failed to load super categories. Please try again later."
      );
    }
  }
};

// Get ALL super-categories without pagination (for dropdowns)
export const getAllSuperCategories = async (): Promise<Collection[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Collection[]>>(
      "/admin/collection/get-all-super-categories"
    );

    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching all super categories:", error);
    return [];
  }
};

// Get all categories
export const getCategories = async (): Promise<Collection[]> => {
  try {
    showLoading("Loading categories...");
    // Update the type to match the actual response structure
    const response = await axiosInstance.get<ApiResponse<{
      categories: Collection[];
      pagination: any;
      filters: any;
    }>>(
      "/admin/collection/get-categories"
    );
    closeLoading();
    console.log("Categories API response:", response.data);
    
    if (response.data.success && response.data.data) {
      // Access the categories array from the nested structure
      const categoriesData = response.data.data.categories;
      
      // Check the structure of the response
      if (Array.isArray(categoriesData)) {
        console.log("Number of categories:", categoriesData.length);
        if (categoriesData.length > 0) {
          console.log("Sample category:", categoriesData[0]);
        }
        return categoriesData;
      } else {
        console.error("categories is not an array:", categoriesData);
        return [];
      }
    } else {
      throw new Error(response.data.message || "No categories found");
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    console.error("Error in getCategories:", axiosError.response?.data || axiosError.message);
    
    if (axiosError.response) {
      throw new Error(
        axiosError.response.data?.message || "Error loading categories"
      );
    } else {
      throw new Error("Failed to load categories. Please try again later.");
    }
  }
};

// Interface for the sub-categories response structure
export interface SubCategoriesResponse {
  subCategories: Collection[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalSubCategories: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    search: string | null;
    collection_type: string | null;
    sort: string;
  };
}

export const getSubCategories = async (): Promise<Collection[]> => {
  try {
    showLoading("Loading sub-categories...");
    const response = await axiosInstance.get<
      ApiResponse<SubCategoriesResponse>
    >("/admin/collection/get-sub-categories");
    closeLoading();
    console.log("Sub-categories API response:", response.data);
    
    if (response.data.success && response.data.data) {
      // Access the subCategories array from the nested structure
      const subCategoriesData = response.data.data.subCategories;
      
      // Check the structure of the response
      if (Array.isArray(subCategoriesData)) {
        console.log("Number of sub-categories:", subCategoriesData.length);
        if (subCategoriesData.length > 0) {
          console.log("Sample sub-category:", subCategoriesData[0]);
        }
        return subCategoriesData;
      } else {
        console.error("subCategories is not an array:", subCategoriesData);
        return [];
      }
    } else {
      throw new Error(response.data.message || "No sub-categories found");
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    console.error("Error in getSubCategories:", axiosError.response?.data || axiosError.message);
    
    if (axiosError.response) {
      throw new Error(
        axiosError.response.data?.message || "Error loading sub-categories"
      );
    } else {
      throw new Error("Failed to load sub-categories. Please try again later.");
    }
  }
};

// Helper for parsing collections from API
export const parseCollection = (item: unknown): Collection => {
  // Type assertion to access properties safely
  const typedItem = item as {
    id?: string;
    title?: string;
    description?: string;
    collection_type?: string;
    category_type?: string;
    conditions?: unknown;
    conditionMatchType?: string;
    text_me?: string;
    footer_text?: string;
    image?: string;
    caption?: string;
    image_url?: string;
    page_title?: string;
    page_description?: string;
    page_url?: string;
    superCategoryId?: string;
    categoryId?: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    Categories?: CategoryAssociation[];
    SubCategories?: SubCategoryAssociation[];
    Products?: ProductAssociation[];
    SuperCategory?: SuperCategoryAssociation;
    Category?: CategoryParentAssociation;
  };

  // Create a properly typed collection
  const collection: Collection = {
    id: typedItem.id || "",
    title: typedItem.title || "",
    description: typedItem.description || "",
    collection_type:
      (typedItem.collection_type as "Manual" | "Smart" | null) || null,
    category_type:
      (typedItem.category_type as
        | "super-category"
        | "category"
        | "sub-category") || "category",
    conditions: typedItem.conditions,
    conditionMatchType:
      (typedItem.conditionMatchType as "all" | "any" | null) || null,
    text_me: typedItem.text_me || null,
    footer_text: typedItem.footer_text || null,
    image: typedItem.image || null,
    caption: typedItem.caption || null,
    image_url: typedItem.image_url || null,
    page_title: typedItem.page_title || null,
    page_description: typedItem.page_description || null,
    page_url: typedItem.page_url || null,
    superCategoryId: typedItem.superCategoryId || null,
    categoryId: typedItem.categoryId || null,
    createdAt: typedItem.createdAt,
    updatedAt: typedItem.updatedAt,
    deletedAt: typedItem.deletedAt || null,
    Categories: typedItem.Categories || [],
    SubCategories: typedItem.SubCategories || [],
    Products: typedItem.Products || [],
    SuperCategory: typedItem.SuperCategory || null,
    Category: typedItem.Category || null,
  };

  return collection;
};


// Get categories by super category ID (for cascading selector)
export const getCategoriesBySuperId = async (superCategoryId: string): Promise<Collection[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Collection[]>>(
      `/admin/collection/get-categories-by-super/${superCategoryId}`
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

// Get sub-categories by category ID (for cascading selector)
export const getSubCategoriesByCategoryId = async (categoryId: string): Promise<Collection[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Collection[]>>(
      `/admin/collection/get-subcategories-by-category/${categoryId}`
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

// Get ALL categories by super category ID without pagination (for dropdowns)
export const getAllCategoriesBySuperId = async (superCategoryId: string): Promise<Collection[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Collection[]>>(
      `/admin/collection/get-all-categories-by-super/${superCategoryId}`
    );

    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching all categories by super ID:", error);
    return [];
  }
};


// Get the full path for a sub-category (super > category > subcategory)
export const getCategoryPathForSubCategory = async (
  subCategoryId: string,
  superCategories: Collection[]
): Promise<{ path: string; superCategoryId: string; categoryId: string } | null> => {
  try {
    // Search through all super categories to find the path
    for (const superCat of superCategories) {
      if (superCat.Categories) {
        for (const category of superCat.Categories) {
          // Fetch sub-categories for this category
          const subCats = await getSubCategoriesByCategoryId(category.id);
          const foundSubCat = subCats.find((sc) => sc.id === subCategoryId);
          
          if (foundSubCat && superCat.id && category.id) {
            return {
              path: `${superCat.title} > ${category.title} > ${foundSubCat.title}`,
              superCategoryId: superCat.id,
              categoryId: category.id,
            };
          }
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error getting category path:", error);
    return null;
  }
};


// Bulk delete collections
export const bulkDeleteCollections = async (collectionIds: string[]): Promise<{ success: boolean; confirmed: boolean; deletedCount?: number }> => {
  try {
    if (collectionIds.length === 0) {
      showErrorMessage("Please select at least one collection to delete");
      return { success: false, confirmed: false };
    }

    const result = await showConfirmation(
      "Delete Multiple Collections?",
      `Are you sure you want to delete ${collectionIds.length} collection(s)? This action cannot be undone.`
    );
    
    if (!result.isConfirmed) {
      return { success: false, confirmed: false };
    }

    showLoading(`Deleting ${collectionIds.length} collection(s)...`);
    const response = await axiosInstance.post<ApiResponse<{ deletedCount: number }>>(
      `/admin/collection/bulk-delete-collections`,
      { collectionIds }
    );
    closeLoading();

    if (response.data.success) {
      const { deletedCount = 0 } = response.data.data || {};
      showSuccessMessage(
        response.data.message || `Successfully deleted ${deletedCount} collection(s)`
      );
      
      return { 
        success: true, 
        confirmed: true,
        deletedCount
      };
    } else {
      showErrorMessage(response.data.message || "Failed to delete collections");
      return { success: false, confirmed: true };
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error deleting collections"
      );
    } else {
      showErrorMessage("Failed to delete collections. Please try again later.");
    }
    return { success: false, confirmed: true };
  }
};
