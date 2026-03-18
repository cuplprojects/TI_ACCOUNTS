"use client";

import React, { useEffect, useState } from "react";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faEye,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import {
  getAllPickups,
  formatPickupDate,
  getPickupStatusBadgeClass,
  type PickupStatus,
  type PickupsResponse,
  type PickupQueryParams,
  type Pickup,
} from "@/app/lib/services/admin";
import ExportModal, { ExportParams } from "@/app/components/ExportModal";
import { exportPickups } from "@/app/lib/services/admin/exportService";

export default function PickUpPage() {
  const { setTitle } = usePageTitle();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [pickupData, setPickupData] = useState<PickupsResponse>({
    pickups: [],
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalPickups: 0,
      limit: 20,
      hasNext: false,
      hasPrev: false,
      nextPage: null,
      prevPage: null,
    },
    filters: {
      search: null,
      status: null,
      seller_id: null,
      invoice_status: null,
      date_from: null,
      date_to: null,
      sort: "newest",
    },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [showExportModal, setShowExportModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [tabs] = useState([
    { id: "all", label: "All Orders" },
    { id: "Not started", label: "Not Started" },
    { id: "Ready for pickup", label: "Ready" },
    { id: "In transit", label: "In Transit" },
    { id: "Delivered", label: "Delivered" },
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
    setTitle("Pick Up");
  }, [setTitle]);

  // Fetch pickups from API
  useEffect(() => {
    const fetchPickups = async () => {
      setIsLoading(true);

      const params: PickupQueryParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm || undefined,
        sort: sortOrder === 'DESC' ? 'newest' : 'oldest',
      };

      // Add status filter if not "all"
      if (activeTab !== "all") {
        params.status = activeTab as PickupStatus;
      }

      const response = await getAllPickups(params);

      if (response) {
        setPickupData(response);
      }
      
      setIsLoading(false);
    };

    fetchPickups();
  }, [activeTab, currentPage, itemsPerPage, debouncedSearchTerm, sortBy, sortOrder]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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

  // Handle column sort
  const handleColumnSort = (field: 'createdAt') => {
    if (sortBy === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'DESC' ? 'ASC' : 'DESC');
    } else {
      // Set new field with DESC order
      setSortBy(field);
      setSortOrder('DESC');
    }
    setCurrentPage(1);
  };

  // Handle export
  const handleExport = async (params: ExportParams) => {
    await exportPickups({
      ...params,
      search: debouncedSearchTerm,
      status: activeTab === "all" ? undefined : activeTab,
    });
  };

  // Generate page numbers for pagination with first, last, and adjacent pages
  const generatePageNumbers = () => {
    const { currentPage, totalPages } = pickupData.pagination;
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

  const getStatusDot = (status: string) => {
    switch (status) {
      case "Not started":
        return "bg-yellow-500";
      case "Ready for pickup":
        return "bg-green-500";
      case "Pickup scheduled":
        return "bg-blue-500";
      case "Pickup in progress":
        return "bg-cyan-500";
      case "Picked up":
        return "bg-purple-500";
      case "In transit":
        return "bg-orange-00";
      case "Out for delivery":
        return "bg-amber-500";
      case "Delivered":
        return "bg-green-10";
      case "Failed pickup":
        return "bg-red-500";
      case "Cancelled":
        return "bg-gray-500";
      default:
        return "bg-gray-10";
    }
  };

  // Calculate total SKUs from order items
  const getTotalSKUs = (pickup: Pickup) => {
    // The list API response doesn't include Order details
    // Use items_count from the API response instead
    if ('items_count' in pickup) {
      return (pickup as any).items_count.toString();
    }

    // Fallback for when Order data is available (e.g., in detail view)
    if (!pickup.Order?.OrderItems || pickup.Order.OrderItems.length === 0) {
      return "0";
    }

    // Count unique SKUs (number of different products)
    const uniqueSKUs = new Set(
      pickup.Order.OrderItems.map((item) => item.Variant?.sku).filter(
        (sku): sku is string => Boolean(sku && sku.trim())
      )
    );

    return uniqueSKUs.size.toString();
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
              </button>
            ))}
            {/* <button className="p-2 text-gray-10 hover:text-gray-20">
              <FontAwesomeIcon icon={faPlus} />
            </button> */}
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center flex-1 max-w-md">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by ID, seller, status, phone, email..."
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
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md xsmall-semibold"
              >
                Export
              </button>
              {/* <button className="px-4 py-2 bg-primary text-white rounded-md xsmall-semibold flex items-center">
                All Categories
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button> */}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-md">
          <table className="min-w-full rounded-md">
            <thead className="bg-gray-line">
              <tr>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase cursor-pointer hover:bg-gray-50" onClick={() => handleColumnSort('createdAt')}>
                  Order Number {sortBy === 'createdAt' && (
                    <span className="text-gray-10">{sortOrder === 'DESC' ? '↓' : '↑'}</span>
                  )}
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase cursor-pointer hover:bg-gray-50" onClick={() => handleColumnSort('createdAt')}>
                  Order Date {sortBy === 'createdAt' && (
                    <span className="text-gray-10">{sortOrder === 'DESC' ? '↓' : '↑'}</span>
                  )}
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Seller name
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Total SKU
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-center xsmall-semibold text-gray-10 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-line">
              {isLoading ? (
                // Skeleton loader - maintains table structure
                Array.from({ length: itemsPerPage }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-8"></div></td>
                  </tr>
                ))
              ) : pickupData.pickups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col gap-2 justify-center items-center">
                      {searchTerm ? (
                        <span>
                          No pickup orders found matching your search criteria.
                        </span>
                      ) : (
                        <span>No pickup orders found.</span>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                pickupData.pickups.map((pickup) => (
                  <tr key={pickup.id} className="hover:bg-gray-40">
                    <td className="px-6 py-4 xsmall text-black">
                      <Link href={`/admin/pickup/${pickup.id}`}>
                        {(pickup as any).orderNumber || `#${pickup.id.toString().slice(0, 6)}...`}
                      </Link>
                    </td>
                    <td className="px-6 py-4 xsmall text-black">
                      {formatPickupDate(pickup.createdAt)}
                    </td>
                    <td className="px-6 py-4 xsmall text-black">
                      {(pickup as any).firm_name || pickup.Seller?.firm_name}
                    </td>
                    <td className="px-6 py-4 xsmall text-black">
                      {getTotalSKUs(pickup)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 ${getPickupStatusBadgeClass(
                          pickup.status as PickupStatus
                        )} rounded-full xsmall-semibold flex items-center w-fit`}
                      >
                        <span
                          className={`h-2 w-2 ${getStatusDot(
                            pickup.status
                          )} rounded-full mr-1`}
                        ></span>
                        {pickup.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/admin/pickup/${pickup.id}`}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Pickup"
                      >
                        <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pickupData.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-gray-10 xsmall">
              Showing{" "}
              {(pickupData.pagination.currentPage - 1) *
                pickupData.pagination.limit +
                1}{" "}
              to{" "}
              {Math.min(
                pickupData.pagination.currentPage * pickupData.pagination.limit,
                pickupData.pagination.totalPickups
              )}{" "}
              of {pickupData.pagination.totalPickups} pickups
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  handlePageChange(pickupData.pagination.currentPage - 1)
                }
                disabled={!pickupData.pagination.hasPrev}
                className={`px-3 py-1 rounded-md xsmall-semibold flex items-center ${
                  pickupData.pagination.hasPrev
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
                      : pageNumber === pickupData.pagination.currentPage
                      ? "bg-primary text-white"
                      : "bg-white border border-gray-line text-gray-10 hover:bg-gray-50"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                onClick={() =>
                  handlePageChange(pickupData.pagination.currentPage + 1)
                }
                disabled={!pickupData.pagination.hasNext}
                className={`px-3 py-1 rounded-md xsmall-semibold flex items-center ${
                  pickupData.pagination.hasNext
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
        title="Pickups"
        totalCount={pickupData.pagination.totalPickups}
      />
    </div>
  );
}
