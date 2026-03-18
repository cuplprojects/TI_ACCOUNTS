// Regex patterns for validation
export const REGEX_PATTERNS = {
  // Indian GST format: 2 chars for state code, 10 chars for PAN, 1 char for entity, 1 char for check digit, 1 char Z by default
  GST: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  // Basic email validation
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  // International phone number (7–15 digits, per ITU-T E.164)
  PHONE: /^\d{7,15}$/,
  // Password requirements (min 8 chars, at least 1 uppercase, 1 lowercase, 1 number)
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  // PAN validation (5 letters, 4 numbers, 1 letter)
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
};

// Validation functions
export const validateGST = (gst: string): boolean => {
  if (!gst) return false;
  return REGEX_PATTERNS.GST.test(gst);
};

export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  return REGEX_PATTERNS.EMAIL.test(email);
};

export const validatePhone = (phone: string): boolean => {
  if (!phone) return false;
  // Strip all non-digit characters (spaces, dashes, parentheses, +)
  const cleanPhone = phone.replace(/\D/g, "");
  // Accept 7–15 digits (international ITU-T E.164 standard)
  return cleanPhone.length >= 7 && cleanPhone.length <= 15;
};

export const validatePassword = (password: string): boolean => {
  if (!password) return false;
  return REGEX_PATTERNS.PASSWORD.test(password);
};

export const validatePAN = (pan: string): boolean => {
  if (!pan) return false;
  return REGEX_PATTERNS.PAN.test(pan);
};

// Error messages for validations
export const VALIDATION_ERRORS = {
  GST: "Please enter a valid GSTIN (e.g., 22AAAAA0000A1Z5)",
  EMAIL: "Please enter a valid email address",
  PHONE: "Please enter a valid phone number (7–15 digits)",
  PASSWORD:
    "Password must be at least 8 characters and include uppercase, lowercase, and numbers",
  PAN: "Please enter a valid PAN (e.g., ABCDE1234F)",
  REQUIRED: (field: string) => `${field} is required`,
  MISMATCH: (field: string) => `${field} does not match`,
};

// Helper function to get validation error message
export const getValidationError = (
  field: string,
  value: string
): string | null => {
  if (!value) return VALIDATION_ERRORS.REQUIRED(field);

  switch (field.toLowerCase()) {
    case "gst":
    case "gstin":
      return validateGST(value) ? null : VALIDATION_ERRORS.GST;
    case "email":
      return validateEmail(value) ? null : VALIDATION_ERRORS.EMAIL;
    case "phone":
      return validatePhone(value) ? null : VALIDATION_ERRORS.PHONE;
    case "password":
      return validatePassword(value) ? null : VALIDATION_ERRORS.PASSWORD;
    case "pan":
      return validatePAN(value) ? null : VALIDATION_ERRORS.PAN;
    default:
      return null;
  }
};
