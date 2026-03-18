"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudUpload,
  faTrash,
  faEye,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import {
  uploadImagesWithPresignedUrls,
  validateFile,
} from "@/app/lib/services/presignedUrlService";

interface PresignedImageUploadProps {
  title?: string;
  maxFiles?: number;
  maxSizeInMB?: number;
  allowedTypes?: string[];
  keyPrefix: string;
  role: "admin" | "seller";
  onUploadComplete?: (
    uploadedImages: { url: string; originalName: string }[]
  ) => void;
  onUploadError?: (error: string) => void;
  initialImages?: { url: string; originalName: string }[];
  disabled?: boolean;
}

interface FileWithPreview extends File {
  preview?: string;
  uploadProgress?: number;
  uploadStatus?: "pending" | "uploading" | "success" | "error";
  uploadError?: string;
}

const PresignedImageUpload: React.FC<PresignedImageUploadProps> = ({
  title = "Upload Images",
  maxFiles = 10,
  maxSizeInMB = 10,
  allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ],
  keyPrefix,
  role,
  onUploadComplete,
  onUploadError,
  initialImages = [],
  disabled = false,
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploadedImages, setUploadedImages] =
    useState<{ url: string; originalName: string }[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (newFiles: FileList | File[]) => {
      if (disabled) return;

      const fileArray = Array.from(newFiles);
      const validFiles: FileWithPreview[] = [];

      for (const file of fileArray) {
        // Check if we would exceed max files
        if (
          files.length + uploadedImages.length + validFiles.length >=
          maxFiles
        ) {
          if (onUploadError) {
            onUploadError(`Maximum ${maxFiles} files allowed`);
          }
          break;
        }

        // Validate file
        const validation = validateFile(file, maxSizeInMB, allowedTypes);
        if (!validation.valid) {
          if (onUploadError) {
            onUploadError(`${file.name}: ${validation.error}`);
          }
          continue;
        }

        // Create preview
        const fileWithPreview = file as FileWithPreview;
        fileWithPreview.preview = URL.createObjectURL(file);
        fileWithPreview.uploadStatus = "pending";
        validFiles.push(fileWithPreview);
      }

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
      }
    },
    [
      files.length,
      uploadedImages.length,
      maxFiles,
      maxSizeInMB,
      allowedTypes,
      disabled,
      onUploadError,
    ]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled) return;

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        handleFiles(droppedFiles);
      }
    },
    [handleFiles, disabled]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
      // Reset input value to allow selecting the same file again
      e.target.value = "";
    },
    [handleFiles]
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const fileToRemove = newFiles[index];
      if (fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  }, []);

  const removeUploadedImage = useCallback((index: number) => {
    setUploadedImages((prev) => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      return newImages;
    });
  }, []);

  const uploadFiles = useCallback(async () => {
    if (files.length === 0 || isUploading || disabled) return;

    setIsUploading(true);

    try {
      // Update file status to uploading
      setFiles((prev) =>
        prev.map((file) => ({ ...file, uploadStatus: "uploading" as const }))
      );

      const filesToUpload = files.filter((f) => f.uploadStatus === "uploading");

      const uploadedResults = await uploadImagesWithPresignedUrls(
        filesToUpload,
        keyPrefix,
        role,
        (fileIndex, progress) => {
          setFiles((prev) =>
            prev.map((file, index) =>
              index === fileIndex ? { ...file, uploadProgress: progress } : file
            )
          );
        }
      );

      if (uploadedResults) {
        // Update file status to success
        setFiles((prev) =>
          prev.map((file) => ({ ...file, uploadStatus: "success" as const }))
        );

        // Add to uploaded images
        const newUploadedImages = [...uploadedImages, ...uploadedResults];
        setUploadedImages(newUploadedImages);

        // Clear files after successful upload
        setTimeout(() => {
          setFiles([]);
        }, 1000);

        if (onUploadComplete) {
          onUploadComplete(newUploadedImages);
        }
      } else {
        // Update file status to error
        setFiles((prev) =>
          prev.map((file) => ({
            ...file,
            uploadStatus: "error" as const,
            uploadError: "Upload failed",
          }))
        );

        if (onUploadError) {
          onUploadError("Failed to upload one or more files");
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      setFiles((prev) =>
        prev.map((file) => ({
          ...file,
          uploadStatus: "error" as const,
          uploadError: error instanceof Error ? error.message : "Upload failed",
        }))
      );

      if (onUploadError) {
        onUploadError("Upload failed. Please try again.");
      }
    } finally {
      setIsUploading(false);
    }
  }, [
    files,
    isUploading,
    disabled,
    keyPrefix,
    role,
    uploadedImages,
    onUploadComplete,
    onUploadError,
  ]);

  const getStatusIcon = (status: FileWithPreview["uploadStatus"]) => {
    switch (status) {
      case "uploading":
        return (
          <FontAwesomeIcon
            icon={faSpinner}
            className="animate-spin text-blue-500"
          />
        );
      case "success":
        return (
          <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
        );
      case "error":
        return (
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="text-red-500"
          />
        );
      default:
        return null;
    }
  };

  const canAddMore = uploadedImages.length + files.length < maxFiles;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <span className="text-sm text-gray-500">
          {uploadedImages.length + files.length}/{maxFiles} files
        </span>
      </div>

      {/* Upload Area */}
      {canAddMore && !disabled && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDrag}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
        >
          <FontAwesomeIcon
            icon={faCloudUpload}
            className={`text-4xl mb-4 ${
              dragActive ? "text-blue-500" : "text-gray-400"
            }`}
          />
          <p className="text-gray-600 mb-2">
            Drag & drop images here, or{" "}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-500 hover:text-blue-600 underline"
            >
              browse
            </button>
          </p>
          <p className="text-sm text-gray-500">
            Max {maxSizeInMB}MB per file •{" "}
            {allowedTypes.map((type) => type.split("/")[1]).join(", ")}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedTypes.join(",")}
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={uploadFiles}
            disabled={isUploading || disabled}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isUploading || disabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {isUploading ? (
              <>
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="animate-spin mr-2"
                />
                Uploading...
              </>
            ) : (
              `Upload ${files.length} file${files.length === 1 ? "" : "s"}`
            )}
          </button>
        </div>
      )}

      {/* Files Preview */}
      {files.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-2">
            Files to Upload
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <div
                key={index}
                className="relative group border rounded-lg overflow-hidden"
              >
                <div className="aspect-square bg-gray-100">
                  {file.preview && (
                    <Image
                      src={file.preview}
                      alt={file.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                {/* Status Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-center text-white">
                    <div className="mb-2">
                      {getStatusIcon(file.uploadStatus)}
                    </div>
                    {file.uploadProgress !== undefined &&
                      file.uploadStatus === "uploading" && (
                        <div className="text-xs">
                          {Math.round(file.uploadProgress)}%
                        </div>
                      )}
                    {file.uploadError && (
                      <div className="text-xs text-red-300">
                        {file.uploadError}
                      </div>
                    )}
                  </div>
                </div>

                {/* Remove Button */}
                {!isUploading && file.uploadStatus !== "success" && (
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-xs" />
                  </button>
                )}

                {/* File Name */}
                <div className="p-2 bg-white">
                  <p
                    className="text-xs text-gray-600 truncate"
                    title={file.name}
                  >
                    {file.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-2">
            Uploaded Images
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image, index) => (
              <div
                key={index}
                className="relative group border rounded-lg overflow-hidden"
              >
                <div className="aspect-square bg-gray-100">
                  <Image
                    src={image.url}
                    alt={image.originalName}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Action Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setFullscreenImage(image.url)}
                      className="p-2 bg-white bg-opacity-20 text-white rounded-full hover:bg-opacity-30 transition-colors"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    {!disabled && (
                      <button
                        onClick={() => removeUploadedImage(index)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Image Name */}
                <div className="p-2 bg-white">
                  <p
                    className="text-xs text-gray-600 truncate"
                    title={image.originalName}
                  >
                    {image.originalName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <div className="relative max-w-full max-h-full">
            <Image
              src={fullscreenImage}
              alt="Fullscreen view"
              width={1200}
              height={800}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 text-white rounded-full hover:bg-opacity-30 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresignedImageUpload;
