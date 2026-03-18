/**
 * Formats a string into a valid URL slug/handle
 * - Converts to lowercase
 * - Replaces spaces with hyphens
 * - Removes special characters except hyphens
 * - Removes consecutive hyphens
 *
 * @param input The string to format as a URL handle
 * @returns A properly formatted URL handle
 */
export const formatUrlHandle = (input: string): string => {
  if (!input) return "";

  return input
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading/trailing spaces
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9\-]/g, "") // Remove special characters except hyphens and alphanumeric
    .replace(/-+/g, "-") // Replace consecutive hyphens with a single hyphen
    .replace(/^-|-$/g, ""); // Remove leading and trailing hyphens
};

/**
 * Validates if a string is a valid URL handle
 * - Only lowercase letters, numbers, and hyphens are allowed
 * - No consecutive hyphens
 * - No leading or trailing hyphens
 *
 * @param input The string to validate
 * @returns True if valid, false otherwise
 */
export const isValidUrlHandle = (input: string): boolean => {
  if (!input) return false;

  // Valid URL handle pattern: only lowercase letters, numbers, and hyphens
  // No consecutive hyphens, no leading or trailing hyphens
  const validUrlPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  return validUrlPattern.test(input);
};
