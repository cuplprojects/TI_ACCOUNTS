"use client";

import React from "react";

interface ShippingAgency {
  id: number;
  key: string;
  name: string;
  amount: number;
}

interface ShippingAgenciesCardProps {
  agencies: ShippingAgency[];
  onAgencyChange?: (agencies: ShippingAgency[]) => void;
  readOnly?: boolean;
}

const FIXED_AGENCIES = [
  { id: 1, key: "shipglobaldirect", name: "ShipGlobal Direct" },
  { id: 2, key: "shipglobalpremium", name: "ShipGlobal Premium" },
  { id: 3, key: "dhl", name: "DHL Express" },
  { id: 4, key: "aramex", name: "Aramex International" },
];

export default function ShippingAgenciesCard({
  agencies,
  onAgencyChange,
  readOnly = false,
}: ShippingAgenciesCardProps) {
  const handleAmountChange = (id: number, newAmount: string) => {
    if (!readOnly && onAgencyChange) {
      const updatedAgencies = agencies.map((agency) =>
        agency.id === id ? { ...agency, amount: parseInt(newAmount) || 0 } : agency
      );
      onAgencyChange(updatedAgencies);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Shipping Agencies
      </h2>

      {/* Agencies Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-line bg-gray-200">
              <th className="px-3 py-2 text-left font-semibold text-gray-700">
                Agency Name
              </th>
              <th className="px-3 py-2 text-right font-semibold text-gray-700">
                Markup Value
              </th>
            </tr>
          </thead>
          <tbody>
            {agencies.map((agency) => (
              <tr key={agency.id} className="border-b border-gray-line hover:bg-blue-50">
                <td className="px-3 py-2 text-gray-900">{agency.name}</td>
                <td className="px-3 py-2 text-right">
                  {readOnly ? (
                    <span className="text-gray-900 font-medium">{agency.amount}</span>
                  ) : (
                    <input
                      type="text"
                      value={agency.amount}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        handleAmountChange(agency.id, value);
                      }}
                      className="w-20 px-2 py-1 border border-gray-line rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm text-right"
                      placeholder="0"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
