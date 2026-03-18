import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { getAllSellers } from '@/app/lib/services/admin';
import { handleNumberInputChange, handleNumberKeyDown } from './numberInputUtils';

export default function VendorDetails({
  selectedSeller,
  setSelectedSeller,
  formData,
  setFormData,
  commonAttributes,
  setCommonAttributes,
  isViewMode = false,
}) {
  const [sellers, setSellers] = useState([]);
  const [isLoadingSellers, setIsLoadingSellers] = useState(false);
  const [showSellerDropdown, setShowSellerDropdown] = useState(false);
  const [sellerSearchTerm, setSellerSearchTerm] = useState('');
  const [sellerChanged, setSellerChanged] = useState(false);
  const [initialSeller, setInitialSeller] = useState(null);
  const sellerDropdownRef = useRef(null);

  // Load sellers on mount
  useEffect(() => {
    const loadSellers = async () => {
      setIsLoadingSellers(true);
      try {
        const response = await getAllSellers();
        
        // Handle the response structure
        if (response && response.sellers && Array.isArray(response.sellers)) {
          setSellers(response.sellers);
        } else if (Array.isArray(response)) {
          setSellers(response);
        } else {
          setSellers([]);
        }
      } catch (error) {
        console.error('Failed to load sellers:', error);
        setSellers([]);
      } finally {
        setIsLoadingSellers(false);
      }
    };

    loadSellers();
    // Set initial seller on mount (for edit/view pages)
    setInitialSeller(selectedSeller);
  }, []);

  // Note: margin_contribution now comes from the product itself, not from the seller

  // Detect when seller is changed and update margin from seller
  useEffect(() => {
    if (initialSeller !== null && selectedSeller !== initialSeller) {
      // Seller has been changed, use seller's margin
      setSellerChanged(true);
      if (selectedSeller && sellers.length > 0) {
        const selectedSellerData = sellers.find((s) => s.id === selectedSeller);
        if (selectedSellerData && selectedSellerData.margin !== undefined && selectedSellerData.margin !== null) {
          if (formData.has_variations) {
            setCommonAttributes((prev) => ({
              ...prev,
              margin_contribution: selectedSellerData.margin,
            }));
          } else {
            setFormData((prev) => ({
              ...prev,
              margin_contribution: selectedSellerData.margin,
            }));
          }
        }
      }
    } else if (selectedSeller === initialSeller && sellerChanged) {
      // Seller changed back to original, reset to product's margin
      setSellerChanged(false);
    }
  }, [selectedSeller, sellers, initialSeller, sellerChanged, formData.has_variations]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        sellerDropdownRef.current &&
        !sellerDropdownRef.current.contains(event.target) &&
        showSellerDropdown
      ) {
        setShowSellerDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSellerDropdown]);

  const handleMarginChange = (e) => {
    if (isViewMode) return;
    const cleanValue = handleNumberInputChange(e);
    
    if (formData.has_variations) {
      setCommonAttributes((prev) => ({
        ...prev,
        margin_contribution: cleanValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        margin_contribution: cleanValue,
      }));
    }
  };

  const marginValue = formData.has_variations 
    ? commonAttributes.margin_contribution 
    : formData.margin_contribution;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm custom-border-1">
      <h3 className="text-black title-4-semibold mb-4">
        Vendor Details
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-black title-4-semibold mb-2">
            Seller <span className="text-red-500">*</span>
          </label>
          {isViewMode ? (
            <div className="p-2 bg-gray-100 rounded-md text-black small">
              {(() => {
                const selectedSellerData = sellers.find((s) => s.id === selectedSeller);
                return selectedSellerData ? (
                  <div>
                    <div className="font-medium text-black">{selectedSellerData.firmName}</div>
                    <div className="text-black text-xs">{selectedSellerData.email}</div>
                    <div className="text-black text-xs">{selectedSellerData.phoneNumber}</div>
                  </div>
                ) : (
                  '-'
                );
              })()}
            </div>
          ) : (
            <div className="relative" ref={sellerDropdownRef}>
              {/* Selected seller display */}
              {selectedSeller && (
                <div className="mb-2">
                  {(() => {
                    const selectedSellerData = sellers.find((s) => s.id === selectedSeller);
                    return selectedSellerData ? (
                      <div className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md flex items-center justify-between">
                        <span className="text-xs">
                          {selectedSellerData.firmName} - {selectedSellerData.email}
                        </span>
                        <button
                          onClick={() => setSelectedSeller('')}
                          className="ml-1 text-blue-800 hover:text-blue-900"
                        >
                          <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                        </button>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              {/* Seller search input field */}
              <div className="relative">
                <div className="flex items-center w-full custom-border-3 rounded-md overflow-hidden">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="text-gray-400 ml-2"
                  />
                  <input
                    type="text"
                    value={sellerSearchTerm}
                    onChange={(e) => {
                      setSellerSearchTerm(e.target.value);
                      if (!showSellerDropdown && e.target.value)
                        setShowSellerDropdown(true);
                    }}
                    onFocus={() => {
                      if (sellers.length > 0) setShowSellerDropdown(true);
                    }}
                    placeholder="Search sellers..."
                    className="w-full ml-2 bg-transparent small focus:outline-none"
                  />
                </div>

                {/* Dropdown for sellers */}
                {showSellerDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {isLoadingSellers ? (
                      <div className="p-2 text-center text-sm text-gray-500">
                        Loading sellers...
                      </div>
                    ) : sellers
                        .filter(
                          (seller) =>
                            (seller.firmName || '')
                              .toLowerCase()
                              .includes(sellerSearchTerm.toLowerCase()) ||
                            (seller.email || '')
                              .toLowerCase()
                              .includes(sellerSearchTerm.toLowerCase())
                        )
                        .length > 0 ? (
                      sellers
                        .filter(
                          (seller) =>
                            (seller.firmName || '')
                              .toLowerCase()
                              .includes(sellerSearchTerm.toLowerCase()) ||
                            (seller.email || '')
                              .toLowerCase()
                              .includes(sellerSearchTerm.toLowerCase())
                        )
                        .map((seller) => (
                          <div
                            key={seller.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100"
                            onClick={() => {
                              setSelectedSeller(seller.id || '');
                              setSellerSearchTerm('');
                              setShowSellerDropdown(false);
                            }}
                          >
                            <div className="font-medium">
                              {seller.firmName}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {seller.email}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {seller.phoneNumber}
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="p-2 text-center text-sm text-gray-500">
                        No sellers found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-black title-4-semibold mb-2">
          Margin Contribution
        </label>
        {isViewMode ? (
          <div className="p-2 bg-gray-100 rounded-md text-black small">
            {marginValue || '0.00'} %
          </div>
        ) : (
          <div className="flex">
            <input
              type="text"
              inputMode="decimal"
              value={marginValue || ''}
              onChange={handleMarginChange}
              onKeyDown={handleNumberKeyDown}
              placeholder="0.00"
              className="w-full p-2 custom-border-3 bg-blue-80 rounded-l-md small focus:outline-none"
            />
            <div className="p-2 border-y-2 border-r-2 border-gray-line bg-blue-80 rounded-r-md small">
              %
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
