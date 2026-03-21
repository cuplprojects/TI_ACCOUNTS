"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

type PurchaseTransaction = {
  date: string;
  billNo: string;
  refNo: string;
  vendorName: string;
  value: string;
  payment: string;
};

export default function PurchaseDashboard() {
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const itemsPerPage = 5;

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
      setSelectAll(false);
    } else {
      const allRows = new Set(allPurchaseData.map((_, index) => index));
      setSelectedRows(allRows);
      setSelectAll(true);
    }
  };

  const handleSelectRow = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
    setSelectAll(newSelected.size === allPurchaseData.length);
  };

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
    return allPurchaseData;
  }, []);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIdx, startIdx + itemsPerPage);

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
            <Link href="/purchases/create" className="bg-blue-900 text-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-blue-800">
              <span>+</span>
              Purchase
            </Link>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Bill #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Ref #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Vendor Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Payment</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((transaction, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors last:border-b-0">
                    <td className="px-4 py-3 text-gray-900">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(index)}
                        onChange={() => handleSelectRow(index)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-900">{transaction.date}</td>
                    <td className="px-4 py-3">
                      <a href={`/purchases/bill/${index + 1}`} className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium">
                        {transaction.billNo}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{transaction.refNo}</td>
                    <td className="px-4 py-3 text-gray-900">{transaction.vendorName}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{transaction.value}</td>
                    <td className="px-4 py-3 text-gray-900">{transaction.payment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center py-3 px-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {startIdx + 1} to {Math.min(startIdx + itemsPerPage, sortedData.length)} of {sortedData.length} results
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center text-sm rounded ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}