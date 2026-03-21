import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import {
  API_BASE_URL,
  getAuthToken,
  getRefreshToken,
  removeAuthTokens,
  setAuthToken,
  setRefreshToken,
  isTokenExpired as checkTokenExpired,
  isTokenExpiringSoon,
} from "@/lib/config/auth";
import { encrypt, decrypt } from "@/lib/utils/encryption";

// Helper to check if encryption is disabled (checked at runtime)
const isEncryptionDisabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return process.env.NEXT_PUBLIC_ENCRYPTION_DISABLED === 'true';
};

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
// Queue of requests to retry after token refresh
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

// Helper function to determine if error is token expiration
const isTokenExpired = (errorMessage: string): boolean => {
  const expiredIndicators = [
    "jwt expired",
    "token expired",
    "expired refresh token",
    "invalid or expired",
    "unauthorized",
    "invalid token",
    "token not found",
    "authentication failed"
  ];
  return expiredIndicators.some((indicator) =>
    errorMessage.toLowerCase().includes(indicator)
  );
};

// Process the queue of failed requests with the new token or error
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 500000,
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    
    // Debug logging for token attachment
    console.log('Request interceptor - URL:', config.url);
    console.log('Request interceptor - Has token:', !!token);
    console.log('Request interceptor - Token length:', token?.length || 0);
    
    if (token) {
      // Check if token is expired or expiring soon
      if (checkTokenExpired(token)) {
        console.log("Token is expired, removing tokens");
        removeAuthTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        return Promise.reject(new Error("Token expired"));
      } else if (isTokenExpiringSoon(token) && !isRefreshing) {
        console.log("Token expiring soon, attempting proactive refresh");
        // Proactively refresh token if it's expiring soon
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          try {
            isRefreshing = true;
            let refreshBody: any = {};
            if (isEncryptionDisabled()) {
              refreshBody = {};
            } else {
              refreshBody = { data: encrypt({}) };
            }

            const refreshResponse = await axios.post(`${API_BASE_URL}/admin/auth/refresh-token`, refreshBody, {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
                "Content-Type": "application/json",
              },
              timeout: 10000,
            });

            let responseData = refreshResponse.data;
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
                config.headers["Authorization"] = `Bearer ${accessToken}`;
                console.log("Proactive token refresh successful");
              }
            }
          } catch (error) {
            console.error("Proactive token refresh failed:", error);
            // Continue with existing token, let response interceptor handle it
          } finally {
            isRefreshing = false;
          }
        }
      } else {
        config.headers["Authorization"] = `Bearer ${token}`;
        console.log('Request interceptor - Token attached successfully');
      }
    } else {
      console.log('Request interceptor - No token found, request will be sent without auth');
    }

    // Encrypt data if not FormData and encryption is enabled
    if (config.data && !(config.data instanceof FormData)) {
      if (isEncryptionDisabled()) {
        // Keep data as-is, don't wrap in encryption
      } else {
        config.data = { data: encrypt(config.data) };
      }
    }

    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Decrypt response data only if encryption is enabled
    if (!isEncryptionDisabled() && response.data && response.data.data && typeof response.data.data === 'string') {
      const decrypted = decrypt(response.data.data);
      if (decrypted) response.data = decrypted;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response) {
      // Decrypt error response only if encryption is enabled
      if (!isEncryptionDisabled() && error.response.data && (error.response.data as any).data && typeof (error.response.data as any).data === 'string') {
        const decrypted = decrypt((error.response.data as any).data);
        if (decrypted) error.response.data = decrypted;
      }
      const errorData = error.response.data as Record<string, unknown>;
      const errorMessage =
        (errorData?.message as string) ||
        (errorData?.error as string) ||
        error.response.statusText ||
        "Unknown error";

      // Handle 401 Unauthorized errors ONLY
      if (error.response.status === 401 && !originalRequest._retry) {
        // Don't retry refresh token or login requests
        const isRefreshRequest = originalRequest.url?.includes("/auth/refresh-token");
        const isLoginRequest = originalRequest.url?.includes("/auth/login");

        if (isRefreshRequest || isLoginRequest) {
          return Promise.reject(error);
        }

        // For 401 errors, try to refresh the token
        console.log("401 error detected, attempting token refresh...");
        console.log("Original request URL:", originalRequest.url);
        console.log("Error message:", errorMessage);
        
        // Store error details for debugging
        if (typeof window !== "undefined") {
          localStorage.setItem('last_401_error', JSON.stringify({
            url: originalRequest.url,
            message: errorMessage,
            timestamp: new Date().toISOString()
          }));
        }
        
        if (isRefreshing) {
          // Queue this request while refresh is in progress
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = getRefreshToken();

        if (!refreshToken) {
          console.log("No refresh token found, would redirect to login");
          removeAuthTokens();
          isRefreshing = false;
          processQueue(new Error("No refresh token"), null);

          // Store debug info instead of immediate redirect
          if (typeof window !== "undefined") {
            localStorage.setItem('auth_debug', JSON.stringify({
              reason: 'no_refresh_token',
              originalUrl: originalRequest.url,
              timestamp: new Date().toISOString()
            }));
            
            // Only redirect for auth-related pages or if explicitly needed
            if (window.location.pathname.includes('/auth/') || 
                window.location.pathname === '/dashboard' ||
                errorMessage.toLowerCase().includes('token')) {
              setTimeout(() => {
                window.location.href = "/auth/login";
              }, 500);
            }
          }
          return Promise.reject(error);
        }

        try {
          console.log("Attempting to refresh token...");
          // Use plain axios to avoid interceptor loop
          // Prepare refresh body
          let refreshBody: any = {};
          if (isEncryptionDisabled()) {
            console.log('🔓 Encryption disabled - sending plaintext refresh');
            refreshBody = {};
          } else {
            refreshBody = { data: encrypt({}) };
          }

          const refreshResponse = await axios.post<{
            success: boolean;
            data: any;
          }>(`${API_BASE_URL}/admin/auth/refresh-token`, refreshBody, {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
              "Content-Type": "application/json",
            },
            timeout: 10000,
          });

          console.log("Refresh response:", refreshResponse.data);

          // Decrypt response manually only if encryption is enabled
          let responseData = refreshResponse.data;
          if (!isEncryptionDisabled() && responseData && (responseData as any).data && typeof (responseData as any).data === 'string') {
            const dec = decrypt((responseData as any).data);
            if (dec) responseData = dec;
          }

          if (responseData.success && responseData.data) {
            // Store new tokens - handle different response structures
            let accessToken, newRefreshToken;
            
            if (responseData.data.accessToken && responseData.data.refreshToken) {
              // Standard structure
              accessToken = responseData.data.accessToken;
              newRefreshToken = responseData.data.refreshToken;
            } else if (responseData.data.access_token && responseData.data.refresh_token) {
              // Alternative structure
              accessToken = responseData.data.access_token;
              newRefreshToken = responseData.data.refresh_token;
            } else {
              console.error("Unexpected token response structure:", responseData.data);
              throw new Error("Invalid token response structure");
            }

            console.log("Storing new tokens...");
            setAuthToken(accessToken);
            setRefreshToken(newRefreshToken);

            // Update original request with new token
            originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

            // Process queued requests
            processQueue(null, accessToken);

            console.log("Token refresh successful, retrying original request");
            // Retry original request
            return axiosInstance(originalRequest);
          } else {
            console.log("Token refresh failed - invalid response");
            removeAuthTokens();
            processQueue(new Error("Token refresh failed"), null);

            // Only redirect if it's actually an auth issue
            if (typeof window !== "undefined" && 
                (errorMessage.toLowerCase().includes('token') || 
                 errorMessage.toLowerCase().includes('unauthorized') ||
                 errorMessage.toLowerCase().includes('forbidden'))) {
              setTimeout(() => {
                window.location.href = "/auth/login";
              }, 500);
            }
            return Promise.reject(error);
          }
        } catch (refreshError) {
          console.error("Token refresh error:", refreshError);
          removeAuthTokens();
          processQueue(
            refreshError instanceof Error ? refreshError : new Error("Token refresh failed"),
            null
          );

          // Only redirect if it's actually an auth issue
          if (typeof window !== "undefined" && 
              (errorMessage.toLowerCase().includes('token') || 
               errorMessage.toLowerCase().includes('unauthorized') ||
               errorMessage.toLowerCase().includes('forbidden'))) {
            setTimeout(() => {
              window.location.href = "/auth/login";
            }, 500);
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else if (error.response.status === 403) {
        // Handle 403 Forbidden - user doesn't have permission
        console.log("403 Forbidden - Access denied");
        // Don't redirect to login for permission errors, just reject
        return Promise.reject(error);
      } else if (error.response.status === 404) {
        // Handle 404 Not Found - resource doesn't exist
        console.log("404 Not Found - Resource not found");
        // Don't redirect to login for not found errors, just reject
        return Promise.reject(error);
      } else if (error.response.status >= 500) {
        // Handle 5xx Server Errors
        console.log("Server error:", error.response.status);
        // Don't redirect to login for server errors, just reject
        return Promise.reject(error);
      } else {
        // Handle other errors (400, etc.)
        console.log("Other error:", error.response.status, errorMessage);
        // Don't redirect to login for other errors, just reject
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;