"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function PurchasePage() {
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const purchaseData = [
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
      billNo: "TI/P/25-26/2",
      refNo: "TI/1110",
      vendorName: "Sanwaliya Enterprise",
      value: "INR 2,500",
      payment: "No"
    },
    {
      date: "21/05/2025",
      billNo: "TI/P/25-26/3",
      refNo: "TI/1110",
      vendorName: "Sanwaliya Enterprise",
      value: "INR 1,200",
      payment: "Yes"
    },
    {
      date: "21/05/2025",
      billNo: "TI/P/25-26/4",
      refNo: "TI/1110",
      vendorName: "Sanwaliya Enterprise",
      value: "INR 3,100",
      payment: "No"
    },
    {
      date: "21/05/2025",
      billNo: "TI/P/25-26/5",
      refNo: "TI/1110",
      vendorName: "Sanwaliya Enterprise",
      value: "INR 1,900",
      payment: "Yes"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Stats Section */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex gap-12">
          <div>
            <p className="text-xs text-gray-600 font-medium">Purchase</p>
            <p className="text-lg font-semibold text-gray-900">₹ 15,00,000.54</p>
            <p className="text-xs text-gray-500 mt-1">Showing data for This Year</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium">Taxable Value</p>
            <p className="text-lg font-semibold text-gray-900">₹ 12,71,186.89</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium">Input GST</p>
            <p className="text-lg font-semibold text-gray-900">₹ 2,28,813.64</p>
          </div>
        </div>
      </div>

      {/* Tabs and Controls Section */}
      <div className="px-6 py-3 border-b border-gray-200 bg-white flex justify-between items-center">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("all")}
            className={`py-2 text-sm font-medium ${
              activeTab === "all"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All Transactions
          </button>
          <button
            onClick={() => setActiveTab("draft")}
            className={`py-2 text-sm font-medium ${
              activeTab === "draft"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Draft <span className="ml-1 text-xs text-gray-500">(10)</span>
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`py-2 text-sm font-medium ${
              activeTab === "cancelled"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Cancelled
          </button>
        </nav>
        
        <div className="flex gap-2">
          <select className="px-3 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-700">
            <option>This Year</option>
            <option>This Month</option>
            <option>Last Month</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-1.5 text-sm rounded hover:bg-blue-700 flex items-center gap-1">
            <span>+</span>
            Purchase
          </button>
        </div>
      </div>

      {/* Purchase Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Bill #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Ref #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Vendor Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Payment</th>
            </tr>
          </thead>
          <tbody>
            {purchaseData.map((purchase, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-3 text-gray-900">{purchase.date}</td>
                <td className="px-6 py-3">
                  <Link href={`/pages/purchase/invoice/${index + 1}`} className="text-blue-600 hover:text-blue-800 cursor-pointer">
                    {purchase.billNo}
                  </Link>
                </td>
                <td className="px-6 py-3 text-gray-900">{purchase.refNo}</td>
                <td className="px-6 py-3 text-gray-900">{purchase.vendorName}</td>
                <td className="px-6 py-3 text-gray-900 text-right">{purchase.value}</td>
                <td className="px-6 py-3 text-gray-900">{purchase.payment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Section */}
      <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 text-xs rounded ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}