"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function CreateInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editMode = searchParams.get('edit') === 'true';
  
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerMobile: "",
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
    invoiceDate: "",
    invoiceCurrency: "",
    exchangeRate: "",
    exportType: "",
    payment: "",
    logistics: "",
    awb: "",
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
        logistics: "DHL Express",
        awb: "RY426034563IN",
        items: [
          { name: "Himalaya Liv.52 Tablet", qty: "10", hsn: "30049011", gst: "05%", rate: "220.00", discount: "10%", dRate: "198.00", amount: "1980.00" },
          { name: "Baidyanath Prahakarvati 20 Tablet", qty: "5", hsn: "30049011", gst: "12%", rate: "120.00", discount: "10%", dRate: "108.00", amount: "540.00" }
        ],
        paymentRef: "ekjfejkdhkjhkajsdnjkjd587845155kjbkajsb",
        totalItems: "2/15",
        amountInWords: "Two Thousand Five Hundred And Twenty Rupees",
        taxableAmount: "2367.86",
        igst: "2367.86",
        total: "2520.00"
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
    console.log("Saving/Updating invoice:", formData);
    router.push("/sales");
  };

  const handleSaveAsDraft = () => {
    console.log("Saving as draft:", formData);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <Link href="/sales" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium">
            <span>←</span>
            <span>Sales</span>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Create Invoice</h1>
          <div className="text-blue-600 font-medium text-sm">Order Id #</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {/* Customer Details Section */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {/* Left Column - Customer Info */}
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-700">Name :</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full border-b border-gray-400 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Email :</label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                className="w-full border-b border-gray-400 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Mobile # :</label>
              <input
                type="text"
                value={formData.customerMobile}
                onChange={(e) => setFormData({ ...formData, customerMobile: e.target.value })}
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
                <option value="RazorPay">RazorPay</option>
                <option value="Bank Transfer">Bank Transfer</option>
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

          {/* Right Column - Invoice Details */}
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-700">Invoice Date :</label>
              <input
                type="text"
                value={formData.invoiceDate}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                className="w-full border-b border-gray-400 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1"
                
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Invoice Currency :</label>
              <select
                value={formData.invoiceCurrency}
                onChange={(e) => setFormData({ ...formData, invoiceCurrency: e.target.value })}
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
            <div>
              <label className="text-sm text-gray-700">Export Type :</label>
              <select
                value={formData.exportType}
                onChange={(e) => setFormData({ ...formData, exportType: e.target.value })}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 bg-gray-50 hover:bg-gray-100"
              >
                <option value="">Select &gt;</option>
                <option value="Export with IGST">Export with IGST</option>
                <option value="Export without IGST">Export without IGST</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Product Details :-</h2>
            <div className="flex gap-4">
              <div>
                <label className="text-sm text-gray-700">Logistics :</label>
                <select
                  value={formData.logistics}
                  onChange={(e) => setFormData({ ...formData, logistics: e.target.value })}
                  className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 bg-gray-50 hover:bg-gray-100"
                >
                  <option value="">Select &gt;</option>
                  <option value="DHL Express">DHL Express</option>
                  <option value="FedEx">FedEx</option>
                  <option value="UPS">UPS</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-700">AWB :</label>
                <input
                  type="text"
                  value={formData.awb}
                  onChange={(e) => setFormData({ ...formData, awb: e.target.value })}
                  className="border-b border-gray-400 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1 px-1"
                  
                />
              </div>
            </div>
          </div>

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
                {formData.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-2 px-2 text-gray-900">{index + 1}</td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        className="w-full border-b border-gray-300 focus:border-blue-500 outline-none text-sm bg-transparent"
                        
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.qty}
                        onChange={(e) => updateItem(index, 'qty', e.target.value)}
                        className="w-full border-b border-gray-300 focus:border-blue-500 outline-none text-sm bg-transparent text-center"
                        
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.hsn}
                        onChange={(e) => updateItem(index, 'hsn', e.target.value)}
                        className="w-full border-b border-gray-300 focus:border-blue-500 outline-none text-sm bg-transparent text-center"
                        
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.gst}
                        onChange={(e) => updateItem(index, 'gst', e.target.value)}
                        className="w-full border-b border-gray-300 focus:border-blue-500 outline-none text-sm bg-transparent text-center"
                        
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', e.target.value)}
                        className="w-full border-b border-gray-300 focus:border-blue-500 outline-none text-sm bg-transparent text-center"
                        
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.discount}
                        onChange={(e) => updateItem(index, 'discount', e.target.value)}
                        className="w-full border-b border-gray-300 focus:border-blue-500 outline-none text-sm bg-transparent text-center"
                        
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.dRate}
                        onChange={(e) => updateItem(index, 'dRate', e.target.value)}
                        className="w-full border-b border-gray-300 focus:border-blue-500 outline-none text-sm bg-transparent text-center"
                        
                      />
                    </td>
                    <td className="py-2 px-2">
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
              className="bg-gray-900 text-white px-4 py-2 rounded text-sm hover:bg-gray-800 font-medium"
            >
              Add Item
            </button>
          </div>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Left Column */}
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-700">Payment Ref :</label>
              <input
                type="text"
                value={formData.paymentRef}
                onChange={(e) => setFormData({ ...formData, paymentRef: e.target.value })}
                className="w-full border-b border-gray-400 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1"
                
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Total Items/Qty :</label>
              <input
                type="text"
                value={formData.totalItems}
                onChange={(e) => setFormData({ ...formData, totalItems: e.target.value })}
                className="w-full border-b border-gray-400 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1"
                
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">A mount in words :</label>
              <input
                type="text"
                value={formData.amountInWords}
                onChange={(e) => setFormData({ ...formData, amountInWords: e.target.value })}
                className="w-full border-b border-gray-400 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1"
                
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">AWB</label>
              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mt-2">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-700">Taxable Amount :</label>
              <input
                type="text"
                value={formData.taxableAmount}
                onChange={(e) => setFormData({ ...formData, taxableAmount: e.target.value })}
                className="w-full border-b border-gray-400 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1"
                
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">IGST :</label>
              <input
                type="text"
                value={formData.igst}
                onChange={(e) => setFormData({ ...formData, igst: e.target.value })}
                className="w-full border-b border-gray-400 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1"
                
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Total :</label>
              <input
                type="text"
                value={formData.total}
                onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                className="w-full border-b border-gray-400 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1"
                
              />
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-between items-center">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-xl">📄</span>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSaveAsDraft}
              className="bg-gray-900 text-white px-6 py-2 rounded text-sm hover:bg-gray-800 font-medium"
            >
              Save As Draft
            </button>
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-2 rounded text-sm hover:bg-green-600 font-medium"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
