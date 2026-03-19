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
    currency: "",
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

  // Pre-populate form data when in edit mode
  useEffect(() => {
    if (editMode) {
      // Sample data for editing (in a real app, this would come from an API or props)
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
        currency: "INR",
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

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving/Updating invoice:", formData);
    if (editMode) {
      console.log("Invoice updated successfully");
    } else {
      console.log("Invoice created successfully");
    }
    router.push("/pages/sales");
  };

  const handleSaveAsDraft = () => {
    console.log("Saving as draft:", formData);
    if (editMode) {
      console.log("Changes saved as draft");
    } else {
      console.log("Invoice saved as draft");
    }
    // In edit mode, this saves changes without finalizing
    // In create mode, this saves as draft
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/pages/sales" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <span>←</span>
              <span>Sales</span>
            </Link>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">
            {editMode ? "Edit Invoice" : "Create Invoice"}
          </h1>
          <div className="text-blue-600 font-medium">Order Id # ______</div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6">
        {/* Customer and Invoice Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Customer Info */}
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Name : 
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="ml-2 border-b border-gray-300 focus:border-blue-500 outline-none text-gray-900"
                  placeholder="____________________"
                />
              </p>
              <p className="text-sm text-gray-600 mb-1">Email : 
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="ml-2 border-b border-gray-300 focus:border-blue-500 outline-none text-gray-900"
                  placeholder="____________________"
                />
              </p>
              <p className="text-sm text-gray-600 mb-1">Mobile # 
                <input
                  type="tel"
                  value={formData.customerMobile}
                  onChange={(e) => setFormData({ ...formData, customerMobile: e.target.value })}
                  className="ml-2 border-b border-gray-300 focus:border-blue-500 outline-none text-gray-900"
                  placeholder="____________________"
                />
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment : 
                <select 
                  value={formData.payment}
                  onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
                  className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm bg-gray-100"
                >
                  <option value="">Select &gt;</option>
                  <option value="RazorPay">RazorPay</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </p>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Shipping Address :</p>
            <div className="space-y-1">
              <input
                type="text"
                value={formData.shippingAddress.line1}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  shippingAddress: { ...formData.shippingAddress, line1: e.target.value }
                })}
                className="w-full border-b border-gray-300 focus:border-blue-500 outline-none text-sm"
                placeholder="________________"
              />
              <input
                type="text"
                value={formData.shippingAddress.line2}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  shippingAddress: { ...formData.shippingAddress, line2: e.target.value }
                })}
                className="w-full border-b border-gray-300 focus:border-blue-500 outline-none text-sm"
                placeholder="________________"
              />
              <input
                type="text"
                value={formData.shippingAddress.line3}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  shippingAddress: { ...formData.shippingAddress, line3: e.target.value }
                })}
                className="w-full border-b border-gray-300 focus:border-blue-500 outline-none text-sm"
                placeholder="________________"
              />
              <input
                type="text"
                value={formData.shippingAddress.line4}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  shippingAddress: { ...formData.shippingAddress, line4: e.target.value }
                })}
                className="w-full border-b border-gray-300 focus:border-blue-500 outline-none text-sm"
                placeholder="________________"
              />
            </div>
          </div>

          {/* Billing Address */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Billing Address :</p>
            <div className="space-y-1">
              <input
                type="text"
                value={formData.billingAddress.line1}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  billingAddress: { ...formData.billingAddress, line1: e.target.value }
                })}
                className="w-full border-b border-gray-300 focus:border-blue-500 outline-none text-sm"
                placeholder="________________"
              />
              <input
                type="text"
                value={formData.billingAddress.line2}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  billingAddress: { ...formData.billingAddress, line2: e.target.value }
                })}
                className="w-full border-b border-gray-300 focus:border-blue-500 outline-none text-sm"
                placeholder="________________"
              />
              <input
                type="text"
                value={formData.billingAddress.line3}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  billingAddress: { ...formData.billingAddress, line3: e.target.value }
                })}
                className="w-full border-b border-gray-300 focus:border-blue-500 outline-none text-sm"
                placeholder="________________"
              />
              <input
                type="text"
                value={formData.billingAddress.line4}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  billingAddress: { ...formData.billingAddress, line4: e.target.value }
                })}
                className="w-full border-b border-gray-300 focus:border-blue-500 outline-none text-sm"
                placeholder="________________"
              />
            </div>
          </div>

          {/* Invoice Details */}
          <div>
            <p className="text-sm text-gray-600 mb-1">Invoice Date : 
              <input
                type="text"
                value={formData.invoiceDate}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                className="ml-2 border-b border-gray-300 focus:border-blue-500 outline-none text-gray-900"
                placeholder="__/__/__"
              />
            </p>
            <p className="text-sm text-gray-600 mb-1">Invoice Currency : 
              <select 
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm bg-gray-100"
              >
                <option value="">Select &gt;</option>
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </p>
            <p className="text-sm text-gray-600 mb-1">Exchange Rate : 
              <input
                type="text"
                value={formData.exchangeRate}
                onChange={(e) => setFormData({ ...formData, exchangeRate: e.target.value })}
                className="ml-2 border-b border-gray-300 focus:border-blue-500 outline-none text-gray-900"
                placeholder="____"
              />
            </p>
            <p className="text-sm text-gray-600 mb-1">Export Type :</p>
            <select 
              value={formData.exportType}
              onChange={(e) => setFormData({ ...formData, exportType: e.target.value })}
              className="border border-gray-300 rounded px-2 py-1 text-sm bg-gray-100"
            >
              <option value="">Select &gt;</option>
              <option value="Export with IGST">Export with IGST</option>
              <option value="Export without IGST">Export without IGST</option>
            </select>
          </div>
        </div>

        {/* Product Details and Logistics */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">Product Details :-</p>
            <div className="flex gap-4">
              <span className="text-sm text-gray-600">Logistics : 
                <select 
                  value={formData.logistics}
                  onChange={(e) => setFormData({ ...formData, logistics: e.target.value })}
                  className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm bg-gray-100"
                >
                  <option value="">Select &gt;</option>
                  <option value="DHL Express">DHL Express</option>
                  <option value="FedEx">FedEx</option>
                  <option value="UPS">UPS</option>
                </select>
              </span>
              <span className="text-sm text-gray-600">AWB : 
                <input
                  type="text"
                  value={formData.awb}
                  onChange={(e) => setFormData({ ...formData, awb: e.target.value })}
                  className="ml-2 border-b border-gray-300 focus:border-blue-500 outline-none text-gray-900"
                  placeholder="____________"
                />
              </span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <table className="w-full text-sm border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left border border-gray-300">#</th>
                <th className="px-3 py-2 text-left border border-gray-300">Product Name</th>
                <th className="px-3 py-2 text-center border border-gray-300">Qty</th>
                <th className="px-3 py-2 text-center border border-gray-300">HSN</th>
                <th className="px-3 py-2 text-center border border-gray-300">GST %</th>
                <th className="px-3 py-2 text-right border border-gray-300">Rate</th>
                <th className="px-3 py-2 text-center border border-gray-300">Discount</th>
                <th className="px-3 py-2 text-right border border-gray-300">D. Rate</th>
                <th className="px-3 py-2 text-right border border-gray-300">Amount</th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-3 py-2 border border-gray-300">{index + 1}</td>
                  <td className="px-3 py-2 border border-gray-300">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      className="w-full border-b border-gray-300 focus:border-blue-500 outline-none"
                      placeholder="_______________"
                    />
                  </td>
                  <td className="px-3 py-2 text-center border border-gray-300">
                    <input
                      type="text"
                      value={item.qty}
                      onChange={(e) => updateItem(index, 'qty', e.target.value)}
                      className="w-full text-center border-b border-gray-300 focus:border-blue-500 outline-none"
                      placeholder="__"
                    />
                  </td>
                  <td className="px-3 py-2 text-center border border-gray-300">
                    <input
                      type="text"
                      value={item.hsn}
                      onChange={(e) => updateItem(index, 'hsn', e.target.value)}
                      className="w-full text-center border-b border-gray-300 focus:border-blue-500 outline-none"
                      placeholder="______"
                    />
                  </td>
                  <td className="px-3 py-2 text-center border border-gray-300">
                    <input
                      type="text"
                      value={item.gst}
                      onChange={(e) => updateItem(index, 'gst', e.target.value)}
                      className="w-full text-center border-b border-gray-300 focus:border-blue-500 outline-none"
                      placeholder="___"
                    />
                  </td>
                  <td className="px-3 py-2 text-right border border-gray-300">
                    <input
                      type="text"
                      value={item.rate}
                      onChange={(e) => updateItem(index, 'rate', e.target.value)}
                      className="w-full text-right border-b border-gray-300 focus:border-blue-500 outline-none"
                      placeholder="_____"
                    />
                  </td>
                  <td className="px-3 py-2 text-center border border-gray-300">
                    <input
                      type="text"
                      value={item.discount}
                      onChange={(e) => updateItem(index, 'discount', e.target.value)}
                      className="w-full text-center border-b border-gray-300 focus:border-blue-500 outline-none"
                      placeholder="__"
                    />
                  </td>
                  <td className="px-3 py-2 text-right border border-gray-300">
                    <input
                      type="text"
                      value={item.dRate}
                      onChange={(e) => updateItem(index, 'dRate', e.target.value)}
                      className="w-full text-right border-b border-gray-300 focus:border-blue-500 outline-none"
                      placeholder="_____"
                    />
                  </td>
                  <td className="px-3 py-2 text-right border border-gray-300">
                    <input
                      type="text"
                      value={item.amount}
                      onChange={(e) => updateItem(index, 'amount', e.target.value)}
                      className="w-full text-right border-b border-gray-300 focus:border-blue-500 outline-none"
                      placeholder="______"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="mt-4 text-right">
            <button
              type="button"
              onClick={addItem}
              className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
            >
              Add Item
            </button>
          </div>
        </div>

        {/* Payment and Total Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Payment Ref : 
              <input
                type="text"
                value={formData.paymentRef}
                onChange={(e) => setFormData({ ...formData, paymentRef: e.target.value })}
                className="ml-2 border-b border-gray-300 focus:border-blue-500 outline-none text-gray-900"
                placeholder="________________________________"
              />
            </p>
            <p className="text-sm text-gray-600 mb-2">Total Items/Qty : 
              <input
                type="text"
                value={formData.totalItems}
                onChange={(e) => setFormData({ ...formData, totalItems: e.target.value })}
                className="ml-2 border-b border-gray-300 focus:border-blue-500 outline-none text-gray-900"
                placeholder=""
              />
            </p>
            <p className="text-sm text-gray-600 mb-2">Amount in words : 
              <input
                type="text"
                value={formData.amountInWords}
                onChange={(e) => setFormData({ ...formData, amountInWords: e.target.value })}
                className="ml-2 border-b border-gray-300 focus:border-blue-500 outline-none text-gray-900 w-full"
                placeholder=""
              />
            </p>
            <p className="text-sm text-gray-600">AWB</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-2">Taxable Amount : 
              <input
                type="text"
                value={formData.taxableAmount}
                onChange={(e) => setFormData({ ...formData, taxableAmount: e.target.value })}
                className="ml-2 border-b border-gray-300 focus:border-blue-500 outline-none text-gray-900"
                placeholder=""
              />
            </p>
            <p className="text-sm text-gray-600 mb-2">IGST : 
              <input
                type="text"
                value={formData.igst}
                onChange={(e) => setFormData({ ...formData, igst: e.target.value })}
                className="ml-2 border-b border-gray-300 focus:border-blue-500 outline-none text-gray-900"
                placeholder=""
              />
            </p>
            <p className="text-lg font-semibold text-gray-900">Total : 
              <input
                type="text"
                value={formData.total}
                onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                className="ml-2 border-b border-gray-300 focus:border-blue-500 outline-none text-gray-900 text-xl font-bold"
                placeholder=""
              />
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-xl">📄</span>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSaveAsDraft}
              className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
            >
              Save As Draft
            </button>
            <button
              type="submit"
              className="bg-green-100 text-green-600 border-2 border-green-600 px-6 py-2 rounded-full text-sm hover:bg-green-200 font-medium"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}