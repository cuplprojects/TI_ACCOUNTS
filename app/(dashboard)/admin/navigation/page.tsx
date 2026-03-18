"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPlus, 
  faTrash, 
  faSpinner, 
  faChevronDown,
  faChevronRight,
  faEye,
  faEyeSlash,
  faGripVertical,
  faSearch,
  faTimes,
  faPencil
} from "@fortawesome/free-solid-svg-icons";
import {
  showSuccessMessage,
  showErrorMessage,
  showConfirmation,
} from "@/app/lib/swalConfig";
import {
  getNavigations,
  getAvailableCollections,
  addNavigation,
  updateNavigation,
  deleteNavigation,
  reorderNavigationItems,
  updateNavigationOrder,
  NavigationHierarchy,
  SuperCategoryOption,
  CategoryOption,
  SubCategoryOption,
  CategoryWithSubs,
  SubCategoryItem
} from "@/app/lib/services/admin/navigationService";

// Main component
const NavigationManager: React.FC = () => {
  const [navigations, setNavigations] = useState<NavigationHierarchy[]>([]);
  const [availableCollections, setAvailableCollections] = useState<SuperCategoryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [expandedSuperCategories, setExpandedSuperCategories] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [dragLevel, setDragLevel] = useState<'super_category' | 'category' | 'sub_category' | null>(null);
  const [draggedParentId, setDraggedParentId] = useState<string | null>(null);
  
  // Selection state for hierarchical selection
  const [showSuperCategorySelector, setShowSuperCategorySelector] = useState(false);
  const [superCategorySearch, setSuperCategorySearch] = useState("");
  
  // Category selection state
  const [showCategorySelector, setShowCategorySelector] = useState<string | null>(null);
  const [categorySearch, setCategorySearch] = useState("");
  
  // Sub-category selection state
  const [showSubCategorySelector, setShowSubCategorySelector] = useState<string | null>(null);
  const [subCategorySearch, setSubCategorySearch] = useState("");
  
  // Modal mode toggle state
  const [modalMode, setModalMode] = useState<'add' | 'rearrange'>('add');
  
  // Custom label editing state
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editingLabelValue, setEditingLabelValue] = useState<string>("");
  const [editingLabelOriginal, setEditingLabelOriginal] = useState<string>("");

  // Load data on component mount
  useEffect(() => {
    loadNavigations();
    loadAvailableCollections();
  }, []);

  const loadNavigations = async () => {
    setLoading(true);
    try {
      const data = await getNavigations();
      setNavigations(data);
    } catch (error) {
      console.error('Error loading navigations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableCollections = async () => {
    try {
      const data = await getAvailableCollections();
      setAvailableCollections(data);
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const handleAddSuperCategory = async (superCategory: SuperCategoryOption) => {
    setLoadingItemId(superCategory.id);
    try {
      const success = await addNavigation({
        super_category_id: superCategory.id,
        level: 'super_category'
      });
      if (success) {
        await loadNavigations();
      }
    } catch (error) {
      console.error('Error adding super category:', error);
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleAddCategory = async (superCategoryId: string, category: CategoryOption) => {
    setLoadingItemId(category.id);
    try {
      // Check if this is "Shop by Brand" (id starts with 'shop-by-brand-')
      const isShopByBrand = category.id.startsWith('shop-by-brand-');
      
      const success = await addNavigation({
        super_category_id: superCategoryId,
        category_id: isShopByBrand ? undefined : category.id,
        level: isShopByBrand ? 'brand' : 'category'
      });
      if (success) {
        await loadNavigations();
      }
    } catch (error) {
      console.error('Error adding category:', error);
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleAddSubCategory = async (superCategoryId: string, categoryId: string, subCategory: SubCategoryOption) => {
    setLoadingItemId(subCategory.id);
    try {
      // Check if this is a brand (category_type === 'brand')
      const isBrand = (subCategory as any).category_type === 'brand';
      
      const success = await addNavigation({
        super_category_id: superCategoryId,
        category_id: isBrand ? undefined : categoryId,
        sub_category_id: isBrand ? undefined : subCategory.id,
        brand_id: isBrand ? subCategory.id : undefined,
        level: isBrand ? 'brand' : 'sub_category',
        custom_label: isBrand ? (subCategory as any).title : undefined
      });
      if (success) {
        await loadNavigations();
      }
    } catch (error) {
      console.error('Error adding sub category:', error);
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const success = await updateNavigation(id, { is_active: !currentStatus });
    if (success) {
      await loadNavigations();
    }
  };

  const handleDeleteNavigation = async (id: string, title: string) => {
    const result = await showConfirmation(
      "Delete Navigation",
      `Are you sure you want to delete "${title}" from navigation? This action cannot be undone.`
    );

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const success = await deleteNavigation(id);
        if (success) {
          await loadNavigations();
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditCustomLabel = (id: string, currentLabel: string, originalTitle: string) => {
    setEditingLabelId(id);
    setEditingLabelValue(currentLabel || "");
    setEditingLabelOriginal(originalTitle);
  };

  const handleSaveCustomLabel = async (id: string) => {
    try {
      const success = await updateNavigation(id, { custom_label: editingLabelValue || undefined });
      if (success) {
        await loadNavigations();
        setEditingLabelId(null);
        showSuccessMessage("Custom label updated successfully");
      }
    } catch (error) {
      console.error('Error updating custom label:', error);
    }
  };

  const handleCancelEditLabel = () => {
    setEditingLabelId(null);
    setEditingLabelValue("");
    setEditingLabelOriginal("");
  };

  const toggleSuperCategoryExpansion = (id: string) => {
    const newExpanded = new Set(expandedSuperCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSuperCategories(newExpanded);
  };

  const toggleCategoryExpansion = (id: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCategories(newExpanded);
  };

  // Drag and drop handlers for super categories
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, itemId: string, level: 'super_category' | 'category' | 'sub_category', parentId?: string) => {
    setDraggedItem(itemId);
    setDragLevel(level);
    setDraggedParentId(parentId || null);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(itemId);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setDragOverItem(null);
  };

  const handleDropSuperCategory = async (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    setDragOverItem(null);

    if (!draggedItem || draggedItem === targetId || dragLevel !== 'super_category') {
      setDraggedItem(null);
      setDragLevel(null);
      return;
    }

    const draggedIndex = navigations.findIndex(n => n.id === draggedItem);
    const targetIndex = navigations.findIndex(n => n.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      setDragLevel(null);
      return;
    }

    // Reorder locally
    const newNavigations = [...navigations];
    const [draggedNav] = newNavigations.splice(draggedIndex, 1);
    newNavigations.splice(targetIndex, 0, draggedNav);

    setNavigations(newNavigations);
    setDraggedItem(null);
    setDragLevel(null);

    // Update on backend
    const success = await reorderNavigationItems(newNavigations, 'super_category');
    if (!success) {
      await loadNavigations();
    }
  };

  const handleDropCategory = async (
    e: React.DragEvent<HTMLDivElement>,
    superCategoryId: string,
    targetCategoryId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverItem(null);

    if (!draggedItem || draggedItem === targetCategoryId || dragLevel !== 'category' || draggedParentId !== superCategoryId) {
      setDraggedItem(null);
      setDragLevel(null);
      setDraggedParentId(null);
      return;
    }

    const superCatIndex = navigations.findIndex(n => n.id === superCategoryId);
    if (superCatIndex === -1) {
      setDraggedItem(null);
      setDragLevel(null);
      setDraggedParentId(null);
      return;
    }

    // Sort categories by category_order first
    const sortedCategories = [...navigations[superCatIndex].categories].sort((a, b) => (a.category_order || 0) - (b.category_order || 0));
    const draggedIndex = sortedCategories.findIndex(c => c.id === draggedItem);
    const targetIndex = sortedCategories.findIndex(c => c.id === targetCategoryId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      setDragLevel(null);
      setDraggedParentId(null);
      return;
    }

    // Reorder locally
    const newNavigations = [...navigations];
    const categories = [...sortedCategories];
    const [draggedCat] = categories.splice(draggedIndex, 1);
    categories.splice(targetIndex, 0, draggedCat);
    newNavigations[superCatIndex].categories = categories;

    setNavigations(newNavigations);
    setDraggedItem(null);
    setDragLevel(null);
    setDraggedParentId(null);

    // Update on backend - each category gets its own order within this super category
    const orderData = categories.map((cat, index) => ({
      id: cat.id,
      category_order: index + 1
    }));
    await updateNavigationOrder(orderData);
  };

  const handleDropSubCategory = async (
    e: React.DragEvent<HTMLDivElement>,
    superCategoryId: string,
    categoryId: string,
    targetSubCategoryId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverItem(null);

    if (!draggedItem || draggedItem === targetSubCategoryId || dragLevel !== 'sub_category' || draggedParentId !== categoryId) {
      setDraggedItem(null);
      setDragLevel(null);
      setDraggedParentId(null);
      return;
    }

    const superCatIndex = navigations.findIndex(n => n.id === superCategoryId);
    if (superCatIndex === -1) {
      setDraggedItem(null);
      setDragLevel(null);
      setDraggedParentId(null);
      return;
    }

    const catIndex = navigations[superCatIndex].categories.findIndex(c => c.id === categoryId);
    if (catIndex === -1) {
      setDraggedItem(null);
      setDragLevel(null);
      setDraggedParentId(null);
      return;
    }

    // Sort sub-categories by sub_category_order first
    const sortedSubCategories = [...navigations[superCatIndex].categories[catIndex].sub_categories].sort((a, b) => (a.sub_category_order || 0) - (b.sub_category_order || 0));
    const draggedIndex = sortedSubCategories.findIndex(s => s.id === draggedItem);
    const targetIndex = sortedSubCategories.findIndex(s => s.id === targetSubCategoryId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      setDragLevel(null);
      setDraggedParentId(null);
      return;
    }

    // Reorder locally
    const newNavigations = [...navigations];
    const subCategories = [...sortedSubCategories];
    const [draggedSubCat] = subCategories.splice(draggedIndex, 1);
    subCategories.splice(targetIndex, 0, draggedSubCat);
    newNavigations[superCatIndex].categories[catIndex].sub_categories = subCategories;

    setNavigations(newNavigations);
    setDraggedItem(null);
    setDragLevel(null);
    setDraggedParentId(null);

    // Update on backend - each sub-category gets its own order within this category
    const orderData = subCategories.map((subCat, index) => ({
      id: subCat.id,
      sub_category_order: index + 1
    }));
    await updateNavigationOrder(orderData);
  };

  // Filter functions
  const getFilteredSuperCategories = () => {
    if (!superCategorySearch) return availableCollections;
    return availableCollections.filter(sc => 
      sc.title.toLowerCase().includes(superCategorySearch.toLowerCase())
    );
  };

  const getFilteredCategories = (superCategory: SuperCategoryOption) => {
    if (!categorySearch) return superCategory.categories;
    return superCategory.categories.filter(cat => 
      cat.title.toLowerCase().includes(categorySearch.toLowerCase())
    );
  };

  const getFilteredSubCategories = (category: CategoryOption) => {
    if (!subCategorySearch) return category.sub_categories;
    return category.sub_categories.filter(sub => 
      sub.title.toLowerCase().includes(subCategorySearch.toLowerCase())
    );
  };

  // Check if item is already in navigation
  const isInNavigation = (superCatId: string, catId?: string, subCatId?: string, isBrand?: boolean) => {
    return navigations.some(nav => {
      if (subCatId) {
        // Check if this is a brand (category_type === 'brand')
        if (isBrand) {
          // For brands, check if brand_id matches in the super_category
          // Brands are stored under "Shop by Brand" category with brand_id set
          return nav.super_category.id === superCatId && 
                 nav.categories.some(cat => 
                   (cat as any).level === 'shop-by-brand' && 
                   cat.sub_categories.some(sub => (sub as any).brand_id === subCatId)
                 );
        }
        // For regular sub-categories
        return nav.categories.some(cat => 
          cat.sub_categories.some(sub => 
            nav.super_category.id === superCatId && 
            cat.category.id === catId && 
            sub.sub_category.id === subCatId
          )
        );
      } else if (catId) {
        // For "Shop by Brand", check if super_category has a shop-by-brand level category
        if (catId.startsWith('shop-by-brand-')) {
          return nav.super_category.id === superCatId && 
                 nav.categories.some(cat => (cat as any).level === 'shop-by-brand');
        }
        return nav.categories.some(cat => 
          nav.super_category.id === superCatId && cat.category.id === catId
        );
      } else {
        return nav.super_category.id === superCatId;
      }
    });
  };

  const renderSubCategorySelector = (superCategoryId: string, categoryId: string, category: CategoryOption) => {
    if (showSubCategorySelector !== categoryId) return null;

    const filteredSubCategories = getFilteredSubCategories(category);

    return (
      <div className="border-t border-gray-200 bg-gray-100">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-medium text-gray-900">Sub-categories in {category.title}</h5>
          </div>
          
          <div className="mb-4">
            <div className="relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search sub-categories..."
                value={subCategorySearch}
                onChange={(e) => setSubCategorySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredSubCategories.map(subCategory => {
              const isBrand = (subCategory as any).category_type === 'brand';
              return (
              <div
                key={subCategory.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isInNavigation(superCategoryId, categoryId, subCategory.id, isBrand)
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200 hover:bg-gray-100'
                } transition-colors`}
              >
                <span className="font-medium text-gray-900">{subCategory.title}</span>
                {isInNavigation(superCategoryId, categoryId, subCategory.id, isBrand) ? (
                  <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                    ✓ Added
                  </span>
                ) : (
                  <button
                    onClick={() => handleAddSubCategory(superCategoryId, categoryId, subCategory)}
                    disabled={loadingItemId === subCategory.id}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium transition-colors flex items-center"
                  >
                    {loadingItemId === subCategory.id ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin className="mr-1" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPlus} className="mr-1" />
                        Add
                      </>
                    )}
                  </button>
                )}
              </div>
            );
            })}
            {filteredSubCategories.length === 0 && (
              <p className="text-gray-500 text-center py-4">No sub-categories found</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCategorySelector = (superCategory: SuperCategoryOption) => {
    if (showCategorySelector !== superCategory.id) return null;

    const filteredCategories = getFilteredCategories(superCategory);

    return (
      <div className="border-t border-gray-200 bg-blue-50">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-blue-900">Categories in {superCategory.title}</h4>
          </div>
          
          <div className="mb-4">
            <div className="relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredCategories.map(category => (
              <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div
                  className={`flex items-center justify-between p-3 ${
                    isInNavigation(superCategory.id, category.id)
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white hover:bg-gray-100'
                  } transition-colors`}
                >
                  <div className="flex items-center flex-1">
                    {/* Expand/Collapse Icon */}
                    {category.sub_categories.length > 0 && (
                      <button
                        onClick={() => {
                          if (showSubCategorySelector === category.id) {
                            setShowSubCategorySelector(null);
                          } else {
                            setShowSubCategorySelector(category.id);
                            setSubCategorySearch("");
                          }
                        }}
                        className="mr-3 p-2 hover:bg-blue-100 rounded-full transition-colors"
                      >
                        <FontAwesomeIcon 
                          icon={showSubCategorySelector === category.id ? faChevronDown : faChevronRight} 
                          className="text-blue-600"
                        />
                      </button>
                    )}
                    {/* Empty space for alignment when no sub-categories */}
                    {category.sub_categories.length === 0 && (
                      <div className="w-8 mr-3"></div>
                    )}
                    
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">{category.title}</span>
                      <span className="ml-2 text-xs text-blue-600 bg-indigo-100 px-2 py-1 rounded-full">
                        {category.sub_categories.length} sub-categories
                      </span>
                    </div>
                  </div>
                  
                  {/* Right side - Only Add button or Status */}
                  <div className="flex items-center">
                    {isInNavigation(superCategory.id, category.id) ? (
                      <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                        ✓ Added
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAddCategory(superCategory.id, category)}
                        disabled={loadingItemId === category.id}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors flex items-center"
                      >
                        {loadingItemId === category.id ? (
                          <>
                            <FontAwesomeIcon icon={faSpinner} spin className="mr-1" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faPlus} className="mr-1" />
                            Add
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                {renderSubCategorySelector(superCategory.id, category.id, category)}
              </div>
            ))}
            {filteredCategories.length === 0 && (
              <p className="text-gray-500 text-center py-6">No categories found</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSuperCategorySelector = () => {
    if (!showSuperCategorySelector) return null;

    const filteredSuperCategories = getFilteredSuperCategories();

    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8 min-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-indigo-50 rounded-t-lg">
            <div>
              <h2 className="text-2xl font-bold text-indigo-900">
                {modalMode === 'add' ? 'Add to Navigation' : 'Rearrange Navigation'}
              </h2>
              <p className="text-sm text-indigo-700 mt-1">
                {modalMode === 'add' 
                  ? 'Select categories to add to your website navigation' 
                  : 'Drag and drop to rearrange your navigation items'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Toggle Button */}
              <div className="flex items-center bg-white rounded-lg p-1 border border-gray-200">
                <button
                  onClick={() => setModalMode('add')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    modalMode === 'add'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  Add
                </button>
                <button
                  onClick={() => setModalMode('rearrange')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    modalMode === 'rearrange'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FontAwesomeIcon icon={faGripVertical} className="mr-2" />
                  Rearrange
                </button>
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowSuperCategorySelector(false);
                  setSuperCategorySearch("");
                  setShowCategorySelector(null);
                  setShowSubCategorySelector(null);
                  setCategorySearch("");
                  setSubCategorySearch("");
                  setModalMode('add');
                }}
                className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search super categories..."
                value={superCategorySearch}
                onChange={(e) => setSuperCategorySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {modalMode === 'add' ? (
              // Add Mode Content
              <div className="space-y-4">
                {filteredSuperCategories.map(superCategory => (
                  <div key={superCategory.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div
                      className={`flex items-center justify-between p-4 ${
                        isInNavigation(superCategory.id)
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white hover:bg-gray-100'
                      } transition-colors`}
                    >
                      <div className="flex items-center flex-1">
                        {/* Expand/Collapse Icon */}
                        {superCategory.categories.length > 0 && (
                          <button
                            onClick={() => {
                              if (showCategorySelector === superCategory.id) {
                                setShowCategorySelector(null);
                              } else {
                                setShowCategorySelector(superCategory.id);
                                setCategorySearch("");
                              }
                            }}
                            className="mr-4 p-2 hover:bg-indigo-100 rounded-full transition-colors"
                          >
                            <FontAwesomeIcon 
                              icon={showCategorySelector === superCategory.id ? faChevronDown : faChevronRight} 
                              className="text-indigo-600 text-lg"
                            />
                          </button>
                        )}
                        {/* Empty space for alignment when no categories */}
                        {superCategory.categories.length === 0 && (
                          <div className="w-10 mr-4"></div>
                        )}
                        
                        <div className="flex items-center">
                          <span className="text-lg font-semibold text-gray-900">{superCategory.title}</span>
                          <span className="ml-3 text-sm text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
                            {superCategory.categories.length} categories
                          </span>
                        </div>
                      </div>
                      
                      {/* Right side - Only Add button or Status */}
                      <div className="flex items-center">
                        {isInNavigation(superCategory.id) ? (
                          <span className="text-sm bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
                            ✓ Added
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAddSuperCategory(superCategory)}
                            disabled={loadingItemId === superCategory.id}
                            className="px-6 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium transition-colors flex items-center"
                          >
                            {loadingItemId === superCategory.id ? (
                              <>
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                Adding...
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                Add
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    {renderCategorySelector(superCategory)}
                  </div>
                ))}
                {filteredSuperCategories.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No super categories found</p>
                    <p className="text-gray-400 text-sm mt-2">Try adjusting your search terms</p>
                  </div>
                )}
              </div>
            ) : (
              // Rearrange Mode Content
              <div>
                {navigations.length === 0 ? (
                  <div className="text-center py-12 bg-gray-100 rounded-lg">
                    <p className="text-gray-500 mb-4">No navigation items to rearrange</p>
                    <p className="text-sm text-gray-400">Add items using the "Add" tab first</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Drag items to rearrange your navigation order</p>
                    {navigations
                      .sort((a, b) => (a.super_category_order || 0) - (b.super_category_order || 0))
                      .map(renderSuperCategory)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSubCategory = (subCategory: SubCategoryItem, superCategoryId: string, categoryId: string, index: number) => (
    <div 
      key={subCategory.id} 
      className={`flex items-center justify-between p-3 ml-12 bg-gray-100 rounded-md transition-all ${
        dragOverItem === subCategory.id && dragLevel === 'sub_category' ? 'bg-green-50 border-l-4 border-green-400' : ''
      } ${draggedItem === subCategory.id && dragLevel === 'sub_category' ? 'opacity-50' : ''}`}
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        handleDragStart(e, subCategory.id, 'sub_category', categoryId);
      }}
      onDragOver={(e) => handleDragOver(e, subCategory.id)}
      onDragLeave={(e) => handleDragLeave(e)}
      onDrop={(e) => handleDropSubCategory(e, superCategoryId, categoryId, subCategory.id)}
    >
      <div className="flex items-center">
        <div 
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-green-100 rounded transition-colors"
          title="Drag to reorder"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <FontAwesomeIcon icon={faGripVertical} className="text-gray-400" />
        </div>
        {subCategory.sub_category?.title && (
          <span className="text-sm font-medium text-gray-700">
            {subCategory.sub_category.title}
          </span>
        )}
        {subCategory.custom_label && (
          <span className="ml-2 text-xs font-medium text-gray-600 bg-white  px-2 py-1 rounded border border-gray-200">
            Display: {subCategory.custom_label}
          </span>
        )}
        {!subCategory.is_active && (
          <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
            Inactive
          </span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleEditCustomLabel(subCategory.id, subCategory.custom_label || "", subCategory.sub_category?.title || 'Untitled');
          }}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
          title="Edit custom label"
        >
          <FontAwesomeIcon icon={faPencil} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleActive(subCategory.id, subCategory.is_active);
          }}
          className={`p-2 rounded-md ${
            subCategory.is_active 
              ? 'text-green-600 hover:bg-green-50' 
              : 'text-gray-400 hover:bg-gray-100'
          }`}
          title={subCategory.is_active ? 'Hide from navigation' : 'Show in navigation'}
        >
          <FontAwesomeIcon icon={subCategory.is_active ? faEye : faEyeSlash} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteNavigation(subCategory.id, subCategory.sub_category?.title || 'Untitled');
          }}
          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
          title="Delete navigation item"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    </div>
  );

  const renderCategory = (category: CategoryWithSubs, superCategoryId: string) => (
    <div key={category.id} className="ml-6 border-l-2 border-gray-200 pl-4">
      <div 
        className={`flex items-center justify-between p-3 rounded-md mb-2 transition-all ${
          dragOverItem === category.id && dragLevel === 'category' ? 'bg-blue-50 border-l-4 border-blue-400' : ''
        } ${draggedItem === category.id && dragLevel === 'category' ? 'opacity-50' : ''}`}
        draggable
        onDragStart={(e) => {
          e.stopPropagation();
          handleDragStart(e, category.id, 'category', superCategoryId);
        }}
        onDragOver={(e) => handleDragOver(e, category.id)}
        onDragLeave={(e) => handleDragLeave(e)}
        onDrop={(e) => handleDropCategory(e, superCategoryId, category.id)}
      >
        <div className="flex items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCategoryExpansion(category.id);
            }}
            className="mr-2 p-1 hover:bg-blue-100 rounded"
          >
            <FontAwesomeIcon 
              icon={expandedCategories.has(category.id) ? faChevronDown : faChevronRight} 
              className="text-blue-600"
            />
          </button>
          <div 
            className="cursor-grab active:cursor-grabbing p-2 hover:bg-blue-100 rounded transition-colors"
            title="Drag to reorder"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <FontAwesomeIcon icon={faGripVertical} className="text-gray-400" />
          </div>
          <span className="font-medium text-blue-800">
            {category.category?.title || 'Untitled'}
          </span>
          {category.custom_label && (
            <span className="ml-2 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Display: {category.custom_label}
            </span>
          )}
          {!category.is_active && (
            <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
              Inactive
            </span>
          )}
          <span className="ml-2 text-xs text-blue-600 bg-indigo-100 px-2 py-1 rounded-full">
            {category.sub_categories.length} sub-categories
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditCustomLabel(category.id, category.custom_label || "", category.category?.title || 'Untitled');
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
            title="Edit custom label"
          >
            <FontAwesomeIcon icon={faPencil} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleActive(category.id, category.is_active);
            }}
            className={`p-2 rounded-md ${
              category.is_active 
                ? 'text-green-600 hover:bg-green-50' 
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            title={category.is_active ? 'Hide from navigation' : 'Show in navigation'}
          >
            <FontAwesomeIcon icon={category.is_active ? faEye : faEyeSlash} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteNavigation(category.id, category.category?.title || 'Untitled');
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md"
            title="Delete navigation item"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
      
      {expandedCategories.has(category.id) && (
        <div className="space-y-2 ml-4">
          {category.sub_categories
            .sort((a, b) => (a.sub_category_order || 0) - (b.sub_category_order || 0))
            .map((subCat, index) => renderSubCategory(subCat, superCategoryId, category.id, index))}
        </div>
      )}
    </div>
  );

  const renderSuperCategory = (superCategory: NavigationHierarchy) => (
    <div 
      key={superCategory.id} 
      className={`border border-gray-200 rounded-lg p-4 mb-4 transition-all ${
        dragOverItem === superCategory.id ? 'bg-indigo-50 border-indigo-400 shadow-md' : ''
      } ${draggedItem === superCategory.id ? 'opacity-50' : ''}`}
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        handleDragStart(e, superCategory.id, 'super_category');
      }}
      onDragOver={(e) => handleDragOver(e, superCategory.id)}
      onDragLeave={(e) => handleDragLeave(e)}
      onDrop={(e) => handleDropSuperCategory(e, superCategory.id)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <button
            onClick={() => toggleSuperCategoryExpansion(superCategory.id)}
            className="mr-3 p-2 hover:bg-gray-100 rounded"
          >
            <FontAwesomeIcon 
              icon={expandedSuperCategories.has(superCategory.id) ? faChevronDown : faChevronRight} 
              className="text-indigo-600"
            />
          </button>
          <div 
            className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded transition-colors"
            title="Drag to reorder"
          >
            <FontAwesomeIcon icon={faGripVertical} className="text-gray-400" />
          </div>
          <span className="text-lg font-semibold text-indigo-800">
            {superCategory.super_category?.title || 'Untitled'}
          </span>
          {superCategory.custom_label && (
            <span className="ml-2 text-sm font-medium text-indigo-600 bg-white-50 px-3 py-1 rounded-full border border-indigo-200">
              Display: {superCategory.custom_label}
            </span>
          )}
          {!superCategory.is_active && (
            <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
              Inactive
            </span>
          )}
          <span className="ml-2 text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
            {superCategory.categories.length} categories
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEditCustomLabel(superCategory.id, superCategory.custom_label || "", superCategory.super_category?.title || 'Untitled')}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
            title="Edit custom label"
          >
            <FontAwesomeIcon icon={faPencil} />
          </button>
          <button
            onClick={() => handleToggleActive(superCategory.id, superCategory.is_active)}
            className={`p-2 rounded-md ${
              superCategory.is_active 
                ? 'text-green-600 hover:bg-green-50' 
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            title={superCategory.is_active ? 'Hide from navigation' : 'Show in navigation'}
          >
            <FontAwesomeIcon icon={superCategory.is_active ? faEye : faEyeSlash} />
          </button>
          <button
            onClick={() => handleDeleteNavigation(superCategory.id, superCategory.super_category?.title || 'Untitled')}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md"
            title="Delete navigation item"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
      
      {expandedSuperCategories.has(superCategory.id) && (
        <div className="space-y-3">
          {superCategory.categories
            .sort((a, b) => (a.category_order || 0) - (b.category_order || 0))
            .map(cat => renderCategory(cat, superCategory.id))}
        </div>
      )}
    </div>
  );

  const renderCustomLabelModal = () => {
    if (!editingLabelId) return null;

    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Edit Custom Label</h3>
            <p className="text-sm text-gray-600 mt-1">Original: {editingLabelOriginal}</p>
          </div>
          
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Display Label
            </label>
            <input
              type="text"
              value={editingLabelValue}
              onChange={(e) => setEditingLabelValue(e.target.value)}
              placeholder="Leave empty to use original name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2">
              This label will be displayed to buyers instead of the original category name.
            </p>
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={handleCancelEditLabel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSaveCustomLabel(editingLabelId)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              Save Label
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Navigation Manager</h1>
        <p className="text-gray-600">Build your website navigation by selecting categories</p>
      </div>
      
      {/* Add Navigation Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowSuperCategorySelector(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          disabled={loading || showSuperCategorySelector}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add to Navigation
        </button>
      </div>

      {/* Super Category Selector */}
      {renderSuperCategorySelector()}
      
      {/* Navigation Hierarchy */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Current Navigation</h2>
          <button
            onClick={loadNavigations}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={loading}
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-1" />
                Refreshing...
              </>
            ) : (
              'Refresh'
            )}
          </button>
        </div>
        
        {loading && navigations.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <FontAwesomeIcon icon={faSpinner} spin className="text-2xl text-indigo-600 mr-3" />
            <span className="text-gray-600">Loading navigation...</span>
          </div>
        ) : navigations.length === 0 ? (
          <div className="text-center py-12 bg-gray-100 rounded-lg">
            <p className="text-gray-500 mb-4">No navigation items found</p>
            <p className="text-sm text-gray-400">Click "Add to Navigation" to start building your navigation</p>
          </div>
        ) : (
          <div className="space-y-4">
            {navigations
              .sort((a, b) => (a.super_category_order || 0) - (b.super_category_order || 0))
              .map(renderSuperCategory)}
          </div>
        )}
      </div>

      {/* Custom Label Modal */}
      {renderCustomLabelModal()}
    </div>
  );
};

export default NavigationManager;
