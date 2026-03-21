"use client";

import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudArrowUp,
  faTrash,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import Button from "@/app/components/common/Button";
import Image from "next/image";
import { showErrorMessage } from "@/app/lib/swalConfig";

interface UploadImageComponentProps {
  title?: string;
  onCancel?: () => void;
  onUpload?: (file: File) => void;
  maxSize?: number; // In MB
  acceptedFormats?: string[];
}

export default function UploadImageComponent({
  title = "Upload - Left Image",
  onCancel = () => {},
  onUpload = () => {},
  maxSize = 25,
  acceptedFormats = [".jpeg", ".jpg", ".png"],
}: UploadImageComponentProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Check file type
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    const isValidType = acceptedFormats.includes(extension);

    // Check file size (convert MB to bytes)
    const isValidSize = file.size <= maxSize * 1024 * 1024;

    if (!isValidType) {
      showErrorMessage(
        `Invalid file type. Please upload ${acceptedFormats.join(
          " or "
        )} files.`
      );
      return;
    }

    if (!isValidSize) {
      showErrorMessage(`File is too large. Maximum size is ${maxSize}MB.`);
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result as string);
    };
    fileReader.readAsDataURL(file);
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleDone = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    } else {
      showErrorMessage("Please select a file to upload.");
    }
  };

  const handleDelete = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="banner-upload-container w-full max-w-2xl mx-auto">
      <h2 className="title-4-semibold mb-2">{title}</h2>
      <p className="body-text text-gray-30 mb-6">
        Please upload file in jpeg or png format and make sure the file size is
        under {maxSize} MB.
      </p>

      <div
        className={`custom-border-2 border-dashed rounded-lg p-8 mb-6 flex flex-col items-center justify-center bg-tertiary
          ${
            dragActive ? "border-primary" : "border-secondary"
          } h-[200px] overflow-auto`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="relative mb-2 w-full max-w-xs mx-auto">
              <Image
                src={previewUrl}
                alt="Preview"
                className="rounded-md max-h-[100px] max-w-full mx-auto object-contain"
                width={100}
                height={100}
              />
              <div className="absolute -top-5 -right-2 flex gap-2">
                <button
                  onClick={() => setShowFullPreview(true)}
                  className="bg-blue-500 text-white rounded-full hover:bg-blue-600 w-6 h-6 flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faEye} className="h-3 w-3" />
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-500 text-white rounded-full hover:bg-red-600 w-6 h-6 flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                </button>
              </div>
            </div>
            <p className="text-center xsmall text-gray-30 mb-1 truncate max-w-xs">
              {selectedFile?.name}
            </p>
            <p className="text-center xsmall text-gray-30">
              {selectedFile
                ? (selectedFile.size / (1024 * 1024)).toFixed(2) + " MB"
                : ""}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="mb-4 text-primary">
              <FontAwesomeIcon icon={faCloudArrowUp} className="text-2xl" />
            </div>
            <p className="xsmall-semibold mb-2 text-heading">
              Drop file or browse
            </p>
            <p className="text-black xsmall mb-4 text-center">
              Format: .jpeg, .png & Max file size: {maxSize} MB
            </p>

            <button
              onClick={handleButtonClick}
              className="bg-primary text-white py-1 px-3 rounded-md small-semibold hover:bg-opacity-90 transition-colors"
            >
              Browse Files
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={acceptedFormats.join(",")}
          onChange={handleFileChange}
        />
      </div>

      <div className="flex gap-4">
        <Button
          variant="secondary"
          onClick={onCancel}
          fullWidth
          className="py-3 px-6"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleDone}
          fullWidth
          className="py-3 px-6"
        >
          Done
        </Button>
      </div>

      {/* Full Image Preview Modal */}
      {showFullPreview && previewUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowFullPreview(false)}
        >
          <div className="relative bg-white p-4 rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <button
              onClick={() => setShowFullPreview(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="mt-6 mb-2">
              <img
                src={previewUrl}
                alt="Full Preview"
                className="max-w-full max-h-[70vh] mx-auto"
              />
            </div>
            <p className="text-center mt-2 text-sm text-gray-600">
              {selectedFile?.name} (
              {selectedFile
                ? (selectedFile.size / (1024 * 1024)).toFixed(2) + " MB"
                : ""}
              )
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
