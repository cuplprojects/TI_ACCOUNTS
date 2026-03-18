"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSearch } from "@fortawesome/free-solid-svg-icons";
import { showErrorMessage } from "@/app/lib/swalConfig";
import {
  getAdminPresignedUrls,
  uploadFileToS3,
  deleteAdminFiles,
  getCleanUrl,
} from "@/app/lib/services/presignedUrlService";
import {
  getBrandById,
  createBrand,
  updateBrand,
  assignBrandToProductTypes,
  assignBrandToSellers,
} from "@/app/lib/services/admin/brandService";
import { getAllProductTypes } from "@/app/lib/services/admin/productTypeService";
import { getAllSellers } from "@/app/lib/services/admin/sellerService";
import BannerUploadComponent from "@/app/components/admin/BannerUploadComponent";
import Link from "next/link";

interface ProductType {
  id?: string;
  name: string;
}

export default function BrandEditPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const { setTitle } = usePageTitle();
  const router = useRouter();
  
  // Handle both Promise and direct object params
  const [id, setId] = useState<string>("");
  const [isCreate, setIsCreate] = useState(false);
  
  useEffect(() => {
    if (!params) return;
    
    if (params instanceof Promise) {
      params.then((resolvedParams) => {
        setId(resolvedParams.id);
        setIsCreate(resolvedParams.id === "create");
      });
    } else {
      setId(params.id);
      setIsCreate(params.id === "create");
    }
  }, [params]);
  
  const [uploadingBannerType, setUploadingBannerType] = useState<"desktop" | "mobile" | "logo" | null>(null);
  const productTypeDropdownRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo_url: "",
    banner_desktop_url: "",
    banner_mobile_url: "",
    status: "active" as "active" | "inactive",
  });

  const [selectedProductTypes, setSelectedProductTypes] = useState<ProductType[]>([]);
  const [allProductTypes, setAllProductTypes] = useState<ProductType[]>([]);
  const [productTypeSearchTerm, setProductTypeSearchTerm] = useState("");
  const [showProductTypeDropdown, setShowProductTypeDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [previewDesktopBanner, setPreviewDesktopBanner] = useState<string>("");
  const [previewMobileBanner, setPreviewMobileBanner] = useState<string>("");

  interface Seller {
    id?: string;
    firmName?: string;
    email?: string;
    phoneNumber?: string;
    countryCode?: string;
    firmType?: string;
    [key: string]: any;
  }

  const [selectedSellers, setSelectedSellers] = useState<Seller[]>([]);
  const [allSellers, setAllSellers] = useState<Seller[]>([]);
  const [sellerSearchTerm, setSellerSearchTerm] = useState("");
  const [showSellerDropdown, setShowSellerDropdown] = useState(false);
  const sellerDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitle(isCreate ? "Create Brand" : "Edit Brand");
    
    let isMounted = true;

    const initializeData = async () => {
      await fetchProductTypes(isMounted);
      await fetchSellers(isMounted);
      if (!isCreate && isMounted && id) {
        await fetchBrand(isMounted);
      }
    };

    initializeData();

    return () => {
      isMounted = false;
    };
  }, [setTitle, isCreate, id]);

  const fetchBrand = async (isMounted: boolean) => {
    setIsLoading(true);
    try {
      const brand = await getBrandById(id);
      if (isMounted && brand) {
        setFormData({
          name: brand.name,
          description: brand.description || "",
          logo_url: brand.logo_url || "",
          banner_desktop_url: brand.banner_desktop_url || "",
          banner_mobile_url: brand.banner_mobile_url || "",
          status: brand.status,
        });
        if (brand.logo_url) {
          setPreviewImage(brand.logo_url);
        }
        if (brand.banner_desktop_url) {
          setPreviewDesktopBanner(brand.banner_desktop_url);
        }
        if (brand.banner_mobile_url) {
          setPreviewMobileBanner(brand.banner_mobile_url);
        }
        // Load previously selected product types
        if (brand.ProductTypes && Array.isArray(brand.ProductTypes)) {
          setSelectedProductTypes(
            brand.ProductTypes.map((pt: any) => ({
              id: pt.id,
              name: pt.name,
            }))
          );
        }
        // Load previously assigned sellers
        if (brand.sellers && Array.isArray(brand.sellers)) {
          setSelectedSellers(
            brand.sellers.map((seller: any) => ({
              id: seller.id,
              firmName: seller.firmName || seller.firm_name,
              email: seller.email,
            }))
          );
        }
      }
    } catch (error) {
      if (isMounted) {
        console.error("Error fetching brand:", error);
        showErrorMessage("Failed to fetch brand");
      }
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  };

  const fetchProductTypes = async (isMounted: boolean) => {
    try {
      const response = await getAllProductTypes(1, 1000);
      if (isMounted && response) {
        setAllProductTypes(response.productTypes || []);
      }
    } catch (error) {
      if (isMounted) {
        console.error("Error fetching product types:", error);
      }
    }
  };

  const fetchSellers = async (isMounted: boolean) => {
    try {
      const response = await getAllSellers({ page: 1, limit: 1000 });
      if (isMounted && response && response.sellers) {
        setAllSellers(response.sellers);
      }
    } catch (error) {
      if (isMounted) {
        console.error("Error fetching sellers:", error);
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeleteImage = async () => {
    if (!formData.logo_url) return;

    setUploadingBannerType("logo");
    try {
      // Extract key from URL - assuming format: https://bucket.s3.amazonaws.com/brands/logo/filename
      const urlParts = formData.logo_url.split("/");
      const key = urlParts.slice(-2).join("/"); // Get last two parts (folder/filename)

      const result = await deleteAdminFiles([key], false);
      
      if (result?.success) {
        setFormData((prev) => ({
          ...prev,
          logo_url: "",
        }));
        setPreviewImage("");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    } finally {
      setUploadingBannerType(null);
    }
  };

  const handleBannerUpload = async (file: File, bannerType: "desktop" | "mobile" | "logo") => {
    setUploadingBannerType(bannerType as any);
    try {
      // Get presigned URL
      const presignedUrls = await getAdminPresignedUrls({
        count: 1,
        keys: [{ key: `brands/${bannerType}`, filename: file.name }],
      });

      if (!presignedUrls || presignedUrls.length === 0) {
        return;
      }

      // Upload to S3
      const uploadSuccess = await uploadFileToS3(presignedUrls[0].url, file);

      if (!uploadSuccess) {
        return;
      }

      const imageUrl = getCleanUrl(presignedUrls[0].url);

      if (bannerType === "logo") {
        setFormData((prev) => ({
          ...prev,
          logo_url: imageUrl,
        }));
        setPreviewImage(imageUrl);
      } else if (bannerType === "desktop") {
        setFormData((prev) => ({
          ...prev,
          banner_desktop_url: imageUrl,
        }));
        setPreviewDesktopBanner(imageUrl);
      } else {
        setFormData((prev) => ({
          ...prev,
          banner_mobile_url: imageUrl,
        }));
        setPreviewMobileBanner(imageUrl);
      }
    } catch (error) {
      console.error("Error uploading banner:", error);
      showErrorMessage("Failed to upload image");
    } finally {
      setUploadingBannerType(null);
    }
  };

  const handleDeleteBanner = async (bannerType: "desktop" | "mobile") => {
    const url = bannerType === "desktop" ? formData.banner_desktop_url : formData.banner_mobile_url;
    if (!url) return;

    setUploadingBannerType(bannerType);
    try {
      const urlParts = url.split("/");
      const key = urlParts.slice(-2).join("/");

      const result = await deleteAdminFiles([key], false);
      
      if (result?.success) {
        if (bannerType === "desktop") {
          setFormData((prev) => ({
            ...prev,
            banner_desktop_url: "",
          }));
          setPreviewDesktopBanner("");
        } else {
          setFormData((prev) => ({
            ...prev,
            banner_mobile_url: "",
          }));
          setPreviewMobileBanner("");
        }
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
    } finally {
      setUploadingBannerType(null);
    }
  };

  const handleSelectProductType = (productType: ProductType) => {
    if (!selectedProductTypes.some((pt) => pt.id === productType.id)) {
      setSelectedProductTypes([...selectedProductTypes, productType]);
    }
    setProductTypeSearchTerm("");
    setShowProductTypeDropdown(false);
  };

  const handleRemoveProductType = (productTypeId: string) => {
    setSelectedProductTypes(
      selectedProductTypes.filter((pt) => pt.id !== productTypeId)
    );
  };

  const handleSelectSeller = (seller: Seller) => {
    if (!selectedSellers.some((s) => s.id === seller.id)) {
      setSelectedSellers([...selectedSellers, seller]);
    }
    setSellerSearchTerm("");
    setShowSellerDropdown(false);
  };

  const handleRemoveSeller = (sellerId: string) => {
    setSelectedSellers(
      selectedSellers.filter((s) => s.id !== sellerId)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Don't submit if currently uploading
    if (uploadingBannerType) {
      return;
    }

    // Validate brand name only
    if (!formData.name.trim()) {
      showErrorMessage("Brand name is required");
      return;
    }

    setIsSaving(true);
    try {
      if (isCreate) {
        const brandResponse = await createBrand(formData);
        if (brandResponse && brandResponse.id) {
          // Assign product types to the newly created brand (always call, even if empty)
          const productTypeIds = selectedProductTypes.map((pt) => pt.id!).filter(Boolean);
          await assignBrandToProductTypes(brandResponse.id, productTypeIds).catch((err) => {
            console.error("Error assigning product types:", err);
          });
          // Assign sellers to the newly created brand (always call, even if empty)
          const sellerIds = selectedSellers.map((s) => s.id!).filter(Boolean);
          await assignBrandToSellers(brandResponse.id, sellerIds).catch((err) => {
            console.error("Error assigning sellers:", err);
          });
          router.push("/admin/brands");
        }
      } else {
        const updateSuccess = await updateBrand(id, formData);
        if (updateSuccess) {
          // Assign product types to the brand (always call, even if empty)
          const productTypeIds = selectedProductTypes.map((pt) => pt.id!).filter(Boolean);
          await assignBrandToProductTypes(id, productTypeIds).catch((err) => {
            console.error("Error assigning product types:", err);
          });
          // Assign sellers to the brand (always call, even if empty)
          const sellerIds = selectedSellers.map((s) => s.id!).filter(Boolean);
          await assignBrandToSellers(id, sellerIds).catch((err) => {
            console.error("Error assigning sellers:", err);
          });
          router.push("/admin/brands");
        }
      }
    } catch (error) {
      console.error("Error saving brand:", error);
      showErrorMessage("Failed to save brand");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter product types based on search
  const filteredProductTypes = allProductTypes.filter((productType) =>
    (productType.name?.toLowerCase() || "").includes(productTypeSearchTerm.toLowerCase()) &&
    !selectedProductTypes.some((pt) => pt.id === productType.id)
  );

  // Filter sellers based on search
  const filteredSellers = allSellers.filter((seller) => {
    const searchMatch = !sellerSearchTerm || 
      (seller.firmName?.toLowerCase() || "").includes(sellerSearchTerm.toLowerCase()) ||
      (seller.email?.toLowerCase() || "").includes(sellerSearchTerm.toLowerCase());
    const notSelected = !selectedSellers.some((s) => s.id === seller.id);
    return searchMatch && notSelected;
  });

  // Add click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        productTypeDropdownRef.current &&
        !productTypeDropdownRef.current.contains(event.target as Node) &&
        showProductTypeDropdown
      ) {
        setShowProductTypeDropdown(false);
      }
      if (
        sellerDropdownRef.current &&
        !sellerDropdownRef.current.contains(event.target as Node) &&
        showSellerDropdown
      ) {
        setShowSellerDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProductTypeDropdown, showSellerDropdown]);

  // Check if form is valid
  const isFormValid = () => {
    return formData.name.trim() !== "";
  };

  if (isLoading) {
    return (
      <div className="p-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-4 mb-6 animate-pulse">
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded w-40"></div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Form Section Skeleton */}
          <div className="col-span-2">
            <div className="bg-white rounded-lg shadow p-6 space-y-6 animate-pulse">
              {/* Brand Name */}
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>

              {/* Description */}
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>

              {/* Banner uploads grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-40 bg-gray-200 rounded"></div>
                <div className="h-40 bg-gray-200 rounded"></div>
                <div className="h-40 bg-gray-200 rounded"></div>
              </div>

              {/* Status */}
              <div>
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-line">
                <div className="h-10 bg-gray-200 rounded w-32"></div>
                <div className="h-10 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="col-span-1 space-y-6">
            {/* Product Types Section */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-40"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>

            {/* Sellers Section */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/brands" className="text-primary hover:text-primary-dark">
          <FontAwesomeIcon icon={faArrowLeft} />
        </Link>
        <h1 className="text-2xl font-bold text-black">
          {isCreate ? "Create Brand" : "Edit Brand"}
        </h1>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              {/* Brand Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter brand name"
                  className="w-full px-4 py-2 border border-gray-line rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter brand description"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-line rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              {/* Logo, Desktop Banner, Mobile Banner - 3 Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Logo Upload */}
                <div>
                  <BannerUploadComponent
                    title="Brand Logo"
                    description="Logo image (recommended: 200x200px)"
                    onUpload={(file) => handleBannerUpload(file, "logo")}
                    previewUrl={previewImage}
                    onDelete={() => handleDeleteImage()}
                    isUploading={uploadingBannerType === "logo"}
                  />
                </div>

                {/* Desktop Banner */}
                <div>
                  <BannerUploadComponent
                    title="Desktop Banner"
                    description="Desktop view (recommended: 1920x400px)"
                    onUpload={(file) => handleBannerUpload(file, "desktop")}
                    previewUrl={previewDesktopBanner}
                    onDelete={() => handleDeleteBanner("desktop")}
                    isUploading={uploadingBannerType === "desktop"}
                  />
                </div>

                {/* Mobile Banner */}
                <div>
                  <BannerUploadComponent
                    title="Mobile Banner"
                    description="Mobile view (recommended: 540x300px)"
                    onUpload={(file) => handleBannerUpload(file, "mobile")}
                    previewUrl={previewMobileBanner}
                    onDelete={() => handleDeleteBanner("mobile")}
                    isUploading={uploadingBannerType === "mobile"}
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-line rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-line">
                <Link
                  href="/admin/brands"
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-semibold text-sm"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSaving || !isFormValid()}
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
                  title={!isFormValid() ? "Please fill all required fields" : ""}
                >
                  {isSaving ? "Saving..." : isCreate ? "Create Brand" : "Update Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column - Product Types */}
        <div className="col-span-1 space-y-6">
          {/* Product Types Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Assign Product Types
            </h2>

            {/* Selected product types display */}
            {selectedProductTypes.length > 0 && (
              <div className="mb-4 p-3 rounded-md border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-2">Selected:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedProductTypes.map((productType) => (
                    <div
                      key={productType.id}
                      className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                    >
                      <span>{productType.name}</span>
                      <button
                        onClick={() => handleRemoveProductType(productType.id!)}
                        className="text-gray-600 hover:text-gray-900 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product type input field with search icon */}
            <div className="relative" ref={productTypeDropdownRef}>
              <div className="flex items-center w-full border border-gray-line bg-white rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-primary">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="text-gray-400 ml-3"
                />
                <input
                  type="text"
                  value={productTypeSearchTerm}
                  onChange={(e) => {
                    setProductTypeSearchTerm(e.target.value);
                    if (!showProductTypeDropdown && e.target.value)
                      setShowProductTypeDropdown(true);
                  }}
                  onFocus={() => {
                    if (allProductTypes.length > 0) setShowProductTypeDropdown(true);
                  }}
                  placeholder="Search product types..."
                  className="w-full ml-2 bg-transparent text-sm focus:outline-none py-2"
                />
              </div>

              {/* Dropdown for product types */}
              {showProductTypeDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {allProductTypes.length === 0 ? (
                    <div className="p-3 text-center text-sm text-gray-500">
                      No product types available
                    </div>
                  ) : filteredProductTypes.length > 0 ? (
                    filteredProductTypes.map((productType) => (
                      <div
                        key={productType.id}
                        className="p-3 hover:bg-gray-100 cursor-pointer text-sm text-gray-800 transition-colors border-b border-gray-100 last:border-b-0"
                        onClick={() => handleSelectProductType(productType)}
                      >
                        {productType.name}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-sm text-gray-500">
                      No product types found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Count */}
            <div className="mt-4 p-3 rounded-md border border-gray-200">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">{selectedProductTypes.length}</span> product type(s) selected
              </p>
            </div>
          </div>

          {/* Sellers Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Assign Sellers
            </h2>

            {/* Selected sellers display */}
            {selectedSellers.length > 0 && (
              <div className="mb-4 p-3 rounded-md border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-2">Selected:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSellers.map((seller) => (
                    <div
                      key={seller.id}
                      className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                    >
                      <span>{seller.firmName || "Seller"}</span>
                      <button
                        onClick={() => handleRemoveSeller(seller.id!)}
                        className="text-gray-600 hover:text-gray-900 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seller input field with search icon */}
            <div className="relative" ref={sellerDropdownRef}>
              <div className="flex items-center w-full border border-gray-line bg-white rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-primary">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="text-gray-400 ml-3"
                />
                <input
                  type="text"
                  value={sellerSearchTerm}
                  onChange={(e) => {
                    setSellerSearchTerm(e.target.value);
                    if (!showSellerDropdown && e.target.value)
                      setShowSellerDropdown(true);
                  }}
                  onFocus={() => {
                    if (allSellers.length > 0) setShowSellerDropdown(true);
                  }}
                  placeholder="Search sellers..."
                  className="w-full ml-2 bg-transparent text-sm focus:outline-none py-2"
                />
              </div>

              {/* Dropdown for sellers */}
              {showSellerDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {allSellers.length === 0 ? (
                    <div className="p-3 text-center text-sm text-gray-500">
                      No sellers available
                    </div>
                  ) : filteredSellers.length > 0 ? (
                    filteredSellers.map((seller) => (
                      <div
                        key={seller.id}
                        className="p-3 hover:bg-gray-100 cursor-pointer text-sm text-gray-800 transition-colors border-b border-gray-100 last:border-b-0"
                        onClick={() => handleSelectSeller(seller)}
                      >
                        <div className="font-semibold">{seller.firmName || "No name"}</div>
                        {seller.email && <div className="text-xs text-gray-500">{seller.email}</div>}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-sm text-gray-500">
                      No sellers found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Count */}
            <div className="mt-4 p-3 rounded-md border border-gray-200">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">{selectedSellers.length}</span> seller(s) selected
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
