"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import { getDiscount, type Discount } from "@/app/lib/services/admin/discountService";
import { showErrorMessage } from "@/app/lib/swalConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import ProductDiscountFormView from "@/app/(dashboard)/admin/discounts/components/ProductDiscountForm";
import BuyGetDiscountFormView from "@/app/(dashboard)/admin/discounts/components/BuyGetDiscountForm";
import OrderDiscountFormView from "@/app/(dashboard)/admin/discounts/components/OrderDiscountForm";


function DiscountViewContent({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { setTitle } = usePageTitle();
  const router = useRouter();
  const [id, setId] = useState<string>("");
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!params) return;

    if (params instanceof Promise) {
      params.then((resolvedParams) => {
        setId(resolvedParams.id);
      });
    } else {
      setId(params.id);
    }
  }, [params]);

  useEffect(() => {
    setTitle("View Discount");
  }, [setTitle]);

  useEffect(() => {
    if (!id) return;

    const fetchDiscount = async () => {
      setIsLoading(true);
      try {
        const data = await getDiscount(id);
        if (data) {
          setDiscount(data);
        } else {
          showErrorMessage("Discount not found");
          router.push("/admin/discounts");
        }
      } catch (error) {
        console.error("Error fetching discount:", error);
        showErrorMessage("Failed to load discount");
        router.push("/admin/discounts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscount();
  }, [id, router]);

  const renderDiscountForm = () => {
    if (!discount) return null;
    
    switch (discount.applicability_type) {
      case "buy x get y":
        return <BuyGetDiscountFormView initialData={discount} isDisabled={true} />;
      case "all products":
        return discount.method === "Automatic Discount" ? 
          <OrderDiscountFormView initialData={discount} isDisabled={true} /> : 
          <ProductDiscountFormView initialData={discount} isDisabled={true} />;
      default:
        return <ProductDiscountFormView initialData={discount} isDisabled={true} />;
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

  if (!discount) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">Discount not found</p>
          <Link
            href="/admin/discounts"
            className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-md"
          >
            Back to Discounts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <Link href="/admin/discounts" className="flex items-center text-black">
          <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
          <span className="title-2-semibold">View Discount</span>
        </Link>
      </div>

      <div className="flex">
        <div className="flex-1 mr-6">
          {/* Main form area */}
          {/* Render the appropriate form based on discount type */}
          {renderDiscountForm()}
        </div>

        {/* Sidebar */}
        <div className="w-80">
          <div className="bg-white rounded-lg shadow-sm custom-border-1 p-6 mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-gray-500 xsmall">
                {discount.discount_code || "No discount code"}
              </h3>
            </div>
            <div className="mb-4">
              <h3 className="text-black small-semibold">Code</h3>
            </div>

            <div className="flex justify-between items-center mb-2">
              <h3 className="text-black small-semibold">Type</h3>
            </div>
            <p className="text-gray-600 xsmall mb-4">
              {discount.discount_type === "percent" ? "Percentage" : "Fixed Amount"}
            </p>

            <div className="flex justify-between items-center mb-2">
              <h3 className="text-black small-semibold">Details</h3>
            </div>
            <ul className="list-disc pl-5 mb-4">
              <li className="text-gray-600 xsmall mb-1">
                {discount.eligibility}
              </li>
              <li className="text-gray-600 xsmall mb-1">
                {discount.uses}
              </li>
              <li className="text-gray-600 xsmall mb-1">
                Active from {discount.start_date}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DiscountViewPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  return (
    <Suspense fallback={<div className="p-4">Loading discount...</div>}>
      <DiscountViewContent params={params} />
    </Suspense>
  );
}
