import axiosInstance from "../../axiosConfig";
import { uploadImagesWithPresignedUrls } from "../presignedUrlService";
import {
  showSuccessMessage,
  showErrorMessage,
  showLoading,
  closeLoading,
} from "../../swalConfig";
import { AxiosError } from "axios";

// API Response interface
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Simplified Banner types based on new API documentation
export interface Banner {
  id?: string;
  title: string;
  description?: string;
  type: "carousel" | "single";
  section_type: string;
  page?: string;
  section?: string;
  position?: number;
  images: {
    mobile: string[];
    desktop: string[];
  };
  desktop_image_url?: string;
  mobile_image_url?: string;
  url?: string; // Add URL field for banner click redirect
  link_url?: string; // Keep for backward compatibility
  alt_text?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BannerSectionResponse {
  success: boolean;
  data: {
    section: string;
    page: string;
    banners: Banner[];
    total: number;
  };
  message?: string;
}

export interface SingleBannerResponse {
  success: boolean;
  data: Banner;
  message?: string;
}

// Section configuration type
interface SectionConfig {
  endpoint: string;
  label: string;
  type: "carousel" | "single";
  maxImages: number;
}

// Section configurations
export const SECTION_CONFIG: {
  home: Record<string, SectionConfig>;
  category: Record<string, SectionConfig>;
  checkout: Record<string, SectionConfig>;
} = {
  home: {
    hero_carousel: {
      endpoint: "hero-carousel",
      label: "Hero Carousel",
      type: "carousel",
      maxImages: 8,
    },
    sale_banner: {
      endpoint: "sale-banner",
      label: "Sale Banner",
      type: "single",
      maxImages: 1,
    },
    mega_sales: {
      endpoint: "mega-sales",
      label: "Mega Sales",
      type: "single",
      maxImages: 1,
    },
    deals_banner: {
      endpoint: "deals-banner",
      label: "Deals Banner",
      type: "single",
      maxImages: 1,
    },
  },
  category: {
    banner_one: {
      endpoint: "banner-one",
      label: "Banner One",
      type: "single",
      maxImages: 1,
    },
    banner_two: {
      endpoint: "banner-two",
      label: "Banner Two",
      type: "single",
      maxImages: 1,
    },
    banner_three: {
      endpoint: "banner-three",
      label: "Banner Three",
      type: "single",
      maxImages: 1,
    },
    category_page: {
      endpoint: "category-page",
      label: "Category Page Banners",
      type: "carousel",
      maxImages: 4,
    },
  },
  checkout: {
    checkout_banner_one: {
      endpoint: "banner-one",
      label: "Checkout Banner One",
      type: "single",
      maxImages: 1,
    },
    checkout_banner_two: {
      endpoint: "banner-two",
      label: "Checkout Banner Two",
      type: "single",
      maxImages: 1,
    },
    checkout_banner_three: {
      endpoint: "banner-three",
      label: "Checkout Banner Three",
      type: "single",
      maxImages: 1,
    },
    checkout_banner_four: {
      endpoint: "banner-four",
      label: "Checkout Banner Four",
      type: "single",
      maxImages: 1,
    },
  },
};

// Helper function to handle API errors
const handleApiError = (error: unknown, defaultMessage: string) => {
  console.error(`API Error: ${defaultMessage}`, error);
  const errorMessage =
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message || defaultMessage;
  return errorMessage;
};

// Get banners for a specific section
export const getSectionBanners = async (
  page: "home" | "category" | "checkout",
  section: string
): Promise<Banner[]> => {
  try {
    const sectionConfig =
      SECTION_CONFIG[page][
        section as keyof (typeof SECTION_CONFIG)[typeof page]
      ];
    if (!sectionConfig) {
      throw new Error(`Invalid section: ${section} for page: ${page}`);
    }

    const response = await axiosInstance.get(
      `/admin/banners/${page}/${sectionConfig.endpoint}`
    );

    if (response.data.success) {
      return response.data.data.banners || [];
    } else {
      console.error(
        response.data.message || `Failed to fetch ${section} banners`
      );
      return [];
    }
  } catch (error) {
    handleApiError(error, `Failed to fetch ${section} banners`);
    return [];
  }
};

// Get all home page banners organized by sections
export const getHomeBanners = async (): Promise<{
  hero_carousel: Banner[];
  sale_banner: Banner[];
  mega_sales: Banner[];
  deals_banner: Banner[];
} | null> => {
  try {
    const sections = Object.keys(SECTION_CONFIG.home);
    const bannerPromises = sections.map((section) =>
      getSectionBanners("home", section)
    );

    const results = await Promise.all(bannerPromises);

    return {
      hero_carousel: results[0],
      sale_banner: results[1],
      mega_sales: results[2],
      deals_banner: results[3],
    };
  } catch (error) {
    handleApiError(error, "Failed to fetch home banners");
    return null;
  }
};

// Get all category page banners organized by sections
export const getCategoryBanners = async (): Promise<{
  banner_one: Banner[];
  banner_two: Banner[];
  banner_three: Banner[];
  category_page: Banner[];
} | null> => {
  try {
    const sections = Object.keys(SECTION_CONFIG.category);
    const bannerPromises = sections.map((section) =>
      getSectionBanners("category", section)
    );

    const results = await Promise.all(bannerPromises);

    return {
      banner_one: results[0],
      banner_two: results[1],
      banner_three: results[2],
      category_page: results[3],
    };
  } catch (error) {
    handleApiError(error, "Failed to fetch category banners");
    return null;
  }
};

// Get all checkout page banners organized by sections
export const getCheckoutBanners = async (): Promise<{
  checkout_banner_one: Banner[];
  checkout_banner_two: Banner[];
  checkout_banner_three: Banner[];
  checkout_banner_four: Banner[];
} | null> => {
  try {
    const sections = Object.keys(SECTION_CONFIG.checkout);
    const bannerPromises = sections.map((section) =>
      getSectionBanners("checkout", section)
    );

    const results = await Promise.all(bannerPromises);

    return {
      checkout_banner_one: results[0],
      checkout_banner_two: results[1],
      checkout_banner_three: results[2],
      checkout_banner_four: results[3],
    };
  } catch (error) {
    handleApiError(error, "Failed to fetch checkout banners");
    return null;
  }
};

// Get all banners (admin overview)
export const getAllBanners = async (): Promise<Banner[]> => {
  try {
    const response = await axiosInstance.get("/admin/banners");

    if (response.data.success) {
      return response.data.data || [];
    } else {
      console.error(response.data.message || "Failed to fetch banners");
      return [];
    }
  } catch (error) {
    handleApiError(error, "Failed to fetch banners");
    return [];
  }
};

// Get single banner by ID
export const getBanner = async (id: string): Promise<Banner | null> => {
  try {
    const response = await axiosInstance.get(`/admin/banners/${id}`);

    if (response.data.success) {
      const banner = response.data.data;
      if (banner) {
        // Add URL shortcuts for backward compatibility
        return {
          ...banner,
          desktop_image_url: banner.images?.desktop?.[0] || "",
          mobile_image_url: banner.images?.mobile?.[0] || "",
          page: banner.section_type?.split("-")?.[0] || "home",
          section: banner.section_type?.replace(/^(home|category)-/, "") || "",
        };
      }
      return banner;
    } else {
      console.error(response.data.message || "Failed to fetch banner");
      return null;
    }
  } catch (error) {
    handleApiError(error, "Failed to fetch banner");
    return null;
  }
};

// Create banner for specific section with file upload support using presigned URLs
export const createBannerWithFiles = async (
  page: "home" | "category" | "checkout",
  section: string,
  bannerData: {
    title: string;
    url?: string;
    desktopFiles?: File[];
    mobileFiles?: File[];
  }
): Promise<{ success: boolean; data?: Banner; message?: string }> => {
  try {
    const sectionConfig =
      SECTION_CONFIG[page][
        section as keyof (typeof SECTION_CONFIG)[typeof page]
      ];
    if (!sectionConfig) {
      return {
        success: false,
        message: `Invalid section: ${section} for page: ${page}`,
      };
    }

    // Validate that at least one file is provided
    const { desktopFiles = [], mobileFiles = [] } = bannerData;
    if (desktopFiles.length === 0 && mobileFiles.length === 0) {
      return {
        success: false,
        message: "At least one image file (mobile or desktop) is required",
      };
    }

    // Upload desktop files using presigned URLs
    let desktopUrls: string[] = [];
    if (desktopFiles.length > 0) {
      const uploadedDesktopImages = await uploadImagesWithPresignedUrls(
        desktopFiles,
        "banners/temp",
        "admin"
      );

      if (!uploadedDesktopImages) {
        return {
          success: false,
          message: "Failed to upload desktop images",
        };
      }

      // Backend expects clean URLs (without query parameters)
      desktopUrls = uploadedDesktopImages.map((img) => img.url);
    }

    // Upload mobile files using presigned URLs
    let mobileUrls: string[] = [];
    if (mobileFiles.length > 0) {
      const uploadedMobileImages = await uploadImagesWithPresignedUrls(
        mobileFiles,
        "banners/temp",
        "admin"
      );

      if (!uploadedMobileImages) {
        return {
          success: false,
          message: "Failed to upload mobile images",
        };
      }

      // Backend expects clean URLs (without query parameters)
      mobileUrls = uploadedMobileImages.map((img) => img.url);
    }

    // Prepare payload according to backend documentation
    const payload = {
      title: bannerData.title,
      url: bannerData.url,
      files: {
        mobile: mobileUrls,
        desktop: desktopUrls,
      },
    };

    const response = await axiosInstance.post(
      `/admin/banners/${page}/${sectionConfig.endpoint}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: "Banner created successfully!",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to create banner",
      };
    }
  } catch (error) {
    const errorMessage =
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to create banner with files";
    console.error("Create banner with files error:", error);
    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Update banner by ID with files using presigned URLs
export const updateBannerWithPresignedUrls = async (
  id: string,
  bannerData: {
    title?: string;
    is_active?: boolean;
    desktopFiles?: File[];
    mobileFiles?: File[];
  }
): Promise<{ success: boolean; data?: Banner; message?: string }> => {
  try {
    // Upload new images if provided
    const payload: {
      title?: string;
      is_active?: boolean;
      files?: {
        mobile: string[];
        desktop: string[];
      };
    } = {};

    // Add title if provided
    if (bannerData.title !== undefined) {
      payload.title = bannerData.title;
    }

    // Add active status if provided
    if (bannerData.is_active !== undefined) {
      payload.is_active = bannerData.is_active;
    }

    // Handle file uploads
    if (bannerData.desktopFiles?.length || bannerData.mobileFiles?.length) {
      const files: { mobile: string[]; desktop: string[] } = {
        mobile: [],
        desktop: [],
      };

      // Upload desktop files
      if (bannerData.desktopFiles?.length) {
        const uploadedDesktop = await uploadImagesWithPresignedUrls(
          bannerData.desktopFiles,
          "banners/temp",
          "admin"
        );

        if (!uploadedDesktop) {
          return {
            success: false,
            message: "Failed to upload desktop images",
          };
        }

        files.desktop = uploadedDesktop.map((img) => img.url);
      }

      // Upload mobile files
      if (bannerData.mobileFiles?.length) {
        const uploadedMobile = await uploadImagesWithPresignedUrls(
          bannerData.mobileFiles,
          "banners/temp",
          "admin"
        );

        if (!uploadedMobile) {
          return {
            success: false,
            message: "Failed to upload mobile images",
          };
        }

        files.mobile = uploadedMobile.map((img) => img.url);
      }

      payload.files = files;
    }

    const response = await axiosInstance.put(`/admin/banners/${id}`, payload);

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: "Banner updated successfully!",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to update banner",
      };
    }
  } catch (error) {
    const errorMessage =
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to update banner";
    console.error("Update banner with presigned URLs error:", error);
    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Update banner by ID (simple data update without files)
export const updateBanner = async (
  id: string,
  bannerData: Partial<Banner>
): Promise<{ success: boolean; data?: Banner; message?: string }> => {
  try {
    const response = await axiosInstance.put(
      `/admin/banners/${id}`,
      bannerData
    );

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: "Banner updated successfully!",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to update banner",
      };
    }
  } catch (error) {
    const errorMessage =
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to update banner";
    console.error("Update banner error:", error);
    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Delete banner by ID
export const deleteBanner = async (
  id: string,
  showConfirmation: boolean = true
): Promise<{ success: boolean; message?: string }> => {
  try {
    if (showConfirmation) {
      const { isConfirmed } = await import("sweetalert2").then((Swal) =>
        Swal.default.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
        })
      );

      if (!isConfirmed) {
        return { success: false, message: "Deletion cancelled" };
      }
    }

    const response = await axiosInstance.delete(`/admin/banners/${id}`);

    if (response.data.success) {
      return {
        success: true,
        message: "Banner deleted successfully!",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to delete banner",
      };
    }
  } catch (error) {
    const errorMessage =
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to delete banner";
    console.error("Delete banner error:", error);
    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Upload banner images (if you have a separate upload endpoint)
export const uploadBannerImages = async (
  files: File[],
  deviceType: "mobile" | "desktop"
): Promise<{ success: boolean; urls?: string[]; message?: string }> => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append(`images`, file);
    });
    formData.append("device_type", deviceType);

    const response = await axiosInstance.post(
      "/admin/banners/upload-images",
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      return {
        success: true,
        urls: response.data.data?.urls || response.data.urls,
        message: "Images uploaded successfully!",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to upload images",
      };
    }
  } catch (error) {
    const errorMessage =
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to upload images";
    console.error("Upload images error:", error);
    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Upload single banner image (singular version for create page)
export const uploadBannerImage = async (
  file: File,
  deviceType: "mobile" | "desktop"
): Promise<{ success: boolean; url?: string; message?: string }> => {
  const result = await uploadBannerImages([file], deviceType);
  return {
    success: result.success,
    url: result.urls?.[0],
    message: result.message,
  };
};

// Helper function to get section label
export const getSectionLabel = (
  page: "home" | "category" | "checkout",
  section: string
): string => {
  const sectionConfig =
    SECTION_CONFIG[page]?.[
      section as keyof (typeof SECTION_CONFIG)[typeof page]
    ];
  return sectionConfig?.label || section;
};

// Helper function to get section type
export const getSectionType = (
  page: "home" | "category" | "checkout",
  section: string
): "carousel" | "single" => {
  const sectionConfig =
    SECTION_CONFIG[page]?.[
      section as keyof (typeof SECTION_CONFIG)[typeof page]
    ];
  return sectionConfig?.type || "single";
};

// Helper function to get max images for section
export const getMaxImages = (
  page: "home" | "category" | "checkout",
  section: string
): number => {
  const sectionConfig =
    SECTION_CONFIG[page]?.[
      section as keyof (typeof SECTION_CONFIG)[typeof page]
    ];
  return sectionConfig?.maxImages || 1;
};

// Export section options for compatibility with existing code
export const SECTION_OPTIONS = {
  home: Object.entries(SECTION_CONFIG.home).map(([key, config]) => ({
    value: key,
    label: config.label,
    type: config.type,
    maxImages: config.maxImages,
  })),
  category: Object.entries(SECTION_CONFIG.category).map(([key, config]) => ({
    value: key,
    label: config.label,
    type: config.type,
    maxImages: config.maxImages,
  })),
  checkout: Object.entries(SECTION_CONFIG.checkout).map(([key, config]) => ({
    value: key,
    label: config.label,
    type: config.type,
    maxImages: config.maxImages,
  })),
};

// Create banner with presigned URL support for files
export const createBannerWithPresignedUrls = async (
  page: "home" | "category" | "checkout",
  section: string,
  bannerData: {
    title: string;
    desktopFiles?: File[];
    mobileFiles?: File[];
  }
): Promise<{ success: boolean; data?: Banner; message?: string }> => {
  try {
    const sectionConfig =
      SECTION_CONFIG[page][
        section as keyof (typeof SECTION_CONFIG)[typeof page]
      ];
    if (!sectionConfig) {
      return {
        success: false,
        message: `Invalid section: ${section} for page: ${page}`,
      };
    }

    const { desktopFiles = [], mobileFiles = [] } = bannerData;

    // Validate image count based on section type
    if (sectionConfig.type === "single") {
      if (mobileFiles.length > 1 || desktopFiles.length > 1) {
        return {
          success: false,
          message: "Single banner type can only have 1 image per device type",
        };
      }
    } else if (sectionConfig.type === "carousel") {
      if (
        mobileFiles.length > sectionConfig.maxImages ||
        desktopFiles.length > sectionConfig.maxImages
      ) {
        return {
          success: false,
          message: `Carousel can have maximum ${sectionConfig.maxImages} images per device type`,
        };
      }
    }

    // Validate that at least one image is provided
    if (mobileFiles.length === 0 && desktopFiles.length === 0) {
      return {
        success: false,
        message: "At least one image (mobile or desktop) is required",
      };
    }

    // Upload images using presigned URLs
    const desktopUrls: string[] = [];
    const mobileUrls: string[] = [];

    if (desktopFiles.length > 0) {
      const uploadedDesktop = await uploadImagesWithPresignedUrls(
        desktopFiles,
        "banners/temp",
        "admin"
      );

      if (!uploadedDesktop) {
        return {
          success: false,
          message: "Failed to upload desktop images",
        };
      }

      desktopUrls.push(...uploadedDesktop.map((img) => img.url));
    }

    if (mobileFiles.length > 0) {
      const uploadedMobile = await uploadImagesWithPresignedUrls(
        mobileFiles,
        "banners/temp",
        "admin"
      );

      if (!uploadedMobile) {
        return {
          success: false,
          message: "Failed to upload mobile images",
        };
      }

      mobileUrls.push(...uploadedMobile.map((img) => img.url));
    }

    const payload = {
      title: bannerData.title,
      type: sectionConfig.type,
      images: {
        desktop: desktopUrls,
        mobile: mobileUrls,
      },
    };

    const response = await axiosInstance.post(
      `/admin/banners/${page}/${sectionConfig.endpoint}`,
      payload
    );

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: "Banner created successfully!",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to create banner",
      };
    }
  } catch (error) {
    const errorMessage =
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to create banner";
    console.error("Create banner error:", error);
    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Create banner for specific section (URL-based)
export const createBanner = async (
  page: "home" | "category" | "checkout",
  section: string,
  bannerData: {
    title: string;
    url?: string;
    images: {
      mobile: string[];
      desktop: string[];
    };
  }
): Promise<{ success: boolean; data?: Banner; message?: string }> => {
  try {
    const sectionConfig =
      SECTION_CONFIG[page][
        section as keyof (typeof SECTION_CONFIG)[typeof page]
      ];
    if (!sectionConfig) {
      return {
        success: false,
        message: `Invalid section: ${section} for page: ${page}`,
      };
    }

    // Validate image count based on section type
    const { mobile, desktop } = bannerData.images;
    if (sectionConfig.type === "single") {
      if (mobile.length > 1 || desktop.length > 1) {
        return {
          success: false,
          message: "Single banner type can only have 1 image per device type",
        };
      }
    } else if (sectionConfig.type === "carousel") {
      if (
        mobile.length > sectionConfig.maxImages ||
        desktop.length > sectionConfig.maxImages
      ) {
        return {
          success: false,
          message: `Carousel can have maximum ${sectionConfig.maxImages} images per device type`,
        };
      }
    }

    // Validate that at least one image is provided
    if (mobile.length === 0 && desktop.length === 0) {
      return {
        success: false,
        message: "At least one image (mobile or desktop) is required",
      };
    }

    const payload = {
      title: bannerData.title,
      url: bannerData.url,
      type: sectionConfig.type,
      images: bannerData.images,
    };

    const response = await axiosInstance.post(
      `/admin/banners/${page}/${sectionConfig.endpoint}`,
      payload
    );

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: "Banner created successfully!",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to create banner",
      };
    }
  } catch (error) {
    const errorMessage =
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Failed to create banner";
    console.error("Create banner error:", error);
    return {
      success: false,
      message: errorMessage,
    };
  }
};

// Export the main update function with presigned URLs support
/**
 * Update banner URL only
 */
export const updateBannerUrl = async (
  id: string,
  url: string
): Promise<{ success: boolean; data?: Banner; message?: string }> => {
  try {
    showLoading("Updating banner URL...");

    const response = await axiosInstance.put(`/admin/banners/${id}`, {
      url: url,
    });

    closeLoading();

    if (response.data.success) {
      showSuccessMessage("Banner URL updated successfully!");
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } else {
      showErrorMessage(response.data.message || "Failed to update banner URL");
      return {
        success: false,
        message: response.data.message,
      };
    }
  } catch (error) {
    closeLoading();
    const axiosError = error as AxiosError<ApiResponse<null>>;

    const errorMessage =
      axiosError.response?.data?.message || "Failed to update banner URL";
    showErrorMessage(errorMessage);

    return {
      success: false,
      message: errorMessage,
    };
  }
};

export { updateBannerWithPresignedUrls as updateBannerWithFiles };
