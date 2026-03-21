import axiosInstance from "../../axiosConfig";
import {
  showSuccessMessage,
  showErrorMessage,
  showLoading,
  closeLoading,
} from "../../swalConfig";
import { AxiosError } from "axios";
import { uploadImagesWithPresignedUrls } from "../presignedUrlService";

// Base URL for seller product API
const BASE_URL = "/seller/product";

// Tag interface
export interface Tag {
  id: string;
  name: string;
  description?: string;
  ProductTag?: {
    id: string;
    product_id: string;
    tag_id: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Collection interface
export interface Collection {
  id: string;
  title: string;
  collection_type?: string;
  category_type?: string;
  ProductCollection?: {
    id: string;
    product_id: string;
    collection_id: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Product Image interface
export interface ProductImage {
  url: string;
  position: number;
  key: string; // S3 key for backend operations
  originalName: string; // Original filename for backend operations
}

// Backend API format for image uploads (only key and originalName)
export interface ProductImageUpload {
  key: string;
  originalName: string;
}

// Seller interface
export interface Seller {
  id: string;
  firm_name: string;
  business_name: string;
  email: string;
}

// Review interface
export interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  image_urls: ProductImage[];
  createdAt: string;
  user: {
    display_name: string;
  };
}

// Review Statistics interface
export interface ReviewStatistics {
  total_reviews: number;
  average_rating: number;
  rating_distribution: {
    [key: string]: number;
  };
}

// Reviews Response interface
export interface ReviewsResponse {
  reviews: Review[];
  statistics: ReviewStatistics;
  showing_count: number;
}

// Variation Option interface (for UI)
export interface VariationOption {
  id: string;
  name: string;
  values: string[];
}

// Variant Product interface (for API)
// Variant-specific data
export interface VariantProduct {
  id?: string;
  option_values: { [optionName: string]: string };
  price: number;
  seller_price?: number;
  compare_price?: number;
  sku: string;
  barcode?: string;
  stock_qty: number;
  weight?: number;
  length?: number;
  breadth?: number;
  height?: number;
  cost_per_item?: number;
  gst_percent: number;
  region_of_origin: string;
  hs_code: string;
  is_tracking_inventory: boolean;
  sell_out_of_stock: boolean;
  margin_contribution?: number;
  serial_no: string;
  image_urls?: ProductImage[];
  images?: (File | string)[]; // Add support for File objects
  enabled: boolean;
  physical_product?: boolean;
}

// Variant interface (for API response)
export interface Variant {
  common_attributes: {
    title: string;
    description: string;
    short_description: string;
    page_title?: string;
    page_description?: string;
    page_url?: string;
    status: "draft" | "active" | "inactive" | "approvalpending";
    brand: string;
    type: string;
    physical_product: boolean;
    margin_contribution?: number;
    tags?: string[];
    collections?: string[];
  };
  variation_options: VariationOption[];
  variant_products: VariantProduct[];
}

// Product interface
export interface Product {
  id?: string;
  serial_no: string;
  title: string;
  description: string;
  short_description: string;
  image_urls: ProductImage[];
  price: number;
  seller_price?: number;
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
  Seller?: Seller;
  tags?: string[];
  collections?: string[];
  default_image_urls?: ProductImage[]; // Added field for variant products

  // Variant-related fields
  has_variant?: boolean;
  variant_id?: string | null;
  option_values?: { [optionName: string]: string } | null;
  variants?: {
    common_attributes?: CommonAttributes;
    variation_options?: VariationOption[];
    variant_products?: VariantProduct[];
  };

  // UI-only fields - backward compatibility
  has_variations?: boolean;
  variation_options?: VariationOption[];

  // New fields
  DefaultVariant?: VariantProduct;

  // Optional fields for detailed responses
  reviews?: ReviewsResponse;

  // Category hierarchy
  category_hierarchy?: {
    superCategories: Array<{ id: string; title: string; category_type: string }>;
    categories: Array<{ id: string; title: string; category_type: string }>;
    subCategories: Array<{ id: string; title: string; category_type: string }>;
  };
}

// Product Form Data interface
export interface ProductFormData {
  serial_no?: string;
  title: string;
  description: string;
  short_description: string;
  price: number;
  seller_price?: number;
  compare_price?: number;
  cost_per_item?: number;
  gst_percent: number;
  physical_product?: boolean;
  is_tracking_inventory?: boolean;
  stock_qty?: number;
  sell_out_of_stock?: boolean;
  sku?: string;
  barcode?: string;
  weight: number;
  length?: number;
  breadth?: number;
  height?: number;
  region_of_origin: string;
  hs_code: string;
  page_title?: string;
  page_description?: string;
  page_url?: string;
  type: string;
  brand: string;
  margin_contribution?: number;
  status?: "draft" | "active" | "inactive" | "approvalpending";
  tags?: string[];
  collections?: string[];
  // Variant-related fields
  has_variations?: boolean;
  variation_options?: VariationOption[];
  variants?: VariantProduct[];
}

// Common Attributes interface (for variant products)
export interface CommonAttributes {
  title: string;
  description: string;
  short_description: string;
  serial_no?: string;
  page_title?: string;
  page_description?: string;
  page_url?: string;
  status: "draft" | "active" | "inactive" | "approvalpending";
  brand: string;
  type: string;
  physical_product: boolean;
  default_image_urls?: ProductImageUpload[] | ProductImage[];
  region_of_origin?: string;
  hs_code?: string;
  gst_percent?: number;
  margin_contribution?: number;
  tags?: string[];
  collections?: string[];
}

// Alias for backward compatibility
export type ProductCommonAttributes = CommonAttributes;

// Product With Variants Form Data interface
export interface ProductWithVariantsFormData {
  common_attributes: CommonAttributes;
  variation_options: VariationOption[];
  variant_products: VariantProduct[];
}

// Query parameters for products
export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive" | "draft" | "approvalpending";
  category?: string;
  brand?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  lowStock?: boolean;
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
  nextPage: number | null;
  prevPage: number | null;
}

// Product Summary interface
export interface ProductSummary {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  draftProducts: number;
  approvalpendingProducts?: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

// Products Response interface
export interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
  filters: ProductQueryParams;
  seller_id: string;
  summary: ProductSummary;
}

// API Response interface
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

/**
 * Get all products for a seller
 */
export const getAllProducts = async (
  sellerId: string,
  params: ProductQueryParams = {}
): Promise<ProductsResponse> => {
  try {
  //  showLoading("Loading products...");

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.status) queryParams.append("status", params.status);
    if (params.category) queryParams.append("category", params.category);
    if (params.brand) queryParams.append("brand", params.brand);
    if (params.type) queryParams.append("type", params.type);
    if (params.minPrice)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params.maxPrice)
      queryParams.append("maxPrice", params.maxPrice.toString());
    if (params.sort) queryParams.append("sort", params.sort);
    if (params.inStock !== undefined)
      queryParams.append("inStock", params.inStock.toString());
    if (params.lowStock !== undefined)
      queryParams.append("lowStock", params.lowStock.toString());

    const url = `${BASE_URL}/get-products/${sellerId}${
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
          nextPage: null,
          prevPage: null,
        },
        filters: params,
        seller_id: sellerId,
        summary: {
          totalProducts: 0,
          activeProducts: 0,
          inactiveProducts: 0,
          draftProducts: 0,
          lowStockProducts: 0,
          outOfStockProducts: 0,
        },
      };
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Failed to load products"
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
        nextPage: null,
        prevPage: null,
      },
      filters: params,
      seller_id: sellerId,
      summary: {
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0,
        draftProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
      },
    };
  }
};

/**
 * Get a single product by ID
 */
export const getProduct = async (
  id: string,
  includeReviews: boolean = true,
  reviewsLimit: number = 5
): Promise<Product | null> => {
  try {
    showLoading("Loading product details...");

    const queryParams = new URLSearchParams();
    queryParams.append("include_reviews", includeReviews.toString());
    queryParams.append("reviews_limit", reviewsLimit.toString());

    const url = `${BASE_URL}/get-product/${id}?${queryParams.toString()}`;

    const response = await axiosInstance.get<ApiResponse<Product>>(url);
    closeLoading();

    if (response.data.success && response.data.data) {
      const product = response.data.data;

      // Add image_urls from DefaultVariant if it exists and product doesn't have image_urls
      if (!product.image_urls && product.DefaultVariant?.image_urls) {
        // Convert image_urls to match our expected format
        product.image_urls = product.DefaultVariant.image_urls.map(
          (img: ProductImage, index: number) => ({
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
              page_title: product.page_title,
              page_description: product.page_description,
              page_url: product.page_url,
              status: product.status,
              brand: product.brand,
              type: product.type,
              physical_product: defaultVariant?.physical_product ?? true,
            },
            variation_options: product.variation_options || [],
            variant_products: product.variants.map((variant) => ({
              ...variant,
              option_values: variant.option_values || {},
              // Convert image_urls to match our expected format
              image_urls:
                variant.image_urls?.map((img: ProductImage, index: number) => ({
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

/**
 * Create a new single product with presigned URL support
 */
export const createProduct = async (
  sellerId: string,
  productData: ProductFormData,
  images?: File[]
): Promise<{ success: boolean; message?: string; data?: Product }> => {
  try {
    // Check if this should be a variant product
    if (
      productData.has_variations &&
      productData.variation_options &&
      productData.variants
    ) {
      return await createProductWithVariants(sellerId, {
        common_attributes: {
          title: productData.title,
          description: productData.description,
          short_description: productData.short_description,
          page_title: productData.page_title,
          page_description: productData.page_description,
          page_url: productData.page_url,
          status: productData.status || "draft",
          brand: productData.brand,
          type: productData.type,
          physical_product: productData.physical_product ?? true,
          margin_contribution: productData.margin_contribution,
          tags: productData.tags,
          collections: productData.collections,
        },
        variation_options: productData.variation_options,
        variant_products: productData.variants,
      });
    }

    // Show loading message for the entire process
    showLoading("Creating product...");

    // Upload images using presigned URLs if provided
    let imageUrls: { url: string; originalName: string; key: string }[] = [];
    if (images && images.length > 0) {
      try {
        const uploadedImages = await uploadImagesWithPresignedUrls(
          images,
          "products/temp",
          "seller"
        );

        if (!uploadedImages) {
          closeLoading();
          return { success: false, message: "Failed to upload images" };
        }

        imageUrls = uploadedImages;
      } catch (imageError) {
        closeLoading();
        const errorMessage =
          imageError instanceof Error
            ? imageError.message
            : "Failed to upload images";
        showErrorMessage(errorMessage);
        return { success: false, message: errorMessage };
      }
    }

    // Prepare product data with image URLs
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { images: _, ...productDataWithoutImages } =
      productData as ProductFormData & { images?: File[] };
    const productPayload = {
      ...productDataWithoutImages,
      image_urls: imageUrls.map((img, index) => ({
        url: img.url,
        position: index + 1,
        key: img.key,
        originalName: img.originalName,
      })),
    };

    const response = await axiosInstance.post<ApiResponse<Product>>(
      `${BASE_URL}/create-product/${sellerId}`,
      productPayload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    closeLoading();

    if (response.data.success) {
      showSuccessMessage(
        response.data.message || "Product created successfully"
      );
      return {
        success: true,
        message: response.data.message,
        data: response.data.data,
      };
    } else {
      showErrorMessage(response.data.message || "Failed to create product");
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    
    let errorMessage = "Failed to create product";
    
    if (axiosError.response) {
      // Try to extract error message from various possible locations
      errorMessage = 
        axiosError.response.data?.message ||
        (axiosError.response.data as any)?.error ||
        axiosError.response.statusText ||
        axiosError.message ||
        "Failed to create product";
    } else if (axiosError.message) {
      errorMessage = axiosError.message;
    }
    
    console.error("Create product error:", {
      message: errorMessage,
      error: axiosError,
    });
    
    showErrorMessage(errorMessage);
    return { success: false, message: errorMessage };
  }
};

/**
 * Update an existing product with presigned URL support
 */
export const updateProduct = async (
  productId: string,
  productData: Partial<ProductFormData>,
  images?: File[]
): Promise<{ success: boolean; message?: string; data?: Product }> => {
  try {
    // Check if this should be a variant product update
    if (
      productData.has_variations &&
      productData.variation_options &&
      productData.variants
    ) {
      return await updateProductWithVariants(productId, {
        common_attributes: {
          title: productData.title || "",
          description: productData.description || "",
          short_description: productData.short_description || "",
          page_title: productData.page_title,
          page_description: productData.page_description,
          page_url: productData.page_url,
          status: productData.status || "draft",
          brand: productData.brand || "",
          type: productData.type || "",
          physical_product: productData.physical_product ?? true,
          margin_contribution: productData.margin_contribution,
          tags: productData.tags,
          collections: productData.collections,
        },
        variation_options: productData.variation_options,
        variant_products: productData.variants,
      });
    }

    // Upload images using presigned URLs if provided
    let imageUrls: { url: string; originalName: string; key: string }[] = [];
    if (images && images.length > 0) {
      const uploadedImages = await uploadImagesWithPresignedUrls(
        images,
        "products/temp",
        "seller"
      );

      if (!uploadedImages) {
        return { success: false, message: "Failed to upload images" };
      }

      imageUrls = uploadedImages;
    }

    showLoading("Updating product...");

    // Prepare product data with image URLs (only if new images were uploaded)
    const productPayload =
      imageUrls.length > 0
        ? {
            ...productData,
            image_urls: imageUrls.map((img, index) => ({
              url: img.url,
              position: index + 1,
              key: img.key,
              originalName: img.originalName,
            })),
          }
        : productData;

    const response = await axiosInstance.put<ApiResponse<Product>>(
      `${BASE_URL}/update-product/${productId}`,
      productPayload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    closeLoading();

    if (response.data.success) {
      showSuccessMessage(
        response.data.message || "Product updated successfully"
      );
      return {
        success: true,
        message: response.data.message,
        data: response.data.data,
      };
    } else {
      showErrorMessage(response.data.message || "Failed to update product");
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Failed to update product"
      );
      return {
        success: false,
        message:
          axiosError.response.data?.message || "Failed to update product",
      };
    } else {
      showErrorMessage("Failed to update product. Please try again later.");
      return {
        success: false,
        message: "Failed to update product. Please try again later.",
      };
    }
  }
};

/**
 * Process variant products with presigned URL image uploads
 * Silently skips variants missing required pricing data
 */
export const processVariantProductsWithPresignedUrls = async (
  variantProducts: VariantProduct[]
): Promise<VariantProduct[]> => {
  return variantProducts.filter((variant) => {
    // Skip variants without required pricing data
    if (variant.price === null || variant.price === undefined || variant.compare_price === null || variant.compare_price === undefined) {
      return false;
    }
    return variant.enabled;
  });
};

/**
 * Create a product with variants using presigned URLs
 */
export const createProductWithVariants = async (
  sellerId: string,
  productWithVariantsData: ProductWithVariantsFormData
): Promise<{ success: boolean; message?: string; data?: Product }> => {
  try {
    showLoading("Creating product with variants...");

    // Send the request to create the product with variants
    const response = await axiosInstance.post<ApiResponse<Product>>(
      `/seller/product-variant/create/${sellerId}`,
      productWithVariantsData
    );

    closeLoading();

    if (response.data.success) {
      showSuccessMessage("Product created successfully!");
      return {
        success: true,
        message: "Product created successfully!",
        data: response.data.data,
      };
    } else {
      showErrorMessage(response.data.message || "Failed to create product");
      return {
        success: false,
        message: response.data.message || "Failed to create product",
      };
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Failed to create product"
      );
      return {
        success: false,
        message:
          axiosError.response.data?.message || "Failed to create product",
      };
    } else {
      showErrorMessage("Failed to create product. Please try again later.");
      return {
        success: false,
        message: "Failed to create product. Please try again later.",
      };
    }
  }
};

/**
 * Update a product with variants using presigned URLs
 */
export const updateProductWithVariants = async (
  productId: string,
  productWithVariantsData: ProductWithVariantsFormData
): Promise<{ success: boolean; message?: string; data?: Product }> => {
  try {
    showLoading("Updating product with variants...");

    // Send the request to update the product with variants
    const response = await axiosInstance.put<ApiResponse<Product>>(
      `/seller/product/update-product-with-variants/${productId}`,
      productWithVariantsData
    );

    closeLoading();

    if (response.data.success) {
      showSuccessMessage("Product updated successfully!");
      return {
        success: true,
        message: "Product updated successfully!",
        data: response.data.data,
      };
    } else {
      showErrorMessage(response.data.message || "Failed to update product");
      return {
        success: false,
        message: response.data.message || "Failed to update product",
      };
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Failed to update product"
      );
      return {
        success: false,
        message:
          axiosError.response.data?.message || "Failed to update product",
      };
    } else {
      showErrorMessage("Failed to update product. Please try again later.");
      return {
        success: false,
        message: "Failed to update product. Please try again later.",
      };
    }
  }
};

/**
 * Delete a product
 */
export const deleteProduct = async (productId: string): Promise<boolean> => {
  try {
    showLoading("Deleting product...");

    const response = await axiosInstance.delete<ApiResponse<null>>(
      `${BASE_URL}/delete-product/${productId}`
    );

    closeLoading();

    if (response.data.success) {
      showSuccessMessage(
        response.data.message || "Product deleted successfully"
      );
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to delete product");
      return false;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Failed to delete product"
      );
    } else {
      showErrorMessage("Failed to delete product. Please try again later.");
    }
    return false;
  }
};

/**
 * Get products by collection
 */
export const getProductsByCollection = async (
  collectionId: string
): Promise<Product[]> => {
  try {
    showLoading("Loading collection products...");

    const response = await axiosInstance.get<
      ApiResponse<
        {
          id: string;
          product_id: string;
          collection_id: string;
          Product: Product;
        }[]
      >
    >(`${BASE_URL}/get-productsbycollection/${collectionId}`);

    closeLoading();

    if (response.data.success && response.data.data) {
      return response.data.data.map((item) => item.Product);
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
        axiosError.response.data?.message ||
          "Failed to load collection products"
      );
    } else {
      showErrorMessage(
        "Failed to load collection products. Please try again later."
      );
    }
    return [];
  }
};

/**
 * Update product image positions
 */
export const updateImagePositions = async (
  productId: string,
  positions: { [imageUrl: string]: number }
): Promise<boolean> => {
  try {
    showLoading("Updating image positions...");

    const response = await axiosInstance.post<
      ApiResponse<{ productId: string; image_url: ProductImage[] }>
    >(`${BASE_URL}/update-positions/${productId}`, { positions });

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
        axiosError.response.data?.message || "Failed to update image positions"
      );
    } else {
      showErrorMessage(
        "Failed to update image positions. Please try again later."
      );
    }
    return false;
  }
};
