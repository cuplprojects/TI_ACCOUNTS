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
  faX,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import {
  getAllCustomers,
  deleteCustomer,
  bulkDeleteCustomers,
  CustomerQueryParams,
  CustomersResponse,
} from "@/app/lib/services/admin/customerService";
import ExportModal, { ExportParams } from "@/app/components/ExportModal";
import { exportCustomers } from "@/app/lib/services/admin/exportService";

export default function CustomersPage() {
  const { setTitle } = usePageTitle();
  const [activeTab, setActiveTab] = useState("all");
  const [customersData, setCustomersData] = useState<CustomersResponse>({
    users: [],
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalUsers: 0,
      limit: 20,
      hasNext: false,
      hasPrev: false,
    },
    filters: {
      search: null,
      country: null,
      gender: null,
      is_marketing_emails: null,
      is_marketing_sms: null,
      sort: "newest",
    },
    summary: {
      totalUsers: 0,
      maleUsers: 0,
      femaleUsers: 0,
      marketingEmailUsers: 0,
      marketingSmsUsers: 0,
      usersWithAddresses: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showExportModal, setShowExportModal] = useState(false);
  const [tabs] = useState([{ id: "all", label: "All" }]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper function to get location display string
  const getLocationString = (
    customer: (typeof customersData.users)[0]
  ): string => {
    // First check UserAddresses (from API)
    if (customer.UserAddresses && customer.UserAddresses.length > 0) {
      // Find default address if available
      const defaultAddress =
        customer.UserAddresses.find((addr) => addr.is_default === true) ||
        customer.UserAddresses[0];

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
    }

    // Then check addresses (legacy)
    if (customer.addresses && customer.addresses.length > 0) {
      const address = customer.addresses[0];

      const locationParts = [];

      if (address.city) {
        locationParts.push(address.city);
      }

      if (address.state) {
        locationParts.push(address.state);
      }

      if (address.country) {
        locationParts.push(address.country);
      }

      return locationParts.length > 0 ? locationParts.join(", ") : "-";
    }

    // Fallback to country field
    return customer.country || "-";
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

  // Fetch customers on component mount and when filters change
  useEffect(() => {
    loadCustomers();
  }, [activeTab, currentPage, itemsPerPage, debouncedSearchTerm]);

  useEffect(() => {
    setTitle("Customers");
  }, [setTitle]);

  // Function to load customers
  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const params: CustomerQueryParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm || undefined,
        sort: "newest",
      };

      // No tab filters needed since we only have "all"

      const data = await getAllCustomers(params);
      setCustomersData(data);
    } catch (error) {
      console.error("Failed to load customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete customer
  const handleDeleteCustomer = async (customerId: string) => {
    const success = await deleteCustomer(customerId);
    if (success) {
      // Refresh the customers list after successful deletion
      loadCustomers();
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customersData.users.map((c) => c.id!).filter(Boolean));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectCustomer = (id: string) => {
    if (selectedCustomers.includes(id)) {
      setSelectedCustomers(
        selectedCustomers.filter((customerId) => customerId !== id)
      );
    } else {
      setSelectedCustomers([...selectedCustomers, id]);
    }
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    const result = await bulkDeleteCustomers(selectedCustomers);
    setIsDeleting(false);
    
    if (result.success && result.confirmed) {
      // Remove deleted customers from the list
      const remainingCustomers = customersData.users.filter(
        (c) => !selectedCustomers.includes(c.id!)
      );
      setCustomersData({
        ...customersData,
        users: remainingCustomers,
      });
      setSelectedCustomers([]);
      setSelectAll(false);
    } else if (result.confirmed) {
      // User confirmed but deletion failed - just deselect
      setSelectedCustomers([]);
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
    await exportCustomers({
      ...params,
      search: debouncedSearchTerm,
    });
  };

  // Generate page numbers for pagination with first, last, and adjacent pages
  const generatePageNumbers = () => {
    const { currentPage, totalPages } = customersData.pagination;
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
        {selectedCustomers.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between">
            <span className="xsmall-semibold text-black">
              {selectedCustomers.length} customer{selectedCustomers.length !== 1 ? 's' : ''} selected
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
                  setSelectedCustomers([]);
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
                {tab.id === "all" && customersData.summary && (
                  <span className="ml-1 text-gray-10">
                    ({customersData.summary.totalUsers})
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
                  placeholder="Search by name, email, phone..."
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
                href="/admin/customers/add"
                className="px-4 py-2 bg-primary text-white rounded-md xsmall-semibold flex items-center"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Customer
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
                  Customer Name
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Phone
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Email Subscription
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
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                  </tr>
                ))
              ) : customersData.users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="flex flex-col gap-2 justify-center items-center">
                      {searchTerm ? (
                        <span>
                          No customers found matching your search criteria.
                        </span>
                      ) : (
                        <span>No customers found. Create one!</span>
                      )}
                      <Link
                        href="/admin/customers/add"
                        className="px-4 py-2 bg-primary text-white rounded-md xsmall-semibold flex items-center"
                      >
                        Add Customer
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                customersData.users.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={selectedCustomers.includes(customer.id!)}
                        onChange={() => handleSelectCustomer(customer.id!)}
                      />
                    </td>
                    <td className="px-6 py-4 xsmall">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="text-black hover:text-primary hover:underline"
                      >
                        {customer.first_name} {customer.last_name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 xsmall text-black">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 xsmall text-black">
                      {customer.country_code}
                      {customer.phone}
                    </td>
                    <td className="px-6 py-4 xsmall text-black">
                      {getLocationString(customer)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full xsmall-semibold ${
                          customer.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : customer.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {customer.status
                          ? customer.status.charAt(0).toUpperCase() +
                            customer.status.slice(1)
                          : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {customer.is_marketing_emails ? (
                        <span className="px-3 py-1 bg-green-00 text-success rounded-full xsmall">
                          Subscribed
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full xsmall">
                          Unsubscribed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="text-blue-600 hover:text-blue-800"
                          title="View"
                        >
                          <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/customers/add?id=${customer.id}`}
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
                            handleDeleteCustomer(customer.id || "");
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
        {customersData.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-gray-10 xsmall">
              Showing{" "}
              {(customersData.pagination.currentPage - 1) *
                customersData.pagination.limit +
                1}{" "}
              to{" "}
              {Math.min(
                customersData.pagination.currentPage *
                  customersData.pagination.limit,
                customersData.pagination.totalUsers
              )}{" "}
              of {customersData.pagination.totalUsers} customers
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  handlePageChange(customersData.pagination.currentPage - 1)
                }
                disabled={!customersData.pagination.hasPrev}
                className={`px-3 py-1 rounded-md xsmall-semibold flex items-center ${
                  customersData.pagination.hasPrev
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
                      : pageNumber === customersData.pagination.currentPage
                      ? "bg-primary text-white"
                      : "bg-white border border-gray-line text-gray-10 hover:bg-gray-50"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                onClick={() =>
                  handlePageChange(customersData.pagination.currentPage + 1)
                }
                disabled={!customersData.pagination.hasNext}
                className={`px-3 py-1 rounded-md xsmall-semibold flex items-center ${
                  customersData.pagination.hasNext
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
        title="Customers"
        totalCount={customersData.pagination.totalUsers}
      />
    </div>
  );
}
