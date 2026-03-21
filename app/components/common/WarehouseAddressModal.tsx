"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { Country, State, City } from "country-state-city";

export interface WarehouseAddressData {
  firstName: string;
  lastName: string;
  country: string;
  countryCode: string;
  country_code_iso: string;
  state: string;
  stateCode: string;
  city: string;
  company: string;
  address: string;
  apartment: string;
  zipCode: string;
}

interface WarehouseAddressModalProps {
  onClose: () => void;
  onSave: (addressData: WarehouseAddressData) => void;
  initialData?: Partial<WarehouseAddressData>;
  restrictToIndia?: boolean; // New prop to restrict to India only
}

export default function WarehouseAddressModal({
  onClose,
  onSave,
  initialData = {},
  restrictToIndia = false,
}: WarehouseAddressModalProps) {
  const [countries, setCountries] = useState<
    ReturnType<typeof Country.getAllCountries>
  >([]);
  const [states, setStates] = useState<
    ReturnType<typeof State.getStatesOfCountry>
  >([]);
  const [cities, setCities] = useState<
    ReturnType<typeof City.getCitiesOfState>
  >([]);

  const [addressData, setAddressData] = useState<WarehouseAddressData>({
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    country: initialData.country || (restrictToIndia ? "India" : ""),
    countryCode: initialData.countryCode || (restrictToIndia ? "IN" : ""),
    country_code_iso: initialData.country_code_iso || (restrictToIndia ? "IN" : ""),
    state: initialData.state || "",
    stateCode: initialData.stateCode || "",
    city: initialData.city || "",
    company: initialData.company || "",
    address: initialData.address || "",
    apartment: initialData.apartment || "",
    zipCode: initialData.zipCode || "",
  });

  // Load countries on mount
  useEffect(() => {
    console.log(`[WAREHOUSE-MODAL] Modal opened`);
    const allCountries = Country.getAllCountries();
    console.log(`[WAREHOUSE-MODAL] Loaded ${allCountries.length} countries`);

    // If restrictToIndia is true, only show India
    const countriesToShow = restrictToIndia
      ? allCountries.filter(c => c.isoCode === "IN")
      : allCountries;

    setCountries(countriesToShow);

    // If restrictToIndia, auto-select India
    if (restrictToIndia) {
      const indiaCountry = allCountries.find(c => c.isoCode === "IN");
      if (indiaCountry) {
        const indiaStates = State.getStatesOfCountry("IN");
        setStates(indiaStates);
      }
    } else if (initialData.countryCode) {
      // If we have a country code from initialData, load its states
      console.log(`[WAREHOUSE-MODAL] Loading states for country: ${initialData.countryCode}`);
      const countryStates = State.getStatesOfCountry(initialData.countryCode);
      console.log(`[WAREHOUSE-MODAL] Loaded ${countryStates.length} states`);
      setStates(countryStates);

      // If we have a state code, load its cities
      if (initialData.stateCode) {
        console.log(`[WAREHOUSE-MODAL] Loading cities for state: ${initialData.stateCode}`);
        const stateCities = City.getCitiesOfState(
          initialData.countryCode,
          initialData.stateCode
        );
        console.log(`[WAREHOUSE-MODAL] Loaded ${stateCities.length} cities`);
        setCities(stateCities);
      }
    }
  }, [initialData.countryCode, initialData.stateCode, restrictToIndia]);

  // Handle country change
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    const selectedCountry = countries.find(
      (country) => country.isoCode === countryCode
    );

    console.log(`[WAREHOUSE-UI] Country changed to: ${selectedCountry?.name} (${countryCode})`);

    setAddressData((prev) => ({
      ...prev,
      country: selectedCountry?.name || "",
      countryCode,
      country_code_iso: selectedCountry?.isoCode || "",
      state: "", // Reset state when country changes
      stateCode: "",
      city: "", // Reset city when country changes
    }));

    // Load states for the selected country
    if (countryCode) {
      const countryStates = State.getStatesOfCountry(countryCode);
      console.log(`[WAREHOUSE-UI] Loaded ${countryStates.length} states for country: ${countryCode}`);
      setStates(countryStates);
      setCities([]); // Clear cities when country changes
    } else {
      setStates([]);
      setCities([]);
    }
  };

  // Handle state change
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateCode = e.target.value;
    const selectedState = states.find((state) => state.isoCode === stateCode);

    console.log(`[WAREHOUSE-UI] State changed to: ${selectedState?.name} (${stateCode})`);

    setAddressData((prev) => ({
      ...prev,
      state: selectedState?.name || "",
      stateCode,
      city: "", // Reset city when state changes
    }));

    // Load cities for the selected state
    if (stateCode && addressData.countryCode) {
      const stateCities = City.getCitiesOfState(
        addressData.countryCode,
        stateCode
      );
      console.log(`[WAREHOUSE-UI] Loaded ${stateCities.length} cities for state: ${stateCode}`);
      setCities(stateCities);
    } else {
      setCities([]);
    }
  };

  // Handle city change
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityName = e.target.value;

    console.log(`[WAREHOUSE-UI] City changed to: ${cityName}`);

    setAddressData((prev) => ({
      ...prev,
      city: cityName,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    console.log(`[WAREHOUSE-MODAL] Field changed - ${name}: ${value}`);
    setAddressData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log(`[WAREHOUSE-UI] Form submitted with data:`, {
      firstName: addressData.firstName,
      lastName: addressData.lastName,
      company: addressData.company,
      country: addressData.country,
      state: addressData.state,
      city: addressData.city,
      address: addressData.address,
      zipCode: addressData.zipCode,
    });

    onSave(addressData);
    onClose(); // Close modal after address is saved
  };

  // Prevent clicks inside the modal from closing it
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleCloseModal = () => {
    console.log(`[WAREHOUSE-MODAL] Modal closed by user`);
    onClose();
  };

  return (
    <div
      className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto scrollbar-hide"
        onClick={handleModalClick}
      >
        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-50">
          <h2 className="text-xl font-semibold text-gray-800">
            Add Warehouse Address
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={addressData.firstName}
                  onChange={handleChange}
                  className="w-full p-3 custom-border-3 rounded-md focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={addressData.lastName}
                  onChange={handleChange}
                  className="w-full p-3 custom-border-3 rounded-md focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Company <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="company"
                value={addressData.company}
                onChange={handleChange}
                className="w-full p-3 custom-border-3 rounded-md focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Country/Region <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  name="countryCode"
                  value={addressData.countryCode}
                  onChange={handleCountryChange}
                  disabled={restrictToIndia}
                  className="w-full p-3 custom-border-3 rounded-md appearance-none focus:outline-none disabled:bg-gray-100"
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country.isoCode} value={country.isoCode}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* State Field */}
            <div>
              <label className="block text-gray-700 mb-1">State/Province <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  name="stateCode"
                  value={addressData.stateCode}
                  onChange={handleStateChange}
                  className="w-full p-3 custom-border-3 rounded-md appearance-none focus:outline-none"
                  disabled={!addressData.countryCode}
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state.isoCode} value={state.isoCode}>
                      {state.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* City Field */}
            <div>
              <label className="block text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
              <div className="relative">
                {cities.length > 0 ? (
                  <select
                    name="city"
                    value={addressData.city}
                    onChange={handleCityChange}
                    className="w-full p-3 custom-border-3 rounded-md appearance-none focus:outline-none"
                    disabled={!addressData.stateCode}
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="city"
                    value={addressData.city}
                    onChange={handleChange}
                    className="w-full p-3 custom-border-3 rounded-md focus:outline-none"
                    placeholder={
                      addressData.stateCode
                        ? "Enter city name"
                        : "Select state first"
                    }
                    disabled={!addressData.stateCode}
                  />
                )}
                {cities.length > 0 && (
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className="text-gray-500"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Address <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="address"
                value={addressData.address}
                onChange={handleChange}
                className="w-full p-3 custom-border-3 rounded-md focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">
                Apartment, suite, etc
              </label>
              <input
                type="text"
                name="apartment"
                value={addressData.apartment}
                onChange={handleChange}
                className="w-full p-3 custom-border-3 rounded-md focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Zip Code</label>
              <input
                type="text"
                name="zipCode"
                value={addressData.zipCode}
                onChange={handleChange}
                className="w-full p-3 custom-border-3 rounded-md focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-3 bg-gray-100 text-gray-800 rounded-md small-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-white rounded-md small-semibold"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
