/**
 * Utility functions for handling number inputs with proper validation
 * Only allows: 0-9 and decimal point (.)
 * No special characters, no negative values (except calculated fields)
 */

/**
 * Sanitize number input - only allow digits and decimal point
 * @param value - The input value
 * @returns Sanitized string with only digits and decimal point
 */
export const sanitizeNumberInput = (value: string): string => {
  if (!value) return "";

  // Only allow digits (0-9) and decimal point (.)
  // Remove any other characters
  let sanitized = value.replace(/[^\d.]/g, "");

  // Prevent multiple decimal points
  const parts = sanitized.split(".");
  if (parts.length > 2) {
    sanitized = parts[0] + "." + parts.slice(1).join("");
  }

  return sanitized;
};

/**
 * Parse a number input value, allowing only digits and decimal point
 * @param value - The input value (string or number)
 * @returns The parsed number or empty string if invalid
 */
export const parseNumberInput = (
  value: string | number
): string | number => {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  // Convert to string and sanitize
  const stringValue = typeof value === "string" ? value : value.toString();
  const sanitized = sanitizeNumberInput(stringValue);

  if (sanitized === "") {
    return "";
  }

  const numValue = parseFloat(sanitized);

  // Check if it's a valid number
  if (isNaN(numValue)) {
    return "";
  }

  // Never allow negative values for user input
  if (numValue < 0) {
    return "";
  }

  return numValue;
};

/**
 * Format a number for display in an input field
 * @param value - The value to format
 * @param decimals - Number of decimal places to show (default: 2)
 * @returns Formatted string or empty string
 */
export const formatNumberForDisplay = (
  value: string | number | undefined,
  decimals: number = 2
): string => {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return "";
  }

  // For display, show the number with specified decimals
  return numValue.toFixed(decimals);
};

/**
 * Validate and sanitize number input - only digits and decimal point allowed
 * @param value - The input value
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Validated number or empty string
 */
export const validateNumberInput = (
  value: string | number,
  min?: number,
  max?: number
): string | number => {
  const parsed = parseNumberInput(value);

  if (parsed === "") {
    return "";
  }

  let numValue = typeof parsed === "string" ? parseFloat(parsed) : parsed;

  // Apply min/max constraints
  if (min !== undefined && numValue < min) {
    numValue = min;
  }
  if (max !== undefined && numValue > max) {
    numValue = max;
  }

  return numValue;
};

/**
 * Handle number input change event - sanitize and validate
 * Only allows digits (0-9) and decimal point (.)
 * Properly handles leading zero for decimals (e.g., .2 becomes 0.2)
 * @param e - The change event
 * @returns The validated number or empty string
 */
export const handleNumberInputChange = (
  e: React.ChangeEvent<HTMLInputElement>
): string | number => {
  const value = e.target.value;

  // Allow empty input
  if (value === "") {
    return "";
  }

  // Sanitize the input - only allow digits and decimal point
  let sanitized = sanitizeNumberInput(value);

  if (sanitized === "") {
    return "";
  }

  // Add leading zero if starts with decimal point (e.g., ".2" -> "0.2")
  if (sanitized.startsWith(".")) {
    sanitized = "0" + sanitized;
  }

  const numValue = parseFloat(sanitized);

  // Check if it's a valid number
  if (isNaN(numValue)) {
    return "";
  }

  // Never allow negative values
  if (numValue < 0) {
    return "";
  }

  return numValue;
};

/**
 * Handle keydown event to prevent invalid characters before they're entered
 * Only allows: digits (0-9), decimal point (.), backspace, delete, tab, arrow keys
 * @param e - The keyboard event
 * @param allowDecimal - Whether to allow decimal point (default: true). Set to false for integer-only fields like quantity
 */
export const handleNumberKeyDown = (
  e: React.KeyboardEvent<HTMLInputElement>,
  allowDecimal: boolean = true
): void => {
  const key = e.key;
  const target = e.currentTarget;

  // Allow: backspace, delete, tab, escape, enter, arrow keys, home, end
  const allowedKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "Escape",
    "Enter",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Home",
    "End",
  ];

  if (allowedKeys.includes(key)) {
    return;
  }

  // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
  if ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x"].includes(key.toLowerCase())) {
    return;
  }

  // Allow: digits (0-9)
  if (/^\d$/.test(key)) {
    return;
  }

  // Allow: decimal point (.) - but only if not already present and if decimals are allowed
  if (key === ".") {
    if (allowDecimal) {
      // Allow decimal point if it's not already in the value
      if (!target.value.includes(".")) {
        return;
      }
      // Prevent if decimal already exists
      e.preventDefault();
    } else {
      // Prevent decimal point for integer-only fields
      e.preventDefault();
    }
    return;
  }

  // Prevent all other keys (including -, +, e, E, etc.)
  e.preventDefault();
};
