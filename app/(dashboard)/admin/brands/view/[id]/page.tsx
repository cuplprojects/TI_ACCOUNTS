"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faTrash, faEye } from "@fortawesome/free-solid-svg-icons";
import { showErrorMessage } from "@/app/lib/swalConfig";
import { getBrandById, deleteBrand, Brand } from "@/app/lib/services/admin/brandService";
import ImageModal from "@/app/components/common/ImageModal";

export default function BrandViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { setTitle } = usePageTitle();
  const router = useRouter();
  const { id } = use(params);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");

  useEffect(() => {
    setTitle("View Brand");

    let isMounted = true;

    const loadBrand = async () => {
      setIsLoading(true);
      try {
        const brandData = await getBrandById(id);
        if (isMounted && brandData) {
          setBrand(brandData);
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

    loadBrand();

    return () => {
      isMounted = false;
    };
  }, [setTitle, id]);

  const canDelete = (): boolean => {
    if (!brand) return false;
    const hasProducts = brand.ProductTypes && brand.ProductTypes.length > 0;
    const hasSellers = brand.sellers && brand.sellers.length > 0;
    return !hasProducts && !hasSellers;
  };

  const getDeleteRestrictionReason = (): string | null => {
    if (!brand) return null;
    const hasProducts = brand.ProductTypes && brand.ProductTypes.length > 0;
    const hasSellers = brand.sellers && brand.sellers.length > 0;

    if (hasProducts && hasSellers) {
      return `This brand cannot be deleted because it has ${brand.ProductTypes?.length} product type(s) and ${brand.sellers?.length} seller(s) assigned to it.`;
    } else if (hasProducts) {
      return `This brand cannot be deleted because it has ${brand.ProductTypes?.length} product type(s) with products under it.`;
    } else if (hasSellers) {
      return `This brand cannot be deleted because ${brand.sellers?.length} seller(s) are assigned to it.`;
    }
    return null;
  };

  const handleDelete = async () => {
    if (!brand?.id) return;
    setIsDeleting(true);
    const success = await deleteBrand(brand.id);
    setIsDeleting(false);
    if (success) {
      router.push("/admin/brands");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-40 mb-6"></div>
          <div className="bg-white rounded-lg p-6 space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/brands" className="text-primary hover:text-primary-dark">
            <FontAwesomeIcon icon={faArrowLeft} />
          </Link>
          <h1 className="text-2xl font-bold text-black">Brand Not Found</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600 mb-4">The brand you're looking for doesn't exist.</p>
          <Link
            href="/admin/brands"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark font-semibold text-sm"
          >
            Back to Brands
          </Link>
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
        <h1 className="text-2xl font-bold text-black">View Brand</h1>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <form className="space-y-6">
              {/* Brand Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={brand.name}
                  disabled
                  className="w-full px-4 py-2 border border-gray-line rounded-md bg-blue-80 text-gray-600 text-sm cursor-not-allowed"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={brand.description || ""}
                  disabled
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-line rounded-md bg-blue-80 text-gray-600 text-sm cursor-not-allowed"
                />
              </div>

              {/* Logo, Desktop Banner, Mobile Banner - 3 Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Logo Preview */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Brand Logo
                  </label>
                  {brand.logo_url ? (
                    <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden border border-gray-line relative group">
                      <img
                        src={brand.logo_url}
                        alt="Brand logo"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedImageUrl(brand.logo_url || "");
                          setIsImageModalOpen(true);
                        }}
                        className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors"
                        title="View logo"
                      >
                        <FontAwesomeIcon
                          icon={faEye}
                          className="text-white opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                        />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-40 bg-gray-100 rounded-lg border border-gray-line flex items-center justify-center">
                      <p className="text-gray-500 text-sm">No logo uploaded</p>
                    </div>
                  )}
                </div>

                {/* Desktop Banner Preview */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Desktop Banner
                  </label>
                  {brand.banner_desktop_url ? (
                    <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden border border-gray-line relative group">
                      <img
                        src={brand.banner_desktop_url}
                        alt="Desktop banner"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedImageUrl(brand.banner_desktop_url || "");
                          setIsImageModalOpen(true);
                        }}
                        className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors"
                        title="View banner"
                      >
                        <FontAwesomeIcon
                          icon={faEye}
                          className="text-white opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                        />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-40 bg-gray-100 rounded-lg border border-gray-line flex items-center justify-center">
                      <p className="text-gray-500 text-sm">No banner uploaded</p>
                    </div>
                  )}
                </div>

                {/* Mobile Banner Preview */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mobile Banner
                  </label>
                  {brand.banner_mobile_url ? (
                    <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden border border-gray-line relative group">
                      <img
                        src={brand.banner_mobile_url}
                        alt="Mobile banner"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedImageUrl(brand.banner_mobile_url || "");
                          setIsImageModalOpen(true);
                        }}
                        className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors"
                        title="View banner"
                      >
                        <FontAwesomeIcon
                          icon={faEye}
                          className="text-white opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                        />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-40 bg-gray-100 rounded-lg border border-gray-line flex items-center justify-center">
                      <p className="text-gray-500 text-sm">No banner uploaded</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={brand.status}
                  disabled
                  className="w-full px-4 py-2 border border-gray-line rounded-md bg-blue-80 text-gray-600 text-sm cursor-not-allowed"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-line">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Created At
                  </label>
                  <input
                    type="text"
                    value={
                      brand.createdAt
                        ? new Date(brand.createdAt).toLocaleString()
                        : "N/A"
                    }
                    disabled
                    className="w-full px-4 py-2 border border-gray-line rounded-md bg-blue-80 text-gray-600 text-sm cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Updated At
                  </label>
                  <input
                    type="text"
                    value={
                      brand.updatedAt
                        ? new Date(brand.updatedAt).toLocaleString()
                        : "N/A"
                    }
                    disabled
                    className="w-full px-4 py-2 border border-gray-line rounded-md bg-blue-80 text-gray-600 text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Delete Restriction Warning */}
              {getDeleteRestrictionReason() && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{getDeleteRestrictionReason()}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-line">
                <Link
                  href="/admin/brands"
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-semibold text-sm"
                >
                  Back
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={!canDelete() || isDeleting}
                  className={`px-6 py-2 rounded-md font-semibold text-sm flex items-center gap-2 ${
                    canDelete()
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  title={getDeleteRestrictionReason() || "Delete this brand"}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  {isDeleting ? "Deleting..." : "Delete"}
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
              Assigned Product Types
            </h2>

            {/* Product Types List */}
            <div className="border border-gray-line rounded-md p-3 max-h-96 overflow-y-auto">
              {!brand.ProductTypes || brand.ProductTypes.length === 0 ? (
                <p className="text-gray-500 text-sm">No product types assigned</p>
              ) : (
                <div className="space-y-2">
                  {brand.ProductTypes.map((productType: any) => (
                    <div
                      key={productType.id}
                      className="p-2 border border-gray-line rounded "
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {productType.name || "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Type Count */}
            <div className="mt-4 p-3  rounded-md border border-gray-200">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">
                  {brand.ProductTypes ? brand.ProductTypes.length : 0}
                </span>{" "}
                product type(s) assigned
              </p>
            </div>
          </div>

          {/* Sellers Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Assigned Sellers
            </h2>

            {/* Sellers List */}
            <div className="border border-gray-line rounded-md p-3 max-h-96 overflow-y-auto">
              {!brand.sellers || brand.sellers.length === 0 ? (
                <p className="text-gray-500 text-sm">No sellers assigned</p>
              ) : (
                <div className="space-y-2">
                  {brand.sellers.map((seller: any) => (
                    <div
                      key={seller.id}
                      className="p-2 border border-gray-line rounded"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {seller.firm_name || "N/A"}
                      </p>
                      <p className="text-xs text-gray-600">{seller.email}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Seller Count */}
            <div className="mt-4 p-3 rounded-md border border-gray-200">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">
                  {brand.sellers ? brand.sellers.length : 0}
                </span>{" "}
                seller(s) assigned
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={isImageModalOpen}
        imageUrl={selectedImageUrl}
        fileName={`${brand?.name || "Brand"} Image`}
        onClose={() => {
          setIsImageModalOpen(false);
          setSelectedImageUrl("");
        }}
      />
    </div>
  );
}
