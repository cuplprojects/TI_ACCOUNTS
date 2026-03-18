"use client";

import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudArrowUp,
  faTrash,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { showErrorMessage } from "@/app/lib/swalConfig";
import ImageModal from "@/app/components/common/ImageModal";

interface BannerUploadComponentProps {
  title: string;
  description?: string;
  onUpload: (file: File) => void;
  previewUrl?: string;
  onDelete?: () => void;
  maxSize?: number;
  acceptedFormats?: string[];
  isUploading?: boolean;
}

export default function BannerUploadComponent({
  title,
  description,
  onUpload,
  previewUrl,
  onDelete,
  maxSize = 25,
  acceptedFormats = [".jpeg", ".jpg", ".png", ".gif", ".webp"],
  isUploading = false,
}: BannerUploadComponentProps) {
  const [dragActive, setDragActive] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndUpload(file);
    }
  };

  const validateAndUpload = (file: File) => {
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    const isValidType = acceptedFormats.includes(extension);
    const isValidSize = file.size <= maxSize * 1024 * 1024;

    if (!isValidType) {
      showErrorMessage(
        `Invalid file type. Please upload ${acceptedFormats.join(" or ")} files.`
      );
      return;
    }

    if (!isValidSize) {
      showErrorMessage(`File is too large. Maximum size is ${maxSize}MB.`);
      return;
    }

    onUpload(file);
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {title}
      </label>
      {description && (
        <p className="text-xs text-gray-500 mb-3">{description}</p>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-all ${
          dragActive
            ? "border-primary"
            : "border-gray-line"
        } ${previewUrl ? "h-auto" : "h-48"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <div className="flex flex-col items-center justify-center w-full">
            <div className="relative mb-4 w-full max-w-xs mx-auto">
              <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden relative">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -top-3 -right-3 flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowFullPreview(true);
                  }}
                  disabled={isUploading}
                  className="bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 w-8 h-8 flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete();
                  }}
                  disabled={isUploading}
                  className="bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50 w-8 h-8 flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-center text-xs text-gray-600 mt-2">
              {isUploading ? "Uploading..." : "Image selected"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="mb-3 text-primary">
              <FontAwesomeIcon icon={faCloudArrowUp} className="text-3xl" />
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Drop file or browse
            </p>
            <p className="text-xs text-gray-600 mb-4 text-center">
              Format: PNG, JPG, GIF, WebP • Max {maxSize}MB
            </p>
            <button
              type="button"
              onClick={handleButtonClick}
              disabled={isUploading}
              className="bg-primary text-white py-2 px-4 rounded-md text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              {isUploading ? "Uploading..." : "Browse Files"}
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={acceptedFormats.join(",")}
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>

      {/* Full Image Preview Modal */}
      <ImageModal
        isOpen={showFullPreview}
        imageUrl={previewUrl || ""}
        fileName={title}
        onClose={() => setShowFullPreview(false)}
      />
    </div>
  );
}
