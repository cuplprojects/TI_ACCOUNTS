import axios from "axios";
import { setAuthToken, setCurrentUser, removeAuthTokens, removeCurrentUser } from "@/lib/config/auth";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    token: string;
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    // For demo purposes, simulate a successful login
    // In a real app, this would make an API call
    const mockResponse: LoginResponse = {
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: "1",
          name: "Demo User",
          email: credentials.email,
          role: "user"
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
    console.error("Login error:", error);
    return {
      success: false,
      message: "Login failed. Please try again."
    };
  }
};

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
          role: "user"
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
  removeAuthTokens();
  removeCurrentUser();
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