import axios from "@/app/lib/axiosConfig";
import { getAuthToken } from "@/app/lib/config";

export interface SellerNote {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface SellerProfile {
  id: string;
  firm_name: string; // Changed from first_name/last_name to match API
  email: string;
  phone: string;
  country_code: string;
  entity_type: string;
  is_gst_registered: boolean;
  gstin: string;
  is_marketing_emails: boolean;
  is_marketing_sms: boolean;
  margin?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  warehouse_id: string | null;
  Addresses: Address[];
  SellerNotes: SellerNote[];
}

export interface Address {
  id: string;
  type: "warehouse" | "default";
  country: string;
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2?: string;
  company?: string;
  city: string;
  state: string;
  zip_code: string;
  country_code: string;
  country_code_iso: string;
}

export interface AddressFormData {
  type: "warehouse" | "default";
  country: string;
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2?: string;
  company?: string;
  city: string;
  state: string;
  zip_code: string;
  country_code: string;
  country_code_iso: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Get seller profile information
 * @param id Seller ID
 */
export const getSellerProfile = async (id: string): Promise<SellerProfile> => {
  const token = getAuthToken();

  const response = await axios.get<ApiResponse<SellerProfile>>(
    `/seller/profile/get-profile/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.data;
};

/**
 * Update seller profile information
 * @param id Seller ID
 * @param data Profile data to update
 */
export const updateSellerProfile = async (
  id: string,
  data: Partial<SellerProfile>
): Promise<{ success: boolean }> => {
  const token = getAuthToken();

  await axios.put(`/seller/profile/update-profile/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return { success: true };
};

/**
 * Get all addresses for a seller
 * @param id Seller ID
 */
export const getSellerAddresses = async (id: string): Promise<Address[]> => {
  const token = getAuthToken();

  const response = await axios.get<ApiResponse<Address[]>>(
    `/seller/profile/get-addresses/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.data;
};

/**
 * Add a new address for a seller
 * @param id Seller ID
 * @param addressData Address data to add
 */
export const addSellerAddress = async (
  id: string,
  addressData: AddressFormData
): Promise<{ success: boolean }> => {
  const token = getAuthToken();

  console.log(`[PROFILE-SERVICE] Adding ${addressData.type} address for seller: ${id}`);
  console.log(`[PROFILE-SERVICE] Address data:`, {
    type: addressData.type,
    country: addressData.country,
    city: addressData.city,
    state: addressData.state,
    company: addressData.company,
  });

  try {
    const response = await axios.post(`/seller/profile/add-address/${id}`, addressData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`[PROFILE-SERVICE] Address added successfully for seller: ${id}`);
    return { success: true };
  } catch (error) {
    console.error(`[PROFILE-SERVICE] Failed to add address for seller: ${id}`, {
      error: error instanceof Error ? error.message : String(error),
      addressType: addressData.type,
    });
    throw error;
  }
};

/**
 * Delete an address
 * @param addressId Address ID to delete
 */
export const deleteAddress = async (
  addressId: string
): Promise<{ success: boolean }> => {
  const token = getAuthToken();

  await axios.delete(`/seller/profile/delete-address/${addressId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return { success: true };
};
