import axiosInstance from "../axiosConfig";
import { getAuthToken } from "../config";
import {
  showSuccessMessage,
  showErrorMessage,
  showLoading,
  closeLoading,
} from "../swalConfig";
import axios, { AxiosError } from "axios";

// Base interfaces for presigned URL requests and responses
export interface PresignedUrlRequest {
  key: string;
  filename: string;
}

export interface PresignedUrlResponse {
  key: string;
  url: string;
  originalName: string;
}

export interface GetPresignedUrlsRequest {
  count: number;
  keys: PresignedUrlRequest[];
}

export interface GetPresignedUrlsResponse {
  success: boolean;
  message: string;
  data: PresignedUrlResponse[];
}

export interface DeleteFilesRequest {
  keys: string[];
}

export interface DeleteFilesResponse {
  success: boolean;
  message: string;
  deletedFiles: string[];
  failedFiles?: string[];
}

// API Response interface
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

/**
 * Get presigned URLs for file uploads (Admin)
 */
export const getAdminPresignedUrls = async (
  request: GetPresignedUrlsRequest
): Promise<PresignedUrlResponse[] | null> => {
  try {
    const response = await axiosInstance.post<GetPresignedUrlsResponse>(
      "/admin/get-presigned-urls",
      request,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );

    if (response.data.success) {
      return response.data.data;
    } else {
      showErrorMessage(response.data.message || "Failed to get presigned URLs");
      return null;
    }
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Failed to get presigned URLs"
      );
    } else {
      showErrorMessage("Failed to get presigned URLs. Please try again later.");
    }
    return null;
  }
};

/**
 * Get presigned URLs for file uploads (Seller)
 */
export const getSellerPresignedUrls = async (
  request: GetPresignedUrlsRequest
): Promise<PresignedUrlResponse[] | null> => {
  try {
    const response = await axiosInstance.post<GetPresignedUrlsResponse>(
      "/seller/get-presigned-urls",
      request,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );

    if (response.data.success) {
      return response.data.data;
    } else {
      showErrorMessage(response.data.message || "Failed to get presigned URLs");
      return null;
    }
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Failed to get presigned URLs"
      );
    } else {
      showErrorMessage("Failed to get presigned URLs. Please try again later.");
    }
    return null;
  }
};

/**
 * Upload file to S3 using presigned URL with fetch API
 */
export const uploadFileToS3 = async (
  presignedUrl: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<boolean> => {
  try {
    console.log(`Presigned URL: ${presignedUrl}`);
    const response = await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type
      }
    });
    
    if (response.status !== 200) {
      console.error(`S3 Upload failed: ${response.status} ${response.statusText}`);
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    if (onProgress) {
      onProgress(100); // Set to 100% when complete
    }

    return true;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
};

/**
 * Upload multiple files to S3 using presigned URLs
 */
export const uploadMultipleFilesToS3 = async (
  uploads: { presignedUrl: string; file: File; originalName?: string }[],
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<{ success: boolean; results: boolean[] }> => {
  try {
    const uploadPromises = uploads.map(async (upload, index) => {
      try {
        const result = await uploadFileToS3(
          upload.presignedUrl,
          upload.file,
          onProgress ? (progress) => onProgress(index, progress) : undefined
        );
        return result;
      } catch (error) {
        console.error(
          `Failed to upload file ${upload.originalName || upload.file.name}:`,
          error
        );
        return false;
      }
    });

    const results = await Promise.all(uploadPromises);
    const success = results.every((result) => result === true);

    return { success, results };
  } catch (error) {
    console.error("Error uploading multiple files:", error);
    return { success: false, results: [] };
  }
};

/**
 * Delete files from S3 (Admin)
 */
export const deleteAdminFiles = async (
  keys: string[],
  showMessages: boolean = true
): Promise<DeleteFilesResponse | null> => {
  try {
    if (showMessages) {
      showLoading("Deleting files...");
    }

    const response = await axiosInstance.delete<DeleteFilesResponse>(
      "/admin/delete-files",
      {
        data: { keys },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );

    if (showMessages) {
      closeLoading();
    }

    if (response.data.success) {
      if (showMessages) {
        showSuccessMessage(response.data.message || "Files deleted successfully");
      }
      return response.data;
    } else {
      if (showMessages) {
        showErrorMessage(response.data.message || "Failed to delete files");
      }
      return response.data;
    }
  } catch (error) {
    if (showMessages) {
      closeLoading();
    }
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      if (showMessages) {
        showErrorMessage(
          axiosError.response.data?.message || "Failed to delete files"
        );
      }
    } else {
      if (showMessages) {
        showErrorMessage("Failed to delete files. Please try again later.");
      }
    }
    return null;
  }
};

/**
 * Delete files from S3 (Seller)
 */
export const deleteSellerFiles = async (
  keys: string[]
): Promise<DeleteFilesResponse | null> => {
  try {
    showLoading("Deleting files...");

    const response = await axiosInstance.delete<DeleteFilesResponse>(
      "/seller/delete-files",
      {
        data: { keys },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );

    closeLoading();

    if (response.data.success) {
      showSuccessMessage(response.data.message || "Files deleted successfully");
      return response.data;
    } else {
      showErrorMessage(response.data.message || "Failed to delete files");
      return response.data;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Failed to delete files"
      );
    } else {
      showErrorMessage("Failed to delete files. Please try again later.");
    }
    return null;
  }
};

/**
 * Extract clean URL from presigned URL (removes query parameters)
 */
export const getCleanUrl = (presignedUrl: string): string => {
  try {
    const url = new URL(presignedUrl);
    return `${url.protocol}//${url.host}${url.pathname}`;
  } catch (error) {
    console.error("Error parsing presigned URL:", error);
    return presignedUrl;
  }
};

/**
 * Validate file before upload
 */
export const validateFile = (
  file: File,
  maxSizeInMB = 10,
  allowedTypes: string[] = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/avif",
    "image/heic",
    "image/heif",
    "image/tiff",
    "image/bmp",
    "image/svg+xml",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ]
): { valid: boolean; error?: string } => {
  // Check file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeInMB}MB`,
    };
  }

  // Check file type - allow all image types or specific document types
  const isImage = file.type.startsWith("image/");
  const isAllowedDocument = allowedTypes.includes(file.type);
  
  if (!isImage && !isAllowedDocument) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}`,
    };
  }

  return { valid: true };
};

/**
 * Helper function to create presigned URL requests for images
 */
export const createImagePresignedRequests = (
  files: File[],
  keyPrefix: string
): PresignedUrlRequest[] => {
  console.log("Creating presigned requests with keyPrefix:", keyPrefix);
  console.log(
    "Files to upload:",
    files.map((f) => ({ name: f.name, size: f.size }))
  );

  // Ensure keyPrefix is valid
  const validKeyPrefix =
    keyPrefix && keyPrefix !== "undefined" ? keyPrefix : "products/temp";
  console.log("Using keyPrefix:", validKeyPrefix);

  return files.map((file, index) => {
    // Clean filename to avoid special characters that might cause issues
    const cleanFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    console.log(`File ${index}: ${file.name} -> ${cleanFilename}`);

    return {
      key: validKeyPrefix,
      filename: cleanFilename,
    };
  });
};

/**
 * Complete upload workflow: Get presigned URLs, upload files, return clean URLs
 */
export const uploadImagesWithPresignedUrls = async (
  files: File[],
  keyPrefix: string,
  role: "admin" | "seller",
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<{ url: string; originalName: string; key: string }[] | null> => {
  try {
    if (files.length === 0) {
      return [];
    }

    console.log(
      `Starting upload process for ${files.length} files with keyPrefix: ${keyPrefix}`
    );

    // Image upload process will be handled silently
    // The calling code will show appropriate loading messages

    // Validate all files first
    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid) {
        throw new Error(`${file.name}: ${validation.error}`);
        return null;
      }
    }

    // Step 1: Get presigned URLs
    console.log("Step 1: Getting presigned URLs...");
    const presignedRequests = createImagePresignedRequests(files, keyPrefix);
    const request: GetPresignedUrlsRequest = {
      count: files.length,
      keys: presignedRequests,
    };

    console.log("Presigned URL request:", request);

    const presignedUrls =
      role === "admin"
        ? await getAdminPresignedUrls(request)
        : await getSellerPresignedUrls(request);

    if (!presignedUrls || presignedUrls.length === 0) {
      console.error("Failed to get presigned URLs");
      throw new Error("Failed to get presigned URLs");
      return null;
    }

    // Ensure we have the same number of presigned URLs as files
    if (presignedUrls.length !== files.length) {
   
      throw new Error("Upload configuration error. Please try again.");
      return null;
    }

    const uploads = files.map((file, index) => {
      const presignedUrl = presignedUrls[index];
      console.log(
        `Mapping file ${index}: ${file.name} -> ${presignedUrl.key} (${presignedUrl.originalName})`
      );

      return {
        presignedUrl: presignedUrl.url,
        file,
        originalName: presignedUrl.originalName,
        key: presignedUrl.key,
      };
    });

    console.log(
      "Upload configurations:",
      uploads.map((u) => ({
        url: u.presignedUrl.substring(0, 100) + "...",
        fileName: u.file.name,
        originalName: u.originalName,
        key: u.key,
      }))
    );

    const uploadResult = await uploadMultipleFilesToS3(uploads, onProgress);

    if (!uploadResult.success) {
      console.error("Upload to S3 failed:", uploadResult);
      throw new Error("Some files failed to upload. Please try again.");
      return null;
    }

    console.log("Step 2 completed: All files uploaded successfully");

    // Step 3: Return clean URLs with keys for API usage
    const cleanUrls = presignedUrls.map((presigned) => ({
      url: getCleanUrl(presigned.url),
      originalName: presigned.originalName,
      key: presigned.key,
    }));

    console.log("Step 3: Returning clean URLs:", cleanUrls);

    // Image upload completed successfully
    // The calling code will handle success/error messages

    return cleanUrls;
  } catch (error) {
    console.error("Error in complete upload workflow:", error);
    throw error; // Re-throw to let calling code handle the error
  }
};
