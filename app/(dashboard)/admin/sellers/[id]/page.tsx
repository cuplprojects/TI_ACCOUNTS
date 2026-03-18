"use client";

import React, { useEffect, useState } from "react";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faEdit,
  faChevronRight,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getSeller, getSellerStats, getSellerLastOrder, Seller, approveSeller, rejectSeller } from "@/app/lib/services/admin/sellerService";
import BankDetailsSection from "@/app/components/admin/BankDetailsSection";
import { showConfirmation } from "@/app/lib/swalConfig";

interface SellerOrder {
  id: string;
  order_number: string;
  total: number;
  status: string;
  createdAt: string;
  buyer_email: string;
  first_name: string;
  last_name: string;
}

export default function SellerDetailPage() {
  const { setTitle } = usePageTitle();
  const params = useParams();
  const sellerId = params.id as string;

  const [seller, setSeller] = useState<Seller | null>(null);
  const [sellerStats, setSellerStats] = useState<{ totalSalesIncluding: number; totalSalesExcluding: number; totalOrders: number } | null>(null);
  const [lastOrder, setLastOrder] = useState<SellerOrder[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewingDocument, setViewingDocument] = useState<{
    type: string;
    url: string;
  } | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    const loadSellerData = async () => {
      setLoading(true);
      try {
        const [sellerResponse, statsResponse, lastOrderResponse] = await Promise.all([
          getSeller(sellerId),
          getSellerStats(sellerId),
          getSellerLastOrder(sellerId)
        ]);

        if (sellerResponse && sellerResponse.data) {
          const sellerData = sellerResponse.data;
          setSeller({
            id: sellerData.id,
            firmName: sellerData.firm_name,
            firmType: sellerData.entity_type,
            countryCode: sellerData.country_code,
            isGstRegistered: sellerData.is_gst_registered,
            gstinNo: sellerData.gstin,
            email: sellerData.email,
            phoneNumber: sellerData.phone,
            emailConsent: sellerData.is_marketing_emails,
            smsConsent: sellerData.is_marketing_sms,
            selfPickup: sellerData.self_pickup,
            status: sellerData.status,
            margin: sellerData?.margin,
            Addresses: sellerData.Addresses || sellerData.SellerAddresses || [],
            Tags: sellerData.Tags,
            createdAt: sellerData.createdAt,
            updatedAt: sellerData.updatedAt,
            stampUrl: sellerData.stamp_url,
            signatureUrl: sellerData.signature_url,
            gstCertificateUrl: sellerData.gst_certificate_url,
            agreementUrl: sellerData.agreement_url,
          });
          setTitle(sellerData.firm_name);
        } else {
          setTitle("Seller Not Found");
        }

        if (statsResponse) {
          setSellerStats(statsResponse);
        }

        if (lastOrderResponse) {
          setLastOrder(lastOrderResponse);
        }
      } catch (error) {
        console.error("Failed to load seller data:", error);
        setTitle("Seller Not Found");
      } finally {
        setLoading(false);
      }
    };

    if (sellerId) {
      loadSellerData();
    }
  }, [sellerId, setTitle]);

  if (loading) {
    return <div className="text-center py-10">Loading seller details...</div>;
  }

  if (!seller) {
    return <div className="text-center py-10">Seller not found</div>;
  }

  // Helper functions to get addresses
  const getDefaultAddress = () => {
    const addresses = seller.Addresses || [];
    return addresses.find((addr) => addr.type === "default");
  };

  const getWarehouseAddress = () => {
    const addresses = seller.Addresses || [];
    return addresses.find((addr) => addr.type === "warehouse");
  };

  const defaultAddress = getDefaultAddress();
  const warehouseAddress = getWarehouseAddress();

  const handleApproveSeller = async () => {
    const result = await showConfirmation(
      "Approve Seller",
      "Are you sure you want to approve this seller?"
    );

    if (result.isConfirmed) {
      setIsApproving(true);
      const success = await approveSeller(sellerId);
      setIsApproving(false);

      if (success) {
        // Reload seller data
        const response = await getSeller(sellerId);
        if (response && response.data) {
          const sellerData = response.data;
          setSeller({
            ...seller,
            status: sellerData.status,
          } as Seller);
        }
      }
    }
  };

  const handleRejectSeller = async () => {
    const result = await showConfirmation(
      "Reject Seller",
      "Are you sure you want to reject this seller?"
    );

    if (result.isConfirmed) {
      setIsApproving(true);
      const success = await rejectSeller(sellerId);
      setIsApproving(false);

      if (success) {
        // Reload seller data
        const response = await getSeller(sellerId);
        if (response && response.data) {
          const sellerData = response.data;
          setSeller({
            ...seller,
            status: sellerData.status,
          } as Seller);
        }
      }
    }
  };

  return (
    <div className="bg-gray-bg rounded-lg p-3">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/sellers" className="flex items-center text-black">
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
            <span className="title-2-semibold">{seller.firmName}</span>
          </Link>
          {seller.status && (
            <div>
              {seller.status === "pending" && (
                <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full xsmall font-semibold">
                  Pending Approval
                </span>
              )}
              {seller.status === "approved" && (
                <span className="px-3 py-1 bg-green-00 text-success rounded-full xsmall font-semibold">
                  Approved
                </span>
              )}
              {seller.status === "rejected" && (
                <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full xsmall font-semibold">
                  Rejected
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {seller.status === "pending" && (
            <>
              <button
                onClick={handleApproveSeller}
                disabled={isApproving}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md xsmall-semibold"
              >
                {isApproving ? "Approving..." : "Approve"}
              </button>
              <button
                onClick={handleRejectSeller}
                disabled={isApproving}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-md xsmall-semibold"
              >
                {isApproving ? "Rejecting..." : "Reject"}
              </button>
            </>
          )}
          <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md xsmall-semibold flex items-center">
            More Actions{" "}
            <FontAwesomeIcon
              icon={faChevronRight}
              className="h-3 w-3 ml-2 rotate-90"
            />
          </button>
          <button className="px-2 py-2 bg-gray-100 text-gray-800 rounded-md">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12H19M12 5V19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button className="px-2 py-2 bg-gray-100 text-gray-800 rounded-md">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 3H21V9M21 16V21H3V3H8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-3">
          {/* Seller Stats */}
          <div className="bg-white rounded-lg shadow-sm custom-border-1 flex divide-x divide-gray-line">
            {/* <div className="p-5 flex-1">
              <h3 className="text-gray-10 xsmall mb-1">Amount Earned (including 5%)</h3>
              <p className="text-black title-2-semibold">
                ₹{sellerStats?.totalSalesIncluding?.toLocaleString('en-IN') || '0'}
              </p>
            </div> */}
            <div className="p-5 flex-1">
              <h3 className="text-gray-10 xsmall mb-1">Amount Earned (excluding 5%)</h3>
              <p className="text-black title-2-semibold">
                ₹{sellerStats?.totalSalesExcluding?.toLocaleString('en-IN') || '0'}
              </p>
            </div>
            <div className="p-3 flex-1">
              <h3 className="text-gray-10 xsmall mb-1">Orders</h3>
              <p className="text-black title-2-semibold">
                {sellerStats?.totalOrders?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-3 flex-1">
              <h3 className="text-gray-10 xsmall mb-1">Partner since</h3>
              <p className="text-black title-2-semibold">
                {seller.createdAt
                  ? new Date(seller.createdAt).toLocaleDateString()
                  : "-"}
              </p>
            </div>
          </div>

          {/* Last Order */}
          <div className="bg-white rounded-lg shadow-sm custom-border-1 p-4">
            <h3 className="text-black title-4-semibold mb-3">
              Recent Orders
            </h3>
            {lastOrder && lastOrder.length > 0 ? (
              <div className="w-full">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-line">
                      <th className="text-left py-1 px-1 text-gray-10 xsmall font-semibold">Order #</th>
                      <th className="text-left py-1 px-1 text-gray-10 xsmall font-semibold">Buyer</th>
                      <th className="text-left py-1 px-1 text-gray-10 xsmall font-semibold">Date</th>
                      <th className="text-left py-1 px-1 text-gray-10 xsmall font-semibold">Status</th>
                      <th className="text-right py-1 px-1 text-gray-10 xsmall font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lastOrder.map((order: SellerOrder) => (
                      <tr 
                        key={order.id} 
                        className="border-b border-gray-line hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => window.location.href = `/admin/orders/${order.id}`}
                      >
                        <td className="py-1 px-1">
                          <span className="text-blue-600 small-semibold hover:underline">
                            {order.order_number}
                          </span>
                        </td>
                        <td className="py-1 px-1">
                          <span className="text-gray-10 xsmall">
                            {order.first_name} {order.last_name}
                          </span>
                        </td>
                        <td className="py-1 px-1">
                          <span className="text-gray-10 xsmall">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-1 px-1">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded inline-block ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-1 px-1 text-right">
                          <span className="text-black small-semibold">
                            ₹{parseFloat(order.total?.toString() || '0').toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-10 small">No orders yet</p>
            )}
          </div>

          {/* Billing/Default Address */}
          <div className="bg-white rounded-lg shadow-sm custom-border-1 p-4">
            <div className="flex justify-between mb-3">
              <h3 className="text-black title-4-semibold">Billing address</h3>
              <button className="text-gray-10">
                <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-2">
              {defaultAddress ? (
                <>
                  <p className="text-black small">
                    {defaultAddress.first_name} {defaultAddress.last_name}
                  </p>
                  <p className="text-black small">
                    {defaultAddress.company && `${defaultAddress.company}, `}
                    {defaultAddress.address_line_1}
                  </p>
                  {defaultAddress.address_line_2 && (
                    <p className="text-black small">
                      {defaultAddress.address_line_2}
                    </p>
                  )}
                  <p className="text-black small mb-2">
                    {defaultAddress.city}, {defaultAddress.state}{" "}
                    {defaultAddress.zip_code}, {defaultAddress.country}
                  </p>
                  <a
                    href={`tel:${defaultAddress.phone}`}
                    className="text-primary xsmall"
                  >
                    {defaultAddress.phone}
                  </a>
                </>
              ) : (
                <p className="text-gray-10 small">
                  No billing address available
                </p>
              )}
            </div>
          </div>

          {/* Warehouse Address */}
          <div className="bg-white rounded-lg shadow-sm custom-border-1 p-4">
            <div className="flex justify-between mb-3">
              <h3 className="text-black title-4-semibold">Warehouse address</h3>
              <button className="text-gray-10">
                <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-2">
              {warehouseAddress ? (
                <>
                  <p className="text-black small">
                    {warehouseAddress.first_name} {warehouseAddress.last_name}
                  </p>
                  <p className="text-black small">
                    {warehouseAddress.company &&
                      `${warehouseAddress.company}, `}
                    {warehouseAddress.address_line_1}
                  </p>
                  {warehouseAddress.address_line_2 && (
                    <p className="text-black small">
                      {warehouseAddress.address_line_2}
                    </p>
                  )}
                  <p className="text-black small mb-2">
                    {warehouseAddress.city}, {warehouseAddress.state}{" "}
                    {warehouseAddress.zip_code}, {warehouseAddress.country}
                  </p>
                  <a
                    href={`tel:${warehouseAddress.phone}`}
                    className="text-primary xsmall"
                  >
                    {warehouseAddress.phone}
                  </a>
                </>
              ) : (
                <p className="text-gray-10 small">
                  No warehouse address available
                </p>
              )}
            </div>
          </div>

          {/* Tags and Notes Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Tags */}
            <div className="bg-white rounded-lg shadow-sm custom-border-1 p-4">
              <div className="flex justify-between mb-3">
                <h3 className="text-black title-4-semibold">Tags</h3>
                <button className="text-gray-10">
                  <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                </button>
              </div>
              <div className="custom-border-3 rounded-md p-2 bg-gray-50">
                {/* Empty state for tags */}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow-sm custom-border-1 p-4">
              <div className="flex justify-between mb-3">
                <h3 className="text-black title-4-semibold">Notes</h3>
                <button className="text-gray-10">
                  <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                </button>
              </div>
              <p className="text-gray-10 small">No Notes</p>
            </div>

            {/* Margin Contribution */}
            <div className="bg-white rounded-lg shadow-sm custom-border-1 p-4">
              <div className="flex justify-between mb-3">
                <h3 className="text-black title-4-semibold">Margin Contribution</h3>
              </div>
              <p className="text-gray-10 small">{seller?.margin}%</p>
            </div>
          </div>


        </div>

        {/* Right Column */}
        <div className="md:col-span-1 space-y-3">
          {/* Seller Card */}
          <div className="bg-white rounded-lg shadow-sm custom-border-1 p-4">
            <div className="flex justify-between mb-3">
              <h3 className="text-black title-4-semibold">Seller</h3>
              <button className="text-gray-10">
                <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center mb-3">
              <div className="h-10 w-10 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                <span>{seller.firmName.substring(0, 2).toUpperCase()}</span>
              </div>
              <div>
                <h4 className="text-black small">{seller.firmName}</h4>
                <p className="text-gray-10 xsmall">
                  {sellerStats?.totalOrders || 0} Orders
                </p>
              </div>
            </div>
            <div className="border-t border-gray-line pt-3">
              <h4 className="text-black small-semibold mb-2">
                Contact information
              </h4>
              <a
                href={`mailto:${seller.email}`}
                className="text-primary xsmall block mb-1"
              >
                {seller.email || "-"}
              </a>
              <p className="text-gray-10 xsmall">
                {seller.phoneNumber
                  ? `${seller.countryCode === "IN" ? "+91" : seller.countryCode}${seller.phoneNumber}`
                  : "No phone number"}
              </p>
            </div>
          </div>

          {/* Bank Details */}
          <BankDetailsSection sellerId={seller.id!} />

          {/* Documents */}
          <div className="bg-white rounded-lg shadow-sm custom-border-1 p-4">
            <div className="flex justify-between mb-3">
              <h3 className="text-black title-4-semibold">Documents</h3>
              <Link href={`/admin/sellers/add?id=${seller.id}`} className="text-gray-10">
                <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {/* Stamp */}
              <div className="flex items-center justify-between p-2 border border-gray-200 rounded-md">
                <div className="flex items-center gap-2">
                  <span className="text-gray-10 small">Stamp</span>
                </div>
                {seller.stampUrl ? (
                  <button
                    onClick={() => setViewingDocument({ type: "Stamp", url: seller.stampUrl! })}
                    className="text-primary xsmall hover:underline font-medium"
                  >
                    View
                  </button>
                ) : (
                  <span className="text-gray-10 xsmall">Not uploaded</span>
                )}
              </div>

              {/* Signature */}
              <div className="flex items-center justify-between p-2 border border-gray-200 rounded-md">
                <div className="flex items-center gap-2">
                  <span className="text-gray-10 small">Signature</span>
                </div>
                {seller.signatureUrl ? (
                  <button
                    onClick={() => setViewingDocument({ type: "Signature", url: seller.signatureUrl! })}
                    className="text-primary xsmall hover:underline font-medium"
                  >
                    View
                  </button>
                ) : (
                  <span className="text-gray-10 xsmall">Not uploaded</span>
                )}
              </div>

              {/* GST Certificate */}
              <div className="flex items-center justify-between p-2 border border-gray-200 rounded-md">
                <div className="flex items-center gap-2">
                  <span className="text-gray-10 small">GST Certificate</span>
                </div>
                {seller.gstCertificateUrl ? (
                  <button
                    onClick={() => setViewingDocument({ type: "GST Certificate", url: seller.gstCertificateUrl! })}
                    className="text-primary xsmall hover:underline font-medium"
                  >
                    View
                  </button>
                ) : (
                  <span className="text-gray-10 xsmall">Not uploaded</span>
                )}
              </div>

              {/* Agreement */}
              <div className="flex items-center justify-between p-2 border border-gray-200 rounded-md">
                <div className="flex items-center gap-2">
                  <span className="text-gray-10 small">Agreement</span>
                </div>
                {seller.agreementUrl ? (
                  <button
                    onClick={() => setViewingDocument({ type: "Agreement", url: seller.agreementUrl! })}
                    className="text-primary xsmall hover:underline font-medium"
                  >
                    View
                  </button>
                ) : (
                  <span className="text-gray-10 xsmall">Not uploaded</span>
                )}
              </div>
            </div>
          </div>

          {/* Seller Preferences */}
          <div className="bg-white rounded-lg shadow-sm custom-border-1 p-4">
            <div className="flex justify-between mb-3">
              <h3 className="text-black title-4-semibold">Seller Preferences</h3>
              <Link href={`/admin/sellers/add?id=${seller.id}`} className="text-gray-10">
                <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-10 small">Email Marketing</span>
                <span className={`px-2 py-1 rounded-full xsmall ${seller.emailConsent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {seller.emailConsent ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-10 small">SMS Marketing</span>
                <span className={`px-2 py-1 rounded-full xsmall ${seller.smsConsent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {seller.smsConsent ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-10 small">Self Pickup</span>
                <span className={`px-2 py-1 rounded-full xsmall ${seller.selfPickup ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {seller.selfPickup ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingDocument(null)}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-black title-3-semibold">{viewingDocument.type}</h3>
              <button
                onClick={() => setViewingDocument(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              {viewingDocument.url.toLowerCase().endsWith('.pdf') ? (
                // PDF Viewer
                <iframe
                  src={viewingDocument.url}
                  className="w-full h-full min-h-[500px] border border-gray-200 rounded-md"
                  title={viewingDocument.type}
                />
              ) : (
                // Image Viewer
                <div className="flex items-center justify-center">
                  <img
                    src={viewingDocument.url}
                    alt={viewingDocument.type}
                    className="max-w-full max-h-[70vh] object-contain rounded-md"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <a
                href={viewingDocument.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-primary text-white rounded-md small-semibold hover:bg-primary-dark"
              >
                Download
              </a>
              <button
                onClick={() => setViewingDocument(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md small-semibold hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
