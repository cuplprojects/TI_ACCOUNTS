import Status from './Status';
import ProductOrganizationSection from './ProductOrganizationSection';
import VendorDetails from './VendorDetails';

export default function RightPanel({
  formData,
  commonAttributes,
  handleInputChange,
  selectedSeller,
  setSelectedSeller,
  selectedTags,
  setSelectedTags,
  selectedCategories,
  setSelectedCategories,
  setFormData,
  setCommonAttributes,
  isViewMode = false,
}) {
  return (
    <div className="md:col-span-1">
      <div className="sticky top-4 space-y-6 md:h-[calc(100vh-120px)] md:overflow-y-auto scrollbar-hide pb-10">
        <Status 
          formData={formData} 
          commonAttributes={commonAttributes} 
          handleInputChange={handleInputChange}
          isViewMode={isViewMode}
        />

        <ProductOrganizationSection
          formData={formData}
          commonAttributes={commonAttributes}
          handleInputChange={handleInputChange}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          isViewMode={isViewMode}
        />

        <VendorDetails
          selectedSeller={selectedSeller}
          setSelectedSeller={setSelectedSeller}
          formData={formData}
          setFormData={setFormData}
          commonAttributes={commonAttributes}
          setCommonAttributes={setCommonAttributes}
          isViewMode={isViewMode}
        />
      </div>
    </div>
  );
}
