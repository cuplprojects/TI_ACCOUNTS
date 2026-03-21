"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CloudUpload } from "lucide-react";

export default function CreatePurchasePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editMode = searchParams.get('edit') === 'true';
  
  const [formData, setFormData] = useState({
    vendorName: "",
    vendorEmail: "",
    vendorMobile: "",
    shippingAddress: {
      line1: "",
      line2: "",
      line3: "",
      line4: ""
    },
    billingAddress: {
      line1: "",
      line2: "",
      line3: "",
      line4: ""
    },
    billDate: "",
    billCurrency: "",
    exchangeRate: "",
    payment: "",
    items: [
      { name: "", qty: "", hsn: "", gst: "", rate: "", discount: "", dRate: "", amount: "" }
    ],
    paymentRef: "",
    totalItems: "",
    amountInWords: "",
    taxableAmount: "",
    igst: "",
    total: ""
  });

  useEffect(() => {
    if (editMode) {
      setFormData({
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
        billCurrency: "INR",
        exchangeRate: "1",
        payment: "Bank Transfer",
        items: [
          { name: "Product A", qty: "20", hsn: "30049011", gst: "05%", rate: "150.00", discount: "5%", dRate: "142.50", amount: "2850.00" },
          { name: "Product B", qty: "10", hsn: "30049011", gst: "12%", rate: "200.00", discount: "0%", dRate: "200.00", amount: "2000.00" }
        ],
        paymentRef: "kjsdhkjsdhkjsdhkjsdhkjsd123456",
        totalItems: "2/30",
        amountInWords: "Four Thousand Eight Hundred And Fifty Rupees",
        taxableAmount: "4850.00",
        igst: "582.00",
        total: "5432.00"
      });
    }
  }, [editMode]);

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: "", qty: "", hsn: "", gst: "", rate: "", discount: "", dRate: "", amount: "" }]
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving/Updating purchase:", formData);
    router.push("/purchases");
  };

  const handleSaveAsDraft = () => {
    console.log("Saving as draft:", formData);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <Link href="/purchases" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium">
            <span>←</span>
            <span>Purchases</span>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">{editMode ? 'Edit Purchase Bill' : 'Create Purchase Bill'}</h1>
          <div className="text-blue-600 font-medium text-sm">Bill Id #</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {/* Vendor Details Section */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {/* Left Column - Vendor Info */}
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-700">Vendor Name :</label>
              <input
                type="text"
                value={formData.vendorName}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                className="w-full border-b border-gray-400 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Email :</label>
              <input
                type="email"
                value={formData.vendorEmail}
                onChange={(e) => setFormData({ ...formData, vendorEmail: e.target.value })}
                className="w-full border-b border-gray-400 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Mobile # :</label>
              <input
                type="text"
                value={formData.vendorMobile}
                onChange={(e) => setFormData({ ...formData, vendorMobile: e.target.value })}
                className="w-full border-b border-gray-400 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Payment :</label>
              <select
                value={formData.payment}
                onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 bg-gray-50 hover:bg-gray-100"
              >
                <option value="">Select &gt;</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-700 font-medium">Shipping Address :</label>
              <div className="space-y-2">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={formData.shippingAddress[`line${idx + 1}` as keyof typeof formData.shippingAddress]}
                    onChange={(e) => setFormData({
                      ...formData,
                      shippingAddress: { ...formData.shippingAddress, [`line${idx + 1}`]: e.target.value }
                    })}
                    className="w-full border-b border-gray-400 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-700 font-medium">Billing Address :</label>
              <div className="space-y-2">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={formData.billingAddress[`line${idx + 1}` as keyof typeof formData.billingAddress]}
                    onChange={(e) => setFormData({
                      ...formData,
                      billingAddress: { ...formData.billingAddress, [`line${idx + 1}`]: e.target.value }
                    })}
                    className="w-full border-b border-gray-400 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Bill Details */}
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-700">Purchase Date :</label>
              <input
                type="text"
                value={formData.billDate}
                onChange={(e) => setFormData({ ...formData, billDate: e.target.value })}
                className="w-full border-b border-gray-400 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Currency :</label>
              <select
                value={formData.billCurrency}
                onChange={(e) => setFormData({ ...formData, billCurrency: e.target.value })}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 bg-gray-50 hover:bg-gray-100"
              >
                <option value="">Select &gt;</option>
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-700">Exchange Rate :</label>
              <input
                type="text"
                value={formData.exchangeRate}
                onChange={(e) => setFormData({ ...formData, exchangeRate: e.target.value })}
                className="w-full border-b border-gray-400 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1"
              />
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Product Details :-</h2>
          </div>

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
                {formData.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-2 px-2 text-gray-900 text-center">{index + 1}</td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        className="w-full border-b border-gray-300 focus:border-blue-500 outline-none text-sm bg-transparent text-center"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="text"
                        value={item.qty}
                        onChange={(e) => updateItem(index, 'qty', e.target.value)}
                        className="w-full border-b border-gray-300 focus:border-blue-500 outline-none text-sm bg-transparent text-center"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="text"
                        value={item.hsn}
                        onChange={(e) => updateItem(index, 'hsn', e.target.value)}
                        className="w-full border-b border-gray-300 focus:border-blue-500 outline-none text-sm bg-transparent text-center"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="text"
                        value={item.gst}
                        onChange={(e) => updateItem(index, 'gst', e.target.value)}
                        className="w-full border-b border-gray-300 focus:border-blue-500 outline-none text-sm bg-transparent text-center"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="text"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', e.target.value)}
                        className="w-full border-b border-gray-300 focus:border-blue-500 outline-none text-sm bg-transparent text-center"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="text"
                        value={item.discount}
                        onChange={(e) => updateItem(index, 'discount', e.target.value)}
                        className="w-full border-b border-gray-300 focus:border-blue-500 outline-none text-sm bg-transparent text-center"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="text"
                        value={item.dRate}
                        onChange={(e) => updateItem(index, 'dRate', e.target.value)}
                        className="w-full border-b border-gray-300 focus:border-blue-500 outline-none text-sm bg-transparent text-center"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="text"
                        value={item.amount}
                        onChange={(e) => updateItem(index, 'amount', e.target.value)}
                        className="w-full border-b border-gray-300 focus:border-blue-500 outline-none text-sm bg-transparent text-center"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={addItem}
              className="bg-blue-900 text-white px-8 py-2 rounded-lg hover:bg-blue-800 font-medium"
            >
              Add Item
            </button>
          </div>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Left Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Payment Ref :</label>
              <input
                type="text"
                value={formData.paymentRef}
                onChange={(e) => setFormData({ ...formData, paymentRef: e.target.value })}
                className="flex-1 border-b border-gray-400 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Total Items/Qty :</label>
              <input
                type="text"
                value={formData.totalItems}
                onChange={(e) => setFormData({ ...formData, totalItems: e.target.value })}
                className="flex-1 border-b border-gray-400 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">A mount in words :</label>
              <input
                type="text"
                value={formData.amountInWords}
                onChange={(e) => setFormData({ ...formData, amountInWords: e.target.value })}
                className="flex-1 border-b border-gray-400 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1"
              />
            </div>
            <div className="flex gap-4 mt-5 pt-2">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  <CloudUpload size={24} className="text-gray-700" strokeWidth={1.5} />
                </div>
                <span className="text-xs text-gray-600 font-medium">Bill</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3 flex flex-col">
            <div className="flex items-center gap-2 justify-end">
              <label className="text-sm text-gray-700">Taxable Amount :</label>
              <input
                type="text"
                value={formData.taxableAmount}
                onChange={(e) => setFormData({ ...formData, taxableAmount: e.target.value })}
                className="w-32 border-b border-gray-400 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1 text-right"
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <label className="text-sm text-gray-700">IGST :</label>
              <input
                type="text"
                value={formData.igst}
                onChange={(e) => setFormData({ ...formData, igst: e.target.value })}
                className="w-32 border-b border-gray-400 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1 text-right"
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <label className="text-sm text-gray-700">Total :</label>
              <input
                type="text"
                value={formData.total}
                onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                className="w-32 border-b border-gray-400 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1 text-right"
              />
            </div>
            <div className="flex gap-3 mt-6 pt-2 justify-end">
              <button
                type="button"
                onClick={handleSaveAsDraft}
                className="bg-blue-900 text-white px-8 py-2 rounded-lg hover:bg-blue-800 font-medium"
              >
                Save As Draft
              </button>
              <button
                type="submit"
                className="bg-green-100 text-green-600 border-2 border-green-600 px-8 py-2 rounded-lg hover:bg-green-200 font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
