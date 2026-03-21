"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  changePassword,
  getCurrentSeller,
  checkFirstLoginStatus,
} from "@/app/lib/services/seller/authService";
import { showErrorMessage } from "@/app/lib/swalConfig";
import {
  validatePassword,
  VALIDATION_ERRORS,
} from "@/app/lib/utils/validations";
import DebugInfo from "@/app/components/common/DebugInfo";
import Image from "next/image";

interface PasswordErrors {
  old_password?: string;
  new_password?: string;
  confirm_password?: string;
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [sellerId, setSellerId] = useState<string>("");

  useEffect(() => {
    console.log("ChangePasswordPage useEffect triggered");

    // Check if user is authenticated and get seller info
    const seller = getCurrentSeller();
    console.log("Current seller:", seller);

    if (!seller) {
      console.log("No seller found, redirecting to login");
      router.push("/login");
      return;
    }

    setSellerId(seller.id);

    // Check if this is a first-time login
    const firstLogin = checkFirstLoginStatus();
    console.log("First login status:", firstLogin);
    setIsFirstLogin(firstLogin);

    // Only redirect if it's NOT a first login (regular users shouldn't be here)
    // First-time users should stay on this page
    if (!firstLogin) {
      console.log("Not a first login, redirecting to dashboard");
      // This is a regular user trying to access first-time change password
      // Redirect them to dashboard where they can access regular change password
      router.push("/seller/dashboard");
      return;
    }

    console.log("First login confirmed, staying on change password page");
  }, [router]);

  const validateField = (field: string, value: string): boolean => {
    let error: string | undefined = undefined;

    if (field === "old_password") {
      if (!value) {
        error = "Current password is required";
      }
    } else if (field === "new_password") {
      if (!value) {
        error = "New password is required";
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

    if (!validateForm()) {
      return;
    }

    if (!sellerId) {
      showErrorMessage("Seller information not found. Please login again.");
      router.push("/login");
      return;
    }

    setIsLoading(true);

    try {
      const passwordData = {
        old_password: oldPassword.trim(),
        new_password: newPassword.trim(),
      };

      const { success, logout } = await changePassword(sellerId, passwordData);

      if (success) {
        if (logout) {
          // First-time password change - user will be logged out
          router.push("/login");
        } else {
          // Regular password change - redirect to dashboard
          router.push("/seller/dashboard");
        }
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
    if (isFirstLogin) {
      // For first-time login, they must change password
      showErrorMessage(
        "You must change your password to continue using the platform."
      );
    } else {
      // Regular users can go back to dashboard
      router.push("/seller/dashboard");
    }
  };

  return (
    <div className=" flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center flex flex-col items-center justify-center">
          <Image
            src="/images/common/logo.png"
            alt="TotallyIndian"
            width={100}
            height={100}
          />
          <h1 className="title-2-semibold text-gray-800 mt-2">Change Password</h1>
        </div>

        <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="old_password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {isFirstLogin ? "Temporary Password" : "Current Password"} <span className="text-red-500">*</span>
              </label>
              <input
                id="old_password"
                name="old_password"
                type="password"
                value={oldPassword}
                onChange={handleOldPasswordChange}
                className={`w-full px-3 py-2 border ${
                  errors.old_password ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary`}
                placeholder={
                  isFirstLogin
                    ? "Enter the temporary password from your email"
                    : "Enter your current password"
                }
                required
              />
              {errors.old_password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.old_password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="new_password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Password <span className="text-red-500">*</span>
              </label>
              <input
                id="new_password"
                name="new_password"
                type="password"
                value={newPassword}
                onChange={handleNewPasswordChange}
                className={`w-full px-3 py-2 border ${
                  errors.new_password ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary`}
                placeholder="Enter your new password"
                required
              />
              {errors.new_password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.new_password}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters with uppercase,
                lowercase, and numbers.
              </p>
            </div>

            <div>
              <label
                htmlFor="confirm_password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={`w-full px-3 py-2 border ${
                  errors.confirm_password ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary`}
                placeholder="Confirm your new password"
                required
              />
              {errors.confirm_password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.confirm_password}
                </p>
              )}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Setting Password..."
                : isFirstLogin
                ? "Set Password"
                : "Change Password"}
            </button>

            {!isFirstLogin && (
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-3 px-4 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
