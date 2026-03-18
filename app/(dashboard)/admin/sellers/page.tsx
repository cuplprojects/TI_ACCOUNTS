"use client";

import React, { useEffect, useState } from "react";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faEye,
  faEdit,
  faTrash,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import {
  getAllSellers,
  deleteSeller,
  bulkDeleteSellers,
  SellerQueryParams,
  SellersResponse,
  Address,
} from "@/app/lib/services/admin/sellerService";
import ExportModal, { ExportParams } from "@/app/components/ExportModal";
import { exportSellers } from "@/app/lib/services/admin/exportService";

export default function SellersPage() {
  const { setTitle } = usePageTitle();
  const [activeTab, setActiveTab] = useState("all");
  const [sellersData, setSellersData] = useState<SellersResponse>({
    sellers: [],
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalSellers: 0,
      limit: 20,
      hasNext: false,
      hasPrev: false,
    },
    filters: {
      search: null,
      entity_type: null,
      is_gst_registered: null,
      is_marketing_emails: null,
      is_marketing_sms: null,
      isFirstLogin: null,
      sort: "newest",
    },
    summary: {
      totalSellers: 0,
      gstRegisteredSellers: 0,
      firstLoginPendingSellers: 0,
      marketingEmailSellers: 0,
      marketingSmsells: 0,
      soleProprietorSellers: 0,
      pvtLtdSellers: 0,
      sellersWithAddresses: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [tabs] = useState([{ id: "all", label: "All" }]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedSellers, setSelectedSellers] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Helper function to get location display string
  const getLocationString = (
    seller: (typeof sellersData.sellers)[0]
  ): string => {
    // Check if seller has addresses
    const addresses = seller.Addresses;
    if (!addresses || addresses.length === 0) {
      return "-";
    }

    // Find default address
    const defaultAddress = addresses.find(
      (addr: Address) => addr.type === "default"
    );

    if (!defaultAddress) {
      return "-";
    }

    // Build location string with city, state, and country
    const locationParts = [];

    if (defaultAddress.city) {
      locationParts.push(defaultAddress.city);
    }

    if (defaultAddress.state) {
      locationParts.push(defaultAddress.state);
    }

    if (defaultAddress.country) {
      locationParts.push(defaultAddress.country);
    }

    return locationParts.length > 0 ? locationParts.join(", ") : "-";
  };

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

  // Fetch sellers on component mount and when filters change
  useEffect(() => {
    loadSellers();
  }, [activeTab, currentPage, itemsPerPage, debouncedSearchTerm]);

  useEffect(() => {
    setTitle("Sellers");
  }, [setTitle]);

  // Function to load sellers
  const loadSellers = async () => {
    setIsLoading(true);
    try {
      const params: SellerQueryParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm || undefined,
        sort: "name_asc",
      };

      // No tab filters needed since we only have "all"

      const data = await getAllSellers(params);
      setSellersData(data);
    } catch (error) {
      console.error("Failed to load sellers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete seller
  const handleDeleteSeller = async (sellerId: string) => {
    const success = await deleteSeller(sellerId);
    if (success) {
      // Refresh the sellers list after successful deletion
      loadSellers();
    }
  };

  // Handle checkbox change for individual seller
  const handleSellerCheckboxChange = (sellerId: string) => {
    const newSelected = new Set(selectedSellers);
    if (newSelected.has(sellerId)) {
      newSelected.delete(sellerId);
    } else {
      newSelected.add(sellerId);
    }
    setSelectedSellers(newSelected);
    setSelectAll(false);
  };

  // Handle select all checkbox
  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedSellers(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(sellersData.sellers.map(s => s.id || ""));
      setSelectedSellers(allIds);
      setSelectAll(true);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedSellers.size === 0) {
      return;
    }

    const result = await bulkDeleteSellers(Array.from(selectedSellers));

    // Deselect ALL on modal confirmation
    if (result.confirmed) {
      setSelectedSellers(new Set());
      setSelectAll(false);

      // Refresh list only on success (partial or full)
      if (result.success) {
        loadSellers();
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
    await exportSellers({
      ...params,
      search: debouncedSearchTerm,
    });
  };

  // Generate page numbers for pagination with first, last, and adjacent pages
  const generatePageNumbers = () => {
    const { currentPage, totalPages } = sellersData.pagination;
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
                className={`px-3 py-1 rounded-md xsmall-semibold ${activeTab === tab.id
                    ? "bg-gray-line text-black"
                    : "border-transparent text-gray-10"
                  }`}
              >
                {tab.label}
                {tab.id === "all" && sellersData.summary && (
                  <span className="ml-1 text-gray-10">
                    ({sellersData.summary.totalSellers})
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
                  placeholder="Search by firm name, email, GSTIN..."
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
              <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md xsmall-semibold">
                Import
              </button>
              <Link
                href="/admin/sellers/add"
                className="px-4 py-2 bg-primary text-white rounded-md xsmall-semibold flex items-center"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Seller
              </Link>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-md">
          {selectedSellers.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 p-4 mb-4 rounded-md flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedSellers.size} seller(s) selected
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
                  Seller Name
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Email Subscription
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Approval Status
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
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                  </tr>
                ))
              ) : sellersData.sellers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col gap-2 justify-center items-center">
                      {searchTerm ? (
                        <span>
                          No sellers found matching your search criteria.
                        </span>
                      ) : (
                        <span>No sellers found. Create one!</span>
                      )}
                      <Link
                        href="/admin/sellers/add"
                        className="px-4 py-2 bg-primary text-white rounded-md xsmall-semibold flex items-center"
                      >
                        Add Seller
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                sellersData.sellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedSellers.has(seller.id || "")}
                        onChange={() => handleSellerCheckboxChange(seller.id || "")}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 xsmall">
                      <Link
                        href={`/admin/sellers/${seller.id}`}
                        className="text-black hover:text-primary hover:underline"
                      >
                        {seller.firmName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 xsmall text-black">
                      {seller.email}
                    </td>
                    <td className="px-6 py-4 xsmall text-black">
                      {getLocationString(seller)}
                    </td>
                    <td className="px-6 py-4">
                      {seller.emailConsent ? (
                        <span className="px-3 py-1 bg-green-00 text-success rounded-full xsmall">
                          Subscribed
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full xsmall">
                          Not Subscribed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {seller.status === "pending" && (
                        <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full xsmall">
                          Pending
                        </span>
                      )}
                      {seller.status === "approved" && (
                        <span className="px-3 py-1 bg-green-00 text-success rounded-full xsmall">
                          Approved
                        </span>
                      )}
                      {seller.status === "rejected" && (
                        <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full xsmall">
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/sellers/${seller.id}`}
                          className="text-blue-600 hover:text-blue-800"
                          title="View"
                        >
                          <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/sellers/add?id=${seller.id}`}
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
                            handleDeleteSeller(seller.id || "");
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
        {sellersData.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-gray-10 xsmall">
              Showing{" "}
              {(sellersData.pagination.currentPage - 1) *
                sellersData.pagination.limit +
                1}{" "}
              to{" "}
              {Math.min(
                sellersData.pagination.currentPage *
                sellersData.pagination.limit,
                sellersData.pagination.totalSellers
              )}{" "}
              of {sellersData.pagination.totalSellers} sellers
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  handlePageChange(sellersData.pagination.currentPage - 1)
                }
                disabled={!sellersData.pagination.hasPrev}
                className={`px-3 py-1 rounded-md xsmall-semibold flex items-center ${sellersData.pagination.hasPrev
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
                  className={`px-3 py-1 rounded-md xsmall-semibold ${typeof pageNumber === "string"
                      ? "bg-transparent text-gray-10 cursor-default"
                      : pageNumber === sellersData.pagination.currentPage
                        ? "bg-primary text-white"
                        : "bg-white border border-gray-line text-gray-10 hover:bg-gray-50"
                    }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                onClick={() =>
                  handlePageChange(sellersData.pagination.currentPage + 1)
                }
                disabled={!sellersData.pagination.hasNext}
                className={`px-3 py-1 rounded-md xsmall-semibold flex items-center ${sellersData.pagination.hasNext
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
        title="Sellers"
        totalCount={sellersData.pagination.totalSellers}
      />
    </div>
  );
}
