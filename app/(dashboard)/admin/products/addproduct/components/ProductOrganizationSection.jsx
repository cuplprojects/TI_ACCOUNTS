import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import CascadingCategorySelector from '@/app/components/admin/CascadingCategorySelector';
import { getAllTags, createTag } from '@/app/lib/services/admin';
import { getAllBrands } from '@/app/lib/services/admin/brandService';
import { getAllProductTypes } from '@/app/lib/services/admin/productTypeService';
import * as collectionService from '@/app/lib/services/admin/collectionService';
import { showSuccessMessage, showErrorMessage } from '@/app/lib/swalConfig';

export default function ProductOrganizationSection({
  formData,
  commonAttributes,
  handleInputChange,
  selectedTags,
  setSelectedTags,
  selectedCategories,
  setSelectedCategories,
  isViewMode = false,
}) {
  const [typeSearchTerm, setTypeSearchTerm] = useState('');
  const [brandSearchTerm, setBrandSearchTerm] = useState('');
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagDescription, setNewTagDescription] = useState('');

  // Data state
  const [tags, setTags] = useState([]);
  const [brands, setBrands] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [superCategories, setSuperCategories] = useState([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [isLoadingProductTypes, setIsLoadingProductTypes] = useState(false);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);

  // Load tags
  const loadTags = async () => {
    setIsLoadingTags(true);
    try {
      const tagsData = await getAllTags();
      setTags(tagsData.map((tag) => ({
        id: tag.id?.toString() || '',
        name: tag.name,
        description: tag.description,
      })));
    } catch (error) {
      console.error('Failed to load tags:', error);
    } finally {
      setIsLoadingTags(false);
    }
  };

  // Load brands
  const loadBrands = async () => {
    setIsLoadingBrands(true);
    try {
      const brandsData = await getAllBrands();
      setBrands(brandsData);
    } catch (error) {
      console.error('Failed to load brands:', error);
    } finally {
      setIsLoadingBrands(false);
    }
  };

  // Load product types
  const loadProductTypes = async () => {
    setIsLoadingProductTypes(true);
    try {
      // Use pagination with high limit (1 lakh = 100,000) to get all product types
      const response = await getAllProductTypes(1, 100000);
      // Handle response structure
      const typesData = response?.productTypes || [];
      setProductTypes(Array.isArray(typesData) ? typesData : []);
    } catch (error) {
      console.error('Failed to load product types:', error);
      setProductTypes([]);
    } finally {
      setIsLoadingProductTypes(false);
    }
  };

  // Load super categories
  const loadSuperCategories = async () => {
    setIsLoadingCollections(true);
    try {
      const response = await collectionService.getSuperCategories();
      if (response && Array.isArray(response)) {
        setSuperCategories(response.map((cat) => ({
          ...cat,
          id: cat.id || '',
        })));
      } else {
        setSuperCategories([]);
      }
    } catch (error) {
      console.error('Failed to load super categories:', error);
      setSuperCategories([]);
    } finally {
      setIsLoadingCollections(false);
    }
  };

  // Load all data on mount
  useEffect(() => {
    loadTags();
    loadBrands();
    loadProductTypes();
    loadSuperCategories();
  }, []);

  const currentType = formData.has_variations ? commonAttributes.type : formData.type;
  const currentBrand = formData.has_variations ? commonAttributes.brand : formData.brand;

  // Get brands for selected product type (same logic as reference page)
  const getBrandsForProductTypeId = (productTypeNameOrId) => {
    if (!productTypeNameOrId) return [];
    
    // Try to find by ID first, then by name
    let productType = productTypes.find((pt) => pt.id === productTypeNameOrId);
    if (!productType) {
      productType = productTypes.find((pt) => pt.name === productTypeNameOrId);
    }
    
    return productType?.brands || [];
  };

  // Get super categories for selected product type (same logic as reference page)
  const getSuperCategoriesForProductType = (productTypeNameOrId) => {
    if (!productTypeNameOrId) return [];
    
    // Try to find by ID first, then by name
    let productType = productTypes.find((pt) => pt.id === productTypeNameOrId);
    if (!productType) {
      productType = productTypes.find((pt) => pt.name === productTypeNameOrId);
    }
    
    return productType?.super_categories || [];
  };

  const handleTypeSelect = (typeName) => {
    const event = {
      target: { name: 'type', value: typeName, type: 'text' },
    };
    handleInputChange(event);
    setTypeSearchTerm('');
    setShowTypeDropdown(false);
    // Clear brand when type changes
    const brandEvent = {
      target: { name: 'brand', value: '', type: 'text' },
    };
    handleInputChange(brandEvent);
  };

  const handleBrandSelect = (brandName) => {
    const event = {
      target: { name: 'brand', value: brandName, type: 'text' },
    };
    handleInputChange(event);
    setBrandSearchTerm('');
    setShowBrandDropdown(false);
  };

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.find((t) => t.id === tag.id)
        ? prev.filter((t) => t.id !== tag.id)
        : [...prev, tag]
    );
  };

  const handleAddNewTag = async (e) => {
    if (e) e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      const success = await createTag({
        name: newTagName.trim(),
        description: newTagDescription.trim(),
      });

      if (success) {
        // Add the new tag to selected tags
        const newTag = {
          id: Date.now().toString(),
          name: newTagName.trim(),
          description: newTagDescription.trim(),
        };
        setSelectedTags([...selectedTags, newTag]);

        // Also add to all tags
        setTags([...tags, newTag]);

        // Clear inputs
        setNewTagName('');
        setNewTagDescription('');

        // Close modal
        setShowTagModal(false);

        // Refresh tags list
        loadTags();

        await showSuccessMessage('Tag created successfully');
      }
    } catch (error) {
      console.error('Failed to create tag:', error);
      await showErrorMessage('Failed to create tag');
    }
  };

  return (
    <>
      {/* Tag Creation Modal */}
      {showTagModal && (
        <div
          className="fixed inset-0 z-50 overflow-auto flex items-center justify-center"
          style={{ zIndex: 1000, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Create New Tag</h3>
              <button
                onClick={() => setShowTagModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleAddNewTag}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Tag Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter tag name"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={newTagDescription}
                  onChange={(e) => setNewTagDescription(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter tag description (optional)"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowTagModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md"
                >
                  Create Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm custom-border-1">
      <h3 className="text-black title-4-semibold mb-4">
        Product Organization
      </h3>
      <div className="space-y-4">
        {/* Type */}
        <div>
          <label className="block text-black title-4-semibold mb-2">
            Type <span className="text-red-500">*</span>
          </label>
          {isViewMode ? (
            <div className="p-2 bg-gray-100 rounded-md text-black small">
              {currentType || '-'}
            </div>
          ) : (
            <div className="relative">
              {currentType && (
                <div className="mb-2">
                  <div className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md flex items-center justify-between w-fit">
                    <span className="text-xs">{currentType}</span>
                    <button
                      onClick={() => handleTypeSelect('')}
                      className="ml-1 text-blue-800 hover:text-blue-900"
                    >
                      <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
              <div className="flex items-center w-full custom-border-3 rounded-md overflow-hidden">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400 ml-2" />
                <input
                  type="text"
                  value={typeSearchTerm}
                  onChange={(e) => {
                    setTypeSearchTerm(e.target.value);
                    if (!showTypeDropdown && e.target.value) setShowTypeDropdown(true);
                  }}
                  onFocus={() => setShowTypeDropdown(true)}
                  placeholder="Search product types..."
                  className="w-full ml-2 bg-transparent small focus:outline-none"
                />
              </div>
              {showTypeDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {isLoadingProductTypes ? (
                    <div className="p-2 text-center text-sm text-gray-500">
                      Loading product types...
                    </div>
                  ) : productTypes.length > 0 ? (
                    productTypes
                      .filter((pt) => pt.name.toLowerCase().includes(typeSearchTerm.toLowerCase()))
                      .map((pt) => (
                        <div
                          key={pt.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                          onClick={() => handleTypeSelect(pt.name)}
                        >
                          {pt.name}
                        </div>
                      ))
                  ) : (
                    <div className="p-2 text-center text-sm text-gray-500">
                      No product types found
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Brand */}
        <div>
          <label className="block text-black title-4-semibold mb-2">
            Brand
          </label>
          {isViewMode ? (
            <div className="p-2 bg-gray-100 rounded-md text-black small">
              {currentBrand || '-'}
            </div>
          ) : (
            <div className="relative">
              {currentBrand && (
                <div className="mb-2">
                  <div className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md flex items-center justify-between w-fit">
                    <span className="text-xs">{currentBrand}</span>
                    <button
                      onClick={() => handleBrandSelect('')}
                      className="ml-1 text-blue-800 hover:text-blue-900"
                    >
                      <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
              <div className="flex items-center w-full custom-border-3 rounded-md overflow-hidden">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400 ml-2" />
                <input
                  type="text"
                  value={brandSearchTerm}
                  onChange={(e) => {
                    setBrandSearchTerm(e.target.value);
                    if (!showBrandDropdown && e.target.value) setShowBrandDropdown(true);
                  }}
                  onFocus={() => {
                    if (currentType) {
                      const availableBrands = getBrandsForProductTypeId(currentType);
                      if (availableBrands.length > 0) setShowBrandDropdown(true);
                    }
                  }}
                  placeholder={!currentType ? 'Select Type First' : 'Search brands...'}
                  className="w-full ml-2 bg-transparent small focus:outline-none"
                  disabled={!currentType}
                />
              </div>
              {showBrandDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {isLoadingBrands ? (
                    <div className="p-2 text-center text-sm text-gray-500">
                      Loading brands...
                    </div>
                  ) : (() => {
                    // Get brands for the selected product type
                    const availableBrands = currentType 
                      ? getBrandsForProductTypeId(currentType)
                      : [];
                    
                    // Filter by search term
                    let filteredBrands = availableBrands.filter((b) =>
                      b.name.toLowerCase().includes(brandSearchTerm.toLowerCase())
                    );
                    
                    // Always include currently selected brand if not in filtered list
                    if (currentBrand && !filteredBrands.some(b => b.name === currentBrand)) {
                      filteredBrands = [
                        { id: currentBrand, name: currentBrand },
                        ...filteredBrands
                      ];
                    }
                    
                    return filteredBrands.length > 0 ? (
                      filteredBrands.map((b) => (
                        <div
                          key={b.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                          onClick={() => handleBrandSelect(b.name)}
                        >
                          {b.name}
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-center text-sm text-gray-500">
                        No brands found
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Categories - Using CascadingCategorySelector from reference code */}
        {(currentType || isViewMode) && (
          <div>
            <label className="block text-black title-4-semibold mb-2">
              Categories
            </label>
            {isViewMode ? (
              <div className="space-y-3">
                {selectedCategories && selectedCategories.length > 0 ? (
                  <>
                    {/* Super Category */}
                    {selectedCategories[0]?.SuperCategory && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Super Category
                        </label>
                        <div className="p-2 bg-gray-100 rounded-md text-black small">
                          {selectedCategories[0].SuperCategory.title}
                        </div>
                      </div>
                    )}
                    
                    {/* Categories */}
                    {(() => {
                      const categoryIds = selectedCategories
                        .filter(cat => cat.Category && cat.Category.id)
                        .map(cat => cat.Category.id);
                      const uniqueCategories = [...new Set(categoryIds)].map(id => 
                        selectedCategories.find(cat => cat.Category?.id === id)?.Category
                      ).filter(Boolean);
                      
                      return uniqueCategories.length > 0 ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Categories
                          </label>
                          <div className="p-2 bg-gray-100 rounded-md text-black small">
                            {uniqueCategories.map(cat => cat.title).join(', ')}
                          </div>
                        </div>
                      ) : null;
                    })()}
                    
                    {/* Sub-Categories */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Sub-Categories
                      </label>
                      <div className="p-2 bg-gray-100 rounded-md text-black small">
                        {selectedCategories.map(cat => cat.title).join(', ')}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-2 bg-gray-100 rounded-md text-black small">-</div>
                )}
              </div>
            ) : (
              <CascadingCategorySelector
                superCategories={
                  currentType
                    ? superCategories.filter((sc) => {
                        const superCatsForType = getSuperCategoriesForProductType(currentType);
                        return superCatsForType.some((sct) => sct.id === sc.id);
                      })
                    : superCategories
                }
                selectedSubCategories={selectedCategories}
                onSelectSubCategories={setSelectedCategories}
                isLoading={isLoadingCollections}
                disabled={false}
                isEditMode={selectedCategories && selectedCategories.length > 0}
                initialSuperCategoryId={selectedCategories && selectedCategories.length > 0 ? selectedCategories[0]?.SuperCategory?.id : undefined}
                initialCategoryIds={selectedCategories && selectedCategories.length > 0 ? (() => {
                  // Extract unique category IDs from all selected categories
                  const categoryIds = selectedCategories
                    .filter(cat => cat.Category && cat.Category.id)
                    .map(cat => cat.Category.id);
                  
                  // Remove duplicates
                  return [...new Set(categoryIds)];
                })() : undefined}
              />
            )}
          </div>
        )}

        {/* Tags */}
        <div>
          <label className="block text-black title-4-semibold mb-2">
            Tags
          </label>
          {isViewMode ? (
            <div className="p-2 bg-gray-100 rounded-md text-black small">
              {selectedTags && selectedTags.length > 0 
                ? selectedTags.map(tag => tag.name).join(', ')
                : '-'
              }
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map((tag) => (
                  <div key={tag.id} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md flex items-center">
                    <span className="text-xs">{tag.name}</span>
                    <button
                      onClick={() => handleTagToggle(tag)}
                      className="ml-1 text-blue-800 hover:text-blue-900"
                    >
                      <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="relative">
                <div className="flex items-center w-full custom-border-3 rounded-md overflow-hidden">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-400 ml-2" />
                  <input
                    type="text"
                    value={tagSearchTerm}
                    onChange={(e) => {
                      setTagSearchTerm(e.target.value);
                      if (!showTagDropdown && e.target.value) setShowTagDropdown(true);
                    }}
                    onFocus={() => setShowTagDropdown(true)}
                    placeholder="Search tags..."
                    className="w-full ml-2 bg-transparent small focus:outline-none"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowTagModal(true)}
                    className="pr-2 text-primary hover:text-primary-dark"
                    title="Create new tag"
                  >
                    <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                  </button>
                </div>
                {showTagDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {isLoadingTags ? (
                      <div className="p-2 text-center text-sm text-gray-500">
                        Loading tags...
                      </div>
                    ) : tags.length > 0 ? (
                      tags
                        .filter((t) => t.name.toLowerCase().includes(tagSearchTerm.toLowerCase()))
                        .map((t) => (
                          <div
                            key={t.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                            onClick={() => {
                              handleTagToggle(t);
                              setTagSearchTerm('');
                              setShowTagDropdown(false);
                            }}
                          >
                            {t.name}
                          </div>
                        ))
                    ) : (
                      <div className="p-2 text-center text-sm text-gray-500">
                        No tags found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
