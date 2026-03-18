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
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import {
  getAllProducts,
  deleteProduct,
  bulkDeleteProducts,
  bulkApproveProducts,
  ProductQueryParams,
  ProductsResponse,
} from "@/app/lib/services/admin/productService";
import Image from "next/image";
import ExportModal, { ExportParams } from "@/app/components/ExportModal";
import { exportProducts } from "@/app/lib/services/admin/exportService";

export default function ProductsPage() {
  const { setTitle } = usePageTitle();
  const [activeTab, setActiveTab] = useState("all");
  const [productsData, setProductsData] = useState<ProductsResponse>({
    products: [],
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalProducts: 0,
      limit: 20,
      hasNext: false,
      hasPrev: false,
    },
    filters: {},
    summary: {
      totalProducts: 0,
      activeProducts: 0,
      inactiveProducts: 0,
      draftProducts: 0,
      lowStockProducts: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [tabs] = useState([
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "approvalpending", label: "Approval Pending" },
    { id: "draft", label: "Draft" },
    { id: "archived", label: "Archived" },
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

  // Fetch products on component mount and when filters change
  useEffect(() => {
    loadProducts();
  }, [activeTab, currentPage, itemsPerPage, debouncedSearchTerm]);

  useEffect(() => {
    setTitle("Products");
  }, [setTitle]);

  // Function to load products
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const params: ProductQueryParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm || undefined,
        status:
          activeTab !== "all"
            ? activeTab === "archived"
              ? "inactive"
              : (activeTab as "active" | "draft" | "approvalpending")
            : undefined,
        sort: "newest",
      };

      const data = await getAllProducts(params);
      setProductsData(data);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete product
  const handleDeleteProduct = async (productId: string) => {
    const success = await deleteProduct(productId);
    if (success) {
      // Refresh the products list after successful deletion
      loadProducts();
    }
  };

  // Handle checkbox change for individual product
  const handleProductCheckboxChange = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
    setSelectAll(false);
  };

  // Handle select all checkbox
  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedProducts(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(productsData.products.map(p => p.id || ""));
      setSelectedProducts(allIds);
      setSelectAll(true);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) {
      return;
    }

    const result = await bulkDeleteProducts(Array.from(selectedProducts));
    
    // Deselect all on modal confirmation
    if (result.confirmed) {
      setSelectedProducts(new Set());
      setSelectAll(false);
      
      // Refresh list only on success (partial or full)
      if (result.success) {
        loadProducts();
      }
    }
  };

  // Handle bulk approve
  const handleBulkApprove = async () => {
    if (selectedProducts.size === 0) {
      return;
    }

    // Filter only approval pending products
    const approvalpendingProductIds = Array.from(selectedProducts).filter(id => {
      const product = productsData.products.find(p => p.id === id);
      return product?.status === 'approvalpending';
    });

    if (approvalpendingProductIds.length === 0) {
      return;
    }

    const result = await bulkApproveProducts(approvalpendingProductIds);
    
    // Deselect all on modal confirmation
    if (result.confirmed) {
      setSelectedProducts(new Set());
      setSelectAll(false);
      
      // Refresh list only on success (partial or full)
      if (result.success) {
        loadProducts();
      }
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
    await exportProducts({
      ...params,
      search: debouncedSearchTerm,
      status: activeTab === "all" ? undefined : activeTab,
    });
  };

  // Generate page numbers for pagination with first, last, and adjacent pages
  const generatePageNumbers = () => {
    const { currentPage, totalPages } = productsData.pagination;
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

  return (
    <div className="">
      {/* Tabs and Search */}
      <div className="bg-gray-bg rounded-lg p-5">
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
                {tab.id === "all" && productsData.summary && (
                  <span className="ml-1 text-gray-10">
                    ({productsData.summary.totalProducts})
                  </span>
                )}
                {tab.id === "active" && productsData.summary && (
                  <span className="ml-1 text-gray-10">
                    ({productsData.summary.activeProducts})
                  </span>
                )}
                {tab.id === "draft" && productsData.summary && (
                  <span className="ml-1 text-gray-10">
                    ({productsData.summary.draftProducts})
                  </span>
                )}
                {tab.id === "approvalpending" && productsData.summary && (
                  <span className="ml-1 text-gray-10">
                    ({productsData.summary.approvalpendingProducts || 0})
                  </span>
                )}
                {tab.id === "archived" && productsData.summary && (
                  <span className="ml-1 text-gray-10">
                    ({productsData.summary.inactiveProducts})
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
                  placeholder="Search by title, status, category, type, brand..."
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
                href="/admin/products/bulk-upload"
                className="px-4 py-2 bg-primary hover:bg-blue-10 text-white rounded-md xsmall-semibold flex items-center"
              >
                <FontAwesomeIcon icon={faUpload} className="mr-2" />
                Bulk Upload
              </Link>
              <Link
                href="/admin/products/addproduct"
                className="px-4 py-2 bg-primary text-white rounded-md xsmall-semibold flex items-center"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Product
              </Link>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-md">
          {selectedProducts.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 p-4 mb-4 rounded-md flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedProducts.size} product(s) selected
              </span>
              <div className="flex items-center space-x-2">
                {(() => {
                  const approvalpendingCount = Array.from(selectedProducts).filter(id => {
                    const product = productsData.products.find(p => p.id === id);
                    return product?.status === 'approvalpending';
                  }).length;
                  
                  return approvalpendingCount > 0 ? (
                    <button
                      onClick={handleBulkApprove}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md xsmall-semibold flex items-center"
                    >
                      <FontAwesomeIcon icon={faTrash} className="mr-2" />
                      Approve Selected ({approvalpendingCount})
                    </button>
                  ) : null;
                })()}
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md xsmall-semibold flex items-center"
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-2" />
                  Delete Selected
                </button>
              </div>
            </div>
          )}
          <table className="min-w-full rounded-md">
            <thead className="bg-gray-line">
              <tr>
                <th className="w-8 px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAllChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Product
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Inventory
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Brand
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Variants
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Vendor
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
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                  </tr>
                ))
              ) : productsData.products.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-20 text-center">
                    <div className="flex flex-col gap-2 justify-center items-center">
                      {searchTerm ? (
                        <span>
                          No products found matching your search criteria.
                        </span>
                      ) : (
                        <span>No products found. Create one!</span>
                      )}
                      <Link
                        href="/admin/products/addproduct"
                        className="px-4 py-2 bg-primary text-white rounded-md xsmall-semibold flex items-center"
                      >
                        Add Product
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                productsData.products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id || "")}
                        onChange={() => handleProductCheckboxChange(product.id || "")}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 xsmall">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 mr-3 bg-gray-200 rounded border border-gray-line flex items-center justify-center">
                          {/* For variant products, use default_image_urls; otherwise use image_urls */}
                          {product.default_image_urls &&
                          product.default_image_urls.length > 0 ? (
                            <Image
                              src={
                                typeof product.default_image_urls[0] === 'string'
                                  ? product.default_image_urls[0]
                                  : product.default_image_urls[0].url || ""
                              }
                              alt={
                                typeof product.default_image_urls[0] === 'string'
                                  ? product.title
                                  : product.default_image_urls[0].alt || product.title
                              }
                              className="h-full w-full object-cover rounded"
                              width={40}
                              height={40}
                            />
                          ) : product.image_urls &&
                            product.image_urls.length > 0 ? (
                            <Image
                              src={
                                typeof product.image_urls[0] === 'string'
                                  ? product.image_urls[0]
                                  : product.image_urls[0].url || ""
                              }
                              alt={
                                typeof product.image_urls[0] === 'string'
                                  ? product.title
                                  : product.image_urls[0].alt || product.title
                              }
                              className="h-full w-full object-cover rounded"
                              width={40}
                              height={40}
                            />
                          ) : (
                            <FontAwesomeIcon
                              icon={faImage}
                              className="text-gray-20"
                            />
                          )}
                        </div>
                        <span className="text-black">{product.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1.5 rounded-full xsmall-semibold inline-block ${
                          product.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : product.status === "approvalpending"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : product.status === "draft"
                            ? "bg-slate-50 text-slate-700 border border-slate-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {product.status === "approvalpending"
                          ? "Approval Pending"
                          : product.status.charAt(0).toUpperCase() +
                            product.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 xsmall text-black">
                      {/* Inventory column: show 'Inventory not tracked' if not tracked, or stock if tracked */}
                      {product.is_tracking_inventory ? (
                        product.stock_qty
                      ) : (
                        <span className="text-gray-10">
                          Inventory not tracked
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 xsmall text-black">
                      {product.category_hierarchy &&
                      (product.category_hierarchy.superCategories.length > 0 ||
                        product.category_hierarchy.categories.length > 0 ||
                        product.category_hierarchy.subCategories.length > 0) ? (
                        <div className="flex flex-col gap-1">
                          {product.category_hierarchy.superCategories.length >
                            0 && (
                            <div className="text-gray-10 text-xs">
                              <strong>Super:</strong>{" "}
                              {product.category_hierarchy.superCategories
                                .map((sc) => sc.title)
                                .join(", ")}
                            </div>
                          )}
                          {product.category_hierarchy.categories.length > 0 && (
                            <div className="text-gray-10 text-xs">
                              <strong>Cat:</strong>{" "}
                              {product.category_hierarchy.categories
                                .map((c) => c.title)
                                .join(", ")}
                            </div>
                          )}
                          {product.category_hierarchy.subCategories.length >
                            0 && (
                            <div className="text-black">
                              <strong>SubCat:</strong>{" "}
                              {product.category_hierarchy.subCategories
                                .map((sc) => sc.title)
                                .join(", ")}
                            </div>
                          )}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 xsmall text-black">
                      {product.type || "-"}
                    </td>
                    <td className="px-6 py-4 xsmall text-black">
                      {product.brand || "-"}
                    </td>
                    <td className="px-1 py-2 xsmall text-black">
                      {product.has_variant && product.variant_count ? (
                        <span className="px-3 py-1.5 rounded-full xsmall-semibold inline-block text-blue-700 border border-blue-200">
                          {product.variant_count}-variant{product.variant_count !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-gray-10">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 xsmall text-black">
                      {product.vendor || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/products/${product.id}/view`}
                          className="text-blue-600 hover:text-blue-800"
                          title="View"
                        >
                          <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
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
                            handleDeleteProduct(product.id || "");
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
        {productsData.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-gray-10 xsmall">
              Showing{" "}
              {(productsData.pagination.currentPage - 1) *
                productsData.pagination.limit +
                1}{" "}
              to{" "}
              {Math.min(
                productsData.pagination.currentPage *
                  productsData.pagination.limit,
                productsData.pagination.totalProducts
              )}{" "}
              of {productsData.pagination.totalProducts} products
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  handlePageChange(productsData.pagination.currentPage - 1)
                }
                disabled={!productsData.pagination.hasPrev}
                className={`px-3 py-1 rounded-md xsmall-semibold flex items-center ${
                  productsData.pagination.hasPrev
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
                      : pageNumber === productsData.pagination.currentPage
                      ? "bg-primary text-white"
                      : "bg-white border border-gray-line text-gray-10 hover:bg-gray-50"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                onClick={() =>
                  handlePageChange(productsData.pagination.currentPage + 1)
                }
                disabled={!productsData.pagination.hasNext}
                className={`px-3 py-1 rounded-md xsmall-semibold flex items-center ${
                  productsData.pagination.hasNext
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
        title="Products"
        totalCount={productsData.pagination.totalProducts}
      />
    </div>
  );
}
