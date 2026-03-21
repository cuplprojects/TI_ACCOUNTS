"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { BankDetails } from "@/app/lib/services/admin/sellerService";

interface BankDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankDetails: BankDetails | null;
  onSave: (data: BankDetails) => void;
  isLoading?: boolean;
}

export default function BankDetailsModal({
  isOpen,
  onClose,
  bankDetails,
  onSave,
  isLoading = false,
}: BankDetailsModalProps) {
  const [formData, setFormData] = useState<BankDetails>({
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    branch_name: "",
    upi_id: "",
    account_holder_name: "",
    is_primary: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (bankDetails) {
      setFormData(bankDetails);
    } else {
      setFormData({
        bank_name: "",
        account_number: "",
        ifsc_code: "",
        branch_name: "",
        upi_id: "",
        account_holder_name: "",
        is_primary: false,
      });
    }
    setErrors({});
  }, [bankDetails, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bank_name.trim()) {
      newErrors.bank_name = "Bank name is required";
    }

    if (!formData.account_number.trim()) {
      newErrors.account_number = "Account number is required";
    }

    if (!formData.ifsc_code.trim()) {
      newErrors.ifsc_code = "IFSC code is required";
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc_code)) {
      newErrors.ifsc_code = "Invalid IFSC code format";
    }

    if (!formData.account_holder_name.trim()) {
      newErrors.account_holder_name = "Account holder name is required";
    }

    if (formData.upi_id && !/^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/.test(formData.upi_id)) {
      newErrors.upi_id = "Invalid UPI ID format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    // Call onSave - it will handle the API call and state update
    onSave(formData);
    // Close modal immediately
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking on the backdrop, not the modal content
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-black title-3-semibold">
            {bankDetails?.id ? "Edit Bank Details" : "Add Bank Details"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-10 hover:text-black"
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Bank Name */}
          <div>
            <label className="block text-gray-10 small-semibold mb-1">
              Bank Name *
            </label>
            <input
              type="text"
              value={formData.bank_name}
              onChange={(e) =>
                setFormData({ ...formData, bank_name: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.bank_name ? "border-red-500" : "custom-border-3"
              }`}
              placeholder="e.g., Indusind Bank"
              disabled={isLoading}
            />
            {errors.bank_name && (
              <p className="text-red-500 xsmall mt-1">{errors.bank_name}</p>
            )}
          </div>

          {/* Account Holder Name */}
          <div>
            <label className="block text-gray-10 small-semibold mb-1">
              Account Holder Name *
            </label>
            <input
              type="text"
              value={formData.account_holder_name}
              onChange={(e) =>
                setFormData({ ...formData, account_holder_name: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.account_holder_name ? "border-red-500" : "custom-border-3"
              }`}
              placeholder="Account holder name"
              disabled={isLoading}
            />
            {errors.account_holder_name && (
              <p className="text-red-500 xsmall mt-1">{errors.account_holder_name}</p>
            )}
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-gray-10 small-semibold mb-1">
              Account Number *
            </label>
            <input
              type="text"
              value={formData.account_number}
              onChange={(e) =>
                setFormData({ ...formData, account_number: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.account_number ? "border-red-500" : "custom-border-3"
              }`}
              placeholder="e.g., 25120404202"
              disabled={isLoading}
            />
            {errors.account_number && (
              <p className="text-red-500 xsmall mt-1">{errors.account_number}</p>
            )}
          </div>

          {/* IFSC Code */}
          <div>
            <label className="block text-gray-10 small-semibold mb-1">
              IFSC Code *
            </label>
            <input
              type="text"
              value={formData.ifsc_code}
              onChange={(e) =>
                setFormData({ ...formData, ifsc_code: e.target.value.toUpperCase() })
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.ifsc_code ? "border-red-500" : "custom-border-3"
              }`}
              placeholder="e.g., INDB0001756"
              disabled={isLoading}
            />
            {errors.ifsc_code && (
              <p className="text-red-500 xsmall mt-1">{errors.ifsc_code}</p>
            )}
          </div>

          {/* Branch Name */}
          <div>
            <label className="block text-gray-10 small-semibold mb-1">
              Branch Name
            </label>
            <input
              type="text"
              value={formData.branch_name || ""}
              onChange={(e) =>
                setFormData({ ...formData, branch_name: e.target.value })
              }
              className="w-full px-3 py-2 border custom-border-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Bangalore"
              disabled={isLoading}
            />
          </div>

          {/* UPI ID */}
          <div>
            <label className="block text-gray-10 small-semibold mb-1">
              UPI ID
            </label>
            <input
              type="text"
              value={formData.upi_id || ""}
              onChange={(e) =>
                setFormData({ ...formData, upi_id: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.upi_id ? "border-red-500" : "custom-border-3"
              }`}
              placeholder="e.g., user@upi"
              disabled={isLoading}
            />
            {errors.upi_id && (
              <p className="text-red-500 xsmall mt-1">{errors.upi_id}</p>
            )}
          </div>

          {/* Primary Account Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_primary"
              checked={formData.is_primary || false}
              onChange={(e) =>
                setFormData({ ...formData, is_primary: e.target.checked })
              }
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              disabled={isLoading}
            />
            <label htmlFor="is_primary" className="ml-2 block text-gray-10 small">
              Set as primary account
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border custom-border-3 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 small-semibold"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 small-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
