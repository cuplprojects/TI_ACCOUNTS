/**
 * Validation utilities for product form
 */

// Helper function to strip HTML tags and get plain text
const getPlainText = (html) => {
  if (!html) return '';
  
  // If document is available (client-side), use DOM method
  if (typeof document !== 'undefined') {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  }
  
  // Fallback: simple regex-based HTML stripping
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
};

export const validateNonVariantProduct = (formData, selectedTags, selectedCategories, existingImages, images, selectedSellerId) => {
  const errors = [];

  // Vendor/Seller validation
  if (!selectedSellerId || selectedSellerId.trim() === '') {
    errors.push('Vendor/Seller is required');
  }

  // Collection validation
  if (!selectedCategories || selectedCategories.length === 0) {
    errors.push('Category is required');
  }

  // Required fields
  if (!formData.title || formData.title.trim() === '') {
    errors.push('Product title is required');
  }

  if (!formData.description || getPlainText(formData.description).trim() === '') {
    errors.push('Product description is required');
  }

  if (!formData.type || formData.type.trim() === '') {
    errors.push('Product type is required');
  }

  if (!formData.sku || formData.sku.trim() === '') {
    errors.push('SKU is required');
  }

  if (formData.price <= 0) {
    errors.push('Price must be greater than 0');
  }

  if (formData.gst_percent === undefined || formData.gst_percent === null || formData.gst_percent === '') {
    errors.push('GST percentage is required');
  }

  const gstValue = formData.gst_percent !== undefined && formData.gst_percent !== null ? Number(formData.gst_percent) : null;
  if (gstValue !== null && (gstValue < 0 || gstValue > 100)) {
    errors.push('GST percentage must be between 0 and 100');
  }

  if (!formData.hs_code || formData.hs_code.trim() === '') {
    errors.push('HS code is required');
  }

  if (formData.hs_code && formData.hs_code.length !== 8) {
    errors.push('HS code must be exactly 8 digits');
  }

  if (formData.hs_code && !/^\d+$/.test(formData.hs_code)) {
    errors.push('HS code must contain only numeric characters');
  }

  // Physical product validations
  if (formData.physical_product) {
    if (formData.weight <= 0) {
      errors.push('Weight must be greater than 0 for physical products');
    }

    if (formData.length <= 0 || formData.breadth <= 0 || formData.height <= 0) {
      errors.push('All dimensions must be greater than 0 for physical products');
    }
  }



  // Barcode validation if present
  if (formData.has_barcode && formData.barcode) {
    if (!/^\d+$/.test(formData.barcode)) {
      errors.push('Barcode must contain only numeric characters');
    }
  }

  // Image validation
  if (existingImages.length === 0 && images.length === 0) {
    errors.push('Please upload at least one product image');
  }

  // SKU validation - alphanumeric, hyphens, underscores only
  if (formData.sku && !/^[a-zA-Z0-9_-]+$/.test(formData.sku)) {
    errors.push('SKU can only contain alphanumeric characters, hyphens, and underscores');
  }

  // Page URL validation
  if (formData.page_url && !/^[a-z0-9-]+$/.test(formData.page_url)) {
    errors.push('URL handle can only contain lowercase letters, numbers, and hyphens');
  }

  return errors;
};

export const validateVariantProduct = (commonAttributes, variationOptions, variants, selectedTags, selectedCategories, existingImages, images, selectedSellerId) => {
  const errors = [];

  // Vendor/Seller validation
  if (!selectedSellerId || selectedSellerId.trim() === '') {
    errors.push('Vendor/Seller is required');
  }

  // Collection validation
  if (!selectedCategories || selectedCategories.length === 0) {
    errors.push('Category is required');
  }

  // Common attributes validation
  if (!commonAttributes.title || commonAttributes.title.trim() === '') {
    errors.push('Product title is required');
  }

  if (!commonAttributes.description || getPlainText(commonAttributes.description).trim() === '') {
    errors.push('Product description is required');
  }

  if (!commonAttributes.type || commonAttributes.type.trim() === '') {
    errors.push('Product type is required');
  }

  if (commonAttributes.gst_percent === undefined || commonAttributes.gst_percent === null || commonAttributes.gst_percent === '') {
    errors.push('GST percentage is required');
  }

  const gstValue = commonAttributes.gst_percent !== undefined && commonAttributes.gst_percent !== null ? Number(commonAttributes.gst_percent) : null;
  if (gstValue !== null && (gstValue < 0 || gstValue > 100)) {
    errors.push('GST percentage must be between 0 and 100');
  }

  if (!commonAttributes.hs_code || commonAttributes.hs_code.trim() === '') {
    errors.push('HS code is required');
  }

  if (commonAttributes.hs_code && commonAttributes.hs_code.length !== 8) {
    errors.push('HS code must be exactly 8 digits');
  }

  if (commonAttributes.hs_code && !/^\d+$/.test(commonAttributes.hs_code)) {
    errors.push('HS code must contain only numeric characters');
  }

  // Variation options validation
  if (!variationOptions || variationOptions.length === 0) {
    errors.push('At least one variation option is required');
  }

  // Variants validation
  if (!variants || variants.length === 0) {
    errors.push('At least one variant is required');
  }

  // Validate each variant
  if (variants && variants.length > 0) {
    const skus = new Set();
    const barcodes = new Set();

    variants.forEach((variant, index) => {
      if (!variant.sku || variant.sku.trim() === '') {
        errors.push(`Variant ${index + 1}: SKU is required`);
      }

      if (variant.sku && skus.has(variant.sku)) {
        errors.push(`Variant ${index + 1}: SKU must be unique`);
      }
      if (variant.sku) skus.add(variant.sku);

      if (variant.price <= 0) {
        errors.push(`Variant ${index + 1}: Price must be greater than 0`);
      }

      if (variant.barcode && barcodes.has(variant.barcode)) {
        errors.push(`Variant ${index + 1}: Barcode must be unique`);
      }
      if (variant.barcode) barcodes.add(variant.barcode);

      if (variant.barcode && !/^\d+$/.test(variant.barcode)) {
        errors.push(`Variant ${index + 1}: Barcode must contain only numeric characters`);
      }
    });
  }

  // Image validation
  if (existingImages.length === 0 && images.length === 0) {
    errors.push('Please upload at least one product image');
  }

  // Page URL validation
  if (commonAttributes.page_url && !/^[a-z0-9-]+$/.test(commonAttributes.page_url)) {
    errors.push('URL handle can only contain lowercase letters, numbers, and hyphens');
  }

  return errors;
};

export const validateField = (fieldName, value, formData) => {
  const errors = [];

  switch (fieldName) {
    case 'title':
      if (!value || value.trim() === '') {
        errors.push('Title is required');
      }
      if (value && value.length > 200) {
        errors.push('Title must be less than 200 characters');
      }
      break;

    case 'sku':
      if (!value || value.trim() === '') {
        errors.push('SKU is required');
      }
      if (value && !/^[a-zA-Z0-9_-]+$/.test(value)) {
        errors.push('SKU can only contain alphanumeric characters, hyphens, and underscores');
      }
      break;

    case 'hs_code':
      if (!value || value.trim() === '') {
        errors.push('HS code is required');
      }
      if (value && value.length !== 8) {
        errors.push('HS code must be exactly 8 digits');
      }
      if (value && !/^\d+$/.test(value)) {
        errors.push('HS code must contain only numeric characters');
      }
      break;

    case 'barcode':
      if (value && !/^\d+$/.test(value)) {
        errors.push('Barcode must contain only numeric characters');
      }
      break;

    case 'price':
      if (value <= 0) {
        errors.push('Price must be greater than 0');
      }
      break;

    case 'gst_percent':
      if (value === undefined || value === null || value === '') {
        errors.push('GST percentage is required');
      } else {
        const gstNum = Number(value);
        if (gstNum < 0 || gstNum > 100) {
          errors.push('GST percentage must be between 0 and 100');
        }
      }
      break;

    case 'page_url':
      if (value && !/^[a-z0-9-]+$/.test(value)) {
        errors.push('URL handle can only contain lowercase letters, numbers, and hyphens');
      }
      break;

    case 'weight':
      if (formData.physical_product && value <= 0) {
        errors.push('Weight must be greater than 0 for physical products');
      }
      break;

    case 'length':
    case 'breadth':
    case 'height':
      if (formData.physical_product && value <= 0) {
        errors.push(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be greater than 0 for physical products`);
      }
      break;

    default:
      break;
  }

  return errors;
};

export const formatValidationErrors = (errors) => {
  if (errors.length === 0) return '';
  return errors.join('\n');
};
