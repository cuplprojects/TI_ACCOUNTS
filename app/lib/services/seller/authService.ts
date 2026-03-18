import axiosInstance from "../../axiosConfig";
import { setAuthToken, setRefreshToken, removeAuthTokens } from "../../config";
import {
  showErrorMessage,
  showLoading,
  closeLoading,
  showSuccessMessage,
} from "../../swalConfig";
import { AxiosError } from "axios";
import { User, setCurrentUser, USER_STORAGE_KEY } from "../../utils";

interface LoginCredentials {
  email: string;
  password: string;
}

interface ChangePasswordData {
  old_password: string;
  new_password: string;
}

// Enhanced UserData interface based on new API documentation
interface UserData {
  id: string;
  email: string;
  phone: string;
  firm_name: string;
  entity_type: string;
  is_gst_registered: boolean;
  gstin?: string | null;
  isFirstLogin: boolean;
}

// Enhanced AuthResponse interface
interface AuthResponse {
  success: boolean;
  message: string;
  access_token?: string;
  refresh_token?: string;
  data?: UserData;
  errors?: string[];
  required_action?: string;
  message_detail?: string;
  action_required?: string;
  logout?: boolean;
}

// Interface for seller registration data
interface SellerRegistrationData {
  firm_name: string;
  country_code: string;
  phone: string;
  email: string;
  entity_type: string;
  is_gst_registered: boolean;
  gstin?: string;
  password: string;
  is_marketing_emails: boolean;
  is_marketing_sms: boolean;
}

// Login function for seller
export const sellerLogin = async (
  credentials: LoginCredentials
): Promise<{
  success: boolean;
  message: string;
  isFirstLogin?: boolean;
  required_action?: string;
  message_detail?: string;
}> => {
  try {
    showLoading("Authenticating...");

    const response = await axiosInstance.post<AuthResponse>(
      "/seller/auth/login",
      credentials
    );

    closeLoading();

    console.log("Seller login response:", response.data);

    // Check if login was successful based on tokens in the response
    if (
      response.data.access_token &&
      response.data.refresh_token &&
      response.data.data
    ) {
      // Store tokens
      setAuthToken(response.data.access_token);
      setRefreshToken(response.data.refresh_token);

      // Store first login status in localStorage for persistence
      if (response.data.data.isFirstLogin) {
        localStorage.setItem("seller_first_login", "true");
      } else {
        localStorage.removeItem("seller_first_login");
      }

      // Create user object with enhanced data from API response
      const userData: User = {
        id: response.data.data.id,
        name: response.data.data.firm_name,
        email: response.data.data.email,
        avatar: "/images/common/profile.png", // Default avatar
        role: "seller",
        permissions: ["seller"],
      };

      // Save user data using the utility function
      setCurrentUser(userData);
      console.log("User data stored:", userData);

      // Store complete seller data for dashboard use
      localStorage.setItem("seller_data", JSON.stringify(response.data.data));

      // Save the entire response to sessionStorage for debugging
      sessionStorage.setItem("auth_response", JSON.stringify(response.data));

      return {
        success: true,
        message: response.data.message,
        isFirstLogin: response.data.data.isFirstLogin,
        required_action: response.data.required_action,
        message_detail: response.data.message_detail,
      };
    } else {
      // Show error message with SweetAlert2
      await showErrorMessage(response.data.message || "Login failed!");
      return {
        success: false,
        message: response.data.message || "Login failed!",
      };
    }
  } catch (error) {
    closeLoading();
    console.error("Seller login error:", error);

    // Handle different error types based on new API documentation
    const axiosError = error as AxiosError<AuthResponse>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      console.log("Error response:", axiosError.response.data);

      let errorMessage = "Login failed";

      if (status === 404) {
        errorMessage = "Seller not found!";
      } else if (status === 401) {
        errorMessage = "Invalid Password";
      } else if (status === 500) {
        errorMessage =
          axiosError.response.data?.message || "Server error occurred";
      } else {
        errorMessage =
          axiosError.response.data?.message || "Invalid credentials";
      }

      await showErrorMessage(errorMessage);
      return { success: false, message: errorMessage };
    } else if (axiosError.request) {
      // Request made but no response received
      await showErrorMessage(
        "No response from server. Please try again later."
      );
      return {
        success: false,
        message: "No response from server. Please try again later.",
      };
    } else {
      // Error in request setup
      await showErrorMessage("Error logging in. Please try again.");
      return { success: false, message: "Error logging in. Please try again." };
    }
  }
};

// Register seller function
export const registerSeller = async (
  registrationData: SellerRegistrationData
): Promise<{ success: boolean; message: string }> => {
  try {
    showLoading("Registering your account...");

    const response = await axiosInstance.post<AuthResponse>(
      "/seller/auth/register",
      registrationData
    );

    closeLoading();

    console.log("Seller registration response:", response.data);

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || "Registered Successfully!",
      };
    } else {
      // Check if we have specific validation errors in the response
      if (response.data.errors && response.data.errors.length > 0) {
        // Display the specific errors from the array with HTML formatting
        const errorMessageHtml = `
          <p><strong>Validation failed. Please fix the following issues:</strong></p>
          <p>${response.data.errors.join("<br>")}</p>
        `;
        await showErrorMessage(errorMessageHtml);
        return {
          success: false,
          message: errorMessageHtml,
        };
      } else {
        await showErrorMessage(response.data.message || "Registration failed!");
        return {
          success: false,
          message: response.data.message || "Registration failed!",
        };
      }
    }
  } catch (error) {
    closeLoading();
    console.error("Seller registration error:", error);

    // Handle different error types based on new API documentation
    const axiosError = error as AxiosError<AuthResponse>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      console.log("Error response:", axiosError.response.data);

      if (
        status === 400 &&
        axiosError.response.data?.errors &&
        axiosError.response.data.errors.length > 0
      ) {
        const errorMessageHtml = `
          <p><strong>Validation failed. Please fix the following issues:</strong></p>
          <p>${axiosError.response.data.errors.join("<br>")}</p>
        `;
        await showErrorMessage(errorMessageHtml);
        return { success: false, message: errorMessageHtml };
      } else if (status === 500) {
        const errorMessage =
          axiosError.response.data?.message || "Server error occurred";
        await showErrorMessage(errorMessage);
        return { success: false, message: errorMessage };
      } else {
        const errorMessage =
          axiosError.response.data?.message || "Registration failed";
        await showErrorMessage(errorMessage);
        return { success: false, message: errorMessage };
      }
    } else if (axiosError.request) {
      // Request made but no response received
      await showErrorMessage(
        "No response from server. Please try again later."
      );
      return {
        success: false,
        message: "No response from server. Please try again later.",
      };
    } else {
      // Error in request setup
      await showErrorMessage("Error registering. Please try again.");
      return {
        success: false,
        message: "Error registering. Please try again.",
      };
    }
  }
};

// Change password function
export const changePassword = async (
  sellerId: string,
  passwordData: ChangePasswordData
): Promise<{
  success: boolean;
  message: string;
  logout?: boolean;
  action_required?: string;
  message_detail?: string;
}> => {
  try {
    showLoading("Changing password...");

    const response = await axiosInstance.put<AuthResponse>(
      `/seller/auth/change-password/${sellerId}`,
      passwordData
    );

    closeLoading();

    console.log("Change password response:", response.data);

    if (response.data.success) {
      // Check if this is a first-time password change that requires logout
      if (response.data.logout) {
        // Clear first login status since password has been changed
        localStorage.removeItem("seller_first_login");

        // Clear tokens since user needs to re-login
        removeAuthTokens();
        localStorage.removeItem("user_role");
        localStorage.removeItem(USER_STORAGE_KEY); // Clear user data
        localStorage.removeItem("seller_data"); // Clear seller data
        sessionStorage.removeItem("auth_response");

        showSuccessMessage(
          response.data.message_detail ||
            "Your password has been updated. Please login again with your new credentials."
        );

        return {
          success: true,
          message: response.data.message || "Password changed successfully!",
          logout: true,
          action_required: response.data.action_required,
          message_detail: response.data.message_detail,
        };
      } else {
        showSuccessMessage(
          response.data.message || "Password changed successfully!"
        );
        return {
          success: true,
          message: response.data.message || "Password changed successfully!",
        };
      }
    } else {
      await showErrorMessage(
        response.data.message || "Failed to change password"
      );
      return {
        success: false,
        message: response.data.message || "Failed to change password",
      };
    }
  } catch (error) {
    closeLoading();
    console.error("Change password error:", error);

    const axiosError = error as AxiosError<AuthResponse>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      let errorMessage = "Failed to change password";

      if (status === 404) {
        errorMessage = "Seller not found!";
      } else if (status === 401) {
        errorMessage = "Invalid Password";
      } else if (status === 500) {
        errorMessage =
          axiosError.response.data?.message || "Server error occurred";
      } else {
        errorMessage =
          axiosError.response.data?.message || "Failed to change password";
      }

      await showErrorMessage(errorMessage);
      return { success: false, message: errorMessage };
    } else {
      await showErrorMessage(
        "Failed to change password. Please try again later."
      );
      return {
        success: false,
        message: "Failed to change password. Please try again later.",
      };
    }
  }
};

// Logout function
export const sellerLogout = async (): Promise<boolean> => {
  try {
    showLoading("Logging out...");

    const response = await axiosInstance.post<AuthResponse>(
      "/seller/auth/logout"
    );

    closeLoading();

    if (response.data.success) {
      // Clear all stored data
      removeAuthTokens();
      localStorage.removeItem("user_role");
      localStorage.removeItem("seller_first_login");
      localStorage.removeItem(USER_STORAGE_KEY); // Clear user data
      localStorage.removeItem("seller_data"); // Clear seller data
      sessionStorage.removeItem("auth_response");

      showSuccessMessage(response.data.message || "Logged out successfully!");
      return true;
    } else {
      // Even if server logout fails, clear local data
      removeAuthTokens();
      localStorage.removeItem("user_role");
      localStorage.removeItem("seller_first_login");
      localStorage.removeItem(USER_STORAGE_KEY); // Clear user data
      localStorage.removeItem("seller_data"); // Clear seller data
      sessionStorage.removeItem("auth_response");
      return true;
    }
  } catch (error) {
    closeLoading();
    console.error("Logout error:", error);

    // Clear local data even if server request fails
    removeAuthTokens();
    localStorage.removeItem("user_role");
    localStorage.removeItem("seller_first_login");
    localStorage.removeItem(USER_STORAGE_KEY); // Clear user data
    localStorage.removeItem("seller_data"); // Clear seller data
    sessionStorage.removeItem("auth_response");

    return true; // Return true since local cleanup succeeded
  }
};

// Check if user is authenticated
export const isSellerAuthenticated = (): boolean => {
  const token = localStorage.getItem("auth_token");
  return !!token;
};

// Get current seller from stored data
export const getCurrentSeller = (): User | null => {
  try {
    // Use the same key as setCurrentUser function
    const userStr = localStorage.getItem(USER_STORAGE_KEY);
    if (userStr) {
      const user = JSON.parse(userStr) as User;
      return user.role === "seller" ? user : null;
    }
    return null;
  } catch (error) {
    console.error("Error getting current seller:", error);
    return null;
  }
};

// Get detailed seller data from stored data
export const getSellerData = (): UserData | null => {
  try {
    const sellerDataStr = localStorage.getItem("seller_data");
    if (sellerDataStr) {
      return JSON.parse(sellerDataStr) as UserData;
    }
    return null;
  } catch (error) {
    console.error("Error getting seller data:", error);
    return null;
  }
};

// Check if seller needs to change password (first login)
export const checkFirstLoginStatus = (): boolean => {
  try {
    // Check localStorage for first login status
    const isFirstLogin = localStorage.getItem("seller_first_login");
    return isFirstLogin === "true";
  } catch (error) {
    console.error("Error checking first login status:", error);
    return false;
  }
};

// Set first login status (useful for testing)
export const setFirstLoginStatus = (isFirstLogin: boolean): void => {
  try {
    if (isFirstLogin) {
      localStorage.setItem("seller_first_login", "true");
    } else {
      localStorage.removeItem("seller_first_login");
    }
  } catch (error) {
    console.error("Error setting first login status:", error);
  }
};

// Clear all seller data (useful for debugging)
export const clearAllSellerData = (): void => {
  try {
    removeAuthTokens();
    localStorage.removeItem("user_role");
    localStorage.removeItem("seller_first_login");
    localStorage.removeItem(USER_STORAGE_KEY); // Clear user data
    localStorage.removeItem("seller_data"); // Clear seller data
    sessionStorage.removeItem("auth_response");
    console.log("All seller data cleared");
  } catch (error) {
    console.error("Error clearing seller data:", error);
  }
};

// Forgot password for seller
export const forgotPassword = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  try {
    showLoading("Sending reset link...");

    const response = await axiosInstance.post<AuthResponse>(
      "/seller/auth/forgot-password",
      { email }
    );

    closeLoading();

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || "Reset link sent to your email!",
      };
    } else {
      await showErrorMessage(
        response.data.message || "Failed to send reset link"
      );
      return {
        success: false,
        message: response.data.message || "Failed to send reset link",
      };
    }
  } catch (error) {
    closeLoading();
    console.error("Forgot password error:", error);

    const axiosError = error as AxiosError<AuthResponse>;
    if (axiosError.response) {
      const errorMessage =
        axiosError.response.data?.message || "Failed to send reset link";
      await showErrorMessage(errorMessage);
      return { success: false, message: errorMessage };
    } else {
      await showErrorMessage("An unexpected error occurred. Please try again.");
      return {
        success: false,
        message: "An unexpected error occurred. Please try again.",
      };
    }
  }
};

// Reset password for seller
export const resetPassword = async (
  resetToken: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    showLoading("Resetting password...");

    const response = await axiosInstance.post<AuthResponse>(
      "/seller/auth/reset-password",
      { resetToken, newPassword }
    );

    closeLoading();

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || "Password reset successfully!",
      };
    } else {
      await showErrorMessage(
        response.data.message || "Failed to reset password"
      );
      return {
        success: false,
        message: response.data.message || "Failed to reset password",
      };
    }
  } catch (error) {
    closeLoading();
    console.error("Reset password error:", error);

    const axiosError = error as AxiosError<AuthResponse>;
    if (axiosError.response) {
      const errorMessage =
        axiosError.response.data?.message || "Failed to reset password";
      await showErrorMessage(errorMessage);
      return { success: false, message: errorMessage };
    } else {
      await showErrorMessage("An unexpected error occurred. Please try again.");
      return {
        success: false,
        message: "An unexpected error occurred. Please try again.",
      };
    }
  }
};
