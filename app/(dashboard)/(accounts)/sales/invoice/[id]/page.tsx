"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import accountsService from "@/lib/services/accountsService";
import TableSkeleton from "@/app/components/common/TableSkeleton";

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoiceData();
  }, [invoiceId]);

  const fetchInvoiceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await accountsService.getOrderDetails(invoiceId);

      if (response.success) {
        const order = response.data;
        
        console.log('Order data received:', order); // Debug log
        
        // Transform order data to invoice format
        const transformedData = {
          invoiceNo: order.OrderShipments?.[0]?.invoice_number || "N/A",
          orderId: order.orderNumber || order.id,
          customerName: order.User ? `${order.User.first_name} ${order.User.last_name}` : "N/A",
          customerEmail: order.User?.email || "N/A",
          customerMobile: order.User?.phone || "N/A",
          shippingAddress: {
            line1: order.shipping_address?.line1 || order.shipping_address?.address || "N/A",
            line2: order.shipping_address?.line2 || order.shipping_address?.city || "N/A",
            line3: order.shipping_address?.line3 || order.shipping_address?.state || "N/A",
            line4: order.shipping_address?.line4 || order.shipping_address?.country || "N/A"
          },
          billingAddress: {
            line1: order.billing_address?.line1 || order.billing_address?.address || "N/A",
            line2: order.billing_address?.line2 || order.billing_address?.city || "N/A",
            line3: order.billing_address?.line3 || order.billing_address?.state || "N/A",
            line4: order.billing_address?.line4 || order.billing_address?.country || "N/A"
          },
          invoiceDate: order.OrderShipments?.[0]?.invoice_date ? new Date(order.OrderShipments[0].invoice_date).toLocaleDateString() : new Date(order.createdAt).toLocaleDateString(),
          invoiceCurrency: order.Payment?.currency || "INR",
          exchangeRate: "1",
          exportType: "Export with IGST",
          payment: order.Payment?.gateway || "N/A",
          port: "INBOM4",
          logistics: order.shipping_carrier || "N/A",
          awb: order.OrderShipments?.[0]?.shippingOrderId || "N/A",
          shippingBill: order.OrderShipments?.[0]?.id?.substring(0, 6) || "N/A",
          sbDate: order.OrderShipments?.[0]?.invoice_date ? new Date(order.OrderShipments[0].invoice_date).toLocaleDateString() : "N/A",
          egm: "0003695",
          items: order.OrderItems?.map((item: any, idx: number) => {
            const unitPrice = parseFloat(item.unitPrice) || 0;
            const qty = parseInt(item.quantityRequested) || 0;
            return {
              id: idx + 1,
              name: item.Product?.title || item.name || "Product",
              qty: qty.toString(),
              hsn: "30049011",
              gst: "05%",
              rate: unitPrice.toFixed(2),
              discount: "0%",
              dRate: unitPrice.toFixed(2),
              amount: (qty * unitPrice).toFixed(2)
            };
          }) || [],
          paymentRef: order.Payment?.id || "N/A",
          totalItems: `${order.OrderItems?.length || 0}/${order.OrderItems?.reduce((sum: number, item: any) => sum + (parseInt(item.quantityRequested) || 0), 0) || 0}`,
          amountInWords: "Amount in words",
          taxableAmount: parseFloat(order.Payment?.amount || 0).toFixed(2),
          igst: parseFloat(order.tax || 0).toFixed(2),
          total: parseFloat(order.Payment?.amount || 0).toFixed(2)
        };

        console.log('Transformed data:', transformedData); // Debug log
        setInvoiceData(transformedData);
      } else {
        setError(response.message || "Failed to fetch invoice data");
      }
    } catch (err: any) {
      setError(err.message || "Error fetching invoice");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen p-6">
        <TableSkeleton rows={5} columns={9} />
      </div>
    );
  }

  if (error || !invoiceData) {
    return (
      <div className="bg-white min-h-screen p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error</p>
          <p className="text-red-600 text-sm">{error || "Invoice not found"}</p>
          <Link href="/sales" className="mt-2 inline-block text-blue-600 hover:text-blue-800 text-sm font-medium">
            ← Back to Sales
          </Link>
        </div>
      </div>
    );
  }

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
