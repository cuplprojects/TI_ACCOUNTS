"use client";

import React, { useEffect, useState } from "react";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faAngleLeft,
  faAngleRight,
  faPen,
  faCheckCircle,
  faSpinner,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getAbandonedCart,
  AbandonedCart,
} from "@/app/lib/services/admin/abandonedService";
import { getCarrierName } from "@/app/lib/services/admin/shippingCarrierService";
import { showErrorMessage, showSuccessMessage } from "@/app/lib/swalConfig";

export default function AbandonedCheckoutDetailPage() {
  const { setTitle } = usePageTitle();
  const params = useParams();
  const [note, setNote] = useState("");
  const [checkoutData, setCheckoutData] = useState<AbandonedCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailSent, setEmailSent] = useState(false); // Mock email status
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    setTitle("Abandoned Checkouts");
    loadAbandonedCart();
  }, [setTitle, params.id]);

  const loadAbandonedCart = async () => {
    if (!params.id || typeof params.id !== "string") {
      showErrorMessage("Invalid cart ID");
      return;
    }

    try {
      setLoading(true);
      const cart = await getAbandonedCart(params.id);
      if (cart) {
        setCheckoutData(cart);
      }
    } catch (error) {
      console.error("Error loading abandoned cart:", error);
      showErrorMessage("Failed to load abandoned cart details");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!checkoutData) return;

    try {
      setSendingEmail(true);
      // TODO: Implement actual email sending API call
      // For now, just simulate the action
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setEmailSent(true);
      showSuccessMessage("Recovery email sent successfully!");
    } catch (error) {
      console.error("Error sending email:", error);
      showErrorMessage("Failed to send recovery email");
    } finally {
      setSendingEmail(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    // Always show rupee sign for INR prices
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Calculate total from cart items
  const calculateCartTotal = (
    cartItems: { price: number; quantity: number }[]
  ) => {
    return cartItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  };

  if (loading) {
    return (
      <div className="main-container bg-gray-bg">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <FontAwesomeIcon
              icon={faSpinner}
              className="animate-spin h-8 w-8 text-blue-00 mb-4"
            />
            <p className="text-gray-50 small">
              Loading abandoned cart details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!checkoutData) {
    return (
      <div className="main-container bg-gray-bg">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <p className="text-gray-50 small">Abandoned cart not found</p>
            <Link
              href="/admin/abandoned"
              className="text-blue-00 hover:underline mt-2 inline-block"
            >
              ← Back to Abandoned Carts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container bg-gray-bg">
      {/* Header with ID and email status */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/admin/abandoned" className="text-black mr-2">
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
          </Link>
          <h1 className="title-2">#{checkoutData.id.slice(-8)}</h1>
          <div className="flex items-center ml-4 gap-2">
            {emailSent ? (
              <span className="inline-flex items-center px-2 py-1 bg-green-00 text-gray-10 rounded-full xsmall-semibold">
                <span className="h-2 w-2 bg-green-10 rounded-full mr-1"></span>
                Email sent
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 bg-gray-90 text-gray-10 rounded-full xsmall-semibold">
                <span className="h-2 w-2 bg-gray-80 rounded-full mr-1"></span>
                Email not sent
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <button className="px-4 py-2 border border-gray-line bg-white rounded-md flex items-center gap-2 small-semibold">
              Print <span className="text-gray-50">↓</span>
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 border border-gray-line bg-white rounded-md flex items-center">
              <FontAwesomeIcon icon={faAngleLeft} className="h-3 w-3" />
            </button>
            <button className="p-2 border border-gray-line bg-white rounded-md flex items-center">
              <FontAwesomeIcon icon={faAngleRight} className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Location and date */}
      <p className="text-gray-10 small mb-6">
        Online Store, {formatDate(checkoutData.createdAt)}
      </p>

      {/* Email Status Section */}
      {emailSent ? (
        <div className="bg-white rounded-lg border border-gray-line mb-6">
          <div className="flex items-center bg-green-30 rounded-lg p-3">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="h-4 w-4 text-white mr-2"
            />
            <div className="text-white title-4-semibold">
              Cart Recovery Email Sent
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-10 small">
              A reminder email was sent to the customer recently.
            </p>
            <div className="mt-4 p-3 bg-blue-80 border border-gray-line rounded text-black xsmall-medium break-all">
              Recovery link will be generated when email is sent
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-line mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-black title-4-semibold mb-2">
                  Cart Recovery Email
                </h3>
                <p className="text-gray-10 small">
                  Send a recovery email to help the customer complete their
                  purchase.
                </p>
              </div>
              <button
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="px-4 py-2 bg-blue-00 text-white rounded-md hover:bg-blue-10 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 small-semibold"
              >
                {sendingEmail ? (
                  <>
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="animate-spin h-4 w-4"
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4" />
                    Send Recovery Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Checkout Details */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg border border-gray-line mb-6">
            <div className="p-6 border-b border-gray-line flex items-center justify-between">
              <h3 className="text-black title-4-semibold">Checkout Details</h3>
              <span className="text-gray-10 small">From Online Store</span>
            </div>
            <div className="p-6">
              {/* Products table */}
              <table className="w-full mb-6">
                <tbody>
                  {checkoutData.CartItems.map((item) => (
                    <tr key={item.id}>
                      <td
                        className="align-top pr-4 pb-4"
                        style={{ width: "80px" }}
                      >
                        <div className="w-20 h-20 bg-gray-line rounded overflow-hidden">
                          {item.Variant?.image_urls?.[0]?.url || item.Variant?.Product?.default_image_urls?.[0]?.url ? (
                            <img
                              src={item.Variant?.image_urls?.[0]?.url || item.Variant?.Product?.default_image_urls?.[0]?.url}
                              alt={
                                item.Variant?.Product?.title ||
                                item.Product?.title ||
                                "Product"
                              }
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                target.parentElement!.classList.add(
                                  "flex",
                                  "items-center",
                                  "justify-center"
                                );
                                target.parentElement!.innerHTML =
                                  '<span class="text-gray-50 text-xs">No Image</span>';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-gray-50 text-xs">
                                No Image
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="align-top pb-4 pr-4">
                        <h4 className="text-black small-semibold">
                          {item.Variant?.Product?.title}
                        </h4>
                        <p className="text-gray-10 xsmall">
                          {item.Variant?.option_values &&
                          Object.entries(item.Variant.option_values).length > 0
                            ? Object.entries(item.Variant.option_values)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(" ")
                            : ``}
                        </p>
                        <p className="text-gray-10 xsmall mt-1">
                          SKU: {item.Variant?.sku}
                        </p>
                      </td>
                      <td className="align-top text-right pb-4">
                        <span className="text-black small-semibold">
                          {formatCurrency(item.price)}
                        </span>
                        <span className="text-gray-10 xsmall block">
                          ×{item.quantity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary table */}
              <table className="w-full border-t border-gray-line pt-4">
                <tbody>
                  <tr>
                    <td className="py-3 text-black small-semibold">Subtotal</td>
                    <td className="py-3 text-gray-10 small-semibold">
                      {checkoutData.CartItems.reduce(
                        (acc, item) => acc + item.quantity,
                        0
                      )}{" "}
                      {checkoutData.CartItems.length === 1 ? "item" : "items"}
                    </td>
                    <td className="py-3 text-black small-medium text-right">
                      {formatCurrency(
                        calculateCartTotal(checkoutData.CartItems)
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 text-black small-semibold">Shipping</td>
                    <td className="py-3 text-gray-10 small-semibold">
                      {getCarrierName(checkoutData.shipping_carrier) || "Standard Shipping"}
                    </td>
                    <td className="py-3 text-black small-medium text-right">
                      Calculated at checkout
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 text-black small-semibold">
                      Estimated Tax
                    </td>
                    <td className="py-3"></td>
                    <td className="py-3 text-black small-medium text-right">
                      Calculated at checkout
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 text-black small-semibold">Total</td>
                    <td className="py-3"></td>
                    <td className="py-3 text-black small-medium text-right">
                      {formatCurrency(
                        calculateCartTotal(checkoutData.CartItems)
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white rounded-lg border border-gray-line">
            <div className="p-6 border-b border-gray-line">
              <h3 className="text-black title-4-semibold">Notes</h3>
            </div>
            <div className="p-6">
              <textarea
                className="w-full p-4 border border-gray-line rounded-md h-32 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Add notes about this checkout..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              ></textarea>
              <div className="flex justify-end mt-4">
                <button className="px-6 py-2 bg-primary text-white rounded-md small-semibold">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Customer Info */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg border border-gray-line overflow-hidden">
            <div className="p-6 border-b border-gray-line flex justify-between items-center">
              <h3 className="text-black title-4-semibold">Customer</h3>
              <button className="text-gray-10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <p className="text-blue-100 small-semibold">
                  {checkoutData.User
                    ? `${checkoutData.User.first_name} ${checkoutData.User.last_name}`
                    : "Unknown Customer"}
                </p>
                <p className="text-gray-10 small">Customer</p>
              </div>

              {/* Contact Information */}
              <div className="mb-6">
                <div className="flex justify-between">
                  <h4 className="text-black small-semibold mb-2">
                    Contact information
                  </h4>
                  <button className="text-gray-10">
                    <FontAwesomeIcon icon={faPen} className="h-3 w-3" />
                  </button>
                </div>
                <p className="text-blue-100 small-medium mb-1">
                  {checkoutData.User?.email || "N/A"}
                </p>
                <p className="text-gray-10 small">
                  {checkoutData.User?.phone || "No phone number"}
                </p>
              </div>

              {/* Shipping Address */}
              <div className="mb-6">
                <div className="flex justify-between">
                  <h4 className="text-black small-semibold mb-2">
                    Shipping address
                  </h4>
                  <button className="text-gray-10">
                    <FontAwesomeIcon icon={faPen} className="h-3 w-3" />
                  </button>
                </div>
                <p className="text-black small mb-1">
                  {checkoutData.User
                    ? `${checkoutData.User.first_name} ${checkoutData.User.last_name}`
                    : "Unknown Customer"}
                </p>
                <p className="text-gray-10 small mb-1">
                  Address information not available
                </p>
              </div>

              {/* Billing Address */}
              <div className="mb-6">
                <h4 className="text-black small-semibold mb-2">
                  Billing address
                </h4>
                <p className="text-gray-10 small">Same as shipping address</p>
              </div>

              {/* Marketing */}
              <div>
                <h4 className="text-black small-semibold mb-3">Marketing</h4>
                <div className="flex items-center mb-2">
                  <span
                    className={`inline-block w-3 h-3 ${
                      checkoutData.User?.is_marketing_emails
                        ? "bg-green-500"
                        : "bg-gray-300"
                    } rounded-full mr-2`}
                  ></span>
                  <span className="text-gray-10 small">
                    Email{" "}
                    {checkoutData.User?.is_marketing_emails
                      ? "subscribed"
                      : "not subscribed"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span
                    className={`inline-block w-3 h-3 ${
                      checkoutData.User?.is_marketing_sms
                        ? "bg-green-500"
                        : "bg-gray-300"
                    } rounded-full mr-2`}
                  ></span>
                  <span className="text-gray-10 small">
                    SMS{" "}
                    {checkoutData.User?.is_marketing_sms
                      ? "subscribed"
                      : "not subscribed"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
