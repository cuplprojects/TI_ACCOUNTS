"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faSearch, faEye } from "@fortawesome/free-solid-svg-icons";
import {
  getAllBrands,
  deleteBrand,
  bulkDeleteBrands,
  Brand,
} from "@/app/lib/services/admin/brandService";

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalBrands: number;
  limit: number;
}

export default function BrandsPage() {
  const { setTitle } = usePageTitle();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalBrands: 0,
    limit: 20,
  });

  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const [tabs] = useState([
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "inactive", label: "Inactive" },
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

  useEffect(() => {
    setTitle("Brands");
  }, [setTitle]);

  // Fetch brands on component mount and when filters change
  useEffect(() => {
    let isMounted = true;

    const loadBrands = async () => {
      setIsLoading(true);
      try {
        const result = await getAllBrands(
          currentPage,
          itemsPerPage,
          debouncedSearchTerm,
          statusFilter === "all" ? "" : statusFilter
        );

        if (isMounted && result) {
          setBrands(result.brands);
          setPagination(result.pagination);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching brands:", error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadBrands();

    return () => {
      isMounted = false;
    };
  }, [statusFilter, currentPage, itemsPerPage, debouncedSearchTerm, refreshTrigger]);

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
    const success = await deleteBrand(id);
    if (success) {
      setCurrentPage(1);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const handleBrandCheckboxChange = (brandId: string) => {
    const newSelected = new Set(selectedBrands);
    if (newSelected.has(brandId)) {
      newSelected.delete(brandId);
    } else {
      newSelected.add(brandId);
    }
    setSelectedBrands(newSelected);
    setSelectAll(false);
  };

  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedBrands(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(brands.map(b => b.id).filter(Boolean) as string[]);
      setSelectedBrands(allIds);
      setSelectAll(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBrands.size === 0) {
      return;
    }

    const result = await bulkDeleteBrands(Array.from(selectedBrands));
    
    if (result.confirmed) {
      setSelectedBrands(new Set());
      setSelectAll(false);
      
      if (result.success) {
        setCurrentPage(1);
        setRefreshTrigger((prev) => prev + 1);
      }
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
                  placeholder="Search by brand name..."
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
                href="/admin/brands/create"
                className="px-4 py-2 bg-primary text-white rounded-md xsmall-semibold flex items-center"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Brand
              </Link>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-md">
          {selectedBrands.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 p-4 mb-4 rounded-md flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedBrands.size} brand(s) selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md xsmall-semibold flex items-center"
              >
                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                Delete Selected
              </button>
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
                  Logo
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Brand Name
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Description
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Sellers
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
                // Skeleton loader - show actual number of brands or 5 if loading first time
                Array.from({ length: brands.length > 0 ? brands.length : 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-4"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    </td>
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
              ) : brands.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col gap-2 justify-center items-center">
                      {searchTerm ? (
                        <span>No brands found matching your search criteria.</span>
                      ) : (
                        <span>No brands found. Create one!</span>
                      )}
                      <Link
                        href="/admin/brands/create"
                        className="px-4 py-2 bg-primary text-white rounded-md xsmall-semibold flex items-center"
                      >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        Add Brand
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                brands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedBrands.has(brand.id || "")}
                        onChange={() => handleBrandCheckboxChange(brand.id || "")}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {brand.logo_url ? (
                          <img
                            src={brand.logo_url}
                            alt={brand.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="text-xs text-gray-400 text-center">No Logo</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 xsmall text-gray-900">
                      <Link
                        href={`/admin/brands/view/${brand.id}`}
                        className="text-gray-900 hover:text-gray-700 no-underline"
                      >
                        {brand.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 xsmall text-gray-600">
                      {brand.description
                        ? brand.description.substring(0, 50) + "..."
                        : "-"}
                    </td>
                    <td className="px-6 py-4 xsmall text-gray-600">
                      {brand.seller_count || 0}
                    </td>
                    <td className="px-6 py-4 xsmall">
                      <span
                        className={`px-3 py-1 rounded-full xsmall-semibold ${
                          brand.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {brand.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 xsmall flex gap-3">
                      <Link
                        href={`/admin/brands/view/${brand.id}`}
                        className="text-blue-500 hover:text-blue-700"
                        title="View"
                      >
                        <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/brands/${brand.id}`}
                        className="text-primary hover:text-primary-dark"
                        title="Edit"
                      >
                        <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(brand.id || "")}
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
        {!isLoading && brands.length > 0 && (
          <div className="flex items-center justify-between mt-4 px-6 py-4">
            <div className="xsmall text-gray-10">
              Showing {brands.length} of {pagination.totalBrands} brands
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
