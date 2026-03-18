"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import "@/app/styles/react-select.css";
import {
  createDiscount,
  updateDiscount,
  Discount,
  generateRandomDiscountCode,
} from "@/app/lib/services/admin/discountService";
import { useRouter } from "next/navigation";
import axiosInstance from "@/app/lib/axiosConfig";
import { showErrorToast } from "@/app/lib/swalConfig";

// Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

export default function ProductDiscountForm({ initialData, isDisabled = false }: { initialData?: Discount; isDisabled?: boolean }) {
  const [discountCode, setDiscountCode] = useState(initialData?.discount_code || "");
  const [discountMethod, setDiscountMethod] = useState(
    initialData?.method === "Automatic Discount" ? "automatic" : "code"
  );
  const [discountType, setDiscountType] = useState(
    initialData?.discount_type === "percent" ? "percentage" : "amount"
  );
  const [discountValue, setDiscountValue] = useState(initialData?.discount_value?.toString() || "");
  const [minimumRequirement, setMinimumRequirement] = useState(
    initialData?.minimum_type || "none"
  );
  const [minimumAmount, setMinimumAmount] = useState(
    initialData?.minimum_type === "amount" ? initialData?.minimum_value?.toString() || "" : ""
  );
  const [minimumQuantity, setMinimumQuantity] = useState(
    initialData?.minimum_type === "quantity" ? initialData?.minimum_value?.toString() || "" : ""
  );
  const [eligibility, setEligibility] = useState(
    initialData?.eligibility === "all customers" ? "all" : "customer"
  );
  const [limitTotal, setLimitTotal] = useState(initialData?.uses === "no of times");
  const [limitCustomer, setLimitCustomer] = useState(
    initialData?.uses === "one use per customer"
  );
  const [maxUses, setMaxUses] = useState(initialData?.max_uses?.toString() || "");
  const [startDate, setStartDate] = useState(
    initialData?.start_date ? initialData.start_date.split("T")[0] : new Date().toISOString().slice(0, 10)
  );
  const [startTime, setStartTime] = useState(
    initialData?.start_time ? initialData.start_time.substring(0, 5) : "00:00"
  );
  const [setEnd, setSetEnd] = useState(initialData?.set_end || false);
  const [endDate, setEndDate] = useState(
    initialData?.end_date ? initialData.end_date.split("T")[0] : ""
  );
  const [endTime, setEndTime] = useState(
    initialData?.end_time ? initialData.end_time.substring(0, 5) : ""
  );
  const [appliesToType, setAppliesToType] = useState(
    initialData?.applicability_type === "specific products" ? "products" : 
    initialData?.applicability_type === "specific categories" ? "collections" : "all"
  );
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    initialData?.productIds || []
  );
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    initialData?.collectionIds || []
  );
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>(
    initialData?.customerIds || []
  );
  const [products, setProducts] = useState<Array<{ value: string; label: string }>>([]);
  const [collections, setCollections] = useState<Array<{ value: string; label: string }>>([]);
  const [customers, setCustomers] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedProductOptions, setSelectedProductOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedCollectionOptions, setSelectedCollectionOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedCustomerOptions, setSelectedCustomerOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [productSearch, setProductSearch] = useState("");
  const [collectionSearch, setCollectionSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Debounce search values
  const debouncedProductSearch = useDebounce(productSearch, 500);
  const debouncedCollectionSearch = useDebounce(collectionSearch, 500);
  const debouncedCustomerSearch = useDebounce(customerSearch, 500);

  // Initialize selected options from initial data
  useEffect(() => {
    if (initialData?.productIds && Array.isArray(initialData.productIds)) {
      const options = initialData.productIds.map((item: any) => ({
        value: item.id || item,
        label: item.title || item,
      }));
      setSelectedProductOptions(options);
      setSelectedProducts(options.map(o => o.value));
    }
    
    if (initialData?.collectionIds && Array.isArray(initialData.collectionIds)) {
      const options = initialData.collectionIds.map((item: any) => ({
        value: item.id || item,
        label: item.title || item,
      }));
      setSelectedCollectionOptions(options);
      setSelectedCollections(options.map(o => o.value));
    }
    
    if (initialData?.customerIds && Array.isArray(initialData.customerIds)) {
      const options = initialData.customerIds.map((item: any) => ({
        value: item.id || item,
        label: item.title || item,
      }));
      setSelectedCustomerOptions(options);
      setSelectedCustomers(options.map(o => o.value));
    }
  }, [initialData]);

  // Fetch products when appliesToType is "products" or when debounced search changes
  useEffect(() => {
    if (appliesToType === "products") {
      const fetchProducts = async () => {
        setIsLoadingProducts(true);
        try {
          const res = await axiosInstance.get("/admin/product/get-products", {
            params: { 
              page: 1, 
              limit: 20,
              search: debouncedProductSearch
            }
          });
          if (res.data.success) {
            setProducts(
              res.data.data.products.map((p: any) => ({
                value: p.id,
                label: p.title,
              }))
            );
          }
        } catch (error) {
          console.error("Error fetching products:", error);
        } finally {
          setIsLoadingProducts(false);
        }
      };

      fetchProducts();
    }
  }, [appliesToType, debouncedProductSearch]);

  // Fetch collections when appliesToType is "collections" or when debounced search changes
  useEffect(() => {
    if (appliesToType === "collections") {
      const fetchCollections = async () => {
        setIsLoadingCollections(true);
        try {
          const res = await axiosInstance.get("/admin/collection/get-all-sub-categories", {
            params: { 
              page: 1, 
              limit: 20,
              search: debouncedCollectionSearch
            }
          });
          console.log("Collections response:", res.data);
          if (res.data.success) {
            const collectionData = Array.isArray(res.data.data) ? res.data.data : [];
            setCollections(
              collectionData.map((c: any) => ({
                value: c.id,
                label: c.title || c.name || "Untitled",
              }))
            );
          }
        } catch (error) {
          console.error("Error fetching collections:", error);
        } finally {
          setIsLoadingCollections(false);
        }
      };

      fetchCollections();
    }
  }, [appliesToType, debouncedCollectionSearch]);

  // Fetch customers when eligibility is "customer" or when debounced search changes
  useEffect(() => {
    if (eligibility === "customer") {
      const fetchCustomers = async () => {
        setIsLoadingCustomers(true);
        try {
          const res = await axiosInstance.get("/admin/user/get-users", {
            params: { 
              page: 1, 
              limit: 20,
              search: debouncedCustomerSearch
            }
          });
          if (res.data.success) {
            setCustomers(
              res.data.data.users.map((cust: any) => ({
                value: cust.id,
                label: `${cust.first_name} ${cust.last_name}`,
              }))
            );
          }
        } catch (error) {
          console.error("Error fetching customers:", error);
        } finally {
          setIsLoadingCustomers(false);
        }
      };

      fetchCustomers();
    }
  }, [eligibility, debouncedCustomerSearch]);

  const handleDiscard = () => {
    router.push("/admin/discounts");
  };

  const handleSave = async () => {
    // Validation
    if (!discountValue) {
      showErrorToast("Please enter a discount value");
      return;
    }

    if (discountMethod === "code" && !discountCode) {
      showErrorToast("Please enter a discount code");
      return;
    }

    // Products and collections are now optional - if none selected, applies to all

    if (eligibility === "customer" && selectedCustomers.length === 0) {
      showErrorToast("Please select at least one customer");
      return;
    }

    if (maxUses && isNaN(Number(maxUses))) {
      showErrorToast("Max uses must be a valid integer");
      return;
    }

    setIsSaving(true);

    const applicabilityMap = {
      products: "specific products",
      collections: "specific categories",
      all: "all products",
    };

    const payload: Partial<Discount> = {
      method: discountMethod === "code" ? "Discount Code" : "Automatic Discount",
      discount_code: discountMethod === "code" ? discountCode : null,
      discount_type: discountType === "percentage" ? "percent" : "flat",
      discount_category: "product",
      discount_value: Number(discountValue),
      applicability_type: applicabilityMap[appliesToType as keyof typeof applicabilityMap] as any,
      minimum_type:
        minimumRequirement === "none"
          ? "NA"
          : (minimumRequirement as "amount" | "quantity"),
      minimum_value:
        minimumRequirement === "amount"
          ? Number(minimumAmount)
          : minimumRequirement === "quantity"
          ? Number(minimumQuantity)
          : 0,
      eligibility: eligibility === "all" ? "all customers" : "specific customer",
      uses: limitCustomer
        ? "one use per customer"
        : limitTotal
        ? "no of times"
        : "one use per customer",
      max_uses: limitTotal ? Number(maxUses) : null,
      set_end: setEnd,
      start_date: startDate,
      start_time: startTime,
      end_date: setEnd ? endDate : null,
      end_time: setEnd ? endTime : null,
      productIds: selectedProducts,
      collectionIds: selectedCollections,
      customerIds: selectedCustomers,
    };

    let success;
    if (initialData?.id) {
      success = await updateDiscount(initialData.id, payload);
    } else {
      success = await createDiscount(payload);
    }
    setIsSaving(false);
    if (success) {
      router.push("/admin/discounts");
    }
  };

  const disabledClass = isDisabled ? "opacity-60 cursor-not-allowed" : "";
  const disabledInputClass = isDisabled ? "bg-gray-200 text-gray-700 cursor-not-allowed" : "";

  return (
    <>
      {/* Method Selection */}
      <div className="mb-6 bg-white rounded-lg p-6 custom-border-1">
        <h3 className="text-gray-700 xsmall-semibold mb-2">Method <span className="text-red-500">*</span></h3>
        <div className="inline-flex rounded-md overflow-hidden">
          <button
            className={`px-4 py-2 xsmall-semibold ${
              discountMethod === "code"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700"
            } ${disabledClass}`}
            onClick={() => !isDisabled && setDiscountMethod("code")}
            disabled={isDisabled}
          >
            Discount code
          </button>
          <button
            className={`px-4 py-2 xsmall-semibold ${
              discountMethod === "automatic"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700"
            } ${disabledClass}`}
            onClick={() => !isDisabled && setDiscountMethod("automatic")}
            disabled={isDisabled}
          >
            Automatic Discount
          </button>
        </div>
      </div>

      {/* Discount Code - Only show if method is "code" */}
      {discountMethod === "code" && (
        <div className="mb-6 bg-white rounded-lg p-6 custom-border-1">
          <div className="flex justify-between mb-2">
            <h3 className="text-gray-700 xsmall-semibold">Discount code <span className="text-red-500">*</span></h3>
            {!isDisabled && (
              <button
                className="text-primary xsmall-semibold"
                onClick={() => setDiscountCode(generateRandomDiscountCode())}
              >
                Generate random code
              </button>
            )}
          </div>
          <input
            type="text"
            value={discountCode}
            onChange={(e) => !isDisabled && setDiscountCode(e.target.value)}
            placeholder="e.g. SUMMER2024"
            disabled={isDisabled}
            className={`w-full p-3 custom-border-3 rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${disabledInputClass}`}
          />
          <p className="text-gray-600 xsmall mt-2">
            Customer must enter this code at checkout.
          </p>
        </div>
      )}

      {/* Discount Value */}
      <div className="mb-6 bg-white rounded-lg p-6 custom-border-1">
        <h3 className="text-gray-700 small-semibold mb-2">Discount Value <span className="text-red-500">*</span></h3>
        <div className="flex gap-2 relative mb-4">
          <div className="relative flex-1">
            <select
              value={discountType}
              onChange={(e) => !isDisabled && setDiscountType(e.target.value)}
              disabled={isDisabled}
              className={`appearance-none p-3 custom-border-3 rounded-l-md focus:outline-none pr-10 w-full ${disabledInputClass}`}
            >
              <option value="percentage">Percentage</option>
              <option value="amount">Fixed Amount</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <FontAwesomeIcon
                icon={faChevronDown}
                className="text-gray-500"
              />
            </div>
          </div>
          <input
            type="text"
            value={discountValue}
            onChange={(e) =>
              !isDisabled && setDiscountValue(e.target.value)
            }
            placeholder="Enter value"
            disabled={isDisabled}
            className={`flex-1 p-3 custom-border-3 border-l-0 rounded-r-md focus:outline-none focus:ring-1 focus:ring-primary ${disabledInputClass}`}
          />
          {discountType === "percentage" && (
            <div className="absolute right-3 translate-y-3 text-gray-700">
              %
            </div>
          )}
        </div>

        <h3 className="text-gray-700 small-semibold mb-2">Applies to <span className="text-red-500">*</span></h3>
        <div className="relative mb-4">
          <select 
            value={appliesToType}
            onChange={(e) => !isDisabled && setAppliesToType(e.target.value)}
            disabled={isDisabled}
            className={`appearance-none w-full p-3 custom-border-3 rounded-md focus:outline-none pr-10 ${disabledInputClass}`}
          >
            <option value="products">Specific products</option>
            <option value="collections">Collections</option>
            <option value="all">All products</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <FontAwesomeIcon
              icon={faChevronDown}
              className="text-gray-500"
            />
          </div>
        </div>

        {/* Product Selection */}
        {appliesToType === "products" && (
          <div className="mb-4">
            <label className="block text-gray-700 small-semibold mb-2">
              Select Products
            </label>
            <Select
              isMulti
              isDisabled={isDisabled}
              isLoading={isLoadingProducts}
              options={products}
              value={selectedProductOptions}
              onChange={(selected) => {
                setSelectedProductOptions(selected ? Array.from(selected) : []);
                setSelectedProducts(selected ? selected.map((s) => s.value) : []);
              }}
              onInputChange={(inputValue) => setProductSearch(inputValue)}
              placeholder="Search and select products..."
              className="react-select-container"
              classNamePrefix="react-select"
              isClearable
              isSearchable
            />
            <p className="text-gray-600 xsmall mt-2">
              Search to find products. Cannot show all data at once - results limited to 20 items. Type to search and filter.
            </p>
          </div>
        )}

        {/* Collection Selection */}
        {appliesToType === "collections" && (
          <div className="mb-4">
            <label className="block text-gray-700 small-semibold mb-2">
              Select Collections
            </label>
            <Select
              isMulti
              isDisabled={isDisabled}
              isLoading={isLoadingCollections}
              options={collections}
              value={selectedCollectionOptions}
              onChange={(selected) => {
                setSelectedCollectionOptions(selected ? Array.from(selected) : []);
                setSelectedCollections(selected ? selected.map((s) => s.value) : []);
              }}
              onInputChange={(inputValue) => setCollectionSearch(inputValue)}
              placeholder="Search and select collections..."
              className="react-select-container"
              classNamePrefix="react-select"
              isClearable
              isSearchable
            />
            <p className="text-gray-600 xsmall mt-2">
              Search to find collections. Cannot show all data at once - results limited to 20 items. Type to search and filter.
            </p>
          </div>
        )}
      </div>

      {/* Minimum purchase requirements */}
      <div className="mb-6 bg-white rounded-lg p-6 custom-border-1">
        <h3 className="text-gray-700 small-semibold mb-4">
          Minimum purchase requirements <span className="text-red-500">*</span>
        </h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="radio"
              name="minimum-requirement"
              checked={minimumRequirement === "none"}
              onChange={() => !isDisabled && setMinimumRequirement("none")}
              disabled={isDisabled}
              className="h-4 w-4 text-primary"
            />
            <span className="ml-2 text-gray-700 small">
              No minimum requirements
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="minimum-requirement"
              checked={minimumRequirement === "amount"}
              onChange={() => !isDisabled && setMinimumRequirement("amount")}
              disabled={isDisabled}
              className="h-4 w-4 text-primary"
            />
            <span className="ml-2 text-gray-700 small">
              Minimum purchase amount
            </span>
            {minimumRequirement === "amount" && (
              <input
                type="number"
                value={minimumAmount}
                onChange={(e) =>
                  !isDisabled && setMinimumAmount(e.target.value)
                }
                disabled={isDisabled}
                placeholder="₹"
                className={`ml-2 w-24 p-2 custom-border-3 rounded text-sm ${disabledInputClass}`}
              />
            )}
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="minimum-requirement"
              checked={minimumRequirement === "quantity"}
              onChange={() => !isDisabled && setMinimumRequirement("quantity")}
              disabled={isDisabled}
              className="h-4 w-4 text-primary"
            />
            <span className="ml-2 text-gray-700 small">
              Minimum quantity of items
            </span>
            {minimumRequirement === "quantity" && (
              <input
                type="number"
                value={minimumQuantity}
                onChange={(e) =>
                  !isDisabled && setMinimumQuantity(e.target.value)
                }
                disabled={isDisabled}
                placeholder="Items"
                className={`ml-2 w-24 p-2 custom-border-3 rounded text-sm ${disabledInputClass}`}
              />
            )}
          </label>
        </div>
      </div>

      {/* Eligibility - Only show "All customers" option, no dropdown for specific customer */}
      <div className="mb-6 bg-white rounded-lg p-6 custom-border-1">
        <h3 className="text-gray-700 small-semibold mb-4">Eligibility <span className="text-red-500">*</span></h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="radio"
              name="eligibility"
              checked={eligibility === "all"}
              onChange={() => !isDisabled && setEligibility("all")}
              disabled={isDisabled}
              className="h-4 w-4 text-primary"
            />
            <span className="ml-2 text-gray-700 small">All customers</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="eligibility"
              checked={eligibility === "customer"}
              onChange={() => !isDisabled && setEligibility("customer")}
              disabled={isDisabled}
              className="h-4 w-4 text-primary"
            />
            <span className="ml-2 text-gray-700 small">Specific customer</span>
          </label>

          {/* Customer Selection - Only show if eligibility is "customer" */}
          {eligibility === "customer" && (
            <div className="mt-4 pl-6">
              <label className="block text-gray-700 small-semibold mb-2">
                Select Customers
              </label>
              <Select
                isMulti
                isDisabled={isDisabled}
                isLoading={isLoadingCustomers}
                options={customers}
                value={selectedCustomerOptions}
                onChange={(selected) => {
                  setSelectedCustomerOptions(selected ? Array.from(selected) : []);
                  setSelectedCustomers(selected ? selected.map((s) => s.value) : []);
                }}
                onInputChange={(inputValue) => setCustomerSearch(inputValue)}
                placeholder="Search and select customers..."
                className="react-select-container"
                classNamePrefix="react-select"
                isClearable
                isSearchable
              />
              <p className="text-gray-600 xsmall mt-2">
                Search to find customers. Cannot show all data at once - results limited to 20 items. Type to search and filter.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Usage Limits - Only show max uses input, no checkboxes */}
      <div className="mb-6 bg-white rounded-lg p-6 custom-border-1">
        <h3 className="text-gray-700 small-semibold mb-4">Usage Limits <span className="text-red-500">*</span></h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={limitTotal}
              onChange={() => !isDisabled && setLimitTotal(!limitTotal)}
              disabled={isDisabled}
              className="h-4 w-4 rounded border-gray-300 text-primary"
            />
            <span className="ml-2 text-gray-700 small">
              Limit number of times this discount can be used in total
            </span>
            {limitTotal && (
              <input
                type="number"
                value={maxUses}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^\d+$/.test(val)) {
                    setMaxUses(val);
                  }
                }}
                placeholder="Enter number"
                disabled={isDisabled}
                className={`ml-2 w-24 p-2 custom-border-3 rounded text-sm ${disabledInputClass}`}
                min="0"
              />
            )}
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={limitCustomer}
              onChange={() => !isDisabled && setLimitCustomer(!limitCustomer)}
              disabled={isDisabled}
              className="h-4 w-4 rounded border-gray-300 text-primary"
            />
            <span className="ml-2 text-gray-700 small">
              Limit to one use per customer
            </span>
          </label>
        </div>
      </div>

      {/* Active Dates */}
      <div className="mb-6 bg-white rounded-lg p-6 custom-border-1">
        <h3 className="text-gray-700 xsmall-semibold mb-4">Active Dates <span className="text-red-500">*</span></h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 xsmall-semibold mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => !isDisabled && setStartDate(e.target.value)}
              disabled={isDisabled}
              className={`w-full p-3 custom-border-3 rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${disabledInputClass}`}
            />
          </div>
          <div>
            <label className="block text-gray-700 xsmall-semibold mb-2">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => !isDisabled && setStartTime(e.target.value)}
              disabled={isDisabled}
              className={`w-full p-3 custom-border-3 rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${disabledInputClass}`}
            />
          </div>
        </div>
        <label className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={setEnd}
            onChange={(e) => !isDisabled && setSetEnd(e.target.checked)}
            disabled={isDisabled}
            className="h-4 w-4 rounded border-gray-300 text-primary"
          />
          <span className="ml-2 text-gray-700 small">Set end date</span>
        </label>
        {setEnd && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 xsmall-semibold mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => !isDisabled && setEndDate(e.target.value)}
                disabled={isDisabled}
                className={`w-full p-3 custom-border-3 rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${disabledInputClass}`}
              />
            </div>
            <div>
              <label className="block text-gray-700 xsmall-semibold mb-2">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => !isDisabled && setEndTime(e.target.value)}
                disabled={isDisabled}
                className={`w-full p-3 custom-border-3 rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${disabledInputClass}`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!isDisabled && (
        <div className="flex justify-end gap-3 pt-6 border-t">
          <button
            type="button"
            onClick={handleDiscard}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-semibold hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-primary text-white rounded-md font-semibold hover:bg-primary-dark disabled:opacity-50"
          >
            {isSaving ? "Saving..." : initialData?.id ? "Update Discount" : "Create Discount"}
          </button>
        </div>
      )}
    </>
  );
}
