 "use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faFileAlt,
  faClipboard,
  faPencilAlt,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceIndex = parseInt(params.id as string) - 1;
  
  // Sample transaction data (should match the data from sales page)
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
    }
  ];
  
  const selectedTransaction = transactionData[invoiceIndex] || transactionData[0];
  const invoiceId = selectedTransaction.invoiceNo;

  const invoiceData = {
    id: invoiceId,
    orderId: selectedTransaction.refNo,
    customer: {
      name: selectedTransaction.buyerName,
      email: "kgmarfitsyna@gmail.com",
      mobile: "+1 719 259 3091"
    },
    shippingAddress: {
      line1: "68 Lady Hay Road",
      city: "Leicester",
      postalCode: "LE3 9SJ",
      country: "United Kingdom"
    },
    billingAddress: {
      line1: "1 Kiln Orchard Way",
      city: "Birstall, Leicester",
      postalCode: "LE4 3NT",
      country: "United Kingdom"
    },
    invoiceDate: "21/05/2025",
    currency: "INR",
    exchangeRate: "1",
    exportType: "Export with IGST",
    port: "INBOM4",
    logistics: "DHL Express",
    awb: "RY426034563IN",
    shippingBill: "524566",
    sbDate: "21/05/2025",
    egm: "0003695",
    payment: "RazorPay",
    items: [
      {
        id: 1,
        name: "Himalaya Liv.52 Tablet",
        qty: 10,
        hsn: "30049011",
        gst: "05%",
        rate: 220.00,
        discount: "10%",
        dRate: 198.00,
        amount: 1980.00
      },
      {
        id: 2,
        name: "Baidyanath Prahakarvati 20 Tablet",
        qty: 5,
        hsn: "30049011",
        gst: "12%",
        rate: 120.00,
        discount: "10%",
        dRate: 108.00,
        amount: 540.00
      }
    ],
    paymentRef: "ekjfejkdhkjhkajsdnjkjd587845155kjbkajsb",
    totalItems: "2/15",
    amountInWords: "Two Thousand Five Hundred And Twenty Rupees",
    taxableAmount: 2367.86,
    igst: 2367.86,
    total: 2520.00
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/pages/sales" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <span>←</span>
              <span>Sales/{invoiceId}</span>
            </Link>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Sales Invoice Details</h1>
          <div className="text-blue-600 font-medium">Order Id # {invoiceData.orderId}</div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="p-6">
        {/* Customer and Invoice Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Customer Info */}
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Name : <span className="text-gray-900 font-medium">{invoiceData.customer.name}</span></p>
              <p className="text-sm text-gray-600">Email : <span className="text-gray-900">{invoiceData.customer.email}</span></p>
              <p className="text-sm text-gray-600">Mobile # <span className="text-gray-900">{invoiceData.customer.mobile}</span></p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment : <span className="text-gray-900 font-medium">{invoiceData.payment}</span></p>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Shipping Address :</p>
            <div className="text-sm text-gray-900">
              <p>{invoiceData.shippingAddress.line1}</p>
              <p>{invoiceData.shippingAddress.city}</p>
              <p>{invoiceData.shippingAddress.postalCode}</p>
              <p>{invoiceData.shippingAddress.country}</p>
            </div>
          </div>

          {/* Billing Address */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Billing Address :</p>
            <div className="text-sm text-gray-900">
              <p>{invoiceData.billingAddress.line1}</p>
              <p>{invoiceData.billingAddress.city}</p>
              <p>{invoiceData.billingAddress.postalCode}</p>
              <p>{invoiceData.billingAddress.country}</p>
            </div>
          </div>

          {/* Invoice Details */}
          <div>
            <p className="text-sm text-gray-600">Invoice Date : <span className="text-gray-900">{invoiceData.invoiceDate}</span></p>
            <p className="text-sm text-gray-600">Invoice Currency : <span className="text-gray-900">{invoiceData.currency}</span></p>
            <p className="text-sm text-gray-600">Exchange Rate : <span className="text-gray-900">{invoiceData.exchangeRate}</span></p>
            <p className="text-sm text-gray-600">Export Type :</p>
            <p className="text-sm text-gray-900">{invoiceData.exportType}</p>
          </div>
        </div>

        {/* Shipping Details */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-6 text-sm">
            <span className="text-gray-600">Port : <span className="text-gray-900 font-medium">{invoiceData.port}</span></span>
            <span className="text-gray-600">Logistics : <span className="text-gray-900 font-medium">{invoiceData.logistics}</span></span>
            <span className="text-gray-600">AWB : <span className="text-blue-600 font-medium">{invoiceData.awb}</span></span>
            <span className="text-gray-600">Shipping Bill : <span className="text-gray-900 font-medium">{invoiceData.shippingBill}</span></span>
            <span className="text-gray-600">SB Date : <span className="text-gray-900 font-medium">{invoiceData.sbDate}</span></span>
            <span className="text-gray-600">EGM : <span className="text-gray-900 font-medium">{invoiceData.egm}</span></span>
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
              {invoiceData.items.map((item, index) => (
                <tr key={item.id}>
                  <td className="px-3 py-2 border border-gray-300">{index + 1}</td>
                  <td className="px-3 py-2 border border-gray-300 font-medium">{item.name}</td>
                  <td className="px-3 py-2 text-center border border-gray-300">{item.qty}</td>
                  <td className="px-3 py-2 text-center border border-gray-300">{item.hsn}</td>
                  <td className="px-3 py-2 text-center border border-gray-300">{item.gst}</td>
                  <td className="px-3 py-2 text-right border border-gray-300">₹ {item.rate.toFixed(2)}</td>
                  <td className="px-3 py-2 text-center border border-gray-300">{item.discount}</td>
                  <td className="px-3 py-2 text-right border border-gray-300">₹ {item.dRate.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right border border-gray-300 font-medium">₹ {item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment and Total Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Payment Ref : <span className="text-gray-900 font-mono text-xs">{invoiceData.paymentRef}</span></p>
            <p className="text-sm text-gray-600">Total Items/Qty : <span className="text-gray-900 font-medium">{invoiceData.totalItems}</span></p>
            <p className="text-sm text-gray-600">Amount in words : <span className="text-gray-900 font-medium">{invoiceData.amountInWords}</span></p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Taxable Amount : <span className="text-gray-900 font-medium">₹ {invoiceData.taxableAmount.toFixed(2)}</span></p>
            <p className="text-sm text-gray-600">IGST : <span className="text-gray-900 font-medium">₹ {invoiceData.igst.toFixed(2)}</span></p>
            <p className="text-lg font-semibold text-gray-900">Total : <span className="text-xl">₹ {invoiceData.total.toFixed(2)}</span></p>
          </div>
        </div>

        {/* Action Buttons and Icons */}
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <div className="text-sm text-gray-600">Invoice</div>
            <div className="text-sm text-gray-600">AWB</div>
            <div className="text-sm text-gray-600">SB</div>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/pages/sales/create?edit=true"
              className="bg-blue-900 text-white px-4 py-2 rounded text-sm hover:bg-blue-950 flex items-center gap-2 transition-colors"
            >
              <FontAwesomeIcon icon={faPencilAlt} className="h-4 w-4" />
              Add/ Edit Shipping Details
            </Link>
            <button className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 flex items-center gap-2 transition-colors">
              <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
              Cancel Invoice
            </button>
          </div>
        </div>

        {/* Download Icons */}
        <div className="flex gap-4 mt-4">
          <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-900" title="Clock">
            <FontAwesomeIcon icon={faClock} className="h-5 w-5" />
          </button>
          <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-900" title="Document">
            <FontAwesomeIcon icon={faFileAlt} className="h-5 w-5" />
          </button>
          <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-900" title="Clipboard">
            <FontAwesomeIcon icon={faClipboard} className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}