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
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Encrypt data if not FormData and encryption is enabled
    if (config.data && !(config.data instanceof FormData)) {
      if (isEncryptionDisabled()) {
        console.log('🔓 Encryption disabled - sending plaintext');
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

      // Handle 401 Unauthorized errors
      if (error.response.status === 401 && !originalRequest._retry) {
        // Don't retry refresh token or login requests
        const isRefreshRequest = originalRequest.url?.includes("/auth/refresh-token");
        const isLoginRequest = originalRequest.url?.includes("/auth/login");

        if (isRefreshRequest || isLoginRequest) {
          return Promise.reject(error);
        }

        // Check if error is token expiration
        if (isTokenExpired(errorMessage)) {
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
            removeAuthTokens();
            isRefreshing = false;
            processQueue(new Error("No refresh token"), null);

            if (typeof window !== "undefined") {
              setTimeout(() => {
                window.location.href = "/login";
              }, 500);
            }
            return Promise.reject(error);
          }

          try {
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

            // Decrypt response manually only if encryption is enabled
            let responseData = refreshResponse.data;
            if (!isEncryptionDisabled() && responseData && (responseData as any).data && typeof (responseData as any).data === 'string') {
              const dec = decrypt((responseData as any).data);
              if (dec) responseData = dec;
            }

            if (responseData.success && responseData.data) {
              // Store new tokens
              // Check matching structure
              const { accessToken, refreshToken: newRefreshToken } = responseData.data;
              setAuthToken(accessToken);
              setRefreshToken(newRefreshToken);

              // Update original request with new token
              originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

              // Process queued requests
              processQueue(null, refreshResponse.data.data.accessToken);

              // Retry original request
              return axiosInstance(originalRequest);
            } else {
              removeAuthTokens();
              processQueue(new Error("Token refresh failed"), null);

              if (typeof window !== "undefined") {
                setTimeout(() => {
                  window.location.href = "/login";
                }, 500);
              }
              return Promise.reject(error);
            }
          } catch (refreshError) {
            removeAuthTokens();
            processQueue(
              refreshError instanceof Error ? refreshError : new Error("Token refresh failed"),
              null
            );

            if (typeof window !== "undefined") {
              setTimeout(() => {
                window.location.href = "/login";
              }, 500);
            }
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        } else {
          // Other 401 errors - clear auth and redirect
          removeAuthTokens();

          if (typeof window !== "undefined") {
            setTimeout(() => {
              window.location.href = "/login";
            }, 500);
          }
          return Promise.reject(error);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
