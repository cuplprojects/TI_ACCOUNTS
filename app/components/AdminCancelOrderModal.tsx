"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { getOrderItemImage } from "@/app/lib/utils/orderItemUtils";

interface OrderItem {
  id: string;
  order_id: string;
  variant_id: string;
  product_id: string;
  seller_id: string;
  quantityRequested: number;
  quantityFulfilled: number;
  unitPrice: string;
  status: "pending" | "fulfilled" | "partially_fulfilled" | "canceled";
  createdAt: string;
  updatedAt: string;
  Variant: {
    id: string;
    price: string;
    compare_price?: string;
    sku: string;
    stock_qty: number;
    option_values: { [key: string]: string };
    image_urls: {
      url: string;
      position: number;
    }[];
    weight?: number;
    length?: number;
    breadth?: number;
    height?: number;
  };
  Product: {
    id: string;
    title: string;
    description?: string;
    brand?: string;
    seller_id: string;
    has_variant?: boolean;
    price?: string;
    sku: string;
    stock_qty?: number;
    weight?: string;
    image_urls?: (
      | string
      | {
          url: string;
          position: number;
        }
    )[];
    default_image_urls?: {
      url: string;
      position: number;
    }[];
  };
}

interface AdminCancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedItemIds: string[], refundAmount: number) => void;
  orderId: string;
  orderItems: OrderItem[];
  shippingAmount?: number;
  cancelRequestMessage?: string;
  autoCheckProductTitles?: string[];
  isLoading?: boolean;
}

export default function AdminCancelOrderModal({
  isOpen,
  onClose,
  onConfirm,
  orderItems,
  shippingAmount = 0,
  cancelRequestMessage = "",
  autoCheckProductTitles = [],
  isLoading = false,
}: AdminCancelOrderModalProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [shippingRefundType, setShippingRefundType] = useState<"full" | "partial" | "none">("none");
  const [customShippingAmount, setCustomShippingAmount] = useState<string>("");

  // Auto-check items based on product titles when modal opens
  useEffect(() => {
    if (isOpen && autoCheckProductTitles.length > 0) {
      const itemsToCheck = new Set<string>();
      orderItems.forEach((item) => {
        const shouldCheck = autoCheckProductTitles.some(
          (title) =>
            item.Product?.title?.toLowerCase() === title.toLowerCase()
        );
        if (shouldCheck) {
          itemsToCheck.add(item.id);
        }
      });
      setSelectedItems(itemsToCheck);
    } else if (isOpen) {
      setSelectedItems(new Set());
    }
  }, [isOpen, autoCheckProductTitles, orderItems]);

  // Auto-update shipping refund based on whether all items are cancelled
  useEffect(() => {
    const totalQtyRequested = orderItems.reduce((sum, item) => sum + item.quantityRequested, 0);
    const totalQtyCancelled = Array.from(selectedItems).reduce((sum, itemId) => {
      const item = orderItems.find((i) => i.id === itemId);
      return sum + (item?.quantityRequested || 0);
    }, 0);
    
    // If all items are cancelled, auto-check full shipping refund
    if (totalQtyCancelled > 0 && totalQtyCancelled === totalQtyRequested) {
      setShippingRefundType("full");
    } else if (totalQtyCancelled > 0 && totalQtyCancelled < totalQtyRequested) {
      // If partial items cancelled, default to no refund
      setShippingRefundType("none");
    }
  }, [selectedItems, orderItems]);

  if (!isOpen) return null;

  const handleItemToggle = (itemId: string) => {
    const newSet = new Set(selectedItems);
    
    if (newSet.has(itemId)) {
      newSet.delete(itemId);
    } else {
      newSet.add(itemId);
    }
    setSelectedItems(newSet);
  };

  const selectedItemsTotal = Array.from(selectedItems).reduce(
    (sum, itemId) => {
      const item = orderItems.find((i) => i.id === itemId);
      if (item) {
        return sum + parseFloat(item.unitPrice) * item.quantityRequested;
      }
      return sum;
    },
    0
  );

  // Calculate total quantities
  const totalQtyRequested = orderItems.reduce((sum, item) => sum + item.quantityRequested, 0);
  const totalQtyCancelled = Array.from(selectedItems).reduce((sum, itemId) => {
    const item = orderItems.find((i) => i.id === itemId);
    return sum + (item?.quantityRequested || 0);
  }, 0);

  // Calculate shipping refund based on selection
  const calculateShippingRefund = (): number => {
    if (shippingRefundType === "none") return 0;
    if (shippingRefundType === "full") return shippingAmount;
    
    // Partial shipping
    if (customShippingAmount) {
      const customAmount = parseFloat(customShippingAmount);
      if (!isNaN(customAmount)) {
        return Math.min(customAmount, shippingAmount);
      }
    }
    return 0;
  };

  const shippingRefund = calculateShippingRefund();

  // Calculate total refund (items + shipping)
  const finalRefundAmount = selectedItemsTotal + shippingRefund;
  const selectedItemCount = selectedItems.size;

  const handleConfirm = () => {
    const itemsToCancel = Array.from(selectedItems);
    
    if (itemsToCancel.length > 0) {
      onConfirm(itemsToCancel, finalRefundAmount);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="h-5 w-5 text-red-500"
            />
            <h2 className="text-xl font-semibold text-gray-900">
              Cancel Order Items
            </h2>
          </div>
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
          {/* Display Cancel Request Message */}
          {cancelRequestMessage && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-h-48 overflow-y-auto">
              <div
                className="text-sm text-gray-700"
                dangerouslySetInnerHTML={{ __html: cancelRequestMessage }}
              />
            </div>
          )}

          <p className="text-sm text-gray-600 mb-4">
            Select items to cancel from this order:
          </p>

          {/* Items Selection */}
          <div className="space-y-3 mb-6 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
            {orderItems.filter((item) => item.status !== "canceled").length > 0 ? (
              orderItems.filter((item) => item.status !== "canceled").map((item) => {
                const imageUrl = getOrderItemImage(item) || "/images/placeholder-product.png";
                
                return (
                  <div
                    key={item.id}
                    className="flex items-start p-3 hover:bg-gray-50 rounded gap-3 border border-gray-100"
                  >
                    <input
                      type="checkbox"
                      id={`item-${item.id}`}
                      checked={selectedItems.has(item.id)}
                      onChange={() => handleItemToggle(item.id)}
                      disabled={isLoading}
                      className="mt-1 h-4 w-4 text-red-600 rounded cursor-pointer flex-shrink-0"
                    />
                    <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={item.Product.title || "Product"}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = "/images/placeholder-product.png";
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <label
                        htmlFor={`item-${item.id}`}
                        className="cursor-pointer"
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {item.Product.title || "Product Unavailable"}
                        </div>
                        <div className="text-xs text-gray-500">
                          SKU: {item.Variant.sku || "N/A"}
                        </div>
                        {item.Variant.option_values && Object.keys(item.Variant.option_values).length > 0 && (
                          <div className="text-xs text-gray-500">
                            Variant: {Object.entries(item.Variant.option_values).map(([key, value]) => `${key}: ${value}`).join(", ")}
                          </div>
                        )}
                        <div className="text-xs text-gray-600 mt-1">
                          Unit Price: ₹{item.unitPrice}
                        </div>
                        <div className="text-xs mt-1">
                          <span
                            className={`inline-block px-2 py-1 rounded ${
                              item.status === "fulfilled"
                                ? "bg-green-100 text-green-800"
                                : item.status === "canceled"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {item.status.charAt(0).toUpperCase() +
                              item.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Qty: {item.quantityRequested} × ₹{item.unitPrice} = ₹{(parseFloat(item.unitPrice) * item.quantityRequested).toFixed(2)}
                        </div>
                      </label>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500">No items available</p>
            )}
          </div>

          {/* Refund Configuration */}
          {selectedItemCount > 0 && shippingAmount > 0 && (
            <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-900">
                  Shipping Refund:
                </label>
                {totalQtyCancelled === totalQtyRequested && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    All items cancelled
                  </span>
                )}
                {totalQtyCancelled > 0 && totalQtyCancelled < totalQtyRequested && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Partial cancellation
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="shippingRefund"
                    value="full"
                    checked={shippingRefundType === "full"}
                    onChange={(e) => setShippingRefundType(e.target.value as "full" | "partial" | "none")}
                    disabled={isLoading}
                    className="h-4 w-4 text-amber-600"
                  />
                  <span className="text-sm text-gray-700">Full (₹{shippingAmount.toFixed(2)})</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="shippingRefund"
                    value="partial"
                    checked={shippingRefundType === "partial"}
                    onChange={(e) => setShippingRefundType(e.target.value as "full" | "partial" | "none")}
                    disabled={isLoading}
                    className="h-4 w-4 text-amber-600"
                  />
                  <span className="text-sm text-gray-700">Partial</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="shippingRefund"
                    value="none"
                    checked={shippingRefundType === "none"}
                    onChange={(e) => setShippingRefundType(e.target.value as "full" | "partial" | "none")}
                    disabled={isLoading}
                    className="h-4 w-4 text-amber-600"
                  />
                  <span className="text-sm text-gray-700">No Refund</span>
                </label>
              </div>

              {/* Partial Shipping Amount Input */}
              {shippingRefundType === "partial" && (
                <div className="mt-3">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={shippingAmount}
                    value={customShippingAmount}
                    onChange={(e) => setCustomShippingAmount(e.target.value)}
                    disabled={isLoading}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              )}
            </div>
          )}

          {/* Selected Total */}
          {selectedItemCount > 0 && (
            <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-200">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">
                    Items Amount:
                  </span>
                  <span className="text-sm font-semibold text-red-600">
                    ₹{selectedItemsTotal.toFixed(2)}
                  </span>
                </div>
                {shippingAmount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">
                      Shipping Refund:
                    </span>
                    <span className="text-sm font-semibold text-red-600">
                      ₹{shippingRefund.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t border-red-200 pt-2 flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900">
                    Total Refund:
                  </span>
                  <span className="text-lg font-bold text-red-600">
                    ₹{finalRefundAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-600 mb-6">
            {selectedItemCount > 0
              ? `Canceling ${selectedItemCount} item${
                  selectedItemCount !== 1 ? "s" : ""
                }. This action cannot be undone.`
              : "Please select at least one item to cancel."}
          </p>

          {/* Footer */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Keep Items
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || selectedItemCount === 0}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Processing..." : `Cancel ${selectedItemCount} Item${selectedItemCount !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
