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
  faTimes
} from "@fortawesome/free-solid-svg-icons";
import {
  showSuccessMessage,
  showErrorMessage,
  showConfirmation,
} from "@/app/lib/swalConfig";
import {
  getStartExploring,
  getAvailableCollections,
  addStartExploring,
  updateStartExploring,
  deleteStartExploring,
  StartExploringHierarchy,
  SuperCategoryOption,
  CategoryOption,
  CategoryItem
} from "@/app/lib/services/admin/startExploringService";

// Main component
const StartExploringManager: React.FC = () => {
  const [startExploring, setStartExploring] = useState<StartExploringHierarchy[]>([]);
  const [availableCollections, setAvailableCollections] = useState<SuperCategoryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedSuperCategories, setExpandedSuperCategories] = useState<Set<string>>(new Set());

  // Selection state for hierarchical selection
  const [showSuperCategorySelector, setShowSuperCategorySelector] = useState(false);
  const [superCategorySearch, setSuperCategorySearch] = useState("");

  // Category selection state
  const [showCategorySelector, setShowCategorySelector] = useState<string | null>(null);
  const [categorySearch, setCategorySearch] = useState("");

  // Load data on component mount
  useEffect(() => {
    loadStartExploring();
    loadAvailableCollections();
  }, []);

  const loadStartExploring = async () => {
    setLoading(true);
    try {
      const data = await getStartExploring();
      setStartExploring(data);
    } catch (error) {
      console.error('Error loading start exploring:', error);
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
    setLoading(true);
    try {
      const success = await addStartExploring({
        super_category_id: superCategory.id,
        level: 'super_category'
      });
      if (success) {
        await loadStartExploring();
        setShowSuperCategorySelector(false);
        setSuperCategorySearch("");
      }
    } catch (error) {
      console.error('Error adding super category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (superCategoryId: string, category: CategoryOption) => {
    setLoading(true);
    try {
      const success = await addStartExploring({
        super_category_id: superCategoryId,
        category_id: category.id,
        level: 'category'
      });
      if (success) {
        await loadStartExploring();
        setShowCategorySelector(null);
        setCategorySearch("");
      }
    } catch (error) {
      console.error('Error adding category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const success = await updateStartExploring(id, { is_active: !currentStatus });
    if (success) {
      await loadStartExploring();
    }
  };

  const handleDeleteStartExploring = async (id: string, title: string) => {
    const result = await showConfirmation(
      "Delete Start Exploring",
      `Are you sure you want to delete "${title}" from start exploring? This action cannot be undone.`
    );

    if (result.isConfirmed) {
      const success = await deleteStartExploring(id);
      if (success) {
        await loadStartExploring();
      }
    }
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

  // Check if item is already in start exploring
  const isInStartExploring = (superCatId: string, catId?: string) => {
    return startExploring.some(item => {
      if (catId) {
        return item.categories.some(cat =>
          item.super_category.id === superCatId && cat.category.id === catId
        );
      } else {
        return item.super_category.id === superCatId;
      }
    });
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
                  className={`flex items-center justify-between p-3 ${isInStartExploring(superCategory.id, category.id)
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white hover:bg-gray-50'
                    } transition-colors`}
                >
                  <div className="flex items-center flex-1">
                    <div className="w-8 mr-3"></div>

                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">{category.title}</span>
                    </div>
                  </div>

                  {/* Right side - Only Add button or Status */}
                  <div className="flex items-center">
                    {isInStartExploring(superCategory.id, category.id) ? (
                      <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                        ✓ Added
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAddCategory(superCategory.id, category)}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
                      >
                        <FontAwesomeIcon icon={faPlus} className="mr-1" />
                        Add
                      </button>
                    )}
                  </div>
                </div>
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8 min-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-indigo-50 rounded-t-lg">
            <div>
              <h2 className="text-2xl font-bold text-indigo-900">Add to Start Exploring</h2>
              <p className="text-sm text-indigo-700 mt-1">Select categories to add to your start exploring section</p>
            </div>
            <button
              onClick={() => {
                setShowSuperCategorySelector(false);
                setSuperCategorySearch("");
                setShowCategorySelector(null);
                setCategorySearch("");
              }}
              className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
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
            <div className="space-y-4">
              {filteredSuperCategories.map(superCategory => (
                <div key={superCategory.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div
                    className={`flex items-center justify-between p-4 ${isInStartExploring(superCategory.id)
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white hover:bg-gray-50'
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
                      {isInStartExploring(superCategory.id) ? (
                        <span className="text-sm bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
                          ✓ Added
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddSuperCategory(superCategory)}
                          disabled={loading}
                          className="px-6 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium transition-colors"
                        >
                          <FontAwesomeIcon icon={faPlus} className="mr-2" />
                          Add
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
          </div>
        </div>
      </div>
    );
  };

  const renderCategory = (category: CategoryItem) => (
    <div key={category.id} className="ml-6 border-l-2 border-gray-200 pl-4">
      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md mb-2">
        <div className="flex items-center">
          <FontAwesomeIcon icon={faGripVertical} className="text-gray-400 mr-3" />
          <span className="font-medium text-blue-800">
            {category.category.title}
          </span>
          {!category.is_active && (
            <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
              Inactive
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleToggleActive(category.id, category.is_active)}
            className={`p-2 rounded-md ${category.is_active
                ? 'text-green-600 hover:bg-green-50'
                : 'text-gray-400 hover:bg-gray-100'
              }`}
            title={category.is_active ? 'Hide from start exploring' : 'Show in start exploring'}
          >
            <FontAwesomeIcon icon={category.is_active ? faEye : faEyeSlash} />
          </button>
          <button
            onClick={() => handleDeleteStartExploring(category.id, category.category.title)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md"
            title="Delete start exploring item"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSuperCategory = (superCategory: StartExploringHierarchy) => (
    <div key={superCategory.id} className="border border-gray-200 rounded-lg p-4 mb-4">
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
          <FontAwesomeIcon icon={faGripVertical} className="text-gray-400 mr-3" />
          <span className="text-lg font-semibold text-indigo-800">
            {superCategory.super_category.title}
          </span>
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
            onClick={() => handleToggleActive(superCategory.id, superCategory.is_active)}
            className={`p-2 rounded-md ${superCategory.is_active
                ? 'text-green-600 hover:bg-green-50'
                : 'text-gray-400 hover:bg-gray-100'
              }`}
            title={superCategory.is_active ? 'Hide from start exploring' : 'Show in start exploring'}
          >
            <FontAwesomeIcon icon={superCategory.is_active ? faEye : faEyeSlash} />
          </button>
          <button
            onClick={() => handleDeleteStartExploring(superCategory.id, superCategory.super_category.title)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md"
            title="Delete start exploring item"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>

      {expandedSuperCategories.has(superCategory.id) && (
        <div className="space-y-3">
          {superCategory.categories.map(renderCategory)}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Start Exploring Manager</h1>
        <p className="text-gray-600">Build your start exploring section by selecting categories</p>
      </div>

      {/* Add Start Exploring Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowSuperCategorySelector(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          disabled={loading || showSuperCategorySelector}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add to Start Exploring
        </button>
      </div>

      {/* Super Category Selector */}
      {renderSuperCategorySelector()}

      {/* Start Exploring Hierarchy */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Current Start Exploring</h2>
          <button
            onClick={loadStartExploring}
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

        {loading && startExploring.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <FontAwesomeIcon icon={faSpinner} spin className="text-2xl text-indigo-600 mr-3" />
            <span className="text-gray-600">Loading start exploring...</span>
          </div>
        ) : startExploring.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">No start exploring items found</p>
            <p className="text-sm text-gray-400">Click "Add to Start Exploring" to start building your start exploring section</p>
          </div>
        ) : (
          <div className="space-y-4">
            {startExploring.map(renderSuperCategory)}
          </div>
        )}
      </div>
    </div>
  );
};

export default StartExploringManager; 