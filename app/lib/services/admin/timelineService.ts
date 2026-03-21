import axiosInstance from "../../axiosConfig";
import {
  showSuccessMessage,
  showErrorMessage,
  showLoading,
  closeLoading,
} from "../../swalConfig";
import { AxiosError } from "axios";
import { uploadImagesWithPresignedUrls } from "../presignedUrlService";

// Timeline interfaces
export interface TimelineAttachment {
  id: number;
  url: string;
  filename?: string;
}

export interface OrderTimeline {
  id: string;
  order_id: string;
  event: string;
  details: string;
  is_automated: boolean;
  attached_files: TimelineAttachment[] | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTimelineData {
  details: string;
  attached_files?: { url: string; filename: string }[];
}

// API response interface
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

/**
 * Get order timelines
 */
export const getOrderTimelines = async (
  orderId: string
): Promise<OrderTimeline[] | null> => {
  try {
    const response = await axiosInstance.get<ApiResponse<OrderTimeline[]>>(
      `/admin/order/get-timelines/${orderId}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      showErrorMessage(response.data.message || "Failed to load timelines");
      return null;
    }
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error loading timelines"
      );
    } else {
      showErrorMessage("Failed to load timelines. Please try again later.");
    }
    return null;
  }
};

/**
 * Create order timeline with attachments
 */
export const createOrderTimeline = async (
  orderId: string,
  details: string,
  attachmentFiles: File[] = []
): Promise<OrderTimeline | null> => {
  try {
    showLoading("Creating timeline entry...");

    let attachedFiles: { url: string; filename: string }[] = [];

    // Upload files if provided
    if (attachmentFiles.length > 0) {
      console.log(`Uploading ${attachmentFiles.length} attachment files...`);

      const uploadedFiles = await uploadImagesWithPresignedUrls(
        attachmentFiles,
        `timeline-attachments/${orderId}`,
        "admin"
      );

      if (!uploadedFiles) {
        closeLoading();
        showErrorMessage("Failed to upload attachments");
        return null;
      }

      attachedFiles = uploadedFiles.map((file, index) => ({
        url: file.url,
        filename: file.originalName || attachmentFiles[index].name,
      }));
    }

    // Create timeline entry
    const timelineData: CreateTimelineData = {
      details,
      attached_files: attachedFiles.length > 0 ? attachedFiles : undefined,
    };

    const response = await axiosInstance.post<ApiResponse<OrderTimeline>>(
      `/admin/order/create-timeline/${orderId}`,
      timelineData
    );

    closeLoading();

    if (response.data.success && response.data.data) {
      showSuccessMessage("Timeline entry created successfully");
      return response.data.data;
    } else {
      showErrorMessage(
        response.data.message || "Failed to create timeline entry"
      );
      return null;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error creating timeline entry"
      );
    } else {
      showErrorMessage(
        "Failed to create timeline entry. Please try again later."
      );
    }
    return null;
  }
};

/**
 * Delete order timeline
 */
export const deleteOrderTimeline = async (
  timelineId: string
): Promise<boolean> => {
  try {
    showLoading("Deleting timeline entry...");
    const response = await axiosInstance.delete<ApiResponse<null>>(
      `/admin/order/delete-timeline/${timelineId}`
    );
    closeLoading();

    if (response.data.success) {
      showSuccessMessage("Timeline entry deleted successfully");
      return true;
    } else {
      showErrorMessage(
        response.data.message || "Failed to delete timeline entry"
      );
      return false;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error deleting timeline entry"
      );
    } else {
      showErrorMessage(
        "Failed to delete timeline entry. Please try again later."
      );
    }
    return false;
  }
};

/**
 * Delete timeline attachment
 */
export const deleteTimelineAttachment = async (
  timelineId: string,
  attachmentId: number
): Promise<OrderTimeline | null> => {
  try {
    showLoading("Deleting attachment...");
    const response = await axiosInstance.delete<ApiResponse<OrderTimeline>>(
      `/admin/order/delete-timeline-attachment/${timelineId}/${attachmentId}`
    );
    closeLoading();

    if (response.data.success && response.data.data) {
      showSuccessMessage("Attachment deleted successfully");
      return response.data.data;
    } else {
      showErrorMessage(response.data.message || "Failed to delete attachment");
      return null;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error deleting attachment"
      );
    } else {
      showErrorMessage("Failed to delete attachment. Please try again later.");
    }
    return null;
  }
};

/**
 * Validate attachment files
 */
export const validateAttachmentFiles = (
  files: File[]
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  const maxFiles = 5;
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "application/pdf",
  ];

  if (files.length > maxFiles) {
    errors.push(`Maximum ${maxFiles} files allowed`);
  }

  files.forEach((file, index) => {
    if (file.size > maxFileSize) {
      errors.push(
        `File ${index + 1} (${file.name}) is too large. Maximum size is 10MB`
      );
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(
        `File ${index + 1} (${
          file.name
        }) has unsupported format. Only images and PDF files are allowed`
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};
