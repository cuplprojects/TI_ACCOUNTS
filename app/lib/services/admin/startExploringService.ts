import axiosInstance from "@/app/lib/axiosConfig";
import { showSuccessMessage, showErrorMessage } from "@/app/lib/swalConfig";

// Types for hierarchical collections (simplified - no sub-categories)
export interface CategoryOption {
  id: string;
  title: string;
  category_type: 'category';
}

export interface SuperCategoryOption {
  id: string;
  title: string;
  category_type: 'super-category';
  categories: CategoryOption[];
}

// Types for individual collection items
export interface Collection {
  id: string;
  title: string;
  category_type: 'super-category' | 'category';
  superCategoryId?: string;
}

export interface StartExploringItem {
  id: string;
  super_category_id: string;
  category_id?: string;
  display_order: number;
  is_active: boolean;
  level: 'super_category' | 'category';
  parent_start_exploring_id?: string;
  SuperCategory?: Collection;
  Category?: Collection;
  createdAt: string;
  updatedAt: string;
}

export interface StartExploringHierarchy {
  id: string;
  super_category: Collection;
  categories: CategoryItem[];
  display_order: number;
  is_active: boolean;
  level: 'super_category';
}

export interface CategoryItem {
  id: string;
  category: Collection;
  display_order: number;
  is_active: boolean;
  level: 'category';
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Get all start exploring items
export const getStartExploring = async (activeOnly: boolean = false): Promise<StartExploringHierarchy[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<StartExploringHierarchy[]>>(
      `/admin/start-exploring?active_only=${activeOnly}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch start exploring');
    }
  } catch (error: any) {
    console.error('Error fetching start exploring:', error);
    showErrorMessage(error.response?.data?.message || 'Failed to fetch start exploring');
    return [];
  }
};

// Get available collections in hierarchical structure
export const getAvailableCollections = async (): Promise<SuperCategoryOption[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<SuperCategoryOption[]>>('/admin/start-exploring/collections');

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch collections');
    }
  } catch (error: any) {
    console.error('Error fetching collections:', error);
    showErrorMessage(error.response?.data?.message || 'Failed to fetch collections');
    return [];
  }
};

// Add start exploring item
export const addStartExploring = async (startExploringData: {
  super_category_id: string;
  category_id?: string;
  level: 'super_category' | 'category';
  parent_start_exploring_id?: string;
  display_order?: number;
}): Promise<boolean> => {
  try {
    const response = await axiosInstance.post<ApiResponse<StartExploringItem>>(
      '/admin/start-exploring',
      startExploringData
    );

    if (response.data.success) {
      showSuccessMessage(response.data.message || 'Start exploring added successfully');
      return true;
    } else {
      showErrorMessage(response.data.message || 'Failed to add start exploring');
      return false;
    }
  } catch (error: any) {
    console.error('Error adding start exploring:', error);
    showErrorMessage(error.response?.data?.message || 'Failed to add start exploring');
    return false;
  }
};

// Update start exploring item
export const updateStartExploring = async (
  id: string,
  updateData: {
    display_order?: number;
    is_active?: boolean;
  }
): Promise<boolean> => {
  try {
    const response = await axiosInstance.put<ApiResponse<StartExploringItem>>(
      `/admin/start-exploring/${id}`,
      updateData
    );

    if (response.data.success) {
      showSuccessMessage(response.data.message || 'Start exploring updated successfully');
      return true;
    } else {
      showErrorMessage(response.data.message || 'Failed to update start exploring');
      return false;
    }
  } catch (error: any) {
    console.error('Error updating start exploring:', error);
    showErrorMessage(error.response?.data?.message || 'Failed to update start exploring');
    return false;
  }
};

// Delete start exploring item
export const deleteStartExploring = async (id: string): Promise<boolean> => {
  try {
    const response = await axiosInstance.delete<ApiResponse<null>>(
      `/admin/start-exploring/${id}`
    );

    if (response.data.success) {
      showSuccessMessage(response.data.message || 'Start exploring deleted successfully');
      return true;
    } else {
      showErrorMessage(response.data.message || 'Failed to delete start exploring');
      return false;
    }
  } catch (error: any) {
    console.error('Error deleting start exploring:', error);
    showErrorMessage(error.response?.data?.message || 'Failed to delete start exploring');
    return false;
  }
};

// Update start exploring order
export const updateStartExploringOrder = async (items: { id: string; display_order: number }[]): Promise<boolean> => {
  try {
    const response = await axiosInstance.put<ApiResponse<null>>(
      '/admin/start-exploring/order/update',
      { items }
    );

    if (response.data.success) {
      showSuccessMessage(response.data.message || 'Start exploring order updated successfully');
      return true;
    } else {
      showErrorMessage(response.data.message || 'Failed to update start exploring order');
      return false;
    }
  } catch (error: any) {
    console.error('Error updating start exploring order:', error);
    showErrorMessage(error.response?.data?.message || 'Failed to update start exploring order');
    return false;
  }
}; 