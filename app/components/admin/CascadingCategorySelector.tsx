"use client";

import React, { useState, useEffect, useRef } from "react";
import * as adminCollectionService from "@/app/lib/services/admin/collectionService";
import * as sellerCollectionService from "@/app/lib/services/seller/collectionService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

export interface Category {
  id: string;
  title: string;
  category_type: "super-category" | "category" | "sub-category";
  Categories?: Category[];
  SubCategories?: Category[];
}

interface SelectedSubCategory {
  id: string;
  title: string;
  path: string;
}

interface CascadingCategorySelectorProps {
  superCategories: Category[];
  selectedSubCategories?: SelectedSubCategory[];
  onSelectSubCategories: (subCategories: SelectedSubCategory[]) => void;
  isLoading?: boolean;
  disabled?: boolean;
  serviceType?: "admin" | "seller";
  initialSuperCategoryId?: string | undefined;
  initialCategoryIds?: string[] | undefined;
  isEditMode?: boolean;
}

export default function CascadingCategorySelector({
  superCategories,
  selectedSubCategories = [],
  onSelectSubCategories,
  isLoading = false,
  disabled = false,
  serviceType = "admin",
  initialSuperCategoryId,
  initialCategoryIds,
  isEditMode = false,
}: CascadingCategorySelectorProps) {
  const [selectedSuperCategoryId, setSelectedSuperCategoryId] = useState<string>(initialSuperCategoryId || "");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(initialCategoryIds || []);
  const [categoryTitles, setCategoryTitles] = useState<Record<string, string>>({}); // Store category titles
  const [categorySearchTerm, setCategorySearchTerm] = useState<string>("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [subCategorySearchTerm, setSubCategorySearchTerm] = useState<string>("");
  const [showSubCategoryDropdown, setShowSubCategoryDropdown] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasInitializedCategories, setHasInitializedCategories] = useState(false);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const collectionService = serviceType === "seller" ? sellerCollectionService : adminCollectionService;

  useEffect(() => {
    console.log("🔍 Super Categories Validation - superCategories.length:", superCategories.length, "isInitialLoad:", isInitialLoad, "isEditMode:", isEditMode);
    if (selectedCategoryIds.length > 0 && superCategories.length > 0 && !isInitialLoad) {
      const superCatStillExists = superCategories.some(sc => sc.id === selectedSuperCategoryId);
      console.log("✅ Super category exists:", superCatStillExists, "selectedSuperCategoryId:", selectedSuperCategoryId);
      // Only reset if super category doesn't exist AND we're not in edit mode AND not initial load
      if (!superCatStillExists && !isEditMode) {
        console.log("🔄 Resetting all (super category doesn't exist and not edit mode)");
        setSelectedSuperCategoryId("");
        setSelectedCategoryIds([]);
        setSubCategorySearchTerm("");
        setShowSubCategoryDropdown(false);
        setCategories([]);
        setSubCategories([]);
      }
    }
  }, [superCategories.length, isEditMode, isInitialLoad]);

  useEffect(() => {
    console.log("🔄 Super Category Change Effect - selectedSuperCategoryId:", selectedSuperCategoryId, "isEditMode:", isEditMode, "isInitialLoad:", isInitialLoad);
    if (selectedSuperCategoryId) {
      console.log("📂 Loading categories for super category:", selectedSuperCategoryId);
      loadCategories(selectedSuperCategoryId);
    } else {
      setCategories([]);
    }
    // Only reset categories if not in edit mode AND not during initial load
    if (!isEditMode && !isInitialLoad) {
      console.log("🔄 Resetting categories (not edit mode and not initial load)");
      setSelectedCategoryIds([]);
      setSubCategories([]);
    }
  }, [selectedSuperCategoryId, isEditMode, isInitialLoad]);

  useEffect(() => {
    console.log("🔄 Category IDs Change Effect - selectedCategoryIds:", selectedCategoryIds);
    if (selectedCategoryIds.length > 0) {
      console.log("📂 Loading sub-categories for categories:", selectedCategoryIds);
      loadSubCategoriesFromMultiple(selectedCategoryIds);
    } else {
      setSubCategories([]);
    }
    setSubCategorySearchTerm("");
  }, [selectedCategoryIds]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSubCategoryDropdown(false);
      }
    };

    if (showCategoryDropdown || showSubCategoryDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showCategoryDropdown, showSubCategoryDropdown]);

  useEffect(() => {
    console.log("🔍 Initial Load Effect - initialSuperCategoryId:", initialSuperCategoryId);
    if (initialSuperCategoryId) {
      console.log("✅ Setting super category to:", initialSuperCategoryId);
      setSelectedSuperCategoryId(initialSuperCategoryId);
      loadCategories(initialSuperCategoryId);
      setIsInitialLoad(false);
    }
  }, [initialSuperCategoryId]);

  useEffect(() => {
    console.log("🔍 Initial Categories Effect - initialCategoryIds:", initialCategoryIds);
    if (initialCategoryIds && initialCategoryIds.length > 0 && !hasInitializedCategories) {
      console.log("✅ Setting categories to:", initialCategoryIds);
      setSelectedCategoryIds(initialCategoryIds);
      loadSubCategoriesFromMultiple(initialCategoryIds);
      setHasInitializedCategories(true);
    }
  }, []); // Empty dependency array - only run once on mount

  const loadCategories = async (superCategoryId: string) => {
    setLoadingCategories(true);
    try {
      const response = await collectionService.getCategoriesBySuperId(superCategoryId);
      if (response && Array.isArray(response)) {
        const mappedCategories = response.map((cat: any) => ({
          ...cat,
          id: cat.id || "",
        }));
        setCategories(mappedCategories);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadSubCategoriesFromMultiple = async (categoryIds: string[]) => {
    setLoadingSubCategories(true);
    try {
      const allSubCategories: Category[] = [];
      const seenIds = new Set<string>();

      for (const categoryId of categoryIds) {
        const response = await collectionService.getSubCategoriesByCategoryId(categoryId);
        if (response && Array.isArray(response)) {
          response.forEach((subCat: any) => {
            if (!seenIds.has(subCat.id)) {
              seenIds.add(subCat.id);
              allSubCategories.push({
                ...subCat,
                id: subCat.id || "",
              });
            }
          });
        }
      }
      setSubCategories(allSubCategories);
      
      // Filter selected sub-categories to only include those still available
      const validSubCategories = selectedSubCategories.filter((subCat) => 
        allSubCategories.some((availableSub) => availableSub.id === subCat.id)
      );
      
      // Update selected sub-categories if any were removed
      if (validSubCategories.length !== selectedSubCategories.length) {
        onSelectSubCategories(validSubCategories);
      }
    } catch (error) {
      console.error("Failed to load sub-categories:", error);
      setSubCategories([]);
    } finally {
      setLoadingSubCategories(false);
    }
  };

  const handleAddSubCategory = (subCat: Category) => {
    if (selectedCategoryIds.length > 0 && selectedSuperCategoryId) {
      const superCat = superCategories.find((sc) => sc.id === selectedSuperCategoryId);

      if (superCat) {
        if (!selectedSubCategories.some((s) => s.id === subCat.id)) {
          // Use the first category for the path display
          const categoryId = selectedCategoryIds[0];
          const category = categories.find((c) => c.id === categoryId);
          
          const path = category 
            ? `${superCat.title} > ${category.title} > ${subCat.title}`
            : `${superCat.title} > ${subCat.title}`;
          
          const newSubCategories = [
            ...selectedSubCategories,
            {
              id: subCat.id,
              title: subCat.title,
              path,
            },
          ];
          onSelectSubCategories(newSubCategories);
          setSubCategorySearchTerm(""); // Clear search after selection
        }
      }
    }
  };

  const handleAddCategory = (cat: Category) => {
    if (!selectedCategoryIds.includes(cat.id)) {
      const newCategoryIds = [...selectedCategoryIds, cat.id];
      setSelectedCategoryIds(newCategoryIds);
      // Store the category title for display
      setCategoryTitles((prev) => ({
        ...prev,
        [cat.id]: cat.title,
      }));
      setCategorySearchTerm("");
      loadSubCategoriesFromMultiple(newCategoryIds);
    }
  };

  const handleRemoveCategory = (categoryId: string) => {
    const newCategoryIds = selectedCategoryIds.filter((id) => id !== categoryId);
    setSelectedCategoryIds(newCategoryIds);
    
    if (newCategoryIds.length > 0) {
      loadSubCategoriesFromMultiple(newCategoryIds);
    } else {
      setSubCategories([]);
      onSelectSubCategories([]);
    }
  };

  const handleRemoveSubCategory = (subCategoryId: string) => {
    const newSubCategories = selectedSubCategories.filter((s) => s.id !== subCategoryId);
    onSelectSubCategories(newSubCategories);
    
    // Only reset if ALL sub-categories are removed
    if (newSubCategories.length === 0) {
      setSubCategorySearchTerm("");
      setShowSubCategoryDropdown(false);
    }
  };

  const filteredSubCategories = subCategories.filter(
    (subCat) =>
      subCat.title.toLowerCase().includes(subCategorySearchTerm.toLowerCase()) &&
      !selectedSubCategories.some((s) => s.id === subCat.id)
  );

  const filteredCategories = categories.filter(
    (cat) =>
      cat.title.toLowerCase().includes(categorySearchTerm.toLowerCase()) &&
      !selectedCategoryIds.includes(cat.id)
  );

  if (isLoading) {
    return <div className="p-4 text-gray-500">Loading categories...</div>;
  }

  return (
    <div className="space-y-3">
      {/* Super Category Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Super Category
        </label>
        <select
          value={selectedSuperCategoryId}
          onChange={(e) => {
            const newValue = e.target.value;
            setSelectedSuperCategoryId(newValue);
            setIsInitialLoad(false); // Mark that user has manually changed super category
            
            // Reset categories and sub-categories when super category is deselected
            if (!newValue) {
              setSelectedCategoryIds([]);
              setCategoryTitles({});
              onSelectSubCategories([]);
              setSubCategorySearchTerm("");
              setShowSubCategoryDropdown(false);
              setCategories([]);
              setSubCategories([]);
            }
          }}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-line rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          <option value="">Select Super Category</option>
          {superCategories.map((superCat) => (
            <option key={superCat.id} value={superCat.id}>
              {superCat.title}
            </option>
          ))}
        </select>
      </div>

      {/* Selected Categories Display */}
      {selectedCategoryIds.length > 0 && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selected Categories ({selectedCategoryIds.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedCategoryIds.map((catId) => {
              const cat = categories.find((c) => c.id === catId);
              const title = cat?.title || categoryTitles[catId] || catId;
              return (
                <div
                  key={catId}
                  className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                >
                  <span>{title}</span>
                  {!disabled && (
                    <button
                      onClick={() => handleRemoveCategory(catId)}
                      className="text-blue-600 hover:text-blue-900 font-bold"
                      title="Remove category"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories Multi-Select with Search */}
      {selectedSuperCategoryId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {selectedCategoryIds.length > 0 ? "Add More Categories" : "Select Categories (Multiple)"}
          </label>
          <div className="relative" ref={categoryDropdownRef}>
            <div className="flex items-center w-full border border-gray-line bg-white rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              <FontAwesomeIcon
                icon={faSearch}
                className="text-gray-400 ml-3"
              />
              <input
                type="text"
                value={categorySearchTerm}
                onChange={(e) => {
                  setCategorySearchTerm(e.target.value);
                  if (!showCategoryDropdown && e.target.value)
                    setShowCategoryDropdown(true);
                }}
                onFocus={() => {
                  if (categories.length > 0) setShowCategoryDropdown(true);
                }}
                placeholder="Search categories..."
                disabled={disabled || loadingCategories}
                className="w-full ml-2 bg-transparent text-sm focus:outline-none py-2 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              />
            </div>

            {showCategoryDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {loadingCategories ? (
                  <div className="p-3 text-center text-sm text-gray-500">
                    Loading categories...
                  </div>
                ) : categories.length === 0 ? (
                  <div className="p-3 text-center text-sm text-gray-500">
                    No categories available
                  </div>
                ) : filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-3 hover:bg-blue-50 cursor-pointer text-sm text-gray-800 transition-colors border-b border-gray-100 last:border-b-0"
                      onClick={() => handleAddCategory(cat)}
                    >
                      {cat.title}
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-sm text-gray-500">
                    No categories found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Sub-Categories Display */}
      {selectedSubCategories.length > 0 && (
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selected Sub-Categories ({selectedSubCategories.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedSubCategories.map((subCat) => (
              <div
                key={subCat.id}
                className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
              >
                <span>{subCat.title}</span>
                {!disabled && (
                  <button
                    onClick={() => handleRemoveSubCategory(subCat.id)}
                    className="text-blue-600 hover:text-blue-900 font-bold"
                    title="Remove sub-category"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Category Search and Selection */}
      {selectedCategoryIds.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {selectedSubCategories.length > 0 ? "Add More Sub-Categories" : "Select Sub-Categories"}
          </label>
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center w-full border border-gray-line bg-white rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              <FontAwesomeIcon
                icon={faSearch}
                className="text-gray-400 ml-3"
              />
              <input
                type="text"
                value={subCategorySearchTerm}
                onChange={(e) => {
                  setSubCategorySearchTerm(e.target.value);
                  if (!showSubCategoryDropdown && e.target.value)
                    setShowSubCategoryDropdown(true);
                }}
                onFocus={() => {
                  if (subCategories.length > 0) setShowSubCategoryDropdown(true);
                }}
                placeholder="Search sub-categories..."
                disabled={disabled}
                className="w-full ml-2 bg-transparent text-sm focus:outline-none py-2 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              />
            </div>

            {showSubCategoryDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {subCategories.length === 0 ? (
                  <div className="p-3 text-center text-sm text-gray-500">
                    {loadingSubCategories ? "Loading..." : "No sub-categories available"}
                  </div>
                ) : filteredSubCategories.length > 0 ? (
                  filteredSubCategories.map((subCat) => (
                    <div
                      key={subCat.id}
                      className="p-3 hover:bg-blue-50 cursor-pointer text-sm text-gray-800 transition-colors border-b border-gray-100 last:border-b-0"
                      onClick={() => handleAddSubCategory(subCat)}
                    >
                      {subCat.title}
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-sm text-gray-500">
                    No sub-categories found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clear All Button */}
      {!disabled && (selectedSubCategories.length > 0 || selectedCategoryIds.length > 0) && (
        <button
          onClick={() => {
            onSelectSubCategories([]);
            setSubCategorySearchTerm("");
            setCategorySearchTerm("");
            setSelectedSuperCategoryId("");
            setSelectedCategoryIds([]);
            setShowSubCategoryDropdown(false);
            setShowCategoryDropdown(false);
            setCategories([]);
            setSubCategories([]);
          }}
          className="w-full mt-3 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
        >
          Clear All
        </button>
      )}
    </div>
  );
}
