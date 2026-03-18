"use client";

import React, { useEffect, useState } from "react";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faSave,
  faTimes,
  faPlus,
  faRefresh,
  faSearch,
  faSync,
} from "@fortawesome/free-solid-svg-icons";
import {
  getAllCurrencyRates,
  editCurrencyRate,
  addCurrencyRates,
  syncCurrencyFromGSheet,
  SUPPORTED_CURRENCIES,
  type EditCurrencyRateRequest,
  type AddCurrencyRateRequest,
} from "@/app/lib/services/admin/currencyService";
import { showErrorMessage, showSuccessMessage } from "@/app/lib/swalConfig";

interface EditableRate {
  id: string;
  targetCurrency: string;
  closingRate: string;
  ourRate: string;
  isEditing: boolean;
  originalClosingRate: string;
  originalOurRate: string;
  updatedAt: string;
}

export default function CurrencyPage() {
  const { setTitle } = usePageTitle();
  const [currencyRates, setCurrencyRates] = useState<EditableRate[]>([]);
  const [filteredCurrencyRates, setFilteredCurrencyRates] = useState<
    EditableRate[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRates, setNewRates] = useState<AddCurrencyRateRequest[]>([]);

  useEffect(() => {
    setTitle("Currency Management");
    loadCurrencyRates();
  }, [setTitle]);

  // Filter currency rates based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCurrencyRates(currencyRates);
      return;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    const filtered = currencyRates.filter((rate) => {
      const currencyInfo = getCurrencyInfo(rate.targetCurrency);

      // Search in currency code
      if (rate.targetCurrency.toLowerCase().includes(lowerCaseSearchTerm)) {
        return true;
      }

      // Search in currency name
      if (
        currencyInfo?.name &&
        currencyInfo.name.toLowerCase().includes(lowerCaseSearchTerm)
      ) {
        return true;
      }

      // Search in country name
      if (
        currencyInfo?.country &&
        currencyInfo.country.toLowerCase().includes(lowerCaseSearchTerm)
      ) {
        return true;
      }

      // Search in closing rate
      if (rate.closingRate.includes(lowerCaseSearchTerm)) {
        return true;
      }

      // Search in our rate
      if (rate.ourRate.includes(lowerCaseSearchTerm)) {
        return true;
      }

      return false;
    });

    setFilteredCurrencyRates(filtered);
  }, [searchTerm, currencyRates]);

  const loadCurrencyRates = async () => {
    setIsLoading(true);
    try {
      const rates = await getAllCurrencyRates();
      const editableRates: EditableRate[] = rates.map((rate) => ({
        id: rate.id,
        targetCurrency: rate.targetCurrency,
        closingRate: parseFloat(rate.closingRate).toFixed(10),
        ourRate: parseFloat(rate.ourRate).toFixed(10),
        isEditing: false,
        originalClosingRate: parseFloat(rate.closingRate).toFixed(10),
        originalOurRate: parseFloat(rate.ourRate).toFixed(10),
        updatedAt: rate.updatedAt,
      }));
      setCurrencyRates(editableRates);
      setFilteredCurrencyRates(editableRates);
    } catch (error) {
      console.error("Failed to load currency rates:", error);
      showErrorMessage("Failed to load currency rates. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sync from Google Sheet
  const handleSyncFromGSheet = async () => {
    setIsSyncing(true);
    try {
      const response = await syncCurrencyFromGSheet();

      if (response.success && response.data) {
        showSuccessMessage(
          `Successfully synced ${response.data.ratesCount} currency rates from Google Sheet (Date: ${response.data.date})`
        );
        // Reload the currency rates
        await loadCurrencyRates();
      } else {
        showErrorMessage(response.message || "Failed to sync currency rates");
      }
    } catch (error) {
      console.error("Failed to sync currency from Google Sheet:", error);
      showErrorMessage("Failed to sync currency rates from Google Sheet. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleEdit = (id: string) => {
    setCurrencyRates((prev) =>
      prev.map((rate) => (rate.id === id ? { ...rate, isEditing: true } : rate))
    );
  };

  const handleCancel = (id: string) => {
    setCurrencyRates((prev) =>
      prev.map((rate) =>
        rate.id === id
          ? {
            ...rate,
            isEditing: false,
            closingRate: rate.originalClosingRate,
            ourRate: rate.originalOurRate,
          }
          : rate
      )
    );
  };

  const handleInputChange = (
    id: string,
    field: "closingRate" | "ourRate",
    value: string
  ) => {
    // Allow only positive numbers with up to 10 decimal places
    const regex = /^\d*\.?\d{0,10}$/;
    if (value === "" || regex.test(value)) {
      setCurrencyRates((prev) =>
        prev.map((rate) =>
          rate.id === id ? { ...rate, [field]: value } : rate
        )
      );
    }
  };

  const handleSave = async (id: string) => {
    const rate = currencyRates.find((r) => r.id === id);
    if (!rate) return;

    // Validate rates
    const closingRate = parseFloat(rate.closingRate);
    const ourRate = parseFloat(rate.ourRate);

    if (isNaN(closingRate) || closingRate <= 0) {
      showErrorMessage("Closing rate must be a positive number");
      return;
    }

    if (isNaN(ourRate) || ourRate <= 0) {
      showErrorMessage("Our rate must be a positive number");
      return;
    }

    setIsSaving(id);
    try {
      const request: EditCurrencyRateRequest = {
        targetCurrency: rate.targetCurrency,
        closingRate: closingRate,
        ourRate: ourRate,
      };

      await editCurrencyRate(request);

      // Update the state
      setCurrencyRates((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
              ...r,
              isEditing: false,
              originalClosingRate: rate.closingRate,
              originalOurRate: rate.ourRate,
              updatedAt: new Date().toISOString(), // Optimistically update
            }
            : r
        )
      );

      showSuccessMessage(
        `Currency rate for ${rate.targetCurrency} updated successfully`
      );
    } catch (error) {
      console.error("Failed to update currency rate:", error);
      showErrorMessage("Failed to update currency rate. Please try again.");
    } finally {
      setIsSaving(null);
    }
  };

  const getCurrencyInfo = (code: string) => {
    return SUPPORTED_CURRENCIES.find((currency) => currency.code === code);
  };

  const getAvailableCurrencies = () => {
    const existingCurrencies = currencyRates.map((rate) => rate.targetCurrency);
    return SUPPORTED_CURRENCIES.filter(
      (currency) => !existingCurrencies.includes(currency.code)
    );
  };

  const handleAddNewRates = () => {
    const availableCurrencies = getAvailableCurrencies();
    if (availableCurrencies.length === 0) {
      showErrorMessage("All supported currencies have been added");
      return;
    }

    setNewRates([
      {
        targetCurrency: availableCurrencies[0].code,
        closingRate: 0,
        ourRate: 0,
      },
    ]);
    setShowAddModal(true);
  };

  const handleAddRate = () => {
    const availableCurrencies = getAvailableCurrencies();
    setNewRates([
      ...newRates,
      {
        targetCurrency: availableCurrencies[0].code,
        closingRate: 0,
        ourRate: 0,
      },
    ]);
  };

  const handleRemoveNewRate = (index: number) => {
    setNewRates(newRates.filter((_, i) => i !== index));
  };

  const handleNewRateChange = (
    index: number,
    field: keyof AddCurrencyRateRequest,
    value: string | number
  ) => {
    setNewRates((prev) =>
      prev.map((rate, i) => (i === index ? { ...rate, [field]: value } : rate))
    );
  };

  const handleSaveNewRates = async () => {
    // Validate all rates
    for (const rate of newRates) {
      if (!rate.targetCurrency) {
        showErrorMessage("Please select a currency");
        return;
      }
      if (rate.closingRate <= 0) {
        showErrorMessage("Closing rate must be greater than 0");
        return;
      }
      if (rate.ourRate <= 0) {
        showErrorMessage("Our rate must be greater than 0");
        return;
      }
    }

    try {
      await addCurrencyRates({ rates: newRates });
      showSuccessMessage("Currency rates added successfully");
      setShowAddModal(false);
      setNewRates([]);
      loadCurrencyRates(); // Reload data
    } catch (error) {
      console.error("Failed to add currency rates:", error);
      showErrorMessage("Failed to add currency rates. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="main-container">
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Loading currency rates...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Stats Bar */}
      <div className="bg-white rounded-lg px-5 mb-6 flex items-center justify-between custom-border-3 ">
        <div className="flex items-center gap-4">
          <div className="text-gray-130">
            <span className="small-semibold">{currencyRates.length}</span>{" "}
            <span className="small">Currencies</span>
          </div>
          <span className="w-[1.5px] block h-[20px] bg-gray-50"></span>
          <div className="text-gray-130">
            <span className="small-semibold">INR</span>{" "}
            <span className="small">Base Currency</span>
          </div>
        </div>
        <button
          onClick={handleSyncFromGSheet}
          disabled={isSyncing}
          className="px-4 py-2 bg-primary text-white rounded-md small-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          title="Sync currency rates from Google Sheet"
        >
          <FontAwesomeIcon
            icon={faSync}
            className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
          />
          {isSyncing ? "Syncing..." : "Sync from Google Sheet"}
        </button>
      </div>

      {/* Search and Table */}
      <div className="bg-white rounded-lg shadow-sm custom-border-1">
        <div className="relative mb-2">
          <input
            type="text"
            placeholder="Search by currency code, name, country, or rates..."
            className="w-full pl-10 pr-4 py-2 border border-gray-line rounded-md xsmall placeholder:xsmall focus:outline-none text-gray-10"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-10 h-3 w-3"
          />
        </div>

        <div className="overflow-x-auto rounded-md">
          <table className="min-w-full">
            <thead className="bg-gray-line">
              <tr>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Currency
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Closing Rate
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Our Rate
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left xsmall-semibold text-gray-10 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-line">
              {filteredCurrencyRates.length === 0 ? (
                <tr className="w-full">
                  <td
                    colSpan={5}
                    className="w-full text-center text-gray-500 py-5"
                  >
                    <div className="flex flex-col gap-2 justify-center items-center">
                      {searchTerm ? (
                        <span>
                          No currencies found matching your search criteria.
                        </span>
                      ) : (
                        <span>No currency rates found. Create one!</span>
                      )}
                      <button
                        onClick={handleAddNewRates}
                        className="px-4 py-2 bg-primary text-white rounded-md xsmall-semibold flex items-center"
                      >
                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                        Add Currency
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCurrencyRates.map((rate) => {
                  const currencyInfo = getCurrencyInfo(rate.targetCurrency);
                  return (
                    <tr key={rate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-xs font-semibold mr-3">
                            {rate.targetCurrency}
                          </div>
                          <div>
                            <div className="text-black xsmall-semibold">
                              {rate.targetCurrency}
                            </div>
                            <div className="text-gray-500 xsmall">
                              {currencyInfo?.name || "Unknown Currency"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {rate.isEditing ? (
                          <input
                            type="text"
                            value={rate.closingRate}
                            onChange={(e) =>
                              handleInputChange(
                                rate.id,
                                "closingRate",
                                e.target.value
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded-md xsmall focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="0.00000000"
                          />
                        ) : (
                          <span className="text-black xsmall">
                            {parseFloat(rate.closingRate).toFixed(10)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {rate.isEditing ? (
                          <input
                            type="text"
                            value={rate.ourRate}
                            onChange={(e) =>
                              handleInputChange(
                                rate.id,
                                "ourRate",
                                e.target.value
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded-md xsmall focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="0.00000000"
                          />
                        ) : (
                          <span className="text-black xsmall">
                            {parseFloat(rate.ourRate).toFixed(10)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-500 xsmall">
                          {new Date(rate.updatedAt).toLocaleDateString()}
                          {" "}
                          {new Date(rate.updatedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {rate.isEditing ? (
                            <>
                              <button
                                onClick={() => handleSave(rate.id)}
                                disabled={isSaving === rate.id}
                                className="text-green-600 hover:text-green-800 disabled:opacity-50"
                                title="Save"
                              >
                                <FontAwesomeIcon
                                  icon={faSave}
                                  className="h-4 w-4"
                                />
                              </button>
                              <button
                                onClick={() => handleCancel(rate.id)}
                                disabled={isSaving === rate.id}
                                className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                                title="Cancel"
                              >
                                <FontAwesomeIcon
                                  icon={faTimes}
                                  className="h-4 w-4"
                                />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleEdit(rate.id)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <FontAwesomeIcon
                                icon={faEdit}
                                className="h-4 w-4"
                              />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div >

      {/* Add Currency Modal */}
      {
        showAddModal && (
          <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add Currency Rates</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewRates([]);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <div className="space-y-4">
                {newRates.map((rate, index) => {
                  const availableCurrencies = getAvailableCurrencies().filter(
                    (currency) =>
                      !newRates
                        .filter((_, i) => i !== index)
                        .map((r) => r.targetCurrency)
                        .includes(currency.code)
                  );

                  return (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-md"
                    >
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Currency
                        </label>
                        <select
                          value={rate.targetCurrency}
                          onChange={(e) =>
                            handleNewRateChange(
                              index,
                              "targetCurrency",
                              e.target.value
                            )
                          }
                          className="w-full p-2 border border-gray-300 rounded-md small focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {availableCurrencies.map((currency) => (
                            <option key={currency.code} value={currency.code}>
                              {currency.code} - {currency.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Closing Rate
                        </label>
                        <input
                          type="number"
                          step="0.0000000001"
                          min="0"
                          value={rate.closingRate}
                          onChange={(e) =>
                            handleNewRateChange(
                              index,
                              "closingRate",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full p-2 border border-gray-300 rounded-md small focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="0.00000000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Our Rate
                        </label>
                        <input
                          type="number"
                          step="0.0000000001"
                          min="0"
                          value={rate.ourRate}
                          onChange={(e) =>
                            handleNewRateChange(
                              index,
                              "ourRate",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full p-2 border border-gray-300 rounded-md small focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="0.00000000"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => handleRemoveNewRate(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-md small hover:bg-red-600 transition-colors"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={handleAddRate}
                  disabled={getAvailableCurrencies().length <= newRates.length}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md small-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  Add Another Currency
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setNewRates([]);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md small-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNewRates}
                    className="px-4 py-2 bg-primary text-white rounded-md small-semibold hover:bg-primary-dark transition-colors"
                  >
                    Save Currency Rates
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
