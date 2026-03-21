import { useState, useEffect, useCallback } from 'react';
import { 
  accountsService, 
  Order, 
  OrderFilters, 
  AccountingSummary, 
  SalesTransaction, 
  SalesFilters, 
  SalesResponse,
  PurchaseTransaction,
  PurchaseFilters,
  PurchaseResponse
} from '@/lib/services/accountsService';

export interface UseSalesResult {
  transactions: SalesTransaction[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalTransactions: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  summary: {
    totalValue: number;
    cancelledValue: number;
    currency: string;
  } | null;
  refetch: () => void;
}

export interface UsePurchaseResult {
  transactions: PurchaseTransaction[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalTransactions: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  summary: {
    totalPurchaseValue: number;
    pendingPurchases: number;
    completedPurchases: number;
    currency: string;
  } | null;
  refetch: () => void;
}

export interface UseOrdersResult {
  orders: Order[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  refetch: () => void;
  loadMore: () => void;
}

export interface UseAccountingSummaryResult {
  summary: AccountingSummary['data'] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook for managing orders with invoices
 */
export const useOrdersWithInvoices = (filters: OrderFilters = {}): UseOrdersResult => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseOrdersResult['pagination']>(null);

  const fetchOrders = useCallback(async (resetData = true) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await accountsService.getOrdersWithInvoices(filters);
      
      if (resetData) {
        setOrders(response.data.orders);
      } else {
        // For load more functionality
        setOrders(prev => [...prev, ...response.data.orders]);
      }
      
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]); // Use JSON.stringify to properly compare filter objects

  const loadMore = useCallback(() => {
    if (pagination?.hasNext) {
      const nextPageFilters = {
        ...filters,
        page: (pagination.currentPage || 1) + 1
      };
      
      fetchOrders(false);
    }
  }, [filters, pagination, fetchOrders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    pagination,
    refetch: () => fetchOrders(),
    loadMore
  };
};

/**
 * Hook for managing single order details
 */
export const useOrderDetails = (orderId: string | null) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await accountsService.getOrderDetails(orderId);
      setOrder(response.data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching order details:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  return {
    order,
    loading,
    error,
    refetch: fetchOrderDetails
  };
};

/**
 * Hook for managing accounting summary
 */
export const useAccountingSummary = (filters: Pick<OrderFilters, 'startDate' | 'endDate'> = {}): UseAccountingSummaryResult => {
  const [summary, setSummary] = useState<AccountingSummary['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await accountsService.getAccountingSummary(filters);
      setSummary(response.data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching accounting summary:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]); // Use JSON.stringify to properly compare filter objects

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary
  };
};

/**
 * Hook for managing sales transactions (admin-generated invoices)
 */
export const useSalesTransactions = (filters: SalesFilters = {}): UseSalesResult => {
  const [transactions, setTransactions] = useState<SalesTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseSalesResult['pagination']>(null);
  const [summary, setSummary] = useState<UseSalesResult['summary']>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await accountsService.getSalesTransactions(filters);
      
      setTransactions(response.data.transactions);
      setPagination(response.data.pagination);
      setSummary(response.data.summary);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching sales transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]); // Use JSON.stringify to properly compare filter objects

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    pagination,
    summary,
    refetch: fetchTransactions
  };
};

/**
 * Hook for managing purchase transactions (seller-generated invoices)
 */
export const usePurchaseTransactions = (filters: PurchaseFilters = {}): UsePurchaseResult => {
  const [transactions, setTransactions] = useState<PurchaseTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UsePurchaseResult['pagination']>(null);
  const [summary, setSummary] = useState<UsePurchaseResult['summary']>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await accountsService.getPurchaseTransactions(filters);
      
      setTransactions(response.data.transactions);
      setPagination(response.data.pagination);
      setSummary(response.data.summary);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching purchase transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]); // Use JSON.stringify to properly compare filter objects

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    pagination,
    summary,
    refetch: fetchTransactions
  };
};

/**
 * Hook for managing sales summary
 */
export const useSalesSummary = (filters: Pick<SalesFilters, 'startDate' | 'endDate'> = {}): UseAccountingSummaryResult => {
  const [summary, setSummary] = useState<AccountingSummary['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await accountsService.getSalesSummary(filters);
      setSummary(response.data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching sales summary:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]); // Use JSON.stringify to properly compare filter objects

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary
  };
};

/**
 * Hook for managing purchase summary
 */
export const usePurchaseSummary = (filters: Pick<PurchaseFilters, 'startDate' | 'endDate' | 'sellerId'> = {}): UseAccountingSummaryResult => {
  const [summary, setSummary] = useState<AccountingSummary['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await accountsService.getPurchaseSummary(filters);
      setSummary(response.data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching purchase summary:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]); // Use JSON.stringify to properly compare filter objects

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary
  };
};
export const useOrdersExport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportOrders = useCallback(async (
    filters: OrderFilters = {},
    format: 'csv' | 'excel' = 'csv'
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const blob = await accountsService.exportOrders(filters, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (err: any) {
      setError(err.message);
      console.error('Error exporting orders:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    exportOrders,
    loading,
    error
  };
};