import axiosInstance from "../../axiosConfig";
import {
  showSuccessMessage,
  showErrorMessage,
  showLoading,
  closeLoading,
  showConfirmation,
} from "../../swalConfig";
import { AxiosError } from "axios";

// Tag interface
export interface Tag {
  id?: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Get all tags
export const getAllTags = async (): Promise<Tag[]> => {
  try {
    showLoading("Loading tags...");

    const response = await axiosInstance.get<ApiResponse<Tag[]>>(
      "/admin/tags/get-tags"
    );

    closeLoading();

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      showErrorMessage(response.data.message || "Failed to load tags");
      return [];
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error loading tags"
      );
    } else {
      showErrorMessage("Failed to load tags. Please try again later.");
    }

    return [];
  }
};

// Get single tag
export const getTag = async (tagId: string): Promise<Tag | null> => {
  try {
    showLoading("Loading tag details...");

    const response = await axiosInstance.get<ApiResponse<Tag>>(
      `/admin/tags/get-tag/${tagId}`
    );

    closeLoading();

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      showErrorMessage(response.data.message || "Tag not found");
      return null;
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error loading tag details"
      );
    } else {
      showErrorMessage("Failed to load tag details. Please try again later.");
    }

    return null;
  }
};

// Create tag
export const createTag = async (tag: Tag): Promise<boolean> => {
  try {
    showLoading("Creating tag...");

    const response = await axiosInstance.post<ApiResponse<null>>(
      "/admin/tags/create-tag",
      tag
    );

    closeLoading();

    if (response.data.success) {
      showSuccessMessage(response.data.message || "Tag created successfully");
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to create tag");
      return false;
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error creating tag"
      );
    } else {
      showErrorMessage("Failed to create tag. Please try again later.");
    }

    return false;
  }
};

// Update tag
export const updateTag = async (tagId: string, tag: Tag): Promise<boolean> => {
  try {
    showLoading("Updating tag...");

    const response = await axiosInstance.put<ApiResponse<null>>(
      `/admin/tags/update-tag/${tagId}`,
      tag
    );

    closeLoading();

    if (response.data.success) {
      showSuccessMessage(response.data.message || "Tag updated successfully");
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to update tag");
      return false;
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error updating tag"
      );
    } else {
      showErrorMessage("Failed to update tag. Please try again later.");
    }

    return false;
  }
};

// Delete tag
export const deleteTag = async (tagId: string): Promise<boolean> => {
  try {
    const result = await showConfirmation(
      "Delete Tag",
      "Are you sure you want to delete this tag? This action cannot be undone."
    );

    if (result.isConfirmed) {
      showLoading("Deleting tag...");

      const response = await axiosInstance.delete<ApiResponse<null>>(
        `/admin/tags/delete-tag/${tagId}`
      );

      closeLoading();

      if (response.data.success) {
        showSuccessMessage(response.data.message || "Tag deleted successfully");
        return true;
      } else {
        showErrorMessage(response.data.message || "Failed to delete tag");
        return false;
      }
    }

    return false;
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error deleting tag"
      );
    } else {
      showErrorMessage("Failed to delete tag. Please try again later.");
    }

    return false;
  }
};
