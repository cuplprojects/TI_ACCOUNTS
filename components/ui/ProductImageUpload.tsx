"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEye, faTimes } from "@fortawesome/free-solid-svg-icons";

interface ProductImageUploadProps {
  onUpload?: (file: File) => void;
}

const ProductImageUpload: React.FC<ProductImageUploadProps> = ({
  onUpload,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      if (onUpload) {
        onUpload(file);
      }
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  return (
    <div>
      <h3 className="text-black title-4-semibold mb-4">Image</h3>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,model/gltf-binary,model/gltf+json"
        onChange={handleFileChange}
        className="hidden"
      />

      {preview ? (
        <div className="bg-blue-80 border-2 border-dashed border-gray-line h-[150px] rounded-md relative">
          <div className="relative w-full h-full flex items-center justify-center p-3">
            <Image
              src={preview}
              alt="Preview"
              width={500}
              height={500}
              className="max-w-full max-h-full object-contain rounded-lg"
              style={{ objectFit: "contain" }}
            />
            <div className="absolute top-2 right-2 flex space-x-2">
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-white bg-red-500 p-1 rounded-full h-6 w-6 flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faTrash} className="xsmall" />
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="text-white bg-blue-500 p-1 rounded-full h-6 w-6 flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faEye} className="xsmall" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-80 border-2 border-dashed border-gray-line h-[150px] rounded-md flex flex-col items-center justify-center">
          <div className="flex">
            <button
              onClick={handleUploadClick}
              className="px-4 py-2 bg-primary text-white rounded-md xsmall-semibold mr-2"
            >
              Upload Now
            </button>
            <button className="px-4 py-2 bg-white text-gray-10 custom-border-3 rounded-md xsmall-semibold">
              Select Existing
            </button>
          </div>
          <p className="text-gray-10 xsmall mt-2">
            Accepts Images, Videos or 3D models
          </p>
        </div>
      )}

      {/* Fullscreen Modal */}
      {fullscreen && preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={toggleFullscreen}
          style={{ zIndex: 1000, backgroundColor: "rgba(0, 0, 0, 0.8)" }}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <Image
              src={preview}
              alt="Preview Fullscreen"
              width={1200}
              height={1200}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 text-white bg-red-500 p-2 rounded-full h-10 w-10 flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faTimes} className="text-lg" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageUpload;
