"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEye, faCloudArrowUp, faLink } from "@fortawesome/free-solid-svg-icons";
import Button from "@/app/components/common/Button";
import Image from "next/image";
import { showErrorMessage, showSuccessMessage } from "@/app/lib/swalConfig";
import UploadImageComponent from "./UploadImageComponent";
import {
  getCategoryBanners,
  uploadCategoryBannerImage,
  saveCategoryBanners,
  getCategories,
  CategoryBanner,
} from "@/app/lib/services/admin/categoryBannerService";

interface CategoryBannerManagerProps {
  categoryId?: string;
  categoryName?: string;
  onSave?: (banners: CategoryBanner[]) => void;
}

export default function CategoryBannerManager({
  categoryId,
  categoryName,
  onSave,
}: CategoryBannerManagerProps) {
  const [superCategories, setSuperCategories] = useState<Array<{ id: string; title: string }>>([]);
  const [bannersByCategory, setBannersByCategory] = useState<Record<string, CategoryBanner | null>>({});
  const [previewBanner, setPreviewBanner] = useState<CategoryBanner | null>(null);
  const [editingUrl, setEditingUrl] = useState<string | null>(null);
  const [tempUrl, setTempUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      console.log("Fetched categories data:", data);
      
      if (data && Array.isArray(data) && data.length > 0) {
        setSuperCategories(data);
        
        const bannerMap: Record<string, CategoryBanner | null> = {};
        for (const superCat of data) {
          try {
            const banners = await getCategoryBanners(superCat.id);
            // Get only the first banner (position 1)
            bannerMap[superCat.id] = (banners && banners.length > 0) ? banners[0] : null;
          } catch (err) {
            console.error(`Error fetching banners for ${superCat.id}:`, err);
            bannerMap[superCat.id] = null;
          }
        }
        setBannersByCategory(bannerMap);
      } else {
        console.log("No categories found or data is null/empty");
        setSuperCategories([]);
        setBannersByCategory({});
      }
    } catch (error) {
      console.error("Error in fetchCategories:", error);
      setSuperCategories([]);
      setBannersByCategory({});
    }
  };

  const handleUploadImage = async (file: File, categoryId: string) => {
    setLoading(true);
    try {
      const imageUrl = await uploadCategoryBannerImage(file, categoryId);
      if (imageUrl) {
        const newBanner: CategoryBanner = {
          category_id: categoryId,
          position: 1,
          image_url: imageUrl,
          image_alt_text: "Category Banner",
          redirect_url: "",
          is_active: true,
          display_order: 0,
        };
        
        // Save single banner
        const result = await saveCategoryBanners(categoryId, [newBanner]);
        
        if (result) {
          setBannersByCategory({
            ...bannersByCategory,
            [categoryId]: result[0] || newBanner,
          });
          showSuccessMessage("Banner uploaded successfully");
        } else {
          showErrorMessage("Failed to save banner");
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      showErrorMessage("Failed to upload banner");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBanner = async (categoryId: string) => {
    try {
      const result = await saveCategoryBanners(categoryId, []);
      if (result !== null) {
        setBannersByCategory({
          ...bannersByCategory,
          [categoryId]: null,
        });
        showSuccessMessage("Banner deleted successfully");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showErrorMessage("Failed to delete banner");
    }
  };

  const handleUpdateUrl = async (categoryId: string, newUrl: string) => {
    const currentBanner = bannersByCategory[categoryId];
    if (!currentBanner) return;

    try {
      const updatedBanner = {
        ...currentBanner,
        redirect_url: newUrl,
      };
      
      const result = await saveCategoryBanners(categoryId, [updatedBanner]);
      if (result) {
        setBannersByCategory({
          ...bannersByCategory,
          [categoryId]: result[0] || updatedBanner,
        });
        setEditingUrl(null);
        setTempUrl("");
        showSuccessMessage("URL updated successfully");
      }
    } catch (error) {
      console.error("URL update error:", error);
      showErrorMessage("Failed to update URL");
    }
  };

  const startEditingUrl = (categoryId: string) => {
    const banner = bannersByCategory[categoryId];
    setEditingUrl(categoryId);
    setTempUrl(banner?.redirect_url || "");
  };

  const cancelEditingUrl = () => {
    setEditingUrl(null);
    setTempUrl("");
  };

  return (
    <div className="space-y-6">
      {superCategories.length === 0 ? (
        <div className="bg-white p-8 rounded-lg text-center">
          <p className="text-gray-600">No super categories found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {superCategories.map((superCategory) => {
            const banner = bannersByCategory[superCategory.id];
            const isEditingThisUrl = editingUrl === superCategory.id;
            
            return (
              <div key={superCategory.id}>
                <div className="banner-upload-container w-full">
                  <h2 className="title-4-semibold mb-2">{superCategory.title}</h2>

                  <div className="custom-border-2 border-dashed rounded-lg p-8 mb-6 flex flex-col items-center justify-center bg-tertiary border-secondary h-[200px] overflow-auto">
                    {banner ? (
                      // Show uploaded image
                      <div className="relative w-full h-full">
                        <Image
                          src={banner.image_url}
                          alt={banner.image_alt_text}
                          fill
                          className="rounded-md object-contain"
                        />
                      </div>
                    ) : (
                      // Show upload prompt
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="mb-4 text-primary">
                          <FontAwesomeIcon icon={faCloudArrowUp} className="text-2xl" />
                        </div>
                        <p className="xsmall-semibold mb-2 text-heading">
                          Drop file or browse
                        </p>
                        <p className="text-black xsmall mb-4 text-center">
                          Format: .jpeg, .png & Max file size: 25 MB
                        </p>

                        <button
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = '.jpeg,.jpg,.png';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleUploadImage(file, superCategory.id);
                            };
                            input.click();
                          }}
                          className="bg-primary text-white py-1 px-3 rounded-md small-semibold hover:bg-opacity-90 transition-colors"
                        >
                          Browse Files
                        </button>
                      </div>
                    )}
                  </div>

                  {/* URL Input Section */}
                  {banner && (
                    <div className="mb-4">
                      {isEditingThisUrl ? (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Redirect URL (optional)
                          </label>
                          <input
                            type="url"
                            value={tempUrl}
                            onChange={(e) => setTempUrl(e.target.value)}
                            placeholder="https://example.com/page"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateUrl(superCategory.id, tempUrl)}
                              className="flex-1 bg-primary text-white py-1 px-3 rounded text-sm hover:bg-opacity-90"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditingUrl}
                              className="flex-1 bg-gray-300 text-gray-700 py-1 px-3 rounded text-sm hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faLink} className="text-gray-400 text-sm" />
                          <span className="text-sm text-gray-600 flex-1 truncate">
                            {banner.redirect_url || "No URL set"}
                          </span>
                          <button
                            onClick={() => startEditingUrl(superCategory.id)}
                            className="text-primary hover:text-primary-dark text-sm"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-4">
                    {banner ? (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => setPreviewBanner(banner)}
                          fullWidth
                          className="py-3 px-6"
                        >
                          Preview
                        </Button>
                        <button
                          onClick={() => handleDeleteBanner(superCategory.id)}
                          className="flex-1 py-3 px-6 border-2 border-red-600 text-red-600 rounded-md font-medium hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => {}}
                          fullWidth
                          className="py-3 px-6"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => {}}
                          fullWidth
                          className="py-3 px-6"
                        >
                          Done
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewBanner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setPreviewBanner(null)}
        >
          <div
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setPreviewBanner(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-md transition-colors bg-white z-10"
              title="Close"
            >
              <svg className="h-5 w-5 text-gray-600 hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image Container - Full Size */}
            <img
              src={previewBanner.image_url}
              alt={previewBanner.image_alt_text}
              className="max-w-full max-h-[90vh] object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const errorDiv = document.createElement('div');
                errorDiv.className = 'flex items-center justify-center w-full h-96 bg-gray-100 rounded';
                errorDiv.innerHTML = '<p class="text-gray-500">Failed to load image</p>';
                e.currentTarget.parentElement?.appendChild(errorDiv);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
