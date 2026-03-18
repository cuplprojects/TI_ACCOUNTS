import React from 'react';

const ProgressBar = ({
  fill_background_color = "#e0e1e2",
  border_border_radius = "2px",
  layout_width,
  position,
  variant = 'default',
  size = 'medium',
  className,
  value = 0,
  max = 100,
  fillColor = "#3b82f6",
  showLabel = false,
  label,
  animated = false,
  striped = false,
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const containerStyles = {
    backgroundColor: fill_background_color || '#e0e1e2',
    borderRadius: border_border_radius || '2px',
  };

  const fillStyles = {
    width: `${percentage}%`,
    backgroundColor: fillColor,
    borderRadius: border_border_radius || '2px',
  };

  const sizeClasses = {
    small: 'h-1',
    medium: 'h-2',
    large: 'h-4',
  };

  const getLabelText = () => {
    if (label) return label;
    if (showLabel) return `${Math.round(percentage)}%`;
    return null;
  };

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">
            {getLabelText()}
          </span>
          {showLabel && !label && (
            <span className="text-sm text-gray-500">
              {value} / {max}
            </span>
          )}
        </div>
      )}

      <div
        style={containerStyles}
        className={`relative overflow-hidden transition-all duration-300 ${sizeClasses[size] || 'h-2'} ${className || ''}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={getLabelText() || `Progress: ${percentage}%`}
        {...props}
      >
        <div
          style={fillStyles}
          className={`h-full transition-all duration-500 ease-out relative overflow-hidden ${
            animated ? 'animate-pulse' : ''
          }`}
        >
          {striped && (
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
              }}
            />
          )}
          
          {animated && (
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                animation: 'shimmer 2s infinite',
              }}
            />
          )}
        </div>

        {value === undefined && (
          <div 
            className="absolute inset-0 opacity-60"
            style={{
              background: `linear-gradient(90deg, transparent, ${fillColor}, transparent)`,
              animation: 'indeterminate 2s infinite linear',
            }}
          />
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes indeterminate {
          0% { transform: translateX(-100%) scaleX(0); }
          40% { transform: translateX(-100%) scaleX(0.4); }
          100% { transform: translateX(100%) scaleX(0.5); }
        }
      `}</style>
    </div>
  );
};

export default ProgressBar;
