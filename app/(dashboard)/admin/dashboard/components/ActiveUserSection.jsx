import React, { useState, useEffect } from 'react';
import { getConversion } from '@/app/lib/services/admin/dashboardService';
import ProgressBar from './ProgressBar';

const SkeletonLoader = () => (
  <div className="space-y-3">
    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
    <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-6 bg-gray-200 rounded animate-pulse"></div>
      ))}
    </div>
  </div>
);

const ActiveUserSection = () => {
  const [countries, setCountries] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  const Tooltip = ({ children, text }) => (
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

      useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getConversion();
        if (data) {
          setTotalUsers(data.activeUsers.total);
          setCountries(data.activeUsers.countries.map(country => ({
            name: country.name,
            percentage: country.percent,
            count: country.count || 0,
            progress: country.percent
          })));
        } else {
          setTotalUsers(0);
          setCountries([]);
        }
      } catch (error) {
        console.error('Error fetching active users:', error);
        setTotalUsers(0);
        setCountries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-gray-bg rounded-xl p-4 sm:p-6 h-full w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="small-semibold text-text-muted">
            Active User
          </h3>
          <Tooltip text="Top 5 countries">
            <svg 
              className="w-4 h-4 text-text-secondary cursor-help hover:text-text-muted transition-colors" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </Tooltip>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <img 
            src="/images/Icons/img_icon_dotsthree.svg" 
            alt="Options menu"
            className="w-6 h-6"
          />
        </button>
      </div>
      
      {loading ? (
        <SkeletonLoader />
      ) : (
        <>
          {/* Stats */}
          <div className="mb-4 flex-shrink-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-2xl font-bold text-text-muted mb-1">
                  {totalUsers.toLocaleString()}
                </h4>
                <p className="text-sm text-text-secondary">
                  Users
                </p>
              </div>
              <div className="text-right">
                <div style={{
                  color: '#00a865',
                  fontSize: '14px',
                  fontWeight: '600',
                  padding: '4px 8px',
                  display: 'inline-block',
                  backgroundColor: '#f0f9f5',
                  borderRadius: '4px'
                }}>
                  +{((totalUsers > 0 ? 8.02 : 0)).toFixed(2)}%
                </div>
                <p style={{
                  fontSize: '12px',
                  fontWeight: '400',
                  color: '#6b6b6a',
                  marginTop: '4px'
                }}>
                  from last month
                </p>
              </div>
            </div>
          </div>
          
          {/* Countries Progress */}
          <div className="space-y-3 flex-1 overflow-y-auto">
            {countries.length > 0 ? (
              countries.map((country, index) => {
                const colors = ['#00478f', '#3877b8', '#83bef9', '#b9d9f9', '#d4e5f7'];
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-secondary">
                        {country.name}
                      </span>
                      <div className="flex gap-2 items-center">
                        <span className="text-sm font-semibold text-text-muted">
                          {country.count.toLocaleString()}
                        </span>
                        <span className="text-xs text-text-secondary">
                          ({country.percentage}%)
                        </span>
                      </div>
                    </div>
                    <ProgressBar 
                      value={country.progress}
                      max={100}
                      fillColor={colors[index % colors.length]}
                      className="h-2"
                      layout_width="full"
                      position="relative"
                      variant="default"
                      size="md"
                      label=""
                    />
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-text-secondary text-center py-4">No user data available</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ActiveUserSection;
