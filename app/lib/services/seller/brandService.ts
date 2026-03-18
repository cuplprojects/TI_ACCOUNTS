import axiosInstance from "@/app/lib/axiosConfig";

export interface Brand {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Get all brands assigned to the current seller
 */
export const getMyBrands = async (): Promise<Brand[]> => {
  try {
    const response = await axiosInstance.get<{
      success: boolean;
      data: Brand[];
    }>("/seller/brands");

    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    return [];
  } catch (error) {
    console.error("Error fetching seller brands:", error);
    return [];
  }
};
