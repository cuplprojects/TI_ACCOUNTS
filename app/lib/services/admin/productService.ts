import axiosInstance from "../../axiosConfig";
import {
  showSuccessMessage,
  showErrorMessage,
  showLoading,
  closeLoading,
  showConfirmation,
} from "../../swalConfig";
import { AxiosError } from "axios";
import { uploadImagesWithPresignedUrls } from "../presignedUrlService";

// Types for nested fields
// ProductImageUrl represents the image data structure returned from the server
// For uploads, File objects are sent directly via FormData
export interface ProductImageUrl {
  url: string;
  position: number;
  alt?: string;
  key?: string;
  originalName?: string;
}

// Backend API format for image uploads (only key and originalName)
export interface ProductImageUpload {
  key: string;
  originalName: string;
}

export interface ProductTag {
  id: string;
  product_id: string;
  tag_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  ProductTag: ProductTag;
}

export interface ProductCollection {
  id: string;
  product_id: string;
  collection_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  title: string;
  category_type: string;
  ProductCollection: ProductCollection;
}

// Variant related interfaces
export interface VariationOption {
  id: string;
  name: string;
  values: string[];
}

export interface ProductVariantMap {
  product_id: string;
  option_values: { [key: string]: string }; // e.g., { "Color": "Red", "Size": "XL" }
}

export interface Product {
  id?: string;
  serial_no: string;
  title: string;
  description: string;
  short_description: string;
  image_urls: ProductImageUrl[];
  seller_price?: number;  // Price set by seller/admin
  price: number;
  compare_price: number;
  cost_per_item?: number;
  gst_percent: number;
  physical_product: boolean;
  is_tracking_inventory: boolean;
  stock_qty: number;
  sell_out_of_stock: boolean;
  sku: string;
  barcode?: string;
  weight: number;
  length: number;
  breadth: number;
  height: number;
  region_of_origin: string;
  hs_code: string;
  page_title?: string;
  page_description?: string;
  page_url?: string;
  type: string;
  brand: string;
  margin_contribution?: number;
  seller_id: string;
  status: "draft" | "active" | "inactive" | "approvalpending";
  createdAt?: string;
  updatedAt?: string;
  Tags?: Tag[];
  Collections?: Collection[];
  tags?: string[];
  collections?: string[];
  default_image_urls?: ProductImageUrl[]; // Added field for variant products

  // Seller details
  Seller?: {
    id: string;
    firm_name: string;
    email: string;
    phone: string;
  };

  // Variant fields
  has_variant?: boolean;
  variant_id?: string;
  option_values?: { [key: string]: string }; // e.g., { "Color": "Red", "Size": "XL" }
  variants?: {
    common_attributes?: ProductCommonAttributes;
    variation_options?: VariationOption[];
    variant_products?: VariantProduct[];
  };

  // UI-only fields - backward compatibility
  has_variations?: boolean;
  variation_options?: VariationOption[];

  // New fields
  DefaultVariant?: VariantProduct;

  // Category hierarchy
  category_hierarchy?: {
    superCategories: Array<{ id: string; title: string; category_type: string }>;
    categories: Array<{ id: string; title: string; category_type: string }>;
    subCategories: Array<{ id: string; title: string; category_type: string }>;
  };

  // Vendor information
  vendor?: string; // Seller firm name
  vendor_id?: string; // Seller ID

  // Variant count for quick view in tables
  variant_count?: number;
}

// Common attributes shared across variant products
export interface ProductCommonAttributes {
  title: string;
  description: string;
  short_description: string;
  serial_no: string;
  page_title?: string;
  page_description?: string;
  page_url?: string;
  status: "draft" | "active" | "inactive" | "approvalpending";
  brand: string;
  type: string;
  physical_product: boolean;
  default_image_urls?: ProductImageUpload[] | ProductImageUrl[];
  region_of_origin?: string; // Added to fix validation errors
  hs_code?: string; // Added to fix validation errors
  gst_percent?: number; // Added to fix validation errors
  margin_contribution?: number; // Added for consistency
}

// Variant-specific data
export interface VariantProduct {
  id?: string;
  option_values: { [key: string]: string };
  price: number;
  seller_price?: number;
  compare_price: number;
  sku: string;
  barcode?: string;
  stock_qty: number;
  weight: number;
  length: number;
  breadth: number;
  height: number;
  is_tracking_inventory: boolean;
  sell_out_of_stock: boolean;
  cost_per_item: number;
  // NOTE: gst_percent, region_of_origin, hs_code are product-level only
  // These fields should NOT be included at variant level
  images?: (File | string)[];
  image_urls?: {
    key: string;
    originalName: string;
    url?: string;
    position?: number;
  }[]; // Match the format in Variant interface
}

// Product query parameters interface
export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  seller?: string;
  status?: "active" | "inactive" | "draft" | "approvalpending";
  category?: string;
  brand?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  lowStock?: boolean;
  inStock?: boolean;
  sort?:
    | "newest"
    | "oldest"
    | "price_asc"
    | "price_desc"
    | "name_asc"
    | "name_desc"
    | "stock_asc"
    | "stock_desc";
}

// Pagination interface
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Summary interface
export interface ProductSummary {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  draftProducts: number;
  approvalpendingProducts?: number;
  lowStockProducts: number;
}

// Products response interface
export interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
  filters: ProductQueryParams;
  summary: ProductSummary;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

// Get all products with pagination and filtering
export const getAllProducts = async (
  params: ProductQueryParams = {}
): Promise<ProductsResponse> => {
  try {
  //  showLoading("Loading products...");

    // Build query parameters
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.seller) queryParams.append("seller", params.seller);
    if (params.status) queryParams.append("status", params.status);
    if (params.category) queryParams.append("category", params.category);
    if (params.brand) queryParams.append("brand", params.brand);
    if (params.type) queryParams.append("type", params.type);
    if (params.minPrice)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params.maxPrice)
      queryParams.append("maxPrice", params.maxPrice.toString());
    if (params.lowStock) queryParams.append("lowStock", "true");
    if (params.inStock) queryParams.append("inStock", "true");
    if (params.sort) queryParams.append("sort", params.sort);

    const url = `/admin/product/get-products${
      queryParams.toString() ? "?" + queryParams.toString() : ""
    }`;
    const response = await axiosInstance.get<ApiResponse<ProductsResponse>>(
      url
    );

    closeLoading();
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      showErrorMessage(response.data.message || "Failed to load products");
      return {
        products: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalProducts: 0,
          limit: 20,
          hasNext: false,
          hasPrev: false,
        },
        filters: params,
        summary: {
          totalProducts: 0,
          activeProducts: 0,
          inactiveProducts: 0,
          draftProducts: 0,
          approvalpendingProducts: 0,
          lowStockProducts: 0,
        },
      };
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error loading products"
      );
    } else {
      showErrorMessage("Failed to load products. Please try again later.");
    }
    return {
      products: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalProducts: 0,
        limit: 20,
        hasNext: false,
        hasPrev: false,
      },
      filters: params,
      summary: {
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0,
        draftProducts: 0,
        approvalpendingProducts: 0,
        lowStockProducts: 0,
      },
    };
  }
};

// Get single product
export const getProduct = async (
  productId: string
): Promise<Product | null> => {
  try {
    showLoading("Loading product details...");
    const response = await axiosInstance.get<ApiResponse<Product>>(
      `/admin/product/get-product/${productId}`
    );
    closeLoading();

    if (response.data.success && response.data.data) {
      const product = response.data.data;
      console.log("Product fetched:", product);
      // Add image_urls from DefaultVariant if it exists and product doesn't have image_urls
      if (!product.image_urls && product.DefaultVariant?.image_urls) {
        // Convert image_urls to match our expected format
        product.image_urls = product.DefaultVariant.image_urls.map(
          (img: any, index: number) => ({
            ...img,
            url:
              img.url ||
              `https://totallyassets.s3.ap-south-1.amazonaws.com/${img.key}`,
            position: img.position || index,
          })
        );
      }

      // Process variants data to match expected format for frontend
      if (product.has_variant && product.variants) {
        // If variants is an array (old format), convert it to expected structure
        if (Array.isArray(product.variants)) {
          const defaultVariant = product.DefaultVariant || product.variants[0];

          product.variants = {
            common_attributes: {
              title: product.title,
              description: product.description,
              short_description: product.short_description,
              serial_no: product.serial_no,
              page_title: product.page_title,
              page_description: product.page_description,
              page_url: product.page_url,
              status: product.status,
              brand: product.brand,
              type: product.type,
              hs_code: product.hs_code,
              gst_percent: product.gst_percent,
              region_of_origin: product.region_of_origin,
              margin_contribution: product.margin_contribution,
              physical_product: defaultVariant?.physical_product ?? true,
            },
            variation_options: product.variation_options || [],
            variant_products: product.variants.map((variant) => ({
              ...variant,
              option_values: variant.option_values || {},
              // Convert image_urls to match our expected format
              image_urls:
                variant.image_urls?.map((img: any, index: number) => ({
                  ...img,
                  url:
                    img.url ||
                    `https://totallyassets.s3.ap-south-1.amazonaws.com/${img.key}`,
                  position: img.position || index,
                })) || [],
            })),
          };
        }
      }

      return product;
    } else {
      showErrorMessage(response.data.message || "Product not found");
      return null;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error loading product details"
      );
    } else {
      showErrorMessage(
        "Failed to load product details. Please try again later."
      );
    }
    return null;
  }
};

// Create product with presigned URL support
export const createProduct = async (
  sellerId: string,
  product: Partial<Product>,
  images?: File[],
  enableHSNValidator: boolean = false
): Promise<boolean> => {
  try {
    // Show loading message for the entire process
    showLoading("Creating product...");

    // If there are images to upload, use FormData
    if (images && images.length > 0) {
      const formData = new FormData();

      // Add all product fields to FormData
      Object.keys(product).forEach((key) => {
        // Skip arrays and objects for special handling
        if (
          key !== "tags" &&
          key !== "collections" &&
          key !== "image_urls" &&
          product[key as keyof Partial<Product>] !== undefined
        ) {
          formData.append(key, String(product[key as keyof Partial<Product>]));
        }
      });

      try {
        const uploadedImages = await uploadImagesWithPresignedUrls(
          images,
          "products/temp",
          "admin"
        );

        if (uploadedImages && uploadedImages.length > 0) {
          // Convert to the format expected by backend (key and originalName)
          formData.append(
            "image_urls",
            JSON.stringify(
              uploadedImages.map((img) => ({
                key: img.key,
                originalName: img.originalName,
              }))
            )
          );
        }
      } catch (error) {
        closeLoading();
        console.error("Error uploading images:", error);
        showErrorMessage("Failed to upload images");
        return false;
      }

      // For regular products, explicitly set default_image_urls to empty array
      formData.append("default_image_urls", JSON.stringify([]));

      // Handle tags and collections
      if (product.tags && product.tags.length > 0) {
        formData.append("tags", JSON.stringify(product.tags));
      }

      if (product.collections && product.collections.length > 0) {
        formData.append("collections", JSON.stringify(product.collections));
      }

      // Send the request with HSN validator flag
      const response = await axiosInstance.post(
        `/admin/product/create-product/${sellerId}?enableHSNValidator=${String(enableHSNValidator).toLowerCase()}`,
        formData
      );

      closeLoading();

      if (response.data.success) {
        showSuccessMessage(
          response.data.message || "Product Created Successfully!"
        );
        return true;
      } else {
        if (response.data.errors && response.data.errors.length > 0) {
          // Combine all errors into a single message with line breaks
          const errorMessage = response.data.errors.join("<br>");
          showErrorMessage(
            `Validation failed. Please fix the following issues:<br>${errorMessage}`
          );
        } else {
          showErrorMessage(response.data.message || "Failed to create product");
        }
        return false;
      }
    } else {
      // No images to upload, send as JSON
      const payload: any = { ...product };

      // For regular products, explicitly set default_image_urls to empty array
      if (!payload.default_image_urls) {
        payload.default_image_urls = [];
      }

      // Convert image_urls to proper format if provided
      if (payload.image_urls && Array.isArray(payload.image_urls)) {
        payload.image_urls = payload.image_urls.map((img: any) => {
          // If it's already an object with key and originalName, keep it
          if (img.key && img.originalName) {
            return {
              key: img.key,
              originalName: img.originalName,
            };
          }
          // If it's a URL string, extract the key
          if (typeof img === 'string') {
            const urlParts = img.split('amazonaws.com/');
            const key = urlParts.length > 1 ? urlParts[1] : img.split('/').pop() || 'image.jpg';
            return {
              key: key,
              originalName: 'image.jpg',
            };
          }
          return img;
        });
      }

      const response = await axiosInstance.post(
        `/admin/product/create-product/${sellerId}?enableHSNValidator=${String(enableHSNValidator).toLowerCase()}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      closeLoading();

      if (response.data.success) {
        showSuccessMessage(
          response.data.message || "Product Created Successfully!"
        );
        return true;
      } else {
        if (response.data.errors && response.data.errors.length > 0) {
          // Combine all errors into a single message with line breaks
          const errorMessage = response.data.errors.join("<br>");
          showErrorMessage(
            `Validation failed. Please fix the following issues:<br>${errorMessage}`
          );
        } else {
          showErrorMessage(response.data.message || "Failed to create product");
        }
        return false;
      }
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      if (
        axiosError.response.data?.errors &&
        axiosError.response.data.errors.length > 0
      ) {
        // Combine all errors into a single message with line breaks
        const errorMessage = axiosError.response.data.errors.join("<br>");
        showErrorMessage(
          `Validation failed. Please fix the following issues:<br>${errorMessage}`
        );
      } else {
        showErrorMessage(
          axiosError.response.data?.message || "Error creating product"
        );
      }
    } else {
      showErrorMessage("Failed to create product. Please try again later.");
    }
    return false;
  }
};

// Update product with presigned URL support
export const updateProduct = async (
  productId: string,
  product: Partial<Product>,
  images?: File[],
  enableHSNValidator: boolean = false
): Promise<boolean> => {
  try {
    // Show loading message for the entire process
    showLoading("Updating product...");

    // If there are images to upload, use FormData
    if (images && images.length > 0) {
      const formData = new FormData();

      // For regular products, explicitly set default_image_urls to empty array
      formData.append("default_image_urls", JSON.stringify([]));

      // Add all product fields to FormData
      Object.keys(product).forEach((key) => {
        // Skip arrays and objects for special handling
        if (
          key !== "tags" &&
          key !== "collections" &&
          key !== "image_urls" &&
          key !== "default_image_urls" &&
          product[key as keyof Partial<Product>] !== undefined
        ) {
          formData.append(key, String(product[key as keyof Partial<Product>]));
        }
      });

      try {
        const uploadedImages = await uploadImagesWithPresignedUrls(
          images,
          "products/temp",
          "admin"
        );

        if (uploadedImages && uploadedImages.length > 0) {
          // Convert to the format expected by backend (key and originalName)
          formData.append(
            "image_urls",
            JSON.stringify(
              uploadedImages.map((img) => ({
                key: img.key,
                originalName: img.originalName,
              }))
            )
          );
        }
      } catch (error) {
        closeLoading();
        console.error("Error uploading images:", error);
        showErrorMessage("Failed to upload images");
        return false;
      }

      // Handle tags and collections
      if (product.tags !== undefined) {
        formData.append("tags", JSON.stringify(product.tags || []));
      }

      if (product.collections !== undefined) {
        formData.append("collections", JSON.stringify(product.collections || []));
      }

      // Send the request
      const response = await axiosInstance.put(
        `/admin/product/update-product/${productId}?enableHSNValidator=${String(enableHSNValidator).toLowerCase()}`,
        formData
      );

      closeLoading();

      if (response.data.success) {
        showSuccessMessage(
          response.data.message || "Product Updated Successfully!"
        );
        return true;
      } else {
        if (response.data.errors && response.data.errors.length > 0) {
          // Combine all errors into a single message with line breaks
          const errorMessage = response.data.errors.join("<br>");
          showErrorMessage(
            `Validation failed. Please fix the following issues:<br>${errorMessage}`
          );
        } else {
          showErrorMessage(response.data.message || "Failed to update product");
        }
        return false;
      }
    } else {
      // No images to upload, send as JSON
      const payload: any = { ...product };

      // For regular products, explicitly set default_image_urls to empty array
      if (!payload.default_image_urls) {
        payload.default_image_urls = [];
      }

      // Convert image_urls to proper format if provided
      if (payload.image_urls && Array.isArray(payload.image_urls)) {
        payload.image_urls = payload.image_urls.map((img: any) => {
          // If it's already an object with key and originalName, keep it
          if (img.key && img.originalName) {
            return {
              key: img.key,
              originalName: img.originalName,
            };
          }
          // If it's a URL string, extract the key
          if (typeof img === 'string') {
            const urlParts = img.split('amazonaws.com/');
            const key = urlParts.length > 1 ? urlParts[1] : img.split('/').pop() || 'image.jpg';
            return {
              key: key,
              originalName: 'image.jpg',
            };
          }
          return img;
        });
      }

      const response = await axiosInstance.put(
        `/admin/product/update-product/${productId}?enableHSNValidator=${String(enableHSNValidator).toLowerCase()}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      closeLoading();

      if (response.data.success) {
        showSuccessMessage(
          response.data.message || "Product Updated Successfully!"
        );
        return true;
      } else {
        if (response.data.errors && response.data.errors.length > 0) {
          // Combine all errors into a single message with line breaks
          const errorMessage = response.data.errors.join("<br>");
          showErrorMessage(
            `Validation failed. Please fix the following issues:<br>${errorMessage}`
          );
        } else {
          showErrorMessage(response.data.message || "Failed to update product");
        }
        return false;
      }
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      if (
        axiosError.response.data?.errors &&
        axiosError.response.data.errors.length > 0
      ) {
        // Combine all errors into a single message with line breaks
        const errorMessage = axiosError.response.data.errors.join("<br>");
        showErrorMessage(
          `Validation failed. Please fix the following issues:<br>${errorMessage}`
        );
      } else {
        showErrorMessage(
          axiosError.response.data?.message || "Error updating product"
        );
      }
    } else {
      showErrorMessage("Failed to update product. Please try again later.");
    }
    return false;
  }
};

// Delete product
export const deleteProduct = async (productId: string): Promise<boolean> => {
  try {
    const result = await showConfirmation(
      "Delete Product",
      "Are you sure you want to delete this product? This action cannot be undone."
    );
    if (result.isConfirmed) {
      showLoading("Deleting product...");
      const response = await axiosInstance.delete<ApiResponse<null>>(
        `/admin/product/delete-product/${productId}`
      );
      closeLoading();
      if (response.data.success) {
        showSuccessMessage(
          response.data.message || "Product Deleted Successfully!"
        );
        return true;
      } else {
        showErrorMessage(response.data.message || "Failed to delete product");
        return false;
      }
    }
    return false;
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error deleting product"
      );
    } else {
      showErrorMessage("Failed to delete product. Please try again later.");
    }
    return false;
  }
};

// Bulk delete products
export const bulkDeleteProducts = async (productIds: string[]): Promise<{ success: boolean; confirmed: boolean; deletedCount?: number; failedCount?: number; failedProductIds?: string[] }> => {
  try {
    if (productIds.length === 0) {
      showErrorMessage("Please select at least one product to delete");
      return { success: false, confirmed: false };
    }

    const result = await showConfirmation(
      "Delete Multiple Products?",
      `Are you sure you want to delete ${productIds.length} product(s)? This action cannot be undone.`
    );
    
    if (!result.isConfirmed) {
      return { success: false, confirmed: false };
    }

    showLoading(`Deleting ${productIds.length} product(s)...`);
    const response = await axiosInstance.post<ApiResponse<{ deletedCount: number; failedCount: number; failedProductIds: string[]; partialSuccess?: boolean }>>(
      `/admin/product/bulk-delete-products`,
      { productIds }
    );
    closeLoading();

    if (response.data.success) {
      const { deletedCount = 0, failedCount = 0, partialSuccess = false } = response.data.data || {};
      
      if (partialSuccess) {
        // Partial success - some deleted, some failed
        showSuccessMessage(
          response.data.message || `Deleted ${deletedCount} product(s). ${failedCount} product(s) could not be deleted (in active carts).`
        );
      } else {
        // Full success - all deleted
        showSuccessMessage(
          response.data.message || `Successfully deleted ${deletedCount} product(s)`
        );
      }
      
      return { 
        success: true, 
        confirmed: true,
        deletedCount,
        failedCount,
        failedProductIds: response.data.data?.failedProductIds || []
      };
    } else {
      showErrorMessage(response.data.message || "Failed to delete products");
      return { success: false, confirmed: true };
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response?.status === 409) {
      // All products in carts
      const data = axiosError.response.data as any;
      showErrorMessage(
        data?.message || "All selected products are in active carts and cannot be deleted"
      );
    } else if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error deleting products"
      );
    } else {
      showErrorMessage("Failed to delete products. Please try again later.");
    }
    return { success: false, confirmed: true };
  }
};

export const deleteProductImage = async (
  productId: string,
  payload: { key: string; type: "variant" | "default"; variant_id?: string }
): Promise<boolean> => {
  const result = await showConfirmation(
    "Delete Image",
    "Are you sure you want to delete this image? This action cannot be undone."
  );
  if (!result.isConfirmed) return false;

  try {
    showLoading("Deleting image...");
    const response = await axiosInstance.delete(
      `/admin/product/delete-image/${productId}`,
      {
        data: payload,
      }
    );
    closeLoading();
    if (response.data.success) {
      showSuccessMessage("Image deleted successfully");
      return true;
    }
    showErrorMessage(response.data.message || "Failed to delete image");
    return false;
  } catch (error) {
    closeLoading();
    showErrorMessage("Failed to delete image");
    return false;
  }
};

// Get products by collection
export const getProductsByCollection = async (
  collectionId: string
): Promise<Product[]> => {
  try {
    showLoading("Loading collection products...");
    const response = await axiosInstance.get<ApiResponse<unknown[]>>(
      `/admin/product/get-productsbycollection/${collectionId}`
    );
    closeLoading();
    if (response.data.success && response.data.data) {
      // The API returns an array of { id, product_id, collection_id, ..., Product }
      // We want to return an array of Product
      return (response.data.data as { Product: Product }[]).map(
        (item) => item.Product
      );
    } else {
      showErrorMessage(
        response.data.message || "Failed to load collection products"
      );
      return [];
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error loading collection products"
      );
    } else {
      showErrorMessage(
        "Failed to load collection products. Please try again later."
      );
    }
    return [];
  }
};

// Update image positions
export const updateImagePositions = async (
  productId: string,
  imagePositions: ProductImageUrl[]
): Promise<boolean> => {
  try {
    showLoading("Updating image positions...");
    const response = await axiosInstance.post<ApiResponse<unknown>>(
      `/admin/product/update-positions/${productId}`,
      { imagePositions }
    );
    closeLoading();
    if (response.data.success) {
      showSuccessMessage("Image positions updated successfully");
      return true;
    } else {
      showErrorMessage(
        response.data.message || "Failed to update image positions"
      );
      return false;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error updating image positions"
      );
    } else {
      showErrorMessage(
        "Failed to update image positions. Please try again later."
      );
    }
    return false;
  }
};

// Build FormData for product with variants
// Removed unused buildVariantProductFormData function - using presigned URLs instead

/**
 * Process variant products with presigned URL image uploads (Admin)
 * Silently skips variants missing required pricing data
 */
const processVariantProductsWithPresignedUrls = async (
  variantProducts: VariantProduct[]
): Promise<VariantProduct[]> => {
  const processedVariants: VariantProduct[] = [];

  for (const variant of variantProducts) {
    // Skip variants without required pricing data
    if (variant.price === null || variant.price === undefined || variant.compare_price === null || variant.compare_price === undefined) {
      continue;
    }

    const { images, ...variantData } = variant;

    if (images && images.length > 0) {
      // Filter only File objects for upload
      const filesToUpload = images.filter(
        (img): img is File => img instanceof File
      );

      if (filesToUpload.length > 0) {
        try {
          // Upload images using presigned URLs
          const uploadedImages = await uploadImagesWithPresignedUrls(
            filesToUpload,
            "products/temp",
            "admin"
          );

          if (!uploadedImages) {
            throw new Error("Failed to upload variant images");
          }

          // Add uploaded image URLs to variant (backend expects only key and originalName)
          // Merge with existing image_urls to preserve previously uploaded images
          const existingImageUrls = variantData.image_urls || [];
          const newImageUrls = uploadedImages.map((img) => ({
            url: img.url,
            key: img.key,
            originalName: img.originalName,
          }));
          
          processedVariants.push({
            ...variantData,
            image_urls: [...existingImageUrls, ...newImageUrls] as any, // Merge existing and new images
          });
        } catch (imageError) {
          throw new Error(
            `Failed to upload images for variant: ${
              imageError instanceof Error ? imageError.message : "Unknown error"
            }`
          );
        }
      } else {
        // No new files to upload, keep existing URLs
        processedVariants.push(variantData);
      }
    } else {
      // No images for this variant
      processedVariants.push(variantData);
    }
  }

  return processedVariants;
};

// Create product with variants using presigned URLs
export const createProductWithVariants = async (
  sellerId: string,
  data: {
    common_attributes: ProductCommonAttributes;
    variation_options: VariationOption[];
    variant_products: VariantProduct[];
  },
  enableHSNValidator: boolean = false
): Promise<boolean> => {
  try {
    showLoading("Creating product with variants...");

    // Process variant products and upload their images
    const processedVariants = await processVariantProductsWithPresignedUrls(
      data.variant_products
    );

    // Make sure default_image_urls is always defined as an array
    const commonAttributes = {
      ...data.common_attributes,
      // If default_image_urls doesn't exist or isn't an array, set it to an empty array
      default_image_urls: Array.isArray(
        data.common_attributes.default_image_urls
      )
        ? data.common_attributes.default_image_urls
        : [],
    };

    const payload = {
      common_attributes: commonAttributes,
      variation_options: data.variation_options,
      variant_products: processedVariants,
    };

    const response = await axiosInstance.post<ApiResponse<null>>(
      `/admin/product/create-product-with-variants/${sellerId}?enableHSNValidator=${String(enableHSNValidator).toLowerCase()}`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    closeLoading();

    if (response.data.success) {
      showSuccessMessage(
        response.data.message || "Product with variants created successfully!"
      );
      return true;
    } else {
      if (response.data.errors && response.data.errors.length > 0) {
        const errorMessage = response.data.errors.join("<br>");
        showErrorMessage(
          `Validation failed. Please fix the following issues:<br>${errorMessage}`
        );
      } else {
        showErrorMessage(
          response.data.message || "Failed to create product with variants"
        );
      }
      return false;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      if (
        axiosError.response.data?.errors &&
        axiosError.response.data.errors.length > 0
      ) {
        const errorMessage = axiosError.response.data.errors.join("<br>");
        showErrorMessage(
          `Validation failed. Please fix the following issues:<br>${errorMessage}`
        );
      } else {
        showErrorMessage(
          axiosError.response.data?.message ||
            "Error creating product with variants"
        );
      }
    } else {
      showErrorMessage(
        "Failed to create product with variants. Please try again later."
      );
    }
    return false;
  }
};

// Update product with variants using presigned URLs
export const updateProductWithVariants = async (
  productId: string,
  data: {
    common_attributes: ProductCommonAttributes;
    variation_options: VariationOption[];
    variant_products: VariantProduct[];
  },
  enableHSNValidator: boolean = false
): Promise<boolean> => {
  try {
    showLoading("Updating product with variants...");

    // Process variant products and upload their images
    const processedVariants = await processVariantProductsWithPresignedUrls(
      data.variant_products
    );

    // Make sure default_image_urls is always defined as an array
    const commonAttributes = {
      ...data.common_attributes,
      // If default_image_urls doesn't exist or isn't an array, set it to an empty array
      default_image_urls: Array.isArray(
        data.common_attributes.default_image_urls
      )
        ? data.common_attributes.default_image_urls
        : [],
    };

    const payload = {
      common_attributes: commonAttributes,
      variation_options: data.variation_options,
      variant_products: processedVariants,
    };

    const response = await axiosInstance.put<ApiResponse<null>>(
      `/admin/product/update-product-with-variants/${productId}?enableHSNValidator=${String(enableHSNValidator).toLowerCase()}`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    closeLoading();

    if (response.data.success) {
      showSuccessMessage(
        response.data.message || "Product with variants updated successfully!"
      );
      return true;
    } else {
      if (response.data.errors && response.data.errors.length > 0) {
        const errorMessage = response.data.errors.join("<br>");
        showErrorMessage(
          `Validation failed. Please fix the following issues:<br>${errorMessage}`
        );
      } else {
        showErrorMessage(
          response.data.message || "Failed to update product with variants"
        );
      }
      return false;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      if (
        axiosError.response.data?.errors &&
        axiosError.response.data.errors.length > 0
      ) {
        const errorMessage = axiosError.response.data.errors.join("<br>");
        showErrorMessage(
          `Validation failed. Please fix the following issues:<br>${errorMessage}`
        );
      } else {
        showErrorMessage(
          axiosError.response.data?.message ||
            "Error updating product with variants"
        );
      }
    } else {
      showErrorMessage(
        "Failed to update product with variants. Please try again later."
      );
    }
    return false;
  }
};

// Approve product (change status from approvalpending to active)
export const approveProduct = async (productId: string): Promise<boolean> => {
  try {
    const result = await showConfirmation(
      "Approve Product",
      "Are you sure you want to approve this product? It will be set to active status."
    );
    if (!result.isConfirmed) return false;

    showLoading("Approving product...");
    const response = await axiosInstance.put<ApiResponse<null>>(
      `/admin/product/update-product-status/${productId}`,
      { status: "active" }
    );
    closeLoading();

    if (response.data.success) {
      showSuccessMessage(
        response.data.message || "Product approved successfully!"
      );
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to approve product");
      return false;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error approving product"
      );
    } else {
      showErrorMessage("Failed to approve product. Please try again later.");
    }
    return false;
  }
};

export const bulkApproveProducts = async (productIds: string[]): Promise<{ success: boolean; confirmed: boolean; approvedCount?: number; failedCount?: number; failedProductIds?: string[] }> => {
  try {
    if (productIds.length === 0) {
      return { success: false, confirmed: false };
    }

    const result = await showConfirmation(
      "Approve Products",
      `Are you sure you want to approve ${productIds.length} product(s)? They will be set to active status.`
    );

    if (!result.isConfirmed) {
      return { success: false, confirmed: false };
    }

    showLoading(`Approving ${productIds.length} product(s)...`);

    const response = await axiosInstance.post<ApiResponse<{ approvedCount: number; failedCount: number; failedProductIds: string[] }>>(
      `/admin/product/bulk-approve-products`,
      { productIds }
    );

    closeLoading();

    if (response.data.success) {
      const { approvedCount = 0, failedCount = 0, failedProductIds = [] } = response.data.data || {};
      
      if (failedCount > 0) {
        showErrorMessage(
          `${approvedCount} product(s) approved, but ${failedCount} failed to approve.`
        );
      } else {
        showSuccessMessage(
          response.data.message || `${approvedCount} product(s) approved successfully!`
        );
      }

      return {
        success: true,
        confirmed: true,
        approvedCount,
        failedCount,
        failedProductIds
      };
    } else {
      showErrorMessage(response.data.message || "Failed to approve products");
      return { success: false, confirmed: true };
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error approving products"
      );
    } else {
      showErrorMessage("Failed to approve products. Please try again later.");
    }
    return { success: false, confirmed: true };
  }
};
