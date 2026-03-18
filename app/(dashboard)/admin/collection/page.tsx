"use client";

import React, { useEffect, useState } from "react";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faImage,
  faEye,
  faEdit,
  faTrash,
  faChevronLeft,
  faChevronRight,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import {
  getAllCollections,
  deleteCollection,
  bulkDeleteCollections,
  CollectionQueryParams,
  CollectionsResponse,
} from "@/app/lib/services/admin/collectionService";
import ExportModal, { ExportParams } from "@/app/components/ExportModal";
import { exportCollections } from "@/app/lib/services/admin/exportService";

export default function CollectionPage() {
  const { setTitle } = usePageTitle();
  const [activeTab, setActiveTab] = useState("all");
  const [collectionsData, setCollectionsData] = useState<CollectionsResponse>({
    collections: [],
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalCollections: 0,
      limit: 20,
      hasNext: false,
      hasPrev: false,
    },
    filters: {
      search: null,
      category_type: null,
      collection_type: null,
      sort: "newest",
    },
    summary: {
      totalCollections: 0,
      superCategories: 0,
      categories: 0,
      subCategories: 0,
      manualCollections: 0,
      smartCollections: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showExportModal, setShowExportModal] = useState(false);
  const [sortOption, setSortOption] = useState<
    "newest" | "oldest" | "title_asc" | "title_desc"
  >("newest");
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tabs] = useState([
    { id: "all", label: "All" },
    { id: "super-category", label: "Super Categories" },
    { id: "category", label: "Categories" },
    { id: "sub-category", label: "Sub Categories" },
  ]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm]);

  // Fetch collections on component mount and when filters change
  useEffect(() => {
    loadCollections();
  }, [activeTab, currentPage, itemsPerPage, debouncedSearchTerm, sortOption]);

  useEffect(() => {
    setTitle("Collections");
  }, [setTitle]);

  // Function to load collections
  const loadCollections = async () => {
    setIsLoading(true);
    try {
      const params: CollectionQueryParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm || undefined,
        category_type:
          activeTab !== "all"
            ? (activeTab as "super-category" | "category" | "sub-category")
            : undefined,
        sort: sortOption,
      };

      const data = await getAllCollections(params);
      setCollectionsData(data);
    } catch (error) {
      console.error("Failed to load collections:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete collection
  const handleDeleteCollection = async (collectionId: string) => {
    const success = await deleteCollection(collectionId);
    if (success) {
      // Refresh the collections list after successful deletion
      loadCollections();
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCollections([]);
    } else {
      setSelectedCollections(collectionsData.collections.map((c) => c.id!).filter(Boolean));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectCollection = (id: string) => {
    if (selectedCollections.includes(id)) {
      setSelectedCollections(
        selectedCollections.filter((collectionId) => collectionId !== id)
      );
    } else {
      setSelectedCollections([...selectedCollections, id]);
    }
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    const result = await bulkDeleteCollections(selectedCollections);
    setIsDeleting(false);
    
    if (result.success && result.confirmed) {
      // Remove deleted collections from the list
      const remainingCollections = collectionsData.collections.filter(
        (c) => !selectedCollections.includes(c.id!)
      );
      setCollectionsData({
        ...collectionsData,
        collections: remainingCollections,
      });
      setSelectedCollections([]);
      setSelectAll(false);
    } else if (result.confirmed) {
      // User confirmed but deletion failed - just deselect
      setSelectedCollections([]);
      setSelectAll(false);
    }
  };

  // Handle search with debounce
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Handle export
  const handleExport = async (params: ExportParams) => {
    await exportCollections({
      ...params,
      search: debouncedSearchTerm,
      category_type: activeTab === "all" ? undefined : activeTab,
    });
  };

  // Generate page numbers for pagination with first, last, and adjacent pages
  const generatePageNumbers = () => {
    const { currentPage, totalPages } = collectionsData.pagination;
    const pageNumbers: (number | string)[] = [];
    const adjacentPages = 2; // Show 2 pages on each side of current page

    if (totalPages <= 7) {
      // If total pages is 7 or less, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      // Calculate start and end of adjacent pages
      const startPage = Math.max(2, currentPage - adjacentPages);
      const endPage = Math.min(totalPages - 1, currentPage + adjacentPages);

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push("...");
      }

      // Add adjacent pages
      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== totalPages) {
          pageNumbers.push(i);
        }
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }

      // Always show last page if total pages > 1
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  // Format category type for display
  const formatCategoryType = (categoryType: string) => {
    return categoryType
      .replace(/-/g, " ")
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Format operator to human-readable format
  function formatOperator(operator: string): string {
    switch (operator) {
      case "eq":
        return "equals to";
      case "not_eq":
        return "not equals to";
      case "gt":
        return "greater than";
      case "lt":
        return "less than";
      case "contains":
        return "contains";
      default:
        return operator;
    }
  }

  function isConditionObject(
    cond: unknown
  ): cond is { field: string; operator: string; value: unknown } {
    return (
      typeof cond === "object" &&
      cond !== null &&
      "field" in cond &&
      "operator" in cond &&
      "value" in cond
    );
  }

  return (
    <div className="">
      {/* Tabs and Search */}
      <div className="bg-gray-bg rounded-lg p-5">
        {selectedCollections.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between">
            <span className="xsmall-semibold text-black">
              {selectedCollections.length} collection{selectedCollections.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md xsmall-semibold hover:bg-red-700 disabled:opacity-50"
              >
                Delete Selected
              </button>
              <button
                onClick={() => {
                  setSelectedCollections([]);
                  setSelectAll(false);
                }}
                disabled={isDeleting}
                className="p-2 text-gray-600 hover:text-gray-800"
              >
                <FontAwesomeIcon icon={faX} className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-3 py-1 rounded-md xsmall-semibold ${
                  activeTab === tab.id
                    ? "bg-gray-line text-black"
                    : "border-transparent text-gray-10"
                }`}
              >
                {tab.label}
                {tab.id === "all" && collectionsData.summary && (
                  <span className="ml-1 text-gray-10">
                    ({collectionsData.summary.totalCollections})
                  </span>
                )}
                {tab.id === "super-category" && collectionsData.summary && (
                  <span className="ml-1 text-gray-10">
                    ({collectionsData.summary.superCategories})
                  </span>
                )}
                {tab.id === "category" && collectionsData.summary && (
                  <span className="ml-1 text-gray-10">
                    ({collectionsData.summary.categories})
                  </span>
                )}
                {tab.id === "sub-category" && collectionsData.summary && (
                  <span className="ml-1 text-gray-10">
                    ({collectionsData.summary.subCategories})
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center flex-1 max-w-md">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by title, description, page title..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-line rounded-md xsmall placeholder:xsmall focus:outline-none text-gray-10"
                />
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-10 h-3 w-3"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={itemsPerPage}
                onChange={(e) =>
                  handleItemsPerPageChange(Number(e.target.value))
                }
                className="px-3 py-2 bg-white border border-gray-line rounded-md xsmall focus:outline-none"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
              <button
                onClick={() => setShowExportModal(true)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md xsmall-semibold"
              >
                Export
              </button>
              <Link
                href="/admin/collection/create"
                className="px-4 py-2 bg-primary text-white rounded-md xsmall-semibold flex items-center"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Create Collection
              </Link>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-md">
          <table className="min-w-full rounded-md">
            <thead className="bg-gray-line">
              <tr>
                <th className="w-8 px-6 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Collection
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Category Type
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Collection Type
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Products Conditions
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-line">
              {isLoading ? (
                // Skeleton loader - maintains table structure
                Array.from({ length: itemsPerPage }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-4"></div></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 mr-3 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-40"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                  </tr>
                ))
              ) : collectionsData.collections.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col gap-2 justify-center items-center">
                      {searchTerm ? (
                        <span>
                          No collections found matching your search criteria.
                        </span>
                      ) : (
                        <span>No collections found. Create one!</span>
                      )}
                      <Link
                        href="/admin/collection/create"
                        className="px-4 py-2 bg-primary text-white rounded-md xsmall-semibold flex items-center"
                      >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        Create Collection
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                collectionsData.collections.map((collection) => (
                  <tr key={collection.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={selectedCollections.includes(collection.id!)}
                        onChange={() => handleSelectCollection(collection.id!)}
                      />
                    </td>
                    <td className="px-6 py-4 xsmall">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 mr-3 bg-gray-200 rounded border border-gray-line flex items-center justify-center">
                          {collection.image_url ? (
                            <img
                              src={collection.image_url}
                              alt={collection.title}
                              className="h-full w-full object-cover rounded"
                              style={{ width: 40, height: 40 }}
                            />
                          ) : (
                            <FontAwesomeIcon
                              icon={faImage}
                              className="text-gray-20"
                            />
                          )}
                        </div>
                        <Link
                          href={`/admin/collection/create?id=${collection.id}`}
                          className="text-black hover:text-primary hover:underline"
                        >
                          {collection.title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 xsmall text-black">
                      {formatCategoryType(collection.category_type)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full xsmall-semibold ${
                          collection.collection_type === "Smart"
                            ? "bg-blue-100 text-blue-800"
                            : collection.collection_type === "Manual"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {collection.collection_type || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        {collection.conditions &&
                        Array.isArray(collection.conditions)
                          ? (collection.conditions as unknown[]).map(
                              (cond, condIndex) => (
                                <div
                                  key={condIndex}
                                  className="xsmall text-black"
                                >
                                  {typeof cond === "string"
                                    ? cond
                                    : isConditionObject(cond)
                                    ? `Product ${cond.field} ${formatOperator(
                                        cond.operator
                                      )} ${cond.value}`
                                    : "-"}
                                </div>
                              )
                            )
                          : collection.conditions &&
                            typeof collection.conditions === "object"
                          ? Object.entries(
                              collection.conditions as Record<string, unknown>
                            ).map(([key, value], i) => (
                              <div key={i} className="xsmall text-black">
                                {`${key}: ${JSON.stringify(value)}`}
                              </div>
                            ))
                          : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/collection/create?id=${collection.id}&mode=view`}
                          className="text-blue-600 hover:text-blue-800"
                          title="View"
                        >
                          <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/collection/create?id=${collection.id}`}
                          className="text-green-600 hover:text-green-800"
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                        </Link>
                        <button
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCollection(collection.id || "");
                          }}
                        >
                          <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {collectionsData.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-gray-10 xsmall">
              Showing{" "}
              {(collectionsData.pagination.currentPage - 1) *
                collectionsData.pagination.limit +
                1}{" "}
              to{" "}
              {Math.min(
                collectionsData.pagination.currentPage *
                  collectionsData.pagination.limit,
                collectionsData.pagination.totalCollections
              )}{" "}
              of {collectionsData.pagination.totalCollections} collections
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  handlePageChange(collectionsData.pagination.currentPage - 1)
                }
                disabled={!collectionsData.pagination.hasPrev}
                className={`px-3 py-1 rounded-md xsmall-semibold flex items-center ${
                  collectionsData.pagination.hasPrev
                    ? "bg-white border border-gray-line text-gray-10 hover:bg-gray-50"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <FontAwesomeIcon icon={faChevronLeft} className="mr-1" />
                Previous
              </button>

              {generatePageNumbers().map((pageNumber, index) => (
                <button
                  key={index}
                  onClick={() =>
                    typeof pageNumber === "number"
                      ? handlePageChange(pageNumber)
                      : undefined
                  }
                  disabled={typeof pageNumber === "string"}
                  className={`px-3 py-1 rounded-md xsmall-semibold ${
                    typeof pageNumber === "string"
                      ? "bg-transparent text-gray-10 cursor-default"
                      : pageNumber === collectionsData.pagination.currentPage
                      ? "bg-primary text-white"
                      : "bg-white border border-gray-line text-gray-10 hover:bg-gray-50"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                onClick={() =>
                  handlePageChange(collectionsData.pagination.currentPage + 1)
                }
                disabled={!collectionsData.pagination.hasNext}
                className={`px-3 py-1 rounded-md xsmall-semibold flex items-center ${
                  collectionsData.pagination.hasNext
                    ? "bg-white border border-gray-line text-gray-10 hover:bg-gray-50"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                Next
                <FontAwesomeIcon icon={faChevronRight} className="ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        title="Collections"
        totalCount={collectionsData.pagination.totalCollections}
      />
    </div>
  );
}
