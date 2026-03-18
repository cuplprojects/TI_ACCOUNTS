"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faSearch, faEye, faX } from "@fortawesome/free-solid-svg-icons";
import {
  getAllProductTypes,
  deleteProductType,
  bulkDeleteProductTypes,
  ProductType,
} from "@/app/lib/services/admin/productTypeService";

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalProductTypes: number;
  limit: number;
}

export default function ProductTypesPage() {
  const { setTitle } = usePageTitle();
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalProductTypes: 0,
    limit: 20,
  });

  const [tabs] = useState([
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "inactive", label: "Inactive" },
  ]);

  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  useEffect(() => {
    setTitle("Product Types");
  }, [setTitle]);

  // Fetch product types on component mount and when filters change
  useEffect(() => {
    let isMounted = true;

    const loadProductTypes = async () => {
      setIsLoading(true);
      try {
        const result = await getAllProductTypes(
          currentPage,
          itemsPerPage,
          debouncedSearchTerm,
          statusFilter === "all" ? "" : statusFilter
        );

        if (isMounted && result) {
          setProductTypes(result.productTypes);
          setPagination(result.pagination);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching product types:", error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProductTypes();

    return () => {
      isMounted = false;
    };
  }, [statusFilter, currentPage, itemsPerPage, debouncedSearchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (tabId: string) => {
    setStatusFilter(tabId);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteProductType(id);
    if (success) {
      setCurrentPage(1);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProductTypes([]);
    } else {
      setSelectedProductTypes(productTypes.map((pt) => pt.id!).filter(Boolean));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectProductType = (id: string) => {
    if (selectedProductTypes.includes(id)) {
      setSelectedProductTypes(
        selectedProductTypes.filter((ptId) => ptId !== id)
      );
    } else {
      setSelectedProductTypes([...selectedProductTypes, id]);
    }
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    const result = await bulkDeleteProductTypes(selectedProductTypes);
    setIsDeleting(false);
    
    if (result.success && result.confirmed) {
      // Remove deleted product types from the list
      const remainingProductTypes = productTypes.filter(
        (pt) => !selectedProductTypes.includes(pt.id!)
      );
      setProductTypes(remainingProductTypes);
      setSelectedProductTypes([]);
      setSelectAll(false);
    } else if (result.confirmed) {
      // User confirmed but deletion failed - just deselect
      setSelectedProductTypes([]);
      setSelectAll(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const { currentPage, totalPages } = pagination;
    const pageNumbers: (number | string)[] = [];
    const adjacentPages = 2;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      const startPage = Math.max(2, currentPage - adjacentPages);
      const endPage = Math.min(totalPages - 1, currentPage + adjacentPages);

      if (startPage > 2) {
        pageNumbers.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== totalPages) {
          pageNumbers.push(i);
        }
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }

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
        {selectedProductTypes.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between">
            <span className="xsmall-semibold text-black">
              {selectedProductTypes.length} product type{selectedProductTypes.length !== 1 ? 's' : ''} selected
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
                  setSelectedProductTypes([]);
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
                onClick={() => handleStatusFilter(tab.id)}
                className={`px-3 py-1 rounded-md xsmall-semibold ${
                  statusFilter === tab.id
                    ? "bg-gray-line text-black"
                    : "border-transparent text-gray-10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center flex-1 max-w-md">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by product type name..."
                  value={searchTerm}
                  onChange={handleSearch}
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
              <Link
                href="/admin/product-types/create"
                className="px-4 py-2 bg-primary text-white rounded-md xsmall-semibold flex items-center"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Product Type
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
                  Product Type Name
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Description
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Brands
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-line">
              {isLoading ? (
                // Skeleton loader
                Array.from({ length: itemsPerPage }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-4"></div></td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-40"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-48"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                  </tr>
                ))
              ) : productTypes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col gap-2 justify-center items-center">
                      {searchTerm ? (
                        <span>No product types found matching your search criteria.</span>
                      ) : (
                        <span>No product types found. Create one!</span>
                      )}
                      <Link
                        href="/admin/product-types/create"
                        className="px-4 py-2 bg-primary text-white rounded-md xsmall-semibold flex items-center"
                      >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        Add Product Type
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                productTypes.map((productType) => (
                  <tr key={productType.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={selectedProductTypes.includes(productType.id!)}
                        onChange={() => handleSelectProductType(productType.id!)}
                      />
                    </td>
                    <td className="px-6 py-4 xsmall text-gray-900">
                      <Link
                        href={`/admin/product-types/view/${productType.id}`}
                        className="text-gray-900 hover:text-gray-700 no-underline"
                      >
                        {productType.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 xsmall text-gray-600">
                      {productType.description
                        ? productType.description.substring(0, 50) + "..."
                        : "-"}
                    </td>
                    <td className="px-6 py-4 xsmall text-gray-600">
                      {productType.brand_count || 0}
                    </td>
                    <td className="px-6 py-4 xsmall">
                      <span
                        className={`px-3 py-1 rounded-full xsmall-semibold ${
                          productType.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {productType.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 xsmall flex gap-3">
                      <Link
                        href={`/admin/product-types/view/${productType.id}`}
                        className="text-blue-500 hover:text-blue-700"
                        title="View"
                      >
                        <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/product-types/${productType.id}`}
                        className="text-primary hover:text-primary-dark"
                        title="Edit"
                      >
                        <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(productType.id || "")}
                        className="text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && productTypes.length > 0 && (
          <div className="flex items-center justify-between mt-4 px-6 py-4">
            <div className="xsmall text-gray-10">
              Showing {productTypes.length} of {pagination.totalProductTypes} product types
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 border border-gray-line rounded-md disabled:opacity-50 hover:bg-gray-50 xsmall"
              >
                Previous
              </button>

              {generatePageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (typeof page === "number") {
                      handlePageChange(page);
                    }
                  }}
                  disabled={page === "..."}
                  className={`px-3 py-1 rounded-md xsmall ${
                    page === pagination.currentPage
                      ? "bg-primary text-white"
                      : page === "..."
                      ? "cursor-default"
                      : "border border-gray-line hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1 border border-gray-line rounded-md disabled:opacity-50 hover:bg-gray-50 xsmall"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
