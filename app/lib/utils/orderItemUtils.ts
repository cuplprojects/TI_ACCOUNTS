import { OrderItem } from "../services/admin";

/**
 * Utility functions to handle order items with both variant and non-variant products
 */

export interface ProcessedOrderItemData {
  id: string;
  title: string;
  sku: string;
  price: string;
  comparePrice?: string;
  images: { url: string; position: number }[];
  optionValues?: { [key: string]: string };
  isVariant: boolean;
  stock_qty?: number;
  weight?: number;
  dimensions?: {
    length?: number;
    breadth?: number;
    height?: number;
  };
}

/**
 * Extract product data from an OrderItem, handling both variant and non-variant products
 * Priority: Use variantData/productData JSON snapshots from OrderItem, fallback to Variant/Product relationships
 */
export const getOrderItemData = (
  orderItem: OrderItem
): ProcessedOrderItemData => {
  const { Product, Variant } = orderItem;
  
  // Get variant data - prefer variantData JSON snapshot if available, fallback to Variant relationship
  const variantData = (orderItem as any).variantData || Variant;
  // Get product data - prefer productData JSON snapshot if available, fallback to Product relationship
  const productData = (orderItem as any).productData || Product;

  // Handle null Product
  if (!productData) {
    return {
      id: variantData?.id || "unknown",
      title: "Product Unavailable",
      sku: variantData?.sku || "N/A",
      price: variantData?.price || "0",
      comparePrice: variantData?.compare_price,
      images: variantData?.image_urls || [],
      optionValues: variantData?.option_values,
      isVariant: !!variantData,
      stock_qty: variantData?.stock_qty,
      weight: variantData?.weight,
      dimensions: {
        length: variantData?.length,
        breadth: variantData?.breadth,
        height: variantData?.height,
      },
    };
  }

  // Determine if this is a variant product
  const isVariant = !!variantData && !!productData?.has_variant;

  if (isVariant && variantData) {
    // Use variantData (primary source for variant products)
    // Priority: productData.default_image_urls → productData.image_urls → variantData.image_urls
    const rawImages = 
      (productData?.default_image_urls && productData.default_image_urls.length > 0) 
        ? productData.default_image_urls
        : (productData?.image_urls && productData.image_urls.length > 0)
        ? productData.image_urls
        : (variantData?.image_urls && variantData.image_urls.length > 0)
        ? variantData.image_urls
        : [];
    
    // Normalize image format
    const images = rawImages.map((img: any, index: number) => {
      if (typeof img === "string") {
        return { url: img, position: index + 1 };
      }
      return img;
    });
    
    return {
      id: variantData.id,
      title: productData.title,
      sku: variantData.sku,
      price: variantData.price,
      comparePrice: variantData.compare_price,
      images: images,
      optionValues: variantData.option_values,
      isVariant: true,
      stock_qty: variantData.stock_qty,
      weight: variantData.weight,
      dimensions: {
        length: variantData.length,
        breadth: variantData.breadth,
        height: variantData.height,
      },
    };
  } else if (variantData) {
    // Use variantData even for non-variant products (variantData contains the images)
    // Priority: productData.default_image_urls → productData.image_urls → variantData.image_urls
    const rawImages = 
      (productData?.default_image_urls && productData.default_image_urls.length > 0) 
        ? productData.default_image_urls
        : (productData?.image_urls && productData.image_urls.length > 0)
        ? productData.image_urls
        : (variantData?.image_urls && variantData.image_urls.length > 0)
        ? variantData.image_urls
        : [];
    
    // Normalize image format
    const images = rawImages.map((img: any, index: number) => {
      if (typeof img === "string") {
        return { url: img, position: index + 1 };
      }
      return img;
    });
    
    return {
      id: variantData.id,
      title: productData.title,
      sku: variantData.sku,
      price: variantData.price,
      comparePrice: variantData.compare_price,
      images: images,
      optionValues: variantData.option_values,
      isVariant: false,
      stock_qty: variantData.stock_qty,
      weight: variantData.weight,
      dimensions: {
        length: variantData.length,
        breadth: variantData.breadth,
        height: variantData.height,
      },
    };
  } else {
    // Use productData (for non-variant products without variantData)
    // Priority: productData.default_image_urls → productData.image_urls
    const productImages =
      (productData?.default_image_urls && productData.default_image_urls.length > 0)
        ? productData.default_image_urls
        : productData?.image_urls || [];

    // Normalize image format
    const normalizedImages = productImages.map((img: any, index: number) => {
      if (typeof img === "string") {
        return { url: img, position: index + 1 };
      }
      return img;
    });

    return {
      id: productData.id,
      title: productData.title,
      sku: "N/A",
      price: productData.price || (orderItem as any).unitPrice,
      comparePrice: undefined,
      images: normalizedImages,
      optionValues: undefined,
      isVariant: false,
      stock_qty: productData.stock_qty,
      weight: productData.weight ? parseFloat(productData.weight as string) : undefined,
    };
  }
};

/**
 * Get the main product image from order item
 * Priority: Use stored JSON snapshots from OrderItem, fallback to relationships
 */
export const getOrderItemImage = (orderItem: OrderItem): string => {
  const variantData = (orderItem as any).variantData || orderItem.Variant;
  const productData = (orderItem as any).productData || orderItem.Product;
  
  // Priority: productData.default_image_urls → productData.image_urls → variantData.image_urls
  if (productData?.default_image_urls && productData.default_image_urls.length > 0) {
    const img = productData.default_image_urls[0];
    return typeof img === "string" ? img : img.url;
  }
  
  if (productData?.image_urls && productData.image_urls.length > 0) {
    const img = productData.image_urls[0];
    return typeof img === "string" ? img : img.url;
  }
  
  if (variantData?.image_urls && variantData.image_urls.length > 0) {
    const img = variantData.image_urls[0];
    return typeof img === "string" ? img : img.url;
  }
  
  // Return empty string instead of placeholder to avoid 400 errors
  return "";
};

/**
 * Get formatted option values text for display
 */
export const getFormattedOptionValues = (orderItem: OrderItem): string => {
  const data = getOrderItemData(orderItem);

  if (!data.isVariant || !data.optionValues) {
    return "";
  }

  return Object.entries(data.optionValues)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
};

/**
 * Check if order item has variants
 */
export const isVariantProduct = (orderItem: OrderItem): boolean => {
  return !!orderItem.Variant && !!orderItem.Product.has_variant;
};

/**
 * Get product display name with variant info
 */
export const getProductDisplayName = (orderItem: OrderItem): string => {
  const data = getOrderItemData(orderItem);
  const optionsText = getFormattedOptionValues(orderItem);

  if (optionsText) {
    return `${data.title} (${optionsText})`;
  }

  return data.title;
};
