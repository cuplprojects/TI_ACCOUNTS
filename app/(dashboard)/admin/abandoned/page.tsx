"use client";

import React, { useEffect, useState } from "react";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faEye,
  faChevronLeft,
  faChevronRight,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import {
  getAllAbandonedCarts,
  bulkDeleteAbandonedCarts,
  AbandonedCart,
} from "@/app/lib/services/admin/abandonedService";
import { showErrorMessage } from "@/app/lib/swalConfig";
import ExportModal, { ExportParams } from "@/app/components/ExportModal";
import { exportAbandonedCarts } from "@/app/lib/services/admin/exportService";

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCarts: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function AbandonedCheckoutsPage() {
  const { setTitle } = usePageTitle();
  const [activeTab, setActiveTab] = useState("all");
  const [checkouts, setCheckouts] = useState<AbandonedCart[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 0,
    totalCarts: 0,
    limit: 20,
    hasNext: false,
    hasPrev: false,
  });
  const [selectedCarts, setSelectedCarts] = useState<string[]>([]);
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
    setTitle("Abandoned Checkouts");
  }, [setTitle]);

  // Fetch abandoned carts with pagination
  useEffect(() => {
    loadAbandonedCarts();
  }, [currentPage, itemsPerPage, debouncedSearchTerm, sortBy, sortOrder]);

  const loadAbandonedCarts = async () => {
    try {
      setLoading(true);
      const response = await getAllAbandonedCarts({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm || undefined,
        sort_by: sortBy || 'createdAt',
        sort_order: sortOrder,
      });

      if (response) {
        setCheckouts(response.carts);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Error loading abandoned carts:", error);
      showErrorMessage("Failed to load abandoned carts");
    } finally {
      setLoading(false);
    }
  };

  // Format date for display - DD/MM/YYYY HH:MM
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Calculate total from cart items
  const calculateCartTotal = (
    cartItems: { price: number; quantity: number }[]
  ) => {
    return cartItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  // Handle column sort
  const handleColumnSort = (field: 'createdAt') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'DESC' ? 'ASC' : 'DESC');
    } else {
      setSortBy(field);
      setSortOrder('DESC');
    }
    setCurrentPage(1);
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const adjacentPages = 2;

    if (pagination.totalPages <= 7) {
      for (let i = 1; i <= pagination.totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      const startPage = Math.max(2, pagination.currentPage - adjacentPages);
      const endPage = Math.min(pagination.totalPages - 1, pagination.currentPage + adjacentPages);

      if (startPage > 2) {
        pageNumbers.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== pagination.totalPages) {
          pageNumbers.push(i);
        }
      }

      if (endPage < pagination.totalPages - 1) {
        pageNumbers.push("...");
      }

      if (pagination.totalPages > 1) {
        pageNumbers.push(pagination.totalPages);
      }
    }

    return pageNumbers;
  };

  const handleExport = async (params: ExportParams) => {
    await exportAbandonedCarts({
      ...params,
      search: searchTerm,
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCarts([]);
    } else {
      setSelectedCarts(checkouts.map((c) => c.id).filter(Boolean));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectCart = (id: string) => {
    if (selectedCarts.includes(id)) {
      setSelectedCarts(selectedCarts.filter((cartId) => cartId !== id));
    } else {
      setSelectedCarts([...selectedCarts, id]);
    }
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    const result = await bulkDeleteAbandonedCarts(selectedCarts);
    setIsDeleting(false);
    
    if (result.success && result.confirmed) {
      const remainingCarts = checkouts.filter(
        (c) => !selectedCarts.includes(c.id)
      );
      setCheckouts(remainingCarts);
      setSelectedCarts([]);
      setSelectAll(false);
    } else if (result.confirmed) {
      setSelectedCarts([]);
      setSelectAll(false);
    }
  };

  return (
    <div className="">
      {/* Tabs and Search */}
      <div className="main-container shadow-sm">
        {selectedCarts.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between">
            <span className="xsmall-semibold text-black">
              {selectedCarts.length} cart{selectedCarts.length !== 1 ? 's' : ''} selected
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
                  setSelectedCarts([]);
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
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-2 rounded-md xsmall-semibold  ${
                activeTab === "all"
                  ? "bg-blue-60 text-black"
                  : "border-transparent text-gray-500"
              }`}
            >
              All
            </button>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center flex-1 max-w-md">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by ID, customer, email, total..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-line rounded-md xsmall placeholder:xsmall focus:outline-none text-gray-10"
                  value={searchTerm}
                  onChange={handleSearchChange}
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
              </select>
              <button
                onClick={() => setShowExportModal(true)}
                className="px-4 py-2 bg-primary text-white rounded-md xsmall-semibold flex items-center"
              >
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full rounded-lg">
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
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase cursor-pointer hover:bg-gray-50" onClick={() => handleColumnSort('createdAt')}>
                  Checkout{" "}
                  {sortBy === 'createdAt' && (
                    <span className="text-gray-10">{sortOrder === 'DESC' ? '↓' : '↑'}</span>
                  )}
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase cursor-pointer hover:bg-gray-50" onClick={() => handleColumnSort('createdAt')}>
                  Date{" "}
                  {sortBy === 'createdAt' && (
                    <span className="text-gray-10">{sortOrder === 'DESC' ? '↓' : '↑'}</span>
                  )}
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-line">
              {loading ? (
                Array.from({ length: itemsPerPage }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-4"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                  </tr>
                ))
              ) : checkouts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="flex flex-col gap-2 justify-center items-center">
                      {searchTerm ? (
                        <span>No abandoned checkouts found matching your search criteria.</span>
                      ) : (
                        <span>No abandoned checkouts found.</span>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                checkouts.map((checkout, index) => (
                  <tr key={`${checkout.id}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={selectedCarts.includes(checkout.id)}
                        onChange={() => handleSelectCart(checkout.id)}
                      />
                    </td>
                    <td className="px-6 py-4 xsmall text-black">
                      <Link href={`/admin/abandoned/${checkout.id}`} className="text-black hover:underline">
                        #{checkout.id.slice(0, 8)}...
                      </Link>
                    </td>
                    <td className="px-6 py-4 xsmall text-black">
                      <Link href={`/admin/abandoned/${checkout.id}`} className="text-black">
                        {formatDate(checkout.createdAt)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 xsmall text-black">
                      <Link href={`/admin/abandoned/${checkout.id}`} className="text-black">
                        {checkout.User ? `${checkout.User.first_name} ${checkout.User.last_name}` : "Unknown"}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-gray-10 xxsmall-semibold bg-green-00 rounded-full">
                        Abandoned
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-gray-10 xxsmall-semibold bg-gray-90 rounded-full">
                        Not Sent
                      </span>
                    </td>
                    <td className="px-6 py-4 xsmall-semibold text-black">
                      <Link href={`/admin/abandoned/${checkout.id}`} className="text-black">
                        {formatCurrency(calculateCartTotal(checkout.CartItems))}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Link href={`/admin/abandoned/${checkout.id}`} className="text-blue-600 hover:text-blue-800">
                          <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 main-container">
          <div className="text-gray-10 xsmall">
            Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.currentPage * pagination.limit, pagination.totalCarts)} of{" "}
            {pagination.totalCarts} abandoned carts
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
              className={`px-3 py-1 rounded-md xsmall-semibold flex items-center ${
                pagination.hasPrev
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
                onClick={() => typeof pageNumber === "number" ? handlePageChange(pageNumber) : undefined}
                disabled={typeof pageNumber === "string"}
                className={`px-3 py-1 rounded-md xsmall-semibold ${
                  typeof pageNumber === "string"
                    ? "bg-transparent text-gray-10 cursor-default"
                    : pageNumber === pagination.currentPage
                    ? "bg-primary text-white"
                    : "bg-white border border-gray-line text-gray-10 hover:bg-gray-50"
                }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              className={`px-3 py-1 rounded-md xsmall-semibold flex items-center ${
                pagination.hasNext
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

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        title="Abandoned Carts"
        totalCount={pagination.totalCarts}
      />
    </div>
  );
}
