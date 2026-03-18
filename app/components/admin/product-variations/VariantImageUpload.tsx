"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faTimes } from "@fortawesome/free-solid-svg-icons";

interface VariantImageUploadProps {
  variantId: string;
  variantTitle: string;
  onImageSelect: (variantId: string, file: File) => void;
  onClose: () => void;
  currentImageUrl?: string;
}

const VariantImageUpload: React.FC<VariantImageUploadProps> = ({
  variantId,
  variantTitle,
  onImageSelect,
  onClose,
  currentImageUrl,
}) => {
  const [preview, setPreview] = useState<string | null>(
    currentImageUrl || null
  );
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleFile(file);
  };

  const handleFile = (file: File) => {
    if (!file.type.match("image.*")) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onImageSelect(variantId, file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    handleFile(file);
  };

  // Stop propagation of click events to prevent modal from closing
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full"
        onClick={handleModalClick}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="title-4-semibold">Image for {variantTitle}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            isDragging ? "border-primary bg-blue-50" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {preview ? (
            <div className="relative">
              <Image
                src={preview}
                alt={variantTitle}
                width={300}
                height={300}
                className="object-contain mx-auto max-h-48"
              />
              <button
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                onClick={() => setPreview(null)}
              >
                <FontAwesomeIcon icon={faTimes} className="text-gray-600" />
              </button>
            </div>
          ) : (
            <>
              <FontAwesomeIcon
                icon={faImage}
                className="h-12 w-12 text-gray-300 mb-2"
              />
              <p className="text-gray-500 mb-2">Drop your image here, or</p>
              <label className="inline-block bg-primary text-white py-2 px-4 rounded-md cursor-pointer small-semibold hover:bg-primary-dark">
                Browse files
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            </>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <button
            className="bg-primary text-white py-2 px-4 rounded-md small-semibold hover:bg-primary-dark"
            onClick={onClose}
          >
            {preview ? "Save" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VariantImageUpload;
