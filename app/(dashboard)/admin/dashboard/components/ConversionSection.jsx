import React, { useState, useEffect } from 'react';
import { getConversion } from '@/app/lib/services/admin/dashboardService';
import Dropdown from './Dropdown';

const SkeletonLoader = () => (
  <div className="flex items-stretch flex-1 min-h-[140px] gap-2">
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="flex-1 bg-gray-200 rounded animate-pulse"></div>
    ))}
  </div>
);

const ConversionSection = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [conversionData, setConversionData] = useState([]);
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

  const periodOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'week', label: 'This Week' },
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'month', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'lastQuarter', label: 'Last Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'lastYear', label: 'Last Year' },
  ];

  const colors = ['#00478f', '#3877b8', '#83bef9', '#b9d9f9', '#ff6b6b'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getConversion(selectedPeriod);
        if (data && data.conversion.stages) {
          // Use actual values to determine bar heights, not percentages
          // This way the funnel shows the actual flow of users through each stage
          const maxValue = Math.max(...data.conversion.stages.map(s => s.value));
          
          setConversionData(data.conversion.stages.map((stage, index) => ({
            stage: stage.stage,
            value: stage.value.toLocaleString(),
            change: `${stage.growth > 0 ? '+' : ''}${stage.growth.toFixed(2)}%`,
            changeType: stage.growth > 0 ? 'positive' : stage.growth < 0 ? 'negative' : 'neutral',
            percentage: stage.rate, // Keep for display
            barHeight: maxValue > 0 ? (stage.value / maxValue) * 100 : 0, // Use actual value for bar height
          })));
        } else {
          setConversionData([]);
        }
      } catch (error) {
        console.error('Error fetching conversion data:', error);
        setConversionData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod]);

  return (
    <div className="bg-gray-bg rounded-xl p-4 sm:p-6 h-full w-full flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="small-semibold text-text-muted">Conversion Rate</h2>
          <Tooltip text="Conversion funnel">
            <svg 
              className="w-4 h-4 text-text-secondary cursor-help hover:text-text-muted transition-colors" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </Tooltip>
        </div>
        <div className="min-w-[140px]">
          <Dropdown
            placeholder={periodOptions.find(p => p.value === selectedPeriod)?.label || 'This Week'}
            options={periodOptions}
            onChange={(opt) => setSelectedPeriod(opt?.value)}
            fill_background_color="#ffffff"
            border_border_radius="6px"
            text_color="#00478f"
            className="text-xs"
            value={selectedPeriod}
          />
        </div>
      </div>

      {/* Funnel */}
      {loading ? (
        <SkeletonLoader />
      ) : conversionData.length > 0 ? (
        <div className="flex items-stretch flex-1 min-h-[300px] w-full">
          {conversionData.map((stage, index) => {
            return (
            <React.Fragment key={index}>

              {/* Column */}
              <div className="flex flex-col items-center flex-1 px-2">

                {/* Info */}
                <div className="text-center mb-2">
                  <p className="text-sm text-text-secondary">{stage.stage}</p>
                  <p className="text-sm font-bold text-text-muted">{stage.value}</p>
                  <span
                    style={{
                      color: stage.changeType === 'positive' ? '#00a865' : '#ff4444',
                      fontSize: '14px',
                      fontWeight: '600',
                      padding: '4px 4px'
                    }}
                  >
                    {stage.change}
                  </span>
                </div>

                {/* Bar */}
                <div className="flex items-end justify-center flex-1 w-full">
                  <div
                    className="rounded-t-lg transition-all duration-500 w-full"
                    style={{
                      height: `${stage.barHeight}%`,
                      backgroundColor: colors[index],
                    }}
                  />
                </div>
              </div>

              {/* Vertical Rule */}
              {index !== conversionData.length - 1 && (
                <div className="w-px bg-gray-200 mx-0" />
              )}

            </React.Fragment>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center flex-1 text-text-secondary">
          <p>No conversion data available</p>
        </div>
      )}
    </div>
  );
};

export default ConversionSection;
