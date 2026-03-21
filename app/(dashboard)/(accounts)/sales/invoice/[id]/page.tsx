"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceIndex = parseInt(params.id as string) - 1;
  
  const invoiceData = {
    invoiceNo: "TTE/25-26/1",
    orderId: "TI/1110",
    customerName: "Kristina Marfitsyna",
    customerEmail: "kgmarfitsyna@gmail.com",
    customerMobile: "+1 719 259 3091",
    shippingAddress: {
      line1: "68 Lady Hay Road",
      line2: "Leicester",
      line3: "LE3 9SJ",
      line4: "United Kingdom"
    },
    billingAddress: {
      line1: "1 Kiln Orchard Way",
      line2: "Birstall, Leicester",
      line3: "LE4 3NT",
      line4: "United Kingdom"
    },
    invoiceDate: "21/05/2025",
    invoiceCurrency: "INR",
    exchangeRate: "1",
    exportType: "Export with IGST",
    payment: "RazorPay",
    port: "INBOM4",
    logistics: "DHL Express",
    awb: "RY426034563IN",
    shippingBill: "524566",
    sbDate: "21/05/2025",
    egm: "0003695",
    items: [
      { 
        id: 1,
        name: "Himalaya Liv.52 Tablet", 
        qty: "10", 
        hsn: "30049011", 
        gst: "05%", 
        rate: "220.00", 
        discount: "10%", 
        dRate: "198.00", 
        amount: "1980.00" 
      },
      { 
        id: 2,
        name: "Baidyanath Prahakarvati 20 Tablet", 
        qty: "05", 
        hsn: "30049011", 
        gst: "12%", 
        rate: "120.00", 
        discount: "10%", 
        dRate: "108.00", 
        amount: "540.00" 
      }
    ],
    paymentRef: "ekjfejkdhkjhkajsdnjkjd587845155kjbkajsb",
    totalItems: "2/15",
    amountInWords: "Two Thousand Five Hundred And Twenty Rupees",
    taxableAmount: "2,367.86",
    igst: "2,367.86",
    total: "2520.00"
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <Link href="/sales" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium">
            <span>←</span>
            <span>Sales/{invoiceData.invoiceNo}</span>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Sales Invoice Details</h1>
          <div className="text-blue-600 font-medium text-sm">Order Id # {invoiceData.orderId}</div>
        </div>
      </div>

      <div className="p-6">
        {/* Customer Details Section */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {/* Left Column - Customer Info */}
          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-700">Name :</span>
              <p className="text-sm text-gray-900 font-medium">{invoiceData.customerName}</p>
            </div>
            <div>
              <span className="text-sm text-gray-700">Email :</span>
              <p className="text-sm text-gray-900">{invoiceData.customerEmail}</p>
            </div>
            <div>
              <span className="text-sm text-gray-700">Mobile # :</span>
              <p className="text-sm text-gray-900">{invoiceData.customerMobile}</p>
            </div>
            <div>
              <span className="text-sm text-gray-700">Payment :</span>
              <p className="text-sm text-gray-900 font-medium">{invoiceData.payment}</p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-700 font-medium">Shipping Address :</span>
              <div className="text-sm text-gray-900 space-y-1">
                <p>{invoiceData.shippingAddress.line1}</p>
                <p>{invoiceData.shippingAddress.line2}</p>
                <p>{invoiceData.shippingAddress.line3}</p>
                <p>{invoiceData.shippingAddress.line4}</p>
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-700 font-medium">Billing Address :</span>
              <div className="text-sm text-gray-900 space-y-1">
                <p>{invoiceData.billingAddress.line1}</p>
                <p>{invoiceData.billingAddress.line2}</p>
                <p>{invoiceData.billingAddress.line3}</p>
                <p>{invoiceData.billingAddress.line4}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Invoice Details */}
          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-700">Invoice Date :</span>
              <p className="text-sm text-gray-900">{invoiceData.invoiceDate}</p>
            </div>
            <div>
              <span className="text-sm text-gray-700">Invoice Currency :</span>
              <p className="text-sm text-gray-900">{invoiceData.invoiceCurrency}</p>
            </div>
            <div>
              <span className="text-sm text-gray-700">Exchange Rate :</span>
              <p className="text-sm text-gray-900">{invoiceData.exchangeRate}</p>
            </div>
            <div>
              <span className="text-sm text-gray-700">Export Type :</span>
              <p className="text-sm text-gray-900">{invoiceData.exportType}</p>
            </div>
          </div>
        </div>

        {/* Logistics Info */}
        <div className="flex gap-8 mb-8 text-sm">
          <div>
            <span className="text-gray-700">Port :</span>
            <span className="text-gray-900 ml-2 font-medium">{invoiceData.port}</span>
          </div>
          <div>
            <span className="text-gray-700">Logistics :</span>
            <span className="text-gray-900 ml-2 font-medium">{invoiceData.logistics}</span>
          </div>
          <div>
            <span className="text-gray-700">AWB :</span>
            <span className="text-gray-900 ml-2 font-medium">{invoiceData.awb}</span>
          </div>
          <div>
            <span className="text-gray-700">Shipping Bill :</span>
            <span className="text-gray-900 ml-2 font-medium">{invoiceData.shippingBill}</span>
          </div>
          <div>
            <span className="text-gray-700">SB Date :</span>
            <span className="text-gray-900 ml-2 font-medium">{invoiceData.sbDate}</span>
          </div>
          <div>
            <span className="text-gray-700">EGM :</span>
            <span className="text-gray-900 ml-2 font-medium">{invoiceData.egm}</span>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Product Details</h2>
          
          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2 px-2 text-gray-700 font-semibold">#</th>
                  <th className="text-left py-2 px-2 text-gray-700 font-semibold">Product Name</th>
                  <th className="text-left py-2 px-2 text-gray-700 font-semibold">Qty</th>
                  <th className="text-left py-2 px-2 text-gray-700 font-semibold">HSN</th>
                  <th className="text-left py-2 px-2 text-gray-700 font-semibold">GST %</th>
                  <th className="text-left py-2 px-2 text-gray-700 font-semibold">Rate</th>
                  <th className="text-left py-2 px-2 text-gray-700 font-semibold">Discount</th>
                  <th className="text-left py-2 px-2 text-gray-700 font-semibold">D. Rate</th>
                  <th className="text-left py-2 px-2 text-gray-700 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="py-2 px-2 text-gray-900">{item.id}</td>
                    <td className="py-2 px-2 text-gray-900">{item.name}</td>
                    <td className="py-2 px-2 text-gray-900 text-center">{item.qty}</td>
                    <td className="py-2 px-2 text-gray-900 text-center">{item.hsn}</td>
                    <td className="py-2 px-2 text-gray-900 text-center">{item.gst}</td>
                    <td className="py-2 px-2 text-gray-900 text-center">₹ {item.rate}</td>
                    <td className="py-2 px-2 text-gray-900 text-center">{item.discount}</td>
                    <td className="py-2 px-2 text-gray-900 text-center">₹ {item.dRate}</td>
                    <td className="py-2 px-2 text-gray-900 text-center">₹ {item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Left Column */}
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-700">Payment Ref :</span>
              <p className="text-sm text-gray-900">{invoiceData.paymentRef}</p>
            </div>
            <div>
              <span className="text-sm text-gray-700">Total Items/Qty :</span>
              <p className="text-sm text-gray-900">{invoiceData.totalItems}</p>
            </div>
            <div>
              <span className="text-sm text-gray-700">A mount in words :</span>
              <p className="text-sm text-gray-900">{invoiceData.amountInWords}</p>
            </div>
            <div className="flex gap-4 mt-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                  <span className="text-lg">📄</span>
                </div>
                <span className="text-xs text-gray-600">Invoice</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                  <span className="text-lg">📦</span>
                </div>
                <span className="text-xs text-gray-600">AWB</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                  <span className="text-lg">📋</span>
                </div>
                <span className="text-xs text-gray-600">SB</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-700">Taxable Amount :</span>
              <p className="text-sm text-gray-900">₹ {invoiceData.taxableAmount}</p>
            </div>
            <div>
              <span className="text-sm text-gray-700">IGST :</span>
              <p className="text-sm text-gray-900">₹ {invoiceData.igst}</p>
            </div>
            <div>
              <span className="text-sm text-gray-700 font-semibold">Total :</span>
              <p className="text-lg text-gray-900 font-bold">₹ {invoiceData.total}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button className="bg-gray-900 text-white px-6 py-2 rounded text-sm hover:bg-gray-800 font-medium">
            Add/ Edit Shipping Details
          </button>
          <button className="bg-red-500 text-white px-6 py-2 rounded text-sm hover:bg-red-600 font-medium">
            Cancel Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
