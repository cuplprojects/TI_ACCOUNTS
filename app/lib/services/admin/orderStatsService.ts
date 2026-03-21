export interface OrderStatistics {
  orders: { total: number; today: number };
  itemsOrdered: { total: number };
  returns: { total: number };
  ordersFulfilled: { total: number };
  ordersDelivered: { total: number };
  totalSales: number;
}

export interface StatusCounts {
  all: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export interface OrderStatsResponse {
  success: boolean;
  data: {
    statistics: OrderStatistics;
    chartData: {
      orders: number[];
      itemsOrdered: number[];
      ordersDelivered: number[];
      ordersFulfilled: number[];
      returns: number[];
    };
    statusCounts: StatusCounts;
    orders: any[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalOrders: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      nextPage: number | null;
      prevPage: number | null;
    };
  };
}

export interface OrderStatsParams {
  date_from?: string;
  date_to?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: string;
}

export async function getOrderStats(
  params: OrderStatsParams
): Promise<OrderStatsResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  
  const queryParams = new URLSearchParams();
  
  if (params.date_from) queryParams.append("date_from", params.date_from);
  if (params.date_to) queryParams.append("date_to", params.date_to);
  if (params.status) queryParams.append("status", params.status);
  if (params.search) queryParams.append("search", params.search);
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.sort_by) queryParams.append("sort_by", params.sort_by);
  if (params.sort_order) queryParams.append("sort_order", params.sort_order);

  const response = await fetch(
    `${apiUrl}/api/v1/admin/order-stats/stats?${queryParams.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch order stats: ${response.statusText}`);
  }

  return response.json();
}
