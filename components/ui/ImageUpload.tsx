"use client";

import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEye, faTimes } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

interface ImageUploadProps {
  onUpload?: (file: File) => void;
  initialPreview?: string | null;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  initialPreview,
}) => {
  const [preview, setPreview] = useState<string | null>(initialPreview || null);
  const [fullscreen, setFullscreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when initialPreview changes
  useEffect(() => {
    if (initialPreview) {
      setPreview(initialPreview);
    }
  }, [initialPreview]);

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
    // Also reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Reset the onUpload with null
    if (onUpload) {
      // Since we can't upload null as a File, we just don't call onUpload
      // If needed, implement a separate onRemove callback in the props
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm custom-border-1">
      <h3 className="text-black title-4-semibold mb-4">Image</h3>
      <div className="h-[200px] bg-blue-80 border-dashed border-2 border-gray-line rounded-lg text-center flex flex-col justify-center items-center relative overflow-hidden">
        {preview ? (
          <div className="relative w-full h-full flex items-center justify-center p-3">
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={preview}
                alt="Preview"
                width={500}
                height={500}
                className="max-w-full max-h-full object-contain rounded-lg"
                style={{ objectFit: "contain" }}
              />
            </div>
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
        ) : (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="image-upload"
            />
            <button
              type="button"
              onClick={handleButtonClick}
              className="px-4 py-2 bg-blue-00 text-white small rounded-md mb-2"
            >
              Add Image
            </button>
            <p className="text-gray-30 xsmall">Or drop an image to upload</p>
          </>
        )}
      </div>

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

export default ImageUpload;
