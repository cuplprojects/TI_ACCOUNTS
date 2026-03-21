import axiosInstance from "@/app/lib/axiosConfig";
import { showErrorMessage } from "@/app/lib/swalConfig";

// Types for brands
export interface Brand {
  id: string;
  name: string;
  logo_url?: string;
}

// Types for hierarchical collections
export interface SubCategoryOption {
  id: string;
  title: string;
  category_type: 'sub-category';
}

export interface CategoryOption {
  id: string;
  title: string;
  category_type: 'category';
  sub_categories: SubCategoryOption[];
}

export interface SuperCategoryOption {
  id: string;
  title: string;
  category_type: 'super-category';
  categories: CategoryOption[];
}

// Types for individual collection items (for backward compatibility)
export interface Collection {
  id: string;
  title: string;
  category_type: 'super-category' | 'category' | 'sub-category';
  superCategoryId?: string;
  categoryId?: string;
}

export interface NavigationItem {
  id: string;
  super_category_id: string;
  category_id?: string;
  sub_category_id?: string;
  display_order: number;
  is_active: boolean;
  level: 'super_category' | 'category' | 'sub_category';
  parent_navigation_id?: string;
  custom_label?: string;
  SuperCategory?: Collection;
  Category?: Collection;
  SubCategory?: Collection;
  createdAt: string;
  updatedAt: string;
}

export interface NavigationHierarchy {
  id: string;
  super_category: Collection;
  display_label?: string;
  custom_label?: string;
  categories: CategoryWithSubs[];
  super_category_order: number;
  is_active: boolean;
  level: 'super_category';
}

export interface CategoryWithSubs {
  id: string;
  category: Collection;
  display_label?: string;
  custom_label?: string;
  sub_categories: SubCategoryItem[];
  category_order: number;
  is_active: boolean;
  level: 'category';
}

export interface SubCategoryItem {
  id: string;
  sub_category: Collection;
  display_label?: string;
  custom_label?: string;
  sub_category_order: number;
  is_active: boolean;
  level: 'sub_category';
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Get all navigation items
export const getNavigations = async (activeOnly: boolean = false): Promise<NavigationHierarchy[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<NavigationHierarchy[]>>(
      `/admin/navigation?active_only=${activeOnly}`
    );

    if (response.data.success && response.data.data) {
      // Filter out null values and ensure data integrity
      const filteredData = response.data.data
        .filter(nav => nav && nav.super_category)
        .map(nav => ({
          ...nav,
          categories: (nav.categories || [])
            .filter(cat => cat && cat.category)
            .map(cat => ({
              ...cat,
              sub_categories: (cat.sub_categories || [])
                .filter(sub => sub && sub.sub_category)
            }))
        }));
      
      return filteredData;
    } else {
      throw new Error(response.data.message || 'Failed to fetch navigations');
    }
  } catch (error: any) {
    console.error('Error fetching navigations:', error);
    showErrorMessage(error.response?.data?.message || 'Failed to fetch navigations');
    return [];
  }
};

// Get available collections in hierarchical structure
export const getAvailableCollections = async (): Promise<SuperCategoryOption[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<SuperCategoryOption[]>>('/admin/navigation/collections');

    if (response.data.success && response.data.data) {
      // Filter out null values and ensure data integrity
      const filteredData = response.data.data
        .filter(sc => sc && sc.title)
        .map(sc => ({
          ...sc,
          categories: (sc.categories || [])
            .filter(cat => cat && cat.title)
            .map(cat => ({
              ...cat,
              sub_categories: (cat.sub_categories || [])
                .filter(sub => sub && sub.title)
            }))
        }));
      
      return filteredData;
    } else {
      throw new Error(response.data.message || 'Failed to fetch collections');
    }
  } catch (error: any) {
    console.error('Error fetching collections:', error);
    showErrorMessage(error.response?.data?.message || 'Failed to fetch collections');
    return [];
  }
};

// Get all brands for "Shop by Brand" modal
export const getAllBrands = async (): Promise<Brand[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Brand[]>>('/admin/navigation/brands/all');

    if (response.data.success && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch brands');
    }
  } catch (error: any) {
    console.error('Error fetching brands:', error);
    showErrorMessage(error.response?.data?.message || 'Failed to fetch brands');
    return [];
  }
};

// Add navigation item
export const addNavigation = async (navigationData: {
  super_category_id: string;
  category_id?: string;
  sub_category_id?: string;
  brand_id?: string;
  level: 'super_category' | 'category' | 'sub_category' | 'brand';
  parent_navigation_id?: string;
  display_order?: number;
  custom_label?: string;
}): Promise<boolean> => {
  try {
    const response = await axiosInstance.post<ApiResponse<NavigationItem>>(
      '/admin/navigation',
      navigationData
    );

    if (response.data.success) {
      return true;
    } else {
      showErrorMessage(response.data.message || 'Failed to add navigation');
      return false;
    }
  } catch (error: any) {
    console.error('Error adding navigation:', error);
    showErrorMessage(error.response?.data?.message || 'Failed to add navigation');
    return false;
  }
};

// Update navigation item
export const updateNavigation = async (
  id: string,
  updateData: {
    super_category_order?: number;
    category_order?: number;
    sub_category_order?: number;
    is_active?: boolean;
    custom_label?: string;
  }
): Promise<boolean> => {
  try {
    const response = await axiosInstance.put<ApiResponse<NavigationItem>>(
      `/admin/navigation/${id}`,
      updateData
    );

    if (response.data.success) {
      return true;
    } else {
      showErrorMessage(response.data.message || 'Failed to update navigation');
      return false;
    }
  } catch (error: any) {
    console.error('Error updating navigation:', error);
    showErrorMessage(error.response?.data?.message || 'Failed to update navigation');
    return false;
  }
};

// Delete navigation item
export const deleteNavigation = async (id: string): Promise<boolean> => {
  try {
    const response = await axiosInstance.delete<ApiResponse<null>>(
      `/admin/navigation/${id}`
    );

    if (response.data.success) {
      return true;
    } else {
      showErrorMessage(response.data.message || 'Failed to delete navigation');
      return false;
    }
  } catch (error: any) {
    console.error('Error deleting navigation:', error);
    showErrorMessage(error.response?.data?.message || 'Failed to delete navigation');
    return false;
  }
};

// Update navigation order
export const updateNavigationOrder = async (items: { id: string; super_category_order?: number; category_order?: number; sub_category_order?: number }[]): Promise<boolean> => {
  try {
    const response = await axiosInstance.put<ApiResponse<null>>(
      '/admin/navigation/order/update',
      { items }
    );

    if (response.data.success) {
      return true;
    } else {
      showErrorMessage(response.data.message || 'Failed to update navigation order');
      return false;
    }
  } catch (error: any) {
    console.error('Error updating navigation order:', error);
    showErrorMessage(error.response?.data?.message || 'Failed to update navigation order');
    return false;
  }
};

// Reorder navigation items
export const reorderNavigationItems = async (
  items: NavigationHierarchy[],
  level: 'super_category' | 'category' | 'sub_category'
): Promise<boolean> => {
  try {
    const orderData = items.map((item, index) => {
      const orderObj: any = { id: item.id };
      if (level === 'super_category') {
        orderObj.super_category_order = index + 1;
      } else if (level === 'category') {
        orderObj.category_order = index + 1;
      } else if (level === 'sub_category') {
        orderObj.sub_category_order = index + 1;
      }
      return orderObj;
    });

    return await updateNavigationOrder(orderData);
  } catch (error: any) {
    console.error('Error reordering navigation items:', error);
    return false;
  }
}; 