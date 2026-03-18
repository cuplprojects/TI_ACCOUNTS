import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { getRevenue } from '@/app/lib/services/admin/dashboardService';
import Dropdown from './Dropdown';

const SkeletonLoader = () => (
  <div className="space-y-4">
    <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
  </div>
);

const RevenueSection = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [revenueData, setRevenueData] = useState([]);
  const [monthlyTarget, setMonthlyTarget] = useState({ target: 0, achieved: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  const InfoTooltip = ({ children, text }) => (
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

  const periodOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let data;
        
        // If custom range is selected, use custom dates
        if (selectedPeriod === 'custom' && customStartDate && customEndDate) {
          console.log('Fetching custom date range:', { customStartDate, customEndDate });
          data = await getRevenue('custom', customStartDate, customEndDate);
        } else {
          console.log('Fetching preset range:', selectedPeriod);
          data = await getRevenue(selectedPeriod);
        }
        
        console.log('Revenue API Response:', data);
        
        if (data && data.revenueTrend && data.revenueTrend.length > 0) {
          console.log('Using REAL data from API');
          console.log('Date range in response:', {
            first: data.revenueTrend[0].date,
            last: data.revenueTrend[data.revenueTrend.length - 1].date
          });
          setRevenueData(data.revenueTrend.map(item => ({
            name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: item.revenue,
            orders: item.orders
          })));
          setMonthlyTarget(data.monthlyTarget);
        } else {
          console.warn('No revenue trend data - empty database');
          setRevenueData([]);
          setMonthlyTarget({ target: 0, achieved: 0, percentage: 0 });
        }
      } catch (error) {
        console.error('Error fetching revenue data:', error);
        setRevenueData([]);
        setMonthlyTarget({ target: 0, achieved: 0, percentage: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod, customStartDate, customEndDate]);

  const handlePeriodChange = (option) => {
    setSelectedPeriod(option?.value);
    // Reset custom dates when switching periods
    if (option?.value !== 'custom') {
      setCustomStartDate('');
      setCustomEndDate('');
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleCustomDateChange = (type, value) => {
    const today = getTodayDate();
    
    // Prevent future dates
    if (value > today) {
      return;
    }

    if (type === 'start') {
      // If end date is set and new start date is after end date, don't allow
      if (customEndDate && value > customEndDate) {
        return;
      }
      setCustomStartDate(value);
    } else {
      // If start date is set and new end date is before start date, don't allow
      if (customStartDate && value < customStartDate) {
        return;
      }
      setCustomEndDate(value);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
      {/* Revenue Analytics Chart */}
      <div className="flex-1 bg-gray-bg rounded-xl p-3 sm:p-4 lg:p-5 flex flex-col h-full min-h-[320px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="small-semibold text-text-muted">
                Revenue Analytics
              </h2>
              <InfoTooltip text="Paid orders">
                <svg 
                  className="w-4 h-4 text-text-secondary cursor-help hover:text-text-muted transition-colors" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </InfoTooltip>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-[#00478f]"></div>
                <span className="text-text-secondary">Revenue</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-[#00478f] opacity-40" style={{ borderTop: '2px dashed #00478f' }}></div>
                <span className="text-text-secondary">Orders</span>
              </div>
            </div>
            {selectedPeriod === 'custom' && customStartDate && customEndDate && (
              <div className="text-xs text-text-secondary mt-2">
                Showing: {new Date(customStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} to {new Date(customEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            )}
          </div>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
            {selectedPeriod === 'custom' && (
              <>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => handleCustomDateChange('start', e.target.value)}
                    max={getTodayDate()}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Start Date"
                  />
                  {customStartDate && (
                    <span className="text-xs text-text-secondary whitespace-nowrap">
                      {new Date(customStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => handleCustomDateChange('end', e.target.value)}
                    max={getTodayDate()}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="End Date"
                  />
                  {customEndDate && (
                    <span className="text-xs text-text-secondary whitespace-nowrap">
                      {new Date(customEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </>
            )}
            <div className="min-w-[120px]">
              <Dropdown
                placeholder={periodOptions.find(p => p.value === selectedPeriod)?.label || 'This Month'}
                options={periodOptions}
                onChange={handlePeriodChange}
                fill_background_color="#ffffff"
                border_border_radius="6px"
                className="text-xs"
                layout_gap=""
                layout_width="100%"
                padding=""
                position="relative"
                margin=""
                variant="default"
                size="medium"
                value={selectedPeriod}
              />
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full flex-1 min-h-[240px]">
          {loading ? (
            <SkeletonLoader />
          ) : selectedPeriod === 'custom' && (!customStartDate || !customEndDate) ? (
            <div className="flex items-center justify-center h-full text-text-secondary">
              <p>Please select both start and end dates</p>
            </div>
          ) : revenueData && revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={revenueData} 
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                role="img" 
                aria-label="Revenue analytics line chart showing daily revenue and order trends"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b6b6a', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b6b6a', fontSize: 12 }}
                  tickFormatter={(value) => `₹${value/1000}k`}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e6e6e6',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                  formatter={(value, name) => {
                    if (name === 'revenue') {
                      return [`₹${value?.toLocaleString('en-IN')}`, 'Revenue'];
                    }
                    return [`${value?.toLocaleString()}`, 'Orders'];
                  }}
                  labelFormatter={(label) => `${label}`}
                />
                <Line 
                  type="monotone"
                  dataKey="revenue" 
                  stroke="#00478f"
                  strokeWidth={2}
                  dot={{ fill: '#00478f', r: 4 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={true}
                />
                <Line 
                  type="monotone"
                  dataKey="orders" 
                  stroke="#00478f"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#00478f', r: 4 }}
                  activeDot={{ r: 6 }}
                  opacity={0.5}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-text-secondary gap-2">
              <p>No revenue data available</p>
              {selectedPeriod === 'custom' && customStartDate && customEndDate && (
                <p className="text-xs">
                  for {new Date(customStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} to {new Date(customEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Monthly Target */}
      {/* will not render is false will act as commnet out */}
      {false && (
        <div className="w-full lg:w-[280px] bg-gray-bg rounded-xl p-3 sm:p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="small-semibold text-text-muted">
              Monthly Target
            </h3>
            <button className="p-1 hover:bg-gray-100 rounded">
              <img 
                src="/images/Icons/img_icon_dotsthree.svg" 
                alt="Options menu"
                className="w-5 h-5"
              />
            </button>
          </div>
  
          {loading ? (
            <div className="space-y-4">
              <div className="h-40 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : (
            <>
              {/* Progress Arc */}
              <div className="relative flex items-center justify-center mb-4" style={{ outline: 'none' }}>
                <div className="relative w-64 h-32" style={{ outline: 'none' }}>
                  {(() => {
                    const pct = Math.min(Math.max(monthlyTarget.percentage, 0), 100);
                    const ARC = 283;
                    const isGood = pct >= 50;
                    return (
                      <>
                        {/* SVG ARC */}
                        <svg viewBox="0 0 220 120" className="w-full h-full" style={{ outline: 'none' }}>
                          {/* Background */}
                          <path
                            d="M 20 110 A 90 90 0 0 1 200 110"
                            fill="none"
                            stroke="#e6e6e6"
                            strokeWidth="22"
                            strokeLinecap="round"
                          />
                          {/* Achieved */}
                          <path
                            d="M 20 110 A 90 90 0 0 1 200 110"
                            fill="none"
                            stroke={isGood ? '#00478f' : '#003a8f'}
                            strokeWidth="22"
                            strokeLinecap="round"
                            strokeDasharray={`${(pct / 100) * ARC} ${ARC}`}
                            style={{ transition: 'stroke-dasharray 0.6s ease' }}
                          />
                          {/* Remaining cap */}
                          {/* {pct < 100 && (
                            <path
                              d="M 20 110 A 90 90 0 0 1 200 110"
                              fill="none"
                              stroke="#8ec5ff"
                              strokeWidth="22"
                              strokeLinecap="round"
                              strokeDasharray="12 271"
                              strokeDashoffset={`-${(pct / 100) * ARC}`}
                            />
                          )} */}
                        </svg>
                        {/* CENTER TEXT (STATIC) */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
                          <span className="text-3xl font-bold text-text-muted">{pct}%</span>
                          <span className="text-sm font-medium mt-1">
                            <span style={{
                              color: isGood ? '#00a865' : '#ff4444'
                            }}>
                              {isGood ? '+8.02%' : `${pct}%`}
                            </span>
                            {' '}
                            <span className="text-text-secondary">from last month</span>
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
  
              {/* Success Message */}
              <div className="text-center mb-4">
                <p className="text-sm font-semibold text-text-muted">
                  {monthlyTarget.percentage >= 50 ? 'Great Progress! 🎉' : 'Keep Going! 💪'}
                </p>
                <p className="text-sm text-text-secondary leading-snug">
                  {monthlyTarget.percentage >= 50 ? (
                    <>
                      Our achievement increased by{' '}
                      <span className="font-semibold text-primary-background">
                        ₹{(monthlyTarget.achieved - monthlyTarget.target).toLocaleString('en-IN')}
                      </span>
                      , let's reach 100% next month.
                    </>
                  ) : (
                    <>
                      Need{' '}
                      <span className="font-semibold text-accent-error">
                        ₹{(monthlyTarget.target - monthlyTarget.achieved).toLocaleString('en-IN')}
                      </span>
                      {' '}more
                    </>
                  )}
                </p>
              </div>
  
              {/* Target vs Revenue */}
              <div className="flex rounded-lg bg-gray-100 overflow-hidden">
                <div className="flex-1 px-2 py-2 text-center">
                  <p className="text-sm text-text-secondary mb-0.5">Target</p>
                  <p className="text-sm font-semibold text-text-muted">₹{monthlyTarget.target.toLocaleString('en-IN')}</p>
                </div>
                <div className="w-px bg-white"></div>
                <div className="flex-1 px-2 py-2 text-center">
                  <p className="text-sm text-text-secondary mb-0.5">Revenue</p>
                  <p className="text-sm font-semibold text-text-muted">₹{monthlyTarget.achieved.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default RevenueSection;
