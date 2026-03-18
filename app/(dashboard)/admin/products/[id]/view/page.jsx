'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import LeftPanel from '../../addproduct/components/LeftPanel';
import RightPanel from '../../addproduct/components/RightPanel';
import { getProduct, approveProduct } from '@/app/lib/services/admin/productService';
import { useRouter, useParams } from 'next/navigation';

export default function ViewProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [product, setProduct] = useState(null);

  // Form state for non-variant products
  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    description: '',
    price: 0,
    compare_price: 0,
    cost_per_item: 0,
    physical_product: true,
    is_tracking_inventory: true,
    stock_qty: 0,
    sell_out_of_stock: false,
    sku: '',
    barcode: '',
    weight: 0,
    length: 0,
    breadth: 0,
    height: 0,
    region_of_origin: 'India',
    hs_code: '',
    page_title: '',
    page_description: '',
    page_url: '',
    type: '',
    brand: '',
    margin_contribution: 0,
    gst_percent: '',
    status: 'active',
    has_barcode: false,
    has_variations: false,
    profit: 0,
    margin: 0,
  });

  // Form state for variant products
  const [commonAttributes, setCommonAttributes] = useState({
    title: '',
    short_description: '',
    description: '',
    region_of_origin: 'India',
    hs_code: '',
    page_title: '',
    page_description: '',
    page_url: '',
    type: '',
    brand: '',
    margin_contribution: 0,
    gst_percent: '',
    status: 'active',
  });

  // Images state
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  // UI state
  const [isPhysicalProduct, setIsPhysicalProduct] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [enableHSNValidator, setEnableHSNValidator] = useState(false);
  const editorRef = React.useRef(null);

  // Load product data on mount
  useEffect(() => {
    const loadProductData = async () => {
      try {
        setIsLoading(true);
        const product = await getProduct(productId);
        
        if (!product) {
          setLoadError('Product not found');
          return;
        }

        console.log('Loaded product:', product);

        setProduct(product);

        // Determine if it's a variant product
        const isVariantProduct = product.has_variant && 
          product.variants && 
          product.variants.variation_options !== null &&
          Array.isArray(product.variants.variation_options) &&
          product.variants.variation_options.length > 0;

        if (isVariantProduct) {
          // Load variant product data
          const variants = product.variants;
          const commonAttrs = variants.common_attributes;

          setCommonAttributes({
            title: commonAttrs.title || '',
            short_description: commonAttrs.short_description || '',
            description: commonAttrs.description || '',
            brand: commonAttrs.brand || '',
            type: commonAttrs.type || '',
            page_title: commonAttrs.page_title || '',
            page_description: commonAttrs.page_description || '',
            page_url: commonAttrs.page_url || '',
            status: commonAttrs.status || 'active',
            gst_percent: commonAttrs.gst_percent !== undefined && commonAttrs.gst_percent !== null ? commonAttrs.gst_percent : (product.gst_percent !== undefined && product.gst_percent !== null ? product.gst_percent : ''),
            region_of_origin: commonAttrs.region_of_origin || product.region_of_origin || 'India',
            hs_code: commonAttrs.hs_code || product.hs_code || '',
            margin_contribution: commonAttrs.margin_contribution || product.margin_contribution || 0,
          });

          setIsPhysicalProduct(commonAttrs.physical_product ?? false);

          // Convert API variant data to UI format
          const uiVariants = variants.variant_products.map((vp) => ({
            id: vp.id || `variant_${Date.now()}_${Math.random()}`,
            option_values: vp.option_values,
            price: vp.seller_price || vp.price,
            compare_price: vp.compare_price,
            sku: vp.sku,
            barcode: vp.barcode || '',
            inventory_quantity: vp.stock_qty,
            stock_qty: vp.stock_qty,
            enabled: true,
            weight: vp.weight,
            length: vp.length,
            breadth: vp.breadth,
            height: vp.height,
            is_tracking_inventory: vp.is_tracking_inventory,
            sell_out_of_stock: vp.sell_out_of_stock,
            cost_per_item: vp.cost_per_item,
            images: [],
            image_urls: vp.image_urls || [],
          }));

          setFormData((prev) => ({
            ...prev,
            has_variations: true,
            variation_options: variants.variation_options,
            variants: uiVariants,
          }));

          // Handle common/default images for variant products
          if (variants.common_attributes.default_image_urls && 
              Array.isArray(variants.common_attributes.default_image_urls) && 
              variants.common_attributes.default_image_urls.length > 0) {
            const formattedImages = variants.common_attributes.default_image_urls.map((img, index) => {
              const url = img.url || (img.key ? `https://totallyassets.s3.ap-south-1.amazonaws.com/${img.key}` : '');
              return {
                url: url,
                position: img.position || index,
                key: img.key,
                originalName: img.originalName,
              };
            });
            setExistingImages(formattedImages);
          }
        } else {
          // Load non-variant product data
          let productImageUrls = product.image_urls || [];
          let productData = { ...product };

          // Extract data from variants if available
          if (product.has_variant && product.variants && 
              product.variants.variant_products && 
              Array.isArray(product.variants.variant_products) && 
              product.variants.variant_products.length > 0) {
            
            const firstVariant = product.variants.variant_products[0];
            productData = {
              ...productData,
              price: firstVariant.seller_price || firstVariant.price,
              compare_price: firstVariant.compare_price,
              cost_per_item: firstVariant.cost_per_item,
              physical_product: firstVariant.physical_product || false,
              is_tracking_inventory: firstVariant.is_tracking_inventory,
              stock_qty: firstVariant.stock_qty,
              sell_out_of_stock: firstVariant.sell_out_of_stock,
              sku: firstVariant.sku,
              barcode: firstVariant.barcode,
              weight: firstVariant.weight,
              length: firstVariant.length,
              breadth: firstVariant.breadth,
              height: firstVariant.height,
            };

            if (firstVariant.image_urls && Array.isArray(firstVariant.image_urls) && firstVariant.image_urls.length > 0) {
              productImageUrls = firstVariant.image_urls;
            }
          }

          // Set existing images
          if (productImageUrls.length > 0) {
            const formattedImages = productImageUrls.map((img, index) => {
              const url = img.url || (img.key ? `https://totallyassets.s3.ap-south-1.amazonaws.com/${img.key}` : '');
              return {
                url: url,
                position: img.position || index,
                key: img.key,
                originalName: img.originalName,
              };
            });
            setExistingImages(formattedImages);
          }

          // Map product data to form state
          setFormData((prev) => ({
            ...prev,
            title: productData.title || '',
            short_description: productData.short_description || '',
            description: productData.description || '',
            price: productData.seller_price || productData.price || 0,
            compare_price: productData.compare_price || 0,
            cost_per_item: productData.cost_per_item || 0,
            physical_product: productData.physical_product,
            is_tracking_inventory: productData.is_tracking_inventory,
            stock_qty: productData.stock_qty || 0,
            sell_out_of_stock: productData.sell_out_of_stock || false,
            sku: productData.sku || '',
            barcode: productData.barcode || '',
            weight: productData.weight || 0,
            length: productData.length || 0,
            breadth: productData.breadth || 0,
            height: productData.height || 0,
            page_title: productData.page_title || '',
            page_description: productData.page_description || '',
            page_url: productData.page_url || '',
            type: productData.type || '',
            brand: productData.brand || '',
            status: productData.status || 'active',
            has_barcode: !!productData.barcode,
            has_variations: false,
            profit: 0,
            margin: 0,
            region_of_origin: productData.region_of_origin || 'India',
            hs_code: productData.hs_code || '',
            gst_percent: productData.gst_percent !== undefined && productData.gst_percent !== null ? productData.gst_percent : '',
            margin_contribution: productData.margin_contribution || 0,
          }));

          setIsPhysicalProduct(productData.physical_product ?? false);
        }

        // Set seller ID
        if (product.seller_id) {
          setSelectedSeller(product.seller_id);
        }

        // Set tags
        if (product.Tags && Array.isArray(product.Tags)) {
          setSelectedTags(product.Tags.map((tag) => ({
            id: tag.id,
            name: tag.name,
          })));
        }

        // Set categories - use Collections to get correct parent category for each sub-category
        if (product.Collections && Array.isArray(product.Collections) && product.Collections.length > 0) {
          // Filter to only include sub-categories (not categories or super-categories)
          const subCategories = product.Collections.filter(col => col.category_type === 'sub-category');
          
          if (subCategories.length > 0) {
            setSelectedCategories(subCategories.map((col) => ({
              id: col.id,
              title: col.title,
              category_type: col.category_type,
              Category: col.Category,
              SuperCategory: col.SuperCategory,
            })));
          }
        } else if (product.category_hierarchy && product.category_hierarchy.subCategories) {
          // Fallback to category_hierarchy if Collections not available
          setSelectedCategories(product.category_hierarchy.subCategories.map((cat) => ({
            id: cat.id,
            title: cat.title,
            category_type: cat.category_type,
            Category: product.category_hierarchy.categories && product.category_hierarchy.categories.length > 0 
              ? product.category_hierarchy.categories[0] 
              : null,
            SuperCategory: product.category_hierarchy.superCategories && product.category_hierarchy.superCategories.length > 0 
              ? product.category_hierarchy.superCategories[0] 
              : null,
          })));
        }
      } catch (error) {
        console.error('Failed to load product:', error);
        setLoadError('Failed to load product data');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      loadProductData();
    }
  }, [productId]);

  // Read-only handlers - do nothing
  const handleInputChange = () => {};
  const handleEditorChange = () => {};
  const handleVariationsChange = () => {};

  if (isLoading) {
    return (
      <div className="main-container">
        <div className="flex items-center justify-center h-96">
          <span className="text-lg">Loading product...</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="main-container">
        <div className="flex items-center justify-between mb-6">
          <Link href="/admin/products" className="flex items-center text-black">
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
            <span className="display-4-bold">View Product</span>
          </Link>
        </div>
        <div className="text-red-600 text-center py-8">{loadError}</div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/products" className="flex items-center text-black">
          <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
          <span className="display-4-bold">View Product</span>
        </Link>
        <div className="flex gap-2">
          {product?.status === 'approvalpending' && (
            <button
              onClick={async () => {
                const success = await approveProduct(productId);
                if (success) {
                  router.push('/admin/products');
                }
              }}
              className="px-4 py-2 border-2 rounded-md small-semibold"
              style={{
                backgroundColor: 'transparent',
                borderColor: '#00478f',
                color: '#00478f',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#00478f';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#00478f';
              }}
            >
              Approve Product
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LeftPanel
          formData={formData}
          commonAttributes={commonAttributes}
          handleInputChange={handleInputChange}
          handleEditorChange={handleEditorChange}
          handleVariationsChange={handleVariationsChange}
          editorRef={editorRef}
          isPhysicalProduct={isPhysicalProduct}
          setIsPhysicalProduct={() => {}}
          enableHSNValidator={enableHSNValidator}
          setEnableHSNValidator={() => {}}
          images={images}
          setImages={() => {}}
          existingImages={existingImages}
          setExistingImages={() => {}}
          isViewMode={true}
        />

        <RightPanel
          formData={formData}
          commonAttributes={commonAttributes}
          handleInputChange={handleInputChange}
          selectedSeller={selectedSeller}
          setSelectedSeller={() => {}}
          selectedTags={selectedTags}
          setSelectedTags={() => {}}
          selectedCategories={selectedCategories}
          setSelectedCategories={() => {}}
          setFormData={() => {}}
          setCommonAttributes={() => {}}
          isViewMode={true}
        />
      </div>
    </div>
  );
}
