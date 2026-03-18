"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import DiscountTypeModal from "./components/DiscountTypeModal";
import { deleteDiscount, getAllDiscounts, bulkDeleteDiscounts, type Discount } from "@/app/lib/services/admin/discountService";
import { showConfirmation } from "@/app/lib/swalConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faPlus,
  faEye,
  faTrash,
  faPencil,
  faX,
} from "@fortawesome/free-solid-svg-icons";

export default function DiscountsPage() {
  const { setTitle } = usePageTitle();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [filteredDiscounts, setFilteredDiscounts] = useState<Discount[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tabs] = useState([
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "scheduled", label: "Scheduled" },
    { id: "expired", label: "Expired" },
  ]);

  useEffect(() => {
    setTitle("Discounts");
  }, [setTitle]);

  useEffect(() => {
    const fetchDiscounts = async () => {
      setIsLoading(true);
      try {
        const data = await getAllDiscounts();
        if (data && Array.isArray(data)) {
          setDiscounts(data);
          setFilteredDiscounts(data);
        }
      } catch (error) {
        console.error("Error fetching discounts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscounts();
  }, []);

  useEffect(() => {
    if (activeTab === "all") {
      setFilteredDiscounts(discounts);
    } else {
      const filtered = discounts.filter((discount) => {
        const now = new Date();
        const startDate = new Date(`${discount.start_date}T${discount.start_time}`);
        const endDate = discount.set_end && discount.end_date 
          ? new Date(`${discount.end_date}T${discount.end_time}`)
          : null;

        if (activeTab === "active") {
          return now >= startDate && (!endDate || now <= endDate);
        } else if (activeTab === "scheduled") {
          return now < startDate;
        } else if (activeTab === "expired") {
          return endDate && now > endDate;
        }
        return true;
      });
      setFilteredDiscounts(filtered);
    }
  }, [activeTab, discounts]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      if (activeTab === "all") {
        setFilteredDiscounts(discounts);
      }
      return;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = discounts.filter((discount) => {
      if (discount.discount_code?.toLowerCase().includes(lowerCaseSearchTerm)) return true;
      if (discount.method?.toLowerCase().includes(lowerCaseSearchTerm)) return true;
      if (discount.discount_type?.toLowerCase().includes(lowerCaseSearchTerm)) return true;
      if (String(discount.discount_value).includes(lowerCaseSearchTerm)) return true;
      if (discount.eligibility?.toLowerCase().includes(lowerCaseSearchTerm)) return true;
      return false;
    });

    setFilteredDiscounts(filtered);
  }, [searchTerm, discounts]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedDiscounts([]);
    } else {
      setSelectedDiscounts(filteredDiscounts.map((discount) => discount.id!).filter(Boolean));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectDiscount = (id: string) => {
    if (selectedDiscounts.includes(id)) {
      setSelectedDiscounts(
        selectedDiscounts.filter((discountId) => discountId !== id)
      );
    } else {
      setSelectedDiscounts([...selectedDiscounts, id]);
    }
  };

  const handleBulkDelete = async () => {
    const result = await bulkDeleteDiscounts(selectedDiscounts);
    
    if (result.success && result.confirmed) {
      // Remove deleted discounts from the list
      const remainingDiscounts = discounts.filter(
        (d) => !selectedDiscounts.includes(d.id!)
      );
      setDiscounts(remainingDiscounts);
      setSelectedDiscounts([]);
      setSelectAll(false);
    } else if (result.confirmed) {
      // User confirmed but deletion failed - just deselect
      setSelectedDiscounts([]);
      setSelectAll(false);
    }
  };

  const handleViewDiscount = (discountId: string) => {
    router.push(`/admin/discounts/${discountId}`);
  };

  const handleEditDiscount = (discountId: string) => {
    router.push(`/admin/discounts/${discountId}/edit`);
  };

  const handleDeleteDiscount = async (discountId: string) => {
    const result = await showConfirmation(
      "Delete Discount",
      "Are you sure you want to delete this discount? This action cannot be undone."
    );

    if (result.isConfirmed) {
      setIsDeleting(true);
      const success = await deleteDiscount(discountId);
      setIsDeleting(false);
      
      if (success) {
        setDiscounts(discounts.filter((d) => d.id !== discountId));
        setSelectedDiscounts(selectedDiscounts.filter((id) => id !== discountId));
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const getDiscountStatus = (discount: Discount) => {
    const now = new Date();
    const startDate = new Date(`${discount.start_date}T${discount.start_time}`);
    const endDate = discount.set_end && discount.end_date 
      ? new Date(`${discount.end_date}T${discount.end_time}`)
      : null;

    if (now < startDate) return "Scheduled";
    if (endDate && now > endDate) return "Expired";
    return "Active";
  };

  return (
    <div className="">
      <div className="flex items-center justify-between mb-6">
        <h1 className="title-2-semibold text-black">Discounts</h1>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md xsmall-semibold">
            Export
          </button>
          <button
            onClick={() => setShowTypeModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-md xsmall-semibold"
          >
            Create Discount
          </button>
        </div>
      </div>

      <div className="bg-gray-bg rounded-lg p-5">
        {selectedDiscounts.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between">
            <span className="xsmall-semibold text-black">
              {selectedDiscounts.length} discount{selectedDiscounts.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md xsmall-semibold hover:bg-red-700 disabled:opacity-50"
              >
                Delete Selected
              </button>
              <button
                onClick={() => {
                  setSelectedDiscounts([]);
                  setSelectAll(false);
                }}
                disabled={isDeleting}
                className="p-2 text-gray-600 hover:text-gray-800"
              >
                <FontAwesomeIcon icon={faX} className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex space-x-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 rounded-md xsmall-semibold ${
                    activeTab === tab.id
                      ? "bg-gray-line text-black"
                      : "border-transparent text-gray-10"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <button className="p-2 text-gray-10 hover:text-gray-20">
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
            <div className="flex items-center flex-1 max-w-md ml-auto">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by code, method, type..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-line rounded-md xsmall placeholder:xsmall focus:outline-none text-gray-10"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-10 h-3 w-3"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="">
          <div className="overflow-x-auto rounded-md">
            <table className="min-w-full">
              <thead className="bg-gray-line">
                <tr>
                  <th className="w-8 px-6 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                    Eligibility
                  </th>
                  <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-line">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredDiscounts.length === 0 ? (
                  <tr className="w-full">
                    <td
                      colSpan={9}
                      className="w-full text-center text-gray-500 py-5"
                    >
                      <div className="flex flex-col gap-2 justify-center items-center">
                        {searchTerm ? (
                          <span>
                            No discounts found matching your search criteria.
                          </span>
                        ) : (
                          <span>No discounts found. Create one!</span>
                        )}
                        <button
                          onClick={() => setShowTypeModal(true)}
                          className="px-4 py-2 bg-primary text-white rounded-md xsmall-semibold"
                        >
                          Create Discount
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDiscounts.map((discount) => (
                    <tr key={discount.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                          checked={selectedDiscounts.includes(discount.id!)}
                          onChange={() => handleSelectDiscount(discount.id!)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <p className="xsmall text-black font-mono">
                          {discount.discount_code || "N/A"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-green-00 text-success rounded-full xxsmall">
                          {getDiscountStatus(discount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 xsmall text-black">
                        {discount.method}
                      </td>
                      <td className="px-6 py-4 xsmall text-black capitalize">
                        {discount.discount_type}
                      </td>
                      <td className="px-6 py-4 xsmall text-black capitalize">
                        <span className="px-2 py-1  text-blue-800 rounded text-xs font-medium">
                          {discount.discount_category?.replace('_', ' ') || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 xsmall-semibold text-black">
                        {discount.discount_type === "percent"
                          ? `${discount.discount_value}%`
                          : `₹${discount.discount_value}`}
                      </td>
                      <td className="px-6 py-4 xsmall text-black capitalize">
                        {discount.eligibility}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            title="View"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDiscount(discount.id!);
                            }}
                            disabled={isDeleting}
                          >
                            <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                          </button>
                          <button
                            className="text-green-600 hover:text-green-800"
                            title="Edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditDiscount(discount.id!);
                            }}
                            disabled={isDeleting}
                          >
                            <FontAwesomeIcon icon={faPencil} className="h-4 w-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDiscount(discount.id!);
                            }}
                            disabled={isDeleting}
                          >
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="h-4 w-4"
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
        </div>
      </div>

      {showTypeModal && (
        <DiscountTypeModal onClose={() => setShowTypeModal(false)} />
      )}
    </div>
  );
}
