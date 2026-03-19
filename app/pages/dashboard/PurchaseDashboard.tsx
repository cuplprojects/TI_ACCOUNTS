"use client";

import React, { useState, useMemo } from "react";

type PurchaseTransaction = {
  date: string;
  billNo: string;
  refNo: string;
  vendorName: string;
  value: string;
  payment: string;
};

type SortField = keyof PurchaseTransaction | null;
type SortOrder = "asc" | "desc";

export default function PurchaseDashboard() {
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const itemsPerPage = 5;

  // Sample data matching the image
  const allPurchaseData: PurchaseTransaction[] = [
    {
      date: "21/05/2025",
      billNo: "TI/P/25-26/1",
      refNo: "TI/1110",
      vendorName: "Sanwaliya Enterprise",
      value: "INR 1,580",
      payment: "Yes"
    },
    {
      date: "21/05/2025",
      billNo: "TI/P/25-26/1",
      refNo: "TI/1110",
      vendorName: "Sanwaliya Enterprise",
      value: "INR 1,580",
      payment: "Yes"
    },
    {
      date: "21/05/2025",
      billNo: "TI/P/25-26/1",
      refNo: "TI/1110",
      vendorName: "Sanwaliya Enterprise",
      value: "INR 1,580",
      payment: "Yes"
    },
    {
      date: "21/05/2025",
      billNo: "TI/P/25-26/1",
      refNo: "TI/1110",
      vendorName: "Sanwaliya Enterprise",
      value: "INR 1,580",
      payment: "Yes"
    },
    {
      date: "21/05/2025",
      billNo: "TI/P/25-26/1",
      refNo: "TI/1110",
      vendorName: "Sanwaliya Enterprise",
      value: "INR 1,580",
      payment: "Yes"
    },
    {
      date: "21/05/2025",
      billNo: "TI/P/25-26/1",
      refNo: "TI/1110",
      vendorName: "Sanwaliya Enterprise",
      value: "INR 1,580",
      payment: "Yes"
    },
    {
      date: "21/05/2025",
      billNo: "TI/P/25-26/1",
      refNo: "TI/1110",
      vendorName: "Sanwaliya Enterprise",
      value: "INR 1,580",
      payment: "Yes"
    },
    {
      date: "21/05/2025",
      billNo: "TI/P/25-26/1",
      refNo: "TI/1110",
      vendorName: "Sanwaliya Enterprise",
      value: "INR 1,580",
      payment: "Yes"
    },
    {
      date: "21/05/2025",
      billNo: "TI/P/25-26/1",
      refNo: "TI/1110",
      vendorName: "Sanwaliya Enterprise",
      value: "INR 1,580",
      payment: "Yes"
    }
  ];

  // Sorting and pagination logic
  const sortedData = useMemo(() => {
    let sorted = [...allPurchaseData];
    
    if (sortField) {
      sorted.sort((a, b) => {
        const aVal = a[sortField as keyof PurchaseTransaction];
        const bVal = b[sortField as keyof PurchaseTransaction];
        
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortOrder === "asc" 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        
        return sortOrder === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
      });
    }
    
    return sorted;
  }, [sortField, sortOrder]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIdx, startIdx + itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return " ↕";
    return sortOrder === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="bg-white">
      {/* Statistics Cards */}
      <div className="grid grid-cols-3 gap-0 mb-4">
        <div className="bg-white p-4 border-r border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Purchase</h3>
          <p className="text-2xl font-bold text-gray-900">₹ 15,00,000.54</p>
          <p className="text-xs text-gray-500 mt-1">Showing data for This Year</p>
        </div>
        
        <div className="bg-white p-4 border-r border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Taxable Value</h3>
          <p className="text-2xl font-bold text-gray-900">₹ 12,71,186.89</p>
        </div>
        
        <div className="bg-white p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Input GST</h3>
          <p className="text-2xl font-bold text-gray-900">₹ 2,28,813.64</p>
        </div>
      </div>

      {/* Transaction Filters and Actions */}
      <div className="bg-white border-t border-gray-200">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
          <div className="flex gap-1">
            <button 
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1 text-sm font-medium ${
                activeTab === "all" 
                  ? "bg-blue-600 text-white rounded" 
                  : "text-blue-600 hover:bg-blue-50 rounded"
              }`}
            >
              All Transactions
            </button>
            <button 
              onClick={() => setActiveTab("draft")}
              className={`px-3 py-1 text-sm font-medium ${
                activeTab === "draft" 
                  ? "bg-blue-600 text-white rounded" 
                  : "text-gray-600 hover:bg-gray-100 rounded"
              }`}
            >
              Draft (10)
            </button>
            <button 
              onClick={() => setActiveTab("cancelled")}
              className={`px-3 py-1 text-sm font-medium ${
                activeTab === "cancelled" 
                  ? "bg-blue-600 text-white rounded" 
                  : "text-gray-600 hover:bg-gray-100 rounded"
              }`}
            >
              Cancelled
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs">This Year</span>
            <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
              <span>+</span>
              Purchase
            </button>
          </div>
        </div>

        {/* Transaction Table */}
        <div>
          <table className="w-full text-sm table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  onClick={() => handleSort("date")}
                  className="w-20 px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                >
                  Date{getSortIndicator("date")}
                </th>
                <th 
                  onClick={() => handleSort("billNo")}
                  className="w-24 px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                >
                  Bill #{getSortIndicator("billNo")}
                </th>
                <th 
                  onClick={() => handleSort("refNo")}
                  className="w-16 px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                >
                  Ref #{getSortIndicator("refNo")}
                </th>
                <th 
                  onClick={() => handleSort("vendorName")}
                  className="w-40 px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                >
                  Vendor Name{getSortIndicator("vendorName")}
                </th>
                <th 
                  onClick={() => handleSort("value")}
                  className="w-20 px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                >
                  Value{getSortIndicator("value")}
                </th>
                <th 
                  onClick={() => handleSort("payment")}
                  className="w-20 px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                >
                  Payment{getSortIndicator("payment")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {paginatedData.map((transaction, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-2 py-3 text-sm text-gray-900 truncate">
                    {transaction.date}
                  </td>
                  <td className="px-2 py-3 text-sm text-blue-600 font-medium truncate">
                    {transaction.billNo}
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-900 truncate">
                    {transaction.refNo}
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-900 truncate">
                    {transaction.vendorName}
                  </td>
                  <td className="px-2 py-3 text-sm font-medium text-gray-900 truncate">
                    {transaction.value}
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-900 truncate">
                    {transaction.payment}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center py-3 px-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {startIdx + 1} to {Math.min(startIdx + itemsPerPage, sortedData.length)} of {sortedData.length} results
          </div>
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-6 h-6 flex items-center justify-center text-xs border ${
                  currentPage === page
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-xs border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}