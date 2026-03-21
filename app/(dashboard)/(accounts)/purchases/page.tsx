"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import accountsService from "@/lib/services/accountsService";
import TableSkeleton from "@/app/components/common/TableSkeleton";

interface PurchaseTransaction {
  id: string;
  orderId: string;
  shipmentId: string;
  date: string;
  invoiceNo: string;
  sellerName: string;
  sellerEmail: string;
  sellerGstin: string;
  buyerName: string;
  buyerEmail: string;
  country: string;
  countryCode: string;
  airwayBill: string;
  purchaseValue: string;
  paymentMethod: string;
  status: string;
  paymentStatus: string;
  invoiceDate?: string;
  orderItems?: any[];
}

export default function PurchasePage() {
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [purchaseData, setPurchaseData] = useState<PurchaseTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ totalPages: 1, totalTransactions: 0 });
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  useEffect(() => {
    fetchPurchaseData();
  }, [currentPage, activeTab, dateRange]);

  const fetchPurchaseData = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        page: currentPage,
        limit: 10,
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate })
      };

      const response = await accountsService.getPurchaseTransactions(filters);

      if (response.success) {
        setPurchaseData(response.data.transactions);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || "Failed to fetch purchase data");
      }
    } catch (err: any) {
      setError(err.message || "Error fetching purchase transactions");
      console.error("Error:", err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Purchase Transactions</h1>
            <p className="text-sm text-gray-500">Manage your purchase transactions</p>
          </div>
          <div className="flex gap-2">
            <select 
              className="px-3 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-700"
              onChange={(e) => {
                const value = e.target.value;
                const today = new Date();
                let startDate = "";
                let endDate = today.toISOString().split("T")[0];

                if (value === "thisMonth") {
                  startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
                } else if (value === "lastMonth") {
                  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                  startDate = lastMonth.toISOString().split("T")[0];
                  endDate = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split("T")[0];
                } else if (value === "thisYear") {
                  startDate = new Date(today.getFullYear(), 0, 1).toISOString().split("T")[0];
                }

                setDateRange({ startDate, endDate });
                setCurrentPage(1);
              }}
            >
              <option value="thisYear">This Year</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-1.5 text-sm rounded hover:bg-blue-700 flex items-center gap-1">
              <span>+</span>
              Purchase
            </button>
          </div>
        </div>
      </div>

      {/* Tabs and Controls Section */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white flex justify-between items-center">
        <nav className="flex space-x-8">
          <button
            onClick={() => { setActiveTab("all"); setCurrentPage(1); }}
            className={`py-2 text-sm font-medium ${
              activeTab === "all"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All Transactions
          </button>
          <button
            onClick={() => { setActiveTab("draft"); setCurrentPage(1); }}
            className={`py-2 text-sm font-medium ${
              activeTab === "draft"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Draft
          </button>
          <button
            onClick={() => { setActiveTab("cancelled"); setCurrentPage(1); }}
            className={`py-2 text-sm font-medium ${
              activeTab === "cancelled"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Cancelled
          </button>
        </nav>
      </div>

      {/* Loading State - only show on initial load */}
      {initialLoading && (
        <TableSkeleton rows={10} columns={7} />
      )}

      {/* Error State */}
      {error && !initialLoading && (
        <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">Error</p>
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={fetchPurchaseData}
            className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Purchase Table */}
      {!initialLoading && !error && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 border-r border-gray-300">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 border-r border-gray-300">Invoice #</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 border-r border-gray-300">Seller Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 border-r border-gray-300">Seller GSTIN</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 border-r border-gray-300">Purchase Value</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 border-r border-gray-300">Payment Method</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {purchaseData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
                      No purchase transactions found
                    </td>
                  </tr>
                ) : (
                  purchaseData.map((purchase) => (
                    <tr key={purchase.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-900 border-r border-gray-200">
                        {new Date(purchase.date).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-3 py-2 border-r border-gray-200">
                        <Link href={`/purchases/invoice/${purchase.id}`} className="text-blue-600 hover:text-blue-800 cursor-pointer">
                          {purchase.invoiceNo}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-gray-900 border-r border-gray-200">
                        <div className="text-sm font-medium">{purchase.sellerName}</div>
                        <div className="text-xs text-gray-500">{purchase.sellerEmail}</div>
                      </td>
                      <td className="px-3 py-2 text-gray-900 border-r border-gray-200">{purchase.sellerGstin}</td>
                      <td className="px-3 py-2 text-gray-900 font-medium border-r border-gray-200 text-right">{purchase.purchaseValue}</td>
                      <td className="px-3 py-2 text-gray-900 border-r border-gray-200">{purchase.paymentMethod}</td>
                      <td className="px-3 py-2 text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          purchase.status === 'completed' ? 'bg-green-100 text-green-800' :
                          purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          purchase.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {purchase.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Section */}
          <div className="px-4 py-4 border-t border-gray-200 bg-white flex justify-end">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => i + 1).map((page) => (
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
              <button 
                onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                disabled={currentPage === pagination.totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
