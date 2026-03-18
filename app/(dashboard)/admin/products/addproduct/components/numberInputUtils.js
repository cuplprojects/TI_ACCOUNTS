/**
 * Utility functions for handling number inputs
 * Prevents negative numbers and allows decimal values like 0.12
 */

export const handleNumberInputChange = (e) => {
  let value = e.target.value;

  // Allow empty string
  if (value === '') {
    return value;
  }

  // Remove any minus signs
  value = value.replace(/-/g, '');

  // Allow only numbers and one decimal point
  value = value.replace(/[^\d.]/g, '');

  // Prevent multiple decimal points
  const parts = value.split('.');
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('');
  }

  // Prevent leading zeros before decimal (except for 0.xx)
  if (value.startsWith('0') && value.length > 1 && value[1] !== '.') {
    value = value.substring(1);
  }

  return value;
};

export const handleNumberKeyDown = (e) => {
  // Allow: backspace, delete, tab, escape, enter, decimal point
  const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', '.'];
  
  // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
  if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
    return;
  }

  // Allow arrow keys
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
    return;
  }

  // Prevent minus sign
  if (e.key === '-' || e.key === '+') {
    e.preventDefault();
    return;
  }

  // Allow only numbers and decimal point
  if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
    e.preventDefault();
  }
};

export const formatNumberForDisplay = (value) => {
  if (value === '' || value === null || value === undefined) {
    return '';
  }
  return String(value);
};

export const validateNumberInput = (value, options = {}) => {
  const {
    allowZero = true,
    allowDecimals = true,
    min = 0,
    max = Infinity,
  } = options;

  if (value === '' || value === null || value === undefined) {
    return true;
  }

  const numValue = parseFloat(value);

  if (isNaN(numValue)) {
    return false;
  }

  if (!allowZero && numValue === 0) {
    return false;
  }

  if (numValue < min || numValue > max) {
    return false;
  }

  if (!allowDecimals && !Number.isInteger(numValue)) {
    return false;
  }

  return true;
};
