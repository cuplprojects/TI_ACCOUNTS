import axiosInstance from '@/lib/api/axios';

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  invoiceCreated: boolean;
  invoice_number?: string;
  invoice_date?: string;
  createdAt: string;
  updatedAt: string;
  User: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  Payment: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    gateway: string;
  };
  OrderShipments: Array<{
    id: string;
    seller_id: string;
    shippingOrderId: string;
    invoice_number?: string;
    invoice_date?: string;
    invoiceCreated: boolean;
  }>;
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  data: {
    orders: Order[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalOrders: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface OrderDetailsResponse {
  success: boolean;
  message: string;
  data: Order & {
    OrderItems: Array<{
      id: string;
      quantityRequested: number;
      unitPrice: number;
      Product: {
        id: string;
        title: string;
        serial_no: string;
      };
    }>;
  };
}

export interface AccountingSummary {
  success: boolean;
  message: string;
  data: {
    totalOrders: number;
    totalRevenue: number;
    currencyBreakdown: Record<string, number>;
    period: {
      startDate: string;
      endDate: string;
    };
  };
}

export interface SalesTransaction {
  id: string;
  date: string;
  invoiceNo: string;
  refNo: string;
  buyerName: string;
  buyerEmail: string;
  country: string;
  countryCode: string;
  airwayBill: string;
  logistics: string;
  sbRef: string;
  value: string;
  payment: string;
  status: string;
  invoiceDate?: string;
  paymentStatus: string;
}

export interface PurchaseTransaction {
  id: string;
  orderId: string;
  shipmentId: string;
  date: string;
  invoiceNo: string;
  sellerName: string;
  sellerEmail: string;
  sellerGstin: string;
  buyerName: string;
  buyerEmail: string;
  country: string;
  countryCode: string;
  airwayBill: string;
  purchaseValue: string;
  paymentMethod: string;
  status: string;
  paymentStatus: string;
  invoiceDate?: string;
}

export interface SalesResponse {
  success: boolean;
  message: string;
  data: {
    transactions: SalesTransaction[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalTransactions: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    summary: {
      totalValue: number;
      cancelledValue: number;
      currency: string;
    };
  };
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
  data: {
    transactions: PurchaseTransaction[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalTransactions: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    summary: {
      totalPurchaseValue: number;
      pendingPurchases: number;
      completedPurchases: number;
      currency: string;
    };
  };
}

export interface SalesFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  tab?: 'all' | 'draft' | 'pending' | 'cancelled';
}

export interface PurchaseFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  sellerId?: string;
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  invoiceType?: 'buyer' | 'seller';
}

class AccountsService {
  private baseUrl = '/accounts';

  /**
   * Get sales transactions (admin-generated invoices)
   */
  async getSalesTransactions(filters: SalesFilters = {}): Promise<SalesResponse> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await axiosInstance.get<SalesResponse>(
        `${this.baseUrl}/sales/transactions?${params.toString()}`
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching sales transactions:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch sales transactions');
    }
  }

  /**
   * Get sales summary/statistics
   */
  async getSalesSummary(filters: Pick<SalesFilters, 'startDate' | 'endDate'> = {}): Promise<AccountingSummary> {
    try {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await axiosInstance.get<AccountingSummary>(
        `${this.baseUrl}/sales/summary?${params.toString()}`
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching sales summary:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch sales summary');
    }
  }

  /**
   * Get purchase transactions (seller-generated invoices)
   */
  async getPurchaseTransactions(filters: PurchaseFilters = {}): Promise<PurchaseResponse> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await axiosInstance.get<PurchaseResponse>(
        `${this.baseUrl}/purchase/transactions?${params.toString()}`
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching purchase transactions:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch purchase transactions');
    }
  }

  /**
   * Get purchase summary/statistics
   */
  async getPurchaseSummary(filters: Pick<PurchaseFilters, 'startDate' | 'endDate' | 'sellerId'> = {}): Promise<AccountingSummary> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await axiosInstance.get<AccountingSummary>(
        `${this.baseUrl}/purchase/summary?${params.toString()}`
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching purchase summary:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch purchase summary');
    }
  }

  /**
   * Get all orders with generated invoices
   */
  async getOrdersWithInvoices(filters: OrderFilters = {}): Promise<OrdersResponse> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await axiosInstance.get<OrdersResponse>(
        `${this.baseUrl}/orders?${params.toString()}`
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching orders with invoices:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  }

  /**
   * Get detailed order information for accounting
   */
  async getOrderDetails(orderId: string): Promise<OrderDetailsResponse> {
    try {
      const response = await axiosInstance.get<OrderDetailsResponse>(
        `${this.baseUrl}/orders/${orderId}`
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch order details');
    }
  }

  /**
   * Get detailed purchase order information for accounting
   */
  async getPurchaseOrderDetails(orderId: string): Promise<OrderDetailsResponse> {
    try {
      // Try the regular orders endpoint first
      const response = await axiosInstance.get<OrderDetailsResponse>(
        `${this.baseUrl}/orders/${orderId}`
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching purchase order details:', error);
      
      // If the regular endpoint fails, try purchase-specific endpoint
      try {
        const purchaseResponse = await axiosInstance.get<OrderDetailsResponse>(
          `${this.baseUrl}/purchase/orders/${orderId}`
        );
        return purchaseResponse.data;
      } catch (purchaseError: any) {
        console.error('Error fetching from purchase endpoint:', purchaseError);
        throw new Error(error.response?.data?.message || 'Failed to fetch purchase order details');
      }
    }
  }

  /**
   * Get accounting summary/statistics
   */
  async getAccountingSummary(filters: Pick<OrderFilters, 'startDate' | 'endDate'> = {}): Promise<AccountingSummary> {
    try {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await axiosInstance.get<AccountingSummary>(
        `${this.baseUrl}/summary?${params.toString()}`
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching accounting summary:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch accounting summary');
    }
  }

  /**
   * Export orders data (if needed for accounting software integration)
   */
  async exportOrders(filters: OrderFilters = {}, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      params.append('format', format);

      const response = await axiosInstance.get(
        `${this.baseUrl}/orders/export?${params.toString()}`,
        {
          responseType: 'blob'
        }
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Error exporting orders:', error);
      throw new Error(error.response?.data?.message || 'Failed to export orders');
    }
  }

  /**
   * Get currency symbol for display
   */
  getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };
    return symbols[currency] || currency;
  }

  /**
   * Format amount with currency
   */
  formatAmount(amount: number, currency: string): string {
    const symbol = this.getCurrencySymbol(currency);
    return `${symbol}${amount.toLocaleString()}`;
  }

  /**
   * Format date for display
   */
  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

export const accountsService = new AccountsService();
export default accountsService;