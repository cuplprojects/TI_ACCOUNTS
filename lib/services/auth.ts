import axiosInstance from "@/lib/api/axios";
import { setAuthToken, setRefreshToken, removeAuthTokens } from "@/lib/config/auth";
import { showErrorMessage, showLoading, closeLoading, showSuccessMessage } from "@/lib/config/swal";
import { AxiosError } from "axios";
import { User, setCurrentUser } from "@/lib/utils";
import { startTokenManager, stopTokenManager } from "@/lib/utils/tokenManager";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

interface UserData {
  id: string;
  username?: string;
  email: string;
  isFirstLogin?: boolean;
  [key: string]: unknown;
}

interface AuthResponse {
  success?: boolean;
  message: string;
  access_token?: string;
  refresh_token?: string;
  data?: UserData;
  errors?: string[];
}

// Login function for accounts (using admin auth endpoint)
export const login = async (
  credentials: LoginRequest
): Promise<{ success: boolean; message: string }> => {
  try {
    showLoading("Authenticating...");

    const response = await axiosInstance.post<AuthResponse>(
      "/admin/auth/login",
      credentials
    );

    closeLoading();

    console.log("Login response:", response.data);

    // Check if login was successful based on tokens in the response
    if (response.data.access_token && response.data.refresh_token) {
      // Store tokens
      setAuthToken(response.data.access_token);
      setRefreshToken(response.data.refresh_token);

      // Create user object and store it
      const userData: User = {
        id: response.data.data?.id || "admin-id",
        name: response.data.data?.username || "Admin User",
        email: response.data.data?.email || credentials.email,
        avatar: "/images/common/profile.png", // Default avatar
        role: "accountant", // Set as accountant for accounts access
        permissions: ["admin", "accountant"], // Add accountant permission
      };

      // Save user data using the utility function
      setCurrentUser(userData);

      // Save the entire response to sessionStorage for debugging
      sessionStorage.setItem("auth_response", JSON.stringify(response.data));

      // Start token manager for automatic refresh
      startTokenManager();

      return { success: true, message: response.data.message };
    } else {
      // Show error message with SweetAlert2
      await showErrorMessage(response.data.message || "Login failed!");
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    closeLoading();
    console.error("Login error:", error);

    // Handle different error types
    const axiosError = error as AxiosError<AuthResponse>;
    if (axiosError.response) {
      // Server responded with error
      console.log("Error response:", axiosError.response.data);
      const errorMessage =
        axiosError.response.data?.message || "Invalid credentials";
      await showErrorMessage(errorMessage);
    } else if (axiosError.request) {
      // Request made but no response received
      await showErrorMessage(
        "No response from server. Please try again later."
      );
    } else {
      // Error in request setup
      await showErrorMessage("Error logging in. Please try again.");
    }

    return { success: false, message: "Error logging in. Please try again." };
  }
};

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const register = async (userData: RegisterRequest): Promise<LoginResponse> => {
  try {
    // For demo purposes, simulate a successful registration
    // In a real app, this would make an API call
    if (userData.password !== userData.confirmPassword) {
      return {
        success: false,
        message: "Passwords do not match"
      };
    }

    const mockResponse: LoginResponse = {
      success: true,
      message: "Registration successful",
      data: {
        user: {
          id: "1",
          name: userData.name,
          email: userData.email,
          role: "accountant", // Default role for registration
          avatar: "", // Added required avatar field
          permissions: ["read", "write"] // Added required permissions field
        },
        token: "demo-token-" + Date.now()
      }
    };

    if (mockResponse.success && mockResponse.data) {
      // Store auth token and user data
      setAuthToken(mockResponse.data.token);
      setCurrentUser(mockResponse.data.user);
    }

    return mockResponse;
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: "Registration failed. Please try again."
    };
  }
};

export const logout = () => {
  // Stop token manager
  stopTokenManager();
  
  removeAuthTokens();
  localStorage.removeItem("user_role");
  // Clear current user data
  localStorage.removeItem("current_user");
};

export const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    // For demo purposes, simulate a successful forgot password request
    return {
      success: true,
      message: "Password reset instructions sent to your email"
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    return {
      success: false,
      message: "Failed to send reset instructions. Please try again."
    };
  }
};

export const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  try {
    // For demo purposes, simulate a successful password reset
    return {
      success: true,
      message: "Password reset successfully"
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      success: false,
      message: "Failed to reset password. Please try again."
    };
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("auth_token");
  return !!token;
};

// Change password for accounts user
export const changePassword = async (
  userId: string,
  data: { old_password: string; new_password: string }
): Promise<{ success: boolean; message: string }> => {
  try {
    showLoading("Changing password...");
    const response = await axiosInstance.put<{
      success: boolean;
      message: string;
    }>(`/admin/auth/change-password/${userId}`, {
      oldPassword: data.old_password,
      newPassword: data.new_password,
    });
    closeLoading();

    if (response.data.message) {
      showSuccessMessage(
        response.data.message || "Password changed successfully"
      );
      return { success: true, message: response.data.message };
    } else {
      await showErrorMessage("Failed to change password");
      return { success: false, message: "Failed to change password" };
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<{
      message?: string;
    }>;
    const msg =
      axiosError.response?.data?.message || "Failed to change password";
    await showErrorMessage(msg);
    return { success: false, message: msg };
  }
};