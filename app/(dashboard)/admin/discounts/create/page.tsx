"use client";

import React, { useEffect, useState, Suspense } from "react";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faEdit } from "@fortawesome/free-solid-svg-icons";
import ProductDiscountForm from "../components/ProductDiscountForm";
import BuyGetDiscountForm from "../components/BuyGetDiscountForm";
import OrderDiscountForm from "../components/OrderDiscountForm";
import ShippingDiscountForm from "../components/ShippingDiscountForm";

function DiscountPageContent() {
  const { setTitle } = usePageTitle();
  const searchParams = useSearchParams();
  const router = useRouter();
  const discountType = searchParams.get("type");

  // State for the sidebar details
  const [discountDetails, setDiscountDetails] = useState({
    code: "No discount code yet",
    type: "",
    details: [
      "for online store",
      "No minimum purchase requirement",
      "All customers",
      "No usage limits",
      "Cannot combine with other discounts",
      "Active from today",
    ],
  });

  useEffect(() => {
    if (!discountType) {
      // Redirect to discounts page if no type specified
      router.push("/admin/discounts");
      return;
    }

    // Set page title based on discount type
    let title = "Create Discount";
    let typeLabel = "";

    switch (discountType) {
      case "product":
        title = "Amount Off Products";
        typeLabel = "Amount off product";
        break;
      case "buy-get":
        title = "Buy X Get Y";
        typeLabel = "Buy X get Y";
        break;
      case "order":
        title = "Amount Off Order";
        typeLabel = "Amount off order";
        break;
      case "shipping":
        title = "Free Shipping";
        typeLabel = "Free shipping";
        break;
      default:
        router.push("/admin/discounts");
        return;
    }

    setTitle(title);
    setDiscountDetails((prev) => ({ ...prev, type: typeLabel }));
  }, [discountType, router, setTitle]);

  // Function to render the appropriate form based on discount type
  const renderDiscountForm = () => {
    switch (discountType) {
      case "product":
        return <ProductDiscountForm />;
      case "buy-get":
        return <BuyGetDiscountForm />;
      case "order":
        return <OrderDiscountForm />;
      case "shipping":
        return <ShippingDiscountForm />;
      default:
        return null;
    }
  };

  const getDiscountTypeLabel = () => {
    switch (discountType) {
      case "product":
        return "Products Discount";
      case "buy-get":
        return "Products Discount";
      case "order":
        return "Order Discount";
      case "shipping":
        return "Shipping Discount";
      default:
        return "Discount";
    }
  };

  return (
    <div className="">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <Link href="/admin/discounts" className="flex items-center text-black">
          <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
          <span className="title-2-semibold">Create Discount</span>
        </Link>
      </div>

      <div className="flex">
        <div className="flex-1 mr-6">
          {/* Main form area */}
          <div className="">
            <div className="flex justify-between items-center mb-4">
              {/* Title based on the discount type */}
              <h2 className="text-lg font-semibold">
                {discountType === "product" && "Amount Off Products"}
                {discountType === "buy-get" && "Buy X get Y"}
                {discountType === "order" && "Amount Off Order"}
                {discountType === "shipping" && "Free Shipping"}
              </h2>
              <div className="text-gray-500">{getDiscountTypeLabel()}</div>
            </div>

            {/* Render the appropriate form based on discount type */}
            {renderDiscountForm()}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80">
          <div className="bg-white rounded-lg shadow-sm custom-border-1 p-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-gray-500 xsmall">No discount code yet</h3>
              <button className="text-gray-400 hover:text-gray-600">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <h3 className="text-black small-semibold">Code</h3>
            </div>

            <div className="flex justify-between items-center mb-2">
              <h3 className="text-black small-semibold">Type</h3>
              <button className="text-gray-500">
                <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
              </button>
            </div>
            <p className="text-gray-600 xsmall mb-4">{discountDetails.type}</p>

            <div className="flex justify-between items-center mb-2">
              <h3 className="text-black small-semibold">Details</h3>
              <button className="text-gray-500">
                <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
              </button>
            </div>
            <ul className="list-disc pl-5 mb-4">
              {discountDetails.details.map((detail, index) => (
                <li key={index} className="text-gray-600 xsmall mb-1">
                  {detail}
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-gray-200 pt-4">
              <h3 className="text-black small-semibold mb-2">
                Sales Channel access
              </h3>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="featured-channels"
                  checked
                  className="h-4 w-4 mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="featured-channels"
                  className="ml-2 text-gray-600 xsmall"
                >
                  Allow discount to be featured on selected channels
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateDiscountPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading discount form...</div>}>
      <DiscountPageContent />
    </Suspense>
  );
}
