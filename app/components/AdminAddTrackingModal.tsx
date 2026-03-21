"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faShippingFast } from "@fortawesome/free-solid-svg-icons";
import {
  type AdminAddTrackingRequest,
  addTracking,
} from "@/app/lib/services/admin/orderService";
import { showErrorToast } from "@/app/lib/swalConfig";

interface AdminAddTrackingModalProps {
  orderId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminAddTrackingModal({
  orderId,
  onClose,
  onSuccess,
}: AdminAddTrackingModalProps) {
  // Tracking information state
  const [trackingData, setTrackingData] = useState({
    tracking_number: "",
    shipping_carrier: "",
    custom_carrier_name: "",
    custom_tracking_url: "",
  });

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  const handleTrackingDataChange = (
    field: keyof AdminAddTrackingRequest | "custom_carrier_name" | "custom_tracking_url",
    value: string
  ) => {
    setTrackingData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate tracking data
    if (!trackingData.tracking_number.trim()) {
      showErrorToast("Please enter a tracking number");
      return;
    }

    if (!trackingData.shipping_carrier) {
      showErrorToast("Please select a shipping carrier");
      return;
    }

    // Validate custom carrier fields if "Other" is selected
    if (trackingData.shipping_carrier === "Other") {
      if (!trackingData.custom_carrier_name.trim()) {
        showErrorToast("Please enter the carrier name");
        return;
      }
      if (!trackingData.custom_tracking_url.trim()) {
        showErrorToast("Please enter the tracking URL");
        return;
      }
    }

    setIsLoading(true);
    try {
      // Prepare the data for submission
      const submissionData = {
        tracking_number: trackingData.tracking_number.trim(),
        shipping_carrier: trackingData.shipping_carrier === "Other" 
          ? trackingData.custom_carrier_name.trim() 
          : trackingData.shipping_carrier,
        ...(trackingData.shipping_carrier === "Other" && {
          custom_tracking_url: trackingData.custom_tracking_url.trim()
        })
      };

      const success = await addTracking(orderId, submissionData);

      if (success) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error adding tracking:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", zIndex: 1000 }}
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden"
          onClick={handleModalClick}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon 
                  icon={faShippingFast} 
                  className="h-5 w-5 text-primary" 
                />
                <div>
                  <h2 className="title-3-semibold text-black">Add Tracking Information</h2>
                  <p className="small text-gray-60 mt-1">
                    Enter shipping details to update order status
                  </p>
                </div>
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
            {/* Tracking Information */}
            <div className="space-y-4 mb-8">
              <h3 className="title-4-semibold text-black">Shipping Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block small-semibold text-black mb-2">
                    Tracking Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={trackingData.tracking_number}
                    onChange={(e) =>
                      handleTrackingDataChange("tracking_number", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-line rounded-md small focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter tracking number"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block small-semibold text-black mb-2">
                    Shipping Carrier <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={trackingData.shipping_carrier}
                    onChange={(e) =>
                      handleTrackingDataChange("shipping_carrier", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-line rounded-md small focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isLoading}
                  >
                    <option value="">Select carrier...</option>
                    <option value="aramex">Aramex</option>
                    <option value="dhl">DHL Express</option>
                    <option value="fedex">FedEx</option>
                    <option value="indianpost">IndiaPost</option>
                    <option value="shipglobal">ShipGlobal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Custom carrier fields - only show when "Other" is selected */}
              {trackingData.shipping_carrier === "Other" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-md">
                  <div>
                    <label className="block small-semibold text-black mb-2">
                      Carrier Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={trackingData.custom_carrier_name}
                      onChange={(e) =>
                        handleTrackingDataChange("custom_carrier_name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-line rounded-md small focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter carrier name"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block small-semibold text-black mb-2">
                      Tracking URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={trackingData.custom_tracking_url}
                      onChange={(e) =>
                        handleTrackingDataChange("custom_tracking_url", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-line rounded-md small focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="https://example.com/track/{tracking_number}"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-60 bg-white border border-gray-line rounded-md hover:bg-gray-70 transition-colors small-semibold"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors small-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add Tracking Info"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
