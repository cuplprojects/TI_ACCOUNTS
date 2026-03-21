import axiosInstance from "../../axiosConfig";
import {
  showSuccessMessage,
  showErrorMessage,
  showLoading,
  closeLoading,
  showConfirmation,
} from "../../swalConfig";
import { AxiosError } from "axios";
import { uploadImagesWithPresignedUrls } from "../presignedUrlService";

// Seller interface for our frontend use
export interface Seller {
  id?: string;
  firmName: string;
  password?: string;
  firmType: string;
  countryCode: string;
  countryCodeIso?: string;
  isGstRegistered: boolean;
  gstinNo?: string;
  email: string;
  phoneNumber: string;
  emailConsent: boolean;
  smsConsent: boolean;
  margin?: number;
  warehouseId?: string;
  addresses?: Address[];
  defaultAddress?: Address;
  warehouseAddress?: Address;
  status?: "pending" | "approved" | "rejected";
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  Addresses?: Address[];
  Tags?: Tag[];
  stampUrl?: string;
  signatureUrl?: string;
  gstCertificateUrl?: string;
  agreementUrl?: string;
  selfPickup?: boolean;
}

// Tag interface
export interface Tag {
  id: string;
  name: string;
  description?: string;
}

// Seller document interface
export interface SellerDocument {
  url: string;
  originalName: string;
  type: "license" | "store_image" | "tax_document" | "other";
}

// Backend API seller request interface
export interface SellerRequest {
  firm_name: string;
  password: string;
  entity_type: string;
  country_code: string;
  country_code_iso?: string;
  phone: string;
  email: string;
  is_gst_registered: boolean;
  gstin: string | null;
  is_marketing_emails: boolean;
  is_marketing_sms: boolean;
  margin?: number;
  warehouseAddress?: Address;
  defaultAddress?: Address;
  tags?: string[];
  brand_ids?: string[];
  note?: {
    content: string;
  };
  documents?: SellerDocument[];
  stamp_url?: string | null;
  signature_url?: string | null;
  gst_certificate_url?: string | null;
  agreement_url?: string | null;
  self_pickup?: boolean;
}

// Seller query parameters interface
export interface SellerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  entity_type?: "Proprietor" | "Partnership" | "Limited Liability Partnership" | "One Person Company" | "Private Limited Company" | "Public Limited Company" | "";
  is_gst_registered?: "true" | "false" | "";
  is_marketing_emails?: "true" | "false" | "";
  is_marketing_sms?: "true" | "false" | "";
  isFirstLogin?: "true" | "false" | "";
  sort?:
  | "newest"
  | "oldest"
  | "name_asc"
  | "name_desc"
  | "email_asc"
  | "email_desc";
}

// Pagination info interface
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalSellers: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Sellers response interface
export interface SellersResponse {
  sellers: Seller[];
  pagination: PaginationInfo;
  filters: {
    search: string | null;
    entity_type: string | null;
    is_gst_registered: string | null;
    is_marketing_emails: string | null;
    is_marketing_sms: string | null;
    isFirstLogin: string | null;
    sort: string;
  };
  summary?: {
    totalSellers: number;
    gstRegisteredSellers: number;
    firstLoginPendingSellers: number;
    marketingEmailSellers: number;
    marketingSmsells: number;
    soleProprietorSellers: number;
    pvtLtdSellers: number;
    sellersWithAddresses: number;
  };
}

// Address interface
export interface Address {
  id?: string;
  type: "default" | "warehouse";
  first_name?: string;
  last_name?: string;
  company: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  country_code?: string;
  country_code_iso?: string;
  phone: string;
  seller_id?: string;
}

// Bank details interface
export interface BankDetails {
  id?: string;
  seller_id?: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  branch_name?: string;
  upi_id?: string;
  account_holder_name: string;
  is_primary?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  email_sent?: boolean;
  next_steps?: string;
}

// API response seller row interface
interface SellerRow {
  id: string;
  firm_name: string;
  country_code: string;
  country_code_iso?: string;
  phone: string;
  email: string;
  entity_type: string;
  is_gst_registered: boolean;
  gstin: string;
  is_marketing_emails: boolean;
  is_marketing_sms: boolean;
  margin?: number;
  warehouse_id: string;
  status?: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  Addresses?: Address[];
  SellerAddresses?: Address[];
  Tags?: Tag[];
  Brands?: Array<{ id: string; name: string; description?: string }>;
  SellerNotes?: { id: string; content: string }[];
  stamp_url?: string;
  signature_url?: string;
  gst_certificate_url?: string;
  agreement_url?: string;
  self_pickup?: boolean;
}

// Get all sellers with pagination and filtering
export const getAllSellers = async (
  params?: SellerQueryParams
): Promise<SellersResponse> => {
  try {
    // showLoading("Loading sellers...");

    // Build query string
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.entity_type)
      queryParams.append("entity_type", params.entity_type);
    if (params?.is_gst_registered)
      queryParams.append("is_gst_registered", params.is_gst_registered);
    if (params?.is_marketing_emails)
      queryParams.append("is_marketing_emails", params.is_marketing_emails);
    if (params?.is_marketing_sms)
      queryParams.append("is_marketing_sms", params.is_marketing_sms);
    if (params?.isFirstLogin)
      queryParams.append("isFirstLogin", params.isFirstLogin);
    if (params?.sort) queryParams.append("sort", params.sort);

    const response = await axiosInstance.get<
      ApiResponse<{
        sellers: SellerRow[];
        pagination: PaginationInfo;
        filters: SellersResponse["filters"];
        summary?: SellersResponse["summary"];
      }>
    >(`/admin/seller/get-sellers?${queryParams.toString()}`);

    closeLoading();

    if (response.data.success && response.data.data) {
      // Map the snake_case API properties to our camelCase Seller interface
      const mappedData: SellersResponse = {
        ...response.data.data,
        sellers: response.data.data.sellers.map(
          (row: SellerRow) =>
          ({
            id: row.id,
            firmName: row.firm_name,
            email: row.email,
            phoneNumber: row.phone,
            countryCode: row.country_code,
            countryCodeIso: row.country_code_iso,
            firmType: row.entity_type,
            isGstRegistered: row.is_gst_registered,
            gstinNo: row.gstin,
            emailConsent: row.is_marketing_emails,
            smsConsent: row.is_marketing_sms,
            margin: row.margin,
            warehouseId: row.warehouse_id,
            status: row.status,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            deletedAt: row.deletedAt,
            Addresses: row.Addresses,
            Tags: row.Tags,
            selfPickup: row.self_pickup,
          } as Seller)
        ),
      };
      return mappedData;
    } else {
      // Return empty response structure on error
      return {
        sellers: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalSellers: 0,
          limit: 20,
          hasNext: false,
          hasPrev: false,
        },
        filters: {
          search: null,
          entity_type: null,
          is_gst_registered: null,
          is_marketing_emails: null,
          is_marketing_sms: null,
          isFirstLogin: null,
          sort: "newest",
        },
      };
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    console.error("Error loading sellers:", axiosError);
    // Return empty response structure on error
    return {
      sellers: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalSellers: 0,
        limit: 20,
        hasNext: false,
        hasPrev: false,
      },
      filters: {
        search: null,
        entity_type: null,
        is_gst_registered: null,
        is_marketing_emails: null,
        is_marketing_sms: null,
        isFirstLogin: null,
        sort: "newest",
      },
    };
  }
};

// Get single seller
export const getSeller = async (sellerId: string): Promise<ApiResponse<SellerRow>> => {
  try {
    showLoading("Loading seller details...");

    const response = await axiosInstance.get<ApiResponse<SellerRow>>(
      `/admin/seller/get-seller/${sellerId}`
    );

    closeLoading();

    if (response.data.success && response.data.data) {
      // Return the raw API response
      return response.data;
    } else {
      showErrorMessage(response.data.message || "Seller not found");
      throw new Error(response.data.message || "Seller not found");
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      if (status === 404) {
        showErrorMessage("Seller not found!");
      } else {
        showErrorMessage(
          axiosError.response.data?.message || "Error loading seller details"
        );
      }
    } else {
      showErrorMessage(
        "Failed to load seller details. Please try again later."
      );
    }

    throw error;
  }
};

// Create seller
export const createSeller = async (
  sellerData: SellerRequest
): Promise<boolean> => {
  try {
    showLoading("Creating seller...");

    const response = await axiosInstance.post<ApiResponse<null>>(
      "/admin/seller/create-seller",
      sellerData
    );

    closeLoading();

    if (response.data.success) {
      let successMessage =
        response.data.message || "Seller created successfully";

      // Add email notification status to success message
      if (response.data.email_sent) {
        successMessage += "\n\nWelcome email sent successfully!";
      }

      if (response.data.next_steps) {
        successMessage += `\n\nNext Steps: ${response.data.next_steps}`;
      }

      showSuccessMessage(successMessage);
      return true;
    } else {
      if (response.data.errors && response.data.errors.length > 0) {
        // Show validation errors if present
        showErrorMessage(
          `${response.data.message || "Failed to create seller"
          }:\n\n${response.data.errors.join("\n")}`
        );
      } else {
        showErrorMessage(response.data.message || "Failed to create seller");
      }
      return false;
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;

    // Handle empty response data
    if (axiosError.response) {
      const errorData = axiosError.response.data;
      const status = axiosError.response.status;

      // Check if error data is empty or malformed
      if (!errorData || Object.keys(errorData).length === 0) {
        console.error("Empty error response from server:", {
          status: status,
          statusText: axiosError.response.statusText,
          headers: axiosError.response.headers,
        });

        // Provide meaningful error message based on status code
        if (status === 400) {
          showErrorMessage("Invalid seller data. Please check all required fields.");
        } else if (status === 409) {
          showErrorMessage("Email or phone number already exists.");
        } else if (status === 500) {
          showErrorMessage("Server error occurred. Please try again later.");
        } else {
          showErrorMessage(`Error creating seller (Status: ${status}). Please try again.`);
        }
        return false;
      }

      // Handle normal error response
      if (status === 400 && errorData.errors && errorData.errors.length > 0) {
        // Validation errors
        showErrorMessage(
          `${errorData.message || "Validation failed"
          }:\n\n${errorData.errors.join("\n")}`
        );
      } else if (status === 500) {
        // Server errors (warehouse creation, email send failures, etc.)
        showErrorMessage(
          errorData.message || "Server error occurred while creating seller"
        );
      } else {
        showErrorMessage(errorData.message || `Error creating seller (Status: ${status})`);
      }
    } else if (axiosError.request) {
      // Request made but no response received
      console.error("No response from server:", axiosError.request);
      showErrorMessage("No response from server. Please check your connection.");
    } else {
      // Error in request setup
      console.error("Request setup error:", axiosError.message);
      showErrorMessage("Failed to create seller. Please try again later.");
    }

    return false;
  }
};

// Update seller
export const updateSeller = async (
  sellerId: string,
  sellerData: Partial<SellerRequest>
): Promise<boolean> => {
  try {
    showLoading("Updating seller...");

    const response = await axiosInstance.put<ApiResponse<null>>(
      `/admin/seller/update-seller/${sellerId}`,
      sellerData
    );

    closeLoading();

    if (response.data.success) {
      showSuccessMessage(
        response.data.message || "Seller updated successfully"
      );
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to update seller");
      return false;
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;

    // Handle empty response data
    if (axiosError.response) {
      const errorData = axiosError.response.data;
      const status = axiosError.response.status;

      // Check if error data is empty or malformed
      if (!errorData || Object.keys(errorData).length === 0) {
        console.error("Empty error response from server:", {
          status: status,
          statusText: axiosError.response.statusText,
        });

        if (status === 400) {
          showErrorMessage("Seller not found or invalid data!");
        } else if (status === 500) {
          showErrorMessage("Server error occurred. Please try again later.");
        } else {
          showErrorMessage(`Error updating seller (Status: ${status}). Please try again.`);
        }
        return false;
      }

      // Handle normal error response
      if (status === 400) {
        showErrorMessage("Seller not found!");
      } else {
        showErrorMessage(
          axiosError.response.data?.message || "Error updating seller"
        );
      }
    } else if (axiosError.request) {
      console.error("No response from server:", axiosError.request);
      showErrorMessage("No response from server. Please check your connection.");
    } else {
      console.error("Request setup error:", axiosError.message);
      showErrorMessage("Failed to update seller. Please try again later.");
    }

    return false;
  }
};

// Delete seller
export const deleteSeller = async (sellerId: string): Promise<boolean> => {
  try {
    const result = await showConfirmation(
      "Delete Seller",
      "Are you sure you want to delete this seller? This action cannot be undone and will delete all associated records (addresses, notes, tags)."
    );

    if (result.isConfirmed) {
      showLoading("Deleting seller...");

      const response = await axiosInstance.delete<ApiResponse<null>>(
        `/admin/seller/delete-seller/${sellerId}`
      );

      closeLoading();

      if (response.data.success) {
        showSuccessMessage(
          response.data.message || "Seller deleted successfully"
        );
        return true;
      } else {
        showErrorMessage(response.data.message || "Failed to delete seller");
        return false;
      }
    }

    return false;
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      if (status === 404) {
        showErrorMessage("Seller not found!");
      } else {
        showErrorMessage(
          axiosError.response.data?.message || "Error deleting seller"
        );
      }
    } else {
      showErrorMessage("Failed to delete seller. Please try again later.");
    }

    return false;
  }
};

// Add address to seller
export const addSellerAddress = async (
  sellerId: string,
  address: Address
): Promise<boolean> => {
  try {
    showLoading(`Adding ${address.type} address...`);

    const response = await axiosInstance.post<ApiResponse<null>>(
      `/admin/seller/add-address/${sellerId}`,
      address
    );

    closeLoading();

    if (response.data.success) {
      showSuccessMessage(response.data.message || "Address added successfully");
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to add address");
      return false;
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      if (status === 404) {
        showErrorMessage("Seller not found!");
      } else {
        showErrorMessage(
          axiosError.response.data?.message || "Error adding address"
        );
      }
    } else {
      showErrorMessage("Failed to add address. Please try again later.");
    }

    return false;
  }
};

// Add note to seller
export const addSellerNote = async (
  sellerId: string,
  content: string
): Promise<boolean> => {
  try {
    showLoading("Adding note...");

    const response = await axiosInstance.post<ApiResponse<null>>(
      `/admin/seller/add-note/${sellerId}`,
      { content }
    );

    closeLoading();

    if (response.data.success) {
      showSuccessMessage(response.data.message || "Note added successfully");
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to add note");
      return false;
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      if (status === 404) {
        showErrorMessage("Seller not found!");
      } else {
        showErrorMessage(
          axiosError.response.data?.message || "Error adding note"
        );
      }
    } else {
      showErrorMessage("Failed to add note. Please try again later.");
    }

    return false;
  }
};

// Update seller with documents using presigned URLs
export const updateSellerWithDocuments = async (
  sellerId: string,
  sellerData: Partial<SellerRequest>,
  documents?: { file: File; type: SellerDocument['type'] }[]
): Promise<boolean> => {
  try {
    // Upload documents using presigned URLs if provided
    let sellerDocuments: SellerDocument[] = [];
    if (documents && documents.length > 0) {
      const files = documents.map(doc => doc.file);
      const uploadedDocuments = await uploadImagesWithPresignedUrls(
        files,
        "sellers/temp",
        "admin"
      );

      if (!uploadedDocuments) {
        showErrorMessage("Failed to upload documents");
        return false;
      }

      // Map uploaded documents to seller document format
      sellerDocuments = uploadedDocuments.map((doc, index) => ({
        url: doc.url,
        originalName: doc.originalName,
        type: documents[index].type,
      }));
    }

    showLoading("Updating seller...");

    // Prepare seller data with documents
    const sellerPayload = {
      ...sellerData,
      ...(sellerDocuments.length > 0 && { documents: sellerDocuments }),
    };

    const response = await axiosInstance.put<ApiResponse<null>>(
      `/admin/seller/update-seller/${sellerId}`,
      sellerPayload
    );

    closeLoading();

    if (response.data.success) {
      showSuccessMessage(response.data.message || "Seller updated successfully");
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to update seller");
      return false;
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      if (status === 400) {
        showErrorMessage("Seller not found!");
      } else {
        showErrorMessage(
          axiosError.response.data?.message || "Error updating seller"
        );
      }
    } else {
      showErrorMessage("Failed to update seller. Please try again later.");
    }

    return false;
  }
};


// Delete address from seller
export const deleteSellerAddress = async (
  sellerId: string,
  addressType: "default" | "warehouse"
): Promise<boolean> => {
  try {
    showLoading(`Deleting ${addressType} address...`);

    const response = await axiosInstance.delete<ApiResponse<null>>(
      `/admin/seller/delete-address/${sellerId}`,
      {
        data: { type: addressType }
      }
    );

    closeLoading();

    if (response.data.success) {
      showSuccessMessage(response.data.message || "Address deleted successfully");
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to delete address");
      return false;
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      if (status === 404) {
        showErrorMessage("Seller or address not found!");
      } else {
        showErrorMessage(
          axiosError.response.data?.message || "Error deleting address"
        );
      }
    } else {
      showErrorMessage("Failed to delete address. Please try again later.");
    }

    return false;
  }
};

// Get bank details for a seller
export const getSellerBankDetails = async (
  sellerId: string
): Promise<BankDetails[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<BankDetails[]>>(
      `/admin/seller/bank-details/${sellerId}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching bank details:", error);
    return [];
  }
};

// Add bank details for a seller
export const addSellerBankDetails = async (
  sellerId: string,
  bankDetails: BankDetails
): Promise<boolean> => {
  try {
    console.log("addSellerBankDetails called with:", { sellerId, bankDetails });

    const response = await axiosInstance.post<ApiResponse<BankDetails>>(
      `/admin/seller/bank-details/${sellerId}`,
      bankDetails
    );

    console.log("addSellerBankDetails response:", response.data);

    if (response.data.success) {
      showSuccessMessage(response.data.message || "Bank details added successfully");
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to add bank details");
      return false;
    }
  } catch (error) {
    console.error("addSellerBankDetails error:", error);

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      if (status === 404) {
        showErrorMessage("Seller not found!");
      } else {
        showErrorMessage(
          axiosError.response.data?.message || "Error adding bank details"
        );
      }
    } else {
      showErrorMessage("Failed to add bank details. Please try again later.");
    }

    return false;
  }
};

// Update bank details
export const updateSellerBankDetails = async (
  sellerId: string,
  bankId: string,
  bankDetails: Partial<BankDetails>
): Promise<boolean> => {
  try {
    console.log("updateSellerBankDetails called with:", { sellerId, bankId, bankDetails });

    const response = await axiosInstance.put<ApiResponse<BankDetails>>(
      `/admin/seller/bank-details/${sellerId}/${bankId}`,
      bankDetails
    );

    console.log("updateSellerBankDetails response:", response.data);

    if (response.data.success) {
      showSuccessMessage(response.data.message || "Bank details updated successfully");
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to update bank details");
      return false;
    }
  } catch (error) {
    console.error("updateSellerBankDetails error:", error);

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      if (status === 404) {
        showErrorMessage("Bank details not found!");
      } else {
        showErrorMessage(
          axiosError.response.data?.message || "Error updating bank details"
        );
      }
    } else {
      showErrorMessage("Failed to update bank details. Please try again later.");
    }

    return false;
  }
};

// Delete bank details
export const deleteSellerBankDetails = async (
  sellerId: string,
  bankId: string
): Promise<boolean> => {
  try {
    const confirmed = await showConfirmation(
      "Delete Bank Details",
      "Are you sure you want to delete this bank account?"
    );

    if (!confirmed) {
      return false;
    }

    showLoading("Deleting bank details...");

    const response = await axiosInstance.delete<ApiResponse<null>>(
      `/admin/seller/bank-details/${sellerId}/${bankId}`
    );

    closeLoading();

    if (response.data.success) {
      showSuccessMessage(response.data.message || "Bank details deleted successfully");
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to delete bank details");
      return false;
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      if (status === 404) {
        showErrorMessage("Bank details not found!");
      } else {
        showErrorMessage(
          axiosError.response.data?.message || "Error deleting bank details"
        );
      }
    } else {
      showErrorMessage("Failed to delete bank details. Please try again later.");
    }

    return false;
  }
};


// Bulk delete sellers
export const bulkDeleteSellers = async (sellerIds: string[]): Promise<{ success: boolean; confirmed: boolean; deletedCount?: number; failedCount?: number; failedSellerIds?: string[] }> => {
  try {
    if (sellerIds.length === 0) {
      showErrorMessage("Please select at least one seller to delete");
      return { success: false, confirmed: false };
    }

    const result = await showConfirmation(
      "Delete Multiple Sellers?",
      `Are you sure you want to delete ${sellerIds.length} seller(s)? This action cannot be undone.`
    );

    if (!result.isConfirmed) {
      return { success: false, confirmed: false };
    }

    showLoading(`Deleting ${sellerIds.length} seller(s)...`);
    const response = await axiosInstance.post<ApiResponse<{ deletedCount: number; failedCount: number; failedSellerIds: string[]; partialSuccess?: boolean }>>(
      `/admin/seller/bulk-delete-sellers`,
      { sellerIds }
    );
    closeLoading();

    if (response.data.success) {
      const { deletedCount = 0, failedCount = 0, partialSuccess = false } = response.data.data || {};

      if (partialSuccess) {
        showSuccessMessage(
          response.data.message || `Deleted ${deletedCount} seller(s). ${failedCount} seller(s) could not be deleted (have products listed).`
        );
      } else {
        showSuccessMessage(
          response.data.message || `Successfully deleted ${deletedCount} seller(s)`
        );
      }

      return {
        success: true,
        confirmed: true,
        deletedCount,
        failedCount,
        failedSellerIds: response.data.data?.failedSellerIds || []
      };
    } else {
      showErrorMessage(response.data.message || "Failed to delete sellers");
      return { success: false, confirmed: true };
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response?.status === 409) {
      const data = axiosError.response.data as any;
      showErrorMessage(
        data?.message || "All selected sellers have products listed and cannot be deleted"
      );
    } else if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error deleting sellers"
      );
    } else {
      showErrorMessage("Failed to delete sellers. Please try again later.");
    }
    return { success: false, confirmed: true };
  }
};

// Update seller self pickup status
export const updateSellerSelfPickup = async (
  sellerId: string,
  selfPickup: boolean
): Promise<boolean> => {
  try {
    showLoading(`${selfPickup ? 'Enabling' : 'Disabling'} self pickup...`);

    const response = await axiosInstance.put<ApiResponse<{ self_pickup: boolean }>>(
      `/admin/seller/update-self-pickup/${sellerId}`,
      { self_pickup: selfPickup }
    );

    closeLoading();

    if (response.data.success) {
      showSuccessMessage(
        response.data.message || `Self pickup ${selfPickup ? 'enabled' : 'disabled'} successfully`
      );
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to update self pickup status");
      return false;
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      if (status === 404) {
        showErrorMessage("Seller not found!");
      } else {
        showErrorMessage(
          axiosError.response.data?.message || "Error updating self pickup status"
        );
      }
    } else {
      showErrorMessage("Failed to update self pickup status. Please try again later.");
    }

    return false;
  }
};

// Get seller statistics
export const getSellerStats = async (sellerId: string): Promise<{ totalSalesIncluding: number; totalSalesExcluding: number; totalOrders: number } | null> => {
  try {
    const response = await axiosInstance.get<ApiResponse<{ totalSalesIncluding: number; totalSalesExcluding: number; totalOrders: number }>>(
      `/admin/seller/get-seller-stats/${sellerId}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching seller stats:", error);
    return null;
  }
};

// Get last orders for a seller
export const getSellerLastOrder = async (sellerId: string): Promise<any[] | null> => {
  try {
    const response = await axiosInstance.get<ApiResponse<any[]>>(
      `/admin/seller/get-seller-last-order/${sellerId}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching seller last orders:", error);
    return null;
  }
};

// Approve a pending seller
export const approveSeller = async (sellerId: string): Promise<boolean> => {
  try {
    showLoading("Approving seller...");

    const response = await axiosInstance.put<ApiResponse<null>>(
      `/admin/seller/approve-seller/${sellerId}`
    );

    closeLoading();

    if (response.data.success) {
      showSuccessMessage(response.data.message || "Seller approved successfully");
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to approve seller");
      return false;
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      if (status === 404) {
        showErrorMessage("Seller not found!");
      } else if (status === 400) {
        showErrorMessage(axiosError.response.data?.message || "Seller is already approved!");
      } else {
        showErrorMessage(
          axiosError.response.data?.message || "Error approving seller"
        );
      }
    } else {
      showErrorMessage("Failed to approve seller. Please try again later.");
    }

    return false;
  }
};

// Reject a pending seller
export const rejectSeller = async (sellerId: string, reason?: string): Promise<boolean> => {
  try {
    showLoading("Rejecting seller...");

    const response = await axiosInstance.put<ApiResponse<null>>(
      `/admin/seller/reject-seller/${sellerId}`,
      { reason }
    );

    closeLoading();

    if (response.data.success) {
      showSuccessMessage(response.data.message || "Seller rejected successfully");
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to reject seller");
      return false;
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      if (status === 404) {
        showErrorMessage("Seller not found!");
      } else if (status === 400) {
        showErrorMessage(axiosError.response.data?.message || "Seller is already rejected!");
      } else {
        showErrorMessage(
          axiosError.response.data?.message || "Error rejecting seller"
        );
      }
    } else {
      showErrorMessage("Failed to reject seller. Please try again later.");
    }

    return false;
  }
};
