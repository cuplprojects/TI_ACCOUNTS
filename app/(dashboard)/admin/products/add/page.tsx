// "use client";

// import React, {
//   useEffect,
//   useState,
//   useRef,
//   Suspense,
//   useCallback,
// } from "react";
// import { usePageTitle } from "@/app/providers/PageTitleProvider";
// import { deleteProductImage, approveProduct } from "@/app/lib/services/admin/productService";
// import { useSearchParams } from "next/navigation";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faArrowLeft,
//   faPlus,
//   faTimes,
//   faSearch,
//   faTrash,
//   faUpload,
// } from "@fortawesome/free-solid-svg-icons";
// import Image from "next/image";
// import ProductMultiImageUpload from "@/components/ui/ProductMultiImageUpload";
// import Link from "next/link";
// import {
//   createTag,
//   getAllTags,
//   getAllSellers,
//   Seller,
//   createProduct,
//   Product,
//   getProduct,
//   updateProduct,
// } from "@/app/lib/services/admin";
// import {
//   createProductWithVariants,
//   updateProductWithVariants,
//   ProductCommonAttributes,
//   ProductImageUpload,
// } from "@/app/lib/services/admin/productService";
// import * as collectionService from "@/app/lib/services/admin/collectionService";
// import { getAllBrands, Brand } from "@/app/lib/services/admin/brandService";
// import { getAllProductTypes } from "@/app/lib/services/admin/productTypeService";
// import { showSuccessMessage, showErrorMessage } from "@/app/lib/swalConfig";
// import { formatUrlHandle, isValidUrlHandle } from "@/app/lib/utils/stringUtils";
// import QuillEditor, { QuillEditorHandle } from "@/app/components/QuillEditor";
// import { AxiosError } from "axios";
// import { VariationManager } from "@/app/components/admin/product-variations";
// import { VariationOption } from "@/app/components/admin/product-variations/VariationOptionInput";
// import { Variant } from "@/app/components/admin/product-variations/VariantMatrix";
// import { useRouter } from "next/navigation";
// import { uploadImagesWithPresignedUrls } from "@/app/lib/services/presignedUrlService";
// import CascadingCategorySelector, { Category } from "@/app/components/admin/CascadingCategorySelector";
// import { handleNumberInputChange, handleNumberKeyDown, formatNumberForDisplay } from "@/app/lib/utils/numberInputUtils";

// // Local interface for API Seller response (matches the actual API response)
// interface ApiSeller {
//   id: string;
//   firm_name: string;
//   email: string;
//   phone: string;
// }

// // Extend Product interface with additional properties needed for the UI
// interface ExtendedProduct
//   extends Omit<Product, "is_tracking_inventory" | "variants"> {
//   has_barcode?: boolean;
//   is_tracking_inventory?: boolean; // Make it optional in the interface since it's always set in state
//   profit: number;
//   margin: number;
//   has_variations?: boolean;
//   variation_options?: VariationOption[];
//   variants?: Variant[]; // Use the UI Variant type here
// }

// // Local Tag type for tag selection/creation (no ProductTag required)
// type LocalTag = {
//   id: string;
//   name: string;
//   description?: string;
// };

// // List of countries
// const COUNTRIES = [
//   "India",
//   "United States",
//   "United Kingdom",
//   "Canada",
//   "Australia",
//   "China",
//   "Japan",
//   "Germany",
//   "France",
//   "Italy",
//   "Spain",
//   "Brazil",
//   "Mexico",
//   "Russia",
//   "South Africa",
//   "South Korea",
//   "Singapore",
//   "Thailand",
//   "Vietnam",
//   "Indonesia",
//   "Malaysia",
//   "UAE",
//   "Saudi Arabia",
//   "Turkey",
//   "Pakistan",
//   "Bangladesh",
//   "Sri Lanka",
//   "Nepal",
//   "Bhutan",
// ];

// function AddProductPageContent() {
//   const { setTitle } = usePageTitle();
//   const searchParams = useSearchParams();

//   // Get URL parameters
//   const productId = searchParams.get("id");
//   const mode = searchParams.get("mode"); // 'view' for read-only mode
//   const isViewMode = mode === "view";
//   const isEditMode = !!productId && !isViewMode;
//   const router = useRouter();

//   const [isPhysicalProduct, setIsPhysicalProduct] = useState(false);
//   const [selectedSellerId, setSelectedSellerId] = useState<string>("");
//   const [currentProductSeller, setCurrentProductSeller] =
//     useState<ApiSeller | null>(null);
//   const [sellers, setSellers] = useState<Seller[]>([]);
//   const [isLoadingSellers, setIsLoadingSellers] = useState(false);
//   const [isLoadingProduct, setIsLoadingProduct] = useState(false);
//   const [product, setProduct] = useState<Product | null>(null);

//   // Add refs for dropdown containers
//   const collectionDropdownRef = useRef<HTMLDivElement>(null);
//   const tagDropdownRef = useRef<HTMLDivElement>(null);
//   const editorRef = useRef<QuillEditorHandle>(null);

//   // HSN Validator state - default disabled for admin
//   const [enableHSNValidator, setEnableHSNValidator] = useState(false);

//   // Product form state - restructured for variant mode
//   const [formData, setFormData] = useState<Partial<ExtendedProduct>>({
//     serial_no: "",
//     title: "",
//     short_description: "",
//     description: "",
//     price: 0,
//     compare_price: 0,
//     physical_product: false,
//     is_tracking_inventory: true,
//     stock_qty: 0,
//     sell_out_of_stock: false,
//     sku: "",
//     weight: 0,
//     length: 0,
//     breadth: 0,
//     height: 0,
//     status: "active",
//     page_url: "",
//     type: "", // Will store type ID
//     brand: "",
//     cost_per_item: 0,
//     profit: 0,
//     margin: 0,
//     has_barcode: false,
//     has_variations: false,
//     variation_options: [],
//     variants: [],
//   });

//   // Common attributes for variant products (when variants are enabled)
//   const [commonAttributes, setCommonAttributes] = useState({
//     title: "",
//     short_description: "",
//     description: "",
//     brand: "",
//     type: "",
//     page_title: "",
//     page_description: "",
//     page_url: "",
//     status: "active" as "active" | "draft" | "inactive",
//     physical_product: false,
//   });

//   // Product Classification state - separate state for GST and HS code to ensure proper initialization
//   const [productClassification, setProductClassification] = useState({
//     gst_percent: 0,
//     hs_code: "",
//     region_of_origin: "India",
//     margin_contribution: 0,
//   });

//   // Collections management - REMOVED (replaced with cascading category selector)
//   // Nested categories management
//   const [isLoadingCollections, setIsLoadingCollections] = useState(false);
//   const [superCategories, setSuperCategories] = useState<Category[]>([]);
//   const [selectedSubCategories, setSelectedSubCategories] = useState<Array<{ id: string; title: string; path: string }>>([]);

//   // Tags management
//   const [tags, setTags] = useState<LocalTag[]>([]);
//   const [isLoadingTags, setIsLoadingTags] = useState(false);
//   const [selectedTags, setSelectedTags] = useState<LocalTag[]>([]);
//   const [showTagDropdown, setShowTagDropdown] = useState(false);
//   const [tagSearchTerm, setTagSearchTerm] = useState("");

//   // Tag creation modal
//   const [showTagModal, setShowTagModal] = useState(false);
//   const [newTagName, setNewTagName] = useState("");
//   const [newTagDescription, setNewTagDescription] = useState("");

//   // Brands management
//   const [brands, setBrands] = useState<Brand[]>([]);
//   const [isLoadingBrands, setIsLoadingBrands] = useState(false);

//   // Product Types management
//   const [productTypes, setProductTypes] = useState<Array<{ 
//     id: string; 
//     name: string; 
//     super_categories?: Array<{ id: string; title: string }>;
//     brands?: Array<{ id: string; name: string; logo_url?: string }>;
//   }>>([]);
//   const [isLoadingProductTypes, setIsLoadingProductTypes] = useState(false);

//   // Images state
//   const [images, setImages] = useState<File[]>([]);
//   const [existingImages, setExistingImages] = useState<
//     { url: string; position: number; key?: string; originalName?: string }[]
//   >([]);

//   // Seller search and dropdown state
//   const [showSellerDropdown, setShowSellerDropdown] = useState(false);
//   const [sellerSearchTerm, setSellerSearchTerm] = useState("");
//   const sellerDropdownRef = useRef<HTMLDivElement>(null);

//   // Brand dropdown state
//   const [showBrandDropdown, setShowBrandDropdown] = useState(false);
//   const [brandSearchTerm, setBrandSearchTerm] = useState("");
//   const brandDropdownRef = useRef<HTMLDivElement>(null);

//   // Type dropdown state
//   const [showTypeDropdown, setShowTypeDropdown] = useState(false);
//   const [typeSearchTerm, setTypeSearchTerm] = useState("");
//   const typeDropdownRef = useRef<HTMLDivElement>(null);

//   // Track if we've already auto-selected brand during load
//   const hasAutoSelectedBrandRef = useRef(false);

//   // Track if type was manually changed by user (not during initial load)
//   const isTypeManuallyChangedRef = useRef(false);

//   // Load existing product data for editing/viewing
//   const loadProductData = useCallback(
//     async (id: string) => {
//       setIsLoadingProduct(true);
//       try {
//         const loadedProduct = await getProduct(id);
//         if (loadedProduct) {
//           setProduct(loadedProduct);
//           // Only treat as variant product if it has non-null variation_options
//           // Check if variants exist and have variation_options (even if empty in some cases)
//           const isVariantProduct =
//             loadedProduct.has_variant &&
//             loadedProduct.variants &&
//             loadedProduct.variants.variation_options !== null &&
//             Array.isArray(loadedProduct.variants.variation_options);

//           if (isVariantProduct) {
//             // Handle true variant products (with variation options)
//             const variants = loadedProduct.variants!;
//             const commonAttrs = variants.common_attributes!;

//             // Set common attributes from the variants.common_attributes
//             // For type, store the name as-is, we'll convert to ID in a separate effect
//             setCommonAttributes({
//               title: commonAttrs.title || "",
//               short_description: commonAttrs.short_description || "",
//               description: commonAttrs.description || "",
//               brand: commonAttrs.brand || "",
//               type: commonAttrs.type || "", // Store as name, will convert to ID later
//               page_title: commonAttrs.page_title || "",
//               page_description: commonAttrs.page_description || "",
//               page_url: commonAttrs.page_url || "",
//               status:
//                 (commonAttrs.status as "active" | "draft" | "inactive") ||
//                 "active",
//               physical_product: commonAttrs.physical_product ?? false,
//             });

//             // Set the physical product state from common attributes
//             setIsPhysicalProduct(commonAttrs.physical_product ?? false);

//             // Convert API variant data to UI format
//             const uiVariants: Variant[] = variants.variant_products!.map(
//               (vp) => ({
//                 id: vp.id || `variant_${Date.now()}_${Math.random()}`,
//                 option_values: vp.option_values,
//                 price: vp.seller_price || vp.price,  // Use seller_price if available, fallback to price
//                 compare_price: vp.compare_price,
//                 sku: vp.sku,
//                 barcode: vp.barcode || "",
//                 inventory_quantity: vp.stock_qty,
//                 stock_qty: vp.stock_qty,
//                 enabled: true,
//                 weight: vp.weight,
//                 length: vp.length,
//                 breadth: vp.breadth,
//                 height: vp.height,
//                 is_tracking_inventory: vp.is_tracking_inventory,
//                 sell_out_of_stock: vp.sell_out_of_stock,
//                 cost_per_item: vp.cost_per_item,
//                 // NOTE: gst_percent, region_of_origin, hs_code are product-level only
//                 images: [],
//                 image_urls: vp.image_urls || [],
//               })
//             );

//             // Update form data with variation information
//             setFormData((prev) => {
//               const updated = {
//                 ...prev,
//                 has_variations: true,
//                 variation_options: variants.variation_options,
//                 variants: uiVariants,
//                 serial_no: commonAttrs.serial_no || "",
//                 title: commonAttrs.title || "",
//                 short_description: commonAttrs.short_description || "",
//                 description: commonAttrs.description || "",
//                 page_title: commonAttrs.page_title || "",
//                 page_description: commonAttrs.page_description || "",
//                 page_url: commonAttrs.page_url || "",
//                 type: commonAttrs.type || "",
//                 brand: commonAttrs.brand || "",
//                 status: (commonAttrs.status as "draft" | "approvalpending") || "draft",
//                 physical_product: commonAttrs.physical_product,
//               };
//               return updated;
//             });

//             // Set product classification separately for proper state management
//             setProductClassification({
//               gst_percent: loadedProduct.gst_percent !== undefined && loadedProduct.gst_percent !== null ? loadedProduct.gst_percent : 0,
//               hs_code: loadedProduct.hs_code || "",
//               region_of_origin: loadedProduct.region_of_origin || "India",
//               margin_contribution: loadedProduct.margin_contribution !== undefined && loadedProduct.margin_contribution !== null ? loadedProduct.margin_contribution : 0,
//             });

//             console.log("Loaded product classification - gst_percent:", loadedProduct.gst_percent, "hs_code:", loadedProduct.hs_code);

//             // Handle common/default images for variant products
//             if (
//               (isEditMode || isViewMode) &&
//               loadedProduct.default_image_urls &&
//               Array.isArray(loadedProduct.default_image_urls) &&
//               loadedProduct.default_image_urls.length > 0
//             ) {
//               // Convert to the expected format with position
//               const formattedImages = loadedProduct.default_image_urls.map(
//                 (img: any, index: number) => {
//                   const url =
//                     img.url ||
//                     (img.key
//                       ? `https://totallyassets.s3.ap-south-1.amazonaws.com/${img.key}`
//                       : "");
//                   return {
//                     url: url,
//                     position: img.position || index,
//                     key: img.key,
//                     originalName: img.originalName,
//                   };
//                 }
//               );

//               setExistingImages(formattedImages);
//             }

//             // Set seller ID from the product data
//             if (loadedProduct.seller_id) {
//               setSelectedSellerId(loadedProduct.seller_id);
//               if (loadedProduct.Seller) {
//                 setCurrentProductSeller(loadedProduct.Seller);
//               }
//             }
//           } else {
//             // Handle regular (non-variant) products
//             // Check if we have variants data but no variation options
//             // This means it's a product that should be treated as a regular product
//             // but has data in the variants object

//             let productImageUrls = loadedProduct.image_urls || [];
//             let productData = { ...loadedProduct };

//             // If variation_options is null but we have variants data,
//             // extract information from the variants.variant_products[0]
//             if (
//               loadedProduct.has_variant &&
//               loadedProduct.variants &&
//               (!loadedProduct.variants.variation_options ||
//                 (Array.isArray(loadedProduct.variants.variation_options) &&
//                   loadedProduct.variants.variation_options.length === 0))
//             ) {
//               // Extract data from the first variant product
//               if (
//                 loadedProduct.variants.variant_products &&
//                 Array.isArray(loadedProduct.variants.variant_products) &&
//                 loadedProduct.variants.variant_products.length > 0
//               ) {
//                 const firstVariant = loadedProduct.variants
//                   .variant_products[0] as any;

//                 // Prefer variant data for these fields
//                 productData = {
//                   ...productData,
//                   price: firstVariant.seller_price || firstVariant.price,  // Use seller_price if available
//                   compare_price: firstVariant.compare_price,
//                   cost_per_item: firstVariant.cost_per_item,
//                   physical_product: firstVariant.physical_product || false,
//                   is_tracking_inventory: firstVariant.is_tracking_inventory,
//                   stock_qty: firstVariant.stock_qty,
//                   sell_out_of_stock: firstVariant.sell_out_of_stock,
//                   sku: firstVariant.sku,
//                   barcode: firstVariant.barcode,
//                   weight: firstVariant.weight,
//                   length: firstVariant.length,
//                   breadth: firstVariant.breadth,
//                   height: firstVariant.height,
//                   // Product-level fields from variant (if available)
//                   gst_percent: firstVariant.gst_percent !== undefined ? firstVariant.gst_percent : productData.gst_percent,
//                   hs_code: firstVariant.hs_code || productData.hs_code,
//                   region_of_origin: firstVariant.region_of_origin || productData.region_of_origin,
//                 };

//                 // Use variant's image_urls if available
//                 if (
//                   firstVariant.image_urls &&
//                   Array.isArray(firstVariant.image_urls) &&
//                   firstVariant.image_urls.length > 0
//                 ) {
//                   productImageUrls = firstVariant.image_urls;
//                 }
//               }

//               // Also use common_attributes data if available
//               if (loadedProduct.variants.common_attributes) {
//                 const commonAttrs = loadedProduct.variants.common_attributes;

//                 // Prefer common attributes for text fields
//                 productData = {
//                   ...productData,
//                   title: commonAttrs.title || productData.title,
//                   description:
//                     commonAttrs.description || productData.description,
//                   short_description:
//                     commonAttrs.short_description ||
//                     productData.short_description,
//                   page_title: commonAttrs.page_title || productData.page_title,
//                   page_description:
//                     commonAttrs.page_description ||
//                     productData.page_description,
//                   page_url: commonAttrs.page_url || productData.page_url,
//                   brand: commonAttrs.brand || productData.brand,
//                   type: commonAttrs.type || productData.type,
//                   status: commonAttrs.status || productData.status,
//                   physical_product:
//                     commonAttrs.physical_product !== undefined
//                       ? commonAttrs.physical_product
//                       : productData.physical_product,
//                 };
//               }
//             }

//             // Set existing images
//             if ((isEditMode || isViewMode) && productImageUrls.length > 0) {
//               // Convert to the expected format with position
//               const formattedImages = productImageUrls.map(
//                 (img: any, index: number) => {
//                   const url =
//                     img.url ||
//                     (img.key
//                       ? `https://totallyassets.s3.ap-south-1.amazonaws.com/${img.key}`
//                       : "");
//                   return {
//                     url: url,
//                     position: img.position || index,
//                     key: img.key,
//                     originalName: img.originalName,
//                   };
//                 }
//               );

//               setExistingImages(formattedImages);
//             }

//             // Map the product data to form state for normal products
//             setFormData((prev) => {
//               console.log("Loading non-variant product - gst_percent:", productData.gst_percent, "hs_code:", productData.hs_code);
//               return {
//                 ...prev,
//                 serial_no: productData.serial_no || "",
//                 title: productData.title || "",
//                 short_description: productData.short_description || "",
//                 description: productData.description || "",
//                 price: productData.seller_price || productData.price || 0,
//                 compare_price: productData.compare_price || 0,
//                 cost_per_item: productData.cost_per_item || 0,
//                 physical_product: productData.physical_product,
//                 is_tracking_inventory: productData.is_tracking_inventory,
//                 stock_qty: productData.stock_qty || 0,
//                 sell_out_of_stock: productData.sell_out_of_stock || false,
//                 sku: productData.sku || "",
//                 barcode: productData.barcode || "",
//                 weight: productData.weight || 0,
//                 length: productData.length || 0,
//                 breadth: productData.breadth || 0,
//                 height: productData.height || 0,
//                 page_title: productData.page_title || "",
//                 page_description: productData.page_description || "",
//                 page_url: productData.page_url || "",
//                 type: productData.type || "",
//                 brand: productData.brand || "",
//                 status:
//                   (productData.status as "active" | "draft" | "inactive") ||
//                   "active",
//                 has_barcode: !!productData.barcode,
//                 has_variations: false,
//                 profit: 0,
//                 margin: 0,
//               };
//             });

//             // Set product classification separately for non-variant products
//             setProductClassification({
//               gst_percent: productData.gst_percent !== undefined && productData.gst_percent !== null ? productData.gst_percent : 0,
//               hs_code: productData.hs_code || "",
//               region_of_origin: productData.region_of_origin || "India",
//               margin_contribution: productData.margin_contribution !== undefined && productData.margin_contribution !== null ? productData.margin_contribution : 0,
//             });

//             // Set the physical product state
//             setIsPhysicalProduct(productData.physical_product ?? false);

//             // Set seller ID from the product data
//             if (productData.seller_id) {
//               setSelectedSellerId(productData.seller_id);
//             }
//             // Set current product seller if available
//             if (productData.Seller) {
//               setCurrentProductSeller(productData.Seller);
//             }
//           }

//           // Set selected tags if they exist
//           if (loadedProduct.Tags && Array.isArray(loadedProduct.Tags)) {
//             setSelectedTags(
//               loadedProduct.Tags.map((tag) => ({
//                 id: tag.id,
//                 name: tag.name,
//               }))
//             );
//           }

//           // Set selected categories/collections if they exist
//           if (loadedProduct.Collections && Array.isArray(loadedProduct.Collections) && loadedProduct.Collections.length > 0) {
//             // Build full paths for each collection by searching through the super categories
//             const collections = loadedProduct.Collections;
//             const buildCategoryPaths = async () => {
//               const categoriesWithPaths = await Promise.all(
//                 collections.map(async (collection: any) => {
//                   // Search through super categories to find the full path
//                   for (const superCat of superCategories) {
//                     if (superCat.Categories) {
//                       for (const category of superCat.Categories) {
//                         // Check if this collection is a sub-category of this category
//                         if (category.SubCategories) {
//                           const foundSubCat = category.SubCategories.find(
//                             (sc: any) => sc.id === collection.id
//                           );
//                           if (foundSubCat) {
//                             return {
//                               id: collection.id,
//                               title: foundSubCat.title || collection.title,
//                               path: `${superCat.title} > ${category.title} > ${foundSubCat.title}`,
//                             };
//                           }
//                         }
//                       }
//                     }
//                   }
//                   // Fallback if not found in hierarchy
//                   return {
//                     id: collection.id,
//                     title: collection.title,
//                     path: collection.title,
//                   };
//                 })
//               );
              
//               const validCategories = categoriesWithPaths.filter((cat) => cat !== null);
//               if (validCategories.length > 0) {
//                 setSelectedSubCategories(validCategories);
//               }
//             };
            
//             buildCategoryPaths();
//           }
//         }
//       } catch (error) {
//         console.error("Failed to load product:", error);
//         showErrorMessage("Failed to load product details");
//       } finally {
//         setIsLoadingProduct(false);
//       }
//     },
//     [isEditMode]
//   );

//   useEffect(() => {
//     // Set title based on mode
//     if (isViewMode) {
//       setTitle("View Product");
//     } else if (isEditMode) {
//       setTitle("Edit Product");
//     } else {
//       setTitle("Add Product");
//     }

//     // Load tags, sellers, and categories on mount
//     loadTags();
//     loadSellers();
//     loadSuperCategories();
//     loadBrands();
//     loadProductTypes();

//     // Load product data if editing or viewing - but wait for product types to load first
//     if (productId) {
//       // Load product data immediately - product types should load quickly
//       loadProductData(productId);
//     }
//   }, [setTitle, productId, isViewMode, isEditMode, loadProductData]);

//   // Calculate profit and margin whenever price or cost_per_item changes
//   useEffect(() => {
//     if (formData.price && formData.cost_per_item) {
//       const price = formData.price || 0;
//       const costPerItem = formData.cost_per_item || 0;

//       if (price > 0 && costPerItem > 0) {
//         const profit = price - costPerItem;
//         const margin = (profit / price) * 100;
//         setFormData((prev) => ({
//           ...prev,
//           profit: parseFloat(profit.toFixed(2)),
//           margin: parseFloat(margin.toFixed(2)),
//         }));
//       }
//     }
//   }, [formData.price, formData.cost_per_item]);

//   // Auto-fill margin_contribution when seller is selected
//   useEffect(() => {
//     if (selectedSellerId && sellers.length > 0) {
//       const selectedSeller = sellers.find((s) => s.id === selectedSellerId);
//       if (selectedSeller && selectedSeller.margin !== undefined && selectedSeller.margin !== null) {
//         // Only auto-fill if not in edit mode (to avoid overwriting existing values)
//         if (!isEditMode) {
//           setFormData((prev) => ({
//             ...prev,
//             margin_contribution: formData.margin_contribution || selectedSeller.margin || 0,
//           }));
//         }
//       }
//     }
//   }, [selectedSellerId, sellers, isEditMode]);

//   // Click outside handler for brand dropdown
//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (
//         brandDropdownRef.current &&
//         !brandDropdownRef.current.contains(event.target as Node) &&
//         showBrandDropdown
//       ) {
//         setShowBrandDropdown(false);
//       }
//     }

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showBrandDropdown]);

//   // Click outside handler for type dropdown
//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (
//         typeDropdownRef.current &&
//         !typeDropdownRef.current.contains(event.target as Node) &&
//         showTypeDropdown
//       ) {
//         setShowTypeDropdown(false);
//       }
//     }

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showTypeDropdown]);

//   // Load all existing collections - REMOVED (replaced with cascading category selector)

//   // Load super categories with nested structure
//   const loadSuperCategories = async () => {
//     setIsLoadingCollections(true);
//     try {
//       const response = await collectionService.getSuperCategories();
//       if (response && Array.isArray(response)) {
//         // Map to ensure id is always a string
//         const categories = response.map((cat: any) => ({
//           ...cat,
//           id: cat.id || "",
//         }));
//         setSuperCategories(categories);
//       } else {
//         setSuperCategories([]);
//       }
//     } catch (error) {
//       console.error("Failed to load super categories:", error);
//       setSuperCategories([]);
//     } finally {
//       setIsLoadingCollections(false);
//     }
//   };

//   // Load all existing tags
//   const loadTags = async () => {
//     setIsLoadingTags(true);
//     try {
//       const tagsData = await getAllTags();
//       // Map to LocalTag[]
//       setTags(
//         tagsData.map((tag: unknown) => {
//           const t = tag as {
//             id?: string | number;
//             name: string;
//             description?: string;
//           };
//           return {
//             id: t.id?.toString() || "",
//             name: t.name,
//             description: t.description,
//           };
//         })
//       );
//     } catch (error) {
//       console.error("Failed to load tags:", error);
//     } finally {
//       setIsLoadingTags(false);
//     }
//   };

//   // Load sellers
//   const loadSellers = async () => {
//     setIsLoadingSellers(true);
//     try {
//       const response = await getAllSellers();

//       // Handle the SellersResponse structure - check if it has sellers directly
//       const sellersResponse = response;
//       if (
//         sellersResponse &&
//         sellersResponse.sellers &&
//         Array.isArray(sellersResponse.sellers)
//       ) {
//         setSellers(sellersResponse.sellers);
//       } else {
//         setSellers([]);
//       }
//     } catch (error) {
//       console.error("Failed to load sellers:", error);
//       setSellers([]);
//     } finally {
//       setIsLoadingSellers(false);
//     }
//   };

//   // Load all brands
//   const loadBrands = async () => {
//     setIsLoadingBrands(true);
//     try {
//       const brandsData = await getAllBrands(1, 1000);
//       if (brandsData && brandsData.brands) {
//         setBrands(brandsData.brands);
//       }
//     } catch (error) {
//       console.error("Failed to load brands:", error);
//     } finally {
//       setIsLoadingBrands(false);
//     }
//   };

//   // Load all product types
//   const loadProductTypes = async () => {
//     setIsLoadingProductTypes(true);
//     try {
//       const response = await getAllProductTypes(1, 1000);
//       if (response && response.productTypes) {
//         const validProductTypes = response.productTypes
//           .filter((pt) => pt.id)
//           .map((pt) => ({
//             id: pt.id!,
//             name: pt.name,
//             super_categories: pt.super_categories || [],
//             brands: pt.brands || [],
//           }));
//         console.log("Loaded Product Types with Brands:", validProductTypes);
//         setProductTypes(validProductTypes);
//       }
//     } catch (error) {
//       console.error("Failed to load product types:", error);
//     } finally {
//       setIsLoadingProductTypes(false);
//     }
//   };

//   // Get brands for selected product type
//   const getBrandsForProductType = (productTypeName: string | undefined) => {
//     if (!productTypeName) return [];
    
//     return brands.filter((brand) => {
//       if (!brand.ProductTypes || brand.ProductTypes.length === 0) return false;
//       return brand.ProductTypes.some((pt: any) => pt.name === productTypeName);
//     });
//   };

//   // Get super categories for selected product type
//   const getSuperCategoriesForProductType = (productTypeNameOrId: string | undefined) => {
//     if (!productTypeNameOrId) return [];
    
//     // Try to find by ID first, then by name
//     let productType = productTypes.find((pt) => pt.id === productTypeNameOrId);
//     if (!productType) {
//       productType = productTypes.find((pt) => pt.name === productTypeNameOrId);
//     }
    
//     return productType?.super_categories || [];
//   };

//   // Get brands for selected product type by ID
//   const getBrandsForProductTypeId = (productTypeNameOrId: string | undefined) => {
//     if (!productTypeNameOrId) return [];
    
//     // Try to find by ID first, then by name
//     let productType = productTypes.find((pt) => pt.id === productTypeNameOrId);
//     if (!productType) {
//       productType = productTypes.find((pt) => pt.name === productTypeNameOrId);
//     }
    
//     const brands = productType?.brands || [];
//     return brands;
//   };

//   // Get product type name from ID
//   const getProductTypeNameFromId = (productTypeId: string | undefined) => {
//     if (!productTypeId) return "";
    
//     const productType = productTypes.find((pt) => pt.id === productTypeId);
//     return productType?.name || "";
//   };

//   // Get product type ID from name (for loading existing products)
//   const getProductTypeIdFromName = (productTypeName: string | undefined) => {
//     if (!productTypeName) return "";
    
//     const productType = productTypes.find((pt) => pt.name === productTypeName);
//     return productType?.id || "";
//   };

//   // Add a new tag
//   const handleAddNewTag = async (e?: React.FormEvent) => {
//     if (e) e.preventDefault();
//     if (!newTagName.trim()) return;

//     try {
//       const success = await createTag({
//         name: newTagName.trim(),
//         description: newTagDescription.trim(),
//       });

//       if (success) {
//         // Add the new tag to selected tags
//         const newTag: LocalTag = {
//           id: Date.now().toString(),
//           name: newTagName.trim(),
//           description: newTagDescription.trim(),
//         };
//         setSelectedTags([...selectedTags, newTag]);

//         // Also add to all tags
//         setTags([...tags, newTag]);

//         // Clear inputs
//         setNewTagName("");
//         setNewTagDescription("");

//         // Close modal
//         setShowTagModal(false);

//         // Refresh tags list
//         loadTags();

//         await showSuccessMessage("Tag created successfully");
//       }
//     } catch (error) {
//       console.error("Failed to create tag:", error);
//       await showErrorMessage("Failed to create tag");
//     }
//   };

//   // Select a tag
//   const handleSelectTag = (tag: LocalTag) => {
//     // Check if tag is already selected
//     if (!selectedTags.some((t) => t.id === tag.id)) {
//       setSelectedTags([...selectedTags, tag]);
//     }
//     setTagSearchTerm("");
//     setShowTagDropdown(false);
//   };

//   // Remove a selected tag
//   const handleRemoveTag = (tagId: string) => {
//     setSelectedTags(selectedTags.filter((tag) => tag.id !== tagId));
//   };

//   // Filter tags based on search term
//   const filteredTags = tags.filter(
//     (tag) =>
//       tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase()) &&
//       !selectedTags.some((selectedTag) => selectedTag.id === tag.id)
//   );

//   // Handle input change with special handling for URL and variant mode
//   const handleInputChange = (
//     e: React.ChangeEvent<
//     HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
//     >
//   ) => {
//     const { name, value, type } = e.target;
//     console.log({ name, value, type })

//     // Handle product classification fields (GST, HS code, region of origin, margin contribution)
//     if (["gst_percent", "hs_code", "region_of_origin", "margin_contribution"].includes(name)) {
//       if (name === "gst_percent") {
//         if (value === "") {
//           setProductClassification((prev) => ({ ...prev, [name]: 0 }));
//         } else {
//           const numValue = parseInt(value, 10);
//           if (!isNaN(numValue)) {
//             setProductClassification((prev) => ({ ...prev, [name]: numValue }));
//           }
//         }
//       } else if (name === "hs_code") {
//         // Allow only numeric characters, up to 8 digits
//         const sanitized = value.replace(/[^0-9]/g, "").slice(0, 8);
//         setProductClassification((prev) => ({ ...prev, [name]: sanitized }));
//       } else if (name === "margin_contribution") {
//         if (value === "") {
//           setProductClassification((prev) => ({ ...prev, [name]: 0 }));
//         } else {
//           const numValue = parseFloat(value);
//           if (!isNaN(numValue)) {
//             setProductClassification((prev) => ({ ...prev, [name]: numValue }));
//           }
//         }
//       } else {
//         // region_of_origin
//         setProductClassification((prev) => ({ ...prev, [name]: value }));
//       }
//       return;
//     }

//     // Handle common attributes when in variant mode
//     if (
//       formData.has_variations &&
//       [
//         "title",
//         "short_description",
//         "description",
//         "brand",
//         "type",
//         "page_title",
//         "page_description",
//         "page_url",
//         "status",
//       ].includes(name)
//     ) {
//       if (name === "page_url") {
//         const formattedUrl = formatUrlHandle(value);
//         setCommonAttributes((prev) => ({ ...prev, [name]: formattedUrl }));
//       } else {
//         setCommonAttributes((prev) => ({
//           ...prev,
//           [name]:
//             name === "status"
//               ? (value as "active" | "draft" | "inactive")
//               : value,
//         }));
//       }
      
//       // Trigger filtering when type changes in variant mode
//       if (name === "type") {
//         // This will cause re-render and filter brands/categories in the UI
//       }
      
//       return;
//     }

//     // Handle product-level fields in variant mode (HS code, region of origin)
//     if (
//       formData.has_variations &&
//       ["hs_code", "region_of_origin"].includes(name)
//     ) {
//       if (name === "hs_code") {
//         console.log(formData.has_variations)
//         // Allow only numeric characters, up to 8 digits
//         const sanitized = value.replace(/[^0-9]/g, "").slice(0, 8);
//         setFormData((prev) => {
//           return { ...prev, [name]: sanitized };
//         });
//       } else if (name === "region_of_origin") {
//         setFormData((prev) => ({ ...prev, [name]: value }));
//       }
//       return;
//     }
// console.log(formData)
//     // Handle physical product toggle
//     if (name === "physical_product") {
//       const isPhysical =
//         type === "checkbox"
//           ? (e.target as HTMLInputElement).checked
//           : value === "true";
//       setIsPhysicalProduct(isPhysical);

//       if (formData.has_variations) {
//         setCommonAttributes((prev) => ({
//           ...prev,
//           physical_product: isPhysical,
//         }));
//       } else {
//         setFormData((prev) => ({ ...prev, physical_product: isPhysical }));
//       }
//       return;
//     }

//     // Handle serial_no and other fields that should update formData even in variant mode
//     if (name === "serial_no") {
//       setFormData({ ...formData, [name]: value });
//       return;
//     }

//     // Regular form handling for non-variant mode OR variant mode non-common fields
//     if (!formData.has_variations) {
//       if (name === "page_url") {
//         const formattedUrl = formatUrlHandle(value);
//         setFormData({ ...formData, [name]: formattedUrl });
//       } else if (type === "checkbox") {
//         const checkbox = e.target as HTMLInputElement;
//         setFormData({ ...formData, [name]: checkbox.checked });
//       } else if (name === "sku") {
//         const skuPattern = /^[a-zA-Z0-9\-_]*$/;
//         if (value === "" || skuPattern.test(value)) {
//           setFormData({ ...formData, [name]: value });
//         }
//       } else if (name === "barcode") {
//         const barcodePattern = /^[0-9]*$/;
//         if (value === "" || barcodePattern.test(value)) {
//           setFormData({ ...formData, [name]: value });
//         }
//       } else if (name === "hs_code") {
//         // Allow only numeric characters, up to 8 digits
//         const sanitized = value.replace(/[^0-9]/g, "").slice(0, 8);
//         setFormData({ ...formData, [name]: sanitized });
//       } else if (type === "number") {
//         // Handle number inputs - allow empty, prevent negatives, only digits and decimal
//         if (value === "") {
//           const updatedFormData = { ...formData, [name]: "" };
//           setFormData(updatedFormData);
//         } else {
//           // Sanitize input - only allow digits and decimal point
//           let sanitized = value.replace(/[^\d.]/g, "");
          
//           // Prevent multiple decimal points
//           const parts = sanitized.split(".");
//           let cleanValue = sanitized;
//           if (parts.length > 2) {
//             cleanValue = parts[0] + "." + parts.slice(1).join("");
//           }

//           // Add leading zero if starts with decimal point (e.g., ".2" -> "0.2")
//           if (cleanValue.startsWith(".")) {
//             cleanValue = "0" + cleanValue;
//           }

//           if (cleanValue === "") {
//             const updatedFormData = { ...formData, [name]: "" };
//             setFormData(updatedFormData);
//           } else {
//             const numValue = parseFloat(cleanValue);
            
//             // Only update if it's a valid number and not negative
//             if (!isNaN(numValue) && numValue >= 0) {
//               const updatedFormData = { ...formData, [name]: numValue };

//               // Calculate profit and margin when price or cost_per_item changes
//               if (name === "price" || name === "cost_per_item") {
//                 const price = name === "price" ? numValue : formData.price || 0;
//                 const costPerItem =
//                   name === "cost_per_item" ? numValue : formData.cost_per_item || 0;

//                 if (price > 0 && costPerItem > 0) {
//                   const profit = price - costPerItem;
//                   const margin = (profit / price) * 100;
//                   updatedFormData.profit = parseFloat(profit.toFixed(2));
//                   updatedFormData.margin = parseFloat(margin.toFixed(2));
//                 } else {
//                   updatedFormData.profit = 0;
//                   updatedFormData.margin = 0;
//                 }
//               }

//               setFormData(updatedFormData);
//             }
//           }
//         }
//       } else if (name === "type") {
//         // Just update the type, don't auto-select
//         setFormData({ ...formData, [name]: value });
//       } else {
//         setFormData({ ...formData, [name]: value });
//       }
//     }
//   };

//   const handleEditorChange = (content: string) => {
//     if (formData.has_variations) {
//       setCommonAttributes((prev) => ({ ...prev, description: content }));
//     } else {
//       setFormData({ ...formData, description: content });
//     }
//   };

//   // Convert form data to common attributes for variant products
//   const getCommonAttributes = (editorContent?: string): ProductCommonAttributes => {
//     // Create a basic structure for the common attributes
//     const baseCommonAttributes = formData.has_variations
//       ? {
//           title: commonAttributes.title || "",
//           description: editorContent || commonAttributes.description || "",
//           short_description: commonAttributes.short_description || "",
//           serial_no: formData.serial_no || "", // Include serial_no from formData
//           page_title: commonAttributes.page_title || "",
//           page_description: commonAttributes.page_description || "",
//           page_url: commonAttributes.page_url || "",
//           status: commonAttributes.status || "active",
//           brand: commonAttributes.brand || "",
//           type: commonAttributes.type || "", // Store as name directly
//           physical_product: commonAttributes.physical_product,
//           // Add required fields from productClassification
//           region_of_origin: productClassification.region_of_origin || "India",
//           hs_code: productClassification.hs_code || "",
//           gst_percent: Number(productClassification.gst_percent ?? 0),
//           margin_contribution: productClassification.margin_contribution || 0,
//         }
//       : {
//           title: formData.title || "",
//           description: editorContent || formData.description || "",
//           short_description: formData.short_description || "",
//           serial_no: formData.serial_no || "", // Include serial_no from formData
//           page_title: formData.page_title || "",
//           page_description: formData.page_description || "",
//           page_url: formData.page_url || "",
//           status: formData.status || "active",
//           brand: formData.brand || "",
//           type: formData.type || "", // Store as name directly
//           physical_product: isPhysicalProduct,
//           // Add required fields from productClassification
//           region_of_origin: productClassification.region_of_origin || "India",
//           hs_code: productClassification.hs_code || "",
//           gst_percent: Number(productClassification.gst_percent ?? 0),
//           margin_contribution: productClassification.margin_contribution || 0,
//         };

//     // Don't add default_image_urls to the initial object, let the API handle it
//     // The API will set empty array when it's not provided

//     return baseCommonAttributes;
//   };

//   // Handle variations change with proper common attribute propagation
//   const handleVariationsChange = useCallback(
//     (
//       hasVariations: boolean,
//       options: VariationOption[],
//       variants: Variant[]
//     ) => {
//       // Don't process variations change during product loading to prevent data loss
//       if (isLoadingProduct) {
//         return;
//       }
//       setFormData((currentFormData) => {
//         if (hasVariations && !currentFormData.has_variations) {
//           // Switching to variant mode - move current form data to common attributes
//           setCommonAttributes({
//             title: currentFormData.title || "",
//             short_description: currentFormData.short_description || "",
//             description: currentFormData.description || "",
//             brand: currentFormData.brand || "",
//             type: currentFormData.type || "",
//             page_title: currentFormData.page_title || "",
//             page_description: currentFormData.page_description || "",
//             page_url: currentFormData.page_url || "",
//             status:
//               (currentFormData.status as "active" | "draft" | "inactive") ||
//               "active",
//             physical_product: isPhysicalProduct,
//           });

//           // Propagate common attributes AND current form data to each variant
//           const updatedVariants = variants.map((variant) => ({
//             ...variant,
//             // Copy all common product fields to variant
//             title: currentFormData.title || "",
//             description: currentFormData.description || "",
//             short_description: currentFormData.short_description || "",
//             page_title: currentFormData.page_title || "",
//             page_description: currentFormData.page_description || "",
//             page_url: currentFormData.page_url || "",
//             type: currentFormData.type || "",
//             brand: currentFormData.brand || "",
//             status:
//               (currentFormData.status as "active" | "draft" | "inactive") ||
//               "active",
//             physical_product: isPhysicalProduct,
//             margin_contribution: currentFormData.margin_contribution || 0,
//             region_of_origin: currentFormData.region_of_origin || "India",
//             hs_code: currentFormData.hs_code || "",
//             gst_percent: currentFormData.gst_percent !== undefined ? currentFormData.gst_percent : 0,
//             is_tracking_inventory:
//               currentFormData.is_tracking_inventory !== false,
//             sell_out_of_stock: currentFormData.sell_out_of_stock || false,
//             weight: currentFormData.weight || 0,
//             length: currentFormData.length || 0,
//             breadth: currentFormData.breadth || 0,
//             height: currentFormData.height || 0,
//             cost_per_item: currentFormData.cost_per_item || 0,
//             // Keep variant-specific values if they exist, otherwise use defaults
//             price: variant.price || currentFormData.price || 0,
//             compare_price:
//               variant.compare_price || currentFormData.compare_price || 0,
//             sku: variant.sku || currentFormData.sku || "",
//             barcode: variant.barcode || currentFormData.barcode || "",
//             stock_qty: variant.stock_qty || currentFormData.stock_qty || 0,
//             // serial_no is now at the product level, not the variant level
//           }));

//           // Clear images when switching to variant mode (variants handle their own images)
//           setImages([]);

//           return {
//             has_variations: true,
//             variation_options: options,
//             variants: updatedVariants,
//             // Preserve margin_contribution when switching to variant mode
//             margin_contribution:
//               currentFormData.margin_contribution !== undefined &&
//               currentFormData.margin_contribution !== null
//                 ? currentFormData.margin_contribution
//                 : 0,
//             // Also preserve serial_no as it's needed at the product level
//             serial_no: currentFormData.serial_no || "",
//             // PRESERVE PRODUCT-LEVEL FIELDS - ALWAYS
//             gst_percent: currentFormData.gst_percent !== undefined ? currentFormData.gst_percent : 0,
//             hs_code: currentFormData.hs_code || "",
//             region_of_origin: currentFormData.region_of_origin || "India",
//           };
//         } else if (!hasVariations && currentFormData.has_variations) {
//           // Switching back to normal mode - restore from common attributes
//           const restoredFormData = {
//             has_variations: false,
//             variation_options: [],
//             variants: [],
//             // Restore common attributes if they exist
//             title: commonAttributes.title || "",
//             short_description: commonAttributes.short_description || "",
//             description: commonAttributes.description || "",
//             brand: commonAttributes.brand || "",
//             type: commonAttributes.type || "",
//             page_title: commonAttributes.page_title || "",
//             page_description: commonAttributes.page_description || "",
//             page_url: commonAttributes.page_url || "",
//             status: commonAttributes.status || "active",
//             physical_product: commonAttributes.physical_product,
//             // Preserve serial_no from current form data
//             serial_no: currentFormData.serial_no || "",
//             // Reset variant-specific fields to defaults
//             price: 0,
//             compare_price: 0,
//             cost_per_item: 0,
//             profit: 0,
//             margin: 0,
//             gst_percent: 0,
//             is_tracking_inventory: true,
//             stock_qty: 0,
//             sell_out_of_stock: false,
//             sku: "",
//             barcode: "",
//             has_barcode: false,
//             weight: 0,
//             length: 0,
//             breadth: 0,
//             height: 0,
//             region_of_origin: "India",
//             hs_code: "",
//             margin_contribution:
//               currentFormData.margin_contribution !== undefined &&
//               currentFormData.margin_contribution !== null
//                 ? currentFormData.margin_contribution
//                 : 0,
//           };

//           return restoredFormData;
//         } else if (hasVariations) {
//           // Just updating variants - ensure all variants have the latest common attributes
//           const updatedVariants = variants.map((variant) => ({
//             ...variant,
//             // These fields are now product-level only, don't sync from variants
//             is_tracking_inventory: variant.is_tracking_inventory !== false,
//             sell_out_of_stock: variant.sell_out_of_stock || false,
//             weight: variant.weight || 0,
//             length: variant.length || 0,
//             breadth: variant.breadth || 0,
//             height: variant.height || 0,
//             cost_per_item: variant.cost_per_item || 0,
//           }));

//           return {
//             ...currentFormData,
//             has_variations: hasVariations,
//             variation_options: options,
//             variants: updatedVariants,
//           };
//         } else {
//           // Normal mode update
//           return {
//             ...currentFormData,
//             has_variations: hasVariations,
//             variation_options: options,
//             variants: variants,
//           };
//         }
//       });
//     },
//     [isPhysicalProduct, commonAttributes, isLoadingProduct]
//   );

//   // Reset common attributes only when user explicitly disables variations (not during load)
//   useEffect(() => {
//     if (!formData.has_variations && isLoadingProduct === false) {
//       setCommonAttributes({
//         title: "",
//         short_description: "",
//         description: "",
//         brand: "",
//         type: "",
//         page_title: "",
//         page_description: "",
//         page_url: "",
//         status: "active" as "active" | "draft" | "inactive",
//         physical_product: false,
//       });
//     }
//   }, [formData.has_variations, isLoadingProduct]);

//   // Auto-select brand when product type is selected (for edit mode) - only on initial load
//   useEffect(() => {
//     // Just mark that we've loaded, don't try to auto-select since brand is already loaded from API
//     if (!isLoadingProduct && !hasAutoSelectedBrandRef.current) {
//       hasAutoSelectedBrandRef.current = true;
//       // Now allow manual type changes to clear brand
//       isTypeManuallyChangedRef.current = false;
//     }
//   }, [isLoadingProduct]);

//   // Clear brand only when user manually changes type (after initial load)
//   useEffect(() => {
//     if (isTypeManuallyChangedRef.current) {
//       if (formData.has_variations) {
//         setCommonAttributes((prev) => ({ ...prev, brand: "" }));
//       } else {
//         setFormData((prev) => ({ ...prev, brand: "" }));
//       }
//       // Reset the flag so it only clears once per type change
//       isTypeManuallyChangedRef.current = false;
//     }
//   }, [formData.type, commonAttributes.type]);

//   // Clear sub-categories when type changes
//   useEffect(() => {
//     if (isTypeManuallyChangedRef.current) {
//       setSelectedSubCategories([]);
//     }
//   }, [formData.type, commonAttributes.type]);

//   // When productTypes are loaded, no need to convert anymore since we store names directly
//   // This effect is now a no-op but kept for reference
//   useEffect(() => {
//     // Type is now stored as name directly, no conversion needed
//   }, [productTypes, isEditMode, isLoadingProduct, formData.has_variations]);

//   // Sync common attributes to all variants when common attributes change
//   useEffect(() => {
//     // Don't sync during product loading to prevent overwriting loaded data
//     if (isLoadingProduct) {
//       return;
//     }

//     if (
//       formData.has_variations &&
//       formData.variants &&
//       formData.variants.length > 0
//     ) {
//       const updatedVariants = formData.variants.map((variant) => ({
//         ...variant,
//         // Update common fields in all variants
//         title: commonAttributes.title,
//         description: commonAttributes.description,
//         short_description: commonAttributes.short_description,
//         page_title: commonAttributes.page_title,
//         page_description: commonAttributes.page_description,
//         page_url: commonAttributes.page_url,
//         type: commonAttributes.type,
//         brand: commonAttributes.brand,
//         status: commonAttributes.status,
//         physical_product: commonAttributes.physical_product,
//         margin_contribution: formData.margin_contribution || 0,
//         // Also sync seller and references
//         seller_id: selectedSellerId,
//         tags: selectedTags.map((tag) => tag.id).filter(Boolean) as string[],
//       }));

//       // Only update if there are actual changes
//       const hasChanges =
//         JSON.stringify(updatedVariants) !== JSON.stringify(formData.variants);
//       if (hasChanges) {
//         setFormData((prev) => ({ ...prev, variants: updatedVariants }));
//       }
//     }
//   }, [
//     commonAttributes,
//     selectedSellerId,
//     selectedTags,
//     selectedSubCategories,
//     formData.has_variations,
//     formData.variants,
//     formData.margin_contribution,
//     isLoadingProduct,
//   ]);

//   // Helper function to format variant combination for display
//   const formatVariantCombination = (variant: Variant): string => {
//     if (
//       !variant.option_values ||
//       Object.keys(variant.option_values).length === 0
//     ) {
//       return "Unknown variant";
//     }

//     return Object.entries(variant.option_values)
//       .map(([key, value]) => `${key}: ${value}`)
//       .join(", ");
//   };

//   // Validation function
//   const validateForm = (editorContent?: string) => {
//     // Common validations for all products (with or without variants)
//     if (!commonAttributes.title?.trim() && formData.has_variations) {
//       showErrorMessage("Product title is required");
//       return false;
//     } else if (!formData.title?.trim() && !formData.has_variations) {
//       showErrorMessage("Product title is required");
//       return false;
//     }

//     if (!selectedSellerId) {
//       showErrorMessage("Please select a seller");
//       return false;
//     }

//     // Validate URL handle
//     if (
//       formData.has_variations
//         ? !!commonAttributes.page_url?.trim()
//         : !!formData.page_url?.trim()
//     ) {
//       const urlHandle = formData.has_variations
//         ? commonAttributes.page_url || ""
//         : formData.page_url || "";
//       if (!isValidUrlHandle(urlHandle)) {
//         showErrorMessage(
//           "Page URL must contain only lowercase letters, numbers, and hyphens"
//         );
//         return false;
//       }
//     }

//     // Validate short description (optional but max 150 characters)
//     const shortDescription = formData.has_variations
//       ? commonAttributes.short_description || ""
//       : formData.short_description || "";
//     if (shortDescription && shortDescription.trim().length > 150) {
//       showErrorMessage("Short description must not exceed 150 characters");
//       return false;
//     }

//     // Check if product has at least one image (for normal products)
//     if (
//       !formData.has_variations &&
//       !isEditMode &&
//       images.length === 0 &&
//       (!existingImages || existingImages.length === 0)
//     ) {
//       showErrorMessage("Please upload at least one product image");
//       return false;
//     }

//     if (formData.has_variations) {
//       // Variant product validations
      
//       // Validate common attributes for variant products
//       if (!commonAttributes.type?.trim()) {
//         showErrorMessage("Product type is required");
//         return false;
//       }

//       if (!selectedSubCategories || selectedSubCategories.length === 0) {
//         showErrorMessage("Please select at least one sub-category");
//         return false;
//       }

//       if (
//         !formData.variation_options ||
//         formData.variation_options.length === 0
//       ) {
//         showErrorMessage("Please add at least one variation option");
//         return false;
//       }

//       if (!formData.variants || formData.variants.length === 0) {
//         showErrorMessage("Please add at least one variant");
//         return false;
//       }

//       // Check if at least one variant is enabled FIRST
//       const enabledVariants = formData.variants.filter((v) => v.enabled);
//       if (enabledVariants.length === 0) {
//         showErrorMessage("Please enable at least one variant");
//         return false;
//       }

//       // For variant products, check if there are common images OR if first variant has images
//       const hasCommonImages = existingImages.length > 0 || images.length > 0;
//       const firstVariantHasImages = enabledVariants[0] && enabledVariants[0].image_urls && enabledVariants[0].image_urls.length > 0;

//       if (!hasCommonImages && !firstVariantHasImages) {
//         showErrorMessage(
//           "Please upload at least one image (either common image or variant image)"
//         );
//         return false;
//       }

//       // Validate each enabled variant has all required fields
//       for (let i = 0; i < enabledVariants.length; i++) {
//         const variant = enabledVariants[i];
//         const variantDisplay = formatVariantCombination(variant);

//         if (!variant.sku?.trim()) {
//           showErrorMessage(`${variantDisplay}: SKU is required`);
//           return false;
//         }

//         // Ensure price is a number and greater than 0
//         const price = Number(variant.price);
//         if (!price || price <= 0 || isNaN(price)) {
//           showErrorMessage(`${variantDisplay}: Valid price is required`);
//           return false;
//         }

//         // Remove serial number validation from variants as it's now at product level

//         // GST, HS code, and region of origin are now product-level only
//         // No variant-level validation needed for these fields

//         if (
//           variant.is_tracking_inventory &&
//           (variant.stock_qty === undefined || Number(variant.stock_qty) < 0)
//         ) {
//           showErrorMessage(
//             `${variantDisplay}: Stock quantity is required when tracking inventory`
//           );
//           return false;
//         }

//         // Validate weight and dimensions for physical products
//         // Skip validation if values are already set (for updates) or if they're being provided
//         if (commonAttributes.physical_product) {
//           const weight = Number(variant.weight);
//           // Only validate if weight is provided and invalid
//           if (weight !== 0 && (isNaN(weight) || weight <= 0)) {
//             showErrorMessage(`${variantDisplay}: Weight must be greater than 0`);
//             return false;
//           }
//           const length = Number(variant.length);
//           if (length !== 0 && (isNaN(length) || length <= 0)) {
//             showErrorMessage(`${variantDisplay}: Length must be greater than 0`);
//             return false;
//           }
//           const breadth = Number(variant.breadth);
//           if (breadth !== 0 && (isNaN(breadth) || breadth <= 0)) {
//             showErrorMessage(`${variantDisplay}: Width must be greater than 0`);
//             return false;
//           }
//           const height = Number(variant.height);
//           if (height !== 0 && (isNaN(height) || height <= 0)) {
//             showErrorMessage(`${variantDisplay}: Height must be greater than 0`);
//             return false;
//           }
//         }
//       }
//     } else {
//       // Normal product validations (only when NOT in variant mode)
//       if (!formData.sku?.trim()) {
//         showErrorMessage("SKU is required");
//         return false;
//       }

//       if (!formData.price || formData.price <= 0) {
//         showErrorMessage("Valid price is required");
//         return false;
//       }

//       // Serial number is now validated in the common section

//       if (!productClassification.hs_code?.trim()) {
//         showErrorMessage("HS code is required");
//         return false;
//       }

//       // Validate HS code is exactly 8 digits
//       if (!/^\d{8}$/.test(productClassification.hs_code.trim())) {
//         showErrorMessage("HS code must be exactly 8 digits");
//         return false;
//       }

//       if (!productClassification.region_of_origin?.trim()) {
//         showErrorMessage("Region of origin is required");
//         return false;
//       }

//       if (!productClassification.gst_percent && productClassification.gst_percent !== 0) {
//         showErrorMessage("GST percentage is required");
//         return false;
//       }

//       if (
//         formData.is_tracking_inventory &&
//         (!formData.stock_qty || formData.stock_qty < 0)
//       ) {
//         showErrorMessage("Stock quantity is required when tracking inventory");
//         return false;
//       }

//       // Validate weight and dimensions for physical products
//       if (formData.physical_product) {
//         if (formData.weight && formData.weight <= 0) {
//           showErrorMessage("Weight must be greater than 0");
//           return false;
//         }
//         if (formData.length && formData.length <= 0) {
//           showErrorMessage("Length must be greater than 0");
//           return false;
//         }
//         if (formData.breadth && formData.breadth <= 0) {
//           showErrorMessage("Width must be greater than 0");
//           return false;
//         }
//         if (formData.height && formData.height <= 0) {
//           showErrorMessage("Height must be greater than 0");
//           return false;
//         }
//       }
//     }

//     return true;
//   };

//   // Handle form submission with proper validation
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // Get editor content from ref
//     const editorContent = editorRef.current?.getContent() || "";

//     // Don't submit in view mode
//     if (isViewMode) {
//       return;
//     }

//     // Run comprehensive validation with editor content
//     if (!validateForm(editorContent)) {
//       return;
//     }

//     // Get tag IDs from selected tags
//     const tagIds = selectedTags
//       .map((tag) => tag.id)
//       .filter((id) => id !== undefined) as string[];

//     // Update form data with related states - use sub-category IDs instead of collections
//     const productData: Partial<ExtendedProduct> = {
//       ...formData,
//       type: getProductTypeNameFromId(formData.type), // Convert ID to name for DB
//       physical_product: isPhysicalProduct,
//       tags: tagIds,
//       // Use productClassification values
//       hs_code: productClassification.hs_code || "",
//       gst_percent: productClassification.gst_percent,
//       region_of_origin: productClassification.region_of_origin || "India",
//       margin_contribution: productClassification.margin_contribution,
//       // Store sub-category IDs as the collection reference
//       collections: selectedSubCategories.map((s) => s.id),
//     };

//     // If variations are not enabled, ensure no variation data is sent
//     if (!formData.has_variations) {
//       delete productData.variation_options;
//       delete productData.variants;
//       delete productData.has_variations;
//     } else {
//       // Make sure has_variations is explicitly set to true when enabled
//       productData.has_variations = true;
//     }

//     // Remove profit and margin from API data since they're calculated server-side
//     delete productData.profit;
//     delete productData.margin;
//     delete productData.has_barcode;

//     try {
//       let success: boolean;

//       // Handle products with variations
//       if (
//         formData.has_variations &&
//         formData.variation_options &&
//         formData.variants
//       ) {
//         // Filter enabled variants only
//         const enabledVariants = formData.variants.filter(
//           (variant) => variant.enabled
//         );

//         if (enabledVariants.length === 0) {
//           showErrorMessage("Please enable at least one variant");
//           return;
//         }

//         // First, upload all variant images
//         const variantProductsWithUploadedImages = await Promise.all(
//           enabledVariants.map(async (variant) => {
//             let uploadedVariantImages: ProductImageUpload[] = [];

//             // Upload new variant images if any
//             if (variant.images && variant.images.length > 0) {
//               try {
//                 const uploaded = await uploadImagesWithPresignedUrls(
//                   variant.images,
//                   "products/temp",
//                   "admin"
//                 );
//                 if (uploaded) {
//                   uploadedVariantImages = uploaded;
//                 }
//               } catch (error) {
//                 console.error(`Failed to upload images for variant ${variant.id}:`, error);
//                 showErrorMessage(`Failed to upload images for variant`);
//                 throw error;
//               }
//             }

//             // Combine uploaded images with existing image_urls
//             const finalImageUrls = [
//               ...(variant.image_urls || []).map((img, idx) => {
//                 // If img.key exists, use it; otherwise extract from URL
//                 let key: string = img.key || 'image.jpg';
//                 if (!img.key && img.url) {
//                   // Extract the S3 key from the full URL
//                   // URL format: https://totallyassets.s3.ap-south-1.amazonaws.com/products/...
//                   const urlParts = img.url.split('amazonaws.com/');
//                   key = urlParts.length > 1 ? urlParts[1] : img.url.split('/').pop() || 'image.jpg';
//                 }
//                 return {
//                   key: key,
//                   originalName: img.originalName || 'image.jpg',
//                   url: img.url,
//                   position: idx,
//                 };
//               }),
//               ...uploadedVariantImages.map((img, idx) => ({
//                 key: img.key,
//                 originalName: img.originalName,
//                 position: (variant.image_urls?.length || 0) + idx,
//               })),
//             ];

//             return {
//               // Remove serial_no as it's now at the product level
//               option_values: variant.option_values,
//               price: Number(variant.price) || 0,  // Convert string to number
//               compare_price: Number(variant.compare_price) || 0,
//               sku: variant.sku,
//               barcode: variant.barcode || "",
//               stock_qty: Number(variant.stock_qty) || 0,
//               weight: Number(variant.weight) || 0,
//               length: Number(variant.length) || 0,
//               breadth: Number(variant.breadth) || 0,
//               height: Number(variant.height) || 0,
//               is_tracking_inventory: variant.is_tracking_inventory || true,
//               sell_out_of_stock: variant.sell_out_of_stock || false,
//               cost_per_item: Number(variant.cost_per_item) || 0,
//               // GST, HS code, and region of origin are now product-level only
//               // Do not include them at variant level
//               image_urls: finalImageUrls,
//             };
//           })
//         );

//         // Prepare variant data with common images
//         const variantData = {
//           common_attributes: getCommonAttributes(editorContent),
//           variation_options: formData.variation_options,
//           variant_products: variantProductsWithUploadedImages,
//         };

//         // Process common images if any
//         if (images.length > 0) {
//           try {
//             // Upload images using presigned URLs for common images
//             const uploadedImages = await uploadImagesWithPresignedUrls(
//               images,
//               "products/temp",
//               "admin"
//             );

//             if (uploadedImages) {
//               // Backend expects image information in specific format
//               (variantData.common_attributes as any).default_image_urls =
//                 uploadedImages.map((img: ProductImageUpload) => ({
//                   key: img.key,
//                   originalName: img.originalName,
//                 }));
//             }
//           } catch (error) {
//             console.error("Failed to upload common images:", error);
//             showErrorMessage("Failed to upload common images");
//             return;
//           }
//         } else if (existingImages.length > 0) {
//           // Keep existing common images
//           (variantData.common_attributes as any).default_image_urls =
//             existingImages.map((img) => {
//               // If img.key exists, use it; otherwise extract from URL
//               let key = img.key;
//               if (!key && img.url) {
//                 // Extract the S3 key from the full URL
//                 // URL format: https://totallyassets.s3.ap-south-1.amazonaws.com/products/...
//                 const urlParts = img.url.split('amazonaws.com/');
//                 key = urlParts.length > 1 ? urlParts[1] : img.url.split("/").pop();
//               }
//               return {
//                 key: key || "image.jpg",
//                 originalName: img.originalName || "image.jpg",
//               };
//             });
//         } else {
//           // If no common images, use first variant's image as fallback
//           const firstVariant = formData.variants.find((v) => v.enabled);
//           if (firstVariant && firstVariant.image_urls && firstVariant.image_urls.length > 0) {
//             (variantData.common_attributes as any).default_image_urls =
//               firstVariant.image_urls.map((img) => {
//                 // If img.key exists, use it; otherwise extract from URL
//                 let key: string = img.key || 'image.jpg';
//                 if (!img.key && img.url) {
//                   // Extract the S3 key from the full URL
//                   // URL format: https://totallyassets.s3.ap-south-1.amazonaws.com/products/...
//                   const urlParts = img.url.split('amazonaws.com/');
//                   key = urlParts.length > 1 ? urlParts[1] : img.url.split("/").pop() || 'image.jpg';
//                 }
//                 return {
//                   key: key,
//                   originalName: img.originalName || "image.jpg",
//                 };
//               });
//           } else {
//             (variantData.common_attributes as any).default_image_urls = [];
//           }
//         }

//         // Add tags and collections to common attributes - use sub-category IDs instead of collections
//         const extendedCommonAttributes = {
//           ...variantData.common_attributes,
//           tags: tagIds,
//           collections: selectedSubCategories.map((s) => s.id),
//           margin_contribution: formData.margin_contribution || 0,
//         } as ProductCommonAttributes & {
//           tags: string[];
//           collections: string[];
//           margin_contribution?: number;
//         };

//         variantData.common_attributes = extendedCommonAttributes;

//         if (isEditMode && productId) {
//           // Update existing product with variants
//           success = await updateProductWithVariants(productId, variantData as any, enableHSNValidator);
//         } else {
//           // Create new product with variants
//           success = await createProductWithVariants(
//             selectedSellerId,
//             variantData as any,
//             enableHSNValidator
//           );
//         }
//       } else {
//         // Handle non-variant product
//         // Create clean product data with only API-compatible fields
//         // Using the Product interface directly to avoid type errors
//         const cleanProductData: Partial<Product> = {
//           serial_no: formData.serial_no || "",
//           title: formData.title || "",
//           description: editorContent || formData.description || "",
//           short_description: formData.short_description || "",
//           seller_price: Number(formData.price) || 0,  // Send as seller_price
//           price: Number(formData.price) || 0,  // Keep for backward compatibility
//           compare_price: Number(formData.compare_price) || 0,
//           cost_per_item: Number(formData.cost_per_item) || 0,
//           gst_percent: Number(formData.gst_percent ?? 0),
//           physical_product: isPhysicalProduct,
//           is_tracking_inventory: !!formData.is_tracking_inventory,
//           stock_qty: Number(formData.stock_qty) || 0,
//           sell_out_of_stock: !!formData.sell_out_of_stock,
//           sku: formData.sku || "",
//           barcode: formData.barcode || "",
//           weight: Number(formData.weight) || 0,
//           length: Number(formData.length) || 0,
//           breadth: Number(formData.breadth) || 0,
//           height: Number(formData.height) || 0,
//           region_of_origin: formData.region_of_origin || "",
//           hs_code: formData.hs_code || "",
//           page_title: formData.page_title || "",
//           page_description: formData.page_description || "",
//           page_url: formData.page_url || "",
//           type: formData.type || "", // Store as name directly
//           brand: formData.brand || "",
//           margin_contribution: formData.margin_contribution,
//           status:
//             (formData.status as "draft" | "active" | "inactive") || "active",
//           tags: productData.tags,
//           collections: productData.collections,
//         };

//         if (isEditMode && productId) {
//           // Update existing product
//           success = await updateProduct(productId, cleanProductData, images, enableHSNValidator);
//         } else {
//           // Create new product
//           success = await createProduct(
//             selectedSellerId,
//             cleanProductData,
//             images,
//             enableHSNValidator
//           );
//         }
//       }

//       if (success) {
//         // Reset form or redirect
//         // window.location.href = "/admin/products";
//         router.push("/admin/products");
//       }
//     } catch (error) {
//       console.error(
//         `Failed to ${isEditMode ? "update" : "create"} product:`,
//         error
//       );

//       // Handle AxiosError with proper type checking
//       const axiosError = error as AxiosError<{
//         success: boolean;
//         message: string;
//         errors?: string[];
//       }>;

//       // Display specific validation errors if available
//       if (
//         axiosError.response?.data?.errors &&
//         Array.isArray(axiosError.response.data.errors)
//       ) {
//         // Combine all errors into a single message with line breaks
//         const errorMessage = axiosError.response.data.errors.join("<br>");
//         showErrorMessage(
//           `Validation failed. Please fix the following issues:<br>${errorMessage}`
//         );
//       } else if (axiosError.response?.data?.message) {
//         // Show the main error message if no specific errors
//         showErrorMessage(axiosError.response.data.message);
//       } else {
//         // Generic error message as fallback
//         showErrorMessage(
//           `Failed to ${
//             isEditMode ? "update" : "create"
//           } product. Please try again.`
//         );
//       }
//     }
//   };

//   // Add click outside handler
//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       // Close tag dropdown when clicking outside
//       if (
//         tagDropdownRef.current &&
//         !tagDropdownRef.current.contains(event.target as Node) &&
//         showTagDropdown
//       ) {
//         setShowTagDropdown(false);
//       }

//       // Close seller dropdown when clicking outside
//       if (
//         sellerDropdownRef.current &&
//         !sellerDropdownRef.current.contains(event.target as Node) &&
//         showSellerDropdown
//       ) {
//         setShowSellerDropdown(false);
//       }
//     }

//     // Add event listener
//     document.addEventListener("mousedown", handleClickOutside);

//     // Clean up
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showTagDropdown, showSellerDropdown]);

//   return (
//     <div className="main-container">
//       {/* Header with back button */}
//       <div className="flex items-center justify-between mb-6">
//         <Link href="/admin/products" className="flex items-center text-black">
//           <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
//           <span className="display-4-bold">
//             {isViewMode
//               ? "View Product"
//               : isEditMode
//               ? "Edit Product"
//               : "Add Product"}
//           </span>
//         </Link>
//         <div className="flex gap-2">
//           {(isViewMode || isEditMode) && product?.status === "approvalpending" && (
//             <button
//               onClick={async () => {
//                 const success = await approveProduct(productId!);
//                 if (success) {
//                   // Navigate to products page
//                   router.push("/admin/products");
//                 }
//               }}
//               className="px-4 py-2 border-2 rounded-md small-semibold"
//               style={{
//                 backgroundColor: 'transparent',
//                 borderColor: '#00478f',
//                 color: '#00478f',
//               }}
//               onMouseEnter={(e) => {
//                 e.currentTarget.style.backgroundColor = '#00478f';
//                 e.currentTarget.style.color = 'white';
//               }}
//               onMouseLeave={(e) => {
//                 e.currentTarget.style.backgroundColor = 'transparent';
//                 e.currentTarget.style.color = '#00478f';
//               }}
//             >
//               Approve Product
//             </button>
//           )}
//           {!isViewMode && (
//             <button
//               onClick={handleSubmit}
//               className="px-4 py-2 bg-primary text-white rounded-md small-semibold"
//             >
//               {isEditMode ? "Update Product" : "Save Product"}
//             </button>
//           )}
//         </div>
//       </div>
//       {/* Tag Creation Modal */}
//       {showTagModal && (
//         <div
//           className="fixed inset-0 z-50 overflow-auto flex items-center justify-center"
//           style={{ zIndex: 1000, backgroundColor: "rgba(0, 0, 0, 0.5)" }}
//         >
//           <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-medium">Create New Tag</h3>
//               <button
//                 onClick={() => setShowTagModal(false)}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <FontAwesomeIcon icon={faTimes} />
//               </button>
//             </div>

//             <form onSubmit={handleAddNewTag}>
//               <div className="mb-4">
//                 <label className="block text-gray-700 text-sm font-medium mb-2">
//                   Tag Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={newTagName}
//                   onChange={(e) => setNewTagName(e.target.value)}
//                   className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
//                   placeholder="Enter tag name"
//                   required
//                 />
//               </div>

//               <div className="mb-6">
//                 <label className="block text-gray-700 text-sm font-medium mb-2">
//                   Description
//                 </label>
//                 <textarea
//                   value={newTagDescription}
//                   onChange={(e) => setNewTagDescription(e.target.value)}
//                   className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
//                   placeholder="Enter tag description (optional)"
//                   rows={3}
//                 />
//               </div>

//               <div className="flex justify-end space-x-3">
//                 <button
//                   type="button"
//                   onClick={() => setShowTagModal(false)}
//                   className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-primary text-white rounded-md"
//                 >
//                   Create Tag
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* Left Column - Main Form - Make it scrollable independently */}
//         <div className="md:col-span-2 space-y-6 md:h-[calc(100vh-120px)] md:overflow-y-auto md:pr-4 scrollbar-hide">
//           {/* HSN Validator Toggle - At Top */}
//           <div className="p-4 bg-blue-40 border border-blue-20 rounded-md">
//             <div className="flex items-center justify-between">
//               <div>
//                 <label className="block text-xs font-semibold text-blue-00 mb-1">
//                   Enable HSN Validation
//                 </label>
//                 <p className="text-xs text-blue-10">
//                   Validate HSN code via API (default: Disabled)
//                 </p>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setEnableHSNValidator(!enableHSNValidator)}
//                 disabled={isViewMode}
//                 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
//                   enableHSNValidator ? "bg-green-10" : "bg-gray-20"
//                 } ${isViewMode ? "opacity-50 cursor-not-allowed" : ""}`}
//               >
//                 <span
//                   className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
//                     enableHSNValidator ? "translate-x-6" : "translate-x-1"
//                   }`}
//                 />
//               </button>
//             </div>
//           </div>

//           {/* Title */}
//           <div className="bg-white p-6 rounded-lg shadow-sm custom-border-1 space-y-4">
//             <div>
//               <h3 className="text-black title-4-semibold mb-2">
//                 Title <span className="text-red-500">*</span>
//               </h3>
//               <input
//                 type="text"
//                 name="title"
//                 value={
//                   formData.has_variations
//                     ? commonAttributes.title || ""
//                     : formData.title || ""
//                 }
//                 onChange={handleInputChange}
//                 placeholder="e.g. Summer Collection, Under 100, Staff picks"
//                 className="w-full p-2 small focus:outline-none custom-border-3 bg-blue-80 rounded-md"
//                 disabled={isViewMode}
//               />
//             </div>
//             {/* Common Product Images - Only show when variations are enabled */}
//             {formData.has_variations && (
//               <div>
//                 <h3 className="text-black title-4-semibold mb-2">
//                   Common Product Images <span className="text-red-500">*</span>
//                 </h3>
//                 <p className="text-gray-10 xxsmall mb-2">
//                   These images will be used for the product when no specific
//                   variant is selected
//                 </p>
//                 {/* Show existing common images if in edit mode or view mode */}
//                 {(isEditMode || isViewMode) && existingImages.length > 0 && (
//                   <div className="mb-4">
//                     <h4 className="text-gray-700 text-sm font-medium mb-2">
//                       Current Common Images
//                     </h4>
//                     <div className="flex flex-wrap gap-4 mb-4">
//                       {existingImages
//                         .sort((a, b) => a.position - b.position)
//                         .map((img, idx) => (
//                           <div
//                             key={idx}
//                             className="relative w-28 h-28 border rounded bg-blue-80 flex flex-col items-center justify-center"
//                           >
//                             <Image
//                               src={img.url}
//                               alt={`Product ${img.position}`}
//                               fill
//                               style={{ objectFit: "cover" }}
//                               className="rounded"
//                             />
//                             {!isViewMode && (
//                               <div className="absolute top-1 right-1 flex gap-1">
//                                 <button
//                                   type="button"
//                                   onClick={() => {
//                                     const newExistingImages =
//                                       existingImages.filter(
//                                         (_, i) => i !== idx
//                                       );
//                                     setExistingImages(newExistingImages);
//                                   }}
//                                   className="bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center"
//                                 >
//                                   <FontAwesomeIcon
//                                     icon={faTrash}
//                                     className="h-3 w-3"
//                                   />
//                                 </button>
//                               </div>
//                             )}
//                           </div>
//                         ))}
//                     </div>
//                   </div>
//                 )}
//                 <ProductMultiImageUpload
//                   images={images}
//                   setImages={setImages}
//                   maxImages={8 - existingImages.length}
//                   disabled={isViewMode}
//                 />
//               </div>
//             )}
//             {/* Short Description */}
//             <div>
//               <h3 className="text-black title-4-semibold mb-2">
//                 Short Description
//               </h3>
//               <textarea
//                 name="short_description"
//                 value={
//                   formData.has_variations
//                     ? commonAttributes.short_description || ""
//                     : formData.short_description || ""
//                 }
//                 onChange={handleInputChange}
//                 placeholder="A brief summary of the product (max 150 characters)..."
//                 className="w-full p-2 small focus:outline-none custom-border-3 bg-blue-80 rounded-md"
//                 rows={2}
//                 maxLength={150}
//                 disabled={isViewMode}
//               />
//               <p className="text-gray-10 xxsmall mt-1">
//                 {(formData.has_variations
//                   ? commonAttributes.short_description || ""
//                   : formData.short_description || ""
//                 ).length}/150 characters
//               </p>
//             </div>
//             {/* Description */}
//             <div>
//               <h3 className="text-black title-4-semibold mb-2">
//                 Description <span className="text-red-500">*</span>
//               </h3>
//               <div className="border border-gray-line rounded-md">
//                 <QuillEditor
//                   ref={editorRef}
//                   value={
//                     formData.has_variations
//                       ? commonAttributes.description || ""
//                       : formData.description || ""
//                   }
//                   onChange={handleEditorChange}
//                   disabled={isViewMode}
//                   placeholder="Enter product description..."
//                 />
//               </div>
//             </div>
//           </div>
//           {/* Variants */}
//           <VariationManager
//             initialPrice={Number(formData.price) || 0}
//             initialSku={formData.sku || ""}
//             initialHasVariations={formData.has_variations || false}
//             initialVariationOptions={formData.variation_options || []}
//             initialVariants={formData.variants || []}
//             disabled={isViewMode}
//             onVariationsChange={handleVariationsChange}
//           />

//           {!formData.has_variations && (
//             <div className="bg-white p-6 rounded-lg shadow-sm custom-border-1">
//               {/* Existing Images - Only show if variations are not enabled */}
//               {!formData.has_variations && (
//                 <>
//                   {existingImages.length > 0 && (
//                     <div className="mb-4">
//                       <h4 className="text-gray-700 text-sm font-medium mb-2">
//                         Current Images
//                       </h4>
//                       <div className="flex flex-wrap gap-4 mb-4">
//                         {existingImages
//                           .sort((a, b) => a.position - b.position)
//                           .map((img, idx) => (
//                             <div
//                               key={idx}
//                               className="relative w-28 h-28 border rounded bg-blue-80 flex flex-col items-center justify-center"
//                             >
//                               <Image
//                                 src={img.url}
//                                 alt={`Product ${img.position}`}
//                                 fill
//                                 style={{ objectFit: "cover" }}
//                                 className="rounded"
//                               />
//                               {!isViewMode && (
//                                 <div className="absolute top-1 right-1 flex gap-1">
//                                   <button
//                                     type="button"
//                                     onClick={async () => {
//                                       const image = existingImages[idx];
//                                       const ok = await deleteProductImage(
//                                         String(productId),
//                                         {
//                                           key: String(image.key),
//                                           type: "default",
//                                         }
//                                       );
//                                       if (ok) {
//                                         const newExistingImages = existingImages
//                                           .filter((_, i) => i !== idx)
//                                           .map((img, i2) => ({
//                                             ...img,
//                                             position: i2 + 1,
//                                           }));
//                                         setExistingImages(newExistingImages);
//                                       }
//                                     }}
//                                     className="bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center"
//                                   >
//                                     <FontAwesomeIcon
//                                       icon={faTrash}
//                                       className="h-3 w-3"
//                                     />
//                                   </button>
//                                 </div>
//                               )}
//                             </div>
//                           ))}
//                       </div>
//                     </div>
//                   )}

//                   {/* New Image Upload */}
//                   <div>
//                     <ProductMultiImageUpload
//                       images={images}
//                       setImages={setImages}
//                       maxImages={8 - existingImages.length}
//                       disabled={isViewMode}
//                     />
//                   </div>
//                 </>
//               )}
//             </div>
//           )}
//           {/* image and serial number section */}

         
//           {!formData.has_variations && (
//             <div className="bg-white p-6 rounded-lg shadow-sm custom-border-1">
//               <h3 className="text-black title-4-semibold mb-4">Pricing</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                 <div>
//                   <label className="block text-black title-4-semibold mb-2">
//                     Price <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-10">
//                       ₹
//                     </span>
//                     <input
//                       type="text"
//                       inputMode="decimal"
//                       name="price"
//                       value={formData.price ? formData.price : ""}
//                       onChange={handleInputChange}
//                       onKeyDown={handleNumberKeyDown}
//                       placeholder="0.00"
//                       className="w-full !pl-6 p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
//                       disabled={isViewMode}
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-black title-4-semibold mb-2">
//                     Compare-at price
//                   </label>
//                   <div className="relative">
//                     <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-10">
//                       ₹
//                     </span>
//                     <input
//                       type="text"
//                       inputMode="decimal"
//                       name="compare_price"
//                       value={formData.compare_price ? formData.compare_price : ""}
//                       onChange={handleInputChange}
//                       onKeyDown={handleNumberKeyDown}
//                       placeholder="0.00"
//                       className="w-full !pl-6 p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
//                       disabled={isViewMode}
//                     />
//                   </div>
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-black title-4-semibold mb-2">
//                     Cost per item
//                   </label>
//                   <div className="relative">
//                     <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-10">
//                       ₹
//                     </span>
//                     <input
//                       type="text"
//                       inputMode="decimal"
//                       name="cost_per_item"
//                       value={formData.cost_per_item ? formData.cost_per_item : ""}
//                       onChange={handleInputChange}
//                       onKeyDown={handleNumberKeyDown}
//                       placeholder="0.00"
//                       className="w-full !pl-6 p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
//                       disabled={isViewMode}
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-black title-4-semibold mb-2">
//                     Profit
//                   </label>
//                   <div className="relative">
//                     <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-10">
//                       ₹
//                     </span>
//                     <input
//                       type="number"
//                       name="profit"
//                       value={
//                         formData.profit ? formData.profit.toFixed(2) : "0.00"
//                       }
//                       readOnly
//                       placeholder="0.00"
//                       className="w-full !pl-6 p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none bg-gray-100 cursor-not-allowed"
//                     />
//                   </div>
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
//                 <div>
//                   <label className="block text-black title-4-semibold mb-2">
//                     GST Percentage <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     name="gst_percent"
//                     value={productClassification.gst_percent !== undefined ? productClassification.gst_percent.toString() : ""}
//                     onChange={handleInputChange}
//                     className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
//                     disabled={isViewMode}
//                     required
//                   >
//                     <option value="">Select GST Percentage</option>
//                     <option value="0">0%</option>
//                     <option value="5">5%</option>
//                     <option value="12">12%</option>
//                     <option value="18">18%</option>
//                     <option value="28">28%</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-black title-4-semibold mb-2">
//                     Margin
//                   </label>
//                   <div className="relative">
//                     <input
//                       type="number"
//                       name="margin"
//                       value={
//                         formData.margin ? formData.margin.toFixed(2) : "0.00"
//                       }
//                       readOnly
//                       placeholder="0.00"
//                       className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none bg-gray-100 cursor-not-allowed"
//                     />
//                     <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-10">
//                       %
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
          
//           {/* Inventory - Only show if variations are not enabled */}
//           {!formData.has_variations && (
//             <div className="bg-white p-6 rounded-lg shadow-sm custom-border-1">
//               <h3 className="text-black title-4-semibold mb-4">Inventory</h3>
//               <div className="mb-4">
//                 <label className="flex items-center gap-2 cursor-pointer mb-4">
//                   <input
//                     type="checkbox"
//                     name="is_tracking_inventory"
//                     checked={formData.is_tracking_inventory || false}
//                     onChange={handleInputChange}
//                     className="rounded border-gray-300"
//                     disabled={isViewMode}
//                   />
//                   <span className="text-black small">
//                     Track inventory for this product
//                   </span>
//                 </label>

//                 <div className="flex justify-between items-center mb-2">
//                   <label className="block text-black title-4-semibold">
//                     Quantity 
//                   </label>
//                 </div>

//                 <div className="mb-4">
//                   <label className="block text-gray-10 xsmall mb-1">
//                     Current Stock
//                   </label>
//                   <input
//                     type="text"
//                     inputMode="numeric"
//                     name="stock_qty"
//                     value={formData.stock_qty ? formData.stock_qty : ""}
//                     onChange={handleInputChange}
//                     onKeyDown={(e) => handleNumberKeyDown(e, false)}
//                     placeholder="0"
//                     className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
//                     disabled={isViewMode}
//                   />
//                 </div>

//                 <div className="mb-4">
//                   <label className="block text-black title-4-semibold mb-2">
//                     SKU (Stock Keeping Unit){" "}
//                     <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="sku"
//                     value={formData.sku || ""}
//                     onChange={handleInputChange}
//                     className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
//                     disabled={isViewMode}
//                     required
//                   />
//                   <p className="text-gray-10 xxsmall mt-1">
//                     Only alphanumeric characters, hyphens (-) and underscores
//                     (_) are allowed
//                   </p>
//                 </div>

//                 <label className="flex items-center gap-2 cursor-pointer mb-4">
//                   <input
//                     type="checkbox"
//                     name="sell_out_of_stock"
//                     checked={formData.sell_out_of_stock || false}
//                     onChange={handleInputChange}
//                     className="rounded border-gray-300"
//                     disabled={isViewMode}
//                   />
//                   <span className="text-black small">
//                     Continue selling when out of stock
//                   </span>
//                 </label>

//                 <label className="flex items-center gap-2 cursor-pointer mb-4">
//                   <input
//                     type="checkbox"
//                     name="has_barcode"
//                     checked={formData.has_barcode || false}
//                     onChange={handleInputChange}
//                     className="rounded border-gray-300"
//                     disabled={isViewMode}
//                   />
//                   <span className="text-black small">
//                     This product has a Barcode
//                   </span>
//                 </label>

//                 {formData.has_barcode && (
//                   <div>
//                     <label className="block text-gray-10 xsmall mb-1">
//                       Barcode (ISBN, UPC, GTIN, etc.)
//                     </label>
//                     <input
//                       type="text"
//                       name="barcode"
//                       value={formData.barcode || ""}
//                       onChange={handleInputChange}
//                       className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
//                       disabled={isViewMode}
//                     />
//                     <p className="text-gray-10 xxsmall mt-1">
//                       Only numeric characters are allowed
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Shipping - Only show if variations are not enabled */}
//           {!formData.has_variations && (
//             <div className="bg-white p-6 rounded-lg shadow-sm custom-border-1">
//               <h3 className="text-black title-4-semibold mb-4">Shipping</h3>
//               <div className="mb-4">
//                 <label className="flex items-center gap-2 cursor-pointer mb-4">
//                   <input
//                     type="checkbox"
//                     name="physical_product"
//                     checked={isPhysicalProduct}
//                     onChange={handleInputChange}
//                     className="rounded border-gray-300"
//                     disabled={isViewMode}
//                   />
//                   <span className="text-black small">
//                     This is physical product
//                   </span>
//                 </label>

//                 {isPhysicalProduct && (
//                   <>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                       <div>
//                         <label className="block text-black title-4-semibold mb-2">
//                           Weight <span className="text-red-500">*</span>
//                         </label>
//                         <div className="flex">
//                           <input
//                             type="text"
//                             inputMode="decimal"
//                             name="weight"
//                             value={formData.weight ? formData.weight : ""}
//                             onChange={handleInputChange}
//                             onKeyDown={handleNumberKeyDown}
//                             placeholder="0.0"
//                             className="w-full p-2 custom-border-3 bg-blue-80 rounded-l-md small focus:outline-none"
//                             disabled={isViewMode}
//                           />
//                           <select
//                             className="p-2 border-y-2 border-r-2 border-gray-line bg-blue-80 rounded-r-md small focus:outline-none"
//                             disabled={isViewMode}
//                           >
//                             <option>kg</option>
//                           </select>
//                         </div>
//                       </div>
//                       <div>
//                         <label className="block text-black title-4-semibold mb-2">
//                           Dimensions <span className="text-red-500">*</span>
//                         </label>
//                         <div className="flex">
//                           <input
//                             type="text"
//                             inputMode="decimal"
//                             name="length"
//                             value={formData.length ? formData.length : ""}
//                             onChange={handleInputChange}
//                             onKeyDown={handleNumberKeyDown}
//                             placeholder="Length"
//                             className="w-full custom-border-3 bg-blue-80 small focus:outline-none mr-1"
//                             disabled={isViewMode}
//                           />
//                           <input
//                             type="text"
//                             inputMode="decimal"
//                             name="breadth"
//                             value={formData.breadth ? formData.breadth : ""}
//                             onChange={handleInputChange}
//                             onKeyDown={handleNumberKeyDown}
//                             placeholder="Width"
//                             className="w-full custom-border-3 bg-blue-80 small focus:outline-none mr-1"
//                             disabled={isViewMode}
//                           />
//                           <input
//                             type="text"
//                             inputMode="decimal"
//                             name="height"
//                             value={formData.height ? formData.height : ""}
//                             onChange={handleInputChange}
//                             onKeyDown={handleNumberKeyDown}
//                             placeholder="Height"
//                             className="w-full custom-border-3 bg-blue-80 small focus:outline-none mr-1"
//                             disabled={isViewMode}
//                           />
//                           <select
//                             className="custom-border-3 bg-blue-80 small focus:outline-none"
//                             disabled={isViewMode}
//                           >
//                             <option>cm</option>
//                           </select>
//                         </div>
//                       </div>
//                     </div>
//                   </>
//                 )}

//                 <div className="mb-4">
//                   <label className="block text-black title-4-semibold mb-2">
//                     Country/Region of Origin{" "}
//                     <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     name="region_of_origin"
//                     value={productClassification.region_of_origin}
//                     onChange={handleInputChange}
//                     className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
//                     required
//                   >
//                     <option value="India">India</option>
//                   </select>
//                 </div>

//                 <div className="mb-4">
//                   <label className="block text-black title-4-semibold mb-2">
//                     Harmonised System (HS) code{" "}
//                     <span className="text-red-500">*</span>
//                     <span className="text-gray-10 xsmall ml-2">
//                       (limit: 8 digits)
//                     </span>
//                   </label>
//                   <input
//                     type="text"
//                     name="hs_code"
//                     value={productClassification.hs_code || ""}
//                     onChange={handleInputChange}
//                     placeholder="Enter 8-digit HS code"
//                     className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
//                     maxLength={8}
//                     disabled={isViewMode}
//                     required
//                   />
//                   <p className="text-gray-10 xxsmall mt-1">
//                     Only numeric characters are allowed
//                   </p>
//                 </div>

//                 <p className="text-gray-10 xsmall">
//                   Learn more about{" "}
//                   <a href="#" className="text-primary">
//                     adding HS code
//                   </a>
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Product-Level Fields - Show for variant products ONLY */}
//           {formData && !isLoadingProduct && (formData.has_variations || (product && product.has_variant)) && (
//             <>
//               <div className="bg-white p-6 rounded-lg shadow-sm custom-border-1">
//                 <h3 className="text-black title-4-semibold mb-4">Product Classification</h3>
//               <div className="mb-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                   <div>
//                     <label className="block text-black title-4-semibold mb-2">
//                       GST Percentage <span className="text-red-500">*</span>
//                     </label>
//                     <select
//                       name="gst_percent"
//                       value={productClassification.gst_percent !== undefined ? productClassification.gst_percent.toString() : ""}
//                       onChange={handleInputChange}
//                       className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
//                       disabled={isViewMode}
//                       required
//                     >
//                       <option value="">Select GST Percentage</option>
//                       <option value="0">0%</option>
//                       <option value="5">5%</option>
//                       <option value="12">12%</option>
//                       <option value="18">18%</option>
//                       <option value="28">28%</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-black title-4-semibold mb-2">
//                       Country/Region of Origin{" "}
//                       <span className="text-red-500">*</span>
//                     </label>
//                     <select
//                       name="region_of_origin"
//                       value={productClassification.region_of_origin}
//                       onChange={handleInputChange}
//                       className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
//                       required
//                     >
//                       <option value="India">India</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div className="mb-4">
//                   <label className="block text-black title-4-semibold mb-2">
//                     Harmonised System (HS) code{" "}
//                     <span className="text-red-500">*</span>
//                     <span className="text-gray-10 xsmall ml-2">
//                       (limit: 8 digits)
//                     </span>
//                   </label>
                  
//                   <input
//                     type="text"
//                     name="hs_code"
//                     value={productClassification.hs_code || ""}
//                     onChange={handleInputChange}
//                     placeholder="Enter 8-digit HS code"
//                     className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
//                     maxLength={8}
//                     disabled={isViewMode}
//                     required
//                   />
//                   <p className="text-gray-10 xxsmall mt-1">
//                     Only numeric characters are allowed
//                   </p>
                  
//                   <p className="text-gray-10 xsmall mt-2">
//                     Learn more about{" "}
//                     <a href="#" className="text-primary">
//                       adding HS code
//                     </a>
//                   </p>
//                 </div>
//               </div>
//             </div>
//             </>
//           )}

//           {/* SEO Section */}
//           <div className="bg-white p-6 rounded-lg shadow-sm custom-border-1 !px-0">
//             <div className="top px-6">
//               <h3 className="text-black title-4-semibold mb-2">
//                 Search Engine Listing
//               </h3>
//               <p className="text-gray-10 xsmall mb-4">
//                 Add a title and description to see how this collection might
//                 appear in a search engine listing
//               </p>
//             </div>
//             {/* hr line */}
//             <div className="h-[2px] bg-gray-line my-4"></div>
//             <div className="bottom px-6">
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-black title-4-semibold mb-2">
//                     Page Title
//                   </label>
//                   <textarea
//                     name="page_title"
//                     value={
//                       formData.has_variations
//                         ? commonAttributes.page_title || ""
//                         : formData.page_title || ""
//                     }
//                     onChange={handleInputChange}
//                     className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
//                     placeholder="Enter page title here..."
//                     disabled={isViewMode}
//                   ></textarea>
//                   <p className="text-gray-10 xxsmall mt-1">
//                     {
//                       (formData.has_variations
//                         ? commonAttributes.page_title || ""
//                         : formData.page_title || ""
//                       ).length
//                     }{" "}
//                     of 70 characters used
//                   </p>
//                 </div>
//                 <div>
//                   <label className="block text-black title-4-semibold mb-2">
//                     Page Description
//                   </label>
//                   <textarea
//                     name="page_description"
//                     value={
//                       formData.has_variations
//                         ? commonAttributes.page_description || ""
//                         : formData.page_description || ""
//                     }
//                     onChange={handleInputChange}
//                     className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
//                     placeholder="Enter page description here..."
//                     disabled={isViewMode}
//                   ></textarea>
//                   <p className="text-gray-10 xxsmall mt-1">
//                     {
//                       (formData.has_variations
//                         ? commonAttributes.page_description || ""
//                         : formData.page_description || ""
//                       ).length
//                     }{" "}
//                     of 160 characters used
//                   </p>
//                 </div>
//                 <div>
//                   <label className="block text-black title-4-semibold mb-2">
//                     URL Handle
//                   </label>
//                   <div className="flex flex-col items-start w-full gap-2">
//                     <input
//                       type="text"
//                       name="page_url"
//                       value={
//                         formData.has_variations
//                           ? commonAttributes.page_url || ""
//                           : formData.page_url || ""
//                       }
//                       onChange={handleInputChange}
//                       className="flex-1 p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none w-full"
//                       placeholder="product-name"
//                     />
//                     <div className="flex flex-col w-full">
//                       <span className="text-blue-100 xsmall-medium">
//                         https://totallyindian.com/products/
//                         {formData.has_variations
//                           ? commonAttributes.page_url || ""
//                           : formData.page_url || ""}
//                       </span>
//                       <span className="text-gray-10 xxsmall mt-1">
//                         Only lowercase letters, numbers, and hyphens allowed. No
//                         spaces or special characters.
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//         {/* Right Column - Status and Organization - Make it scrollable independently */}
//         <div className="md:col-span-1">
//           <div className="sticky top-4 space-y-6 md:h-[calc(100vh-120px)] md:overflow-y-auto scrollbar-hide pb-10">
//             <div className="bg-white p-6 rounded-lg shadow-sm custom-border-1">
//               <h3 className="text-black title-4-semibold mb-2">Status</h3>
//               <select
//                 name="status"
//                 value={
//                   formData.has_variations
//                     ? commonAttributes.status || "active"
//                     : formData.status || "active"
//                 }
//                 onChange={handleInputChange}
//                 className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none mb-4"
//                 disabled={isViewMode}
//               >
//                 <option value="active">Active</option>
//                 <option value="draft">Draft</option>
//                 <option value="approvalpending">Approval Pending</option>
//                 <option value="inactive">Inactive</option>
//               </select>
//             </div>

//             <div className="bg-white p-6 rounded-lg shadow-sm custom-border-1">
//               <h3 className="text-black title-4-semibold mb-4">
//                 Product Organization
//               </h3>
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-black title-4-semibold mb-2">
//                     Type <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative" ref={typeDropdownRef}>
//                     {/* Selected type display */}
//                     {(formData.has_variations ? commonAttributes.type : formData.type) && (
//                       <div className="mb-2">
//                         <div className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md flex items-center justify-between w-fit">
//                           <span className="text-xs">{formData.has_variations ? commonAttributes.type : formData.type}</span>
//                           {!isViewMode && (
//                             <button
//                               onClick={() => {
//                                 if (formData.has_variations) {
//                                   setCommonAttributes((prev) => ({ ...prev, type: "", brand: "" }));
//                                 } else {
//                                   setFormData((prev) => ({ ...prev, type: "", brand: "" }));
//                                 }
//                                 setTypeSearchTerm("");
//                                 setBrandSearchTerm("");
//                                 setShowBrandDropdown(false);
//                               }}
//                               className="ml-1 text-blue-800 hover:text-blue-900"
//                             >
//                               <FontAwesomeIcon
//                                 icon={faTimes}
//                                 className="h-3 w-3"
//                               />
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     )}

//                     {/* Type input field with search icon */}
//                     <div className="relative">
//                       <div className="flex items-center w-full custom-border-3 rounded-md overflow-hidden">
//                         <FontAwesomeIcon
//                           icon={faSearch}
//                           className="text-gray-400 ml-2"
//                         />
//                         <input
//                           type="text"
//                           value={typeSearchTerm}
//                           onChange={(e) => {
//                             setTypeSearchTerm(e.target.value);
//                             if (!showTypeDropdown && e.target.value)
//                               setShowTypeDropdown(true);
//                           }}
//                           onFocus={() => {
//                             if (productTypes.length > 0) 
//                               setShowTypeDropdown(true);
//                           }}
//                           placeholder="Search product types..."
//                           className="w-full ml-2 bg-transparent small focus:outline-none"
//                           disabled={isViewMode}
//                         />
//                       </div>

//                       {/* Dropdown for types */}
//                       {showTypeDropdown && (
//                         <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
//                           {isLoadingProductTypes ? (
//                             <div className="p-2 text-center text-sm text-gray-500">
//                               Loading product types...
//                             </div>
//                           ) : (() => {
//                             const filteredTypes = productTypes.filter((pt) =>
//                               pt.name.toLowerCase().includes(typeSearchTerm.toLowerCase())
//                             );
                            
//                             return filteredTypes.length > 0 ? (
//                               filteredTypes.map((pt) => (
//                                 <div
//                                   key={pt.id}
//                                   className="p-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
//                                   onClick={() => {
//                                     // Mark that user manually changed the type
//                                     isTypeManuallyChangedRef.current = true;
                                    
//                                     if (formData.has_variations) {
//                                       setCommonAttributes((prev) => ({ ...prev, type: pt.name }));
//                                     } else {
//                                       setFormData((prev) => ({ ...prev, type: pt.name }));
//                                     }
//                                     setTypeSearchTerm("");
//                                     setShowTypeDropdown(false);
//                                   }}
//                                 >
//                                   {pt.name}
//                                 </div>
//                               ))
//                             ) : (
//                               <div className="p-2 text-center text-sm text-gray-500">
//                                 No product types found
//                               </div>
//                             );
//                           })()}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-black title-4-semibold mb-2">
//                     Brand
//                   </label>
//                   <div className="relative" ref={brandDropdownRef}>
//                     {/* Selected brand display */}
//                     {(formData.has_variations ? commonAttributes.brand : formData.brand) && (
//                       <div className="mb-2">
//                         <div className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md flex items-center justify-between w-fit">
//                           <span className="text-xs">{formData.has_variations ? commonAttributes.brand : formData.brand}</span>
//                           {!isViewMode && (
//                             <button
//                               onClick={() => {
//                                 if (formData.has_variations) {
//                                   setCommonAttributes((prev) => ({ ...prev, brand: "" }));
//                                 } else {
//                                   setFormData((prev) => ({ ...prev, brand: "" }));
//                                 }
//                                 setBrandSearchTerm("");
//                               }}
//                               className="ml-1 text-blue-800 hover:text-blue-900"
//                             >
//                               <FontAwesomeIcon
//                                 icon={faTimes}
//                                 className="h-3 w-3"
//                               />
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     )}

//                     {/* Brand input field with search icon */}
//                     <div className="relative">
//                       <div className="flex items-center w-full custom-border-3 rounded-md overflow-hidden">
//                         <FontAwesomeIcon
//                           icon={faSearch}
//                           className="text-gray-400 ml-2"
//                         />
//                         <input
//                           type="text"
//                           value={brandSearchTerm}
//                           onChange={(e) => {
//                             const currentType = formData.has_variations ? commonAttributes.type : formData.type;
//                             if (currentType) {
//                               setBrandSearchTerm(e.target.value);
//                               if (!showBrandDropdown && e.target.value)
//                                 setShowBrandDropdown(true);
//                             }
//                           }}
//                           onFocus={() => {
//                             const currentType = formData.has_variations ? commonAttributes.type : formData.type;
//                             if (currentType) {
//                               const availableBrands = getBrandsForProductTypeId(currentType);
//                               if (availableBrands.length > 0 || brands.length > 0) 
//                                 setShowBrandDropdown(true);
//                             }
//                           }}
//                           onBlur={() => {
//                             setTimeout(() => setShowBrandDropdown(false), 200);
//                           }}
//                           placeholder={
//                             (formData.has_variations ? !commonAttributes.type : !formData.type)
//                               ? "Select Type First" 
//                               : "Search brands..."
//                           }
//                           className="w-full ml-2 bg-transparent small focus:outline-none"
//                           disabled={isViewMode || (formData.has_variations ? !commonAttributes.type : !formData.type)}
//                         />
//                       </div>

//                       {/* Dropdown for brands */}
//                       {showBrandDropdown && (
//                         <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
//                           {isLoadingBrands ? (
//                             <div className="p-2 text-center text-sm text-gray-500">
//                               Loading brands...
//                             </div>
//                           ) : (() => {
//                             const currentType = formData.has_variations ? commonAttributes.type : formData.type;
//                             const currentBrand = formData.has_variations ? commonAttributes.brand : formData.brand;
                            
//                             // If type is selected, get brands for that type, otherwise show all brands
//                             const availableBrands = currentType 
//                               ? getBrandsForProductTypeId(currentType)
//                               : brands.flatMap(b => b.ProductTypes ? [{ id: b.id, name: b.name }] : []);
                            
//                             // Filter brands by search term
//                             let filteredBrands = availableBrands.filter((brand) =>
//                               brand.name.toLowerCase().includes(brandSearchTerm.toLowerCase())
//                             );
                            
//                             // Always include the currently selected brand if it's not in the filtered list
//                             if (currentBrand && !filteredBrands.some(b => b.name === currentBrand)) {
//                               filteredBrands = [
//                                 { id: currentBrand, name: currentBrand },
//                                 ...filteredBrands
//                               ];
//                             }
                            
//                             return filteredBrands.length > 0 ? (
//                               filteredBrands.map((brand) => (
//                                 <div
//                                   key={brand.id}
//                                   className="p-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
//                                   onClick={() => {
//                                     if (formData.has_variations) {
//                                       setCommonAttributes((prev) => ({ ...prev, brand: brand.name }));
//                                     } else {
//                                       setFormData((prev) => ({ ...prev, brand: brand.name }));
//                                     }
//                                     setBrandSearchTerm("");
//                                     setShowBrandDropdown(false);
//                                   }}
//                                 >
//                                   {brand.name}
//                                 </div>
//                               ))
//                             ) : (
//                               <div className="p-2 text-center text-sm text-gray-500">
//                                 No brands found
//                               </div>
//                             );
//                           })()}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-black title-4-semibold mb-2">
//                     Categories
//                   </label>
//                   <CascadingCategorySelector
//                     superCategories={
//                       formData.has_variations
//                         ? commonAttributes.type
//                           ? superCategories.filter((sc) => {
//                               const superCatsForType = getSuperCategoriesForProductType(commonAttributes.type);
//                               return superCatsForType.some((sct) => sct.id === sc.id);
//                             })
//                           : superCategories
//                         : formData.type
//                         ? superCategories.filter((sc) => {
//                             const superCatsForType = getSuperCategoriesForProductType(formData.type);
//                             return superCatsForType.some((sct) => sct.id === sc.id);
//                           })
//                         : superCategories
//                     }
//                     selectedSubCategories={selectedSubCategories}
//                     onSelectSubCategories={(subCats) => {
//                       setSelectedSubCategories(subCats);
//                     }}
//                     isLoading={isLoadingCollections}
//                     disabled={isViewMode}
//                     isEditMode={isEditMode || isViewMode}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-black title-4-semibold mb-2">
//                     Tags
//                   </label>
//                   <div className="relative" ref={tagDropdownRef}>
//                     {/* Selected tags display */}
//                     <div className="flex flex-wrap gap-2 mb-2">
//                       {selectedTags.map((tag) => (
//                         <div
//                           key={tag.id}
//                           className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md flex items-center"
//                         >
//                           <span className="text-xs">{tag.name}</span>
//                           {!isViewMode && (
//                             <button
//                               onClick={() => handleRemoveTag(tag.id!)}
//                               className="ml-1 text-blue-800 hover:text-blue-900"
//                             >
//                               <FontAwesomeIcon
//                                 icon={faTimes}
//                                 className="h-3 w-3"
//                               />
//                             </button>
//                           )}
//                         </div>
//                       ))}
//                     </div>

//                     {/* Tag input field with search icon and + button */}
//                     <div className="relative">
//                       <div className="flex items-center w-full custom-border-3 rounded-md overflow-hidden">
//                         <FontAwesomeIcon
//                           icon={faSearch}
//                           className="text-gray-400"
//                         />
//                         <input
//                           type="text"
//                           value={tagSearchTerm}
//                           onChange={(e) => {
//                             setTagSearchTerm(e.target.value);
//                             if (!showTagDropdown && e.target.value)
//                               setShowTagDropdown(true);
//                           }}
//                           onFocus={() => {
//                             if (tags.length > 0) setShowTagDropdown(true);
//                           }}
//                           placeholder="Search tags..."
//                           className="w-full ml-2 bg-transparent small focus:outline-none"
//                           disabled={isViewMode}
//                         />
//                         {!isViewMode && (
//                           <button
//                             onClick={() => setShowTagModal(true)}
//                             className="pr-2 text-primary hover:text-primary-dark"
//                             title="Create new tag"
//                           >
//                             <FontAwesomeIcon
//                               icon={faPlus}
//                               className="h-4 w-4"
//                             />
//                           </button>
//                         )}
//                       </div>

//                       {/* Simple dropdown for existing tags */}
//                       {showTagDropdown && (
//                         <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
//                           {isLoadingTags ? (
//                             <div className="p-2 text-center text-sm text-gray-500">
//                               Loading tags...
//                             </div>
//                           ) : filteredTags.length > 0 ? (
//                             // Show filtered tags
//                             filteredTags.map((tag) => (
//                               <div
//                                 key={tag.id}
//                                 className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
//                                 onClick={() => handleSelectTag(tag)}
//                               >
//                                 {tag.name}
//                               </div>
//                             ))
//                           ) : (
//                             <div className="p-2 text-center text-sm text-gray-500">
//                               No tags available
//                             </div>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white p-6 rounded-lg shadow-sm custom-border-1">
//               <h3 className="text-black title-4-semibold mb-4">
//                 Vendor Details
//               </h3>
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-black title-4-semibold mb-2">
//                     Seller
//                   </label>
//                   <div className="relative" ref={sellerDropdownRef}>
//                     {/* Selected seller display */}
//                     {isViewMode ? (
//                       currentProductSeller ? (
//                         <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-md text-sm">
//                           {currentProductSeller.firm_name} (
//                           {currentProductSeller.email})
//                         </div>
//                       ) : (
//                         <div className="text-gray-500 text-sm">
//                           No seller assigned
//                         </div>
//                       )
//                     ) : (
//                       <>
//                         {selectedSellerId && (
//                           <div className="mb-2">
//                             {(() => {
//                               const selectedSeller = sellers.find(
//                                 (s) => s.id === selectedSellerId
//                               );
//                               return selectedSeller ? (
//                                 <div className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md flex items-center justify-between">
//                                   <span className="text-xs">
//                                     {selectedSeller.firmName} -{" "}
//                                     {selectedSeller.email}
//                                   </span>
//                                   <button
//                                     onClick={() => setSelectedSellerId("")}
//                                     className="ml-1 text-blue-800 hover:text-blue-900"
//                                   >
//                                     <FontAwesomeIcon
//                                       icon={faTimes}
//                                       className="h-3 w-3"
//                                     />
//                                   </button>
//                                 </div>
//                               ) : currentProductSeller ? (
//                                 <div className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md flex items-center justify-between">
//                                   <span className="text-xs">
//                                     {currentProductSeller.firm_name} -{" "}
//                                     {currentProductSeller.email}
//                                   </span>
//                                   <button
//                                     onClick={() => setSelectedSellerId("")}
//                                     className="ml-1 text-blue-800 hover:text-blue-900"
//                                   >
//                                     <FontAwesomeIcon
//                                       icon={faTimes}
//                                       className="h-3 w-3"
//                                     />
//                                   </button>
//                                 </div>
//                               ) : null;
//                             })()}
//                           </div>
//                         )}

//                         {/* Seller search input field */}
//                         <div className="relative">
//                           <div className="flex items-center w-full custom-border-3 rounded-md overflow-hidden">
//                             <FontAwesomeIcon
//                               icon={faSearch}
//                               className="text-gray-400"
//                             />
//                             <input
//                               type="text"
//                               value={sellerSearchTerm}
//                               onChange={(e) => {
//                                 setSellerSearchTerm(e.target.value);
//                                 if (!showSellerDropdown && e.target.value)
//                                   setShowSellerDropdown(true);
//                               }}
//                               onFocus={() => {
//                                 if (sellers.length > 0)
//                                   setShowSellerDropdown(true);
//                               }}
//                               placeholder="Search sellers..."
//                               className="w-full ml-2 bg-transparent small focus:outline-none"
//                             />
//                           </div>

//                           {/* Dropdown for sellers */}
//                           {showSellerDropdown && (
//                             <div
//                               className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
//                               ref={sellerDropdownRef}
//                             >
//                               {isLoadingSellers ? (
//                                 <div className="p-2 text-center text-sm text-gray-500">
//                                   Loading sellers...
//                                 </div>
//                               ) : sellers.filter(
//                                   (seller) =>
//                                     (seller.firmName || "")
//                                       .toLowerCase()
//                                       .includes(
//                                         sellerSearchTerm.toLowerCase()
//                                       ) ||
//                                     (seller.email || "")
//                                       .toLowerCase()
//                                       .includes(sellerSearchTerm.toLowerCase())
//                                 ).length > 0 ? (
//                                 sellers
//                                   .filter(
//                                     (seller) =>
//                                       (seller.firmName || "")
//                                         .toLowerCase()
//                                         .includes(
//                                           sellerSearchTerm.toLowerCase()
//                                         ) ||
//                                       (seller.email || "")
//                                         .toLowerCase()
//                                         .includes(
//                                           sellerSearchTerm.toLowerCase()
//                                         )
//                                   )
//                                   .map((seller) => (
//                                     <div
//                                       key={seller.id}
//                                       className="p-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100"
//                                       onClick={() => {
//                                         setSelectedSellerId(seller.id || "");
//                                         setSellerSearchTerm("");
//                                         setShowSellerDropdown(false);
//                                       }}
//                                     >
//                                       <div className="font-medium">
//                                         {seller.firmName}
//                                       </div>
//                                       <div className="text-gray-500 text-xs">
//                                         {seller.email}
//                                       </div>
//                                       <div className="text-gray-400 text-xs">
//                                         {seller.phoneNumber}
//                                       </div>
//                                     </div>
//                                   ))
//                               ) : (
//                                 <div className="p-2 text-center text-sm text-gray-500">
//                                   No sellers found
//                                 </div>
//                               )}
//                             </div>
//                           )}
//                         </div>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-black title-4-semibold mb-2">
//                   Margin Contribution
//                 </label>
//                 <div className="flex">
//                   {isViewMode ? (
//                     <div className="w-full p-2 custom-border-3 bg-blue-80 rounded-l-md small focus:outline-none bg-gray-100 cursor-not-allowed">
//                       {formData.margin_contribution}
//                     </div>
//                   ) : (
//                     <input
//                       type="text"
//                       inputMode="decimal"
//                       name="margin_contribution"
//                       value={formData.margin_contribution ? formData.margin_contribution : ""}
//                       onChange={handleInputChange}
//                       onKeyDown={handleNumberKeyDown}
//                       className="w-full p-2 custom-border-3 bg-blue-80 rounded-l-md small focus:outline-none"
//                       disabled={isViewMode}
//                     />
//                   )}
//                   <div className="p-2 border-y-2 border-r-2 border-gray-line bg-blue-80 rounded-r-md small focus:outline-none">
//                     %
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function AddProductPage() {
//   return (
//     <Suspense fallback={<div>Loading...</div>}>
//       <AddProductPageContent />
//     </Suspense>
//   );
// }
