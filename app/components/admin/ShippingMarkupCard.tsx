"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import { ShippingMarkup } from "@/app/lib/services/admin/productTypeService";

interface ShippingMarkupCardProps {
  markups: ShippingMarkup[];
  onMarkupsChange: (markups: ShippingMarkup[]) => void;
  shippingAgencies: Array<{ id: string; name: string }>;
}

export default function ShippingMarkupCard({
  markups,
  onMarkupsChange,
  shippingAgencies,
}: ShippingMarkupCardProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    agencyId: "",
    agencyName: "",
    markupType: "fixed" as "fixed" | "percentage",
    markupValue: 0,
  });

  const handleAddNew = () => {
    setIsAddingNew(true);
    setFormData({
      agencyId: "",
      agencyName: "",
      markupType: "fixed",
      markupValue: 0,
    });
  };

  const handleEdit = (markup: ShippingMarkup) => {
    setEditingId(markup.agencyId);
    setFormData({
      agencyId: markup.agencyId,
      agencyName: markup.agencyName,
      markupType: markup.markupType,
      markupValue: markup.markupValue,
    });
  };

  const handleAgencySelect = (agencyId: string, agencyName: string) => {
    setFormData((prev) => ({
      ...prev,
      agencyId,
      agencyName,
    }));
  };

  const handleSave = () => {
    if (!formData.agencyId || formData.markupValue < 0) {
      alert("Please select an agency and enter a valid markup value");
      return;
    }

    if (editingId) {
      // Update existing
      const updated = markups.map((m) =>
        m.agencyId === editingId
          ? {
              agencyId: formData.agencyId,
              agencyName: formData.agencyName,
              markupType: formData.markupType,
              markupValue: formData.markupValue,
            }
          : m
      );
      onMarkupsChange(updated);
      setEditingId(null);
    } else {
      // Add new
      const newMarkup: ShippingMarkup = {
        agencyId: formData.agencyId,
        agencyName: formData.agencyName,
        markupType: formData.markupType,
        markupValue: formData.markupValue,
      };
      onMarkupsChange([...markups, newMarkup]);
      setIsAddingNew(false);
    }

    setFormData({
      agencyId: "",
      agencyName: "",
      markupType: "fixed",
      markupValue: 0,
    });
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    setEditingId(null);
    setFormData({
      agencyId: "",
      agencyName: "",
      markupType: "fixed",
      markupValue: 0,
    });
  };

  const handleDelete = (agencyId: string) => {
    if (confirm("Are you sure you want to delete this markup?")) {
      onMarkupsChange(markups.filter((m) => m.agencyId !== agencyId));
    }
  };

  const availableAgencies = shippingAgencies.filter(
    (agency) =>
      !markups.some((m) => m.agencyId === agency.id) ||
      editingId === agency.id
  );

  return (
    <div className="bg-white rounded-lg border border-gray-line p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-black">Shipping Agency Markup Charges</h3>
        {!isAddingNew && !editingId && (
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
          >
            <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
            Add Markup
          </button>
        )}
      </div>

      {/* Table-like structure */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left side - Agencies */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Shipping Agencies</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {markups.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No markups configured yet</p>
            ) : (
              markups.map((markup) => (
                <div
                  key={markup.agencyId}
                  className={`p-3 rounded-md border transition ${
                    editingId === markup.agencyId
                      ? "bg-blue-50 border-blue-300"
                      : "bg-gray-50 border-gray-line hover:bg-gray-100"
                  }`}
                >
                  <p className="text-sm font-medium text-black">{markup.agencyName}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right side - Rates */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Markup Rates</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {markups.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No markups configured yet</p>
            ) : (
              markups.map((markup) => (
                <div
                  key={markup.agencyId}
                  className={`p-3 rounded-md border transition flex items-center justify-between ${
                    editingId === markup.agencyId
                      ? "bg-blue-50 border-blue-300"
                      : "bg-gray-50 border-gray-line hover:bg-gray-100"
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-black">
                      {markup.markupValue}
                      {markup.markupType === "percentage" ? "%" : " "}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {markup.markupType === "percentage" ? "Percentage" : "Fixed Amount"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(markup)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded transition"
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(markup.agencyId)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded transition"
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {(isAddingNew || editingId) && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-black mb-4">
            {editingId ? "Edit Markup" : "Add New Markup"}
          </h4>

          <div className="grid grid-cols-2 gap-4">
            {/* Agency Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Agency
              </label>
              <select
                value={formData.agencyId}
                onChange={(e) => {
                  const agency = shippingAgencies.find((a) => a.id === e.target.value);
                  if (agency) {
                    handleAgencySelect(agency.id, agency.name);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-line rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="">Select Agency</option>
                {availableAgencies.map((agency) => (
                  <option key={agency.id} value={agency.id}>
                    {agency.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Markup Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Markup Type
              </label>
              <select
                value={formData.markupType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    markupType: e.target.value as "fixed" | "percentage",
                  }))
                }
                className="w-full px-3 py-2 border border-gray-line rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="fixed">Fixed Amount</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>

            {/* Markup Value */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Markup Value {formData.markupType === "percentage" ? "(%)" : ""}
              </label>
              <input
                type="number"
                min="0"
                step={formData.markupType === "percentage" ? "0.01" : "1"}
                value={formData.markupValue}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    markupValue: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder={
                  formData.markupType === "percentage"
                    ? "Enter percentage (e.g., 5.5)"
                    : "Enter amount"
                }
                className="w-full px-3 py-2 border border-gray-line rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm font-medium"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
