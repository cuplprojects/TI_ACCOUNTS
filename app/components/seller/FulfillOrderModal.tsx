"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import {
  type OrderItem,
  type FulfillOrderRequest,
} from "@/app/lib/services/seller/orderService";

interface FulfillOrderModalProps {
  orderItems: OrderItem[];
  sellerId: string;
  onClose: () => void;
  onFulfill: (fulfillmentData: FulfillOrderRequest) => void;
}

interface FulfillmentItem {
  orderItemId: string;
  quantityFulfilled: number;
  maxQuantity: number;
}

export default function FulfillOrderModal({
  orderItems,
  sellerId,
  onClose,
  onFulfill,
}: FulfillOrderModalProps) {
  // Filter items for this seller and exclude canceled items
  const sellerItems = orderItems.filter(
    (item) => item.seller_id === sellerId && item.status !== "canceled"
  );

  // Initialize fulfillment data
  const [fulfillmentItems, setFulfillmentItems] = useState<FulfillmentItem[]>(
    sellerItems.map((item) => ({
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

    // Show confirmation dialog instead of directly fulfilling
    setShowConfirmation(true);
  };

  const handleConfirmFulfillment = () => {
    const fulfillmentData: FulfillOrderRequest = {
      seller_id: sellerId,
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

  // Check if this is a re-fulfillment (some items already fulfilled)
  const isReFulfillment = sellerItems.some(
    (item) =>
      item.status === "fulfilled" || item.status === "partially_fulfilled"
  );

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
            <h3 className="title-4-semibold text-black">
              {isReFulfillment
                ? "Confirm Fulfillment Update"
                : "Confirm Fulfillment"}
            </h3>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-600 small mb-4">
            {isReFulfillment
              ? `You are about to update the fulfillment for this order. New fulfillment quantities will be: ${totalFulfilled} items out of ${totalItems} total items.`
              : `You are about to fulfill ${totalFulfilled} items out of ${totalItems} total items in this order.`}
          </p>

          <div className="border-2 border-gray-line rounded-lg p-4 mb-4">
            <h4 className="small-semibold text-black mb-2">
              Fulfillment Summary:
            </h4>
            <div className="space-y-2">
              {fulfillmentItems.map((item) => {
                const orderItem = sellerItems.find(
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
                  <strong>Note:</strong> After fulfillment, you will need to
                  create an invoice and raise a pickup request to complete the
                  order processing.
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
            {"Yes, Fulfill Order"}
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
          className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
          onClick={handleModalClick}
        >
          <div className="px-6 py-4 border-b border-gray-line sticky top-0 bg-white z-50">
            <div className="flex items-center justify-between">
              <h2 className="title-4-semibold text-black">Fulfill Order</h2>
              <button
                onClick={onClose}
                className="text-gray-10 hover:text-gray-30"
              >
                <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
              </button>
            </div>
            <p className="small text-gray-10 mt-2">
              {totalFulfilled} of {totalItems} items • You can modify
              fulfillment until invoice is created
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Order Items */}
            <div className="space-y-4 mb-8">
              <h3 className="title-4-semibold text-black">Order Items</h3>
              <div className="space-y-4">
                {sellerItems.map((item) => {
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
                        {item.Variant?.image_urls &&
                        item.Variant.image_urls.length > 0 ? (
                          <Image
                            src={
                              typeof item.Variant.image_urls[0] === "string"
                                ? item.Variant.image_urls[0]
                                : (
                                    item.Variant.image_urls[0] as {
                                      url: string;
                                      position: number;
                                    }
                                  )?.url || ""
                            }
                            alt={item.Product?.title || "Product"}
                            fill
                            className="object-cover"
                          />
                        ) : item.Product?.image_urls &&
                            item.Product.image_urls.length > 0 ? (
                          <Image
                            src={
                              typeof item.Product.image_urls[0] === "string"
                                ? item.Product.image_urls[0]
                                : (
                                    item.Product.image_urls[0] as {
                                      url: string;
                                      position: number;
                                    }
                                  )?.url || ""
                            }
                            alt={item.Product?.title || "Product"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-20 small">
                            No Image
                          </div>
                        )}
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
                            <p className="small text-gray-60">
                              ₹{item.unitPrice} each
                            </p>
                          </div>
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                              item.status === "fulfilled"
                                ? "bg-green-100 text-green-800"
                                : item.status === "partially_fulfilled"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {item.status.charAt(0).toUpperCase() +
                              item.status.slice(1).replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col md:items-end md:justify-center gap-3 w-full md:w-auto">
                        <div className="small-semibold text-black">
                          Requested: <span className="text-primary">{item.quantityRequested}</span>
                        </div>
                        <div className="small text-gray-60">
                          Currently Fulfilled: {item.quantityFulfilled}
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="small-semibold text-black">
                            New Fulfill:
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
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-70 text-gray-80 rounded-md small-semibold hover:bg-gray-90"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-primary text-white rounded-md small-semibold hover:bg-blue-10"
              >
                {isReFulfillment ? "Update Fulfillment" : "Fulfill Order"}
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
