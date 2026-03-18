"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faEdit,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { showErrorMessage } from "@/app/lib/swalConfig";
import {
  getProductTypeById,
  ProductType,
} from "@/app/lib/services/admin/productTypeService";
import ShippingAgenciesCard from "@/app/components/admin/ShippingAgenciesCard";

interface Seller {
  id: string;
  name: string;
  logo_url?: string;
}

export default function ProductTypeViewPage({
  params,
}: {
  params: { id: string };
}) {
  const { setTitle } = usePageTitle();
  const [productType, setProductType] = useState<ProductType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // Map shipping agencies from DB with fixed names
  const getShippingAgencies = () => {
    const FIXED_AGENCIES = [
      { id: 1, key: "shipglobaldirect", name: "ShipGlobal Direct" },
      { id: 2, key: "shipglobalpremium", name: "ShipGlobal Premium" },
      { id: 3, key: "dhl", name: "DHL Express" },
      { id: 4, key: "aramex", name: "Aramex International" },
    ];

    // If no shipping agencies in DB, return fixed agencies with 0 markup_value
    if (!productType?.shipping_agencies || productType.shipping_agencies.length === 0) {
      return FIXED_AGENCIES.map(agency => ({
        id: agency.id,
        key: agency.key,
        name: agency.name,
        amount: 0,
      }));
    }

    // Map DB agencies with fixed names
    return FIXED_AGENCIES.map(fixedAgency => {
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
  };

  useEffect(() => {
    setTitle("View Product Type");

    let isMounted = true;

    const loadProductType = async () => {
      setIsLoading(true);
      try {
        const productTypeData = await getProductTypeById(params.id);
        if (isMounted && productTypeData) {
          setProductType(productTypeData);
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

    loadProductType();

    return () => {
      isMounted = false;
    };
  }, [setTitle, params.id]);

  // Filter brands based on search
  const filteredBrands = (productType?.brands || []).filter((brand) =>
    (brand.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
  );

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

  if (!productType) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/admin/product-types"
            className="text-primary hover:text-primary-dark"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </Link>
          <h1 className="text-2xl font-bold text-black">
            Product Type Not Found
          </h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600 mb-4">
            The product type you're looking for doesn't exist.
          </p>
          <Link
            href="/admin/product-types"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark font-semibold text-sm"
          >
            Back to Product Types
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/product-types"
          className="text-primary hover:text-primary-dark"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </Link>
        <h1 className="text-2xl font-bold text-black">View Product Type</h1>
        <Link
          href={`/admin/product-types/${productType.id}`}
          className="ml-auto px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark font-semibold text-sm flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faEdit} />
          Edit
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <form className="space-y-6">
              {/* Product Type Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Type Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={productType.name}
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
                  value={productType.description || ""}
                  disabled
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-line rounded-md bg-blue-80 text-gray-600 text-sm cursor-not-allowed"
                />
              </div>

              {/* Icon URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Icon URL
                </label>
                <input
                  type="url"
                  value={productType.icon_url || ""}
                  disabled
                  className="w-full px-4 py-2 border border-gray-line rounded-md bg-blue-80 text-gray-600 text-sm cursor-not-allowed"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={productType.status}
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
                      productType.createdAt
                        ? new Date(productType.createdAt).toLocaleString()
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
                      productType.updatedAt
                        ? new Date(productType.updatedAt).toLocaleString()
                        : "N/A"
                    }
                    disabled
                    className="w-full px-4 py-2 border border-gray-line rounded-md bg-blue-80 text-gray-600 text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-line">
                <Link
                  href="/admin/product-types"
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-semibold text-sm"
                >
                  Back
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side Section */}
        <div className="col-span-1 space-y-6">
          {/* Brands Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Assigned Brands
            </h2>

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search brands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-line rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-10 h-3 w-3"
                />
              </div>
            </div>

            {/* Brands List */}
            <div className="border border-gray-line rounded-md p-3 max-h-96 overflow-y-auto">
              {!productType.brands || productType.brands.length === 0 ? (
                <p className="text-gray-500 text-sm">No brands assigned</p>
              ) : filteredBrands.length === 0 ? (
                <p className="text-gray-500 text-sm">No brands found</p>
              ) : (
                <div className="space-y-2">
                  {filteredBrands.map((brand) => (
                    <div
                      key={brand.id}
                      className="p-2 border border-gray-line rounded bg-blue-80"
                    >
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {brand.name || "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Seller Count */}
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">
                  {productType.brands ? productType.brands.length : 0}
                </span>{" "}
                brand(s) assigned
              </p>
            </div>
          </div>

          {/* Shipping Agencies Section */}
          <ShippingAgenciesCard agencies={getShippingAgencies()} readOnly={true} />
        </div>
      </div>
    </div>
  );
}
