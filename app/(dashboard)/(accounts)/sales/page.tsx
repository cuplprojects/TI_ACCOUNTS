"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
      setSelectAll(false);
    } else {
      const allRows = new Set(transactionData.map((_, index) => index));
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
    setSelectAll(newSelected.size === transactionData.length);
  };

  const transactionData = [
    {
      date: "21/05/2025",
      invoiceNo: "TTE/25-26/1",
      refNo: "TI/1110",
      buyerName: "Kristina Marfitsyna",
      country: "Russia",
      airwayBill: "RY426034563IN",
      logistics: "IndiaPost",
      sbRef: "525855",
      value: "INR 1,580",
      payment: "RazorPay"
    },
    {
      date: "21/05/2025",
      invoiceNo: "TTE/25-26/2",
      refNo: "TI/1110",
      buyerName: "Kristina Marfitsyna",
      country: "Russia",
      airwayBill: "RY426034563IN",
      logistics: "IndiaPost",
      sbRef: "525855",
      value: "INR 1,580",
      payment: "RazorPay"
    },
    {
      date: "21/05/2025",
      invoiceNo: "TTE/25-26/1",
      refNo: "TI/1110",
      buyerName: "Kristina Marfitsyna",
      country: "Russia",
      airwayBill: "RY426034563IN",
      logistics: "IndiaPost",
      sbRef: "525855",
      value: "INR 1,580",
      payment: "RazorPay"
    },
    {
      date: "21/05/2025",
      invoiceNo: "TTE/25-26/1",
      refNo: "TI/1110",
      buyerName: "Kristina Marfitsyna",
      country: "Russia",
      airwayBill: "RY426034563IN",
      logistics: "IndiaPost",
      sbRef: "525855",
      value: "INR 1,580",
      payment: "RazorPay"
    },
    {
      date: "21/05/2025",
      invoiceNo: "TTE/25-26/1",
      refNo: "TI/1110",
      buyerName: "Kristina Marfitsyna",
      country: "Russia",
      airwayBill: "RY426034563IN",
      logistics: "IndiaPost",
      sbRef: "525855",
      value: "INR 1,580",
      payment: "RazorPay"
    },
    {
      date: "21/05/2025",
      invoiceNo: "TTE/25-26/1",
      refNo: "TI/1110",
      buyerName: "Kristina Marfitsyna",
      country: "Russia",
      airwayBill: "RY426034563IN",
      logistics: "IndiaPost",
      sbRef: "525855",
      value: "INR 1,580",
      payment: "RazorPay"
    },
    {
      date: "21/05/2025",
      invoiceNo: "TTE/25-26/1",
      refNo: "TI/1110",
      buyerName: "Kristina Marfitsyna",
      country: "Russia",
      airwayBill: "RY426034563IN",
      logistics: "IndiaPost",
      sbRef: "525855",
      value: "INR 1,580",
      payment: "RazorPay"
    },
    {
      date: "21/05/2025",
      invoiceNo: "TTE/25-26/1",
      refNo: "TI/1110",
      buyerName: "Kristina Marfitsyna",
      country: "Russia",
      airwayBill: "RY426034563IN",
      logistics: "IndiaPost",
      sbRef: "525855",
      value: "INR 1,580",
      payment: "RazorPay"
    },
    {
      date: "21/05/2025",
      invoiceNo: "TTE/25-26/1",
      refNo: "TI/1110",
      buyerName: "Kristina Marfitsyna",
      country: "Russia",
      airwayBill: "RY426034563IN",
      logistics: "IndiaPost",
      sbRef: "525855",
      value: "INR 1,580",
      payment: "RazorPay"
    },
    {
      date: "21/05/2025",
      invoiceNo: "TTE/25-26/1",
      refNo: "TI/1110",
      buyerName: "Kristina Marfitsyna",
      country: "Russia",
      airwayBill: "RY426034563IN",
      logistics: "IndiaPost",
      sbRef: "525855",
      value: "INR 1,580",
      payment: "RazorPay"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Sales Transactions</h1>
            <p className="text-sm text-gray-500">Manage your sales transactions and invoices</p>
          </div>
          <div className="flex gap-2">
            <select className="px-3 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-700">
              <option>This Year</option>
              <option>This Month</option>
              <option>Last Month</option>
            </select>
            <Link 
              href="/sales/create" 
              className="bg-blue-900 text-white px-3 py-1.5 text-sm rounded hover:bg-blue-800 flex items-center gap-1"
            >
              <span>+</span>
              Create Invoice
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="px-4 py-2 border-b border-gray-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab("all")}
            className={`py-2 text-sm font-medium ${
              activeTab === "all"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            All Transactions
          </button>
          <button
            onClick={() => setActiveTab("draft")}
            className={`py-2 text-sm font-medium ${
              activeTab === "draft"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Draft <span className="ml-1 text-xs text-gray-400">(10)</span>
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`py-2 text-sm font-medium ${
              activeTab === "pending"
                ? "text-red-600 border-b-2 border-blue-600"
                : "text-red-500 hover:text-red-700"
            }`}
          >
            Pending Shipping Bill <span className="ml-1 text-xs text-red-400">(25)</span>
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`py-2 text-sm font-medium ${
              activeTab === "cancelled"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Cancelled
          </button>
        </nav>
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Invoice #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Ref #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Buyer Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Country</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Airway Bill</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Logistics</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">SB Ref #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Value</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Payment</th>
              </tr>
            </thead>
            <tbody>
              {transactionData.map((transaction, index) => (
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
                    <Link href={`/sales/invoice/${index + 1}`} className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium">
                      {transaction.invoiceNo}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-900">{transaction.refNo}</td>
                  <td className="px-4 py-3 text-gray-900">{transaction.buyerName}</td>
                  <td className="px-4 py-3 text-gray-900">{transaction.country}</td>
                  <td className="px-4 py-3 text-blue-600">{transaction.airwayBill}</td>
                  <td className="px-4 py-3 text-gray-900">{transaction.logistics}</td>
                  <td className="px-4 py-3 text-gray-900">{transaction.sbRef}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{transaction.value}</td>
                  <td className="px-4 py-3 text-gray-900">{transaction.payment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          {/* Summary Cards */}
          <div className="flex gap-4">
            <div className="bg-green-100 px-6 py-2 rounded-lg border-2 border-green-600">
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-600 font-medium">Total</span>
                <span className="text-base font-semibold text-green-600">₹ 1,00,000</span>
              </div>
            </div>
            <div className="bg-red-100 px-6 py-2 rounded-lg border-2 border-red-600">
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600 font-medium">Cancelled</span>
                <span className="text-base font-semibold text-red-600">₹ 1,000</span>
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 text-sm rounded ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            
            <button 
              onClick={() => setCurrentPage(Math.min(5, currentPage + 1))}
              className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              disabled={currentPage === 5}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
