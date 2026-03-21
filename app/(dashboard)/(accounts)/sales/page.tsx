"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import accountsService from "@/lib/services/accountsService";
import TableSkeleton from "@/app/components/common/TableSkeleton";

interface SalesTransaction {
  id: string;
  date: string;
  invoiceNo: string;
  refNo: string;
  buyerName: string;
  buyerEmail: string;
  country: string;
  countryCode: string;
  airwayBill: string;
  logistics: string;
  sbRef: string;
  value: string;
  payment: string;
  status: string;
  invoiceDate?: string;
  paymentStatus: string;
}

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionData, setTransactionData] = useState<SalesTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({ totalValue: 0, cancelledValue: 0, currency: "INR" });
  const [pagination, setPagination] = useState({ totalPages: 1, totalTransactions: 0 });
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  useEffect(() => {
    fetchSalesData();
  }, [currentPage, activeTab, dateRange]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        page: currentPage,
        limit: 10,
        tab: activeTab as "all" | "draft" | "pending" | "cancelled",
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate })
      };

      const response = await accountsService.getSalesTransactions(filters);

      if (response.success) {
        setTransactionData(response.data.transactions);
        setPagination(response.data.pagination);
        setSummary(response.data.summary);
      } else {
        setError(response.message || "Failed to fetch sales data");
      }
    } catch (err: any) {
      setError(err.message || "Error fetching sales transactions");
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
            <h1 className="text-lg font-semibold text-gray-900">Sales Transactions</h1>
            <p className="text-sm text-gray-500">Manage your sales transactions and invoices</p>
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
            <Link 
              href="/sales/create" 
              className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded hover:bg-blue-700 flex items-center gap-1"
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
            onClick={() => { setActiveTab("all"); setCurrentPage(1); }}
            className={`py-2 text-sm font-medium ${
              activeTab === "all"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            All Transactions
          </button>
          <button
            onClick={() => { setActiveTab("draft"); setCurrentPage(1); }}
            className={`py-2 text-sm font-medium ${
              activeTab === "draft"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Draft
          </button>
          <button
            onClick={() => { setActiveTab("pending"); setCurrentPage(1); }}
            className={`py-2 text-sm font-medium ${
              activeTab === "pending"
                ? "text-red-600 border-b-2 border-blue-600"
                : "text-red-500 hover:text-red-700"
            }`}
          >
            Pending Shipping Bill
          </button>
          <button
            onClick={() => { setActiveTab("cancelled"); setCurrentPage(1); }}
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

      {/* Loading State - only show on initial load */}
      {initialLoading && (
        <TableSkeleton rows={10} columns={10} />
      )}

      {/* Error State */}
      {error && !initialLoading && (
        <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">Error</p>
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={fetchSalesData}
            className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Transaction Table */}
      {!initialLoading && !error && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 border-r border-gray-300">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 border-r border-gray-300">Invoice #</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 border-r border-gray-300">Ref #</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 border-r border-gray-300">Buyer Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 border-r border-gray-300">Country</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 border-r border-gray-300">Airway Bill</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 border-r border-gray-300">Logistics</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 border-r border-gray-300">SB Ref #</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 border-r border-gray-300">Value</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-900">Payment</th>
                </tr>
              </thead>
              <tbody>
                {transactionData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-3 py-8 text-center text-gray-500">
                      No sales transactions found
                    </td>
                  </tr>
                ) : (
                  transactionData.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-900 border-r border-gray-200">
                        {new Date(transaction.date).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-3 py-2 border-r border-gray-200">
                        <Link href={`/sales/invoice/${transaction.id}`} className="text-blue-600 hover:text-blue-800 cursor-pointer">
                          {transaction.invoiceNo}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-gray-900 border-r border-gray-200">{transaction.refNo}</td>
                      <td className="px-3 py-2 text-gray-900 border-r border-gray-200">
                        <div className="text-sm font-medium">{transaction.buyerName}</div>
                        <div className="text-xs text-gray-500">{transaction.buyerEmail}</div>
                      </td>
                      <td className="px-3 py-2 text-gray-900 border-r border-gray-200">{transaction.country}</td>
                      <td className="px-3 py-2 text-blue-600 border-r border-gray-200">{transaction.airwayBill}</td>
                      <td className="px-3 py-2 text-gray-900 border-r border-gray-200">{transaction.logistics}</td>
                      <td className="px-3 py-2 text-gray-900 border-r border-gray-200">{transaction.sbRef}</td>
                      <td className="px-3 py-2 text-gray-900 font-medium border-r border-gray-200">{transaction.value}</td>
                      <td className="px-3 py-2 text-gray-900">{transaction.payment}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Section */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              {/* Summary Cards */}
              <div className="flex gap-4">
                <div className="bg-white px-4 py-2 rounded-full border border-green-300 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Total</span>
                    <span className="text-lg font-semibold text-green-600">
                      {summary.currency} {parseFloat(summary.totalValue.toString()).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="px-4 py-2 rounded-full border border-red-300 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 text-red-600">Cancelled</span>
                    <span className="text-lg font-semibold text-red-600">
                      {summary.currency} {parseFloat(summary.cancelledValue.toString()).toLocaleString()}
                    </span>
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
                
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => i + 1).map((page) => (
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
                  onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                  className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                  disabled={currentPage === pagination.totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
