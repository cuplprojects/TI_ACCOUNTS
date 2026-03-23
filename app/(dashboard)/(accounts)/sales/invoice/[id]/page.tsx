"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Download, CloudUpload } from "lucide-react";
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

      if (response.success && response.data) {
        const order = response.data as any;
        
        // Transform order data to invoice format
        const transformedData = {
          invoiceNo: order.invoice_number || order.OrderShipments?.[0]?.invoice_number || "N/A",
          orderId: order.orderNumber || order.id,
          customerName: order.User ? `${order.User.first_name} ${order.User.last_name}` : "N/A",
          customerEmail: order.User?.email || "N/A",
          customerMobile: order.User?.phone || "N/A",
          shippingAddress: {
            line1: order.shipping_address?.address_line_1 || order.shipping_address?.line1 || "N/A",
            line2: order.shipping_address?.city || order.shipping_address?.line2 || "N/A",
            line3: order.shipping_address?.state || order.shipping_address?.line3 || "N/A",
            line4: order.shipping_address?.country || order.shipping_address?.line4 || "N/A"
          },
          billingAddress: {
            line1: order.billing_address?.address_line_1 || order.billing_address?.line1 || "N/A",
            line2: order.billing_address?.city || order.billing_address?.line2 || "N/A",
            line3: order.billing_address?.state || order.billing_address?.line3 || "N/A",
            line4: order.billing_address?.country || order.billing_address?.line4 || "N/A"
          },
          invoiceDate: order.invoice_date ? new Date(order.invoice_date).toLocaleDateString() : new Date(order.createdAt).toLocaleDateString(),
          invoiceCurrency: order.Payment?.currency || "INR",
          exchangeRate: order.exchange_rate || "1",
          exportType: order.export_type || "Export with IGST",
          payment: order.Payment?.gateway || "N/A",
          port: order.port || "INBOM4",
          logistics: order.shipping_carrier || order.logistics || "N/A",
          awb: order.OrderShipments?.[0]?.shippingOrderId || order.awb || "N/A",
          shippingBill: order.OrderShipments?.[0]?.invoice_number || order.shipping_bill || "N/A",
          sbDate: order.OrderShipments?.[0]?.invoice_date ? new Date(order.OrderShipments[0].invoice_date).toLocaleDateString() : order.sb_date || "N/A",
          egm: order.egm || "0003695",
          items: order.OrderItems?.map((item: any, idx: number) => {
            const unitPrice = parseFloat(item.unitPrice) || 0;
            const qty = parseInt(item.quantityRequested) || 0;
            return {
              id: idx + 1,
              name: item.Product?.title || item.name || "Product",
              qty: qty.toString(),
              hsn: item.hsn || "30049011",
              gst: item.gst || "05%",
              rate: unitPrice.toFixed(2),
              discount: item.discount || "0%",
              dRate: (unitPrice * (1 - (parseFloat(item.discount || "0") / 100))).toFixed(2),
              amount: (qty * unitPrice * (1 - (parseFloat(item.discount || "0") / 100))).toFixed(2)
            };
          }) || [],
          paymentRef: order.Payment?.id || order.payment_ref || "N/A",
          totalItems: `${order.OrderItems?.length || 0}/${order.OrderItems?.reduce((sum: number, item: any) => sum + (parseInt(item.quantityRequested) || 0), 0) || 0}`,
          amountInWords: order.amount_in_words || "Amount in words",
          taxableAmount: (() => {
            const total = order.OrderItems?.reduce((sum: number, item: any) => {
              const unitPrice = parseFloat(item.unitPrice) || 0;
              const qty = parseInt(item.quantityRequested) || 0;
              const discount = parseFloat(item.discount || "0") / 100;
              return sum + (qty * unitPrice * (1 - discount));
            }, 0) || 0;
            return total.toFixed(2);
          })(),
          igst: order.igst || "0.00",
          total: (() => {
            const subtotal = order.OrderItems?.reduce((sum: number, item: any) => {
              const unitPrice = parseFloat(item.unitPrice) || 0;
              const qty = parseInt(item.quantityRequested) || 0;
              const discount = parseFloat(item.discount || "0") / 100;
              return sum + (qty * unitPrice * (1 - discount));
            }, 0) || 0;
            const igst = parseFloat(order.igst || "0");
            return (subtotal + igst).toFixed(2);
          })()
        };

        setInvoiceData(transformedData);
      } else {
        setError(response.message || "Invoice not found");
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
          <div className="space-y-0.5">
            <div>
              <span className="text-sm text-gray-700 font-medium">Customer Info :</span>
              <div className="text-sm text-gray-900 space-y-0.5">
                <p className="leading-snug"><span className="text-gray-700">Name:</span> {invoiceData.customerName}</p>
                <p className="leading-snug"><span className="text-gray-700">Email:</span> {invoiceData.customerEmail}</p>
                <p className="leading-snug"><span className="text-gray-700">Mobile:</span> {invoiceData.customerMobile}</p>
                <p className="leading-snug"><span className="text-gray-700">Payment:</span> {invoiceData.payment}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-0.5">
            <div>
              <span className="text-sm text-gray-700 font-medium">Shipping Address :</span>
              <div className="text-sm text-gray-900 space-y-0.5">
                <p className="leading-snug">{invoiceData.shippingAddress.line1}</p>
                <p className="leading-snug">{invoiceData.shippingAddress.line2}</p>
                <p className="leading-snug">{invoiceData.shippingAddress.line3}</p>
                <p className="leading-snug">{invoiceData.shippingAddress.line4}</p>
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div className="space-y-0.5">
            <div>
              <span className="text-sm text-gray-700 font-medium">Billing Address :</span>
              <div className="text-sm text-gray-900 space-y-0.5">
                <p className="leading-snug">{invoiceData.billingAddress.line1}</p>
                <p className="leading-snug">{invoiceData.billingAddress.line2}</p>
                <p className="leading-snug">{invoiceData.billingAddress.line3}</p>
                <p className="leading-snug">{invoiceData.billingAddress.line4}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Invoice Details */}
          <div className="space-y-0.5">
            <div>
              <span className="text-sm text-gray-700 font-medium">Invoice Details :</span>
              <div className="text-sm text-gray-900 space-y-0.5">
                <p className="leading-snug"><span className="text-gray-700">Date:</span> {invoiceData.invoiceDate}</p>
                <p className="leading-snug"><span className="text-gray-700">Currency:</span> {invoiceData.invoiceCurrency}</p>
                <p className="leading-snug"><span className="text-gray-700">Exchange Rate:</span> {invoiceData.exchangeRate}</p>
                <p className="leading-snug"><span className="text-gray-700">Export Type:</span> {invoiceData.exportType}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logistics Info */}
        <div className="flex gap-8 mb-8 text-base flex-wrap">
          <div className="flex gap-2">
            <span className="text-gray-700 font-medium">Port :</span>
            <span className="text-gray-900">{invoiceData.port}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-700 font-medium">Logistics :</span>
            <span className="text-gray-900">{invoiceData.logistics}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-700 font-medium">AWB :</span>
            <span className="text-gray-900">{invoiceData.awb}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-700 font-medium">Shipping Bill :</span>
            <span className="text-gray-900">{invoiceData.shippingBill}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-700 font-medium">SB Date :</span>
            <span className="text-gray-900">{invoiceData.sbDate}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-700 font-medium">EGM :</span>
            <span className="text-gray-900">{invoiceData.egm}</span>
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
                  <th className="text-center py-2 px-1 text-gray-700 font-semibold w-8">#</th>
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
                {invoiceData.items.map((item: any) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="py-2 px-1 text-gray-900 text-center">{item.id}</td>
                    <td className="py-2 px-1 text-gray-900 text-left break-words">{item.name}</td>
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
              <span className="text-base text-gray-700">Payment Ref :</span>
              <p className="text-base text-gray-900 inline ml-2">{invoiceData.paymentRef}</p>
            </div>
            <div>
              <span className="text-base text-gray-700">Total Items/Qty :</span>
              <p className="text-base text-gray-900 inline ml-2">{invoiceData.totalItems}</p>
            </div>
            <div>
              <span className="text-base text-gray-700">A mount in words :</span>
              <p className="text-base text-gray-900 inline ml-2">{invoiceData.amountInWords}</p>
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
          <div className="space-y-3 flex flex-col">
            <div className="text-right flex flex-col">
              <div className="flex justify-end gap-2">
                <span className="text-base text-gray-700">Taxable Amount :</span>
                <p className="text-base text-gray-900 font-semibold">₹ {invoiceData.taxableAmount}</p>
              </div>
            </div>
            <div className="text-right flex flex-col">
              <div className="flex justify-end gap-2">
                <span className="text-base text-gray-700">IGST :</span>
                <p className="text-base text-gray-900 font-semibold">₹ {invoiceData.igst}</p>
              </div>
            </div>
            <div className="text-right flex flex-col">
              <div className="flex justify-end gap-2">
                <span className="text-base text-gray-700 font-semibold">Total :</span>
                <p className="text-lg text-gray-900 font-bold">₹ {invoiceData.total}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <Link href={`/sales/create?edit=true&invoiceId=${invoiceData.invoiceNo}&orderId=${invoiceData.orderId}`} className="bg-blue-900 text-white px-8 py-2 rounded-lg hover:bg-blue-800 font-medium inline-block">
                Add/ Edit Shipping Details
              </Link>
              <button className="bg-red-500 text-white px-8 py-2 rounded-lg hover:bg-red-600 font-medium">
                Cancel Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
