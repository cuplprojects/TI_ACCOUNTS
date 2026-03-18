"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import {
  type OrderItem,
  type AdminFulfillOrderRequest,
} from "@/app/lib/services/admin/orderService";
import { showErrorToast } from "@/app/lib/swalConfig";

interface AdminFulfillOrderModalProps {
  orderItems: OrderItem[];
  onClose: () => void;
  onFulfill: (fulfillmentData: AdminFulfillOrderRequest) => void;
}

interface FulfillmentItem {
  orderItemId: string;
  quantityFulfilled: number;
  maxQuantity: number;
}

export default function AdminFulfillOrderModal({
  orderItems,
  onClose,
  onFulfill,
}: AdminFulfillOrderModalProps) {
  // Filter out canceled items - only show pending items for fulfillment
  const fulfillableItems = orderItems.filter(
    (item) => item.status !== "canceled"
  );

  // Initialize fulfillment data - only for non-cancelled items
  const [fulfillmentItems, setFulfillmentItems] = useState<FulfillmentItem[]>(
    fulfillableItems.map((item) => ({
      orderItemId: item.id,
      quantityFulfilled: item.quantityRequested, // Default to full quantity
      maxQuantity: item.quantityRequested,
    }))
  );

  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleQuantityChange = (orderItemId: string, quantity: number) => {
    setFulfillmentItems((prev) =>
      prev.map((item) =>
        item.orderItemId === orderItemId
          ? { ...item, quantityFulfilled: quantity }
          : item
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least one item has quantity > 0
    const totalFulfilled = fulfillmentItems.reduce(
      (sum, item) => sum + item.quantityFulfilled,
      0
    );
    
    if (totalFulfilled === 0) {
      showErrorToast("Please fulfill at least one item");
      return;
    }
    
    // Show confirmation dialog
    setShowConfirmation(true);
  };

  const handleConfirmFulfillment = () => {
    const fulfillmentData: AdminFulfillOrderRequest = {
      items: fulfillmentItems.map((item) => ({
        orderItemId: item.orderItemId,
        quantityFulfilled: item.quantityFulfilled,
      })),
    };

    onFulfill(fulfillmentData);
    setShowConfirmation(false);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  // Calculate total items and fulfilled items
  const totalItems = fulfillmentItems.reduce(
    (sum, item) => sum + item.maxQuantity,
    0
  );
  const totalFulfilled = fulfillmentItems.reduce(
    (sum, item) => sum + item.quantityFulfilled,
    0
  );

  // Prevent clicks inside the modal from closing it
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Confirmation Dialog Component
  const ConfirmationDialog = () => (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", zIndex: 1000 }}
      onClick={handleCancelConfirmation}
    >
      <div
        className="bg-white rounded-lg w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="h-5 w-5 text-amber-500"
            />
            <h3 className="title-4-semibold text-black">Confirm Fulfillment</h3>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-600 small mb-4">
            You are about to fulfill <strong>{totalFulfilled}</strong> items out
            of <strong>{totalItems}</strong> total items in this order.
          </p>

          <div className="bg-gray-200 rounded-lg p-4 mb-4">
            <h4 className="small-semibold text-black mb-2">
              Fulfillment Summary:
            </h4>
            <div className="space-y-2">
              {fulfillmentItems.map((item) => {
                const orderItem = fulfillableItems.find(
                  (oi) => oi.id === item.orderItemId
                );
                if (!orderItem || item.quantityFulfilled === 0) return null;

                return (
                  <div
                    key={item.orderItemId}
                    className="flex justify-between items-center xsmall text-gray-700"
                  >
                    <span className="truncate mr-2">
                      {orderItem.Product?.title || 'Product Unavailable'}
                    </span>
                    <span className="font-medium">
                      {item.quantityFulfilled} of {item.maxQuantity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="h-4 w-4 text-amber-400"
                />
              </div>
              <div className="ml-3">
                <p className="xsmall text-amber-700">
                  <strong>Note:</strong> This action cannot be undone. The
                  fulfillment will be processed and customers will be notified.
                </p>
              </div>
            </div>
          </div>

          <p className="text-gray-600 small">
            Are you sure you want to proceed with the fulfillment?
          </p>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={handleCancelConfirmation}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md small-semibold hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmFulfillment}
            className="px-4 py-2 bg-primary text-white rounded-md small-semibold hover:bg-primary/90"
          >
            Yes, Fulfill Order
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden"
          onClick={handleModalClick}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="title-3-semibold text-black">Fulfill Order</h2>
                <p className="small text-gray-60 mt-1">Set quantities to fulfill</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-40 hover:text-gray-60 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Order Items */}
            <div className="space-y-4 mb-8">
              <h3 className="title-4-semibold text-black">Order Items</h3>
              <div className="space-y-4">
                {fulfillableItems.map((item) => {
                  const fulfillmentItem = fulfillmentItems.find(
                    (f) => f.orderItemId === item.id
                  );
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col md:flex-row gap-4 p-4 border border-gray-line rounded-lg"
                    >
                      {/* Product Image */}
                      <div className="w-full md:w-28 md:h-28 h-24 bg-gray-70 rounded-lg flex-shrink-0 overflow-hidden relative">
                        {(() => {
                          // Priority: Product.default_image_urls → Product.image_urls → Variant.image_urls
                          let imageUrl = "";
                          
                          if (item.Product?.default_image_urls && item.Product.default_image_urls.length > 0) {
                            const img = item.Product.default_image_urls[0];
                            imageUrl = typeof img === "string" ? img : img.url;
                          } else if (item.Product?.image_urls && item.Product.image_urls.length > 0) {
                            const img = item.Product.image_urls[0];
                            imageUrl = typeof img === "string" ? img : img.url;
                          } else if (item.Variant?.image_urls && item.Variant.image_urls.length > 0) {
                            const img = item.Variant.image_urls[0];
                            imageUrl = typeof img === "string" ? img : img.url;
                          }
                          
                          return imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.Product?.title || "Product"}
                              className="w-full h-full object-cover"
                              style={{ width: "100%", height: "100%" }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-20 small bg-gray-100">
                              No Image
                            </div>
                          );
                        })()}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="title-4-semibold text-black mb-2 line-clamp-2">
                            {item.Product?.title || "Product Unavailable"}
                          </h4>
                          <div className="space-y-1">
                            <p className="small text-black font-medium">
                              SKU: <span className="text-gray-60">{item.Variant?.sku || "N/A"}</span>
                            </p>
                            {item.Variant?.option_values && Object.keys(item.Variant.option_values).length > 0 && (
                              <p className="small text-black font-medium">
                                Variant: <span className="text-gray-60">{Object.entries(item.Variant.option_values).map(([key, value]) => `${key}: ${value}`).join(", ")}</span>
                              </p>
                            )}
                            <p className="small text-gray-60">
                              ₹{parseFloat(item.unitPrice).toFixed(2)} each
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col md:items-end md:justify-center gap-3 w-full md:w-auto">
                        <div className="small-semibold text-black">
                          Requested: <span className="text-primary">{item.quantityRequested}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="small-semibold text-black">
                            Fulfill:
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={item.quantityRequested}
                            value={fulfillmentItem?.quantityFulfilled || 0}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.id,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-20 px-2 py-1 border border-gray-line rounded-md small focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-60 bg-white border border-gray-line rounded-md hover:bg-gray-70 transition-colors small-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors small-semibold"
              >
                Fulfill Order
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && <ConfirmationDialog />}
    </>
  );
}
