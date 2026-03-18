"use client";

import React, { useState, useRef } from "react";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faUpload,
  faDownload,
  faCheckCircle,
  faExclamationCircle,
  faSpinner,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { showSuccessMessage, showErrorMessage } from "@/app/lib/swalConfig";
import axiosInstance from "@/app/lib/axiosConfig";
import { useRouter } from "next/navigation";
import { getAllSellers, Seller } from "@/app/lib/services/admin";

interface UploadResult {
  success: boolean;
  message: string;
  data: {
    successful: Array<{
      index: number;
      product_name: string;
      product_id: string;
      status: string;
      variants_count: number;
      variants: Array<{ id: string; sku: string }>;
    }>;
    failed: Array<{
      index: number;
      product_name: string;
      status: string;
      reason: string;
      errors?: string[];
      variants_count: number;
    }>;
    summary: {
      total_products: number;
      successful_count: number;
      failed_count: number;
    };
  };
  results_file?: string;
}

export default function BulkUploadPage() {
  const { setTitle } = usePageTitle();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [sellerId, setSellerId] = useState<string>("");
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [showSellerDropdown, setShowSellerDropdown] = useState(false);
  const sellerDropdownRef = useRef<HTMLDivElement>(null);
  const [enableHSNValidator, setEnableHSNValidator] = useState(false);

  React.useEffect(() => {
    setTitle("Bulk Upload Products");
  }, [setTitle]);

  // Load sellers on component mount
  React.useEffect(() => {
    const loadSellers = async () => {
      try {
        const data = await getAllSellers();
        if (data && data.sellers) {
          setSellers(data.sellers);
        } else if (Array.isArray(data)) {
          setSellers(data);
        }
      } catch (error) {
        console.error("Failed to load sellers:", error);
      }
    };
    loadSellers();
  }, []);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sellerDropdownRef.current &&
        !sellerDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSellerDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const droppedFile = files[0];
      if (
        droppedFile.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        droppedFile.type === "application/vnd.ms-excel"
      ) {
        setFile(droppedFile);
      } else {
        showErrorMessage("Please upload an Excel file (.xlsx or .xls)");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const downloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/templates/bulk-upload-template.xlsx";
    link.download = "bulk-upload-template.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = async () => {
    if (!file) {
      showErrorMessage("Please select a file to upload");
      return;
    }

    if (!sellerId) {
      showErrorMessage("Please select a seller");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("excel", file);

      const response = await axiosInstance.post(
        `/admin/product/bulk-upload/${sellerId}?enableHSNValidator=${enableHSNValidator}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.data) {
        setUploadResult(response.data);
        const successCount = response.data.data?.summary?.successful_count || 0;
        const failureCount = response.data.data?.summary?.failed_count || 0;
        
        if (successCount > 0 && failureCount === 0) {
          showSuccessMessage(
            `Successfully uploaded ${successCount} product${successCount !== 1 ? 's' : ''}`
          );
        } else if (successCount > 0 && failureCount > 0) {
          showErrorMessage(
            `Upload completed: ${successCount} successful, ${failureCount} failed`
          );
        } else {
          showErrorMessage(
            `Upload failed: All ${failureCount} product(s) had validation errors`
          );
        }
      } else {
        showErrorMessage(response.data.message || "Upload failed");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to upload products";
      showErrorMessage(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadResult(null);
    setDragActive(false);
  };

  const handleBackToProducts = () => {
    router.push("/admin/products");
  };

  const getSelectedSellerName = () => {
    if (!sellerId) return "Select Seller";
    const seller = sellers.find((s) => s.id === sellerId);
    return seller?.firmName || sellerId;
  };

  const downloadLog = () => {
    if (!uploadResult) return;

    // If results_file exists (base64 Excel from backend), download it directly
    if (uploadResult.results_file) {
      try {
        const binaryString = atob(uploadResult.results_file);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { 
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `bulk-upload-results-${new Date().toISOString().split("T")[0]}.xlsx`
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showSuccessMessage("Results file downloaded successfully");
      } catch (error) {
        console.error("Error downloading file:", error);
        showErrorMessage("Failed to download results file");
      }
      return;
    }

    // Fallback: Create CSV/TSV from results data
    const successful = uploadResult.data?.successful || [];
    const failed = uploadResult.data?.failed || [];
    const summary = uploadResult.data?.summary || {};

    // Create summary section
    const summaryLines = [
      "BULK UPLOAD REPORT",
      `Generated: ${new Date().toLocaleString()}`,
      "",
      "SUMMARY",
      `Total Products: ${summary.total_products || 0}`,
      `Successful: ${summary.successful_count || 0}`,
      `Failed: ${summary.failed_count || 0}`,
      `Success Rate: ${summary.total_products ? ((summary.successful_count / summary.total_products) * 100).toFixed(2) : 0}%`,
      "",
      "SUCCESSFUL UPLOADS",
      "Product Name\tProduct ID\tVariants Count\tSKUs",
    ];

    const successRows = successful.map(result => [
      result.product_name,
      result.product_id,
      result.variants_count,
      result.variants?.map(v => v.sku).join("; ") || ""
    ]);

    const failedLines = [
      "",
      "FAILED UPLOADS",
      "Product Name\tStatus\tReason\tVariants Count"
    ];

    const failedRows = failed.map(result => [
      result.product_name,
      result.status,
      result.reason,
      result.variants_count
    ]);

    // Create TSV string (tab-separated for better readability)
    const tsvContent = [
      ...summaryLines,
      ...successRows.map(row => row.join("\t")),
      ...failedLines,
      ...failedRows.map(row => row.join("\t")),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([tsvContent], { type: "text/plain;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `bulk-upload-log-${new Date().toISOString().split("T")[0]}.txt`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="main-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/products" className="flex items-center text-black">
          <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
          <span className="display-4-bold">Bulk Upload Products</span>
        </Link>
      </div>

      {!uploadResult ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Two Column Grid Layout */}
          <div className="grid grid-cols-2 gap-8">
            {/* LEFT COLUMN: Seller Selection & Upload */}
            <div>
              {/* Seller Selector */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-10 mb-2 uppercase">
                  Select Seller *
                </label>
                <div className="relative" ref={sellerDropdownRef}>
                  <button
                    onClick={() => setShowSellerDropdown(!showSellerDropdown)}
                    className={`w-full px-4 py-2 border-2 rounded-md flex items-center justify-between text-sm font-medium transition ${
                      !sellerId
                        ? "border-red-400 bg-red-50 text-gray-10"
                        : "border-gray-line bg-white text-black hover:border-blue-10"
                    }`}
                  >
                    <span>{getSelectedSellerName()}</span>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className="h-3 w-3 text-gray-10"
                    />
                  </button>

                  {/* Seller Dropdown */}
                  {showSellerDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border-2 border-gray-line rounded-md shadow-lg max-h-60 overflow-auto">
                      {sellers.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-10">
                          No sellers available
                        </div>
                      ) : (
                        sellers.map((seller) => (
                          <button
                            key={seller.id}
                            onClick={() => {
                              setSellerId(seller.id || "");
                              setShowSellerDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm transition ${
                              sellerId === seller.id
                                ? "bg-blue-40 text-blue-00 font-semibold"
                                : "text-black hover:bg-gray-bg"
                            }`}
                          >
                            {seller.firmName}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* HSN Validator Toggle */}
              <div className="mb-6 p-4 bg-blue-40 border border-blue-20 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-semibold text-blue-00 mb-1">
                      Enable HSN Validation
                    </label>
                    <p className="text-xs text-blue-10">
                      Validate HSN codes via API during upload (default: disabled)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnableHSNValidator(!enableHSNValidator)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      enableHSNValidator ? "bg-green-10" : "bg-gray-20"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        enableHSNValidator ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* File Upload Area */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-10 mb-2 uppercase">
                  Upload Excel File *
                </label>
                {!file ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-md p-6 text-center transition ${
                      dragActive
                        ? "border-blue-10 bg-blue-40"
                        : "border-gray-line bg-gray-bg"
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={faUpload}
                      size="2x"
                      className="text-gray-20 mb-3 block"
                    />
                    <p className="text-gray-10 mb-1 text-sm font-semibold">
                      Drag and drop your Excel file here
                    </p>
                    <p className="text-gray-20 mb-4 text-xs">
                      Supported formats: .xlsx, .xls
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-primary hover:bg-blue-10 text-white rounded-md transition text-sm font-semibold"
                    >
                      Select File
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-green-20 border border-green-10 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="text-green-10"
                          size="lg"
                        />
                        <div>
                          <p className="font-semibold text-green-30 text-sm">
                            {file.name}
                          </p>
                          <p className="text-xs text-green-10">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setFile(null)}
                        className="text-green-10 hover:text-green-30 text-lg"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleBackToProducts}
                  className="flex-1 px-4 py-2 border border-gray-line text-gray-10 rounded-md hover:bg-gray-70 transition text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!file || !sellerId || isUploading}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-blue-10 disabled:bg-gray-20 text-white rounded-md transition flex items-center justify-center gap-2 text-sm font-semibold"
                >
                  {isUploading && (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  )}
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Template Download & Instructions */}
            <div>
              {/* Download Template Section */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-10 mb-2 uppercase">
                  Get Started
                </label>
                <button
                  onClick={downloadTemplate}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-40 hover:bg-blue-30 text-blue-00 rounded-md transition text-sm font-semibold border border-blue-20"
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Download Template
                </button>
              </div>

              {/* Instructions */}
              <div className="p-4 bg-blue-40 border border-blue-20 rounded-md">
                <h3 className="font-semibold text-blue-00 mb-3 text-sm">
                  How to use bulk upload:
                </h3>
                <ul className="text-xs text-blue-10 space-y-2 list-disc list-inside">
                  <li>Download the template to see the required format</li>
                  <li>Fill in your product data following the template</li>
                  <li>Each row represents a product variant</li>
                  <li>Products with the same product_no will be grouped as variants</li>
                  <li>SKU must be unique across all products</li>
                  <li><strong>Image URLs:</strong> Use comma-separated URLs in image_src column (e.g., image1.jpg,image2.jpg)</li>
                  <li><strong>Alt Text:</strong> Add corresponding alt text in image_alt column (e.g., front view,back view)</li>
                  <li><strong>Variant Images:</strong> Use variant_image for variant-specific images with variant_image_alt for alt text</li>
                  <li>Alt text is optional - if not provided, the image filename will be used as fallback</li>
                  <li>Upload the completed Excel file</li>
                  <li>Supported formats: .xlsx, .xls</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Upload Results */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-black mb-6">
              Upload Results
            </h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-6 border-2 border-gray-line rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-10 font-semibold uppercase mb-1">
                      Total Products
                    </p>
                    <p className="text-xs text-gray-20">
                      Processed
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {uploadResult.data?.summary?.total_products || 0}
                  </p>
                </div>
              </div>
              <div className="p-6 border-2 border-green-10 rounded-lg bg-green-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-30 font-semibold uppercase mb-1">
                      Successful
                    </p>
                    <p className="text-xs text-green-10">
                      Products created
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-green-30">
                    {uploadResult.data?.summary?.successful_count || 0}
                  </p>
                </div>
              </div>
              <div className="p-6 border-2 border-red-300 rounded-lg bg-red-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-red-600 font-semibold uppercase mb-1">
                      Failed
                    </p>
                    <p className="text-xs text-red-500">
                      Validation errors
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-red-600">
                    {uploadResult.data?.summary?.failed_count || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Success Rate */}
            {uploadResult.data?.summary && (
              <div className="mb-8 p-4 bg-blue-40 border border-blue-20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-00">Success Rate</p>
                    <p className="text-xs text-blue-10 mt-1">
                      {uploadResult.data.summary.total_products > 0
                        ? ((uploadResult.data.summary.successful_count / uploadResult.data.summary.total_products) * 100).toFixed(1)
                        : 0}% of products uploaded successfully
                    </p>
                  </div>
                  <div className="w-32 h-2 bg-blue-20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-10 transition-all"
                      style={{
                        width: `${uploadResult.data.summary.total_products > 0
                          ? (uploadResult.data.summary.successful_count / uploadResult.data.summary.total_products) * 100
                          : 0}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Results Details */}
            {uploadResult.data?.successful && uploadResult.data?.failed && (
              <div className="mb-8">
                <h3 className="font-semibold text-black mb-4 text-sm">
                  Detailed Results:
                </h3>
                
                <div className="grid grid-cols-2 gap-6">
                  {/* Successful Results - Left Column */}
                  <div>
                    {uploadResult.data.successful.length > 0 ? (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-green-10" />
                          <h4 className="font-semibold text-green-10 text-sm">
                            Successful ({uploadResult.data.successful.length})
                          </h4>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {uploadResult.data.successful.map((result, index) => (
                            <div
                              key={index}
                              className="p-4 rounded-lg border-2 border-green-10 flex items-start justify-between"
                            >
                              <div className="flex-1">
                                <p className="font-semibold text-primary text-sm">
                                  {result.product_name}
                                </p>
                                <p className="text-xs text-green-10 mt-1">
                                  Product ID: {result.product_id}
                                </p>
                                {result.variants && result.variants.length > 0 && (
                                  <p className="text-xs text-green-10 mt-1">
                                    SKUs: {result.variants.map(v => v.sku).join(", ")}
                                  </p>
                                )}
                              </div>
                              {result.variants_count && (
                                <span className="ml-3 px-3 py-1 bg-green-10 text-white rounded-full text-xs font-semibold whitespace-nowrap">
                                  {result.variants_count} variant{result.variants_count !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="p-4 rounded-lg bg-gray-bg border border-gray-line text-center">
                        <p className="text-xs text-gray-10">No successful uploads</p>
                      </div>
                    )}
                  </div>

                  {/* Failed Results - Right Column */}
                  <div>
                    {uploadResult.data.failed.length > 0 ? (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <FontAwesomeIcon icon={faExclamationCircle} className="text-red-500" />
                          <h4 className="font-semibold text-red-500 text-sm">
                            Failed ({uploadResult.data.failed.length})
                          </h4>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {uploadResult.data.failed.map((result, index) => (
                            <div
                              key={index}
                              className="p-4 rounded-lg border-2 border-red-200 bg-red-50"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <p className="font-semibold text-primary text-sm">
                                  {result.product_name}
                                </p>
                                {result.variants_count && (
                                  <span className="ml-3 px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold whitespace-nowrap border border-red-200">
                                    {result.variants_count} variant{result.variants_count !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                              <div className="mt-2">
                                {result.errors && result.errors.length > 0 ? (
                                  <ul className="text-xs text-red-600 space-y-1 list-disc list-inside">
                                    {result.errors.map((error, errIdx) => (
                                      <li key={errIdx} className="break-words">
                                        {error}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-xs text-red-600">
                                    {result.reason}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="p-4 rounded-lg bg-gray-bg border border-gray-line text-center">
                        <p className="text-xs text-gray-10">No failed uploads</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-line">
            <button
              onClick={downloadLog}
              className="px-6 py-2 bg-green-10 hover:bg-green-30 text-white rounded-md transition text-sm font-semibold flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faDownload} />
              Download Report
            </button>
            <button
              onClick={resetUpload}
              className="px-6 py-2 border-2 border-gray-line text-gray-10 rounded-md hover:bg-gray-70 transition text-sm font-semibold"
            >
              Upload Another File
            </button>
            <button
              onClick={handleBackToProducts}
              className="px-6 py-2 bg-primary hover:bg-blue-10 text-white rounded-md transition text-sm font-semibold"
            >
              Back to Products
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
