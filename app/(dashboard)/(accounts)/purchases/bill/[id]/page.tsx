"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Download, CloudUpload } from "lucide-react";

export default function PurchaseBillDetailPage() {
  const params = useParams();
  
  const billData = {
    billNo: "TI/P/25-26/1",
    orderId: "TI/1110",
    vendorName: "Sanwaliya Enterprise",
    vendorEmail: "vendor@sanwaliya.com",
    vendorMobile: "+91 98765 43210",
    shippingAddress: {
      line1: "123 Vendor Street",
      line2: "Business District",
      line3: "City",
      line4: "State - 123456"
    },
    billingAddress: {
      line1: "456 Billing Address",
      line2: "Commercial Area",
      line3: "City",
      line4: "State - 654321"
    },
    billDate: "21/05/2025",
    currency: "INR",
    exchangeRate: "1",
    payment: "Bank Transfer",
    items: [
      { 
        id: 1,
        name: "Product A", 
        qty: "20", 
        hsn: "30049011", 
        gst: "05%", 
        rate: "150.00", 
        discount: "5%", 
        dRate: "142.50", 
        amount: "2850.00" 
      },
      { 
        id: 2,
        name: "Product B", 
        qty: "10", 
        hsn: "30049011", 
        gst: "12%", 
        rate: "200.00", 
        discount: "0%", 
        dRate: "200.00", 
        amount: "2000.00" 
      }
    ],
    paymentRef: "kjsdhkjsdhkjsdhkjsdhkjsd123456",
    totalItems: "2/30",
    amountInWords: "Four Thousand Eight Hundred And Fifty Rupees",
    taxableAmount: "4,850.00",
    igst: "582.00",
    total: "5432.00"
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <Link href="/purchases" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium">
            <span>←</span>
            <span>Purchases/{billData.billNo}</span>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Purchase Bill Details</h1>
          <div className="text-blue-600 font-medium text-sm">Bill Id # {billData.orderId}</div>
        </div>
      </div>

      <div className="p-6">
        {/* Vendor Details Section */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {/* Left Column - Vendor Info */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <span className="text-sm text-gray-700">Vendor Name :</span>
              <p className="text-sm text-gray-900 font-medium">{billData.vendorName}</p>
            </div>
            <div className="flex gap-2">
              <span className="text-sm text-gray-700">Email :</span>
              <p className="text-sm text-gray-900">{billData.vendorEmail}</p>
            </div>
            <div className="flex gap-2">
              <span className="text-sm text-gray-700">Mobile # :</span>
              <p className="text-sm text-gray-900">{billData.vendorMobile}</p>
            </div>
            <div className="flex gap-2">
              <span className="text-sm text-gray-700">Payment :</span>
              <p className="text-sm text-gray-900 font-medium">{billData.payment}</p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-700 font-medium">Shipping Address :</span>
              <div className="text-sm text-gray-900 space-y-1">
                <p>{billData.shippingAddress.line1}</p>
                <p>{billData.shippingAddress.line2}</p>
                <p>{billData.shippingAddress.line3}</p>
                <p>{billData.shippingAddress.line4}</p>
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-700 font-medium">Billing Address :</span>
              <div className="text-sm text-gray-900 space-y-1">
                <p>{billData.billingAddress.line1}</p>
                <p>{billData.billingAddress.line2}</p>
                <p>{billData.billingAddress.line3}</p>
                <p>{billData.billingAddress.line4}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Bill Details */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <span className="text-sm text-gray-700">Purchase Date :</span>
              <p className="text-sm text-gray-900">{billData.billDate}</p>
            </div>
            <div className="flex gap-2">
              <span className="text-sm text-gray-700">Currency :</span>
              <p className="text-sm text-gray-900">{billData.currency}</p>
            </div>
            <div className="flex gap-2">
              <span className="text-sm text-gray-700">Exchange Rate :</span>
              <p className="text-sm text-gray-900">{billData.exchangeRate}</p>
            </div>
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
                  <th className="text-center py-2 px-2 text-gray-700 font-semibold">#</th>
                  <th className="text-center py-2 px-2 text-gray-700 font-semibold">Product Name</th>
                  <th className="text-center py-2 px-2 text-gray-700 font-semibold">Qty</th>
                  <th className="text-center py-2 px-2 text-gray-700 font-semibold">HSN</th>
                  <th className="text-center py-2 px-2 text-gray-700 font-semibold">GST %</th>
                  <th className="text-center py-2 px-2 text-gray-700 font-semibold">Rate</th>
                  <th className="text-center py-2 px-2 text-gray-700 font-semibold">Discount</th>
                  <th className="text-center py-2 px-2 text-gray-700 font-semibold">D. Rate</th>
                  <th className="text-center py-2 px-2 text-gray-700 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {billData.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="py-2 px-2 text-gray-900 text-center">{item.id}</td>
                    <td className="py-2 px-2 text-gray-900 text-center">{item.name}</td>
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
              <p className="text-sm text-gray-900 inline ml-2">{billData.paymentRef}</p>
            </div>
            <div>
              <span className="text-sm text-gray-700">Total Items/Qty :</span>
              <p className="text-sm text-gray-900 inline ml-2">{billData.totalItems}</p>
            </div>
            <div>
              <span className="text-sm text-gray-700">A mount in words :</span>
              <p className="text-sm text-gray-900 inline ml-2">{billData.amountInWords}</p>
            </div>
            <div className="flex gap-4 mt-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                  <Download size={20} className="text-gray-700" />
                </div>
                <span className="text-xs text-gray-600">Bill</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3 flex flex-col">
            <div className="text-right flex flex-col">
              <div className="flex justify-end gap-2">
                <span className="text-sm text-gray-700">Taxable Amount :</span>
                <p className="text-sm text-gray-900 font-semibold">₹ {billData.taxableAmount}</p>
              </div>
            </div>
            <div className="text-right flex flex-col">
              <div className="flex justify-end gap-2">
                <span className="text-sm text-gray-700">IGST :</span>
                <p className="text-sm text-gray-900 font-semibold">₹ {billData.igst}</p>
              </div>
            </div>
            <div className="text-right flex flex-col">
              <div className="flex justify-end gap-2">
                <span className="text-sm text-gray-700 font-semibold">Total :</span>
                <p className="text-lg text-gray-900 font-bold">₹ {billData.total}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <Link href={`/purchases/create?edit=true`} className="bg-blue-900 text-white px-8 py-2 rounded-lg hover:bg-blue-800 font-medium inline-block">
                Edit Bill
              </Link>
              <button className="bg-red-500 text-white px-8 py-2 rounded-lg hover:bg-red-600 font-medium">
                Cancel Bill
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
