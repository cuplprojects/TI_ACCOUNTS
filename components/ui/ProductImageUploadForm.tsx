"use client";

import React, { useState, useCallback } from "react";
import PresignedImageUpload from "./PresignedImageUpload";

interface ProductFormData {
  serial_no?: string;
  title: string;
  description: string;
  short_description: string;
  price: number;
  compare_price?: number;
  cost_per_item?: number;
  gst_percent: number;
  physical_product?: boolean;
  is_tracking_inventory?: boolean;
  stock_qty?: number;
  sell_out_of_stock?: boolean;
  sku?: string;
  barcode?: string;
  weight: number;
  length?: number;
  breadth?: number;
  height?: number;
  region_of_origin: string;
  hs_code: string;
  page_title?: string;
  page_description?: string;
  page_url?: string;
  type: string;
  brand: string;
  margin_contribution?: number;
  status?: "draft" | "active" | "inactive";
  tags?: string[];
  collections?: string[];
}

interface ProductImageUploadFormProps {
  role: "admin" | "seller";
  productData: ProductFormData;
  onProductDataChange: (data: ProductFormData) => void;
  onImagesChange: (images: { url: string; originalName: string }[]) => void;
  images: { url: string; originalName: string }[];
  disabled?: boolean;
  maxImages?: number;
}

const ProductImageUploadForm: React.FC<ProductImageUploadFormProps> = ({
  role,
  productData,
  onProductDataChange,
  onImagesChange,
  images,
  disabled = false,
  maxImages = 10,
}) => {
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleInputChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value, type } = e.target;

      if (type === "checkbox") {
        const checked = (e.target as HTMLInputElement).checked;
        onProductDataChange({
          ...productData,
          [name]: checked,
        });
      } else if (type === "number") {
        onProductDataChange({
          ...productData,
          [name]: value === "" ? undefined : parseFloat(value),
        });
      } else {
        onProductDataChange({
          ...productData,
          [name]: value,
        });
      }
    },
    [productData, onProductDataChange]
  );

  const handleImageUploadComplete = useCallback(
    (uploadedImages: { url: string; originalName: string }[]) => {
      onImagesChange(uploadedImages);
      setUploadError(null);
    },
    [onImagesChange]
  );

  const handleImageUploadError = useCallback((error: string) => {
    setUploadError(error);
  }, []);

  return (
    <div className="space-y-6">
      {/* Product Images */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <PresignedImageUpload
          title="Product Images"
          maxFiles={maxImages}
          keyPrefix="products/temp"
          role={role}
          onUploadComplete={handleImageUploadComplete}
          onUploadError={handleImageUploadError}
          initialImages={images}
          disabled={disabled}
        />
        {uploadError && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{uploadError}</p>
          </div>
        )}
      </div>

      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Title *
            </label>
            <input
              type="text"
              name="title"
              value={productData.title}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={disabled}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SKU
            </label>
            <input
              type="text"
              name="sku"
              value={productData.sku || ""}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={disabled}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={productData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={disabled}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short Description
            </label>
            <textarea
              name="short_description"
              value={productData.short_description}
              onChange={handleInputChange}
              rows={2}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price *
            </label>
            <input
              type="number"
              name="price"
              value={productData.price || ""}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={disabled}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compare Price
            </label>
            <input
              type="number"
              name="compare_price"
              value={productData.compare_price || ""}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={disabled}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GST Percent *
            </label>
            <input
              type="number"
              name="gst_percent"
              value={productData.gst_percent || ""}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              max="100"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* Inventory */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Inventory</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Quantity
            </label>
            <input
              type="number"
              name="stock_qty"
              value={productData.stock_qty || ""}
              onChange={handleInputChange}
              min="0"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={disabled}
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_tracking_inventory"
                checked={productData.is_tracking_inventory || false}
                onChange={handleInputChange}
                className="mr-2"
                disabled={disabled}
              />
              <span className="text-sm text-gray-700">Track Inventory</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="sell_out_of_stock"
                checked={productData.sell_out_of_stock || false}
                onChange={handleInputChange}
                className="mr-2"
                disabled={disabled}
              />
              <span className="text-sm text-gray-700">Sell Out of Stock</span>
            </label>
          </div>
        </div>
      </div>

      {/* Shipping */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Shipping</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight (kg) *
            </label>
            <input
              type="number"
              name="weight"
              value={productData.weight || ""}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={disabled}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Length (cm)
            </label>
            <input
              type="number"
              name="length"
              value={productData.length || ""}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={disabled}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Breadth (cm)
            </label>
            <input
              type="number"
              name="breadth"
              value={productData.breadth || ""}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={disabled}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Height (cm)
            </label>
            <input
              type="number"
              name="height"
              value={productData.height || ""}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand
            </label>
            <input
              type="text"
              name="brand"
              value={productData.brand}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={disabled}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <input
              type="text"
              name="type"
              value={productData.type}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={disabled}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Region of Origin *
            </label>
            <input
              type="text"
              name="region_of_origin"
              value={productData.region_of_origin}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={disabled}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              HS Code *
            </label>
            <input
              type="text"
              name="hs_code"
              value={productData.hs_code}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={disabled}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={productData.status || "draft"}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={disabled}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Title
            </label>
            <input
              type="text"
              name="page_title"
              value={productData.page_title || ""}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={disabled}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Description
            </label>
            <textarea
              name="page_description"
              value={productData.page_description || ""}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={disabled}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page URL
            </label>
            <input
              type="text"
              name="page_url"
              value={productData.page_url || ""}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductImageUploadForm;
