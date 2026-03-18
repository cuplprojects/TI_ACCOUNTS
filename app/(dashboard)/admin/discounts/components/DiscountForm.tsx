"use client";

import React, { useState, useEffect } from "react";
import { Discount, generateRandomDiscountCode } from "@/app/lib/services/admin/discountService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

interface DiscountFormProps {
  initialData?: Discount;
  onSubmit: (data: Partial<Discount>) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
  isView?: boolean;
}

export default function DiscountForm({
  initialData,
  onSubmit,
  isLoading = false,
  isEdit = false,
  isView = false,
}: DiscountFormProps) {
  const [formData, setFormData] = useState<Partial<Discount>>(
    initialData || {
      method: "Discount Code",
      discount_type: "percent",
      minimum_type: "NA",
      eligibility: "all customers",
      uses: "one use per customer",
      applicability_type: "all products",
      start_date: new Date().toISOString().slice(0, 10),
      start_time: "00:00",
      set_end: false,
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof Discount, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Method */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Method
        </label>
        <div className="inline-flex rounded-md overflow-hidden border border-gray-300">
          <button
            type="button"
            onClick={() => handleChange("method", "Discount Code")}
            disabled={isView}
            className={`px-4 py-2 text-sm font-semibold ${
              formData.method === "Discount Code"
                ? "bg-primary text-white"
                : "bg-white text-gray-700"
            } ${isView ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Discount Code
          </button>
          <button
            type="button"
            onClick={() => handleChange("method", "Automatic Discount")}
            disabled={isView}
            className={`px-4 py-2 text-sm font-semibold ${
              formData.method === "Automatic Discount"
                ? "bg-primary text-white"
                : "bg-white text-gray-700"
            } ${isView ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Automatic Discount
          </button>
        </div>
      </div>

      {/* Discount Code */}
      {formData.method === "Discount Code" && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-semibold text-gray-900">
              Discount Code
            </label>
            {!isView && (
              <button
                type="button"
                onClick={() =>
                  handleChange("discount_code", generateRandomDiscountCode())
                }
                className="text-primary text-sm font-semibold hover:underline"
              >
                Generate random code
              </button>
            )}
          </div>
          <input
            type="text"
            value={formData.discount_code || ""}
            onChange={(e) => !isView && handleChange("discount_code", e.target.value)}
            placeholder="e.g. SUMMER2024"
            disabled={isView}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${
              isView ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
            }`}
          />
        </div>
      )}

      {/* Discount Type & Value */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Discount Type
          </label>
          <div className="relative">
            <select
              value={formData.discount_type || "percent"}
              onChange={(e) => !isView && handleChange("discount_type", e.target.value)}
              disabled={isView}
              className={`appearance-none w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary pr-10 ${
                isView ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
              }`}
            >
              <option value="percent">Percentage (%)</option>
              <option value="flat">Fixed Amount (₹)</option>
            </select>
            <FontAwesomeIcon
              icon={faChevronDown}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 pointer-events-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Value
          </label>
          <input
            type="number"
            value={formData.discount_value || ""}
            onChange={(e) =>
              !isView && handleChange("discount_value", parseFloat(e.target.value))
            }
            placeholder="Enter value"
            disabled={isView}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${
              isView ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
            }`}
          />
        </div>
      </div>

      {/* Minimum Purchase */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Minimum Purchase Requirement
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              checked={formData.minimum_type === "NA"}
              onChange={() => !isView && handleChange("minimum_type", "NA")}
              disabled={isView}
              className="h-4 w-4 text-primary"
            />
            <span className="ml-2 text-sm text-gray-700">No minimum</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={formData.minimum_type === "amount"}
              onChange={() => !isView && handleChange("minimum_type", "amount")}
              disabled={isView}
              className="h-4 w-4 text-primary"
            />
            <span className="ml-2 text-sm text-gray-700">Minimum amount</span>
            {formData.minimum_type === "amount" && (
              <input
                type="number"
                value={formData.minimum_value || ""}
                onChange={(e) =>
                  !isView && handleChange("minimum_value", parseFloat(e.target.value))
                }
                disabled={isView}
                placeholder="₹"
                className={`ml-2 w-24 px-2 py-1 border border-gray-300 rounded text-sm ${
                  isView ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
                }`}
              />
            )}
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={formData.minimum_type === "quantity"}
              onChange={() => !isView && handleChange("minimum_type", "quantity")}
              disabled={isView}
              className="h-4 w-4 text-primary"
            />
            <span className="ml-2 text-sm text-gray-700">Minimum quantity</span>
            {formData.minimum_type === "quantity" && (
              <input
                type="number"
                value={formData.minimum_value || ""}
                onChange={(e) =>
                  !isView && handleChange("minimum_value", parseInt(e.target.value))
                }
                disabled={isView}
                placeholder="Items"
                className={`ml-2 w-24 px-2 py-1 border border-gray-300 rounded text-sm ${
                  isView ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
                }`}
              />
            )}
          </label>
        </div>
      </div>

      {/* Eligibility */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Eligibility
        </label>
        <div className="relative">
          <select
            value={formData.eligibility || "all customers"}
            onChange={(e) => !isView && handleChange("eligibility", e.target.value)}
            disabled={isView}
            className={`appearance-none w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary pr-10 ${
              isView ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
            }`}
          >
            <option value="all customers">All customers</option>
            <option value="specific segment">Specific segment</option>
            <option value="specific customer">Specific customer</option>
          </select>
          <FontAwesomeIcon
            icon={faChevronDown}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 pointer-events-none"
          />
        </div>
      </div>

      {/* Usage Limits */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Usage Limits
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              checked={formData.uses === "one use per customer"}
              onChange={() => !isView && handleChange("uses", "one use per customer")}
              disabled={isView}
              className="h-4 w-4 text-primary"
            />
            <span className="ml-2 text-sm text-gray-700">
              One use per customer
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={formData.uses === "no of times"}
              onChange={() => !isView && handleChange("uses", "no of times")}
              disabled={isView}
              className="h-4 w-4 text-primary"
            />
            <span className="ml-2 text-sm text-gray-700">Limited uses</span>
            {formData.uses === "no of times" && (
              <input
                type="number"
                value={formData.max_uses || ""}
                onChange={(e) =>
                  !isView && handleChange("max_uses", parseInt(e.target.value))
                }
                disabled={isView}
                placeholder="Max uses"
                className={`ml-2 w-24 px-2 py-1 border border-gray-300 rounded text-sm ${
                  isView ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
                }`}
              />
            )}
          </label>
        </div>
      </div>

      {/* Applicability */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Applies To
        </label>
        <div className="relative">
          <select
            value={formData.applicability_type || "all products"}
            onChange={(e) =>
              !isView && handleChange("applicability_type", e.target.value)
            }
            disabled={isView}
            className={`appearance-none w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary pr-10 ${
              isView ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
            }`}
          >
            <option value="all products">All products</option>
            <option value="specific products">Specific products</option>
            <option value="specific categories">Specific categories</option>
            <option value="buy x get y">Buy X Get Y</option>
          </select>
          <FontAwesomeIcon
            icon={faChevronDown}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 pointer-events-none"
          />
        </div>
      </div>

      {/* Schedule */}
      <div className="border-t pt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Schedule</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={formData.start_date || ""}
              onChange={(e) => !isView && handleChange("start_date", e.target.value)}
              disabled={isView}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${
                isView ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="time"
              value={formData.start_time || ""}
              onChange={(e) => !isView && handleChange("start_time", e.target.value)}
              disabled={isView}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${
                isView ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
              }`}
            />
          </div>
        </div>

        <label className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={formData.set_end || false}
            onChange={(e) => !isView && handleChange("set_end", e.target.checked)}
            disabled={isView}
            className="h-4 w-4 text-primary rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Set end date</span>
        </label>

        {formData.set_end && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.end_date || ""}
                onChange={(e) => !isView && handleChange("end_date", e.target.value)}
                disabled={isView}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${
                  isView ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={formData.end_time || ""}
                onChange={(e) => !isView && handleChange("end_time", e.target.value)}
                disabled={isView}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${
                  isView ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
                }`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        {isView ? (
          <>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-semibold hover:bg-gray-200"
            >
              Back
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-semibold hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary text-white rounded-md font-semibold hover:bg-primary-dark disabled:opacity-50"
            >
              {isLoading
                ? "Saving..."
                : isEdit
                ? "Update Discount"
                : "Create Discount"}
            </button>
          </>
        )}
      </div>
    </form>
  );
}
