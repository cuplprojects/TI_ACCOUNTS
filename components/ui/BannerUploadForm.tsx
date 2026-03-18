"use client";

import React, { useState, useCallback } from "react";
import PresignedImageUpload from "./PresignedImageUpload";

interface BannerUploadFormProps {
  title?: string;
  desktopImages: { url: string; originalName: string }[];
  mobileImages: { url: string; originalName: string }[];
  onDesktopImagesChange: (
    images: { url: string; originalName: string }[]
  ) => void;
  onMobileImagesChange: (
    images: { url: string; originalName: string }[]
  ) => void;
  useSameForBoth: boolean;
  onUseSameForBothChange: (value: boolean) => void;
  disabled?: boolean;
  maxImages?: number;
}

const BannerUploadForm: React.FC<BannerUploadFormProps> = ({
  title = "Banner Images",
  desktopImages,
  mobileImages,
  onDesktopImagesChange,
  onMobileImagesChange,
  useSameForBoth,
  onUseSameForBothChange,
  disabled = false,
  maxImages = 8,
}) => {
  const [uploadErrors, setUploadErrors] = useState<{
    desktop?: string;
    mobile?: string;
  }>({});

  const handleDesktopUploadComplete = useCallback(
    (uploadedImages: { url: string; originalName: string }[]) => {
      onDesktopImagesChange(uploadedImages);

      // If "use same for both" is enabled, also update mobile images
      if (useSameForBoth) {
        onMobileImagesChange(uploadedImages);
      }

      setUploadErrors((prev) => ({ ...prev, desktop: undefined }));
    },
    [onDesktopImagesChange, onMobileImagesChange, useSameForBoth]
  );

  const handleMobileUploadComplete = useCallback(
    (uploadedImages: { url: string; originalName: string }[]) => {
      // Only update mobile images if "use same for both" is disabled
      if (!useSameForBoth) {
        onMobileImagesChange(uploadedImages);
      }

      setUploadErrors((prev) => ({ ...prev, mobile: undefined }));
    },
    [onMobileImagesChange, useSameForBoth]
  );

  const handleDesktopUploadError = useCallback((error: string) => {
    setUploadErrors((prev) => ({ ...prev, desktop: error }));
  }, []);

  const handleMobileUploadError = useCallback((error: string) => {
    setUploadErrors((prev) => ({ ...prev, mobile: error }));
  }, []);

  const handleUseSameForBothChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      onUseSameForBothChange(checked);

      // If enabling "use same for both", copy desktop images to mobile
      if (checked && desktopImages.length > 0) {
        onMobileImagesChange(desktopImages);
      }
    },
    [onUseSameForBothChange, desktopImages, onMobileImagesChange]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>

        {/* Use Same for Both Toggle */}
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useSameForBoth}
            onChange={handleUseSameForBothChange}
            disabled={disabled}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Use same images for both devices
          </span>
        </label>
      </div>

      {/* Desktop Images */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <PresignedImageUpload
          title="Desktop Images"
          maxFiles={maxImages}
          keyPrefix="banners/temp"
          role="admin"
          onUploadComplete={handleDesktopUploadComplete}
          onUploadError={handleDesktopUploadError}
          initialImages={desktopImages}
          disabled={disabled}
          maxSizeInMB={25}
          allowedTypes={[
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
          ]}
        />
        {uploadErrors.desktop && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{uploadErrors.desktop}</p>
          </div>
        )}
      </div>

      {/* Mobile Images */}
      {!useSameForBoth && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <PresignedImageUpload
            title="Mobile Images"
            maxFiles={maxImages}
            keyPrefix="banners/temp"
            role="admin"
            onUploadComplete={handleMobileUploadComplete}
            onUploadError={handleMobileUploadError}
            initialImages={mobileImages}
            disabled={disabled}
            maxSizeInMB={25}
            allowedTypes={[
              "image/jpeg",
              "image/jpg",
              "image/png",
              "image/gif",
              "image/webp",
            ]}
          />
          {uploadErrors.mobile && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{uploadErrors.mobile}</p>
            </div>
          )}
        </div>
      )}

      {/* Usage Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Banner Image Guidelines
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Desktop images should be in landscape orientation
                  (recommended: 1920x600px)
                </li>
                <li>
                  Mobile images should be in portrait or square orientation
                  (recommended: 600x800px)
                </li>
                <li>Use high-quality images with clear text and visuals</li>
                <li>
                  Keep file sizes under 25MB for optimal loading performance
                </li>
                <li>Supported formats: JPEG, PNG, GIF, WebP</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="text-sm font-medium text-gray-800 mb-2">
          Upload Summary
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Desktop Images:</span>
            <span className="ml-2 font-medium text-gray-800">
              {desktopImages.length} / {maxImages}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Mobile Images:</span>
            <span className="ml-2 font-medium text-gray-800">
              {useSameForBoth
                ? `${desktopImages.length} (same as desktop)`
                : `${mobileImages.length} / ${maxImages}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerUploadForm;
