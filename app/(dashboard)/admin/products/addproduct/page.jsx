'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import { validateNonVariantProduct, validateVariantProduct, formatValidationErrors } from './components/validation';
import { createProduct, createProductWithVariants } from '@/app/lib/services/admin/productService';
import { useRouter } from 'next/navigation';
import { showErrorMessage } from '@/app/lib/swalConfig';
import { useUnsavedChanges } from '@/app/hooks/useUnsavedChanges';

export default function AddProductPage() {
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
  const [hasChanges, setHasChanges] = useState(false);
  const editorRef = React.useRef(null);
  const router = useRouter();
  const { confirmNavigation } = useUnsavedChanges(hasChanges);

  // Check if form has actual changes
  const checkFormChanges = useCallback(() => {
    const hasFormData = formData.has_variations
      ? Object.values(commonAttributes).some(val => val !== '' && val !== 0 && val !== 'active' && val !== 'India')
      : Object.values(formData).some(val => val !== '' && val !== 0 && val !== true && val !== false && val !== 'active' && val !== 'India');
    
    const hasImages = images.length > 0 || existingImages.length > 0;
    const hasTags = selectedTags.length > 0;
    const hasCategories = selectedCategories.length > 0;
    
    return hasFormData || hasImages || hasTags || hasCategories;
  }, [formData, commonAttributes, images, existingImages, selectedTags, selectedCategories]);

  // Update hasChanges whenever form data changes
  useEffect(() => {
    setHasChanges(checkFormChanges());
  }, [checkFormChanges]);

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
        // Switching to variant mode - move current form data to common attributes
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

        // Keep images in both states - sync non-variant images to variant common images
        // Images stay in setImages for variant common images

        return {
          ...currentFormData,
          has_variations: true,
          variation_options: options,
          variants: variants,
        };
      } else if (!hasVariations && currentFormData.has_variations) {
        // Switching back to normal mode - keep images synced
        // Images remain in setImages and setExistingImages
        const restoredFormData = {
          ...currentFormData,
          has_variations: false,
          variation_options: [],
          variants: [],
        };

        return restoredFormData;
      } else {
        // Just updating variants or normal mode
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
      showErrorMessage('Please select a seller before creating a product');
      return;
    }

    // Get editor content directly
    let editorContent = '';
    if (editorRef.current && editorRef.current.getContent) {
      editorContent = editorRef.current.getContent();
    }

    // Create updated data objects with editor content
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

    // Upload images if there are new images
    if (images.length > 0) {
      uploadAndSaveProduct(updatedFormData);
    } else {
      saveProduct(updatedFormData);
    }
  };

  const uploadAndSaveProduct = async (updatedFormData) => {
    try {
      console.log('[uploadAndSaveProduct] selectedSeller:', selectedSeller);
      const { uploadImagesWithPresignedUrls } = await import('@/app/lib/services/presignedUrlService');
      
      // Collect all images to upload: common images + variant images
      const allFilesToUpload = [...images];
      const variantImageMap = {}; // Track which files belong to which variant
      
      if (formData.has_variations && formData.variants) {
        formData.variants.forEach((variant) => {
          if (variant.images && variant.images.length > 0) {
            variant.images.forEach((file) => {
              allFilesToUpload.push(file);
              if (!variantImageMap[variant.id]) {
                variantImageMap[variant.id] = [];
              }
              variantImageMap[variant.id].push(file);
            });
          }
        });
      }

      if (allFilesToUpload.length === 0) {
        // No images to upload, just save
        await saveProduct(updatedFormData);
        return;
      }

      // Upload all images at once
      const uploadedImages = await uploadImagesWithPresignedUrls(allFilesToUpload, 'products/temp', 'admin');

      if (uploadedImages && uploadedImages.length > 0) {
        // Separate uploaded images into common and variant images
        let commonUploadedImages = [];
        let variantUploadedImages = {};
        let uploadIndex = 0;

        // First, add common images
        commonUploadedImages = uploadedImages.slice(0, images.length);
        uploadIndex = images.length;

        // Then, add variant images
        if (formData.has_variations && formData.variants) {
          formData.variants.forEach((variant) => {
            if (variant.images && variant.images.length > 0) {
              variantUploadedImages[variant.id] = uploadedImages.slice(
                uploadIndex,
                uploadIndex + variant.images.length
              );
              uploadIndex += variant.images.length;
            }
          });
        }

        // Combine existing and newly uploaded common images
        const allCommonImages = [
          ...existingImages.map((img) => ({
            key: img.key || extractS3Key(img.url),
            originalName: img.originalName || 'image.jpg',
            url: img.url,
          })),
          ...commonUploadedImages.map((img) => ({
            key: img.key,
            originalName: img.originalName,
            url: img.url,
          })),
        ];

        if (formData.has_variations) {
          // Update variants with their uploaded images
          const updatedVariants = formData.variants.map((variant) => {
            const uploadedVariantImages = variantUploadedImages[variant.id] || [];
            const newImageUrls = uploadedVariantImages.map((img, idx) => ({
              key: img.key,
              originalName: img.originalName,
              url: img.url,
              position: (variant.image_urls?.length || 0) + idx,
            }));

            return {
              ...variant,
              image_urls: [
                ...(variant.image_urls || []),
                ...newImageUrls,
              ],
              images: [], // Clear the images array after upload
            };
          });

          const payload = getVariantPayload(
            updatedFormData,
            allCommonImages,
            updatedVariants
          );
          console.log('[uploadAndSaveProduct] Variant payload:', payload);
          const success = await createProductWithVariants(selectedSeller, payload, enableHSNValidator);
          if (success) {
            setHasChanges(false);
            router.push('/admin/products');
          }
        } else {
          const payload = getNonVariantPayload(updatedFormData, allCommonImages);
          const success = await createProduct(selectedSeller, payload, undefined, enableHSNValidator);
          if (success) {
            setHasChanges(false);
            router.push('/admin/products');
          }
        }
      }
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  // Helper function to extract S3 key from URL
  const extractS3Key = (url) => {
    if (!url) return 'image.jpg';
    const urlParts = url.split('amazonaws.com/');
    return urlParts.length > 1 ? urlParts[1] : url.split('/').pop() || 'image.jpg';
  };

  const saveProduct = async (updatedFormData) => {
    try {
      if (formData.has_variations) {
        const payload = getVariantPayload(updatedFormData, undefined, formData.variants);
        const success = await createProductWithVariants(selectedSeller, payload, enableHSNValidator);
        if (success) {
          setHasChanges(false);
          router.push('/admin/products');
        }
      } else {
        // For non-variant products, pass existing images with key and originalName
        const existingImageObjects = existingImages.map((img) => ({
          key: img.key || extractS3Key(img.url),
          originalName: img.originalName || 'image.jpg',
          url: img.url,
        }));
        const payload = getNonVariantPayload(updatedFormData, existingImageObjects);
        const success = await createProduct(selectedSeller, payload, undefined, enableHSNValidator);
        if (success) {
          setHasChanges(false);
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

  const getVariantPayload = (data, imageUrls, updatedVariants) => {
    // For variant products, use provided imageUrls or fall back to existing images
    let finalImageUrls = [];
    
    if (imageUrls && imageUrls.length > 0) {
      finalImageUrls = imageUrls;
    } else if (existingImages && existingImages.length > 0) {
      finalImageUrls = existingImages.map((img) => ({
        key: img.key || extractS3Key(img.url),
        originalName: img.originalName || 'image.jpg',
      }));
    }

    // Use provided updatedVariants or fall back to formData.variants
    const variantsToProcess = updatedVariants || formData.variants || [];

    // Convert variant products with proper numeric conversions
    const convertedVariants = variantsToProcess.map((variant) => {
      // Keep variant images as-is, don't combine with common images
      let variantImages = variant.image_urls && Array.isArray(variant.image_urls) 
        ? variant.image_urls
            .sort((a, b) => (a.position || 0) - (b.position || 0))
            .map((img, idx) => ({
              ...img,
              position: idx,
            }))
        : [];

      return {
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
        image_urls: variantImages,
      };
    });

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
  };

  return (
    <div className="main-container">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => confirmNavigation(() => router.push('/admin/products'))}
          className="flex items-center text-black hover:opacity-70 transition-opacity"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
          <span className="display-4-bold">Add Product</span>
        </button>
        <div className="flex gap-2">
          <button className="px-4 py-2 border-2 rounded-md small-semibold" style={{ borderColor: '#00478f', color: '#00478f' }}>
            Save as Draft
          </button>
          <button onClick={handleSaveProduct} className="px-4 py-2 bg-primary text-white rounded-md small-semibold">
            Save Product
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
