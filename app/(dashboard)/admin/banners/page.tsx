"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faPlus,
  faTrash,
  faXmark,
  faEdit,
  faSave,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import {
  showSuccessMessage,
  showErrorMessage,
  showConfirmation,
} from "@/app/lib/swalConfig";
import {
  getHomeBanners,
  getCategoryBanners,
  getCheckoutBanners,
  createBanner,
  createBannerWithFiles,
  uploadBannerImages,
  deleteBanner,
  updateBannerUrl,
  Banner,
} from "@/app/lib/services/admin/bannerService";
import Image from "next/image";
import ImageModal from "@/app/components/common/ImageModal";

// Banner data type for the form
interface BannerFormData {
  id?: string; // Add ID for existing banners
  desktop: File | null;
  mobile: File | null;
  desktopUrl?: string; // Add URL for existing images
  mobileUrl?: string; // Add URL for existing images
  url?: string; // Add URL for banner click redirect
  useSameForBoth: boolean;
  isExisting?: boolean; // Flag to indicate if this is an existing banner
  sectionKey?: string; // Section key for unified display
}

// Section configuration
interface SectionConfig {
  title: string;
  maxBanners: number;
  sectionType: string;
  apiSection: string; // Add mapping to API section names
}

const SECTION_CONFIGS: Record<string, SectionConfig> = {
  heroCarousel: {
    title: "Hero Carousel",
    maxBanners: 8,
    sectionType: "home-hero-carousel",
    apiSection: "hero_carousel",
  },
  salesBanner: {
    title: "Sales Banner",
    maxBanners: 1,
    sectionType: "home-sales-banner",
    apiSection: "sale_banner",
  },
  megaSales: {
    title: "Mega Sales",
    maxBanners: 6,
    sectionType: "home-mega-sales",
    apiSection: "mega_sales",
  },
  dealsBanner: {
    title: "Deals Banner",
    maxBanners: 4,
    sectionType: "home-deals-banner",
    apiSection: "deals_banner",
  },
  categoryBannerOne: {
    title: "Promotion Banner One",
    maxBanners: 1,
    sectionType: "category-banner-one",
    apiSection: "banner_one",
  },
  categoryBannerTwo: {
    title: "Promotion Banner Two",
    maxBanners: 1,
    sectionType: "category-banner-two",
    apiSection: "banner_two",
  },
  categoryBannerThree: {
    title: "Promotion Banner Three",
    maxBanners: 1,
    sectionType: "category-banner-three",
    apiSection: "banner_three",
  },
  categoryPageBanners: {
    title: "Category Hero Section Banners",
    maxBanners: 4,
    sectionType: "category-page-banners",
    apiSection: "category_page",
  },
  checkoutBannerOne: {
    title: "Checkout Banner One",
    maxBanners: 1,
    sectionType: "checkout-banner-one",
    apiSection: "checkout_banner_one",
  },
  checkoutBannerTwo: {
    title: "Checkout Banner Two",
    maxBanners: 1,
    sectionType: "checkout-banner-two",
    apiSection: "checkout_banner_two",
  },
  checkoutBannerThree: {
    title: "Checkout Banner Three",
    maxBanners: 1,
    sectionType: "checkout-banner-three",
    apiSection: "checkout_banner_three",
  },
  checkoutBannerFour: {
    title: "Checkout Banner Four",
    maxBanners: 1,
    sectionType: "checkout-banner-four",
    apiSection: "checkout_banner_four",
  },
  checkoutBanners: {
    title: "Checkout Page Banners",
    maxBanners: 4,
    sectionType: "checkout-banners",
    apiSection: "checkout_banners",
  },
};

// Single Banner Upload Component
interface BannerUploadProps {
  title: string;
  desktopImage: File | null;
  mobileImage: File | null;
  desktopUrl?: string;
  mobileUrl?: string;
  url?: string; // Add URL for banner click redirect
  onDesktopImageChange: (image: File | null) => void;
  onMobileImageChange: (image: File | null) => void;
  onUrlChange: (url: string) => void; // Add URL change handler
  useSameForBoth: boolean;
  onUseSameForBothChange: (value: boolean) => void;
  onRemove: () => void;
  showRemove: boolean;
  uniqueId?: string; // Add unique ID prop
  sectionKey?: string; // Add section key prop
  bannerId?: string; // Banner ID for existing banners
  isExisting?: boolean; // Flag to indicate if this is an existing banner
  onBannerDelete?: (bannerId: string) => void; // Callback for banner deletion
}

const BannerUpload: React.FC<BannerUploadProps> = ({
  title,
  desktopImage,
  mobileImage,
  desktopUrl,
  mobileUrl,
  url,
  onDesktopImageChange,
  onMobileImageChange,
  onUrlChange,
  useSameForBoth,
  onUseSameForBothChange,
  onRemove,
  showRemove,
  uniqueId = "",
  sectionKey = "",
  bannerId,
  isExisting = false,
  onBannerDelete,
}) => {
  const [fullscreenImage, setFullscreenImage] = useState<{
    src: string;
    type: string;
  } | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isUrlEditing, setIsUrlEditing] = useState(false);
  const [tempUrl, setTempUrl] = useState(url || "");
  const isHandlingChange = useRef(false);

  // Update tempUrl when url prop changes
  React.useEffect(() => {
    setTempUrl(url || "");
  }, [url]);

  const handleStartUrlEdit = () => {
    setIsUrlEditing(true);
    setTempUrl(url || "");
  };

  const handleSaveUrl = async () => {
    if (!bannerId) {
      // For new banners, just update the local state
      onUrlChange(tempUrl);
      setIsUrlEditing(false);
      return;
    }

    // For existing banners, call the API
    try {
      const result = await updateBannerUrl(bannerId, tempUrl);
      if (result.success) {
        onUrlChange(tempUrl);
        setIsUrlEditing(false);
        // Refresh the page data if needed
        if (window.location) {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error("Error updating banner URL:", error);
      // Reset temp URL on error
      setTempUrl(url || "");
    }
  };

  const handleCancelUrlEdit = () => {
    setTempUrl(url || "");
    setIsUrlEditing(false);
  };

  const handleDesktopFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target?.files?.item(0) || null;

    console.log(`[${title}] Desktop file change:`, {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      useSameForBoth,
    });

    onDesktopImageChange(file);

    if (useSameForBoth && file) {
      console.log(
        `[${title}] Auto-copying desktop file to mobile due to useSameForBoth`
      );
      // Create a new File object reference to avoid sharing the same object
      const clonedFile = new File([file], file.name, { type: file.type });
      onMobileImageChange(clonedFile);
    } else if (useSameForBoth && !file) {
      // If the desktop image is removed, also remove the mobile one
      onMobileImageChange(null);
    }

    event.target.value = "";
  };

  const handleMobileFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.item(0) || null;
    console.log(`[${title}] Mobile file change:`, {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      useSameForBoth,
    });

    // If useSameForBoth is enabled, redirect upload to desktop field
    if (useSameForBoth && file) {
      console.log(
        `[${title}] Redirecting mobile upload to desktop due to useSameForBoth`
      );
      // When 'use same' is on, any upload should be treated as a desktop upload
      onDesktopImageChange(file);
      // And also copied to mobile
      const clonedFile = new File([file], file.name, { type: file.type });
      onMobileImageChange(clonedFile);
    } else {
      onMobileImageChange(file);
    }

    event.target.value = "";
  };

  const handleDeleteExistingBanner = async () => {
    if (!bannerId || !onBannerDelete) return;

    const result = await showConfirmation(
      "Delete Banner",
      "Are you sure you want to delete this banner? This action cannot be undone."
    );

    if (result.isConfirmed) {
      try {
        const deleteResult = await deleteBanner(bannerId, false); // false to skip built-in confirmation
        if (deleteResult.success) {
          showSuccessMessage("Banner deleted successfully!");
          onBannerDelete(bannerId);
        } else {
          showErrorMessage(deleteResult.message || "Failed to delete banner");
        }
      } catch (error) {
        console.error("Error deleting banner:", error);
        showErrorMessage("Failed to delete banner. Please try again.");
      }
    }
  };

  const handleRemoveDesktopImage = async () => {
    // If this is an existing banner with only desktop image, delete the entire banner
    if (isExisting && bannerId && desktopUrl && !mobileUrl) {
      await handleDeleteExistingBanner();
    } else {
      onDesktopImageChange(null);
      if (useSameForBoth) {
        onMobileImageChange(null);
      }
    }
  };

  const handleRemoveMobileImage = async () => {
    // If this is an existing banner with only mobile image, delete the entire banner
    if (isExisting && bannerId && mobileUrl && !desktopUrl) {
      await handleDeleteExistingBanner();
    } else {
      onMobileImageChange(null);
    }
  };

  const handleViewImage = (src: string, type: string) => {
    setFullscreenImage({ src, type });
    setIsImageModalOpen(true);
  };

  const handleUseSameChange = useCallback(
    (checked: boolean) => {
      console.log(`[${title}] Use same for mobile changed:`, {
        checked,
        hasDesktopImage: !!desktopImage,
        hasDesktopUrl: !!desktopUrl,
        hasMobileImage: !!mobileImage,
        hasMobileUrl: !!mobileUrl,
        currentUseSameForBoth: useSameForBoth,
        isHandlingChange: isHandlingChange.current,
      });

      // Prevent infinite loop by checking if we're already handling a change
      if (isHandlingChange.current) {
        console.log(`[${title}] Already handling change, skipping`);
        return;
      }

      // Prevent infinite loop by checking if the state is actually changing
      if (checked === useSameForBoth) {
        console.log(`[${title}] State unchanged, skipping update`);
        return;
      }

      // Set flag to prevent re-entry
      isHandlingChange.current = true;

      try {
        if (checked) {
          // When checking "use same for both", copy desktop to mobile first, then update state
          if (desktopImage) {
            console.log(`[${title}] Copying desktop file to mobile:`, {
              fileName: desktopImage.name,
              fileSize: desktopImage.size,
              fileType: desktopImage.type,
            });
            // Create a new File object reference to avoid sharing the same object
            const clonedFile = new File([desktopImage], desktopImage.name, {
              type: desktopImage.type,
            });
            onMobileImageChange(clonedFile);
          } else if (desktopUrl) {
            console.log(
              `[${title}] Desktop URL exists, backend will handle mobile copy:`,
              desktopUrl
            );
            // For existing images (URLs), the backend should handle using desktop for mobile
            // We don't need to do anything here as the backend will use desktop for mobile
          } else {
            console.log(`[${title}] No desktop image/URL to copy to mobile`);
          }

          // Finally, update checkbox state
          onUseSameForBothChange(true);
        } else {
          // When unchecking "use same for both", clear mobile image first
          console.log(`[${title}] Clearing mobile image for separate upload`);
          onMobileImageChange(null);

          // Then update checkbox state
          onUseSameForBothChange(false);
        }
      } finally {
        // Reset flag after a short delay to allow state updates to complete
        setTimeout(() => {
          isHandlingChange.current = false;
        }, 100);
      }
    },
    [
      title,
      desktopImage,
      desktopUrl,
      mobileImage,
      mobileUrl,
      useSameForBoth,
      onUseSameForBothChange,
      onMobileImageChange,
    ]
  );

  const renderImageUpload = (
    image: File | null,
    imageUrl: string | undefined,
    type: "desktop" | "mobile",
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
    onRemoveImage: () => void,
    disabled: boolean = false
  ) => {
    const inputId = `${sectionKey}-${uniqueId}-${type}-${title
      .replace(/\s+/g, "-")
      .toLowerCase()}`;
    const hasImage = image || imageUrl;
    const imageSrc = image ? URL.createObjectURL(image) : imageUrl;

    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="xsmall-semibold text-gray-110 capitalize">{type}</h4>
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
          disabled={disabled}
          id={inputId}
        />

        {hasImage && imageSrc ? (
          <div className="relative group">
            <div className="aspect-[4/3] border border-gray-line rounded-lg overflow-hidden bg-gray-40">
              <img
                src={imageSrc}
                alt={`${type} banner`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>

            {/* Action buttons */}
            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => handleViewImage(imageSrc, type)}
                className="bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center hover:bg-blue-600 transition"
                title="View"
              >
                <span className="text-xs">👁</span>
              </button>
              {/* Only show delete button for new uploads (no imageUrl), not for existing uploaded images */}
              {!imageUrl && (
                <button
                  type="button"
                  onClick={onRemoveImage}
                  className="bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center hover:bg-red-600 transition"
                  title="Delete"
                  disabled={disabled}
                >
                  <FontAwesomeIcon icon={faTrash} className="h-2 w-2" />
                </button>
              )}
            </div>

            {/* Uploaded badge */}
            {imageUrl && !image && (
              <div className="absolute bottom-1 left-1">
                <span className="bg-green-500 text-white px-2 py-1 rounded xxxsmall">
                  Uploaded
                </span>
              </div>
            )}
          </div>
        ) : (
          <label
            htmlFor={inputId}
            className={`aspect-[4/3] border-2 border-dashed border-gray-line rounded-lg flex flex-col items-center justify-center text-gray-50 hover:text-blue-500 hover:border-blue-500 transition cursor-pointer ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <span className="text-lg mb-1">+</span>
            <span className="xxxsmall text-center">
              {disabled && type === "mobile"
                ? "Upload to desktop instead"
                : `Add ${type} image`}
            </span>
          </label>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-line relative">
      {/* Action buttons in top-right corner */}
      <div className="absolute -top-2 -right-2 flex gap-1 z-10">
        {/* Edit URL button for existing banners */}
        {isExisting && !isUrlEditing && (
          <button
            type="button"
            onClick={handleStartUrlEdit}
            className="bg-blue-600 text-white rounded-full h-6 w-6 flex items-center justify-center hover:bg-blue-700 transition"
            title="Edit URL"
          >
            <FontAwesomeIcon icon={faEdit} className="h-2 w-2" />
          </button>
        )}

        {/* Delete/Remove button */}
        {showRemove && (
          <button
            type="button"
            onClick={
              isExisting && bannerId ? handleDeleteExistingBanner : onRemove
            }
            className="bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center hover:bg-red-600 transition"
            title={isExisting ? "Delete Banner" : "Remove Banner"}
          >
            <FontAwesomeIcon icon={faTrash} className="h-2 w-2" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h3 className="small-semibold text-black">{title}</h3>
        {/* Hide checkbox if images are already uploaded (existing banners) */}
        {!(desktopUrl || mobileUrl) && (
          <label className="flex items-center gap-2 xxxsmall cursor-pointer">
            <input
              type="checkbox"
              checked={useSameForBoth}
              onChange={(e) => handleUseSameChange(e.target.checked)}
              className="rounded border-gray-line focus:ring-2 focus:ring-blue-00 w-3 h-3 select-none"
            />
            <span className="text-gray-110 xsmall-medium select-none">
              Use same image for mobile
            </span>
          </label>
        )}
      </div>

      {/* URL Input Field */}
      <div className="mb-3">
        <label className="block text-gray-110 xsmall-semibold mb-1">
          Banner URL (optional)
        </label>

        {!isExisting || isUrlEditing ? (
          // Editing mode (new banners are always editable, existing banners when in edit mode)
          <div className="flex gap-2">
            <input
              type="url"
              value={isExisting ? tempUrl : url || ""}
              onChange={(e) =>
                isExisting
                  ? setTempUrl(e.target.value)
                  : onUrlChange(e.target.value)
              }
              placeholder="https://example.com or /category/electronics"
              className="flex-1 px-3 py-2 border border-gray-line rounded-lg focus:ring-2 focus:ring-blue-00 focus:border-blue-00 xsmall"
              autoFocus={isUrlEditing}
            />
            {isExisting && isUrlEditing && (
              <>
                <button
                  type="button"
                  onClick={handleSaveUrl}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  title="Save URL"
                >
                  <FontAwesomeIcon icon={faSave} className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={handleCancelUrlEdit}
                  className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  title="Cancel"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
        ) : (
          // Display mode (existing banners only) - same styling as input
          <div className="w-full px-3 py-2 border border-gray-line rounded-lg xsmall text-gray-700">
            {url || "No URL set"}
          </div>
        )}

        {/* Only show in editing mode or for new banners */}
        {(isUrlEditing || !isExisting) && (
          <p className="text-gray-50 xxxsmall mt-1">
            Enter URL for banner click redirect. Can be external (https://) or
            internal (/category/...)
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {renderImageUpload(
          desktopImage,
          desktopUrl, // Always show existing image
          "desktop",
          handleDesktopFileChange,
          handleRemoveDesktopImage,
          false
        )}

        {useSameForBoth ? (
          // Show a preview for mobile when using same image
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="xsmall-semibold text-gray-110 capitalize">
                mobile
              </h4>
            </div>
            {desktopImage || desktopUrl ? (
              // Show preview of desktop image for mobile
              <div className="aspect-[4/3] border border-gray-line rounded-lg overflow-hidden bg-gray-40 relative group">
                <Image
                  height={300}
                  width={400}
                  src={
                    desktopImage
                      ? URL.createObjectURL(desktopImage)
                      : desktopUrl!
                  }
                  alt="mobile preview (same as desktop)"
                  className="w-full h-full object-cover"
                />
                {/* Action buttons for mobile preview */}
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() =>
                      handleViewImage(
                        desktopImage
                          ? URL.createObjectURL(desktopImage)
                          : desktopUrl!,
                        "mobile"
                      )
                    }
                    className="bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center hover:bg-blue-600 transition"
                    title="View"
                  >
                    <span className="text-xs">👁</span>
                  </button>
                </div>
              </div>
            ) : (
              // Show placeholder when no desktop image
              <div className="aspect-[4/3] border border-dashed border-gray-line rounded-lg bg-gray-40 flex flex-col items-center justify-center text-gray-50">
                <span className="text-lg mb-1">+</span>
                <span className="xxxsmall text-center">
                  Will use desktop image
                </span>
              </div>
            )}
          </div>
        ) : (
          renderImageUpload(
            mobileImage,
            mobileUrl, // Always show existing image
            "mobile",
            handleMobileFileChange,
            handleRemoveMobileImage,
            useSameForBoth // Disable mobile upload when using same image for both
          )
        )}
      </div>

      {/* Fullscreen Modal */}
      <ImageModal
        isOpen={isImageModalOpen}
        imageUrl={fullscreenImage?.src || ""}
        fileName={`Banner ${fullscreenImage?.type || ""}`}
        onClose={() => {
          setIsImageModalOpen(false);
          setFullscreenImage(null);
        }}
      />

      <p className="text-gray-50 xxxsmall mt-2">
        Supported formats: JPG, PNG, WebP. Max file size: 5MB <span className="font-bold">(16x9 for desktop and Mobile both.)</span>
      </p>
       
    </div>
  );
};

// Section Component with dynamic banners
interface BannerSectionProps {
  config: SectionConfig;
  banners: BannerFormData[];
  onBannersChange: (
    value:
      | BannerFormData[]
      | ((prevBanners: BannerFormData[]) => BannerFormData[])
  ) => void;
  onSave: () => void;
  loading: boolean;
}

const BannerSection: React.FC<BannerSectionProps> = ({
  config,
  banners,
  onBannersChange,
  onSave,
  loading,
}) => {
  const addBanner = () => {
    if (banners.length < config.maxBanners) {
      onBannersChange([
        ...banners,
        {
          id: generateUniqueId(config.sectionType),
          desktop: null,
          mobile: null,
          url: "",
          useSameForBoth: false,
        },
      ]);
    }
  };

  const removeBanner = (index: number) => {
    onBannersChange(banners.filter((_, i) => i !== index));
  };

  const updateBanner = (index: number, updates: Partial<BannerFormData>) => {
    console.log(`[${config.title}] Queuing update for banner ${index + 1}:`, {
      updates,
    });

    onBannersChange((prevBanners: BannerFormData[]) =>
      prevBanners.map((banner: BannerFormData, i: number) =>
        i === index ? { ...banner, ...updates } : banner
      )
    );
  };

  const handleBannerDelete = async (bannerId: string) => {
    // Remove the deleted banner from the state immediately for better UX
    onBannersChange(banners.filter((banner) => banner.id !== bannerId));

    // Optionally reload the section to ensure consistency
    // This is a good practice but not strictly necessary since we update state above
  };

  const hasValidBanners = banners.some(
    (banner) => banner.desktop || banner.mobile
  );

  return (
    <div className="bg-gray-bg rounded-lg p-4 border border-gray-line">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <h2 className="title-4-semibold text-black">{config.title}</h2>
          <p className="text-gray-50 xxxsmall">
            {banners.length} of {config.maxBanners} banners added
          </p>
        </div>
        <button
          onClick={onSave}
          disabled={loading || !hasValidBanners}
          className="bg-blue-00 text-white py-2 px-4 rounded-lg hover:bg-blue-10 transition disabled:opacity-50 disabled:cursor-not-allowed small-semibold whitespace-nowrap flex-shrink-0"
        >
          {loading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Save Section
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map((banner, index) => (
          <BannerUpload
            key={`${config.title}-${index}-${banner.id || "new"}`}
            title={`Banner ${index + 1}`}
            desktopImage={banner.desktop}
            mobileImage={banner.mobile}
            desktopUrl={banner.desktopUrl}
            mobileUrl={banner.mobileUrl}
            url={banner.url}
            onDesktopImageChange={(image) =>
              updateBanner(index, { desktop: image })
            }
            onMobileImageChange={(image) =>
              updateBanner(index, { mobile: image })
            }
            onUrlChange={(url) => updateBanner(index, { url })}
            useSameForBoth={banner.useSameForBoth}
            onUseSameForBothChange={(value) =>
              updateBanner(index, { useSameForBoth: value })
            }
            onRemove={() => removeBanner(index)}
            showRemove={
              banners.length > 1 ||
              config.maxBanners > 1 ||
              banner.isExisting ||
              false
            }
            uniqueId={banner.id || `${config.sectionType}-${index}`}
            sectionKey={config.sectionType}
            bannerId={banner.id}
            isExisting={banner.isExisting || false}
            onBannerDelete={handleBannerDelete}
          />
        ))}

        {banners.length < config.maxBanners && (
          <div
            className="bg-white border-2 border-dashed border-gray-line rounded-lg p-4 flex flex-col items-center justify-center text-gray-50 hover:text-blue-00 hover:border-blue-00 transition cursor-pointer min-h-[200px]"
            onClick={addBanner}
          >
            <FontAwesomeIcon icon={faPlus} className="h-6 w-6 mb-2" />
            <span className="xsmall-semibold">
              Add Banner {banners.length + 1}
            </span>
            <span className="xxxsmall text-center">
              Max {config.maxBanners} allowed
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Generate unique ID for new banners
const generateUniqueId = (sectionKey?: string) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const section = sectionKey ? `${sectionKey}_` : "";
  return `${section}banner_${timestamp}_${random}`;
};

// Main Banner Management Page
const BannerManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"home" | "category" | "checkout">(
    "home"
  );
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [initialLoading, setInitialLoading] = useState(true);

  // Section states
  const [heroCarousel, setHeroCarousel] = useState<BannerFormData[]>([
    {
      id: generateUniqueId("home-hero-carousel"),
      desktop: null,
      mobile: null,
      url: "",
      useSameForBoth: false,
    },
  ]);
  const [salesBanner, setSalesBanner] = useState<BannerFormData[]>([]);
  const [megaSales, setMegaSales] = useState<BannerFormData[]>([
    {
      id: generateUniqueId("home-mega-sales"),
      desktop: null,
      mobile: null,
      url: "",
      useSameForBoth: false,
    },
  ]);
  const [dealsBanner, setDealsBanner] = useState<BannerFormData[]>([
    {
      id: generateUniqueId("home-deals-banner"),
      desktop: null,
      mobile: null,
      url: "",
      useSameForBoth: false,
    },
  ]);
  const [categoryBannerOne, setCategoryBannerOne] = useState<BannerFormData[]>(
    []
  );
  const [categoryBannerTwo, setCategoryBannerTwo] = useState<BannerFormData[]>(
    []
  );
  const [categoryBannerThree, setCategoryBannerThree] = useState<
    BannerFormData[]
  >([]);
  const [categoryPageBanners, setCategoryPageBanners] = useState<
    BannerFormData[]
  >([]);

  // Checkout banner states - individual like category banners
  const [checkoutBannerOne, setCheckoutBannerOne] = useState<BannerFormData[]>(
    []
  );
  const [checkoutBannerTwo, setCheckoutBannerTwo] = useState<BannerFormData[]>(
    []
  );
  const [checkoutBannerThree, setCheckoutBannerThree] = useState<
    BannerFormData[]
  >([]);
  const [checkoutBannerFour, setCheckoutBannerFour] = useState<
    BannerFormData[]
  >([]);

  // Convert Banner object to BannerFormData
  const convertBannerToFormData = (banner: Banner): BannerFormData => {
    const desktopUrl = banner.images.desktop?.[0];
    const mobileUrl = banner.images.mobile?.[0];
    const useSameForBoth = desktopUrl === mobileUrl;

    return {
      id: banner.id,
      desktop: null,
      mobile: null,
      desktopUrl,
      mobileUrl: useSameForBoth ? desktopUrl : mobileUrl,
      url: banner.url,
      useSameForBoth,
      isExisting: true,
    };
  };

  // Load existing banners on component mount
  useEffect(() => {
    const loadExistingBanners = async () => {
      try {
        setInitialLoading(true);

        if (activeTab === "home") {
          const homeBanners = await getHomeBanners();
          if (homeBanners) {
            // Convert API banners to form data
            const heroCarouselData =
              homeBanners.hero_carousel?.length > 0
                ? homeBanners.hero_carousel.map(convertBannerToFormData)
                : [
                    {
                      id: generateUniqueId("home-hero-carousel"),
                      desktop: null,
                      mobile: null,
                      url: "",
                      useSameForBoth: false,
                    },
                  ];

            const salesBannerData =
              homeBanners.sale_banner?.length > 0
                ? homeBanners.sale_banner.map(convertBannerToFormData)
                : [];

            const megaSalesData =
              homeBanners.mega_sales?.length > 0
                ? homeBanners.mega_sales.map(convertBannerToFormData)
                : [
                    {
                      id: generateUniqueId("home-mega-sales"),
                      desktop: null,
                      mobile: null,
                      url: "",
                      useSameForBoth: false,
                    },
                  ];

            const dealsBannerData =
              homeBanners.deals_banner?.length > 0
                ? homeBanners.deals_banner.map(convertBannerToFormData)
                : [
                    {
                      id: generateUniqueId("home-deals-banner"),
                      desktop: null,
                      mobile: null,
                      url: "",
                      useSameForBoth: false,
                    },
                  ];

            setHeroCarousel(heroCarouselData);
            setSalesBanner(salesBannerData);
            setMegaSales(megaSalesData);
            setDealsBanner(dealsBannerData);
          }
        } else if (activeTab === "category") {
          const categoryBanners = await getCategoryBanners();
          if (categoryBanners) {
            const bannerOneData =
              categoryBanners.banner_one?.length > 0
                ? categoryBanners.banner_one.map(convertBannerToFormData)
                : [];

            const bannerTwoData =
              categoryBanners.banner_two?.length > 0
                ? categoryBanners.banner_two.map(convertBannerToFormData)
                : [];

            const bannerThreeData =
              categoryBanners.banner_three?.length > 0
                ? categoryBanners.banner_three.map(convertBannerToFormData)
                : [];

            setCategoryBannerOne(bannerOneData);
            setCategoryBannerTwo(bannerTwoData);
            setCategoryBannerThree(bannerThreeData);

            const categoryPageBannersData =
              categoryBanners.category_page?.length > 0
                ? categoryBanners.category_page.map(convertBannerToFormData)
                : [];

            setCategoryPageBanners(categoryPageBannersData);
          }
        } else if (activeTab === "checkout") {
          const checkoutBannersData = await getCheckoutBanners();
          if (checkoutBannersData) {
            // Load each checkout banner section individually
            const bannerOneData =
              checkoutBannersData.checkout_banner_one?.length > 0
                ? checkoutBannersData.checkout_banner_one.map(
                    convertBannerToFormData
                  )
                : [];

            const bannerTwoData =
              checkoutBannersData.checkout_banner_two?.length > 0
                ? checkoutBannersData.checkout_banner_two.map(
                    convertBannerToFormData
                  )
                : [];

            const bannerThreeData =
              checkoutBannersData.checkout_banner_three?.length > 0
                ? checkoutBannersData.checkout_banner_three.map(
                    convertBannerToFormData
                  )
                : [];

            const bannerFourData =
              checkoutBannersData.checkout_banner_four?.length > 0
                ? checkoutBannersData.checkout_banner_four.map(
                    convertBannerToFormData
                  )
                : [];

            setCheckoutBannerOne(bannerOneData);
            setCheckoutBannerTwo(bannerTwoData);
            setCheckoutBannerThree(bannerThreeData);
            setCheckoutBannerFour(bannerFourData);
          }
        }
      } catch (error) {
        console.error("Error loading existing banners:", error);
        showErrorMessage("Failed to load existing banners.");
      } finally {
        setInitialLoading(false);
      }
    };

    loadExistingBanners();
  }, [activeTab]);

  const handleSaveSection = async (
    sectionKey: string,
    banners: BannerFormData[]
  ) => {
    setLoading((prev) => ({ ...prev, [sectionKey]: true }));

    try {
      const config = SECTION_CONFIGS[sectionKey];
      const validBanners = banners.filter(
        (banner) =>
          banner.desktop ||
          banner.mobile ||
          banner.desktopUrl ||
          banner.mobileUrl
      );

      if (validBanners.length === 0) {
        showErrorMessage("Please add at least one banner with images.");
        return;
      }

      let hasErrors = false;
      const errorMessages: string[] = [];

      // Upload all banners in the section
      for (let i = 0; i < validBanners.length; i++) {
        const banner = validBanners[i];

        // Skip if this is an existing banner with no new files
        if (banner.isExisting && !banner.desktop && !banner.mobile) {
          continue;
        }

        try {
          const desktopUrls: string[] = [];
          const mobileUrls: string[] = [];

          // Check if we have new files to upload
          const hasNewFiles = banner.desktop || banner.mobile;
          const hasExistingUrls = banner.desktopUrl || banner.mobileUrl;

          console.log(`Banner ${i + 1} - Files:`, {
            hasDesktop: !!banner.desktop,
            hasMobile: !!banner.mobile,
            hasDesktopUrl: !!banner.desktopUrl,
            hasMobileUrl: !!banner.mobileUrl,
            useSameForBoth: banner.useSameForBoth,
          });

          // If we have new files, try the file-based approach first
          if (hasNewFiles && !hasExistingUrls) {
            console.log(`Banner ${i + 1} - Using file-based creation...`);

            const desktopFiles = banner.desktop ? [banner.desktop] : [];
            const mobileFiles = banner.mobile ? [banner.mobile] : [];

            console.log(`Banner ${i + 1} - File payload:`, {
              desktopFiles: desktopFiles.map((f) => ({
                name: f.name,
                size: f.size,
                type: f.type,
              })),
              mobileFiles: mobileFiles.map((f) => ({
                name: f.name,
                size: f.size,
                type: f.type,
              })),
              useSameForBoth: banner.useSameForBoth,
            });

            const bannerPayload = {
              title: `${config.title} ${
                validBanners.length > 1 ? i + 1 : ""
              } - ${new Date().toLocaleDateString()}`,
              url: banner.url,
              desktopFiles,
              mobileFiles,
            };

            const [page] = config.sectionType.split("-");
            const section = config.apiSection;

            const createResult = await createBannerWithFiles(
              page as "home" | "category" | "checkout",
              section,
              bannerPayload
            );

            console.log(`Banner ${i + 1} - File-based result:`, {
              success: createResult.success,
              message: createResult.message,
            });

            if (!createResult.success) {
              hasErrors = true;
              errorMessages.push(
                `Failed to create Banner ${i + 1}: ${
                  createResult.message || "Unknown error"
                }`
              );
            }
            continue; // Skip the URL-based approach
          }

          // Fallback to URL-based approach (existing logic)
          // Handle desktop image
          if (banner.desktop) {
            const desktopUpload = await uploadBannerImages(
              [banner.desktop],
              "desktop"
            );

            if (desktopUpload.success && desktopUpload.urls) {
              desktopUrls.push(...desktopUpload.urls);
            } else {
              hasErrors = true;
              errorMessages.push(
                `Failed to upload desktop image for Banner ${i + 1}: ${
                  desktopUpload.message || "Unknown error"
                }`
              );
              continue;
            }
          } else if (banner.desktopUrl) {
            desktopUrls.push(banner.desktopUrl);
          }

          // Handle mobile image
          if (banner.mobile && !banner.useSameForBoth) {
            const mobileUpload = await uploadBannerImages(
              [banner.mobile],
              "mobile"
            );

            if (mobileUpload.success && mobileUpload.urls) {
              mobileUrls.push(...mobileUpload.urls);
            } else {
              hasErrors = true;
              errorMessages.push(
                `Failed to upload mobile image for Banner ${i + 1}: ${
                  mobileUpload.message || "Unknown error"
                }`
              );
              continue;
            }
          } else if (banner.mobileUrl && !banner.useSameForBoth) {
            mobileUrls.push(banner.mobileUrl);
          } else if (banner.useSameForBoth) {
            mobileUrls.push(...desktopUrls);
          }

          // Validate that we have at least one image
          if (desktopUrls.length === 0 && mobileUrls.length === 0) {
            hasErrors = true;
            errorMessages.push(
              `Banner ${i + 1} must have at least one image (desktop or mobile)`
            );
            continue;
          }

          const images = {
            desktop: desktopUrls,
            mobile: mobileUrls,
          };

          const bannerPayload = {
            title: `${config.title} ${
              validBanners.length > 1 ? i + 1 : ""
            } - ${new Date().toLocaleDateString()}`,
            url: banner.url,
            images,
          };

          console.log(`Banner ${i + 1} - URL-based payload:`, bannerPayload);

          const [page] = config.sectionType.split("-");
          const section = config.apiSection;

          const createResult = await createBanner(
            page as "home" | "category" | "checkout",
            section,
            bannerPayload
          );

          console.log(`Banner ${i + 1} - URL-based result:`, {
            success: createResult.success,
            message: createResult.message,
          });

          if (!createResult.success) {
            hasErrors = true;
            errorMessages.push(
              `Failed to create Banner ${i + 1}: ${
                createResult.message || "Unknown error"
              }`
            );
          }
        } catch (bannerError) {
          hasErrors = true;
          errorMessages.push(
            `Error processing Banner ${i + 1}: ${bannerError}`
          );
          console.error(`Error processing banner ${i + 1}:`, bannerError);
        }
      }

      if (hasErrors) {
        showErrorMessage(
          `Some banners failed to save:\n${errorMessages.join("\n")}`
        );
        return;
      }

      showSuccessMessage(`${config.title} section saved successfully.`);

      // Reload the banners to show updated state
      try {
        if (activeTab === "home") {
          const homeBanners = await getHomeBanners();
          if (homeBanners) {
            const sectionData =
              homeBanners[config.apiSection as keyof typeof homeBanners];
            const formData =
              sectionData?.length > 0
                ? sectionData.map(convertBannerToFormData)
                : [
                    {
                      id: generateUniqueId(config.sectionType),
                      desktop: null,
                      mobile: null,
                      url: "",
                      useSameForBoth: false,
                    },
                  ];

            switch (sectionKey) {
              case "heroCarousel":
                setHeroCarousel(formData);
                break;
              case "salesBanner":
                setSalesBanner(formData);
                break;
              case "megaSales":
                setMegaSales(formData);
                break;
              case "dealsBanner":
                setDealsBanner(formData);
                break;
              // Checkout banner sections are handled individually in the checkout-specific logic below
            }
          }
        } else if (activeTab === "category") {
          const categoryBanners = await getCategoryBanners();
          if (categoryBanners) {
            const sectionData =
              categoryBanners[
                config.apiSection as keyof typeof categoryBanners
              ];
            const formData =
              sectionData?.length > 0
                ? sectionData.map(convertBannerToFormData)
                : [
                    {
                      id: generateUniqueId(config.sectionType),
                      desktop: null,
                      mobile: null,
                      url: "",
                      useSameForBoth: false,
                    },
                  ];

            switch (sectionKey) {
              case "categoryBannerOne":
                setCategoryBannerOne(formData);
                break;
              case "categoryBannerTwo":
                setCategoryBannerTwo(formData);
                break;
              case "categoryBannerThree":
                setCategoryBannerThree(formData);
                break;
              case "categoryPageBanners":
                setCategoryPageBanners(formData);
                break;
            }
          }
        } else if (activeTab === "checkout") {
          const checkoutBannersData = await getCheckoutBanners();
          if (checkoutBannersData) {
            // Reload individual checkout banner sections based on which section was saved
            switch (sectionKey) {
              case "checkoutBannerOne":
                const bannerOneData =
                  checkoutBannersData.checkout_banner_one?.length > 0
                    ? checkoutBannersData.checkout_banner_one.map(
                        convertBannerToFormData
                      )
                    : [];
                setCheckoutBannerOne(bannerOneData);
                break;
              case "checkoutBannerTwo":
                const bannerTwoData =
                  checkoutBannersData.checkout_banner_two?.length > 0
                    ? checkoutBannersData.checkout_banner_two.map(
                        convertBannerToFormData
                      )
                    : [];
                setCheckoutBannerTwo(bannerTwoData);
                break;
              case "checkoutBannerThree":
                const bannerThreeData =
                  checkoutBannersData.checkout_banner_three?.length > 0
                    ? checkoutBannersData.checkout_banner_three.map(
                        convertBannerToFormData
                      )
                    : [];
                setCheckoutBannerThree(bannerThreeData);
                break;
              case "checkoutBannerFour":
                const bannerFourData =
                  checkoutBannersData.checkout_banner_four?.length > 0
                    ? checkoutBannersData.checkout_banner_four.map(
                        convertBannerToFormData
                      )
                    : [];
                setCheckoutBannerFour(bannerFourData);
                break;
            }
          }
        }
      } catch (reloadError) {
        console.error("Error reloading banners:", reloadError);
        // Don't show error for reload failure, banners were saved successfully
      }
    } catch (error) {
      console.error("Error saving section:", error);
      showErrorMessage("Failed to save section. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, [sectionKey]: false }));
    }
  };

  const renderHomeTab = () => (
    <div className="space-y-4">
      <BannerSection
        config={SECTION_CONFIGS.heroCarousel}
        banners={heroCarousel}
        onBannersChange={setHeroCarousel}
        onSave={() => handleSaveSection("heroCarousel", heroCarousel)}
        loading={loading.heroCarousel || false}
      />

      <BannerSection
        config={SECTION_CONFIGS.salesBanner}
        banners={salesBanner}
        onBannersChange={setSalesBanner}
        onSave={() => handleSaveSection("salesBanner", salesBanner)}
        loading={loading.salesBanner || false}
      />

      <BannerSection
        config={SECTION_CONFIGS.megaSales}
        banners={megaSales}
        onBannersChange={setMegaSales}
        onSave={() => handleSaveSection("megaSales", megaSales)}
        loading={loading.megaSales || false}
      />

      <BannerSection
        config={SECTION_CONFIGS.dealsBanner}
        banners={dealsBanner}
        onBannersChange={setDealsBanner}
        onSave={() => handleSaveSection("dealsBanner", dealsBanner)}
        loading={loading.dealsBanner || false}
      />
    </div>
  );

  const renderCategoryTab = () => {
    // Combine all promotion banners into one section
    const allPromotionBanners = [
      ...categoryBannerOne.map(banner => ({ ...banner, sectionKey: 'categoryBannerOne', sectionTitle: 'Promotion Banner One' })),
      ...categoryBannerTwo.map(banner => ({ ...banner, sectionKey: 'categoryBannerTwo', sectionTitle: 'Promotion Banner Two' })),
      ...categoryBannerThree.map(banner => ({ ...banner, sectionKey: 'categoryBannerThree', sectionTitle: 'Promotion Banner Three' }))
    ];

    const handlePromotionBannersChange = (newBanners: any[]) => {
      const bannerOne = newBanners.filter(b => b.sectionKey === 'categoryBannerOne').map(({ sectionKey, sectionTitle, ...banner }) => banner);
      const bannerTwo = newBanners.filter(b => b.sectionKey === 'categoryBannerTwo').map(({ sectionKey, sectionTitle, ...banner }) => banner);
      const bannerThree = newBanners.filter(b => b.sectionKey === 'categoryBannerThree').map(({ sectionKey, sectionTitle, ...banner }) => banner);
      
      setCategoryBannerOne(bannerOne);
      setCategoryBannerTwo(bannerTwo);
      setCategoryBannerThree(bannerThree);
    };

    const handlePromotionSave = async () => {
      const isLoading = loading.categoryBannerOne || loading.categoryBannerTwo || loading.categoryBannerThree;
      if (isLoading) return;

      // Save all three sections
      const promises = [];
      if (categoryBannerOne.length > 0) {
        promises.push(handleSaveSection("categoryBannerOne", categoryBannerOne));
      }
      if (categoryBannerTwo.length > 0) {
        promises.push(handleSaveSection("categoryBannerTwo", categoryBannerTwo));
      }
      if (categoryBannerThree.length > 0) {
        promises.push(handleSaveSection("categoryBannerThree", categoryBannerThree));
      }

      await Promise.all(promises);
    };

    return (
      <div className="space-y-4">
        {/* Combined Promotion Banners Section */}
        <div className="bg-gray-bg rounded-lg p-4 border border-gray-line">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h2 className="title-4-semibold text-black">Promotion Banners</h2>
              <p className="text-gray-50 xxxsmall">
                {allPromotionBanners.length} of 3 banners added
              </p>
            </div>
            <button
              onClick={handlePromotionSave}
              disabled={loading.categoryBannerOne || loading.categoryBannerTwo || loading.categoryBannerThree || allPromotionBanners.length === 0}
              className="bg-blue-00 text-white py-2 px-4 rounded-lg hover:bg-blue-10 transition disabled:opacity-50 disabled:cursor-not-allowed small-semibold whitespace-nowrap flex-shrink-0"
            >
              {(loading.categoryBannerOne || loading.categoryBannerTwo || loading.categoryBannerThree) ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  Save Section
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Promotion Banner One */}
            {categoryBannerOne.length > 0 ? (
              categoryBannerOne.map((banner, index) => (
                <BannerUpload
                  key={`promotion-one-${index}-${banner.id || "new"}`}
                  title="Promotion Banner One"
                  desktopImage={banner.desktop}
                  mobileImage={banner.mobile}
                  desktopUrl={banner.desktopUrl}
                  mobileUrl={banner.mobileUrl}
                  url={banner.url}
                  onDesktopImageChange={(image) => {
                    const updated = [...categoryBannerOne];
                    updated[index] = { ...updated[index], desktop: image };
                    setCategoryBannerOne(updated);
                  }}
                  onMobileImageChange={(image) => {
                    const updated = [...categoryBannerOne];
                    updated[index] = { ...updated[index], mobile: image };
                    setCategoryBannerOne(updated);
                  }}
                  onUrlChange={(url) => {
                    const updated = [...categoryBannerOne];
                    updated[index] = { ...updated[index], url };
                    setCategoryBannerOne(updated);
                  }}
                  useSameForBoth={banner.useSameForBoth}
                  onUseSameForBothChange={(value) => {
                    const updated = [...categoryBannerOne];
                    updated[index] = { ...updated[index], useSameForBoth: value };
                    setCategoryBannerOne(updated);
                  }}
                  onRemove={() => setCategoryBannerOne([])}
                  showRemove={true}
                  uniqueId={banner.id || `category-banner-one-${index}`}
                  sectionKey="category-banner-one"
                  bannerId={banner.id}
                  isExisting={banner.isExisting || false}
                  onBannerDelete={(bannerId) => setCategoryBannerOne([])}
                />
              ))
            ) : (
              <div
                className="bg-white border-2 border-dashed border-gray-line rounded-lg p-4 flex flex-col items-center justify-center text-gray-50 hover:text-blue-00 hover:border-blue-00 transition cursor-pointer min-h-[200px]"
                onClick={() => setCategoryBannerOne([{
                  id: generateUniqueId("category-banner-one"),
                  desktop: null,
                  mobile: null,
                  url: "",
                  useSameForBoth: false,
                }])}
              >
                <FontAwesomeIcon icon={faPlus} className="h-6 w-6 mb-2" />
                <span className="xsmall-semibold">Add Promotion Banner One</span>
                <span className="xxxsmall text-center">Max 1 allowed</span>
              </div>
            )}

            {/* Promotion Banner Two */}
            {categoryBannerTwo.length > 0 ? (
              categoryBannerTwo.map((banner, index) => (
                <BannerUpload
                  key={`promotion-two-${index}-${banner.id || "new"}`}
                  title="Promotion Banner Two"
                  desktopImage={banner.desktop}
                  mobileImage={banner.mobile}
                  desktopUrl={banner.desktopUrl}
                  mobileUrl={banner.mobileUrl}
                  url={banner.url}
                  onDesktopImageChange={(image) => {
                    const updated = [...categoryBannerTwo];
                    updated[index] = { ...updated[index], desktop: image };
                    setCategoryBannerTwo(updated);
                  }}
                  onMobileImageChange={(image) => {
                    const updated = [...categoryBannerTwo];
                    updated[index] = { ...updated[index], mobile: image };
                    setCategoryBannerTwo(updated);
                  }}
                  onUrlChange={(url) => {
                    const updated = [...categoryBannerTwo];
                    updated[index] = { ...updated[index], url };
                    setCategoryBannerTwo(updated);
                  }}
                  useSameForBoth={banner.useSameForBoth}
                  onUseSameForBothChange={(value) => {
                    const updated = [...categoryBannerTwo];
                    updated[index] = { ...updated[index], useSameForBoth: value };
                    setCategoryBannerTwo(updated);
                  }}
                  onRemove={() => setCategoryBannerTwo([])}
                  showRemove={true}
                  uniqueId={banner.id || `category-banner-two-${index}`}
                  sectionKey="category-banner-two"
                  bannerId={banner.id}
                  isExisting={banner.isExisting || false}
                  onBannerDelete={(bannerId) => setCategoryBannerTwo([])}
                />
              ))
            ) : (
              <div
                className="bg-white border-2 border-dashed border-gray-line rounded-lg p-4 flex flex-col items-center justify-center text-gray-50 hover:text-blue-00 hover:border-blue-00 transition cursor-pointer min-h-[200px]"
                onClick={() => setCategoryBannerTwo([{
                  id: generateUniqueId("category-banner-two"),
                  desktop: null,
                  mobile: null,
                  url: "",
                  useSameForBoth: false,
                }])}
              >
                <FontAwesomeIcon icon={faPlus} className="h-6 w-6 mb-2" />
                <span className="xsmall-semibold">Add Promotion Banner Two</span>
                <span className="xxxsmall text-center">Max 1 allowed</span>
              </div>
            )}

            {/* Promotion Banner Three */}
            {categoryBannerThree.length > 0 ? (
              categoryBannerThree.map((banner, index) => (
                <BannerUpload
                  key={`promotion-three-${index}-${banner.id || "new"}`}
                  title="Promotion Banner Three"
                  desktopImage={banner.desktop}
                  mobileImage={banner.mobile}
                  desktopUrl={banner.desktopUrl}
                  mobileUrl={banner.mobileUrl}
                  url={banner.url}
                  onDesktopImageChange={(image) => {
                    const updated = [...categoryBannerThree];
                    updated[index] = { ...updated[index], desktop: image };
                    setCategoryBannerThree(updated);
                  }}
                  onMobileImageChange={(image) => {
                    const updated = [...categoryBannerThree];
                    updated[index] = { ...updated[index], mobile: image };
                    setCategoryBannerThree(updated);
                  }}
                  onUrlChange={(url) => {
                    const updated = [...categoryBannerThree];
                    updated[index] = { ...updated[index], url };
                    setCategoryBannerThree(updated);
                  }}
                  useSameForBoth={banner.useSameForBoth}
                  onUseSameForBothChange={(value) => {
                    const updated = [...categoryBannerThree];
                    updated[index] = { ...updated[index], useSameForBoth: value };
                    setCategoryBannerThree(updated);
                  }}
                  onRemove={() => setCategoryBannerThree([])}
                  showRemove={true}
                  uniqueId={banner.id || `category-banner-three-${index}`}
                  sectionKey="category-banner-three"
                  bannerId={banner.id}
                  isExisting={banner.isExisting || false}
                  onBannerDelete={(bannerId) => setCategoryBannerThree([])}
                />
              ))
            ) : (
              <div
                className="bg-white border-2 border-dashed border-gray-line rounded-lg p-4 flex flex-col items-center justify-center text-gray-50 hover:text-blue-00 hover:border-blue-00 transition cursor-pointer min-h-[200px]"
                onClick={() => setCategoryBannerThree([{
                  id: generateUniqueId("category-banner-three"),
                  desktop: null,
                  mobile: null,
                  url: "",
                  useSameForBoth: false,
                }])}
              >
                <FontAwesomeIcon icon={faPlus} className="h-6 w-6 mb-2" />
                <span className="xsmall-semibold">Add Promotion Banner Three</span>
                <span className="xxxsmall text-center">Max 1 allowed</span>
              </div>
            )}
          </div>
        </div>

        <BannerSection
          config={SECTION_CONFIGS.categoryPageBanners}
          banners={categoryPageBanners}
          onBannersChange={setCategoryPageBanners}
          onSave={() =>
            handleSaveSection("categoryPageBanners", categoryPageBanners)
          }
          loading={loading.categoryPageBanners || false}
        />
      </div>
    );
  };

  const renderCheckoutTab = () => (
    <div className="space-y-4">
      <BannerSection
        config={SECTION_CONFIGS.checkoutBannerOne}
        banners={checkoutBannerOne}
        onBannersChange={setCheckoutBannerOne}
        onSave={() => handleSaveSection("checkoutBannerOne", checkoutBannerOne)}
        loading={loading.checkoutBannerOne || false}
      />

      <BannerSection
        config={SECTION_CONFIGS.checkoutBannerTwo}
        banners={checkoutBannerTwo}
        onBannersChange={setCheckoutBannerTwo}
        onSave={() => handleSaveSection("checkoutBannerTwo", checkoutBannerTwo)}
        loading={loading.checkoutBannerTwo || false}
      />

      <BannerSection
        config={SECTION_CONFIGS.checkoutBannerThree}
        banners={checkoutBannerThree}
        onBannersChange={setCheckoutBannerThree}
        onSave={() =>
          handleSaveSection("checkoutBannerThree", checkoutBannerThree)
        }
        loading={loading.checkoutBannerThree || false}
      />

      <BannerSection
        config={SECTION_CONFIGS.checkoutBannerFour}
        banners={checkoutBannerFour}
        onBannersChange={setCheckoutBannerFour}
        onSave={() =>
          handleSaveSection("checkoutBannerFour", checkoutBannerFour)
        }
        loading={loading.checkoutBannerFour || false}
      />
    </div>
  );

  if (initialLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FontAwesomeIcon
              icon={faSpinner}
              className="animate-spin h-8 w-8 text-blue-00 mb-4"
            />
            <p className="text-gray-50 small">Loading existing banners...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="title-2-semibold text-black mb-2">Banner Management</h1>
        <p className="text-gray-50 small">
          Add banners dynamically to each section. Use the + button to add more
          banners up to the maximum limit.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="inline-flex space-x-1 mb-4 bg-gray-70 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("home")}
          className={`px-4 py-2 rounded-md transition small-semibold ${
            activeTab === "home"
              ? "bg-blue-00 text-white"
              : "text-gray-110 hover:text-blue-00"
          }`}
        >
          Home Page
        </button>
        <button
          onClick={() => setActiveTab("category")}
          className={`px-4 py-2 rounded-md transition small-semibold ${
            activeTab === "category"
              ? "bg-blue-00 text-white"
              : "text-gray-110 hover:text-blue-00"
          }`}
        >
          Category Page
        </button>
        <button
          onClick={() => setActiveTab("checkout")}
          className={`px-4 py-2 rounded-md transition small-semibold ${
            activeTab === "checkout"
              ? "bg-blue-00 text-white"
              : "text-gray-110 hover:text-blue-00"
          }`}
        >
          Checkout Page
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "home"
        ? renderHomeTab()
        : activeTab === "category"
        ? renderCategoryTab()
        : renderCheckoutTab()}
    </div>
  );
};

export default BannerManagement;
