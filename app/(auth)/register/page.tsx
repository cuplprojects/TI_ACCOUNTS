"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  registerSeller,
  sellerLogin,
} from "@/app/lib/services/seller/authService";
import { showErrorMessage } from "@/app/lib/swalConfig";
import Swal from "sweetalert2";
import Link from "next/link";
import CountryCodeSelector from "@/app/components/common/CountryCodeSelector";
import {
  validateEmail,
  validateGST,
  validatePhone,
  validatePassword,
  VALIDATION_ERRORS,
} from "@/app/lib/utils/validations";
import { getCurrentUser } from "@/app/lib/utils";

interface SellerRegistrationData {
  firm_name: string;
  country_code: string;
  phone: number | null;
  email: string;
  entity_type: "sole proprietor" | "partnership" | "llp" | "pvt ltd.";
  is_gst_registered: boolean;
  gstin?: string;
  password: string;
  confirm_password?: string;
  is_marketing_emails: boolean;
  is_marketing_sms: boolean;
}

// Form validation errors interface
interface FormErrors {
  firm_name?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  password?: string;
  confirm_password?: string;
}

export default function RegistrationPage() {
  const router = useRouter();
  // Use dashboard auth context to set logged-in user and route
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { login } = require("@/app/providers/AuthProvider").useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SellerRegistrationData>({
    firm_name: "",
    country_code: "+91",
    phone: null,
    email: "",
    entity_type: "sole proprietor",
    is_gst_registered: false,
    gstin: "",
    password: "",
    confirm_password: "",
    is_marketing_emails: false,
    is_marketing_sms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Check if user is already authenticated and redirect to dashboard
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      const dashboardPath = currentUser.role === "admin" ? "/admin/dashboard" : "/seller/dashboard";
      router.replace(dashboardPath);
    }
  }, [router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked,
      });

      // Validate GST when toggling GST registration checkbox
      if (name === "is_gst_registered") {
        if (!checked) {
          // Clear GSTIN error if unchecked
          setErrors({
            ...errors,
            gstin: undefined,
          });
        } else if (checked && formData.gstin) {
          // Validate existing GSTIN if checkbox is checked
          validateField("gstin", formData.gstin);
        }
      }
    } else {
      // Convert GSTIN to uppercase automatically
      const finalValue = name === "gstin" ? value.toUpperCase() : value;

      setFormData({
        ...formData,
        [name]: finalValue,
      });

      // Validate the field in real-time
      validateField(name, finalValue);
    }
  };

  // Add this new function to validate individual fields
  const validateField = (name: string, value: string) => {
    let error: string | undefined = undefined;

    switch (name) {
      case "firm_name":
        if (!value) {
          error = "Business name is required";
        }
        break;

      case "email":
        if (!value) {
          error = "Email is required";
        } else if (!validateEmail(value)) {
          error = VALIDATION_ERRORS.EMAIL;
        }
        break;

      case "phone":
        if (!value) {
          error = "Phone number is required";
        } else if (!validatePhone(value.toString())) {
          error = VALIDATION_ERRORS.PHONE;
        }
        break;

      case "password":
        if (!value) {
          error = "Password is required";
        } else if (!validatePassword(value)) {
          error = VALIDATION_ERRORS.PASSWORD;
        }

        // Also validate confirm_password match if it exists
        if (formData.confirm_password && value !== formData.confirm_password) {
          setErrors((prev) => ({
            ...prev,
            confirm_password: "Passwords do not match",
          }));
        } else if (formData.confirm_password) {
          setErrors((prev) => ({
            ...prev,
            confirm_password: undefined,
          }));
        }
        break;

      case "confirm_password":
        if (formData.password !== value) {
          error = "Passwords do not match";
        }
        break;

      case "gstin":
        if (formData.is_gst_registered) {
          if (!value) {
            error = "GSTIN is required if GST registered";
          } else if (!validateGST(value)) {
            error = VALIDATION_ERRORS.GST;
          }
        }
        break;
    }

    // Update only this field's error
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    return !error; // Return true if valid
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCountryCodeChange = (dialCode: string, countryCode: string) => {
    // We only need dialCode for the API, but countryCode is provided by the component
    setFormData({
      ...formData,
      country_code: dialCode,
    });
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate all fields
    if (!validateField("firm_name", formData.firm_name)) {
      isValid = false;
      newErrors.firm_name = errors.firm_name;
    }

    if (!validateField("phone", formData.phone?.toString() || "")) {
      isValid = false;
      newErrors.phone = errors.phone;
    }

    if (!validateField("email", formData.email)) {
      isValid = false;
      newErrors.email = errors.email;
    }

    if (!validateField("password", formData.password)) {
      isValid = false;
      newErrors.password = errors.password;
    }

    if (!validateField("confirm_password", formData.confirm_password || "")) {
      isValid = false;
      newErrors.confirm_password = errors.confirm_password;
    }

    if (
      formData.is_gst_registered &&
      !validateField("gstin", formData.gstin || "")
    ) {
      isValid = false;
      newErrors.gstin = errors.gstin;
    }

    // Update errors state with all validation results
    setErrors(newErrors);

    if (!isValid) {
      // Show the first error
      const firstError = Object.values(newErrors).find((error) => error);
      if (firstError) {
        showErrorMessage(firstError);
      }
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Create a new object without confirm_password for API
      const registrationData = {
        firm_name: formData.firm_name,
        country_code: formData.country_code,
        phone: formData.phone?.toString() || "",
        email: formData.email,
        entity_type: formData.entity_type,
        is_gst_registered: formData.is_gst_registered,
        gstin: formData.gstin,
        password: formData.password,
        is_marketing_emails: formData.is_marketing_emails,
        is_marketing_sms: formData.is_marketing_sms,
      };

      const { success, message } = await registerSeller(registrationData);

      if (success) {
        // Attempt auto-login for seller
        const loginResp = await sellerLogin({
          email: formData.email,
          password: formData.password,
        });

        if (loginResp.success) {
          // Set admin app auth context to seller and redirect to seller dashboard
          try {
            login("seller");
          } catch {
            // Fallback redirect if context not available
            router.replace("/seller");
            return;
          }

          Swal.fire({
            icon: "success",
            title: "Welcome!",
            text: "Your seller account was created and you are now logged in.",
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          // Fallback to manual login flow
          Swal.fire({
            icon: "success",
            title: "Registration Successful",
            text: message,
            showConfirmButton: true,
          }).then(() => {
            router.push("/login");
          });
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      await showErrorMessage(
        "An unexpected error occurred during registration."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Seller Registration
        </h1>
        <p className="mt-2 text-gray-600">
          Create your seller account to start selling on TotallyIndian
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Details */}
        <div className="">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firm_name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Business Name<span className="text-red-500">*</span>
              </label>
              <input
                id="firm_name"
                name="firm_name"
                type="text"
                value={formData.firm_name}
                onChange={handleInputChange}
                className={`custom-border-3 w-full focus:outline-none ${
                  errors.firm_name ? "border-red-500" : ""
                }`}
                required
              />
              {errors.firm_name && (
                <p className="mt-1 text-xs text-red-600">{errors.firm_name}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="entity_type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Business Type<span className="text-red-500">*</span>
              </label>
              <select
                id="entity_type"
                name="entity_type"
                value={formData.entity_type}
                onChange={handleInputChange}
                className="custom-border-3 w-full focus:outline-none"
                required
              >
                <option value="sole proprietor">Sole Proprietor</option>
                <option value="partnership">Partnership</option>
                <option value="llp">LLP</option>
                <option value="pvt ltd.">Private Limited</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address<span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`custom-border-3 w-full focus:outline-none ${
                  errors.email ? "border-red-500" : ""
                }`}
                required
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <div className="w-1/3">
                <label
                  htmlFor="country_code"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Code<span className="text-red-500">*</span>
                </label>
                <CountryCodeSelector
                  value={formData.country_code}
                  onChange={handleCountryCodeChange}
                  defaultCountry="IN"
                />
              </div>
              <div className="w-2/3">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number<span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="number"
                  value={formData.phone?.toString() || ""}
                  onChange={handleInputChange}
                  className={`custom-border-3 w-full focus:outline-none ${
                    errors.phone ? "border-red-500" : ""
                  }`}
                  required
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* GST Information */}
        <div className="">
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="is_gst_registered"
                name="is_gst_registered"
                type="checkbox"
                checked={formData.is_gst_registered}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary focus:ring-primary"
              />
              <label
                htmlFor="is_gst_registered"
                className="ml-2 block text-sm font-medium text-gray-700"
              >
                My business is GST registered
              </label>
            </div>
            {formData.is_gst_registered && (
              <div>
                <label
                  htmlFor="gstin"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  GSTIN<span className="text-red-500">*</span>
                </label>
                <input
                  id="gstin"
                  name="gstin"
                  type="text"
                  value={formData.gstin}
                  onChange={handleInputChange}
                  className={`custom-border-3 w-full focus:outline-none ${
                    errors.gstin ? "border-red-500" : ""
                  }`}
                  required={formData.is_gst_registered}
                  style={{ textTransform: "uppercase" }}
                />
                {errors.gstin && (
                  <p className="mt-1 text-xs text-red-600">{errors.gstin}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Password */}
        <div className="">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password<span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`custom-border-3 w-full focus:outline-none ${
                  errors.password ? "border-red-500" : ""
                }`}
                required
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirm_password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password<span className="text-red-500">*</span>
              </label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                value={formData.confirm_password}
                onChange={handleInputChange}
                className={`custom-border-3 w-full focus:outline-none ${
                  errors.confirm_password ? "border-red-500" : ""
                }`}
                required
              />
              {errors.confirm_password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.confirm_password}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Marketing Preferences */}
        <div className="">
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                id="is_marketing_emails"
                name="is_marketing_emails"
                type="checkbox"
                checked={formData.is_marketing_emails}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary focus:ring-primary"
              />
              <label
                htmlFor="is_marketing_emails"
                className="ml-2 block text-sm font-medium text-gray-700"
              >
                I want to receive marketing emails
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="is_marketing_sms"
                name="is_marketing_sms"
                type="checkbox"
                checked={formData.is_marketing_sms}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary focus:ring-primary"
              />
              <label
                htmlFor="is_marketing_sms"
                className="ml-2 block text-sm font-medium text-gray-700"
              >
                I want to receive SMS updates
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Registering..." : "Register as Seller"}
          </button>
          <div className="text-center">
            <p className="text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
