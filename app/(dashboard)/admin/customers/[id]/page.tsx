"use client";

import React, { useEffect, useState } from "react";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faEdit,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import {
  getCustomer,
  Customer,
} from "@/app/lib/services/admin/customerService";
import {
  getOrdersByCustomer,
  type Order,
} from "@/app/lib/services/admin/orderService";
import NotesSection from "@/components/NotesSection";

// Interface for timeline items
interface TimelineItem {
  type: string;
  date: string;
  time: string;
  details: string;
}

// Interface for order items
interface OrderItem {
  product: string;
  variant: string;
  quantity: number;
  price: string;
}

// Interface for last order
interface LastOrder {
  id: string;
  status: string;
  fulfillment: string;
  date: string;
  total: string;
  items: OrderItem[];
}

// Mock data for Customer details when API fails
const mockCustomer = {
  name: "Unknown Customer",
  amountSpent: "₹ 0.00",
  orders: 0,
  customerSince: "Unknown",
  contactInfo: {
    name: "Unknown",
    orders: 0,
    email: "unknown@example.com",
    phone: "No phone number",
  },
  shippingAddress: {
    name: "Unknown",
    address: "Unknown",
    region: "Unknown",
    phone: "Unknown",
  },
  billingAddress: "Unknown",
  marketing: {
    emailSubscribed: false,
    smsSubscribed: false,
  },
  lastOrder: {
    id: "Unknown",
    status: "Unknown",
    fulfillment: "Unknown",
    date: "Unknown",
    total: "₹ 0.00",
    items: [],
  } as LastOrder,
  timeline: [] as TimelineItem[],
};

interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  totalRefund: number;
  allOrders: Order[];
}

export default function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { setTitle } = usePageTitle();
  const [commentText, setCommentText] = useState("");
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [customerStats, setCustomerStats] = useState<CustomerStats>({
    totalOrders: 0,
    totalSpent: 0,
    totalRefund: 0,
    allOrders: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchCustomerData = async () => {
      setIsLoading(true);
      try {
        const data = await getCustomer(params.id);
        if (data) {
          setCustomerData(data);
          setTitle(`${data.first_name} ${data.last_name}`);
        } else {
          setTitle("Customer Details");
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerData();
  }, [params.id, setTitle]);

  // Fetch customer orders and calculate stats
  useEffect(() => {
    const fetchCustomerStats = async () => {
      if (!params.id) return;
      
      setIsLoadingStats(true);
      try {
        // Get orders and total count in one API call
        const result = await getOrdersByCustomer(params.id);
        
        if (result && result.orders) {
          // Calculate totals from returned orders
          let totalSpent = 0;
          let totalRefund = 0;

          result.orders.forEach((order) => {
            totalSpent += parseFloat(order.finalAmount?.toString() || "0");
            totalRefund += parseFloat(order.refundAmount?.toString() || "0");
          });

          // Get last 3 orders (most recent first)
          const lastThreeOrders = result.orders.slice(0, 3);

          setCustomerStats({
            totalOrders: result.total, // Use the total from API response
            totalSpent,
            totalRefund,
            allOrders: lastThreeOrders,
          });
        } else {
          // No orders found
          setCustomerStats({
            totalOrders: 0,
            totalSpent: 0,
            totalRefund: 0,
            allOrders: [],
          });
        }
      } catch (error) {
        console.error("Error fetching customer stats:", error);
        setCustomerStats({
          totalOrders: 0,
          totalSpent: 0,
          totalRefund: 0,
          allOrders: [],
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchCustomerStats();
  }, [params.id]);

  const handleEditCustomer = () => {
    // Navigate to edit page with customer ID
    window.location.href = `/admin/customers/add?id=${params.id}`;
  };

  // Get customer's full name
  const getCustomerName = () => {
    if (customerData) {
      return (
        `${customerData.first_name || ""} ${
          customerData.last_name || ""
        }`.trim() || "Unnamed Customer"
      );
    }
    return mockCustomer.name;
  };

  // Get initials for avatar
  const getInitials = () => {
    if (customerData) {
      const firstInitial = customerData.first_name
        ? customerData.first_name.charAt(0).toUpperCase()
        : "";
      const lastInitial = customerData.last_name
        ? customerData.last_name.charAt(0).toUpperCase()
        : "";
      return firstInitial + lastInitial || "?";
    }
    return "?";
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading customer details...</div>;
  }

  return (
    <div className="">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/customers" className="flex items-center text-black">
          <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
          <span className="title-2-semibold">{getCustomerName()}</span>
        </Link>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md xsmall-semibold flex items-center">
            More Actions{" "}
            <FontAwesomeIcon
              icon={faChevronRight}
              className="h-3 w-3 ml-2 rotate-90"
            />
          </button>
          <button className="px-2 py-2 bg-gray-100 text-gray-800 rounded-md">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12H19M12 5V19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button className="px-2 py-2 bg-gray-100 text-gray-800 rounded-md">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 3H21V9M21 16V21H3V3H8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Customer Stats */}
          <div className="bg-white rounded-lg shadow-sm custom-border-1 flex divide-x divide-gray-line">
            <div className="p-5 flex-1">
              <h3 className="text-gray-10 xsmall mb-1">Amount Spent</h3>
              {isLoadingStats ? (
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-black title-2-semibold">
                  ₹ {customerStats.totalSpent.toFixed(2)}
                </p>
              )}
            </div>
            <div className="p-5 flex-1">
              <h3 className="text-gray-10 xsmall mb-1">Orders</h3>
              {isLoadingStats ? (
                <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-black title-2-semibold">
                  {customerStats.totalOrders}
                </p>
              )}
            </div>
            <div className="p-5 flex-1">
              <h3 className="text-gray-10 xsmall mb-1">Total Refund</h3>
              {isLoadingStats ? (
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-black title-2-semibold">
                  ₹ {customerStats.totalRefund.toFixed(2)}
                </p>
              )}
            </div>
            <div className="p-5 flex-1">
              <h3 className="text-gray-10 xsmall mb-1">Customer since</h3>
              <p className="text-black title-2-semibold">
                {customerData?.createdAt
                  ? new Date(customerData.createdAt).toLocaleDateString()
                  : mockCustomer.customerSince}
              </p>
            </div>
          </div>

          {/* All Orders - Display last 3 in table */}
          <div className="bg-white rounded-lg shadow-sm custom-border-1 p-6">
            <h3 className="text-black title-4-semibold mb-4">
              Recent Orders
            </h3>
            {isLoadingStats ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : customerStats.allOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-line">
                      <th className="text-left py-2 px-2 text-gray-10 xsmall font-semibold">Order #</th>
                      <th className="text-left py-2 px-2 text-gray-10 xsmall font-semibold">Date</th>
                      <th className="text-left py-2 px-2 text-gray-10 xsmall font-semibold">Items</th>
                      <th className="text-left py-2 px-2 text-gray-10 xsmall font-semibold">Status</th>
                      <th className="text-right py-2 px-2 text-gray-10 xsmall font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerStats.allOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-gray-line hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => (window.location.href = `/admin/orders/${order.id}`)}
                      >
                        <td className="py-2 px-2">
                          <span className="text-blue-600 small-semibold hover:underline">
                            {order.orderNumber || `#${order.id.substring(0, 8)}`}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          <span className="text-gray-10 xsmall">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          <span className="text-gray-10 xsmall">
                            {order.OrderItems?.length || 0}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded inline-block ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : order.status === "shipped"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right">
                          <span className="text-black small-semibold">
                            ₹{parseFloat(order.finalAmount?.toString() || "0").toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-10 small">No orders yet</p>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-sm custom-border-1 p-6">
            <h3 className="text-black title-4-semibold mb-4">Timeline</h3>
            <div className="mb-4">
              <textarea
                className="w-full p-4 custom-border-1 rounded-md small text-gray-10 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Leave a comment"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              ></textarea>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-10 rounded-full hover:bg-gray-100">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M15 10L19 14M19 14L15 18M19 14H5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-10 rounded-full hover:bg-gray-100">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 4V20M4 12H20"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-10 rounded-full hover:bg-gray-100">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M7 7H7.01M12 7H12.01M17 7H17.01M7 12H7.01M12 12H12.01M17 12H17.01M7 17H7.01M12 17H12.01M17 17H17.01"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
                <button className="px-4 py-2 bg-primary text-white rounded-md xsmall-semibold">
                  Post
                </button>
              </div>
            </div>
            <div className="text-gray-10 xsmall text-center py-2 mb-4">
              Only you and other staff can see comments
            </div>

            {/* No timeline data in the Customer type, showing placeholder */}
            <div className="text-center text-gray-10 py-4">
              No activity recorded for this customer.
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-1 space-y-6">
          {/* Customer Card */}
          <div className="bg-white rounded-lg shadow-sm custom-border-1 p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-black title-4-semibold">Customer</h3>
              <button className="text-gray-10" onClick={handleEditCustomer}>
                <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                <span>{getInitials()}</span>
              </div>
              <div>
                <h4 className="text-black small">{getCustomerName()}</h4>
                {isLoadingStats ? (
                  <div className="h-3 w-12 bg-gray-200 rounded animate-pulse mt-1"></div>
                ) : (
                  <p className="text-gray-10 xsmall">
                    {customerStats.totalOrders} Order
                    {customerStats.totalOrders !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
            <div className="border-t border-gray-line pt-4">
              <h4 className="text-black small-semibold mb-2">
                Contact information
              </h4>
              <a
                href={`mailto:${customerData?.email || ""}`}
                className="text-primary xsmall block mb-1"
              >
                {customerData?.email || ""}
              </a>
              <p className="text-gray-10 xsmall">
                {customerData?.phone
                  ? `${customerData.country_code || ""} ${customerData.phone}`
                  : "No phone number"}
              </p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm custom-border-1 p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-black title-4-semibold">Shipping address</h3>
              <button className="text-gray-10" onClick={handleEditCustomer}>
                <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-2">
              {customerData?.UserAddresses &&
              customerData.UserAddresses.length > 0 ? (
                <>
                  <p className="text-black small">
                    {customerData.UserAddresses[0].first_name}{" "}
                    {customerData.UserAddresses[0].last_name}
                  </p>
                  <p className="text-black small">
                    {customerData.UserAddresses[0].address_line_1}
                  </p>
                  <p className="text-black small mb-2">
                    {customerData.UserAddresses[0].city},{" "}
                    {customerData.UserAddresses[0].state}{" "}
                    {customerData.UserAddresses[0].zip_code}
                  </p>
                  <p className="text-black small">
                    {customerData.UserAddresses[0].country}
                  </p>
                </>
              ) : (
                <p className="text-gray-10 small">No shipping address found</p>
              )}
            </div>
          </div>

          {/* Marketing */}
          <div className="bg-white rounded-lg shadow-sm custom-border-1 p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-black title-4-semibold">Marketing</h3>
            </div>
            <div className="flex items-center mb-3">
              <div
                className={`h-4 w-4 rounded-full ${
                  customerData?.is_marketing_emails
                    ? "bg-green-10"
                    : "bg-gray-300"
                } mr-2`}
              ></div>
              <span className="text-black small">
                Email{" "}
                {customerData?.is_marketing_emails
                  ? "subscribed"
                  : "not subscribed"}
              </span>
            </div>
            <div className="flex items-center">
              <div
                className={`h-4 w-4 rounded-full ${
                  customerData?.is_marketing_sms ? "bg-green-10" : "bg-gray-300"
                } mr-2`}
              ></div>
              <span className="text-black small">
                SMS{" "}
                {customerData?.is_marketing_sms
                  ? "subscribed"
                  : "not subscribed"}
              </span>
            </div>
          </div>

          {/* Notes */}
          <NotesSection
            noteType="customer"
            referenceId={params.id}
            title="Notes"
          />
        </div>
      </div>
    </div>
  );
}
