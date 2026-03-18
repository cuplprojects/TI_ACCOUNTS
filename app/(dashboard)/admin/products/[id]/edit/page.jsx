'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import LeftPanel from '../../addproduct/components/LeftPanel';
import RightPanel from '../../addproduct/components/RightPanel';
import { validateNonVariantProduct, validateVariantProduct, formatValidationErrors } from '../../addproduct/components/validation';
import { updateProduct, updateProductWithVariants, getProduct, approveProduct } from '@/app/lib/services/admin/productService';
import { useRouter, useParams } from 'next/navigation';
import { showErrorMessage, showSuccessMessage } from '@/app/lib/swalConfig';

export default function EditProductPage() {
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

          // Convert API variant data to UI format with all required fields
          const uiVariants = variants.variant_products.map((vp) => ({
            id: vp.id || `variant_${Date.now()}_${Math.random()}`,
            option_values: vp.option_values || {},
            price: vp.seller_price || vp.price || 0,
            compare_price: vp.compare_price || 0,
            sku: vp.sku || '',
            barcode: vp.barcode || '',
            inventory_quantity: vp.stock_qty || 0,
            stock_qty: vp.stock_qty || 0,
            enabled: true,
            weight: vp.weight || 0,
            length: vp.length || 0,
            breadth: vp.breadth || 0,
            height: vp.height || 0,
            is_tracking_inventory: vp.is_tracking_inventory !== false,
            sell_out_of_stock: vp.sell_out_of_stock || false,
            cost_per_item: vp.cost_per_item || 0,
            images: [],
            image_urls: (vp.image_urls || []).map((img, idx) => ({
              ...img,
              position: idx,
            })),
            // Add common fields from commonAttributes
            title: commonAttrs.title || '',
            description: commonAttrs.description || '',
            short_description: commonAttrs.short_description || '',
            page_title: commonAttrs.page_title || '',
            page_description: commonAttrs.page_description || '',
            page_url: commonAttrs.page_url || '',
            type: commonAttrs.type || '',
            brand: commonAttrs.brand || '',
            status: commonAttrs.status || 'active',
            physical_product: commonAttrs.physical_product ?? false,
            margin_contribution: product.margin_contribution || 0,
            region_of_origin: product.region_of_origin || 'India',
            hs_code: product.hs_code || '',
            gst_percent: product.gst_percent || '',
          }));

          // Ensure variation_options have the correct structure
          const formattedVariationOptions = (variants.variation_options || []).map((opt) => ({
            id: opt.id || `id_${Math.random().toString(36).substr(2, 9)}`,
            name: opt.name || '',
            values: Array.isArray(opt.values) ? opt.values : [],
          }));

          // Use a single setState call to batch updates and prevent multiple re-renders
          setFormData((prev) => ({
            ...prev,
            has_variations: true,
            variation_options: formattedVariationOptions,
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
            // Add parent category info for extraction
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    if (formData.has_variations) {
      setCommonAttributes((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    }

    if (name === 'physical_product') {
      setIsPhysicalProduct(newValue);
    }
  };

  const handleEditorChange = (value) => {
    if (formData.has_variations) {
      setCommonAttributes((prev) => ({
        ...prev,
        description: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        description: value,
      }));
    }
  };

  const handleVariationsChange = useCallback((hasVariations, options, variants) => {
    setFormData((currentFormData) => {
      if (hasVariations && !currentFormData.has_variations) {
        setCommonAttributes({
          title: currentFormData.title || '',
          short_description: currentFormData.short_description || '',
          description: currentFormData.description || '',
          brand: currentFormData.brand || '',
          type: currentFormData.type || '',
          page_title: currentFormData.page_title || '',
          page_description: currentFormData.page_description || '',
          page_url: currentFormData.page_url || '',
          status: currentFormData.status || 'active',
          gst_percent: currentFormData.gst_percent || '',
          region_of_origin: currentFormData.region_of_origin || 'India',
          hs_code: currentFormData.hs_code || '',
          margin_contribution: currentFormData.margin_contribution || 0,
        });

        setImages([]);

        return {
          ...currentFormData,
          has_variations: true,
          variation_options: options,
          variants: variants,
        };
      } else if (!hasVariations && currentFormData.has_variations) {
        // When switching back to non-variant, use current formData state
        const restoredFormData = {
          ...currentFormData,
          has_variations: false,
          variation_options: [],
          variants: [],
        };

        return restoredFormData;
      } else {
        return {
          ...currentFormData,
          has_variations: hasVariations,
          variation_options: options,
          variants: variants,
        };
      }
    });
  }, []);

  const handleSaveProduct = () => {
    // Validate seller is selected
    if (!selectedSeller || selectedSeller.trim() === '') {
      showErrorMessage('Please select a seller before updating the product');
      return;
    }

    let editorContent = '';
    if (editorRef.current && editorRef.current.getContent) {
      editorContent = editorRef.current.getContent();
    }

    const updatedFormData = formData.has_variations 
      ? { ...commonAttributes, description: editorContent }
      : { ...formData, description: editorContent };

    let errors = [];

    if (formData.has_variations) {
      errors = validateVariantProduct(
        updatedFormData,
        formData.variation_options || [],
        formData.variants || [],
        selectedTags,
        selectedCategories,
        existingImages,
        images,
        selectedSeller
      );
    } else {
      errors = validateNonVariantProduct(
        updatedFormData,
        selectedTags,
        selectedCategories,
        existingImages,
        images,
        selectedSeller
      );
    }

    if (errors.length > 0) {
      const errorList = errors.map((error) => `• ${error}`).join('<br>');
      showErrorMessage(`<div style="text-align: left;"><strong>Validation Errors:</strong><br><br>${errorList}</div>`);
      return;
    }

    if (images.length > 0) {
      uploadAndSaveProduct(updatedFormData);
    } else {
      saveProduct(updatedFormData);
    }
  };

  const extractS3Key = (url) => {
    if (!url) return 'image.jpg';
    const urlParts = url.split('amazonaws.com/');
    return urlParts.length > 1 ? urlParts[1] : url.split('/').pop() || 'image.jpg';
  };

  const uploadAndSaveProduct = async (updatedFormData) => {
    try {
      const { uploadImagesWithPresignedUrls } = await import('@/app/lib/services/presignedUrlService');
      
      const uploadedImages = await uploadImagesWithPresignedUrls(images, 'products/temp', 'admin');

      if (uploadedImages && uploadedImages.length > 0) {
        const allImages = [
          ...existingImages.map((img) => ({
            key: img.key || extractS3Key(img.url),
            originalName: img.originalName || 'image.jpg',
            url: img.url,
          })),
          ...uploadedImages.map((img) => ({
            key: img.key,
            originalName: img.originalName,
            url: img.url,
          })),
        ];

        if (formData.has_variations) {
          const payload = getVariantPayload(updatedFormData, allImages);
          const success = await updateProductWithVariants(productId, payload, enableHSNValidator);
          if (success) {
            router.push('/admin/products');
          }
        } else {
          const payload = getNonVariantPayload(updatedFormData, allImages);
          const success = await updateProduct(productId, payload, undefined, enableHSNValidator);
          if (success) {
            router.push('/admin/products');
          }
        }
      }
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const saveProduct = async (updatedFormData) => {
    try {
      if (formData.has_variations) {
        const payload = getVariantPayload(updatedFormData);
        const success = await updateProductWithVariants(productId, payload, enableHSNValidator);
        if (success) {
          router.push('/admin/products');
        }
      } else {
        const existingImageObjects = existingImages.map((img) => ({
          key: img.key || extractS3Key(img.url),
          originalName: img.originalName || 'image.jpg',
          url: img.url,
        }));
        const payload = getNonVariantPayload(updatedFormData, existingImageObjects);
        const success = await updateProduct(productId, payload, undefined, enableHSNValidator);
        if (success) {
          router.push('/admin/products');
        }
      }
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const getNonVariantPayload = (data, imageUrls) => {
    return {
      title: data.title,
      short_description: data.short_description,
      description: data.description,
      price: parseFloat(data.price) || 0,
      compare_price: parseFloat(data.compare_price) || 0,
      cost_per_item: parseFloat(data.cost_per_item) || 0,
      physical_product: data.physical_product,
      is_tracking_inventory: data.is_tracking_inventory,
      stock_qty: parseInt(data.stock_qty) || 0,
      sell_out_of_stock: data.sell_out_of_stock,
      sku: data.sku,
      barcode: data.barcode || undefined,
      weight: parseFloat(data.weight) || 0,
      length: parseFloat(data.length) || 0,
      breadth: parseFloat(data.breadth) || 0,
      height: parseFloat(data.height) || 0,
      region_of_origin: data.region_of_origin,
      hs_code: data.hs_code,
      page_title: data.page_title,
      page_description: data.page_description,
      page_url: data.page_url,
      type: data.type,
      brand: data.brand,
      margin_contribution: parseFloat(data.margin_contribution) || 0,
      gst_percent: parseFloat(data.gst_percent) || 0,
      status: data.status,
      collections: selectedCategories.map((c) => c.id),
      tags: selectedTags.map((t) => t.id),
      seller_id: selectedSeller,
      image_urls: imageUrls || [],
    };
  };

  const getVariantPayload = (data, imageUrls) => {
    let finalImageUrls = [];
    
    if (imageUrls && imageUrls.length > 0) {
      finalImageUrls = imageUrls;
    } else if (existingImages && existingImages.length > 0) {
      finalImageUrls = existingImages.map((img) => ({
        key: img.key || extractS3Key(img.url),
        originalName: img.originalName || 'image.jpg',
      }));
    }

    // Convert variant products with proper numeric conversions
    const convertedVariants = (formData.variants || []).map((variant) => ({
      ...variant,
      price: parseFloat(variant.price) || 0,
      compare_price: parseFloat(variant.compare_price) || 0,
      cost_per_item: parseFloat(variant.cost_per_item) || 0,
      stock_qty: parseInt(variant.stock_qty) || 0,
      inventory_quantity: parseInt(variant.inventory_quantity) || 0,
      weight: parseFloat(variant.weight) || 0,
      length: parseFloat(variant.length) || 0,
      breadth: parseFloat(variant.breadth) || 0,
      height: parseFloat(variant.height) || 0,
      // Ensure image_urls are included with their positions - sorted by position
      image_urls: variant.image_urls && Array.isArray(variant.image_urls) 
        ? variant.image_urls
            .sort((a, b) => (a.position || 0) - (b.position || 0))
            .map((img, idx) => ({
              ...img,
              position: idx,
            }))
        : [],
    }));

    return {
      common_attributes: {
        title: data.title,
        short_description: data.short_description,
        description: data.description,
        region_of_origin: data.region_of_origin,
        hs_code: data.hs_code,
        page_title: data.page_title,
        page_description: data.page_description,
        page_url: data.page_url,
        type: data.type,
        brand: data.brand,
        margin_contribution: parseFloat(data.margin_contribution) || 0,
        gst_percent: parseFloat(data.gst_percent) || 0,
        status: data.status,
        default_image_urls: finalImageUrls,
        tags: selectedTags.map((t) => t.id),
        collections: selectedCategories.map((c) => c.id),
      },
      variation_options: formData.variation_options || [],
      variant_products: convertedVariants,
      sub_category_id: selectedCategories[0]?.id || undefined,
      seller_id: selectedSeller,
    };
  }

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
            <span className="display-4-bold">Edit Product</span>
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
          <span className="display-4-bold">Edit Product</span>
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
          <button onClick={handleSaveProduct} className="px-4 py-2 bg-primary text-white rounded-md small-semibold">
            Update Product
          </button>
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
          setIsPhysicalProduct={setIsPhysicalProduct}
          enableHSNValidator={enableHSNValidator}
          setEnableHSNValidator={setEnableHSNValidator}
          images={images}
          setImages={setImages}
          existingImages={existingImages}
          setExistingImages={setExistingImages}
        />

        <RightPanel
          formData={formData}
          commonAttributes={commonAttributes}
          handleInputChange={handleInputChange}
          selectedSeller={selectedSeller}
          setSelectedSeller={setSelectedSeller}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          setFormData={setFormData}
          setCommonAttributes={setCommonAttributes}
        />
      </div>
    </div>
  );
}
