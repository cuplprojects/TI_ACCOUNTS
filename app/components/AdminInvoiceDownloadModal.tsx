"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faSpinner, faFileText } from "@fortawesome/free-solid-svg-icons";
import { 
  getInvoiceData, 
  createInvoice,
  type InvoiceData 
} from "@/app/lib/services/admin/orderService";
import InvoicePDFGenerator from "./invoices/invoiceBuyer";

type ModalStep = "preview" | "create" | "download";

interface AdminInvoiceDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  invoiceCreated: boolean;
  onInvoiceCreated?: () => void;
}

export default function AdminInvoiceDownloadModal({
  isOpen,
  onClose,
  orderId,
  invoiceCreated,
  onInvoiceCreated,
}: AdminInvoiceDownloadModalProps) {
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<ModalStep>("preview");

  const loadInvoiceData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getInvoiceData(orderId);
      if (data) {
        setInvoiceData(data);
      }
    } catch {
      setError("Failed to load invoice data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  const loadInvoicePreview = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getInvoiceData(orderId);
      if (data) {
        setInvoiceData(data);
      }
    } catch {
      setError("Failed to load invoice preview. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setError(null);
      setInvoiceData(null);
      
      if (invoiceCreated) {
        setStep("download");
        loadInvoiceData();
      } else {
        setStep("preview");
        loadInvoicePreview();
      }
    }
  }, [isOpen, invoiceCreated, orderId, loadInvoiceData, loadInvoicePreview]);

  const handleCreateInvoice = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createInvoice(orderId);
      if (result) {
        setStep("download");
        const data = await getInvoiceData(orderId);
        if (data) {
          setInvoiceData(data);
        }
        // Notify parent component that invoice was created
        if (onInvoiceCreated) {
          onInvoiceCreated();
        }
      }
    } catch {
      setError("Failed to create invoice. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setInvoiceData(null);
    setError(null);
    onClose();
  };

  const getModalTitle = () => {
    switch (step) {
      case "preview":
        return "Create Invoice";
      case "create":
        return "Creating Invoice...";
      case "download":
        return "Download Invoice";
      default:
        return "Invoice";
    }
  };

  const getModalDescription = () => {
    switch (step) {
      case "preview":
        return `Preview and create an invoice for order #${orderId}`;
      case "create":
        return "Please wait while we create your invoice...";
      case "download":
        return "Your invoice is ready for download";
      default:
        return "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    }}>
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {getModalTitle()}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {getModalDescription()}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-gray-600">
                {step === "preview" ? "Loading invoice preview..." : "Creating invoice..."}
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded inline-block">
                {error}
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={step === "preview" ? loadInvoicePreview : loadInvoiceData}
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : invoiceData ? (
            <div className="max-h-[70vh] overflow-y-auto">
              <InvoicePDFGenerator 
                invoiceData={invoiceData}
                onButtonClick={step === "preview" ? handleCreateInvoice : undefined}
                buttonText={step === "preview" ? "Create Invoice" : "Download PDF"}
                isButtonLoading={isLoading}
                buttonDisabled={false}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <FontAwesomeIcon 
                icon={faFileText} 
                className="h-16 w-16 text-primary mb-4" 
              />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Create Invoice for Order #{orderId}
              </h3>
              <p className="text-gray-600">
                Loading invoice preview...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 