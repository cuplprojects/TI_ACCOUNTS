import axiosInstance from "../../axiosConfig";
import {
  showSuccessMessage,
  showErrorMessage,
  showLoading,
  closeLoading,
} from "../../swalConfig";
import { AxiosError } from "axios";

export interface ExportParams {
  offset: number;
  limit: number;
  format: "csv" | "xlsx";
  search?: string;
  [key: string]: any; // For additional filters
}

// Generic export function
const exportData = async (
  endpoint: string,
  params: ExportParams,
  filename: string
) => {
  try {
    showLoading(`Exporting ${filename}...`);

    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });

    const response = await axiosInstance.get(`${endpoint}?${queryParams}`, {
      responseType: "blob", // Important for file download
      timeout: 120000, // 2 minutes timeout for export
    });

    closeLoading();

    // Create blob and download
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    // Extract filename from response headers or use default
    const contentDisposition = response.headers["content-disposition"];
    let downloadFilename = filename;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(
        /filename\*?=['"]?(?:UTF-8'')?([^;"\n]*?)['"]?$/i
      );
      if (filenameMatch && filenameMatch[1]) {
        try {
          // Attempt to decode URI component for filenames that contain special characters
          downloadFilename = decodeURIComponent(filenameMatch[1]);
        } catch (e) {
          console.warn(
            "Failed to decode filename, using raw string:",
            filenameMatch[1]
          );
          downloadFilename = filenameMatch[1];
        }
      }
    }

    // Ensure the filename has the correct extension based on the requested format
    const desiredExtension = `.${params.format}`;
    if (!downloadFilename.endsWith(desiredExtension)) {
      downloadFilename += desiredExtension;
    }

    link.download = downloadFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    showSuccessMessage(`${filename} exported successfully!`);
  } catch (error) {
    closeLoading();
    console.error(`Export ${filename} error:`, error);

    const axiosError = error as AxiosError;
    if (axiosError.code === "ECONNABORTED") {
      showErrorMessage(
        "Export timeout. Please try with fewer records or contact support."
      );
    } else if (axiosError.response?.status === 400) {
      showErrorMessage(
        "Invalid export parameters. Please check your selection."
      );
    } else {
      showErrorMessage(`Failed to export ${filename}. Please try again.`);
    }
    throw error;
  }
};

// Abandoned Carts Export
export const exportAbandonedCarts = async (params: ExportParams) => {
  return exportData(
    "/admin/abandoned/export-abandoned-carts",
    params,
    "abandoned_carts"
  );
};

// Pickup Export
export const exportPickups = async (params: ExportParams) => {
  return exportData("/admin/pickup/export-pickups", params, "pickups");
};

// Products Export
export const exportProducts = async (params: ExportParams) => {
  return exportData("/admin/product/export-products", params, "products");
};

// Collections Export
export const exportCollections = async (params: ExportParams) => {
  return exportData(
    "/admin/collection/export-collections",
    params,
    "collections"
  );
};

// Customers Export
export const exportCustomers = async (params: ExportParams) => {
  return exportData("/admin/user/export-users", params, "customers");
};

// Sellers Export
export const exportSellers = async (params: ExportParams) => {
  return exportData("/admin/seller/export-sellers", params, "sellers");
};

// Get total count for a specific endpoint (used to show available records)
export const getTotalCount = async (
  endpoint: string,
  search?: string
): Promise<number> => {
  try {
    const queryParams = new URLSearchParams();
    if (search) {
      queryParams.append("search", search);
    }
    queryParams.append("limit", "1"); // We only need the count

    const response = await axiosInstance.get(`${endpoint}?${queryParams}`);

    // Extract total count from different response structures
    if (response.data.data?.pagination?.totalOrders) {
      return response.data.data.pagination.totalOrders;
    } else if (response.data.data?.length !== undefined) {
      // For endpoints that return arrays, we'll need to make a count-specific call
      // For now, return a default that will be overridden by the actual implementation
      return response.data.data.length;
    } else if (response.data.totalCount) {
      return response.data.totalCount;
    }

    return 0;
  } catch (error) {
    console.error("Error getting total count:", error);
    return 0;
  }
};
