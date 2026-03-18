"use client";

import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faSearch } from "@fortawesome/free-solid-svg-icons";
import { Country } from "country-state-city";

interface CountryData {
  isoCode: string;
  name: string;
  phonecode: string;
  flag: string;
  currency: string;
  latitude: string;
  longitude: string;
}

interface CountryCodeSelectorProps {
  value?: string;
  countryCode?: string; // ISO country code
  onChange: (dialCode: string, countryCode: string) => void;
  className?: string;
  defaultCountry?: string; // ISO country code (e.g., "IN" for India)
  allowedCountries?: string[]; // Array of ISO country codes
}

const CountryCodeSelector: React.FC<CountryCodeSelectorProps> = ({
  value,
  countryCode,
  onChange,
  className = "",
  defaultCountry = "IN",
  allowedCountries,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(
    null
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get all countries from the package
  const countries = allowedCountries
    ? (Country.getAllCountries() as CountryData[]).filter((c) =>
      allowedCountries.includes(c.isoCode)
    )
    : (Country.getAllCountries() as CountryData[]);

  // Find default country on initial load
  useEffect(() => {
    // Priority: 1. countryCode (ISO), 2. defaultCountry, 3. value (phone code)
    const country = countries.find(
      (c) =>
        (countryCode && c.isoCode === countryCode) ||
        (!countryCode && c.isoCode === defaultCountry) ||
        (!countryCode && !defaultCountry && `+${c.phonecode}` === value)
    );
    if (country) {
      setSelectedCountry(country);
    } else {
      // Default to India if not found
      const india = countries.find((c) => c.isoCode === "IN");
      if (india) setSelectedCountry(india);
    }
  }, [defaultCountry, value, countryCode]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCountrySelect = (country: CountryData) => {
    setSelectedCountry(country);
    const cleanedPhonecode = country.phonecode.replace(/^\+/, '');
    const phoneCode = `+${cleanedPhonecode}`;
    onChange(phoneCode, country.isoCode);
    setIsOpen(false);
    setSearchQuery("");
  };

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.phonecode.includes(searchQuery) ||
      country.isoCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center justify-between w-full p-2 custom-border-3 rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedCountry && (
          <div className="flex items-center">
            <span className="text-xl mr-2">{selectedCountry.flag}</span>
            <span className="text-sm">+{selectedCountry.phonecode.replace(/^\+/, '')}</span>
          </div>
        )}
        <FontAwesomeIcon
          icon={faChevronDown}
          className="text-gray-500 ml-1"
          size="xs"
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-64 max-h-80 bg-white rounded-md shadow-lg overflow-hidden">
          <div className="p-2 border-b">
            <div className="relative flex items-center gap-2 border-2 border-gray-200 rounded-md px-2">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
              <input
                type="text"
                className="w-full pr-4 py-2 text-sm focus:outline-none"
                placeholder="Search countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-60">
            {filteredCountries.map((country) => (
              <div
                key={country.isoCode}
                className="flex items-center p-3 cursor-pointer hover:bg-gray-100"
                onClick={() => handleCountrySelect(country)}
              >
                <span className="text-xl mr-3">{country.flag}</span>
                <span className="text-sm flex-1">{country.name}</span>
                <span className="text-sm text-gray-500">
                  +{country.phonecode.replace(/^\+/, '')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryCodeSelector;
