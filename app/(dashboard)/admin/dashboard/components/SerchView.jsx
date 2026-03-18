import React, { useState } from 'react';

const SearchView = ({
  placeholder = "Search order, customer, seller, etc",
  text_font_size = "12",
  text_font_family = "Manrope",
  text_font_weight = "400",
  text_line_height = "17px",
  text_text_align = "left",
  text_color = "#6b6b6a",
  fill_background_color = "#f9f9f9",
  border_border_radius = "8px",
  layout_gap,
  layout_width,
  padding,
  position,
  variant,
  size,
  className,
  value,
  onChange,
  onSubmit,
  onFocus,
  onBlur,
  disabled = false,
  rightIcon = true,
  leftIcon,
  ...props
}) => {
  const [searchValue, setSearchValue] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);

  const containerStyles = {
    backgroundColor: fill_background_color || '#f9f9f9',
    borderRadius: border_border_radius || '8px',
  };

  const inputStyles = {
    fontWeight: text_font_weight || '400',
    lineHeight: text_line_height || '17px',
    textAlign: text_text_align || 'left',
    color: text_color || '#6b6b6a',
  };

  const handleInputChange = (event) => {
    const newValue = event?.target?.value;
    setSearchValue(newValue);
    if (typeof onChange === 'function') {
      onChange(event);
    }
  };

  const handleSubmit = (event) => {
    event?.preventDefault();
    if (typeof onSubmit === 'function') {
      onSubmit(searchValue);
    }
  };

  const handleFocus = (event) => {
    setIsFocused(true);
    if (typeof onFocus === 'function') {
      onFocus(event);
    }
  };

  const handleBlur = (event) => {
    setIsFocused(false);
    if (typeof onBlur === 'function') {
      onBlur(event);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        style={containerStyles}
        className={`inline-flex items-center relative transition-all duration-200 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 border border-gray-200 px-2 sm:px-3 py-2 w-full ${
          isFocused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className || ''}`}
      >
        {leftIcon && (
          <div className="flex-shrink-0 mr-2">
            {typeof leftIcon === 'string' ? (
              <img 
                src={leftIcon} 
                alt="Search" 
                className="w-4 h-4 sm:w-5 sm:h-5"
              />
            ) : (
              leftIcon
            )}
          </div>
        )}
        
        <input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          style={inputStyles}
          className={`flex-1 bg-transparent border-0 outline-none placeholder:opacity-70 text-sm ${
            disabled ? 'cursor-not-allowed' : ''
          }`}
          {...props}
        />
        
        {rightIcon && (
          <button
            type="submit"
            disabled={disabled}
            className={`flex-shrink-0 ml-2 p-1 hover:bg-gray-200 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
              disabled ? 'cursor-not-allowed hover:bg-transparent' : ''
            }`}
            aria-label="Search"
          >
            <img 
              src="/images/Icons/img_icon_magnifyingglass.svg" 
              alt="Search" 
              className="w-3 h-3 sm:w-4 sm:h-4"
            />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchView;
