import axiosInstance from "../api/axios";
import { AxiosError } from "axios";

export interface ImageUploadResponse {
  success: boolean;
  url: string;
  message?: string;
}

/**
 * Upload image for rich text editor
 * @param file - Image file to upload
 * @param endpoint - API endpoint (admin or seller)
 * @returns Promise with image URL
 */
export const uploadEditorImage = async (
  file: File,
  endpoint: "admin" | "seller" = "admin"
): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const url =
      endpoint === "admin"
        ? "/admin/product/upload-editor-image"
        : "/seller/product/upload-editor-image";

    const response = await axiosInstance.post<ImageUploadResponse>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data.success && response.data.url) {
      return response.data.url;
    }

    throw new Error(response.data.message || "Failed to upload image");
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    console.error("Image upload error:", axiosError);
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to upload image"
    );
  }
};
