"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSearch } from "@fortawesome/free-solid-svg-icons";
import { showErrorMessage } from "@/app/lib/swalConfig";
import {
  getProductTypeById,
  updateProductType,
  createProductType,
} from "@/app/lib/services/admin/productTypeService";
import * as collectionService from "@/app/lib/services/admin/collectionService";
import Link from "next/link";
import ShippingAgenciesCard from "@/app/components/admin/ShippingAgenciesCard";

export default function ProductTypeEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { setTitle } = usePageTitle();
  const router = useRouter();
  const resolvedParams = React.use(params);
  const isCreate = resolvedParams.id === "create";

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon_url: "",
    status: "active" as "active" | "inactive",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [superCategories, setSuperCategories] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedSuperCategories, setSelectedSuperCategories] = useState<Array<{ id: string; title: string }>>([]);
  const [superCategorySearchTerm, setSuperCategorySearchTerm] = useState("");
  const [showSuperCategoryDropdown, setShowSuperCategoryDropdown] = useState(false);
  const superCategoryDropdownRef = useRef<HTMLDivElement>(null);
  const [shippingAgencies, setShippingAgencies] = useState([
    { id: 1, key: "shipglobaldirect", name: "ShipGlobal Direct", amount: 0 },
    { id: 2, key: "shipglobalpremium", name: "ShipGlobal Premium", amount: 0 },
    { id: 3, key: "dhl", name: "DHL Express", amount: 0 },
    { id: 4, key: "aramex", name: "Aramex International", amount: 0 },
  ]);

  const FIXED_AGENCIES = [
    { id: 1, key: "shipglobaldirect", name: "ShipGlobal Direct" },
    { id: 2, key: "shipglobalpremium", name: "ShipGlobal Premium" },
    { id: 3, key: "dhl", name: "DHL Express" },
    { id: 4, key: "aramex", name: "Aramex International" },
  ];

  useEffect(() => {
    setTitle(isCreate ? "Create Product Type" : "Edit Product Type");
    
    let isMounted = true;

    const initializeData = async () => {
      if (!isCreate && isMounted) {
        await fetchProductType(isMounted);
      }
      await fetchSuperCategories(isMounted);
    };

    initializeData();

    return () => {
      isMounted = false;
    };
  }, [setTitle, isCreate]);

  const fetchProductType = async (isMounted: boolean) => {
    setIsLoading(true);
    try {
      const productType = await getProductTypeById(resolvedParams.id);
      if (isMounted && productType) {
        setFormData({
          name: productType.name,
          description: productType.description || "",
          icon_url: productType.icon_url || "",
          status: productType.status,
        });
        // Load previously selected super categories
        if (productType.super_categories && Array.isArray(productType.super_categories)) {
          setSelectedSuperCategories(productType.super_categories);
        }
        // Load shipping agencies from API
        if (productType.shipping_agencies && Array.isArray(productType.shipping_agencies)) {
          if (productType.shipping_agencies.length === 0) {
            // If empty, use fixed agencies with 0 markup_value
            setShippingAgencies(FIXED_AGENCIES.map(agency => ({
              id: agency.id,
              key: agency.key,
              name: agency.name,
              amount: 0,
            })));
          } else {
            // Map DB agencies with fixed names
            const agenciesWithNames = FIXED_AGENCIES.map(fixedAgency => {
              const dbAgency = (productType.shipping_agencies as any[]).find(
                (a: any) => a.key === fixedAgency.key
              );
              return {
                id: fixedAgency.id,
                key: fixedAgency.key,
                name: fixedAgency.name,
                amount: dbAgency?.markup_value || 0,
              };
            });
            setShippingAgencies(agenciesWithNames);
          }
        }
      }
    } catch (error) {
      if (isMounted) {
        console.error("Error fetching product type:", error);
        showErrorMessage("Failed to fetch product type");
      }
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  };

  const fetchSuperCategories = async (isMounted: boolean) => {
    try {
      const response = await collectionService.getSuperCategories();
      if (isMounted && response && Array.isArray(response)) {
        setSuperCategories(response.map((cat: any) => ({
          id: cat.id || "",
          title: cat.title || "",
        })));
      }
    } catch (error) {
      if (isMounted) {
        console.error("Error fetching super categories:", error);
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

  const handleSelectSuperCategory = (superCategory: { id: string; title: string }) => {
    if (!selectedSuperCategories.some((sc) => sc.id === superCategory.id)) {
      setSelectedSuperCategories([...selectedSuperCategories, superCategory]);
    }
    setSuperCategorySearchTerm("");
    setShowSuperCategoryDropdown(false);
  };

  const handleRemoveSuperCategory = (superCategoryId: string) => {
    setSelectedSuperCategories(
      selectedSuperCategories.filter((sc) => sc.id !== superCategoryId)
    );
  };

  const filteredSuperCategories = superCategories.filter((sc) =>
    (sc.title?.toLowerCase() || "").includes(superCategorySearchTerm.toLowerCase()) &&
    !selectedSuperCategories.some((selected) => selected.id === sc.id)
  );

  // Add click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        superCategoryDropdownRef.current &&
        !superCategoryDropdownRef.current.contains(event.target as Node) &&
        showSuperCategoryDropdown
      ) {
        setShowSuperCategoryDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSuperCategoryDropdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showErrorMessage("Product type name is required");
      return;
    }

    setIsSaving(true);
    try {
      const superCategoryIds = selectedSuperCategories.map((sc) => sc.id);
      
      if (isCreate) {
        const success = await createProductType(formData, superCategoryIds, shippingAgencies);
        if (success) {
          router.push("/admin/product-types");
        }
      } else {
        const updateSuccess = await updateProductType(resolvedParams.id, formData, superCategoryIds, shippingAgencies);
        if (updateSuccess) {
          router.push("/admin/product-types");
        }
      }
    } catch (error) {
      console.error("Error saving product type:", error);
      showErrorMessage("Failed to save product type");
    } finally {
      setIsSaving(false);
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/product-types" className="text-primary hover:text-primary-dark">
          <FontAwesomeIcon icon={faArrowLeft} />
        </Link>
        <h1 className="text-2xl font-bold text-black">
          {isCreate ? "Create Product Type" : "Edit Product Type"}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Form Section - Left Column */}
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Type Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Type Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Liquid, Solid, Book, Physical Product"
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
                  placeholder="Enter product type description"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-line rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>

              {/* Icon URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Icon URL
                </label>
                <input
                  type="url"
                  name="icon_url"
                  value={formData.icon_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/icon.png"
                  className="w-full px-4 py-2 border border-gray-line rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
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
              <div className="flex gap-4 pt-4 border-t border-gray-line">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 font-semibold text-sm"
                >
                  {isSaving ? "Saving..." : isCreate ? "Create Product Type" : "Update Product Type"}
                </button>
                <Link
                  href="/admin/product-types"
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-semibold text-sm"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Super Categories Section - Right Column */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Assign Super Categories
            </h2>

            {/* Selected super categories display */}
            {selectedSuperCategories.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">Selected:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSuperCategories.map((superCategory) => (
                    <div
                      key={superCategory.id}
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                    >
                      <span>{superCategory.title}</span>
                      <button
                        onClick={() => handleRemoveSuperCategory(superCategory.id)}
                        className="text-gray-600 hover:text-gray-900 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Super category input field with search icon */}
            <div className="relative" ref={superCategoryDropdownRef}>
              <div className="flex items-center w-full border border-gray-line bg-white rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-primary">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="text-gray-400 ml-3"
                />
                <input
                  type="text"
                  value={superCategorySearchTerm}
                  onChange={(e) => {
                    setSuperCategorySearchTerm(e.target.value);
                    if (!showSuperCategoryDropdown && e.target.value)
                      setShowSuperCategoryDropdown(true);
                  }}
                  onFocus={() => {
                    if (superCategories.length > 0) setShowSuperCategoryDropdown(true);
                  }}
                  placeholder="Search super categories..."
                  className="w-full ml-2 bg-transparent text-sm focus:outline-none py-2"
                />
              </div>

              {/* Dropdown for super categories */}
              {showSuperCategoryDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {superCategories.length === 0 ? (
                    <div className="p-3 text-center text-sm text-gray-500">
                      No super categories available
                    </div>
                  ) : filteredSuperCategories.length > 0 ? (
                    filteredSuperCategories.map((superCategory) => (
                      <div
                        key={superCategory.id}
                        className="p-3 hover:bg-gray-100 cursor-pointer text-sm text-gray-800 transition-colors border-b border-gray-100 last:border-b-0"
                        onClick={() => handleSelectSuperCategory(superCategory)}
                      >
                        {superCategory.title}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-sm text-gray-500">
                      No super categories found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Count */}
            <div className="mt-4 p-3  rounded-md border border-gray-200">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">{selectedSuperCategories.length}</span> super category(ies) selected
              </p>
            </div>
          </div>

          {/* Shipping Agencies Section */}
          <ShippingAgenciesCard 
            agencies={shippingAgencies} 
            onAgencyChange={setShippingAgencies}
            readOnly={false}
          />
        </div>
      </div>
    </div>
  );
}
