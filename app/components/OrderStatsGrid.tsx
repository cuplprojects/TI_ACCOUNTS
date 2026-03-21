"use client";

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import DateRangeSelector, { DateRange } from "./DateRangeSelector";
import { getAllOrders, type Order } from "@/app/lib/services/admin/orderService";

interface OrderStatistics {
  orders: { total: number; today: number };
  itemsOrdered: { total: number };
  returns: { total: number };
  ordersFulfilled: { total: number };
  ordersDelivered: { total: number };
}

interface StatCard {
  title: string;
  value: number;
  data: number[];
}

// Generate SVG path from data points
const generateSVGPath = (data: number[], height: number = 40): string => {
  if (data.length === 0) return "";

  const maxValue = Math.max(...data, 1);
  const width = 100;
  const points: string[] = [];

  data.forEach((value, index) => {
    const x = (index / (data.length - 1 || 1)) * width;
    const y = height - (value / maxValue) * (height - 5);
    points.push(`${x},${y}`);
  });

  return `M${points.join(" L")}`;
};

// Get date range based on selection
const getDateRange = (
  range: DateRange,
  customStart?: string,
  customEnd?: string
) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case "all":
      return null; // No date filter
    case "today":
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      return {
        start: todayStr,
        end: todayStr,
      };
    case "yesterday":
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      return {
        start: yesterdayStr,
        end: yesterdayStr,
      };
    case "thisMonth":
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const thisMonthStartStr = `${thisMonthStart.getFullYear()}-${String(thisMonthStart.getMonth() + 1).padStart(2, '0')}-${String(thisMonthStart.getDate()).padStart(2, '0')}`;
      const thisMonthEndStr = `${thisMonthEnd.getFullYear()}-${String(thisMonthEnd.getMonth() + 1).padStart(2, '0')}-${String(thisMonthEnd.getDate()).padStart(2, '0')}`;
      return {
        start: thisMonthStartStr,
        end: thisMonthEndStr,
      };
    case "lastMonth":
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      const lastMonthStartStr = `${lastMonthStart.getFullYear()}-${String(lastMonthStart.getMonth() + 1).padStart(2, '0')}-${String(lastMonthStart.getDate()).padStart(2, '0')}`;
      const lastMonthEndStr = `${lastMonthEnd.getFullYear()}-${String(lastMonthEnd.getMonth() + 1).padStart(2, '0')}-${String(lastMonthEnd.getDate()).padStart(2, '0')}`;
      return {
        start: lastMonthStartStr,
        end: lastMonthEndStr,
      };
    case "custom":
      if (customStart && customEnd) {
        return {
          start: customStart,
          end: customEnd,
        };
      }
      const todayStrCustom = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      return {
        start: todayStrCustom,
        end: todayStrCustom,
      };
    default:
      return null;
  }
};

interface OrderStatsGridProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  customStartDate: string;
  customEndDate: string;
  onCustomStartChange: (date: string) => void;
  onCustomEndChange: (date: string) => void;
  stats?: {
    orders: { total: number; today: number };
    itemsOrdered: { total: number };
    returns: { total: number };
    ordersFulfilled: { total: number };
    ordersDelivered: { total: number };
  };
  loading?: boolean;
}

export default function OrderStatsGrid({
  dateRange,
  onDateRangeChange,
  customStartDate,
  customEndDate,
  onCustomStartChange,
  onCustomEndChange,
  stats: passedStats,
  loading: passedLoading,
}: OrderStatsGridProps) {
  const [stats, setStats] = useState<OrderStatistics>(
    passedStats || {
      orders: { total: 0, today: 0 },
      itemsOrdered: { total: 0 },
      returns: { total: 0 },
      ordersFulfilled: { total: 0 },
      ordersDelivered: { total: 0 },
    }
  );

  const [chartData, setChartData] = useState({
    orders: [0],
    itemsOrdered: [0],
    returns: [0],
    ordersFulfilled: [0],
    ordersDelivered: [0],
  });

  const [loading, setLoading] = useState(passedLoading || false);

  // Update stats when passed stats change
  useEffect(() => {
    if (passedStats) {
      setStats(passedStats);
      generateSampleChartData(passedStats);
    }
  }, [passedStats]);

  // Update loading state
  useEffect(() => {
    if (passedLoading !== undefined) {
      setLoading(passedLoading);
    }
  }, [passedLoading]);

  // Fetch stats from API based on date range
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const dateRangeData = getDateRange(
          dateRange,
          customStartDate,
          customEndDate
        );

        // Fetch orders for the date range - use high limit to get all orders
        const response = await getAllOrders({
          ...(dateRangeData && { date_from: dateRangeData.start, date_to: dateRangeData.end }),
          page: 1,
          limit: 10000, // Increased limit to capture all orders
        });

        if (response?.orders && response.orders.length > 0) {
          // Calculate statistics from orders
          const calculatedStats = calculateStatsFromOrders(response.orders);
          setStats(calculatedStats);
          generateSampleChartData(calculatedStats);
        } else {
          console.warn("No orders found for the selected date range");
          generateSampleChartData(stats);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        generateSampleChartData(stats);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [dateRange, customStartDate, customEndDate]);

  // Calculate statistics from orders data
  const calculateStatsFromOrders = (orders: Order[]): OrderStatistics => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    let totalOrders = 0;
    let todayOrders = 0;
    let totalItems = 0;
    let totalReturns = 0;
    let totalFulfilled = 0;
    let totalDelivered = 0;

    orders.forEach((order) => {
      totalOrders++;

      // Parse order date properly
      const orderDate = new Date(order.createdAt);
      const orderDateOnly = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());

      // Check if order is from today
      if (orderDateOnly.getTime() === today.getTime()) {
        todayOrders++;
      }

      // Count items
      if (order.OrderItems && Array.isArray(order.OrderItems)) {
        totalItems += order.OrderItems.length;
      }

      // Count returns (check for cancelled status as proxy for returns)
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
      orders: { total: totalOrders, today: todayOrders },
      itemsOrdered: { total: totalItems },
      returns: { total: totalReturns },
      ordersFulfilled: { total: totalFulfilled },
      ordersDelivered: { total: totalDelivered },
    };
  };

  const generateSampleChartData = (statsData: OrderStatistics) => {
    const generateTrendData = (baseValue: number) => {
      const data = [];
      for (let i = 0; i < 10; i++) {
        const trend = Math.sin((i / 10) * Math.PI) * 0.5 + 0.5;
        const variance = Math.random() * 0.3;
        data.push(Math.max(1, Math.round(baseValue * (trend + variance))));
      }
      return data;
    };

    setChartData({
      orders: generateTrendData(statsData.orders.total || 10),
      itemsOrdered: generateTrendData(statsData.itemsOrdered.total || 15),
      returns: generateTrendData(statsData.returns.total || 5),
      ordersFulfilled: generateTrendData(statsData.ordersFulfilled.total || 12),
      ordersDelivered: generateTrendData(statsData.ordersDelivered.total || 8),
    });
  };

  const StatCard = ({
    title,
    value,
  }: {
    title: string;
    value: number;
  }) => (
    <div className="flex-1 p-1">
      <div className="flex items-center justify-center gap-2">
        <div className="text-center">
          <h3 className="title-4-semibold text-black whitespace-nowrap">
            {title}
          </h3>
          <p className="title-2 text-black">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );

  const StatCardSkeleton = () => (
    <div className="flex-1 p-1 animate-pulse">
      <div className="flex items-center justify-center gap-2">
        <div className="text-center">
          <div className="h-4 bg-gray-200 rounded w-24 mb-1 mx-auto"></div>
          <div className="h-6 bg-gray-200 rounded w-16 mx-auto"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Date Range Selector */}
      <div className="bg-gray-bg rounded-lg p-4">
        <DateRangeSelector
          selectedRange={dateRange}
          onRangeChange={onDateRangeChange}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          onCustomStartChange={onCustomStartChange}
          onCustomEndChange={onCustomEndChange}
        />
      </div>

      {/* Stats Grid */}
      <div className="bg-gray-bg rounded-lg shadow-sm">
        <div className="flex items-center divide-x-2 divide-gray-200">
          <div className="flex items-center px-3 py-1">
            <FontAwesomeIcon icon={faCalendar} className="mr-2 text-black" />
            <span className="title-4-semibold text-black">
              {dateRange === "all"
                ? "All Orders"
                : dateRange === "today"
                ? "Today"
                : dateRange === "yesterday"
                ? "Yesterday"
                : dateRange === "thisMonth"
                ? "This Month"
                : dateRange === "lastMonth"
                ? "Last Month"
                : customStartDate && customEndDate
                ? (
                  <div className="flex flex-col gap-1">
                    <div>From: {new Date(customStartDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                    <div>To: {new Date(customEndDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                  </div>
                )
                : ""}
            </span>
          </div>

          <div className="flex flex-1 divide-x-2 divide-gray-200">
            {loading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <StatCard
                  title="Orders"
                  value={stats.orders.total}
                />
                <StatCard
                  title="Items Ordered"
                  value={stats.itemsOrdered.total}
                />
                <StatCard
                  title="Returns"
                  value={stats.returns.total}
                />
                <StatCard
                  title="Orders Fulfilled"
                  value={stats.ordersFulfilled.total}
                />
                <StatCard
                  title="Orders Delivered"
                  value={stats.ordersDelivered.total}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
