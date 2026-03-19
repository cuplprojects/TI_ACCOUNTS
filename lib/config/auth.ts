// Update the API base URL based on environment
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.totallyindian.com/app/v1";

export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LdVAm0sAAAAAOEe95fA4NTxl63vvqIpAWeScYqH";

// Function to get token from local storage
export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
};

// Function to set token in local storage
export const setAuthToken = (token: string): void => {
  if (typeof window !== "undefined") {
    console.log("Setting auth token:", token.substring(0, 10) + "...");
    localStorage.setItem("auth_token", token);
  }
};

// Function to set refresh token in local storage
export const setRefreshToken = (token: string): void => {
  if (typeof window !== "undefined") {
    console.log("Setting refresh token:", token.substring(0, 10) + "...");
    localStorage.setItem("refresh_token", token);
  }
};

// Function to get refresh token from local storage
export const getRefreshToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refresh_token");
  }
  return null;
};

// Function to remove tokens from local storage (logout)
export const removeAuthTokens = (): void => {
  if (typeof window !== "undefined") {
    console.log("Removing auth tokens");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
  }
};

// Debug function to check if tokens exist
export const debugTokens = (): void => {
  if (typeof window !== "undefined") {
    const authToken = localStorage.getItem("auth_token");
    const refreshToken = localStorage.getItem("refresh_token");
    console.log("Auth token exists:", !!authToken);
    console.log("Refresh token exists:", !!refreshToken);
  }
};
