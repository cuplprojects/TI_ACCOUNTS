import { getAuthToken, getRefreshToken, setAuthToken, setRefreshToken, removeAuthTokens, isTokenExpiringSoon } from "@/lib/config/auth";
import { encrypt, decrypt } from "@/lib/utils/encryption";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.totallyindian.com/app/v1";

// Helper to check if encryption is disabled
const isEncryptionDisabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return process.env.NEXT_PUBLIC_ENCRYPTION_DISABLED === 'true';
};

let tokenCheckInterval: NodeJS.Timeout | null = null;

// Function to refresh token
const refreshAuthToken = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    console.log("No refresh token available");
    return false;
  }

  try {
    console.log("Refreshing token via token manager...");
    
    let refreshBody: any = {};
    if (isEncryptionDisabled()) {
      refreshBody = {};
    } else {
      refreshBody = { data: encrypt({}) };
    }

    const response = await axios.post(`${API_BASE_URL}/admin/auth/refresh-token`, refreshBody, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    let responseData = response.data;
    if (!isEncryptionDisabled() && responseData && (responseData as any).data && typeof (responseData as any).data === 'string') {
      const dec = decrypt((responseData as any).data);
      if (dec) responseData = dec;
    }

    if (responseData.success && responseData.data) {
      let accessToken, newRefreshToken;
      
      if (responseData.data.accessToken && responseData.data.refreshToken) {
        accessToken = responseData.data.accessToken;
        newRefreshToken = responseData.data.refreshToken;
      } else if (responseData.data.access_token && responseData.data.refresh_token) {
        accessToken = responseData.data.access_token;
        newRefreshToken = responseData.data.refresh_token;
      }

      if (accessToken && newRefreshToken) {
        setAuthToken(accessToken);
        setRefreshToken(newRefreshToken);
        console.log("Token refreshed successfully via token manager");
        return true;
      }
    }

    console.log("Token refresh failed - invalid response");
    return false;
  } catch (error) {
    console.error("Token refresh error:", error);
    return false;
  }
};

// Function to check and refresh token if needed
const checkAndRefreshToken = async () => {
  const token = getAuthToken();
  if (!token) {
    return;
  }

  if (isTokenExpiringSoon(token)) {
    console.log("Token expiring soon, refreshing...");
    const success = await refreshAuthToken();
    if (!success) {
      console.log("Token refresh failed, logging out");
      removeAuthTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }
  }
};

// Start periodic token checking
export const startTokenManager = () => {
  if (typeof window === "undefined") return;
  
  // Clear existing interval if any
  if (tokenCheckInterval) {
    clearInterval(tokenCheckInterval);
  }

  // Check token every 2 minutes
  tokenCheckInterval = setInterval(checkAndRefreshToken, 2 * 60 * 1000);
  
  // Also check immediately
  checkAndRefreshToken();
  
  console.log("Token manager started");
};

// Stop periodic token checking
export const stopTokenManager = () => {
  if (tokenCheckInterval) {
    clearInterval(tokenCheckInterval);
    tokenCheckInterval = null;
    console.log("Token manager stopped");
  }
};

// Manual token refresh function
export const manualRefreshToken = refreshAuthToken;