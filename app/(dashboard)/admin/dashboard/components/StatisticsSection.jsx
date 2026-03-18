import React, { useState, useEffect } from 'react';
import { getSummary } from '@/app/lib/services/admin/dashboardService';

const Tooltip = ({ children, text }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
      {children}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-normal z-10 max-w-[150px]">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

const SkeletonCard = () => (
  <div className="bg-gray-bg rounded-xl p-3 sm:p-4 lg:p-5 w-full animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="w-[24px] h-[24px] bg-gray-200 rounded-md"></div>
    </div>
    <div className="flex items-start justify-between">
      <div className="h-8 bg-gray-200 rounded w-32"></div>
      <div className="flex flex-col items-end gap-2">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  </div>
);

const formatLargeNumber = (num) => {
  if (num >= 1000000) {
    return `₹${(num / 1000000).toFixed(2)}M`;
  } else if (num >= 1000) {
    return `₹${(num / 1000).toFixed(2)}K`;
  } else {
    return `₹${num.toLocaleString('en-IN')}`;
  }
};

const StatisticsSection = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getSummary();
        if (data) {
          setStats([
            {
              title: 'Total Sales',
              value: formatLargeNumber(data.sales.allTime),
              fullValue: `₹${data.sales.allTime.toLocaleString('en-IN')}`,
              change: `${parseFloat(data.sales.growth) > 0 ? '+' : ''}${parseFloat(data.sales.growth).toFixed(2)}%`,
              changeType: parseFloat(data.sales.growth) >= 0 ? 'positive' : 'negative',
              period: 'vs last month',
              icon: '/images/Icons/img_icon_currencycircledollar.svg',
              bgColor: 'bg-gray-bg',
              tooltip: 'Paid orders'
            },
            {
              title: 'Total Orders',
              value: data.orders.allTime.toLocaleString(),
              fullValue: data.orders.allTime.toLocaleString(),
              change: `${parseFloat(data.orders.growth) > 0 ? '+' : ''}${parseFloat(data.orders.growth).toFixed(2)}%`,
              changeType: parseFloat(data.orders.growth) >= 0 ? 'positive' : 'negative',
              period: 'vs last month',
              icon: '/images/Icons/img_icon_shoppingcart.svg',
              bgColor: 'bg-gray-bg',
              tooltip: 'All orders'
            },
            {
              title: 'Total Visitors',
              value: data.visitors.allTime.toLocaleString(),
              fullValue: data.visitors.allTime.toLocaleString(),
              change: `${parseFloat(data.visitors.growth) > 0 ? '+' : ''}${parseFloat(data.visitors.growth).toFixed(2)}%`,
              changeType: parseFloat(data.visitors.growth) >= 0 ? 'positive' : 'negative',
              period: 'vs last month',
              icon: '/images/Icons/img_icon_usercircle.svg',
              bgColor: 'bg-gray-bg',
              tooltip: 'Cart users'
            }
          ]);
        } else {
          setStats([]);
        }
      } catch (error) {
        console.error('Error fetching summary:', error);
        setStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : stats.length > 0 ? (
          stats.map((stat, index) => (
            <div
              key={index}
              className={`${stat.bgColor} rounded-xl p-3 sm:p-4 lg:p-5 w-full`}
            >
              {/* Header Row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-text-secondary">
                    {stat.title}
                  </p>
                  <Tooltip text={stat.tooltip}>
                    <svg 
                      className="w-4 h-4 text-text-secondary cursor-help hover:text-text-muted transition-colors" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </Tooltip>
                </div>
                <div className="w-[24px] h-[24px] bg-white rounded-md flex items-center justify-center">
                  <img 
                    src={stat.icon} 
                    alt={`${stat.title} icon`}
                    className="w-4 h-4"
                  />
                </div>
              </div>

              {/* Value Row */}
              <div className="flex items-start justify-between">
                <Tooltip text={stat.fullValue}>
                  <h3 className="text-2xl font-bold text-text-muted cursor-help">
                    {stat.value}
                  </h3>
                </Tooltip>
                
                <div className="flex flex-col items-end">
                  <span style={{
                    color: stat.changeType === 'positive' ? '#00a865' : '#ff4444',
                    fontSize: '14px',
                    fontWeight: '600',
                    padding: '4px 4px'
                  }}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-text-secondary mt-0.5">
                    {stat.period}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-text-secondary">
            <p>No data available</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default StatisticsSection;
