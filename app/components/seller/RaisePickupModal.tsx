"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faSpinner } from "@fortawesome/free-solid-svg-icons";

interface RaisePickupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (shipmentDetails: {
    weight: number;
    height: number;
    breadth: number;
    length: number;
  }) => Promise<void>;
  isLoading?: boolean;
}

export default function RaisePickupModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: RaisePickupModalProps) {
  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    breadth: "",
    length: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      newErrors.weight = "Weight must be greater than 0";
    }

    if (!formData.height || parseFloat(formData.height) <= 0) {
      newErrors.height = "Height must be greater than 0";
    }

    if (!formData.breadth || parseFloat(formData.breadth) <= 0) {
      newErrors.breadth = "Breadth must be greater than 0";
    }

    if (!formData.length || parseFloat(formData.length) <= 0) {
      newErrors.length = "Length must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const shipmentDetails = {
      weight: parseFloat(formData.weight),
      height: parseFloat(formData.height),
      breadth: parseFloat(formData.breadth),
      length: parseFloat(formData.length),
    };

    await onSubmit(shipmentDetails);
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        weight: "",
        height: "",
        breadth: "",
        length: "",
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Raise Pickup Request
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <h3 className="title-4-semibold text-black mb-4">
              Shipment Information
            </h3>
            <div className="flex justify-between items-start w-full gap-4">
              <div className="w-1/3">
                <label className="block small-semibold text-black mb-2">
                  Shipment Weight
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.weight}
                    onChange={(e) =>
                      handleInputChange("weight", e.target.value)
                    }
                    className={`w-2/3 px-2 py-2 border rounded-md small focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.weight ? "border-red-500" : "border-gray-line"
                    }`}
                    placeholder="0.0"
                    disabled={isLoading}
                  />
                  <select className="w-1/3 px-3 py-2 border border-gray-line rounded-md small focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="kg">Kg</option>
                  </select>
                </div>
                {errors.weight && (
                  <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
                )}
              </div>

              <div className="w-2/3">
                <label className="block small-semibold text-black mb-2">
                  Shipping Dimension
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.length}
                    onChange={(e) => handleInputChange("length", e.target.value)}
                    className={`w-28 px-2 py-2 border rounded-md small focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.length ? "border-red-500" : "border-gray-line"
                    }`}
                    placeholder="Length"
                    disabled={isLoading}
                  />
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.breadth}
                    onChange={(e) =>
                      handleInputChange("breadth", e.target.value)
                    }
                    className={`w-28 px-2 py-2 border rounded-md small focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.breadth ? "border-red-500" : "border-gray-line"
                    }`}
                    placeholder="Breadth"
                    disabled={isLoading}
                  />
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.height}
                    onChange={(e) =>
                      handleInputChange("height", e.target.value)
                    }
                    className={`w-28 px-2 py-2 border rounded-md small focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.height ? "border-red-500" : "border-gray-line"
                    }`}
                    placeholder="Height"
                    disabled={isLoading}
                  />
                  <select className="px-3 py-2 border border-gray-line rounded-md small focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="cm">cm</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-1">
                  {errors.length && (
                    <p className="text-sm text-red-600">{errors.length}</p>
                  )}
                  {errors.breadth && (
                    <p className="text-sm text-red-600">{errors.breadth}</p>
                  )}
                  {errors.height && (
                    <p className="text-sm text-red-600">{errors.height}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="h-4 w-4 animate-spin"
                  />
                  Raising Pickup...
                </>
              ) : (
                "Raise Pickup"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
