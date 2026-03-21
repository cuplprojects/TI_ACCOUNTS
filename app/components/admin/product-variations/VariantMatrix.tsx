"use client";

import React, { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faEdit,
  faSave,
  faTrash,
  faEye,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import ProductMultiImageUpload from "@/components/ui/ProductMultiImageUpload";
import VariantImageGallery from "@/components/ui/VariantImageGallery";
import { handleNumberInputChange, handleNumberKeyDown, formatNumberForDisplay } from "@/app/lib/utils/numberInputUtils";

export interface Variant {
  id: string;
  option_values: { [optionName: string]: string }; // Changed from options to option_values to match backend

  // Common fields that should sync with parent
  title?: string;
  description?: string;
  short_description?: string;
  page_title?: string;
  page_description?: string;
  page_url?: string;
  type?: string;
  brand?: string;
  status?: "active" | "draft" | "inactive" | "approvalpending";
  physical_product?: boolean;
  margin_contribution?: number;

  // Variant-specific fields
  image_urls?: {
    key: string;
    originalName: string;
    url?: string;
    position?: number;
  }[]; // Update to match backend format
  images?: File[]; // For new uploads
  price: number | string;
  compare_price?: number | string;
  cost_per_item?: number | string;
  is_tracking_inventory?: boolean;
  stock_qty?: number | string;
  sell_out_of_stock?: boolean;
  sku: string;
  barcode?: string;
  has_barcode?: boolean; // Add has_barcode field
  weight?: number | string;
  length?: number | string;
  breadth?: number | string;
  height?: number | string;
  region_of_origin?: string;
  hs_code?: string;
  gst_percent?: number;
  profit?: number;
  margin?: number;

  // UI-specific fields
  enabled: boolean;

  // References (will be populated from parent)
  seller_id?: string;
  tags?: string[];
  collections?: string[];
}

interface VariantMatrixProps {
  variants: Variant[];
  optionNames: string[];
  onChange: (updatedVariants: Variant[]) => void;
  disabled?: boolean;
}

// List of countries
const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "China",
  "Japan",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Brazil",
  "Mexico",
  "Russia",
  "South Africa",
  "South Korea",
  "Singapore",
  "Thailand",
  "Vietnam",
  "Indonesia",
  "Malaysia",
  "UAE",
  "Saudi Arabia",
  "Turkey",
  "Pakistan",
  "Bangladesh",
  "Sri Lanka",
  "Nepal",
  "Bhutan",
];

const VariantMatrix: React.FC<VariantMatrixProps> = ({
  variants,
  optionNames,
  onChange,
  disabled = false,
}) => {
  const [editingVariant, setEditingVariant] = useState<string | null>(null);

  // Memoize the variant tracking data to avoid dependency array issues
  const variantTrackingData = useMemo(() => {
    return variants.map((v) => ({
      id: v.id,
      price: v.price,
      cost_per_item: v.cost_per_item,
      gst_percent: v.gst_percent,
    }));
  }, [variants]);

  // Calculate profit and margin for all variants when they are loaded/changed
  useEffect(() => {
    const updatedVariants = variants.map((variant) => {
      const price = typeof variant.price === "string" ? parseFloat(variant.price) || 0 : (variant.price || 0);
      const costPerItem = typeof variant.cost_per_item === "string" ? parseFloat(variant.cost_per_item) || 0 : (variant.cost_per_item || 0);
      const profit = price - costPerItem;
      const margin = price > 0 ? (profit / price) * 100 : 0;
      // Only set default GST if it's undefined/null, allow 0%
      const gstPercent = variant.gst_percent !== undefined && variant.gst_percent !== null ? variant.gst_percent : 0;

      // Only update if profit, margin, or gst_percent are different/missing
      if (
        variant.profit !== profit ||
        variant.margin !== margin ||
        (variant.gst_percent === undefined || variant.gst_percent === null)
      ) {
        return {
          ...variant,
          profit,
          margin,
          gst_percent: gstPercent,
        };
      }
      return variant;
    });

    // Check if any variant was updated
    const hasChanges = updatedVariants.some(
      (variant, index) =>
        variant.profit !== variants[index].profit ||
        variant.margin !== variants[index].margin ||
        (variants[index].gst_percent === undefined || variants[index].gst_percent === null)
    );

    if (hasChanges) {
      onChange(updatedVariants);
    }
  }, [variantTrackingData, variants, onChange]);
  const [fullscreenIdx, setFullscreenIdx] = useState<{
    variantId: string;
    imgIdx: number;
  } | null>(null);

  const toggleVariantEnabled = (variantId: string) => {
    const updatedVariants = variants.map((v) => {
      if (v.id === variantId) {
        return {
          ...v,
          enabled: !v.enabled,
        };
      }
      return v;
    });

    onChange(updatedVariants);
  };

  const formatOptionValues = (variant: Variant) => {
    return optionNames
      .map((optionName) => variant.option_values[optionName])
      .filter(Boolean)
      .join(" • ");
  };

  const applyToAll = (field: string, value: string | number | boolean) => {
    const updatedVariants = variants.map((variant) => {
      // Handle empty string
      if (value === "") {
        return {
          ...variant,
          [field]: "",
        };
      }

      // Ensure gst_percent always has a valid value (allow 0%)
      if (field === "gst_percent") {
        const gstValue =
          typeof value === "number" ? value : parseInt(value as string);
        // If NaN, don't change it, otherwise use the value (including 0)
        if (isNaN(gstValue)) {
          return variant;
        }
        return {
          ...variant,
          [field]: gstValue,
        };
      }

      // For numeric fields, sanitize and prevent negative values
      if (
        ["price", "compare_price", "cost_per_item", "weight", "length", "breadth", "height", "stock_qty"].includes(
          field
        )
      ) {
        // Sanitize input - only allow digits and decimal point
        let stringValue = typeof value === "number" ? value.toString() : (value as string);
        let sanitized = stringValue.replace(/[^\d.]/g, "");

        // Prevent multiple decimal points
        const parts = sanitized.split(".");
        let cleanValue = sanitized;
        if (parts.length > 2) {
          cleanValue = parts[0] + "." + parts.slice(1).join("");
        }

        // Add leading zero if starts with decimal point (e.g., ".2" -> "0.2")
        if (cleanValue.startsWith(".")) {
          cleanValue = "0" + cleanValue;
        }

        if (cleanValue === "") {
          return variant;
        }

        const numValue = parseFloat(cleanValue);
        if (isNaN(numValue) || numValue < 0) {
          return variant;
        }
        return {
          ...variant,
          [field]: numValue,
        };
      }

      return {
        ...variant,
        [field]: value,
      };
    });

    onChange(updatedVariants);
  };

  const toggleVariantDetails = (variantId: string) => {
    setEditingVariant(editingVariant === variantId ? null : variantId);
  };

  const handleCheckboxChange = (
    variantId: string,
    field: string,
    checked: boolean
  ) => {
    const updatedVariants = variants.map((v) => {
      if (v.id === variantId) {
        return {
          ...v,
          [field]: checked,
        };
      }
      return v;
    });

    onChange(updatedVariants);
  };

  const updateVariantField = (
    variantId: string,
    field: string,
    value: string | number
  ) => {
    const updatedVariants = variants.map((v) => {
      if (v.id === variantId) {
        // Handle empty string for number fields
        if (value === "") {
          return {
            ...v,
            [field]: "",
          };
        }

        // Ensure gst_percent always has a valid value (never empty or undefined)
        if (field === "gst_percent") {
          const gstValue =
            typeof value === "number" ? value : parseInt(value as string);
          // If the parsed value is invalid (NaN), keep the existing value
          if (isNaN(gstValue)) {
            return {
              ...v,
              [field]: v.gst_percent !== undefined ? v.gst_percent : v.gst_percent,
            };
          }
          return {
            ...v,
            [field]: gstValue,
          };
        }

        // For numeric fields, sanitize and prevent negative values
        if (
          ["price", "compare_price", "cost_per_item", "weight", "length", "breadth", "height", "stock_qty"].includes(
            field
          )
        ) {
          // Sanitize input - only allow digits and decimal point
          let stringValue = typeof value === "string" ? value : value.toString();
          let sanitized = stringValue.replace(/[^\d.]/g, "");

          // Prevent multiple decimal points
          const parts = sanitized.split(".");
          let cleanValue = sanitized;
          if (parts.length > 2) {
            cleanValue = parts[0] + "." + parts.slice(1).join("");
          }

          // Add leading zero if starts with decimal point (e.g., ".2" -> "0.2")
          if (cleanValue.startsWith(".")) {
            cleanValue = "0" + cleanValue;
          }

          if (cleanValue === "") {
            return v;
          }

          // If it ends with a decimal point or has decimal digits (user is still typing), keep as string
          if (cleanValue.endsWith(".") || cleanValue.includes(".")) {
            return {
              ...v,
              [field]: cleanValue,
            };
          }

          const numValue = parseFloat(cleanValue);
          if (isNaN(numValue) || numValue < 0) {
            return v;
          }
          return {
            ...v,
            [field]: numValue,
          };
        }

        return {
          ...v,
          [field]: value,
        };
      }
      return v;
    });

    onChange(updatedVariants);
  };

  // Calculate profit and margin when price or cost changes
  const updatePricingValues = (
    variantId: string,
    field: string,
    value: number | string
  ) => {
    const updatedVariants = variants.map((v) => {
      if (v.id === variantId) {
        // Handle empty string
        if (value === "") {
          return {
            ...v,
            [field]: "",
          };
        }

        // Sanitize input - only allow digits and decimal point
        let stringValue = typeof value === "string" ? value : value.toString();
        let sanitized = stringValue.replace(/[^\d.]/g, "");

        // Prevent multiple decimal points
        const parts = sanitized.split(".");
        let cleanValue = sanitized;
        if (parts.length > 2) {
          cleanValue = parts[0] + "." + parts.slice(1).join("");
        }

        // Add leading zero if starts with decimal point (e.g., ".2" -> "0.2")
        if (cleanValue.startsWith(".")) {
          cleanValue = "0" + cleanValue;
        }

        if (cleanValue === "") {
          return v;
        }

        // If it ends with a decimal point or has decimal digits (user is still typing), keep as string
        if (cleanValue.endsWith(".") || cleanValue.includes(".")) {
          return {
            ...v,
            [field]: cleanValue,
          };
        }

        const numValue = parseFloat(cleanValue);

        // Only update if it's a valid number and not negative
        if (isNaN(numValue) || numValue < 0) {
          return v;
        }

        const updatedVariant = { ...v, [field]: numValue };

        // Calculate profit and margin when price or cost_per_item changes
        if (field === "price" || field === "cost_per_item") {
          const price = field === "price" ? numValue : (typeof v.price === "string" ? parseFloat(v.price) || 0 : (v.price || 0));
          const costPerItem =
            field === "cost_per_item" ? numValue : (typeof v.cost_per_item === "string" ? parseFloat(v.cost_per_item) || 0 : (v.cost_per_item || 0));
          const profit = price - costPerItem;
          const margin = price > 0 ? (profit / price) * 100 : 0;

          updatedVariant.profit = profit;
          updatedVariant.margin = margin;
        }

        return updatedVariant;
      }
      return v;
    });

    onChange(updatedVariants);
  };

  // Handle image uploads for variants
  const handleVariantImages = (variantId: string, images: File[]) => {
    const updatedVariants = variants.map((v) => {
      if (v.id === variantId) {
        // Ensure we're preserving all images, not replacing them
        // The images array passed here should already include both old and new images
        // from ProductMultiImageUpload's handleFileChange logic
        return {
          ...v,
          images: images,
        };
      }
      return v;
    });

    onChange(updatedVariants);
  };

  // Handle removal of existing images
  const handleRemoveExistingImage = (variantId: string, position: number) => {
    const updatedVariants = variants.map((v) => {
      if (v.id === variantId && v.image_urls) {
        const filtered = v.image_urls.filter((_, idx) => idx !== position);
        // Update positions after removal
        const withUpdatedPositions = filtered.map((img, idx) => ({
          ...img,
          position: idx,
        }));
        return {
          ...v,
          image_urls: withUpdatedPositions,
        };
      }
      return v;
    });

    onChange(updatedVariants);
  };

  // Handle reordering of existing images
  const handleReorderExistingImages = (variantId: string, reorderedImages: any[]) => {
    const updatedVariants = variants.map((v) => {
      if (v.id === variantId) {
        return {
          ...v,
          image_urls: reorderedImages,
        };
      }
      return v;
    });

    onChange(updatedVariants);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg">
        <thead>
          <tr className="bg-gray-line text-gray-600 text-xs">
            <th className="p-3 text-left">Enabled</th>
            <th className="p-3 text-left">Variant</th>
            <th className="p-3 text-left">Price</th>
            <th className="p-3 text-left">SKU</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((variant) => (
            <React.Fragment key={variant.id}>
              <tr
                className={`border-t ${!variant.enabled ? "opacity-50" : ""}`}
              >
                <td className="p-3">
                  <button
                    onClick={() =>
                      !disabled && toggleVariantEnabled(variant.id)
                    }
                    disabled={disabled}
                    className={`w-5 h-5 flex items-center justify-center rounded ${variant.enabled ? "bg-primary text-white" : "bg-gray-200"
                      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    {variant.enabled && (
                      <FontAwesomeIcon icon={faCheck} className="text-xs" />
                    )}
                  </button>
                </td>
                <td className="p-3 xsmall">{formatOptionValues(variant)}</td>
                <td className="p-3">
                  <span className="xsmall">₹{variant.price}</span>
                </td>
                <td className="p-3">
                  <span className="xsmall">{variant.sku || "—"}</span>
                </td>
                <td className="p-3">
                  {!disabled ? (
                    <button
                      onClick={() => toggleVariantDetails(variant.id)}
                      className="px-3 py-1 bg-primary text-white rounded-md text-xs flex items-center"
                    >
                      {editingVariant === variant.id ? (
                        <>
                          <FontAwesomeIcon icon={faSave} className="mr-1" />
                          Save
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faEdit} className="mr-1" />
                          Edit details
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleVariantDetails(variant.id)}
                      className="px-3 py-1 bg-gray-500 text-white rounded-md text-xs flex items-center"
                    >
                      <FontAwesomeIcon icon={faEye} className="mr-1" />
                      View details
                    </button>
                  )}
                </td>
              </tr>
              {editingVariant === variant.id && (
                <tr>
                  <td colSpan={5} className="p-0">
                    <div className="m-4 space-y-6">
                      {/* Pricing section */}
                      <div className="bg-white p-6 rounded-lg shadow-sm custom-border-1">
                        <h3 className="text-black title-4-semibold mb-4">
                          Pricing
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-black title-4-semibold mb-2">
                              Price <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-10">
                                ₹
                              </span>
                              <input
                                type="text"
                                inputMode="decimal"
                                value={variant.price ? variant.price : ""}
                                onChange={(e) =>
                                  updatePricingValues(
                                    variant.id,
                                    "price",
                                    e.target.value
                                  )
                                }
                                onKeyDown={handleNumberKeyDown}
                                placeholder="0.00"
                                className="w-full !pl-6 p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
                                disabled={disabled}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-black title-4-semibold mb-2">
                              Compare-at price
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-10">
                                ₹
                              </span>
                              <input
                                type="text"
                                inputMode="decimal"
                                value={variant.compare_price ? variant.compare_price : ""}
                                onChange={(e) =>
                                  updateVariantField(
                                    variant.id,
                                    "compare_price",
                                    e.target.value
                                  )
                                }
                                onKeyDown={handleNumberKeyDown}
                                placeholder="0.00"
                                className="w-full !pl-6 p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
                                disabled={disabled}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-black title-4-semibold mb-2">
                              Cost per item
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-10">
                                ₹
                              </span>
                              <input
                                type="text"
                                inputMode="decimal"
                                value={variant.cost_per_item ? variant.cost_per_item : ""}
                                onChange={(e) =>
                                  updatePricingValues(
                                    variant.id,
                                    "cost_per_item",
                                    e.target.value
                                  )
                                }
                                onKeyDown={handleNumberKeyDown}
                                placeholder="0.00"
                                className="w-full !pl-6 p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
                                disabled={disabled}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-black title-4-semibold mb-2">
                              Profit
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-10">
                                ₹
                              </span>
                              <input
                                type="number"
                                value={
                                  variant.profit
                                    ? variant.profit.toFixed(2)
                                    : "0.00"
                                }
                                readOnly
                                placeholder="0.00"
                                className="w-full !pl-6 p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none bg-gray-100 cursor-not-allowed"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="block text-black title-4-semibold mb-2">
                              Margin
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                value={
                                  variant.margin
                                    ? variant.margin.toFixed(2)
                                    : "0.00"
                                }
                                readOnly
                                placeholder="0.00"
                                className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none bg-gray-100 cursor-not-allowed"
                              />
                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-10">
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Inventory section */}
                      <div className="bg-white p-6 rounded-lg shadow-sm custom-border-1">
                        <h3 className="text-black title-4-semibold mb-4">
                          Inventory
                        </h3>
                        <div className="mb-4">
                          <label className="flex items-center gap-2 cursor-pointer mb-4">
                            <input
                              type="checkbox"
                              checked={variant.is_tracking_inventory || false}
                              onChange={(e) =>
                                handleCheckboxChange(
                                  variant.id,
                                  "is_tracking_inventory",
                                  e.target.checked
                                )
                              }
                              className="rounded border-gray-300"
                              disabled={disabled}
                            />
                            <span className="text-black small">
                              Track inventory for this variant
                            </span>
                          </label>

                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-black title-4-semibold">
                              Quantity <span className="text-red-500">*</span>
                            </label>
                          </div>

                          <div className="mb-4">
                            <label className="block text-gray-10 xsmall mb-1">
                              Current Stock
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={variant.stock_qty ? variant.stock_qty : ""}
                              onChange={(e) =>
                                updateVariantField(
                                  variant.id,
                                  "stock_qty",
                                  e.target.value === "" ? "" : parseInt(e.target.value) || 0
                                )
                              }
                              onKeyDown={(e) => handleNumberKeyDown(e, false)}
                              placeholder="0"
                              className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
                              disabled={disabled}
                            />
                          </div>

                          <label className="flex items-center gap-2 cursor-pointer mb-4">
                            <input
                              type="checkbox"
                              checked={variant.sell_out_of_stock || false}
                              onChange={(e) =>
                                handleCheckboxChange(
                                  variant.id,
                                  "sell_out_of_stock",
                                  e.target.checked
                                )
                              }
                              className="rounded border-gray-300"
                              disabled={disabled}
                            />
                            <span className="text-black small">
                              Continue selling when out of stock
                            </span>
                          </label>

                          <div className="mb-4">
                            <label className="block text-gray-10 xsmall mb-1">
                              SKU (Stock Keeping Unit){" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={variant.sku || ""}
                              onChange={(e) =>
                                updateVariantField(
                                  variant.id,
                                  "sku",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
                              disabled={disabled}
                            />
                            <p className="text-gray-10 xxsmall mt-1">
                              Only alphanumeric characters, hyphens (-) and
                              underscores (_) are allowed
                            </p>
                          </div>

                          <label className="flex items-center gap-2 cursor-pointer mb-4">
                            <input
                              type="checkbox"
                              checked={variant.has_barcode || false}
                              onChange={(e) =>
                                handleCheckboxChange(
                                  variant.id,
                                  "has_barcode",
                                  e.target.checked
                                )
                              }
                              className="rounded border-gray-300"
                              disabled={disabled}
                            />
                            <span className="text-black small">
                              This variant has a barcode
                            </span>
                          </label>

                          {variant.has_barcode && (
                            <div>
                              <label className="block text-gray-10 xsmall mb-1">
                                Barcode (ISBN, UPC, GTIN, etc.)
                              </label>
                              <input
                                type="text"
                                value={variant.barcode || ""}
                                onChange={(e) =>
                                  updateVariantField(
                                    variant.id,
                                    "barcode",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g. 1234567890123"
                                className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
                                disabled={disabled}
                              />
                              <p className="text-gray-10 xxsmall mt-1">
                                Alphanumeric characters are allowed
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Shipping section */}
                      <div className="bg-white p-6 rounded-lg shadow-sm custom-border-1">
                        <h3 className="text-black title-4-semibold mb-4">
                          Shipping
                        </h3>
                        <div className="mb-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-black title-4-semibold mb-2">
                                Weight
                              </label>
                              <div className="flex">
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={variant.weight ? variant.weight : ""}
                                  onChange={(e) =>
                                    updateVariantField(
                                      variant.id,
                                      "weight",
                                      e.target.value
                                    )
                                  }
                                  onKeyDown={handleNumberKeyDown}
                                  placeholder="0.0"
                                  className="w-full p-2 custom-border-3 bg-blue-80 rounded-l-md small focus:outline-none"
                                  disabled={disabled}
                                />
                                <select
                                  className="p-2 border-y-2 border-r-2 border-gray-line bg-blue-80 rounded-r-md small focus:outline-none"
                                  disabled={disabled}
                                >
                                  <option>kg</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-black title-4-semibold mb-2">
                                Dimensions
                              </label>
                              <div className="flex">
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={variant.length ? variant.length : ""}
                                  onChange={(e) =>
                                    updateVariantField(
                                      variant.id,
                                      "length",
                                      e.target.value
                                    )
                                  }
                                  onKeyDown={handleNumberKeyDown}
                                  placeholder="Length"
                                  className="w-full custom-border-3 bg-blue-80 small focus:outline-none mr-1"
                                  disabled={disabled}
                                />
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={variant.breadth ? variant.breadth : ""}
                                  onChange={(e) =>
                                    updateVariantField(
                                      variant.id,
                                      "breadth",
                                      e.target.value
                                    )
                                  }
                                  onKeyDown={handleNumberKeyDown}
                                  placeholder="Width"
                                  className="w-full custom-border-3 bg-blue-80 small focus:outline-none mr-1"
                                  disabled={disabled}
                                />
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={variant.height ? variant.height : ""}
                                  onChange={(e) =>
                                    updateVariantField(
                                      variant.id,
                                      "height",
                                      e.target.value
                                    )
                                  }
                                  onKeyDown={handleNumberKeyDown}
                                  placeholder="Height"
                                  className="w-full custom-border-3 bg-blue-80 small focus:outline-none mr-1"
                                  disabled={disabled}
                                />
                                <select
                                  className="custom-border-3 bg-blue-80 small focus:outline-none"
                                  disabled={disabled}
                                >
                                  <option>cm</option>
                                </select>
                              </div>
                            </div>
                          </div>





                          <p className="text-gray-10 xsmall">
                            Learn more about{" "}
                            <a href="#" className="text-primary">
                              adding HS code
                            </a>
                          </p>
                        </div>
                      </div>

                      {/* Images section */}
                      <div className="bg-white p-6 rounded-lg shadow-sm custom-border-1">
                        <h3 className="text-black title-4-semibold mb-4">
                          Images
                        </h3>

                        {/* Existing Images */}
                        <div className="mt-2">
                          {/* Display existing image thumbnails with drag-drop */}
                          {variant.image_urls &&
                            variant.image_urls.length > 0 && (
                            <VariantImageGallery
                              images={variant.image_urls}
                              onImagesChange={(reorderedImages) =>
                                handleReorderExistingImages(variant.id, reorderedImages)
                              }
                              onRemoveImage={(idx) =>
                                handleRemoveExistingImage(variant.id, idx)
                              }
                              disabled={disabled}
                            />
                          )}
                        </div>

                        {/* New Image Upload Component */}
                        <ProductMultiImageUpload
                          images={variant.images || []}
                          setImages={(newImages) =>
                            handleVariantImages(variant.id, newImages)
                          }
                          maxImages={8 - (variant.image_urls?.length || 0)}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Quick actions */}
      <div className="mt-4 flex gap-4 flex-wrap">
        <div className="flex items-center">
          <span className="text-xs text-gray-600 mr-2">Set all prices:</span>
          <input
            type="number"
            placeholder="₹ 0.00"
            className="w-24 p-1 xxsmall focus:outline-none border rounded"
            onBlur={(e) => {
              if (e.target.value) {
                applyToAll("price", parseFloat(e.target.value) || 0);
                e.target.value = "";
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.currentTarget.value) {
                applyToAll("price", parseFloat(e.currentTarget.value) || 0);
                e.currentTarget.value = "";
              }
            }}
          />
        </div>

        {/* <div className="flex items-center">
          <span className="text-xs text-gray-600 mr-2">Set all SKUs:</span>
          <input
            type="text"
            placeholder="SKU-"
            className="w-24 p-1 xxsmall focus:outline-none border rounded"
            onBlur={(e) => {
              if (e.target.value) {
                // Apply SKU prefix to all variants
                const prefix = e.target.value;
                const updatedVariants = variants.map((v, i) => ({
                  ...v,
                  sku: `${prefix}-${i + 1}`,
                }));
                onChange(updatedVariants);
                e.target.value = "";
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.currentTarget.value) {
                // Apply SKU prefix to all variants
                const prefix = e.currentTarget.value;
                const updatedVariants = variants.map((v, i) => ({
                  ...v,
                  sku: `${prefix}-${i + 1}`,
                }));
                onChange(updatedVariants);
                e.currentTarget.value = "";
              }
            }}
          />
        </div> */}

        <div className="flex items-center">
          <span className="text-xs text-gray-600 mr-2">Set all inventory:</span>
          <input
            type="number"
            placeholder="Qty"
            className="w-24 p-1 xxsmall focus:outline-none border rounded"
            onBlur={(e) => {
              if (e.target.value) {
                applyToAll("stock_qty", parseInt(e.target.value) || 0);
                e.target.value = "";
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.currentTarget.value) {
                applyToAll("stock_qty", parseInt(e.currentTarget.value) || 0);
                e.currentTarget.value = "";
              }
            }}
          />
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenIdx !== null &&
        variants.some(
          (v) =>
            v.id === fullscreenIdx.variantId &&
            v.image_urls &&
            v.image_urls[fullscreenIdx.imgIdx]
        ) && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setFullscreenIdx(null)}
            style={{ zIndex: 1000, backgroundColor: "rgba(0, 0, 0, 0.8)" }}
          >
            <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center">
              {variants.find((v) => v.id === fullscreenIdx.variantId)
                ?.image_urls && (
                  <Image
                    src={
                      variants.find((v) => v.id === fullscreenIdx.variantId)!
                        .image_urls![fullscreenIdx.imgIdx].url || ''
                    }
                    alt={`Product Fullscreen`}
                    width={1200}
                    height={1200}
                    className="max-w-full max-h-full object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              <button
                type="button"
                onClick={() => setFullscreenIdx(null)}
                className="absolute top-4 right-4 text-white bg-red-500 p-2 rounded-full h-10 w-10 flex items-center justify-center"
              >
                <span className="text-lg">×</span>
              </button>
            </div>
          </div>
        )}
    </div>
  );
};

export default VariantMatrix;
