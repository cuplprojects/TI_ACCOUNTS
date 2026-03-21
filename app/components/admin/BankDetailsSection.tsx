"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import {
  BankDetails,
  getSellerBankDetails,
  addSellerBankDetails,
  updateSellerBankDetails,
  deleteSellerBankDetails,
} from "@/app/lib/services/admin/sellerService";
import BankDetailsModal from "./BankDetailsModal";

interface BankDetailsSectionProps {
  sellerId: string;
}

export default function BankDetailsSection({ sellerId }: BankDetailsSectionProps) {
  const [bankDetails, setBankDetails] = useState<BankDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<BankDetails | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBankDetails();
  }, [sellerId]);

  const loadBankDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Loading bank details for seller:", sellerId);
      const details = await getSellerBankDetails(sellerId);
      console.log("Bank details loaded:", details);
      setBankDetails(details);
    } catch (error) {
      console.error("Error loading bank details:", error);
      setError("Failed to load bank details. Please ensure the database is set up.");
      setBankDetails([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setSelectedBank(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (bank: BankDetails) => {
    setSelectedBank(bank);
    setIsModalOpen(true);
  };

  const handleSave = (data: BankDetails) => {
    setIsSaving(true);
    console.log("handleSave called with data:", data);

    if (data.id) {
      // Update existing
      console.log("Updating bank details:", sellerId, data.id);
      updateSellerBankDetails(sellerId, data.id, data);
      // Update in local state
      setBankDetails(bankDetails.map(b => b.id === data.id ? data : b));
    } else {
      // Add new
      console.log("Adding new bank details:", sellerId, data);
      addSellerBankDetails(sellerId, data);
      // Add to list with temporary ID
      const newBank = { ...data, id: Date.now().toString() };
      console.log("Adding new bank to list:", newBank);
      setBankDetails([...bankDetails, newBank]);
    }

    setIsSaving(false);
  };

  const handleDelete = async (bankId: string) => {
    const success = await deleteSellerBankDetails(sellerId, bankId);
    if (success) {
      // Remove from local state instead of refetching
      setBankDetails(bankDetails.filter(b => b.id !== bankId));
    }
  };

  if (isLoading) {
    return <div className="text-center py-4 text-gray-10 small">Loading bank details...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm custom-border-1 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-black title-4-semibold">Bank Details</h3>
        <button
          type="button"
          onClick={handleAddClick}
          disabled={!!error}
          className="text-gray-10 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
          title="Add bank details"
        >
          <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-2">
          <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-yellow-800 xsmall font-medium">Setup Required</p>
            <p className="text-yellow-700 xsmall mt-1">{error}</p>
          </div>
        </div>
      )}

      {!error && bankDetails.length === 0 ? (
        <p className="text-gray-10 small text-center py-4">No bank details added</p>
      ) : !error ? (
        <div className="space-y-3">
          {bankDetails.map((bank) => (
            <div
              key={bank.id}
              className="border border-gray-line rounded-md p-4 hover:bg-gray-50 transition"
            >
              {/* Header with Primary Badge and Actions */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-line">
                <div className="flex items-center gap-2">
                  {bank.is_primary && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 xsmall font-semibold rounded">
                      Primary
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditClick(bank)}
                    className="text-gray-10 hover:text-black transition"
                    title="Edit"
                  >
                    <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(bank.id!)}
                    className="text-gray-10 hover:text-red-600 transition"
                    title="Delete"
                  >
                    <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Key-Value Pairs in Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-10 xsmall mb-1">Bank Name</p>
                  <p className="text-black small-semibold">{bank.bank_name}</p>
                </div>
                <div>
                  <p className="text-gray-10 xsmall mb-1">Account Holder</p>
                  <p className="text-black small-semibold">
                    {bank.account_holder_name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-10 xsmall mb-1">Account Number</p>
                  <p className="text-black small-semibold">
                    {bank.account_number}
                  </p>
                </div>
                <div>
                  <p className="text-gray-10 xsmall mb-1">IFSC Code</p>
                  <p className="text-black small-semibold">{bank.ifsc_code}</p>
                </div>
                {bank.branch_name && (
                  <div>
                    <p className="text-gray-10 xsmall mb-1">Branch</p>
                    <p className="text-black small-semibold">{bank.branch_name}</p>
                  </div>
                )}
                {bank.upi_id && (
                  <div>
                    <p className="text-gray-10 xsmall mb-1">UPI ID</p>
                    <p className="text-black small-semibold">{bank.upi_id}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <BankDetailsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBank(null);
        }}
        bankDetails={selectedBank}
        onSave={handleSave}
        isLoading={isSaving}
      />
    </div>
  );
}
