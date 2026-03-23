"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CloudUpload, Download } from "lucide-react";

export default function CreateInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editMode = searchParams.get('edit') === 'true';
  const invoiceId = searchParams.get('invoiceId') || '';
  const orderId = searchParams.get('orderId') || '';
  
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
    port: "",
    logistics: "",
    awb: "",
    shippingBill: "",
    sbDate: "",
    egm: "",
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
        port: "INBOM4",
        logistics: "DHL Express",
        awb: "RY426034563IN",
        shippingBill: "Be3Scul",
        sbDate: "N/A",
        egm: "0003695",
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
             {invoiceId && <span># {invoiceId}</span>}
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">{editMode ? 'Edit Invoice' : 'Create Invoice'}</h1>
          <div className="text-blue-600 font-medium text-sm">
            
            {orderId && <span className="ml-4">Order Id # {orderId}</span>}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {/* Customer Details Section */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {/* Left Column - Customer Info */}
          <div className="space-y-0.5">
            <span className="text-sm text-gray-700 font-medium">Customer Info :</span>
            <div className="text-sm text-gray-900 space-y-0.5">
              <div className="leading-snug flex gap-2">
                <span className="text-gray-700">Name:</span>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className={`flex-1 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1 ${editMode ? '' : 'border-b border-gray-400'}`}
                />
              </div>
              <div className="leading-snug flex gap-2">
                <span className="text-gray-700">Email:</span>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className={`flex-1 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1 ${editMode ? '' : 'border-b border-gray-400'}`}
                />
              </div>
              <div className="leading-snug flex gap-2">
                <span className="text-gray-700">Mobile:</span>
                <input
                  type="text"
                  value={formData.customerMobile}
                  onChange={(e) => setFormData({ ...formData, customerMobile: e.target.value })}
                  className={`flex-1 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1 ${editMode ? '' : 'border-b border-gray-400'}`}
                />
              </div>
              <div className="leading-snug flex gap-2">
                <span className="text-gray-700">Payment:</span>
                <select
                  value={formData.payment}
                  onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
                  className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 bg-white hover:bg-white"
                >
                  <option value="">Select &gt;</option>
                  <option value="RazorPay">RazorPay</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-0.5">
            <div>
              <span className="text-sm text-gray-700 font-medium">Shipping Address :</span>
              <div className="text-sm text-gray-900 space-y-0.5">
                {[0, 1, 2, 3].map((idx) => (
                  <div key={idx} className="leading-snug">
                    <input
                      type="text"
                      value={formData.shippingAddress[`line${idx + 1}` as keyof typeof formData.shippingAddress]}
                      onChange={(e) => setFormData({
                        ...formData,
                        shippingAddress: { ...formData.shippingAddress, [`line${idx + 1}`]: e.target.value }
                      })}
                      className={`w-full focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1 ${editMode ? '' : 'border-b border-gray-400'}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div className="space-y-0.5">
            <div>
              <span className="text-sm text-gray-700 font-medium">Billing Address :</span>
              <div className="text-sm text-gray-900 space-y-0.5">
                {[0, 1, 2, 3].map((idx) => (
                  <div key={idx} className="leading-snug">
                    <input
                      type="text"
                      value={formData.billingAddress[`line${idx + 1}` as keyof typeof formData.billingAddress]}
                      onChange={(e) => setFormData({
                        ...formData,
                        billingAddress: { ...formData.billingAddress, [`line${idx + 1}`]: e.target.value }
                      })}
                      className={`w-full focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1 ${editMode ? '' : 'border-b border-gray-400'}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Invoice Details */}
          <div className="space-y-0.5">
            <span className="text-sm text-gray-700 font-medium">Invoice Details :</span>
            <div className="text-sm text-gray-900 space-y-0.5">
              <div className="leading-snug flex gap-2">
                <span className="text-gray-700">Date:</span>
                <input
                  type="text"
                  value={formData.invoiceDate}
                  onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                  className={`flex-1 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1 ${editMode ? '' : 'border-b border-gray-400'}`}
                />
              </div>
              <div className="leading-snug flex gap-2">
                <span className="text-gray-700">Currency:</span>
                <select
                  value={formData.invoiceCurrency}
                  onChange={(e) => setFormData({ ...formData, invoiceCurrency: e.target.value })}
                  className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 bg-white hover:bg-white"
                >
                  <option value="">Select &gt;</option>
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div className="leading-snug flex gap-2">
                <span className="text-gray-700">Exchange Rate:</span>
                <input
                  type="text"
                  value={formData.exchangeRate}
                  onChange={(e) => setFormData({ ...formData, exchangeRate: e.target.value })}
                  className={`focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1 ${editMode ? '' : 'border-b border-gray-400'}`}
                />
              </div>
              <div className="leading-snug flex gap-2">
                <span className="text-gray-700">Export Type:</span>
                <select
                  value={formData.exportType}
                  onChange={(e) => setFormData({ ...formData, exportType: e.target.value })}
                  className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 bg-white hover:bg-white"
                >
                  <option value="">Select &gt;</option>
                  <option value="Export with IGST">Export with IGST</option>
                  <option value="Export without IGST">Export without IGST</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Logistics Info */}
        <div className="mb-8">
          <div className="flex gap-8 text-sm flex-wrap items-center">
            <div className="flex gap-2 items-center">
              <span className="text-gray-700 font-medium">Port :</span>
              <input
                type="text"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                className={`focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1 px-1 w-24 ${editMode ? '' : 'border-b border-gray-400'}`}
              />
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-gray-700 font-medium">Logistics :</span>
              <select
                value={formData.logistics}
                onChange={(e) => setFormData({ ...formData, logistics: e.target.value })}
                className="border border-gray-300 rounded px-2 py-1 text-xs text-gray-900 bg-white hover:bg-white"
              >
                <option value="">Select &gt;</option>
                <option value="DHL Express">DHL Express</option>
                <option value="FedEx">FedEx</option>
                <option value="UPS">UPS</option>
                <option value="shipglobaldirect">shipglobaldirect</option>
              </select>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-gray-700 font-medium">AWB :</span>
              <input
                type="text"
                value={formData.awb}
                onChange={(e) => setFormData({ ...formData, awb: e.target.value })}
                className={`focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1 px-1 w-32 ${editMode ? '' : 'border-b border-gray-400'}`}
              />
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-gray-700 font-medium">Shipping Bill :</span>
              <input
                type="text"
                value={formData.shippingBill}
                onChange={(e) => setFormData({ ...formData, shippingBill: e.target.value })}
                className={`focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1 px-1 w-24 ${editMode ? '' : 'border-b border-gray-400'}`}
              />
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-gray-700 font-medium">SB Date :</span>
              <input
                type="text"
                value={formData.sbDate}
                onChange={(e) => setFormData({ ...formData, sbDate: e.target.value })}
                className={`focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1 px-1 w-20 ${editMode ? '' : 'border-b border-gray-400'}`}
              />
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-gray-700 font-medium">EGM :</span>
              <input
                type="text"
                value={formData.egm}
                onChange={(e) => setFormData({ ...formData, egm: e.target.value })}
                className={`focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1 px-1 w-24 ${editMode ? '' : 'border-b border-gray-400'}`}
              />
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Product Details</h2>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-center py-2 px-2 text-gray-700 font-semibold">#</th>
                  <th className="text-left py-2 px-1 text-gray-700 font-semibold w-1/2">Product Name</th>
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
                    <td className="py-2 px-1 text-left">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        className={`w-full focus:border-blue-500 outline-none text-base bg-transparent text-left ${editMode ? '' : 'border-b border-gray-300'}`}
                        
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="text"
                        value={item.qty}
                        onChange={(e) => updateItem(index, 'qty', e.target.value)}
                        className={`w-full focus:border-blue-500 outline-none text-base bg-transparent text-center ${editMode ? '' : 'border-b border-gray-300'}`}
                        
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="text"
                        value={item.hsn}
                        onChange={(e) => updateItem(index, 'hsn', e.target.value)}
                        className={`w-full focus:border-blue-500 outline-none text-base bg-transparent text-center ${editMode ? '' : 'border-b border-gray-300'}`}
                        
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="text"
                        value={item.gst}
                        onChange={(e) => updateItem(index, 'gst', e.target.value)}
                        className={`w-full focus:border-blue-500 outline-none text-base bg-transparent text-center ${editMode ? '' : 'border-b border-gray-300'}`}
                        
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="text"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', e.target.value)}
                        className={`w-full focus:border-blue-500 outline-none text-base bg-transparent text-center ${editMode ? '' : 'border-b border-gray-300'}`}
                        
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="text"
                        value={item.discount}
                        onChange={(e) => updateItem(index, 'discount', e.target.value)}
                        className={`w-full focus:border-blue-500 outline-none text-base bg-transparent text-center ${editMode ? '' : 'border-b border-gray-300'}`}
                        
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="text"
                        value={item.dRate}
                        onChange={(e) => updateItem(index, 'dRate', e.target.value)}
                        className={`w-full focus:border-blue-500 outline-none text-base bg-transparent text-center ${editMode ? '' : 'border-b border-gray-300'}`}
                        
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="text"
                        value={item.amount}
                        onChange={(e) => updateItem(index, 'amount', e.target.value)}
                        className={`w-full focus:border-blue-500 outline-none text-base bg-transparent text-center ${editMode ? '' : 'border-b border-gray-300'}`}
                        
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
        <div className="flex gap-8 mb-8 items-start">
          {/* Left Column */}
          <div className="flex-1 space-y-2">
            <div className="flex gap-2 items-center">
              <span className="text-sm text-gray-700">Payment Ref :</span>
              <input
                type="text"
                value={formData.paymentRef}
                onChange={(e) => setFormData({ ...formData, paymentRef: e.target.value })}
                className={`flex-1 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1 ${editMode ? '' : 'border-b border-gray-400'}`}
              />
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-gray-700">Total Items/Qty :</span>
              <input
                type="text"
                value={formData.totalItems}
                onChange={(e) => setFormData({ ...formData, totalItems: e.target.value })}
                className={`flex-1 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1 ${editMode ? '' : 'border-b border-gray-400'}`}
              />
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-gray-700">A mount in words :</span>
              <input
                type="text"
                value={formData.amountInWords}
                onChange={(e) => setFormData({ ...formData, amountInWords: e.target.value })}
                className={`flex-1 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1 ${editMode ? '' : 'border-b border-gray-400'}`}
              />
            </div>
            <div className="flex gap-4 mt-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                  <Download size={20} className="text-gray-700" />
                </div>
                <span className="text-xs text-gray-600">Invoice</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                  <CloudUpload size={20} className="text-gray-700" />
                </div>
                <span className="text-xs text-gray-600">AWB</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                  <CloudUpload size={20} className="text-gray-700" />
                </div>
                <span className="text-xs text-gray-600">SB</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1 space-y-2 flex flex-col">
            <div className="flex justify-end gap-2 items-center">
              <span className="text-sm text-gray-700">Taxable Amount :</span>
              <input
                type="text"
                value={formData.taxableAmount}
                onChange={(e) => setFormData({ ...formData, taxableAmount: e.target.value })}
                className={`w-32 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1 text-right ${editMode ? '' : 'border-b border-gray-400'}`}
              />
            </div>
            <div className="flex justify-end gap-2 items-center">
              <span className="text-sm text-gray-700">IGST :</span>
              <input
                type="text"
                value={formData.igst}
                onChange={(e) => setFormData({ ...formData, igst: e.target.value })}
                className={`w-32 focus:border-blue-500 outline-none text-sm text-gray-900 bg-transparent py-1 text-right ${editMode ? '' : 'border-b border-gray-400'}`}
              />
            </div>
            <div className="flex justify-end gap-2 items-center">
              <span className="text-sm text-gray-700 font-semibold">Total :</span>
              <input
                type="text"
                value={formData.total}
                onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                className={`w-32 focus:border-blue-500 outline-none text-base text-gray-900 bg-transparent py-1 text-right font-bold ${editMode ? '' : 'border-b border-gray-400'}`}
              />
            </div>
            <div className="flex gap-3 mt-4 justify-end">
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
