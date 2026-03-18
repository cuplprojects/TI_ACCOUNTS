"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  getAllOrders,
  formatOrderStatus,
  formatOrderDate,
  getOrderStatusColor,
  exportOrders,
  type Order,
  type OrderFilters,
} from "@/app/lib/services/admin/orderService";
import ExportModal from "@/app/components/ExportModal";
import OrderStatsGrid from "@/app/components/OrderStatsGrid";
import { DateRange } from "@/app/components/DateRangeSelector";

const tabs = [
  { id: "all", label: "All Orders" },
  { id: "pending", label: "Pending" },
  { id: "processing", label: "Processing" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

export default function AdminOrdersPage() {
  const { setTitle } = usePageTitle();
  const searchParams = useSearchParams();
  const buyerIdFromQuery = searchParams.get("buyerId");

  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<"createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null as number | null,
    prevPage: null as number | null,
  });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [totalItemsToExport, setTotalItemsToExport] = useState(0);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [orderStats, setOrderStats] = useState({
    orders: { total: 0, today: 0 },
    itemsOrdered: { total: 0 },
    returns: { total: 0 },
    ordersFulfilled: { total: 0 },
    ordersDelivered: { total: 0 },
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // Reset to page 1 when search term actually changes
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setTitle("Orders");
  }, [setTitle]);

  // Get date range based on selected filter
  const getDateRangeForFilter = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (selectedDateRange) {
      case "all":
        return null; // No date filter
      case "today":
        return {
          start: today.toISOString().split("T")[0],
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        };
      case "yesterday":
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return {
          start: yesterday.toISOString().split("T")[0],
          end: today.toISOString().split("T")[0],
        };
      case "thisMonth":
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1)
            .toISOString()
            .split("T")[0],
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
            .toISOString()
            .split("T")[0],
        };
      case "lastMonth":
        return {
          start: new Date(now.getFullYear(), now.getMonth() - 1, 1)
            .toISOString()
            .split("T")[0],
          end: new Date(now.getFullYear(), now.getMonth(), 0)
            .toISOString()
            .split("T")[0],
        };
      case "custom":
        return {
          start: customStartDate || today.toISOString().split("T")[0],
          end: customEndDate || new Date(today.getTime() + 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        };
      default:
        return null;
    }
  };

  // Calculate stats from orders
  const calculateStatsFromOrders = (orders: Order[]) => {
    let totalItems = 0;
    let totalReturns = 0;
    let totalFulfilled = 0;
    let totalDelivered = 0;

    orders.forEach((order) => {
      // Count items
      if (order.OrderItems && Array.isArray(order.OrderItems)) {
        totalItems += order.OrderItems.length;
      }

      // Count returns (cancelled status)
      if (order.status === "cancelled") {
        totalReturns++;
      }

      // Count fulfilled orders (shipped or delivered)
      if (order.status === "shipped" || order.status === "delivered") {
        totalFulfilled++;
      }

      // Count delivered orders
      if (order.status === "delivered") {
        totalDelivered++;
      }
    });

    return {
      orders: { total: orders.length, today: orders.length },
      itemsOrdered: { total: totalItems },
      returns: { total: totalReturns },
      ordersFulfilled: { total: totalFulfilled },
      ordersDelivered: { total: totalDelivered },
    };
  };

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);

      try {
        const dateRange = getDateRangeForFilter();
        
        const filters: OrderFilters = {
          search: debouncedSearchTerm || undefined,
          sort_by: "createdAt",
          sort_order: sortOrder,
          page: currentPage,
          limit: itemsPerPage,
          ...(buyerIdFromQuery && { user_id: buyerIdFromQuery }),
          ...(dateRange && { date_from: dateRange.start, date_to: dateRange.end }),
        };

        // Add status filter if not "all"
        if (activeTab !== "all") {
          filters.status = activeTab;
        }

        const response = await getAllOrders(filters);

        if (response && response.orders && response.pagination) {
          setFilteredOrders(response.orders);
          setPagination(response.pagination);
          setTotalItemsToExport(response.pagination.totalOrders);
          
          // Calculate stats from the fetched orders
          const stats = calculateStatsFromOrders(response.orders);
          setOrderStats({
            orders: { total: response.pagination.totalOrders, today: response.pagination.totalOrders },
            itemsOrdered: stats.itemsOrdered,
            returns: stats.returns,
            ordersFulfilled: stats.ordersFulfilled,
            ordersDelivered: stats.ordersDelivered,
          });
        } else {
          setFilteredOrders([]);
          setPagination({
            currentPage: 1,
            totalPages: 1,
            totalOrders: 0,
            limit: 20,
            hasNextPage: false,
            hasPrevPage: false,
            nextPage: null,
            prevPage: null,
          });
          setOrderStats({
            orders: { total: 0, today: 0 },
            itemsOrdered: { total: 0 },
            returns: { total: 0 },
            ordersFulfilled: { total: 0 },
            ordersDelivered: { total: 0 },
          });
        }
      } catch (error) {
        console.error("Failed to load orders:", error);
        setFilteredOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [activeTab, currentPage, itemsPerPage, debouncedSearchTerm, sortBy, sortOrder, buyerIdFromQuery, selectedDateRange, customStartDate, customEndDate]);

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (newSort: 'newest' | 'oldest') => {
    setSortOrder(newSort === 'newest' ? 'DESC' : 'ASC');
    setSortBy('createdAt');
    setCurrentPage(1);
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

  // Generate page numbers for pagination with first, last, and adjacent pages
  const generatePageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const adjacentPages = 2; // Show 2 pages on each side of current page

    if (pagination.totalPages <= 7) {
      // If total pages is 7 or less, show all pages
      for (let i = 1; i <= pagination.totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      // Calculate start and end of adjacent pages
      const startPage = Math.max(2, currentPage - adjacentPages);
      const endPage = Math.min(pagination.totalPages - 1, currentPage + adjacentPages);

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push("...");
      }

      // Add adjacent pages
      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== pagination.totalPages) {
          pageNumbers.push(i);
        }
      }

      // Add ellipsis before last page if needed
      if (endPage < pagination.totalPages - 1) {
        pageNumbers.push("...");
      }

      // Always show last page if total pages > 1
      if (pagination.totalPages > 1) {
        pageNumbers.push(pagination.totalPages);
      }
    }

    return pageNumbers;
  };

  // Get payment status badge color
  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-00";
      case "unpaid":
        return "bg-red-50";
      case "refunded":
        return "bg-purple-50";
      default:
        return "bg-gray-200";
    }
  };

  // Get payment status indicator color
  const getPaymentStatusIndicator = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-10";
      case "unpaid":
        return "bg-red-600";
      case "refunded":
        return "bg-purple-600";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="">
      {/* Stats Grid Component */}
      <div className="mb-6">
        <OrderStatsGrid
          dateRange={selectedDateRange}
          onDateRangeChange={setSelectedDateRange}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          onCustomStartChange={setCustomStartDate}
          onCustomEndChange={setCustomEndDate}
          stats={orderStats}
          loading={loading}
        />
      </div>

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
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center flex-1 max-w-md">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by order number, customer, status, payment..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-line rounded-md xsmall placeholder:xsmall focus:outline-none text-gray-20"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-20 h-3 w-3"
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
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md xsmall-semibold"
                onClick={() => setIsExportModalOpen(true)}
              >
                Export
              </button>
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
                  Date {sortBy === 'createdAt' && (
                    <span className="text-gray-10">{sortOrder === 'DESC' ? '↓' : '↑'}</span>
                  )}
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Items
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-center xsmall-semibold text-gray-10 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-line">
              {loading ? (
                // Skeleton loader - maintains table structure
                Array.from({ length: itemsPerPage }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-8"></div></td>
                  </tr>
                ))
              ) : filteredOrders?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="flex flex-col gap-2 justify-center items-center">
                      {searchTerm ? (
                        <span>
                          No orders found matching your search criteria.
                        </span>
                      ) : (
                        <span>No orders found.</span>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders?.map((order) => {
                  // Calculate number of items from OrderItems (more reliable than CartItems)
                  const itemCount = order.OrderItems?.length || 0;

                  // Get customer name
                  const customerName = order.User
                    ? `${order.User.first_name} ${order.User.last_name}`
                    : "Unknown Customer";

                  // Payment status - in a real app, you'd get this from the order data
                  const paymentStatus = order.payment_id ? "Paid" : "Unpaid";

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 xsmall text-black">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-black hover:text-blue-600 font-semibold"
                        >
                          #{order.orderNumber || order.id.substring(0, 8)}
                        </Link>
                      </td>
                      <td className="px-6 py-4 xsmall text-black">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-black"
                        >
                          {formatOrderDate(order.createdAt)}
                        </Link>
                      </td>
                      <td className="px-6 py-4 xsmall text-black">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-black"
                        >
                          {customerName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 xsmall text-black">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-black"
                        >
                          ₹{Number(order.subtotal).toFixed(2)}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="block"
                        >
                          <span
                            className={`px-2 py-1 text-gray-10 xxsmall-semibold ${getPaymentStatusColor(
                              paymentStatus
                            )} rounded-full`}
                          >
                            <span
                              className={`inline-block mr-1 h-2 w-2 ${getPaymentStatusIndicator(
                                paymentStatus
                              )} rounded-full`}
                            />
                            {paymentStatus}
                          </span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 xsmall text-black">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-black"
                        >
                          {itemCount} item{itemCount !== 1 ? "s" : ""}{" "}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="block"
                        >
                          <span
                            className="py-1 px-1.5 text-gray-10 xxsmall-semibold rounded-xl"
                            style={{
                              backgroundColor:
                                getOrderStatusColor(order.status) + "20",
                            }}
                          >
                            <span
                              className="inline-block mr-1 h-2 w-2 rounded-full"
                              style={{
                                backgroundColor: getOrderStatusColor(
                                  order.status
                                ),
                              }}
                            />
                            {formatOrderStatus(order.status)}
                          </span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Order"
                        >
                          <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination?.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-gray-10 xsmall">
              Showing {(currentPage - 1) * pagination?.limit + 1} to{" "}
              {Math.min(
                currentPage * pagination?.limit,
                pagination?.totalOrders
              )}{" "}
              of {pagination?.totalOrders} orders
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination?.hasPrevPage}
                className={`px-3 py-1 rounded-md xsmall-semibold flex items-center ${
                  pagination?.hasPrevPage
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
                      : pageNumber === currentPage
                      ? "bg-primary text-white"
                      : "bg-white border border-gray-line text-gray-10 hover:bg-gray-50"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination?.hasNextPage}
                className={`px-3 py-1 rounded-md xsmall-semibold flex items-center ${
                  pagination?.hasNextPage
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
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          title="Orders"
          totalCount={totalItemsToExport}
          onExport={async (params) => {
            const success = await exportOrders(
              {
                search: debouncedSearchTerm || undefined,
                status: activeTab !== "all" ? activeTab : undefined,
                sort_by: "createdAt",
                sort_order: "DESC",
                offset: params.offset,
                limit: params.limit,
              },
              params.format
            );
            if (success) {
              setIsExportModalOpen(false);
            }
          }}
        />
      </div>
    </div>
  );
}
