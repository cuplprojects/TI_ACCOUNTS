import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getTopBrands } from '@/app/lib/services/admin/dashboardService';

const SkeletonLoader = () => (
  <div className="space-y-3">
    <div className="h-[200px] bg-gray-200 rounded animate-pulse"></div>
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-6 bg-gray-200 rounded animate-pulse"></div>
      ))}
    </div>
  </div>
);

const TrafficSourcesSection = () => {
  const router = useRouter();
  const [brandData, setBrandData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHeaderTooltip, setShowHeaderTooltip] = useState(false);

  const HeaderTooltip = ({ children, text }) => (
    <div className="relative inline-block" onMouseEnter={() => setShowHeaderTooltip(true)} onMouseLeave={() => setShowHeaderTooltip(false)}>
      {children}
      {showHeaderTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-normal z-10 max-w-[150px]">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );

  const colors = ['#00478f', '#3877b8', '#83bef9', '#b9d9f9', '#d4e5f7'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getTopBrands();
        if (data && data.sources && data.sources.length > 0) {
          const processedData = data.sources.map((brand, index) => ({
            id: brand.id,
            name: brand.name,
            value: brand.percent,
            itemCount: brand.itemCount,
            totalAmount: brand.totalAmount,
            color: colors[index % colors.length]
          }));
          
          setBrandData(processedData);
        } else {
          setBrandData([]);
        }
      } catch (error) {
        console.error('Error fetching top brands:', error);
        setBrandData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-text-muted">
            {data?.name}: {data?.value}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Check if all values are 0
  const hasData = brandData.length > 0 && brandData.some(brand => brand.value > 0);
  const chartData = hasData ? brandData : [{ name: 'No Data', value: 100, color: '#e6e6e6' }];

  return (
    <div className="w-full bg-gray-bg rounded-xl p-3 sm:p-4 lg:p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 
            className="small-semibold text-text-muted cursor-pointer hover:text-primary-background transition-colors"
            onClick={() => router.push('/admin/brands')}
          >
            Top Brands
          </h3>
          <HeaderTooltip text="Top 5 brands by product count">
            <svg 
              className="w-4 h-4 text-text-secondary cursor-help hover:text-text-muted transition-colors" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </HeaderTooltip>
        </div>
      </div>
      
      {loading ? (
        <SkeletonLoader />
      ) : (
        <>
          {/* Chart */}
          <div 
            className="w-full flex-1 min-h-[200px] mb-6" 
            style={{ pointerEvents: 'auto' }}
            onClick={(e) => e.preventDefault()}
            onMouseDown={(e) => e.preventDefault()}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart style={{ pointerEvents: 'none' }}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  isAnimationActive={false}
                  onClick={(e) => e.preventDefault()}
                >
                  {chartData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry?.color} style={{ pointerEvents: 'auto', cursor: 'default' }} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="space-y-3">
            {brandData.length > 0 ? (
              brandData?.map((brand, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors"
                  onClick={() => brand.id && router.push(`/admin/brands/${brand.id}`)}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: brand?.color }}
                    ></div>
                    <span className="text-sm text-text-secondary hover:text-text-muted">
                      {brand?.name} ({brand?.itemCount})
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-text-muted">
                    ₹{brand?.totalAmount?.toLocaleString('en-IN')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-text-secondary text-center py-2">No brand data available</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TrafficSourcesSection;
