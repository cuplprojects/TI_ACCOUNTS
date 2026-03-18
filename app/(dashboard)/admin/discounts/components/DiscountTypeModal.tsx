"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faTag } from "@fortawesome/free-solid-svg-icons";

type DiscountType = "product" | "buy-get" | "order" | "shipping";

interface DiscountTypeModalProps {
  onClose: () => void;
}

interface DiscountOption {
  id: DiscountType;
  title: string;
  description: string;
  badgeText: string;
  route: string;
}

export default function DiscountTypeModal({ onClose }: DiscountTypeModalProps) {
  const router = useRouter();

  const discountOptions: DiscountOption[] = [
    {
      id: "product",
      title: "Amount off Products",
      description: "Discount Specific products or collection of products",
      badgeText: "Product Discount",
      route: "/admin/discounts/create?type=product",
    },
    {
      id: "buy-get",
      title: "Buy X get Y",
      description: "Discount Specific products or collection of products",
      badgeText: "Product Discount",
      route: "/admin/discounts/create?type=buy-get",
    },
    {
      id: "order",
      title: "Amount off Order",
      description: "Discount the total order amount",
      badgeText: "Order Discount",
      route: "/admin/discounts/create?type=order",
    },
    {
      id: "shipping",
      title: "Free Shipping",
      description: "Offer free shipping on an order",
      badgeText: "Shipping Discount",
      route: "/admin/discounts/create?type=shipping",
    },
  ];

  const handleSelectType = (option: DiscountOption) => {
    // Navigate directly to the specific discount page
    router.push(option.route);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-blue-00"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white rounded-lg w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="">
          <h2 className="title-2-semibold text-black mb-6 bg-gray-70 px-8 py-4">
            Select Discount Type
          </h2>

          <div>
            {discountOptions.map((option, index) => (
              <React.Fragment key={option.id}>
                <div
                  className="cursor-pointer hover:border-primary px-8 py-3"
                  onClick={() => handleSelectType(option)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="title-4-semibold text-black">
                        {option.title}
                      </h3>
                      <p className="small text-gray-130">
                        {option.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-blue-60 rounded-full px-2 py-1 gap-1.5">
                        <FontAwesomeIcon icon={faTag} className="text-black" />
                        <span className="small text-black">
                          {option.badgeText}
                        </span>
                      </div>
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="text-black"
                      />
                    </div>
                  </div>
                </div>
                {index < discountOptions.length - 1 && (
                  <div className="h-[1px] bg-gray-line mx-8"></div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="my-8 flex justify-end px-8">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-60 text-black rounded-md small-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
