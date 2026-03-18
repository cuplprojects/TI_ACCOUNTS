"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
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
import { Country } from "country-state-city";

export default function ShippingDiscountForm({ initialData, isDisabled = false }: { initialData?: Discount; isDisabled?: boolean }) {
  const [discountCode, setDiscountCode] = useState(initialData?.discount_code || "");
  const [discountMethod, setDiscountMethod] = useState(
    initialData?.method === "Automatic Discount" ? "automatic" : "code"
  );
  const [countries, setCountries] = useState("all");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [countryOptions, setCountryOptions] = useState<Array<{ value: string; label: string }>>([]);
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
    initialData?.eligibility === "all customers"
      ? "all"
      : initialData?.eligibility === "specific segment"
      ? "segments"
      : "customer"
  );
  const [limitTotal, setLimitTotal] = useState(initialData?.uses === "no of times");
  const [limitCustomer, setLimitCustomer] = useState(
    initialData?.uses === "one use per customer"
  );
  const [maxUses, setMaxUses] = useState(
    initialData?.max_uses !== null && initialData?.max_uses !== undefined ? initialData.max_uses.toString() : ""
  );
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>(
    initialData?.customerIds || []
  );
  const [customers, setCustomers] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedCustomerOptions, setSelectedCustomerOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
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
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Initialize country options from country-state-city package
  useEffect(() => {
    const allCountries = Country.getAllCountries() as any[];
    const options = allCountries.map((country) => ({
      value: country.isoCode,
      label: country.name,
    }));
    setCountryOptions(options);
  }, []);

  // Initialize selected countries from initial data
  useEffect(() => {
    if (initialData?.country_ids && Array.isArray(initialData.country_ids) && initialData.country_ids.length > 0) {
      setSelectedCountries(initialData.country_ids);
      setCountries("selected");
    }
  }, [initialData]);

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

  const debouncedCustomerSearch = useDebounce(customerSearch, 500);

  // Initialize selected customers from initial data
  useEffect(() => {
    if (initialData?.customerIds && Array.isArray(initialData.customerIds)) {
      const options = initialData.customerIds.map((item: any) => ({
        value: item.id || item,
        label: item.title || item,
      }));
      setSelectedCustomerOptions(options);
      setSelectedCustomers(options.map(o => o.value));
    }
  }, [initialData]);

  // Fetch customers
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
    setIsSaving(true);

    if (discountMethod === "code" && !discountCode) {
      showErrorToast("Please enter a discount code");
      setIsSaving(false);
      return;
    }

    if (countries === "selected" && selectedCountries.length === 0) {
      showErrorToast("Please select at least one country");
      setIsSaving(false);
      return;
    }

    if (eligibility === "customer" && selectedCustomers.length === 0) {
      showErrorToast("Please select at least one customer");
      setIsSaving(false);
      return;
    }

    const payload: Partial<Discount> = {
      method:
        discountMethod === "code" ? "Discount Code" : "Automatic Discount",
      discount_code: discountCode,
      discount_type: "free",
      discount_category: "shipping",
      discount_value: 0,
      applicability_type: "all products",
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
      eligibility:
        eligibility === "all"
          ? "all customers"
          : eligibility === "segments"
          ? "specific segment"
          : "specific customer",
      uses: limitCustomer
        ? "one use per customer"
        : limitTotal
        ? "no of times"
        : "one use per customer",
      max_uses: limitTotal ? Number(maxUses) : null,
      set_end: setEnd,
      start_date: startDate,
      start_time: startTime,
      end_date: setEnd ? endDate : undefined,
      end_time: setEnd ? endTime : undefined,
      countryIds: countries === "selected" ? selectedCountries : [],
      customerIds: eligibility === "customer" ? selectedCustomers : [],
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
        <h3 className="text-gray-700 xsmall-semibold mb-2">Method</h3>
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

      {/* Discount Code */}
      <div className="mb-6 bg-white rounded-lg p-6 custom-border-1">
        <div className="flex justify-between mb-2">
          <h3 className="text-gray-700 xsmall-semibold">Discount code</h3>
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
          placeholder="e.g. FREESHIP"
          disabled={isDisabled}
          className={`w-full p-3 custom-border-3 rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${disabledInputClass}`}
        />
        <p className="text-gray-600 xsmall mt-2">
          Customer must enter this code at checkout.
        </p>
      </div>

      {/* Countries */}
      <div className="mb-6 bg-white rounded-lg p-6 custom-border-1">
        <h3 className="text-gray-700 small-semibold mb-4">Countries <span className="text-red-500">*</span></h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="radio"
              id="all-countries"
              name="countries"
              checked={countries === "all"}
              onChange={() => !isDisabled && setCountries("all")}
              disabled={isDisabled}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
            />
            <label
              htmlFor="all-countries"
              className="ml-2 text-gray-700 small"
            >
              All countries
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="selected-countries"
              name="countries"
              checked={countries === "selected"}
              onChange={() => !isDisabled && setCountries("selected")}
              disabled={isDisabled}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
            />
            <label
              htmlFor="selected-countries"
              className="ml-2 text-gray-700 small"
            >
              Selected countries
            </label>
          </div>
        </div>
        {countries === "selected" && (
          <div className="mt-4 pl-6">
            <label className="block text-gray-700 small-semibold mb-2">Select Countries</label>
            <Select
              isMulti
              isDisabled={isDisabled}
              options={countryOptions}
              value={selectedCountries.map(code => {
                const option = countryOptions.find(opt => opt.value === code);
                return option || { value: code, label: code };
              })}
              onChange={(selected) => {
                setSelectedCountries(selected ? selected.map((s: any) => s.value) : []);
              }}
              placeholder="Search and select countries..."
              className="react-select-container"
              classNamePrefix="react-select"
              isClearable
              isSearchable
            />
            <p className="text-gray-600 xsmall mt-2">
              Select one or more countries where this discount applies
            </p>
          </div>
        )}
      </div>

      {/* Minimum purchase requirements */}
      <div className="mb-6 bg-white rounded-lg p-6 custom-border-1">
              <h3 className="text-gray-700 small-semibold mb-4">
                Minimum purchase requirements
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="no-minimum"
                    name="minimum-requirement"
                    checked={minimumRequirement === "none"}
                    onChange={() => !isDisabled && setMinimumRequirement("none")}
                    disabled={isDisabled}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <label
                    htmlFor="no-minimum"
                    className="ml-2 text-gray-700 small"
                  >
                    No minimum requirements
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="minimum-amount"
                    name="minimum-requirement"
                    checked={minimumRequirement === "amount"}
                    onChange={() => !isDisabled && setMinimumRequirement("amount")}
                    disabled={isDisabled}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <label
                    htmlFor="minimum-amount"
                    className="ml-2 text-gray-700 small"
                  >
                    Minimum purchase amount (₹)
                  </label>
                  {minimumRequirement === "amount" && (
                    <input
                      type="number"
                      value={minimumAmount}
                      onChange={(e) => !isDisabled && setMinimumAmount(e.target.value)}
                      disabled={isDisabled}
                      className={`ml-2 w-24 p-2 custom-border-3 rounded-md focus:outline-none ${disabledInputClass}`}
                      placeholder="Amount"
                    />
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="minimum-quantity"
                    name="minimum-requirement"
                    checked={minimumRequirement === "quantity"}
                    onChange={() => !isDisabled && setMinimumRequirement("quantity")}
                    disabled={isDisabled}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <label
                    htmlFor="minimum-quantity"
                    className="ml-2 text-gray-700 small"
                  >
                    Minimum quantity of items
                  </label>
                  {minimumRequirement === "quantity" && (
                    <input
                      type="number"
                      value={minimumQuantity}
                      onChange={(e) => !isDisabled && setMinimumQuantity(e.target.value)}
                      disabled={isDisabled}
                      className={`ml-2 w-24 p-2 custom-border-3 rounded-md focus:outline-none ${disabledInputClass}`}
                      placeholder="Quantity"
                    />
                  )}
                </div>
              </div>
            </div>

      {/* Eligibility */}
      <div className="mb-6 bg-white rounded-lg p-6 custom-border-1">
        <h3 className="text-gray-700 small-semibold mb-4">Eligibility <span className="text-red-500">*</span></h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="radio"
              id="all-customers"
              name="eligibility"
              checked={eligibility === "all"}
              onChange={() => !isDisabled && setEligibility("all")}
              disabled={isDisabled}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
            />
            <label
              htmlFor="all-customers"
              className="ml-2 text-gray-700 small"
            >
              All customers
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="specific-segments"
              name="eligibility"
              checked={eligibility === "segments"}
              onChange={() => !isDisabled && setEligibility("segments")}
              disabled={isDisabled}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
            />
            <label
              htmlFor="specific-segments"
              className="ml-2 text-gray-700 small"
            >
              Specific customer segments
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="specific-customer"
              name="eligibility"
              checked={eligibility === "customer"}
              onChange={() => !isDisabled && setEligibility("customer")}
              disabled={isDisabled}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
            />
            <label
              htmlFor="specific-customer"
              className="ml-2 text-gray-700 small"
            >
              Specific customer
            </label>
          </div>

          {eligibility === "customer" && (
            <div className="mt-4 pl-6">
              <label className="block text-gray-700 small-semibold mb-2">Select Customers</label>
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
                Search to find customers. Cannot show all data at once - results limited to 20 items.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Minimum discount uses */}
      <div className="mb-6 bg-white rounded-lg p-6 custom-border-1">
        <h3 className="text-gray-700 small-semibold mb-4">
          Minimum discount uses <span className="text-red-500">*</span>
        </h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="limit-total"
              checked={limitTotal}
              onChange={() => !isDisabled && setLimitTotal(!limitTotal)}
              disabled={isDisabled}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label
              htmlFor="limit-total"
              className="ml-2 text-gray-700 small"
            >
              Limit number of times this discount can be used in total
            </label>
            {limitTotal && (
              <input
                type="number"
                value={maxUses}
                onChange={(e) => !isDisabled && setMaxUses(e.target.value)}
                disabled={isDisabled}
                placeholder="Enter number"
                className={`ml-2 w-24 p-2 custom-border-3 rounded text-sm ${isDisabled ? "bg-gray-200 text-gray-700 cursor-not-allowed" : ""}`}
                min="0"
              />
            )}
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="limit-customer"
              checked={limitCustomer}
              onChange={() => !isDisabled && setLimitCustomer(!limitCustomer)}
              disabled={isDisabled}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label
              htmlFor="limit-customer"
              className="ml-2 text-gray-700 small"
            >
              Limit to one use per customer
            </label>
          </div>
        </div>
      </div>

      {/* Active Dates */}
      <div className="mb-6 bg-white rounded-lg p-6 custom-border-1">
              <h3 className="text-gray-700 xsmall-semibold mb-4">
                Active Dates
              </h3>
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
                    Start Time (IST)
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
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="set-end-date"
                  checked={setEnd}
                  onChange={() => !isDisabled && setSetEnd(!setEnd)}
                  disabled={isDisabled}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="set-end-date"
                  className="ml-2 text-gray-700 small"
                >
                  Set end date
                </label>
              </div>
              {setEnd && (
                <div className="grid grid-cols-2 gap-4 mt-4">
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
                      End Time (IST)
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
