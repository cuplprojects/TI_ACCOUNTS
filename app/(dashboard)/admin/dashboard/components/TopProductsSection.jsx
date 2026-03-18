import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTopProducts } from '@/app/lib/services/admin/dashboardService';

const SkeletonLoader = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
    ))}
  </div>
);

const truncateText = (text, maxLength = 60) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const TopProductsSection = () => {
  const router = useRouter();
  const [productData, setProductData] = useState([]);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getTopProducts();
        if (data && data.products && data.products.length > 0) {
          setProductData(data.products);
        } else {
          setProductData([]);
        }
      } catch (error) {
        console.error('Error fetching top products:', error);
        setProductData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full bg-gray-bg rounded-xl p-3 sm:p-4 lg:p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h3 
            className="small-semibold text-text-muted cursor-pointer hover:text-primary-background transition-colors"
            onClick={() => router.push('/admin/products')}
          >
            Top 10 Products
          </h3>
          <HeaderTooltip text="Top products by total revenue">
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
      ) : productData.length > 0 ? (
        <div className="space-y-2 overflow-y-auto flex-1">
          {productData.map((product, index) => (
            <div 
              key={product.id} 
              className="flex items-center justify-between p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors gap-2"
              onClick={() => router.push(`/admin/products/${product.id}/view`)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-green-600">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0 w-3/5">
                  <p className="text-sm font-medium text-text-muted truncate hover:text-primary-background" title={product.title}>
                    {truncateText(product.title, 60)}
                  </p>
                  <p className="text-xs text-text-secondary truncate">
                    {product.brand} • {product.orderCount} items
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 text-right whitespace-nowrap">
                <p className="text-sm font-semibold text-text-muted">
                  ₹{product.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-text-secondary">
          <p>No product data available</p>
        </div>
      )}
    </div>
  );
};

export default TopProductsSection;
