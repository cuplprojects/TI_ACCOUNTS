"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/services/auth";
import { showErrorMessage } from "@/lib/config/swal";
import Swal from "sweetalert2";
import { validateEmail, VALIDATION_ERRORS } from "@/lib/utils/validation";
import { getCurrentUser } from "@/lib/utils";
import Image from "next/image";

interface LoginErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  // Check if user is already authenticated and redirect to dashboard
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      router.replace("/pages/dashboard");
    }
  }, [router]);

  const validateField = (field: string, value: string): boolean => {
    let error: string | undefined = undefined;

    if (field === "email") {
      if (!value) {
        error = "Email is required";
      } else if (!validateEmail(value)) {
        error = VALIDATION_ERRORS.EMAIL;
      }
    } else if (field === "password") {
      if (!value) {
        error = "Password is required";
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
    const isEmailValid = validateField("email", email);
    const isPasswordValid = validateField("password", password);
    const isValid = isEmailValid && isPasswordValid;

    if (!isValid) {
      // Show the first error
      const firstError = errors.email || errors.password;
      if (firstError) {
        showErrorMessage(firstError);
      }
    }

    return isValid;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateField("email", value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    validateField("password", value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const credentials = {
        email: email.trim(),
        password: password.trim(),
      };

      console.log(`Submitting admin login with:`, credentials);

      const { success, message } = await login(credentials);

      if (success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: message,
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          router.push("/pages/dashboard");
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      await showErrorMessage("An unexpected error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-white max-w-[400px]">
      <div className="text-center flex flex-col items-center justify-center">
        <div className="relative w-48 h-16 mb-2">
          <Image
            src="/images/common/logo.png"
            alt="TotallyIndian"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ... (form content) */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            className={`w-full px-3 py-2 border ${errors.email ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary`}
            placeholder="admin@example.com"
            required
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password <span className="text-red-500">*</span>
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            className={`w-full px-3 py-2 border ${errors.password ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary`}
            placeholder="••••••••"
            required
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="text-center text-sm text-gray-500">
        <p>Enter your credentials to access the Admin dashboard.</p>
      </div>
    </div>
  );
}
