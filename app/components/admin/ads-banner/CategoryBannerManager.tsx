"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faArrowUp,
  faArrowDown,
  faEye,
  faPlus,
  faArrowLeft,
  faPencil,
} from "@fortawesome/free-solid-svg-icons";
import Button from "@/app/components/common/Button";
import Image from "next/image";
import { showErrorMessage, showSuccessMessage } from "@/app/lib/swalConfig";
import UploadImageComponent from "./UploadImageComponent";
import {
  getCategoryBanners,
  uploadCategoryBannerImage,
  saveCategoryBanners,
  getCategories,
  updateCategoryBanner,
  CategoryBanner,
} from "@/app/lib/services/admin/categoryBannerService";

interface CategoryBannerManagerProps {
  categoryId: string;
  categoryName: string;
  onSave?: (banners: CategoryBanner[]) => void;
}

export default function CategoryBannerManager({
  categoryId: initialCategoryId,
  categoryName: initialCategoryName,
  onSave,
}: CategoryBannerManagerProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
  const [selectedCategoryName, setSelectedCategoryName] = useState(initialCategoryName);
  const [categories, setCategories] = useState<Array<{ id: string; title: string; category_type?: string }>>([]);
  const [banners, setBanners] = useState<CategoryBanner[]>([]);
  const [previewBanner, setPreviewBanner] = useState<CategoryBanner | null>(null);
  const [editingBanner, setEditingBanner] = useState<CategoryBanner | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newBannerData, setNewBannerData] = useState({
    position: 1,
    image_alt_text: "",
    redirect_url: "",
    is_active: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialCategoryId) {
      setSelectedCategoryId(initialCategoryId);
      setSelectedCategoryName(initialCategoryName);
      fetchBannersForCategory(initialCategoryId);
    }
  }, [initialCategoryId, initialCategoryName]);

  // Fetch banners whenever selectedCategoryId changes
  useEffect(() => {
    if (selectedCategoryId && selectedCategoryId !== initialCategoryId) {
      fetchBannersForCategory(selectedCategoryId);
    }
  }, [selectedCategoryId]);

  const fetchCategories = async () => {
    const data = await getCategories();
    if (data) {
      setCategories(data);
    }
  };

  const fetchBannersForCategory = async (categoryId: string) => {
    if (!categoryId) {
      return;
    }
    setLoading(true);
    const data = await getCategoryBanners(categoryId);
    if (data) {
      setBanners(data);
    } else {
      setBanners([]);
    }
    setLoading(false);
  };

  const fetchBanners = async () => {
    if (!selectedCategoryId) return;
    setLoading(true);
    console.log("Fetching banners for category:", selectedCategoryId);
    const data = await getCategoryBanners(selectedCategoryId);
    console.log("Fetched banners data:", data);
    if (data) {
      setBanners(data);
    }
    setLoading(false);
  };

  const handleSelectCategory = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      setSelectedCategoryId(category.id);
      setSelectedCategoryName(category.title || "");
      setShowUploadForm(false);
      fetchBannersForCategory(category.id);
    }
  };

  const handleSelectCategoryInForm = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      setSelectedCategoryId(category.id);
      setSelectedCategoryName(category.title || "");
      // Don't close the form - keep it open for editing
    }
  };

  const handleUploadImage = async (file: File) => {
    const imageUrl = await uploadCategoryBannerImage(file, selectedCategoryId);
    if (imageUrl) {
      const newBanner: CategoryBanner = {
        category_id: selectedCategoryId,
        position: newBannerData.position,
        image_url: imageUrl,
        image_alt_text: newBannerData.image_alt_text || "Banner",
        redirect_url: newBannerData.redirect_url,
        is_active: newBannerData.is_active,
        display_order: banners.length,
      };
      
      // Immediately save to database
      const result = await saveCategoryBanners(selectedCategoryId, [...banners, newBanner]);
      
      if (result) {
        // Update local state with saved banners
        setBanners(result);
        setShowUploadForm(false);
        setNewBannerData({
          position: 1,
          image_alt_text: "",
          redirect_url: "",
          is_active: true,
        });
        showSuccessMessage("Banner uploaded and saved successfully");
      } else {
        showErrorMessage("Failed to save banner to database");
      }
    }
  };

  const handleDeleteBanner = (index: number) => {
    const newBanners = banners.filter((_, i) => i !== index);
    setBanners(newBanners);
    showSuccessMessage("Banner removed");
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newBanners = [...banners];
    [newBanners[index], newBanners[index - 1]] = [
      newBanners[index - 1],
      newBanners[index],
    ];
    newBanners.forEach((banner, idx) => {
      banner.display_order = idx;
      banner.position = idx + 1;
    });
    setBanners(newBanners);
  };

  const handleMoveDown = (index: number) => {
    if (index === banners.length - 1) return;
    const newBanners = [...banners];
    [newBanners[index], newBanners[index + 1]] = [
      newBanners[index + 1],
      newBanners[index],
    ];
    newBanners.forEach((banner, idx) => {
      banner.display_order = idx;
      banner.position = idx + 1;
    });
    setBanners(newBanners);
  };

  const handleUpdateBanner = (
    index: number,
    updates: Partial<CategoryBanner>
  ) => {
    const newBanners = [...banners];
    newBanners[index] = { ...newBanners[index], ...updates };
    setBanners(newBanners);
    
    // If status changed, save immediately to database
    if (updates.is_active !== undefined) {
      saveCategoryBanners(selectedCategoryId, newBanners);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingBanner || editingIndex === null) return;

    setLoading(true);
    
    // Update the banner in the local array
    const newBanners = [...banners];
    newBanners[editingIndex] = editingBanner;
    
    // Save all banners to database
    const result = await saveCategoryBanners(selectedCategoryId, newBanners);
    
    if (result) {
      setBanners(result);
      setEditingBanner(null);
      setEditingIndex(null);
      showSuccessMessage("Banner updated successfully");
    }
    
    setLoading(false);
  };

  const handleSave = async () => {
    if (banners.length === 0) {
      showErrorMessage("No banners to save");
      return;
    }
    setLoading(true);
    const result = await saveCategoryBanners(selectedCategoryId, banners);
    if (result) {
      if (onSave) onSave(result);
      await fetchBanners();
      showSuccessMessage("Banners saved successfully");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {editingBanner && editingIndex !== null ? (
        // Edit Form View
        <div className="bg-white p-4 md:p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => {
                setEditingBanner(null);
                setEditingIndex(null);
              }}
              className="p-1 hover:bg-gray-10 rounded transition-colors"
              title="Back"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 text-gray-30" />
            </button>
            <h3 className="text-sm md:text-base font-semibold text-default">
              Edit Banner
            </h3>
          </div>

          <div className="space-y-4 md:space-y-6 max-w-2xl">
            {/* Position */}
            <div>
              <label className="text-xs md:text-sm font-semibold text-gray-30 block mb-2">
                Position (after how many products)
              </label>
              <input
                type="number"
                min="0"
                value={editingBanner.position}
                onChange={(e) =>
                  setEditingBanner({
                    ...editingBanner,
                    position: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Alt Text */}
            <div>
              <label className="text-xs md:text-sm font-semibold text-gray-30 block mb-2">
                Alt Text
              </label>
              <input
                type="text"
                value={editingBanner.image_alt_text}
                onChange={(e) =>
                  setEditingBanner({
                    ...editingBanner,
                    image_alt_text: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Redirect URL */}
            <div>
              <label className="text-xs md:text-sm font-semibold text-gray-30 block mb-2">
                Redirect URL (optional)
              </label>
              <input
                type="url"
                value={editingBanner.redirect_url || ""}
                onChange={(e) =>
                  setEditingBanner({
                    ...editingBanner,
                    redirect_url: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-xs md:text-sm font-semibold text-gray-30 block mb-2">
                Status
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingBanner.is_active}
                  onChange={(e) =>
                    setEditingBanner({
                      ...editingBanner,
                      is_active: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-30">
                  {editingBanner.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Current Image Preview */}
            <div>
              <label className="text-xs md:text-sm font-semibold text-gray-30 block mb-2">
                Current Image
              </label>
              <div className="w-32 h-32 rounded overflow-hidden bg-gray-200">
                <Image
                  src={editingBanner.image_url}
                  alt={editingBanner.image_alt_text}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Upload New Image */}
            <div>
              <label className="text-xs md:text-sm font-semibold text-gray-30 block mb-2">
                Replace Image (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const imageUrl = await uploadCategoryBannerImage(file, selectedCategoryId);
                    if (imageUrl) {
                      setEditingBanner({
                        ...editingBanner,
                        image_url: imageUrl,
                      });
                    }
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setEditingBanner(null);
                  setEditingIndex(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveEdit()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      ) : showUploadForm ? (
        // Upload Form View
        <div className="bg-white p-4 md:p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => {
                setShowUploadForm(false);
                setNewBannerData({
                  position: 1,
                  image_alt_text: "",
                  redirect_url: "",
                  is_active: true,
                });
              }}
              className="p-1 hover:bg-gray-10 rounded transition-colors"
              title="Back"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 text-gray-30" />
            </button>
            <h3 className="text-sm md:text-base font-semibold text-default">
              Upload New Banner
            </h3>
          </div>

          <div className="space-y-4 md:space-y-6 max-w-2xl">
            {/* Category Dropdown */}
            <div>
              <label className="text-xs md:text-sm font-semibold text-gray-30 block mb-2">
                Category *
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => handleSelectCategoryInForm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Select Category --</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Position */}
            <div>
              <label className="text-xs md:text-sm font-semibold text-gray-30 block mb-2">
                Position (after how many products)
              </label>
              <input
                type="number"
                min="0"
                value={newBannerData.position}
                onChange={(e) =>
                  setNewBannerData({
                    ...newBannerData,
                    position: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Alt Text */}
            <div>
              <label className="text-xs md:text-sm font-semibold text-gray-30 block mb-2">
                Alt Text
              </label>
              <input
                type="text"
                value={newBannerData.image_alt_text}
                onChange={(e) =>
                  setNewBannerData({
                    ...newBannerData,
                    image_alt_text: e.target.value,
                  })
                }
                placeholder="Banner description for accessibility"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Redirect URL */}
            <div>
              <label className="text-xs md:text-sm font-semibold text-gray-30 block mb-2">
                Redirect URL (optional)
              </label>
              <input
                type="url"
                value={newBannerData.redirect_url}
                onChange={(e) =>
                  setNewBannerData({
                    ...newBannerData,
                    redirect_url: e.target.value,
                  })
                }
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-xs md:text-sm font-semibold text-gray-30 block mb-2">
                Status
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newBannerData.is_active}
                  onChange={(e) =>
                    setNewBannerData({
                      ...newBannerData,
                      is_active: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-30">
                  {newBannerData.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Upload Component */}
            <UploadImageComponent
              title="Upload Banner Image"
              onCancel={() => {
                setShowUploadForm(false);
                setNewBannerData({
                  position: 1,
                  image_alt_text: "",
                  redirect_url: "",
                  is_active: true,
                });
              }}
              onUpload={handleUploadImage}
              maxSize={25}
            />
          </div>
        </div>
      ) : (
        // Table View
        <div className="space-y-4">
          {/* Banners Table */}
          <div className="bg-white p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-default">
                Banners ({banners.length})
              </h3>
              <Button
                variant="primary"
                onClick={() => setShowUploadForm(true)}
                className="flex items-center gap-2 py-1.5 px-3 text-xs"
              >
                <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                Add New
              </Button>
            </div>

            {/* Category Dropdown in Table View */}
            <div className="mb-3 max-w-xs">
              <label className="text-xs font-semibold text-gray-30 block mb-1">
                Category
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => handleSelectCategory(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Select Category --</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="text-center py-4 text-sm text-gray-600">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-200 border-b border-gray-300">
                      <th className="text-left px-4 py-3 font-bold text-gray-700 uppercase text-xs">S.N.</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-700 uppercase text-xs">Image</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-700 uppercase text-xs">Position</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-700 uppercase text-xs">Alt Text</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-700 uppercase text-xs">URL</th>
                      <th className="text-left px-4 py-3 font-bold text-gray-700 uppercase text-xs">Status</th>
                      <th className="text-center px-4 py-3 font-bold text-gray-700 uppercase text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banners.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-sm text-gray-600">
                          select from catgory to see uploaded banner. Click "Add New" to upload.
                        </td>
                      </tr>
                    ) : (
                      banners.map((banner, index) => (
                        <tr key={index} className="border-b border-gray-200 hover:bg-gray-100 transition-colors">
                          {/* S.N. */}
                          <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                            {index + 1}
                          </td>

                          {/* Image */}
                          <td className="px-4 py-3">
                            <div className="w-10 h-10 rounded overflow-hidden bg-gray-200 flex-shrink-0">
                              <Image
                                src={banner.image_url}
                                alt={banner.image_alt_text}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>

                          {/* Position */}
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {banner.position}
                          </td>

                          {/* Alt Text */}
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {banner.image_alt_text}
                          </td>

                          {/* URL */}
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {banner.redirect_url || "-"}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <button
                              onClick={() =>
                                handleUpdateBanner(index, {
                                  is_active: !banner.is_active,
                                })
                              }
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                                banner.is_active
                                  ? "bg-yellow-200 text-yellow-900 hover:bg-yellow-300"
                                  : "bg-gray-300 text-gray-900 hover:bg-gray-400"
                              }`}
                              title="Click to toggle status"
                            >
                              {banner.is_active ? "Active" : "Inactive"}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => setPreviewBanner(banner)}
                                className="p-2 hover:bg-blue-200 rounded transition-colors"
                                title="Preview"
                              >
                                <FontAwesomeIcon
                                  icon={faEye}
                                  className="w-4 h-4 text-blue-700"
                                />
                              </button>
                              <button
                                onClick={() => handleDeleteBanner(index)}
                                className="p-2 hover:bg-red-200 rounded transition-colors"
                                title="Delete"
                              >
                                <FontAwesomeIcon
                                  icon={faTrash}
                                  className="w-4 h-4 text-red-700"
                                />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingBanner(banner);
                                  setEditingIndex(index);
                                }}
                                className="p-2 hover:bg-green-200 rounded transition-colors"
                                title="Edit"
                              >
                                <FontAwesomeIcon
                                  icon={faPencil}
                                  className="w-4 h-4 text-green-700"
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewBanner && (
        <div
          className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewBanner(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold">Preview</h3>
                <button
                  onClick={() => setPreviewBanner(null)}
                  className="text-gray-30 hover:text-gray-50 text-lg"
                >
                  ✕
                </button>
              </div>
              <Image
                src={previewBanner.image_url}
                alt={previewBanner.image_alt_text}
                width={600}
                height={300}
                className="w-full h-auto rounded"
              />
              <div className="mt-3 space-y-1 text-xs">
                <p>
                  <span className="font-semibold">Position:</span> {previewBanner.position}
                </p>
                <p>
                  <span className="font-semibold">Alt:</span> {previewBanner.image_alt_text}
                </p>
                {previewBanner.redirect_url && (
                  <p>
                    <span className="font-semibold">URL:</span> {previewBanner.redirect_url}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
