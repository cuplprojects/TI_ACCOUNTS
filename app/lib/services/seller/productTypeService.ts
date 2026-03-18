import axiosInstance from "../../axiosConfig";

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

// Default product types - used when backend endpoint is not available
const DEFAULT_PRODUCT_TYPES: ProductType[] = [
  { id: "1", name: "Book", status: "active" },
  { id: "2", name: "Liquid", status: "active" },
  { id: "3", name: "Medicine", status: "active" },
  { id: "4", name: "Physical Product", status: "active" },
  { id: "5", name: "Imitation Jewellery", status: "active" },
  { id: "6", name: "Perfume/Attar", status: "active" },
  { id: "7", name: "Wooden Product", status: "active" },
  { id: "8", name: "Electronic Product", status: "active" },
];

/**
 * Get all product types - uses seller endpoint
 */
export const getMyProductTypes = async (
  page: number = 1,
  limit: number = 1000,
  search: string = ""
): Promise<ProductTypesResponse | null> => {
  try {
    const response = await axiosInstance.get<ApiResponse<ProductTypesResponse>>(
      "/seller/product-types/get-product-types",
      {
        params: {
          page,
          limit,
          search,
        },
      }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    return null;
  } catch (error) {
    console.error("Failed to load product types:", error);
    // Fallback to default product types if endpoint fails
    return getDefaultProductTypes(search);
  }
};

/**
 * Get default product types (fallback when backend is not ready)
 */
const getDefaultProductTypes = (search: string = ""): ProductTypesResponse => {
  let filtered = DEFAULT_PRODUCT_TYPES;

  if (search) {
    filtered = DEFAULT_PRODUCT_TYPES.filter((pt) =>
      pt.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  return {
    productTypes: filtered,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalProductTypes: filtered.length,
      limit: 1000,
    },
  };
};

/**
 * Get all product types (public endpoint - for fallback)
 * This can be used if a public endpoint is available
 */
export const getAllProductTypes = async (
  page: number = 1,
  limit: number = 1000,
  search: string = ""
): Promise<ProductTypesResponse | null> => {
  try {
    const response = await axiosInstance.get<ApiResponse<ProductTypesResponse>>(
      "/public/product-types",
      {
        params: {
          page,
          limit,
          search,
          status: "active",
        },
      }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    return null;
  } catch (error) {
    console.error("Failed to load product types from public endpoint:", error);
    // Return default product types as fallback
    return getDefaultProductTypes(search);
  }
};
