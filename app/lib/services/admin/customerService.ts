import axiosInstance from "../../axiosConfig";
import {
  showSuccessMessage,
  showErrorMessage,
  showLoading,
  closeLoading,
} from "../../swalConfig";
import { AxiosError } from "axios";

// Customer interface matching the backend model
export interface Customer {
  id?: string;
  first_name: string;
  last_name: string;
  language: string;
  email: string;
  country_code: string;
  country_code_iso?: string;
  phone: string;
  password?: string;
  dob?: string | Date;
  gender?: "male" | "female" | "other";
  is_marketing_emails?: boolean;
  is_marketing_sms?: boolean;
  last_order?: string;
  google_id?: string;
  facebook_id?: string;
  status?: "pending" | "approved" | "rejected";
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  country?: string;
  notes?: Note[];
  note?: { content: string };
  addresses?: CustomerAddress[];
  UserAddresses?: CustomerAddress[];
  Tags?: Tag[];
  tags?: string[];
  tag_ids?: string[];
  orders_count?: number;
  total_spent?: number;
}

// Tag interface
export interface Tag {
  id: string;
  name: string;
  description?: string;
}

// Note interface
export interface Note {
  id?: string;
  user_id?: string;
  admin_id?: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

// Customer Address interface
export interface CustomerAddress {
  id?: string;
  user_id?: string;
  address_name?: string;
  is_default?: boolean;
  country: string;
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2?: string;
  company?: string;
  city: string;
  state: string;
  zip_code: string;
  country_code?: string;
  country_code_iso?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Customer query parameters interface
export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  gender?: "male" | "female" | "other" | "";
  is_marketing_emails?: "true" | "false" | "";
  is_marketing_sms?: "true" | "false" | "";
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
  totalUsers: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Customers response interface
export interface CustomersResponse {
  users: Customer[];
  pagination: PaginationInfo;
  filters: {
    search: string | null;
    country: string | null;
    gender: string | null;
    is_marketing_emails: string | null;
    is_marketing_sms: string | null;
    sort: string;
  };
  summary?: {
    totalUsers: number;
    maleUsers: number;
    femaleUsers: number;
    marketingEmailUsers: number;
    marketingSmsUsers: number;
    usersWithAddresses: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Get all customers with pagination and filtering
export const getAllCustomers = async (
  params?: CustomerQueryParams
): Promise<CustomersResponse> => {
  try {
    // showLoading("Loading customers...");

    // Build query string
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.country) queryParams.append("country", params.country);
    if (params?.gender) queryParams.append("gender", params.gender);
    if (params?.is_marketing_emails)
      queryParams.append("is_marketing_emails", params.is_marketing_emails);
    if (params?.is_marketing_sms)
      queryParams.append("is_marketing_sms", params.is_marketing_sms);
    if (params?.sort) queryParams.append("sort", params.sort);

    const response = await axiosInstance.get<ApiResponse<CustomersResponse>>(
      `/admin/user/get-users?${queryParams.toString()}`
    );

    closeLoading();

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      // Return empty response structure on error
      return {
        users: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalUsers: 0,
          limit: 20,
          hasNext: false,
          hasPrev: false,
        },
        filters: {
          search: null,
          country: null,
          gender: null,
          is_marketing_emails: null,
          is_marketing_sms: null,
          sort: "newest",
        },
      };
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    console.error("Error loading customers:", axiosError);
    // Return empty response structure on error
    return {
      users: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalUsers: 0,
        limit: 20,
        hasNext: false,
        hasPrev: false,
      },
      filters: {
        search: null,
        country: null,
        gender: null,
        is_marketing_emails: null,
        is_marketing_sms: null,
        sort: "newest",
      },
    };
  }
};

// Get single customer by ID
export const getCustomer = async (
  customerId: string
): Promise<Customer | null> => {
  try {
    showLoading("Loading customer details...");

    const response = await axiosInstance.get<ApiResponse<Customer>>(
      `/admin/user/get-user/${customerId}`
    );

    closeLoading();

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      showErrorMessage(response.data.message || "Customer not found");
      return null;
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error loading customer details"
      );
    } else {
      showErrorMessage(
        "Failed to load customer details. Please try again later."
      );
    }

    return null;
  }
};

// Create customer
export const createCustomer = async (
  customerData: Customer
): Promise<boolean> => {
  try {
    showLoading("Creating customer...");

    const response = await axiosInstance.post<ApiResponse<null>>(
      "/admin/user/create-user",
      customerData
    );

    closeLoading();

    if (response.data.success) {
      showSuccessMessage(
        response.data.message || "Customer created successfully"
      );
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to create customer");
      return false;
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error creating customer"
      );
    } else {
      showErrorMessage("Failed to create customer. Please try again later.");
    }

    return false;
  }
};

// Update customer
export const updateCustomer = async (
  customerId: string,
  customerData: Partial<Customer>
): Promise<boolean> => {
  try {
    showLoading("Updating customer...");

    const response = await axiosInstance.put<ApiResponse<null>>(
      `/admin/user/update-user/${customerId}`,
      customerData
    );

    closeLoading();

    if (response.data.success) {
      showSuccessMessage(
        response.data.message || "Customer updated successfully"
      );
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to update customer");
      return false;
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error updating customer"
      );
    } else {
      showErrorMessage("Failed to update customer. Please try again later.");
    }

    return false;
  }
};

// Delete customer
export const deleteCustomer = async (customerId: string): Promise<boolean> => {
  try {
    showLoading("Deleting customer...");

    const response = await axiosInstance.delete<ApiResponse<null>>(
      `/admin/user/delete-user/${customerId}`
    );

    closeLoading();

    if (response.data.success) {
      showSuccessMessage(
        response.data.message || "Customer deleted successfully"
      );
      return true;
    } else {
      showErrorMessage(response.data.message || "Failed to delete customer");
      return false;
    }
  } catch (error) {
    closeLoading();

    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error deleting customer"
      );
    } else {
      showErrorMessage("Failed to delete customer. Please try again later.");
    }

    return false;
  }
};

// Add note to customer
export const addNoteToCustomer = async (
  customerId: string,
  noteContent: string
): Promise<boolean> => {
  try {
    showLoading("Adding note...");

    const response = await axiosInstance.post<ApiResponse<null>>(
      `/admin/user/add-note/${customerId}`,
      {
        content: noteContent,
      }
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
      showErrorMessage(
        axiosError.response.data?.message || "Error adding note"
      );
    } else {
      showErrorMessage("Failed to add note. Please try again later.");
    }

    return false;
  }
};


// Bulk delete customers
export const bulkDeleteCustomers = async (customerIds: string[]): Promise<{ success: boolean; confirmed: boolean; deletedCount?: number }> => {
  try {
    if (customerIds.length === 0) {
      showErrorMessage("Please select at least one customer to delete");
      return { success: false, confirmed: false };
    }

    const { showConfirmation } = await import("../../swalConfig");
    const result = await showConfirmation(
      "Delete Multiple Customers?",
      `Are you sure you want to delete ${customerIds.length} customer(s)? This action cannot be undone.`
    );
    
    if (!result.isConfirmed) {
      return { success: false, confirmed: false };
    }

    showLoading(`Deleting ${customerIds.length} customer(s)...`);
    const response = await axiosInstance.post<ApiResponse<{ deletedCount: number }>>(
      `/admin/user/bulk-delete-customers`,
      { customerIds }
    );
    closeLoading();

    if (response.data.success) {
      const { deletedCount = 0 } = response.data.data || {};
      showSuccessMessage(
        response.data.message || `Successfully deleted ${deletedCount} customer(s)`
      );
      
      return { 
        success: true, 
        confirmed: true,
        deletedCount
      };
    } else {
      showErrorMessage(response.data.message || "Failed to delete customers");
      return { success: false, confirmed: true };
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response) {
      showErrorMessage(
        axiosError.response.data?.message || "Error deleting customers"
      );
    } else {
      showErrorMessage("Failed to delete customers. Please try again later.");
    }
    return { success: false, confirmed: true };
  }
};
