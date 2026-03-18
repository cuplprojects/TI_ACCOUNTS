"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  forgotPassword,
  resetPassword,
} from "@/app/lib/services/seller/authService";
import { validateEmail, VALIDATION_ERRORS } from "@/app/lib/utils/validations";

export default function SellerForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateField = (field: string, value: string): boolean => {
    let error: string | undefined = undefined;

    switch (field) {
      case "email":
        if (!value) {
          error = "Email is required";
        } else if (!validateEmail(value)) {
          error = VALIDATION_ERRORS.EMAIL;
        }
        break;
      case "resetToken":
        if (!value) {
          error = "Reset token is required";
        } else if (value.length !== 8) {
          error = "Reset token must be exactly 8 characters";
        }
        break;
      case "newPassword":
        if (!value) {
          error = "New password is required";
        } else if (value.length < 6) {
          error = "Password must be at least 6 characters long";
        }
        break;
      case "confirmPassword":
        if (!value) {
          error = "Please confirm your password";
        } else if (value !== newPassword) {
          error = "Passwords do not match";
        }
        break;
    }

    setErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });

    return !error;
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateField("email", email)) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await forgotPassword(email);

      if (result.success) {
        Swal.fire({
          title: "Reset Token Sent",
          text: "Please check your email for an 8-digit reset token",
          icon: "success",
          confirmButtonColor: "#00478f",
        }).then(() => {
          setStep("reset");
        });
      } else {
        Swal.fire({
          title: "Error",
          text: result.message,
          icon: "error",
          confirmButtonColor: "#00478f",
        });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      Swal.fire({
        title: "Error",
        text: "An unexpected error occurred. Please try again.",
        icon: "error",
        confirmButtonColor: "#00478f",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const isTokenValid = validateField("resetToken", resetToken);
    const isPasswordValid = validateField("newPassword", newPassword);
    const isConfirmValid = validateField("confirmPassword", confirmPassword);

    if (!isTokenValid || !isPasswordValid || !isConfirmValid) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(resetToken, newPassword);

      if (result.success) {
        Swal.fire({
          title: "Password Reset Successful",
          text: "Your password has been reset successfully. Please login with your new password.",
          icon: "success",
          confirmButtonColor: "#00478f",
        }).then(() => {
          router.push("/login");
        });
      } else {
        Swal.fire({
          title: "Error",
          text: result.message,
          icon: "error",
          confirmButtonColor: "#00478f",
        });
      }
    } catch (error) {
      console.error("Reset password error:", error);
      Swal.fire({
        title: "Error",
        text: "An unexpected error occurred. Please try again.",
        icon: "error",
        confirmButtonColor: "#00478f",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-white max-w-[400px]">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">TotallyIndian</h1>
        <p className="mt-2 text-gray-600">
          {step === "email" ? "Seller - Forgot Password" : "Reset Password"}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {step === "email"
            ? "Enter your seller email address and we'll send you a reset token."
            : "Enter the 8-digit reset token from your email and your new password."}
        </p>
      </div>

      {step === "email" ? (
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Seller Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                validateField("email", e.target.value);
              }}
              className={`w-full px-3 py-2 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary`}
              placeholder="Enter your seller email address"
              required
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending..." : "Send Reset Token"}
          </button>

          <div className="text-center text-sm">
            <Link href="/login" className="text-primary hover:underline">
              Back to Login
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label
              htmlFor="resetToken"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Reset Token <span className="text-red-500">*</span>
            </label>
            <input
              id="resetToken"
              type="text"
              value={resetToken}
              onChange={(e) => {
                const value = e.target.value;
                setResetToken(value);
                validateField("resetToken", value);
              }}
              className={`w-full px-3 py-2 border ${
                errors.resetToken ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary font-mono text-center text-lg tracking-widest`}
              placeholder="A3B7K9MX"
              maxLength={8}
              required
            />
            {errors.resetToken && (
              <p className="mt-1 text-xs text-red-600">{errors.resetToken}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Enter the 8-digit code from your email (case sensitive)
            </p>
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  validateField("newPassword", e.target.value);
                }}
                className={`w-full px-3 py-2 pr-10 border ${
                  errors.newPassword ? "border-red-500" : "border-gray-300"
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
            {errors.newPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.newPassword}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  validateField("confirmPassword", e.target.value);
                }}
                className={`w-full px-3 py-2 pr-10 border ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
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
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>

          <div className="text-center text-sm space-y-2">
            <button
              type="button"
              onClick={() => setStep("email")}
              className="text-primary hover:underline block mx-auto"
            >
              Send Another Reset Token
            </button>
            <Link href="/login" className="text-primary hover:underline block">
              Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
