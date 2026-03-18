import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchView from './SerchView';
import Dropdown from './Dropdown';
import { getActivity } from '@/app/lib/services/admin/dashboardService';

const SkeletonLoader = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
    ))}
  </div>
);

const OrdersTableSection = () => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'home', label: 'Home & Kitchen' }
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getActivity(1, 5);
        if (data && data.orders && data.orders.length > 0) {
          const formattedOrders = data.orders.map(order => {
            const statusColorMap = {
              'pending': { color: 'bg-accent-error', bg: 'bg-background-error' },
              'processing': { color: 'bg-[#ffc957]', bg: 'bg-background-muted' },
              'shipped': { color: 'bg-accent-warning', bg: 'bg-background-muted' },
              'delivered': { color: 'bg-accent-success', bg: 'bg-secondary-light' },
              'cancelled': { color: 'bg-accent-error', bg: 'bg-background-error' }
            };
            
            const statusStyle = statusColorMap[order.status] || { color: 'bg-gray-400', bg: 'bg-gray-100' };
            
            console.log('Order data:', order);
            
            return {
              id: order.orderId,
              fullOrderId: order.fullOrderId,
              customer: order.customer,
              date: order.date,
              qty: `${order.qty} Item${order.qty !== 1 ? 's' : ''}`,
              total: `₹${order.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
              statusColor: statusStyle.color,
              statusBg: statusStyle.bg
            };
          });
          setOrders(formattedOrders);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const searchLower = searchValue.toLowerCase();
    return (
      order.id.toLowerCase().includes(searchLower) ||
      order.customer.toLowerCase().includes(searchLower) ||
      order.status.toLowerCase().includes(searchLower)
    );
  });

  const handleSearchChange = (event) => {
    setSearchValue(event?.target?.value);
  };

  const handleCategoryChange = (option) => {
    setSelectedCategory(option?.label);
  };

  const handleOrderClick = (orderId) => {
    // Use the full order ID for navigation
    router.push(`/admin/orders/${orderId}`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
      {/* Orders Table */}
      <div className="flex-1 bg-gray-bg rounded-xl p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h2 className="small-semibold text-text-muted">
            Recent Orders
          </h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="flex-1 sm:flex-none sm:w-[280px]">
              <SearchView
                placeholder="Search product, customer, etc"
                value={searchValue}
                onChange={handleSearchChange}
                leftIcon="/images/Icons/img_icon_magnifyingglass_gray_500.svg"
                fill_background_color="#ffffff"
                text_color="#a5a5a5"
                className="text-xs"
                layout_gap=""
                layout_width="100%"
                padding="8px"
                position="relative"
                variant="default"
                size="medium"
                onSubmit={() => {}}
                onFocus={() => {}}
                onBlur={() => {}}
              />
            </div>
            {/* Category Filter */}
            <div className="w-full sm:w-[160px]">
              <Dropdown
                placeholder={selectedCategory}
                options={categoryOptions}
                onChange={handleCategoryChange}
                fill_background_color="#ffffff"
                text_color="#00478f"
                className="text-xs"
                border_border_radius="4px"
                layout_gap=""
                layout_width="100%"
                padding="8px"
                position="relative"
                margin="0"
                variant="default"
                size="medium"
                value={selectedCategory}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
          {loading ? (
            <div className="px-4 sm:px-6 py-6">
              <SkeletonLoader />
            </div>
          ) : orders.length > 0 ? (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200">
                {filteredOrders?.map((order, index) => (
                  <div key={index} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-gray-500">Order ID</p>
                        <p 
                          className="text-sm font-semibold text-blue-00 cursor-pointer hover:underline"
                          onClick={() => handleOrderClick(order?.fullOrderId)}
                        >
                          {order?.id}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 ${order?.statusColor} rounded`}></div>
                        <span className={`text-xs font-semibold text-text-secondary px-2 py-1 rounded ${order?.statusBg}`}>
                          {order?.status}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Customer</p>
                        <p className="text-text-muted">{order?.customer}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="text-text-muted">{order?.date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Qty</p>
                        <p className="text-text-muted">{order?.qty}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-text-muted font-semibold">{order?.total}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                {/* Table Header */}
                <div className="bg-table-header px-4 sm:px-6 py-3 min-w-max">
                  <div className="grid grid-cols-6 gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-normal text-black">Order ID</span>
                      <img src="/images/Icons/img_icon_sort.svg" alt="Sort" className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-normal text-black">Customer</span>
                      <img src="/images/Icons/img_icon_sort.svg" alt="Sort" className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-normal text-black">Date</span>
                      <img src="/images/Icons/img_icon_sort.svg" alt="Sort" className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-normal text-black">Qty</span>
                      <img src="/images/Icons/img_icon_sort.svg" alt="Sort" className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-normal text-black">Total</span>
                      <img src="/images/Icons/img_icon_sort.svg" alt="Sort" className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-normal text-black">Status</span>
                      <img src="/images/Icons/img_icon_sort.svg" alt="Sort" className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-200">
                  {filteredOrders?.map((order, index) => (
                    <div key={index} className="px-4 sm:px-6 py-3 min-w-max">
                      <div className="grid grid-cols-6 gap-4 items-center">
                        <div 
                          className="text-sm text-text-muted cursor-pointer hover:text-primary-background hover:underline"
                          onClick={() => handleOrderClick(order?.fullOrderId)}
                        >
                          {order?.id}
                        </div>
                        <div className="text-sm text-text-muted">
                          {order?.customer}
                        </div>
                        <div className="text-sm text-text-muted">
                          {order?.date}
                        </div>
                        <div className="text-sm text-text-muted">
                          {order?.qty}
                        </div>
                        <div className="text-sm text-text-muted">
                          {order?.total}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 ${order?.statusColor} rounded`}></div>
                          <span className={`text-sm font-semibold text-text-secondary px-2 py-1 rounded ${order?.statusBg}`}>
                            {order?.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="px-4 sm:px-6 py-8 text-center text-text-secondary">
              <p>{filteredOrders.length === 0 && orders.length > 0 ? 'No orders match your search' : 'No recent orders'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersTableSection;