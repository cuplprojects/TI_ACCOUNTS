import axiosInstance from "../../axiosConfig";
import {
  showErrorMessage,
  showLoading,
  closeLoading,
  showSuccessMessage,
} from "../../swalConfig";
import { AxiosError } from "axios";

// Base URL for tag API
const BASE_URL = "/seller/tags";

// Tag interface
export interface Tag {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Tag creation interface
export interface CreateTagData {
  name: string;
  description?: string;
}

// API response interface
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Get all tags
 */
export const getAllTags = async (): Promise<Tag[]> => {
  try {
    showLoading("Loading tags...");
    const response = await axiosInstance.get<ApiResponse<Tag[]>>(
      `${BASE_URL}/get-tags`
    );
    closeLoading();

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      return [];
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Failed to load tags"
      );
    } else {
      showErrorMessage("Failed to load tags. Please try again later.");
    }
    return [];
  }
};

/**
 * Get a single tag by ID
 */
export const getTag = async (id: string): Promise<Tag | null> => {
  try {
    showLoading("Loading tag details...");
    const response = await axiosInstance.get<ApiResponse<Tag>>(
      `${BASE_URL}/get-tag/${id}`
    );
    closeLoading();

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      return null;
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Failed to load tag details"
      );
    } else {
      showErrorMessage("Failed to load tag details. Please try again later.");
    }
    return null;
  }
};

/**
 * Create a new tag
 */
export const createTag = async (data: CreateTagData): Promise<boolean> => {
  try {
    showLoading("Creating tag...");
    const response = await axiosInstance.post<ApiResponse<Tag>>(
      `${BASE_URL}/create-tag`,
      data
    );
    closeLoading();

    if (response.data.success) {
      showSuccessMessage("Tag created successfully");
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
        axiosError.response.data?.message || "Failed to create tag"
      );
    } else {
      showErrorMessage("Failed to create tag. Please try again later.");
    }
    return false;
  }
};
