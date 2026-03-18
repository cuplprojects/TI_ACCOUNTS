import React from 'react';
import HSNValidator from './HSNValidator';
import BasicInfo from './BasicInfo';
import Pricing from './Pricing';
import Inventory from './Inventory';
import Shipping from './Shipping';
import SEO from './SEO';
import Variants from './Variants';
import ProductClassification from './ProductClassification';

export default function LeftPanel({
  formData,
  commonAttributes,
  handleInputChange,
  handleEditorChange,
  handleVariationsChange,
  editorRef,
  isPhysicalProduct,
  setIsPhysicalProduct,
  enableHSNValidator,
  setEnableHSNValidator,
  images,
  setImages,
  existingImages,
  setExistingImages,
  isViewMode = false,
}) {
  return (
    <div className="md:col-span-2 space-y-6 md:h-[calc(100vh-120px)] md:overflow-y-auto md:pr-4 scrollbar-hide">
      {!isViewMode && <HSNValidator enableHSNValidator={enableHSNValidator} setEnableHSNValidator={setEnableHSNValidator} />}

      <BasicInfo 
        formData={formData} 
        commonAttributes={commonAttributes} 
        handleInputChange={handleInputChange}
        handleEditorChange={handleEditorChange}
        editorRef={editorRef}
        images={images}
        setImages={setImages}
        existingImages={existingImages}
        setExistingImages={setExistingImages}
        isViewMode={isViewMode}
      />

      <Variants formData={formData} handleVariationsChange={handleVariationsChange} isViewMode={isViewMode} />

      {!formData.has_variations && (
        <>
          <Pricing formData={formData} handleInputChange={handleInputChange} isViewMode={isViewMode} />
          <Inventory formData={formData} handleInputChange={handleInputChange} isViewMode={isViewMode} />
          <Shipping
            formData={formData}
            isPhysicalProduct={isPhysicalProduct}
            setIsPhysicalProduct={setIsPhysicalProduct}
            handleInputChange={handleInputChange}
            isViewMode={isViewMode}
          />
        </>
      )}

      {formData.has_variations && (
        <ProductClassification 
          formData={formData} 
          commonAttributes={commonAttributes} 
          handleInputChange={handleInputChange}
          isViewMode={isViewMode}
        />
      )}

      <SEO formData={formData} commonAttributes={commonAttributes} handleInputChange={handleInputChange} isViewMode={isViewMode} />
    </div>
  );
}
