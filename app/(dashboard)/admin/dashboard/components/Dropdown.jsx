import React, { useState, useRef, useEffect } from 'react';

const Dropdown = ({
  placeholder = "Select option",
  text_font_size = "14",
  text_font_family = "Manrope",
  text_font_weight = "600",
  text_line_height = "20px",
  text_text_align = "left",
  text_color = "#6d6d6d",
  fill_background_color = "#ffffff",
  border_border_radius = "6px",
  layout_gap,
  layout_width,
  padding,
  position,
  margin,
  className,
  options = [],
  value,
  onChange,
  disabled = false,
  rightIcon = true,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const dropdownRef = useRef(null);

  const dropdownStyles = {
    fontWeight: text_font_weight || '600',
    lineHeight: text_line_height || '20px',
    textAlign: text_text_align || 'left',
    color: text_color || '#6d6d6d',
    backgroundColor: fill_background_color || '#ffffff',
    borderRadius: border_border_radius || '6px',
  };

  const defaultOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const dropdownOptions = options?.length > 0 ? options : defaultOptions;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionSelect = (option) => {
    setSelectedValue(option?.value);
    setIsOpen(false);
    if (typeof onChange === 'function') {
      onChange(option);
    }
  };

  const displayValue = () => {
    if (selectedValue) {
      const selected = dropdownOptions?.find(option => option?.value === selectedValue);
      return selected ? selected?.label : selectedValue;
    }
    return placeholder;
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={dropdownStyles}
        className={`relative inline-flex items-center justify-between cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 border border-gray-200 px-2 sm:px-3 py-2 min-h-[40px] w-full ${
          isOpen ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className || ''}`}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-disabled={disabled}
        onKeyDown={(e) => {
          if (e?.key === 'Enter' || e?.key === ' ') {
            e?.preventDefault();
            if (!disabled) setIsOpen(!isOpen);
          }
        }}
        {...props}
      >
        <span className="flex-1 truncate text-sm">
          {displayValue()}
        </span>
        
        {rightIcon && (
          <div className={`flex-shrink-0 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <img 
              src="/images/Icons/img_arrowdown.svg" 
              alt="Dropdown arrow" 
              className="w-3 h-3 sm:w-4 sm:h-4"
            />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          <ul role="listbox" className="py-1">
            {dropdownOptions?.map((option, index) => (
              <li
                key={option?.value || index}
                onClick={() => handleOptionSelect(option)}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors duration-150 text-sm ${
                  selectedValue === option?.value ? 'bg-blue-50 text-blue-600' : ''
                }`}
                role="option"
                aria-selected={selectedValue === option?.value}
              >
                {option?.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
