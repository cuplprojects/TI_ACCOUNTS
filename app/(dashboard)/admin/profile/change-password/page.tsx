"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { changeAdminPassword } from "@/app/lib/services/admin/authService";
import { useAuth } from "@/app/providers/AuthProvider";
import { logout } from "@/app/lib/services/admin/authService";
import { showErrorMessage } from "@/app/lib/swalConfig";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import {
  validatePassword,
  VALIDATION_ERRORS,
} from "@/app/lib/utils/validations";

interface PasswordErrors {
  old_password?: string;
  new_password?: string;
  confirm_password?: string;
}

export default function AdminChangePasswordPage() {
  const { setTitle } = usePageTitle();
  const router = useRouter();
  const { user, logout: authLogout } = useAuth();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setTitle("Change Password");
  }, [setTitle]);

  const validateField = (field: string, value: string): boolean => {
    let error: string | undefined = undefined;

    if (field === "old_password") {
      if (!value) {
        error = "Current password is required";
      }
    } else if (field === "new_password") {
      if (!value) {
        error = "New password is required";
      } else if (oldPassword && value === oldPassword) {
        error = "New password must be different from current password";
      } else if (!validatePassword(value)) {
        error = VALIDATION_ERRORS.PASSWORD;
      }
    } else if (field === "confirm_password") {
      if (!value) {
        error = "Please confirm your new password";
      } else if (value !== newPassword) {
        error = "Passwords do not match";
      }
    }

    // Update just this field's error
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));

    return !error;
  };

  const validateForm = (): boolean => {
    const isOldPasswordValid = validateField("old_password", oldPassword);
    const isNewPasswordValid = validateField("new_password", newPassword);
    const isConfirmPasswordValid = validateField(
      "confirm_password",
      confirmPassword
    );

    const isValid =
      isOldPasswordValid && isNewPasswordValid && isConfirmPasswordValid;

    if (!isValid) {
      // Show the first error
      const firstError =
        errors.old_password || errors.new_password || errors.confirm_password;
      if (firstError) {
        showErrorMessage(firstError);
      }
    }

    return isValid;
  };

  const handleOldPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOldPassword(value);
    validateField("old_password", value);
    // Re-validate new password if it's already filled (to check if they're the same)
    if (newPassword) {
      validateField("new_password", newPassword);
    }
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    validateField("new_password", value);
    // Re-validate confirm password if it's already filled
    if (confirmPassword) {
      validateField("confirm_password", confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);
    validateField("confirm_password", value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      await showErrorMessage(
        "Admin information not found. Please login again."
      );
      router.push("/login");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const passwordData = {
        old_password: oldPassword.trim(),
        new_password: newPassword.trim(),
      };

      const { success } = await changeAdminPassword(user.id, passwordData);

      if (success) {
        // Logout and redirect to login page
        logout();
        authLogout();
        router.push("/login");
      }
    } catch (error) {
      console.error("Change password error:", error);
      await showErrorMessage(
        "An unexpected error occurred while changing password."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/dashboard");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-line p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Change Password
          </h2>
          <p className="text-sm text-gray-600">
            Update your password to keep your account secure.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label
              htmlFor="old_password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="old_password"
                name="old_password"
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={handleOldPasswordChange}
                className={`w-full px-3 py-2 pr-10 border ${
                  errors.old_password ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary`}
                placeholder="Enter your current password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                {showOldPassword ? (
                  <i className="fas fa-eye-slash w-4 h-4 text-gray-400"></i>
                ) : (
                  <i className="fas fa-eye w-4 h-4 text-gray-400"></i>
                )}
              </button>
            </div>
            {errors.old_password && (
              <p className="mt-1 text-xs text-red-600">{errors.old_password}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="new_password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="new_password"
                name="new_password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={handleNewPasswordChange}
                className={`w-full px-3 py-2 pr-10 border ${
                  errors.new_password ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary`}
                placeholder="Enter your new password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <i className="fas fa-eye-slash w-4 h-4 text-gray-400"></i>
                ) : (
                  <i className="fas fa-eye w-4 h-4 text-gray-400"></i>
                )}
              </button>
            </div>
            {errors.new_password && (
              <p className="mt-1 text-xs text-red-600">{errors.new_password}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Password must be at least 8 characters with uppercase, lowercase,
              and numbers.
            </p>
          </div>

          <div>
            <label
              htmlFor="confirm_password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="confirm_password"
                name="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={`w-full px-3 py-2 pr-10 border ${
                  errors.confirm_password ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary`}
                placeholder="Confirm your new password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <i className="fas fa-eye-slash w-4 h-4 text-gray-400"></i>
                ) : (
                  <i className="fas fa-eye w-4 h-4 text-gray-400"></i>
                )}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.confirm_password}
              </p>
            )}
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Changing Password..." : "Change Password"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
