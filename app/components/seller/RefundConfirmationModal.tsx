"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

interface OrderItem {
  id: string;
  Product: {
    title: string;
    sku: string;
  };
  Variant?: {
    image_urls?: { url: string; position: number }[];
  };
  unitPrice: string;
  quantityRequested: number;
}

interface RefundConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedItems: string[]) => void;
  orderId: string;
  totalAmount: number;
  orderItems?: OrderItem[];
  isLoading?: boolean;
}

export default function RefundConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  orderId,
  totalAmount,
  orderItems = [],
  isLoading = false,
}: RefundConfirmationModalProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleItemToggle = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectedTotal = orderItems
    .filter((item) => selectedItems.includes(item.id))
    .reduce(
      (sum, item) =>
        sum + parseFloat(item.unitPrice) * item.quantityRequested,
      0
    );

  const handleConfirm = () => {
    if (selectedItems.length > 0) {
      onConfirm(selectedItems);
      setSelectedItems([]);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Confirm Cancel Order
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="h-12 w-12 text-red-500"
              />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                Cancel Order
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                This action will initiate a cancel request for this order.
              </p>
            </div>
          </div>

          {/* Products Selection */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Select Products to Cancel:
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {orderItems.length > 0 ? (
                orderItems.map((item) => {
                  const imageUrl = item.Variant?.image_urls?.[0]?.url || '/images/placeholder-product.png';
                  return (
                    <div
                      key={item.id}
                      className="flex items-start p-2 hover:bg-gray-50 rounded gap-3"
                    >
                      <input
                        type="checkbox"
                        id={`item-${item.id}`}
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleItemToggle(item.id)}
                        disabled={isLoading}
                        className="mt-1 h-4 w-4 text-red-600 rounded cursor-pointer flex-shrink-0"
                      />
                      <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={item.Product?.title || 'Product'}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <label
                        htmlFor={`item-${item.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {item.Product?.title || 'Product Unavailable'}
                        </div>
                        <div className="text-xs text-gray-500">
                          SKU: {item.Product?.sku || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {item.quantityRequested} × ₹{item.unitPrice} = ₹
                          {(
                            parseFloat(item.unitPrice) * item.quantityRequested
                          ).toFixed(2)}
                        </div>
                      </label>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500">No items available</p>
              )}
            </div>
          </div>

          {/* Selected Total */}
          {selectedItems.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3 mb-6 border border-red-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">
                  Cancel Amount ({selectedItems.length} item
                  {selectedItems.length !== 1 ? "s" : ""}):
                </span>
                <span className="text-sm font-semibold text-red-600">
                  ₹{selectedTotal.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-600 mb-6">
            {selectedItems.length > 0
              ? `Are you sure you want to cancel ${selectedItems.length} item${
                  selectedItems.length !== 1 ? "s" : ""
                }?`
              : "Please select at least one product to cancel."}
          </p>

          {/* Footer */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || selectedItems.length === 0}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Processing..." : "Cancel Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
