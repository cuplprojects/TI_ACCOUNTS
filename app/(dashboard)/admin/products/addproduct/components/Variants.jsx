'use client';

import { VariationManager } from '@/app/components/admin/product-variations';

export default function Variants({ formData, handleVariationsChange, isViewMode = false }) {
  const handleVariantCheckboxChange = (e) => {
    if (isViewMode) return;
    const newHasVariations = e.target.checked;
    if (handleVariationsChange) {
      handleVariationsChange(
        newHasVariations,
        formData.variation_options || [],
        formData.variants || []
      );
    }
  };

  return (
    <div>
      <VariationManager
        initialPrice={Number(formData.price) || 0}
        initialSku={formData.sku || ''}
        initialHasVariations={formData.has_variations || false}
        initialVariationOptions={formData.variation_options || []}
        initialVariants={formData.variants || []}
        disabled={isViewMode}
        onVariationsChange={handleVariationsChange}
      />
    </div>
  );
}
