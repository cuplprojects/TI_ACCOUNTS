import axiosInstance from "../../axiosConfig";
import { setAuthToken, setRefreshToken, removeAuthTokens } from "../../config";
import {
  showErrorMessage,
  showLoading,
  closeLoading,
  showSuccessMessage,
} from "../../swalConfig";
import { AxiosError } from "axios";
import { User, setCurrentUser } from "../../utils";

interface LoginCredentials {
  email: string;
  password: string;
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

// Login function for admin
export const login = async (
  credentials: LoginCredentials
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
    // The backend sends access_token and refresh_token for successful logins
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
        role: "admin",
        permissions: ["admin"],
      };

      // Save user data using the utility function
      setCurrentUser(userData);

      // Save the entire response to sessionStorage for debugging
      sessionStorage.setItem("auth_response", JSON.stringify(response.data));

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

// Logout function
export const logout = (): void => {
  removeAuthTokens();
  localStorage.removeItem("user_role");
  // Redirect to login page can be handled by the component calling this function
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("auth_token");
  return !!token;
};

// Change password for admin
export const changeAdminPassword = async (
  adminId: string,
  data: { old_password: string; new_password: string }
): Promise<{ success: boolean; message: string }> => {
  try {
    showLoading("Changing password...");
    const response = await axiosInstance.put<{
      success: boolean;
      message: string;
    }>(`/admin/auth/change-password/${adminId}`, {
      oldPassword: data.old_password,
      newPassword: data.new_password,
    });
    closeLoading();

    // Admin API returns message directly, not wrapped in success field
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
    const axiosError = error as import("axios").AxiosError<{
      message?: string;
    }>;
    const msg =
      axiosError.response?.data?.message || "Failed to change password";
    await showErrorMessage(msg);
    return { success: false, message: msg };
  }
};
