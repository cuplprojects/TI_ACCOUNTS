"use client";

import {
  getOrderItemData,
  getOrderItemImage,
  getFormattedOptionValues,
} from "../../../../lib/utils/orderItemUtils";

import React, { useEffect, useState, useRef } from "react";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPen,
  faSmile,
  faHashtag,
  faPaperclip,
  faTimes,
  faFilePdf,
  faEye,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getOrder,
  fulfillOrder,
  hasInvoice,
  hasOrderBeenFulfilled,
  hasTrackingInfo,
  formatOrderStatus,
  formatOrderDate,
  cancelOrder,
  getCustomerOrderInfo,
  type Order,
  type AdminFulfillOrderRequest,
  type CustomerOrderInfo,
} from "@/app/lib/services/admin/orderService";
import { getCarrierName } from "@/app/lib/services/admin/shippingCarrierService";
import { formatCarrierDisplay } from "@/app/lib/services/admin/shippingCarrierService";
import {
  getOrderTimelines,
  createOrderTimeline,
  deleteTimelineAttachment,
  validateAttachmentFiles,
  type OrderTimeline,
} from "@/app/lib/services/admin/timelineService";
import AdminFulfillOrderModal from "../../../../components/AdminFulfillOrderModal";
import AdminAddTrackingModal from "../../../../components/AdminAddTrackingModal";
import AdminCancelOrderModal from "../../../../components/AdminCancelOrderModal";
import NotesSection from "@/components/NotesSection";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

export default function OrderDetailPage() {
  const { setTitle } = usePageTitle();
  const params = useParams();
  const searchParams = useSearchParams();
  const [comment, setComment] = useState("");
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [timelines, setTimelines] = useState<OrderTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [isFulfillModalOpen, setIsFulfillModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [cancelRequestMessage, setCancelRequestMessage] = useState<string>("");
  const [autoCheckItems, setAutoCheckItems] = useState<string[]>([]);
  const [customerOrderInfo, setCustomerOrderInfo] = useState<CustomerOrderInfo>({
    totalOrders: 0,
    sequenceNumber: 0,
    isFirstOrder: false,
  });
  const [isLoadingOrderInfo, setIsLoadingOrderInfo] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Common emojis for quick selection
  const commonEmojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "🤔",
    "🤗",
    "🤭",
    "🤫",
    "🤐",
    "😐",
    "😑",
    "😶",
    "😏",
    "😒",
    "🙄",
    "😬",
    "🤥",
    "😔",
    "😪",
    "😴",
    "😷",
    "🤒",
    "🤕",
    "🤢",
    "👍",
    "👎",
    "👌",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👏",
    "🙌",
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "💔",
    "❣️",
    "💕",
    "✅",
    "❌",
    "⭐",
    "🌟",
    "✨",
    "💫",
    "🔥",
    "💥",
    "🎉",
    "🎊",
  ];

  useEffect(() => {
    setTitle("Orders");
    fetchOrderData();
    
    // Check if we should open the cancel modal from query parameter
    if (searchParams.get("openCancelModal") === "true") {
      setShowRefundModal(true);
      
      // Get the cancel request message
      const messageParam = searchParams.get("message");
      if (messageParam) {
        const decodedMessage = decodeURIComponent(messageParam);
        setCancelRequestMessage(decodedMessage);
        
        // Extract product titles from the message to match with order items
        // Look for pattern: <strong>PRODUCT_TITLE</strong> (SKU: SKU_VALUE)
        const titleMatches = decodedMessage.match(/<strong>([^<]+)<\/strong>\s*\(SKU:\s*([^)]+)\)/g) || [];
        const extractedTitles = titleMatches.map(match => {
          const titleMatch = match.match(/<strong>([^<]+)<\/strong>/);
          return titleMatch ? titleMatch[1] : '';
        }).filter(Boolean);
        
        setAutoCheckItems(extractedTitles);
      }
    }
  }, [setTitle, params.id, searchParams]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch customer order info (total count and sequence number)
  useEffect(() => {
    if (orderData?.User?.id && params.id && typeof params.id === "string") {
      fetchCustomerOrderInfo(orderData.User.id, params.id);
    }
  }, [orderData?.User?.id, params.id]);

  const fetchCustomerOrderInfo = async (customerId: string, orderId: string) => {
    try {
      setIsLoadingOrderInfo(true);
      const info = await getCustomerOrderInfo(customerId, orderId);
      setCustomerOrderInfo(info);
    } catch (error) {
      console.error("Error fetching customer order info:", error);
    } finally {
      setIsLoadingOrderInfo(false);
    }
  };

  const fetchOrderData = async () => {
    if (!params.id || typeof params.id !== "string") return;

    setLoading(true);
    try {
      // Fetch order details
      const order = await getOrder(params.id);
      if (order) {
        setOrderData(order);

        // Fetch order timelines
        const orderTimelines = await getOrderTimelines(params.id);
        if (orderTimelines) {
          setTimelines(orderTimelines);
        }
      }
    } catch (error) {
      console.error("Error fetching order data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setComment(comment + emoji);
    setShowEmojiPicker(false);
  };

  // Handle file attachment
  const handleFileAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Reset the input value immediately so the same file can be selected again
    event.target.value = "";

    if (files.length === 0) return;

    // Validate files using timeline service
    const newFiles = [...attachedFiles, ...files];
    const validation = validateAttachmentFiles(newFiles);

    if (!validation.isValid) {
      alert(validation.errors.join("\n"));
      return;
    }

    setAttachedFiles(newFiles);
  };

  // Remove attached file
  const removeAttachedFile = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  // Handle timeline post
  const handleTimelinePost = async () => {
    if (!comment.trim() && attachedFiles.length === 0) return;
    if (!params.id || typeof params.id !== "string") return;

    setIsPosting(true);
    try {
      const result = await createOrderTimeline(
        params.id,
        comment.trim() || "File attachment",
        attachedFiles,
      );

      if (result) {
        // Clear form
        setComment("");
        setAttachedFiles([]);

        // Clear file input value
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Refresh timelines
        const updatedTimelines = await getOrderTimelines(params.id);
        if (updatedTimelines) {
          setTimelines(updatedTimelines);
        }
      }
    } catch (error) {
      console.error("Error posting timeline:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleInvoiceAction = async () => {
    if (!params.id || typeof params.id !== "string") return;
    const { downloadAdminInvoice } = await import("@/app/lib/utils/adminInvoiceDownloadUtil");
    await downloadAdminInvoice(params.id);
  };

  const handleFulfillOrder = async () => {
    setIsFulfillModalOpen(true);
  };

  const handleAddTracking = () => {
    setIsTrackingModalOpen(true);
  };

  const handleTrackingModalClose = () => {
    setIsTrackingModalOpen(false);
  };

  const handleTrackingSuccess = async () => {
    // Refresh order data after successful tracking addition
    await fetchOrderData();
  };

  const handleFulfillOrderSubmit = async (
    fulfillmentData: AdminFulfillOrderRequest,
  ) => {
    if (!params.id || typeof params.id !== "string") return;

    try {
      const success = await fulfillOrder(params.id, fulfillmentData);
      if (success) {
        setIsFulfillModalOpen(false);
        // Refresh order data
        await fetchOrderData();
      }
    } catch (error) {
      console.error("Error fulfilling order:", error);
    }
  };

  const handleRefundClick = () => {
    setShowRefundModal(true);
  };

  const handleRefundConfirm = async (
    cancellations: Array<{ itemId: string; quantityToCancel: number }>,
    refundAmount: number
  ) => {
    if (!params.id || typeof params.id !== "string" || !orderData) return;

    setIsRefunding(true);
    try {
      // Pass cancellations array with quantities to the backend
      const success = await cancelOrder(params.id, undefined, cancellations);
      if (success) {
        setShowRefundModal(false);
        await fetchOrderData();
      }
    } catch (error) {
      console.error("Error cancelling items:", error);
    } finally {
      setIsRefunding(false);
    }
  };

  if (loading) {
    return (
      <div className="main-container bg-gray-bg">
        <div className="flex items-center justify-center h-64">
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="main-container bg-gray-bg">
        <div className="flex items-center justify-center h-64">
          <p>Order not found</p>
        </div>
      </div>
    );
  }

  // Calculate totals
  const subtotal = parseFloat(orderData.subtotal as string);
  const refundAmount = parseFloat((orderData.refundAmount || 0) as string);
  const shipping = parseFloat(orderData.shipping as string); // Already 0 from backend if all canceled
  const tax = parseFloat(orderData.tax as string);
  const total = orderData.finalAmount;

  // Get payment status
  const isPaid = !!orderData.payment_id;
  const isShipped =
    orderData.status === "shipped" || orderData.status === "delivered";

  // Get customer name
  const customerName = orderData.User
    ? `${orderData.User.first_name} ${orderData.User.last_name}`
    : "Unknown Customer";

  console.log(orderData.OrderItems);

  // Calculate total items
  const totalItems = orderData.OrderItems?.length || 0;

  return (
    <div className="main-container bg-gray-bg">
      {/* Header with Order ID and status */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/admin/orders" className="text-black mr-2">
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
          </Link>
          <h1 className="title-2">{orderData.orderNumber || `#${orderData.id.substring(0, 8)}`}</h1>
          <div className="flex items-center ml-4 gap-2">
            {isPaid && (
              <span className="inline-flex items-center px-2 py-1 bg-green-00 text-gray-10 rounded-full xsmall-semibold">
                <span className="h-2 w-2 bg-green-10 rounded-full mr-1"></span>
                Paid
              </span>
            )}
            {isShipped && (
              <span className="inline-flex items-center px-2 py-1 bg-gray-90 text-gray-10 rounded-full xsmall-semibold">
                <span className="h-2 w-2 bg-gray-80 rounded-full mr-1"></span>
                Shipped
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefundClick}
            disabled={orderData.status === "cancelled"}
            className="px-4 py-2 bg-red-600 text-white rounded-md small-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={orderData.status === "cancelled" ? "Order Already Cancelled" : ""}
          >
            Refund
          </button>
        </div>
      </div>

      {/* Order date and source */}
      <p className="text-gray-10 small mb-6">
        {formatOrderDate(orderData.createdAt)}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Delivery and Fulfillment */}
          <div className="bg-white rounded-lg border border-gray-line p-6 ">
            <div className="bg-white rounded-lg">
              <div className="flex justify-between  border-t-2 border-l-2 border-r-2 border-gray-line rounded-t-lg">
                <div className="p-6">
                  <h3 className="text-black title-4-semibold mb-2">
                    Delivery Method
                  </h3>
                  <p className="text-gray-10 small">
                    {getCarrierName(orderData.shipping_carrier)}
                    {orderData.OrderItems && orderData.OrderItems.length > 0 && (
                      <>
                        {" "}
                        (
                        {(() => {
                          const totalWeight = orderData.OrderItems.reduce((sum, item) => {
                            const itemData = getOrderItemData(item);
                            const weight = itemData.weight || 0;
                            return sum + weight * item.quantityRequested;
                          }, 0);
                          return totalWeight > 0 ? `${totalWeight.toFixed(2)} kg` : "0 kg";
                        })()}
                        )
                      </>
                    )}
                  </p>
                </div>
              </div>
              {/* Products */}

              <div className="p-6 border-2 border-gray-line rounded-b-lg">
                {/* Products table */}
                <table className="w-full mb-6">
                  <tbody>
                    {orderData.OrderItems?.map((item) => {
                      const itemData = getOrderItemData(item);
                      const optionsText = getFormattedOptionValues(item);

                      return (
                        <tr key={item.id}>
                          <td
                            className="align-top pr-4 pb-4"
                            style={{ width: "80px" }}
                          >
                            <div className="w-20 h-20 bg-gray-line rounded flex items-center justify-center overflow-hidden">
                              {getOrderItemImage(item) ? (
                                <img
                                  src={getOrderItemImage(item)}
                                  alt={itemData.title}
                                  className="w-full h-full object-cover rounded"
                                  style={{ width: "80px", height: "80px" }}
                                />
                              ) : (
                                <span className="text-gray-400 text-xs">No image</span>
                              )}
                            </div>
                          </td>
                          <td className="align-top pb-4 pr-4 max-w-xs">
                            {item.Product?.id ? (
                              <Link href={`/admin/products/${item.Product.id}/view`}>
                                <h4 className="text-black small-semibold hover:text-primary cursor-pointer">
                                  {itemData.title}
                                </h4>
                              </Link>
                            ) : (
                              <h4 className="text-black small-semibold">
                                {itemData.title}
                              </h4>
                            )}
                            {optionsText && (
                              <p className="text-gray-110 px-3 py-1 my-2 bg-gray-100 xxsmall-semibold w-fit rounded-full">
                                {optionsText}
                              </p>
                            )}
                            <div className="mt-2">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full xxsmall-semibold ${
                                  item.status === "fulfilled"
                                    ? "bg-green-100 text-green-800"
                                    : item.status === "canceled"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                <span
                                  className={`h-2 w-2 rounded-full mr-1 ${
                                    item.status === "fulfilled"
                                      ? "bg-green-600"
                                      : item.status === "canceled"
                                        ? "bg-red-600"
                                        : "bg-yellow-600"
                                  }`}
                                ></span>
                                {item.status.charAt(0).toUpperCase() +
                                  item.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-gray-10 xsmall mt-1">
                              SKU: {itemData.sku}
                            </p>
                            {itemData.weight && (
                              <p className="text-gray-10 xsmall mt-1">
                                Variant Weight: {itemData.weight.toFixed(2)} kg
                              </p>
                            )}
                            {item.Variant?.option_values && Object.keys(item.Variant.option_values).length > 0 && (
                              <p className="text-gray-10 xsmall mt-1">
                                Variant: {Object.entries(item.Variant.option_values).map(([key, value]) => `${key}: ${value}`).join(", ")}
                              </p>
                            )}
                          </td>
                          <td className="align-top text-right pb-4 whitespace-nowrap">
                            <span className="text-black small-semibold">
                              ₹{parseFloat(item.unitPrice).toFixed(2)} INR
                            </span>
                            <span className="text-gray-10 xsmall block">
                              ×{item.quantityRequested || 0}
                            </span>
                          </td>
                          <td className="align-top text-right pb-4 whitespace-nowrap">
                            <span className="text-black small-semibold">
                              ₹
                              {(
                                parseFloat(item.unitPrice) *
                                (item.quantityRequested || 0)
                              ).toFixed(2)}{" "}
                              INR
                            </span>
                          </td>
                        </tr>
                      );
                    }) || (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-4 text-gray-10"
                        >
                          No items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-4">
              {(() => {
                if (!orderData) return null;

                const hasPendingItems =
                  orderData.OrderItems &&
                  orderData.OrderItems.some(
                    (item) => item.status === "pending",
                  );
                const isFulfilled = hasOrderBeenFulfilled(orderData);
                const hasInvoiceCreated = hasInvoice(orderData);
                const hasTracking = hasTrackingInfo(orderData);
                const isCancelled = orderData.status === "cancelled";
                
                // Check if all items are cancelled
                const allItemsCancelled =
                  orderData.OrderItems &&
                  orderData.OrderItems.every(
                    (item) => item.status === "canceled",
                  );
                
                // Check if there are any non-cancelled items
                const hasNonCancelledItems =
                  orderData.OrderItems &&
                  orderData.OrderItems.some(
                    (item) => item.status !== "canceled",
                  );

                // If all items are cancelled, disable all buttons
                if (allItemsCancelled) {
                  return (
                    <>
                      <button
                        disabled={true}
                        className="px-4 py-2 rounded-md small-semibold bg-gray-300 text-gray-500 cursor-not-allowed"
                        title="Cannot perform actions when all items are cancelled"
                      >
                        Fulfill
                      </button>
                      <button
                        disabled={true}
                        className="px-6 py-2 rounded-md small-semibold bg-gray-300 text-gray-500 cursor-not-allowed"
                        title="Cannot perform actions when all items are cancelled"
                      >
                        Create Invoice
                      </button>
                      <button
                        disabled={true}
                        className="px-4 py-2 rounded-md small-semibold bg-gray-300 text-gray-500 cursor-not-allowed"
                        title="Cannot perform actions when all items are cancelled"
                      >
                        Add Tracking Info
                      </button>
                    </>
                  );
                }

                // If any items are pending, disable all buttons
                if (hasPendingItems) {
                  return (
                    <>
                      <button
                        disabled={true}
                        className="px-4 py-2 rounded-md small-semibold bg-gray-300 text-gray-500 cursor-not-allowed"
                        title="All order items must not be pending to proceed"
                      >
                        Fulfill
                      </button>
                      <button
                        disabled={true}
                        className="px-6 py-2 rounded-md small-semibold bg-gray-300 text-gray-500 cursor-not-allowed"
                        title="All order items must not be pending to proceed"
                      >
                        Create Invoice
                      </button>
                      <button
                        disabled={true}
                        className="px-4 py-2 rounded-md small-semibold bg-gray-300 text-gray-500 cursor-not-allowed"
                        title="All order items must not be pending to proceed"
                      >
                        Add Tracking Info
                      </button>
                    </>
                  );
                }

                return (
                  <>
                    <button
                      onClick={handleFulfillOrder}
                      disabled={
                        hasInvoiceCreated ||
                        !orderData.OrderShipments ||
                        orderData.OrderShipments.length === 0 ||
                        isFulfilled
                      }
                      className={`px-4 py-2 rounded-md small-semibold transition-all ${
                        !hasInvoiceCreated &&
                        orderData.OrderShipments &&
                        orderData.OrderShipments.length > 0 &&
                        !isFulfilled
                          ? "bg-primary text-white hover:bg-primary/90 ring-2 ring-primary ring-opacity-50"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      title={
                        isFulfilled
                          ? "All items are already fulfilled"
                          : !orderData.OrderShipments ||
                            orderData.OrderShipments.length === 0
                            ? "Order shipments required for fulfillment"
                            : hasInvoiceCreated
                              ? "Cannot update fulfillment after invoice is created"
                              : "Fulfill order"
                      }
                    >
                      Fulfill
                    </button>
                    <button
                      onClick={handleInvoiceAction}
                      disabled={!isFulfilled && !orderData.OrderItems?.some(item => item.status === "fulfilled")}
                      className={`px-6 py-2 rounded-md small-semibold transition-all ${
                        (isFulfilled || orderData.OrderItems?.some(item => item.status === "fulfilled"))
                          ? "bg-primary text-white hover:bg-primary/90"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      title={
                        (isFulfilled || orderData.OrderItems?.some(item => item.status === "fulfilled"))
                          ? "Download invoice"
                          : "Order must be fulfilled first"
                      }
                    >
                      Download Invoice
                    </button>
                    <button
                      onClick={handleAddTracking}
                      disabled={!hasInvoiceCreated || hasTracking}
                      className={`px-4 py-2 rounded-md small-semibold transition-all ${
                        hasInvoiceCreated && !hasTracking
                          ? "bg-primary text-white hover:bg-primary/90 ring-2 ring-primary ring-opacity-50"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      title={
                        !hasInvoiceCreated
                          ? "Create invoice first"
                          : hasTracking
                            ? "Tracking information already added"
                            : "Add tracking information - next step!"
                      }
                    >
                      Add Tracking Info
                    </button>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg border border-gray-line overflow-hidden p-6">
            <table className="w-full">
              <tbody className="border-2 rounded-lg block border-gray-line w-full">
                <tr className="flex justify-between items-center">
                  <td className="py-3 px-6 text-black small-semibold">
                    Subtotal
                  </td>
                  <td className="py-3 px-6 text-black small-semibold flex-1">
                    {totalItems} item{totalItems !== 1 ? "s" : ""}
                  </td>
                  <td className="py-3 px-6 text-right text-black small-medium whitespace-nowrap">
                    ₹{subtotal.toFixed(2)}
                  </td>
                </tr>
                {refundAmount > 0 && (
                  <tr className="flex justify-between items-center">
                    <td className="py-3 px-6 text-black small-semibold">
                      Refund
                    </td>
                    <td className="py-3 px-6 text-red-600 small-semibold flex-1">
                      Canceled items
                    </td>
                    <td className="py-3 px-6 text-right text-red-600 small-medium whitespace-nowrap">
                      -₹{refundAmount.toFixed(2)}
                    </td>
                  </tr>
                )}
                <tr className="flex justify-between items-center">
                  <td className="py-0 px-6 text-black small-semibold">
                    Shipping
                  </td>
                  <td className="py-0 px-6 text-black small-semibold flex-1">
                    {getCarrierName(orderData.shipping_carrier) || "Standard Shipping"}
                  </td>
                  <td className="py-0 px-6 text-right text-black small-medium whitespace-nowrap">
                    ₹{shipping.toFixed(2)}
                  </td>
                </tr>
                {tax > 0 && (
                  <tr className="flex justify-between items-center">
                    <td className="py-3 px-6 text-black small-semibold">
                      Tax
                    </td>
                    <td className="py-3 px-6 flex-1"></td>
                    <td className="py-3 px-6 text-right text-black small-medium whitespace-nowrap">
                      ₹{tax.toFixed(2)}
                    </td>
                  </tr>
                )}
                <tr className="flex justify-between items-center">
                  <td className="py-3 px-6 text-black small-semibold">
                    Total
                  </td>
                  <td className="py-3 px-6 flex-1"></td>
                  <td className="py-3 px-6 text-right text-black small-medium whitespace-nowrap">
                    ₹{total.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-t-2 border-gray-line flex justify-between items-center">
                  <td className="py-3 px-6 text-black small-semibold">
                    Paid
                  </td>
                  <td className="py-3 px-6 text-gray-10 small-semibold flex-1">
                    {isPaid
                      ? `Payment ID: ${orderData.payment_id}`
                      : "Not paid"}
                  </td>
                  <td className="py-3 px-6 text-right text-black small-bold whitespace-nowrap">
                    ₹{isPaid ? total.toFixed(2) : "0.00"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-lg border border-gray-line">
            <div className="p-6 border-b border-gray-line flex justify-between items-center">
              <h3 className="text-black title-4-semibold">
                Payment Details
              </h3>
            </div>
            <div className="p-6">
              {orderData.Payment ? (
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-10 small mb-1">Amount Paid</p>
                      <p className="text-black small-semibold">
                        {orderData.Payment.currency === 'INR' ? '₹' : orderData.Payment.currency === 'USD' ? '$' : orderData.Payment.currency}
                        {Number(orderData.Payment.amount).toFixed(2)} {orderData.Payment.currency}
                   
                      {orderData.Payment.currency !== 'INR' && (
                        <span className="text-gray-10 xsmall mt-1 whitespace-nowrap">
                          &nbsp;( ≈ ₹{Number(orderData.Payment.amount / orderData.Payment.conversion_rate).toFixed(2)} INR
                        )</span>
                      )}   </p>
                    </div>
                    <div>
                      <p className="text-gray-10 small mb-1">Conversion Rate</p>
                      <p className="text-black small-semibold">
                        {orderData.Payment.conversion_rate}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-10 small mb-1">Payment Gateway</p>
                      <p className="text-black small-semibold capitalize">
                        {orderData.Payment.gateway}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-10 small mb-1">Payment Status</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full xsmall-semibold ${
                        orderData.Payment.status === 'captured' ? 'bg-green-00 text-gray-10' : 'bg-yellow-00 text-gray-10'
                      }`}>
                        <span className={`h-2 w-2 rounded-full mr-1 ${
                          orderData.Payment.status === 'captured' ? 'bg-green-10' : 'bg-yellow-10'
                        }`}></span>
                        {orderData.Payment.status.charAt(0).toUpperCase() + orderData.Payment.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-10 small">No payment information available</p>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg border border-gray-line">
            <div className="p-6 border-b border-gray-line">
              <h3 className="text-black title-4-semibold">Timeline</h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <textarea
                  className="w-full p-4 border border-gray-line rounded-md h-32 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Leave a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={isPosting}
                ></textarea>

                {/* Attached files preview */}
                {attachedFiles.length > 0 && (
                  <div className="mt-2 p-2 border border-gray-line rounded-md">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Attachments ({attachedFiles.length}/5):
                    </p>
                    <div className="space-y-2">
                      {attachedFiles.map((file, index) => {
                        const isImage = file.type.startsWith("image/");
                        const isPDF = file.type === "application/pdf";

                        return (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-gray-bg p-2 rounded border"
                          >
                            {/* File preview */}
                            {isImage ? (
                              <div className="w-10 h-10 flex-shrink-0 rounded overflow-hidden relative">
                                <Image
                                  src={URL.createObjectURL(file)}
                                  alt={file.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-red-100 rounded">
                                <FontAwesomeIcon
                                  icon={faFilePdf}
                                  className="h-5 w-5 text-red-600"
                                />
                              </div>
                            )}

                            {/* File info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB •{" "}
                                {isPDF ? "PDF" : "Image"}
                              </p>
                            </div>

                            {/* Remove button */}
                            <button
                              onClick={() => removeAttachedFile(index)}
                              className="p-1 text-red-600 hover:text-red-800 rounded"
                              title="Remove"
                            >
                              <FontAwesomeIcon
                                icon={faTimes}
                                className="h-4 w-4"
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center mt-2">
                  <div className="flex space-x-2 relative">
                    <button
                      className="p-2 text-gray-10 hover:text-primary"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <FontAwesomeIcon icon={faSmile} className="h-4 w-4" />
                    </button>

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                      <div
                        ref={emojiPickerRef}
                        className="absolute bottom-10 left-0 bg-white border border-gray-line rounded-lg shadow-lg p-3 z-50"
                        style={{ width: "320px" }}
                      >
                        <div className="grid grid-cols-10 gap-1">
                          {commonEmojis.map((emoji, index) => (
                            <button
                              key={index}
                              onClick={() => handleEmojiSelect(emoji)}
                              className="p-1 hover:bg-gray-bg rounded text-lg"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <button className="p-2 text-gray-10">
                      <FontAwesomeIcon icon={faHashtag} className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 text-gray-10 hover:text-primary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FontAwesomeIcon icon={faPaperclip} className="h-4 w-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      onChange={handleFileAttachment}
                      className="hidden"
                    />
                  </div>
                  <button
                    className="px-4 py-2 bg-primary text-white rounded-md small-semibold disabled:opacity-50"
                    onClick={handleTimelinePost}
                    disabled={
                      isPosting ||
                      (!comment.trim() && attachedFiles.length === 0)
                    }
                  >
                    {isPosting ? "Posting..." : "Post"}
                  </button>
                </div>
                <p className="text-gray-10 small mt-2">
                  Only you and other staff can see comments.
                </p>
              </div>

              <div className="relative pl-6 border-l-2 border-gray-line">
                {/* Show timelines if available, otherwise show order status */}
                {timelines.length > 0 ? (
                  timelines.map((timeline) => (
                    <div key={timeline.id} className="mb-6">
                      <div className="absolute left-0 transform -translate-x-1/2 mt-1">
                        <div className="h-4 w-4 rounded-full bg-gray-line flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-gray-10"></div>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <p className="text-black small-semibold">
                            {timeline.event}
                          </p>
                          <p className="text-gray-10 small mt-1">
                            {timeline.details}
                          </p>
                          {/* Show attached files if any */}
                          {timeline.attached_files &&
                            timeline.attached_files.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {timeline.attached_files.map((file) => {
                                  const isImage = file.url
                                    .toLowerCase()
                                    .match(/\.(jpg|jpeg|png|gif)$/);
                                  const isPDF = file.url
                                    .toLowerCase()
                                    .endsWith(".pdf");
                                  const fileName =
                                    file.filename || `Attachment ${file.id}`;

                                  return (
                                    <div
                                      key={file.id}
                                      className="flex items-center gap-2 bg-gray-bg p-2 rounded border"
                                    >
                                      {/* File preview */}
                                      {isImage ? (
                                        <div className="relative w-12 h-12 flex-shrink-0">
                                          <Image
                                            src={file.url}
                                            alt={fileName}
                                            fill
                                            className="object-cover rounded"
                                          />
                                        </div>
                                      ) : (
                                        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-red-100 rounded">
                                          <FontAwesomeIcon
                                            icon={faFilePdf}
                                            className="h-6 w-6 text-red-600"
                                          />
                                        </div>
                                      )}

                                      {/* File info */}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                          {fileName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {isPDF ? "PDF Document" : "Image"}
                                        </p>
                                      </div>

                                      {/* Actions */}
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() =>
                                            window.open(file.url, "_blank")
                                          }
                                          className="p-1 text-blue-600 hover:text-blue-800 rounded"
                                          title="View"
                                        >
                                          <FontAwesomeIcon
                                            icon={faEye}
                                            className="h-4 w-4"
                                          />
                                        </button>
                                        <button
                                          onClick={async () => {
                                            if (
                                              confirm(
                                                "Are you sure you want to delete this attachment?",
                                              )
                                            ) {
                                              const updatedTimeline =
                                                await deleteTimelineAttachment(
                                                  timeline.id,
                                                  file.id,
                                                );
                                              if (updatedTimeline) {
                                                // Refresh timelines
                                                const updatedTimelines =
                                                  timelines.map((t) =>
                                                    t.id === timeline.id
                                                      ? updatedTimeline
                                                      : t,
                                                  );
                                                setTimelines(updatedTimelines);
                                              }
                                            }
                                          }}
                                          className="p-1 text-red-600 hover:text-red-800 rounded"
                                          title="Delete"
                                        >
                                          <FontAwesomeIcon
                                            icon={faTimes}
                                            className="h-4 w-4"
                                          />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                        </div>
                        <span className="text-gray-10 small ml-2">
                          {new Date(timeline.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <span className="text-gray-10 xsmall">
                        {formatOrderDate(timeline.createdAt)}
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="mb-6">
                      <div className="absolute left-0 transform -translate-x-1/2 mt-1">
                        <div className="h-4 w-4 rounded-full bg-gray-line flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-gray-10"></div>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-gray-10 small">
                          Order {formatOrderStatus(orderData.status)}
                        </p>
                        <span className="text-gray-10 small">
                          {new Date(orderData.updatedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div className="mb-6">
                      <div className="absolute left-0 transform -translate-x-1/2 mt-1">
                        <div className="h-4 w-4 rounded-full bg-gray-line flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-gray-10"></div>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-gray-10 small">Order created</p>
                        <span className="text-gray-10 small">
                          {new Date(orderData.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Customer Info */}
        <div className="md:col-span-1 space-y-6">
          {/* Notes */}
          <NotesSection
            noteType="order"
            referenceId={params.id as string}
            title="Order Notes"
          />

          {/* Customer */}
          <div className="bg-white rounded-lg border border-gray-line">
            <div className="p-6 border-b border-gray-line flex justify-between items-center">
              <h3 className="text-black title-4-semibold">Customer</h3>
              <button className="text-gray-10">×</button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <Link href={`/admin/customers/${orderData.User?.id}`}>
                  <p className="text-blue-100 small-semibold">{customerName}</p>
                </Link>
                {isLoadingOrderInfo ? (
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mt-1"></div>
                ) : (
                  <Link href={`/admin/orders?buyerId=${orderData.User?.id}`}>
                    <p className="text-gray-10 small cursor-pointer hover:text-blue-900 transition">
                      {customerOrderInfo.totalOrders} Order{customerOrderInfo.totalOrders !== 1 ? "s" : ""}
                    </p>
                  </Link>
                )}
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
                  {orderData.User?.email || "No email"}
                </p>
                <p className="text-black small-semibold">
                  {orderData.User?.country_code}{orderData.User?.phone || "No phone number"}
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
                  {orderData.shipping_address.first_name}{" "}
                  {orderData.shipping_address.last_name}
                </p>
                <p className="text-black small mb-1">
                  {orderData.shipping_address.address_line_1}
                </p>
                {orderData.shipping_address.address_line_2 && (
                  <p className="text-black small mb-1">
                    {orderData.shipping_address.address_line_2}
                  </p>
                )}
                <p className="text-black small mb-1">
                  {orderData.shipping_address.city},{" "}
                  {orderData.shipping_address.state}{" "}
                  {orderData.shipping_address.zip_code}
                </p>
                <p className="text-black small mb-1">
                  {orderData.shipping_address.country}
                </p>
                {orderData.shipping_address.phone && (
                  <p className="text-blue-100 small-medium">
                    {orderData.shipping_address.phone}
                  </p>
                )}
                <button className="text-blue-100 small-medium mt-1">
                  View Map
                </button>
              </div>

              {/* Billing Address */}
              <div className="mb-6">
                <h4 className="text-black small-semibold mb-2">
                  Billing address
                </h4>
                {JSON.stringify(orderData.billing_address) ===
                JSON.stringify(orderData.shipping_address) ? (
                  <p className="text-gray-10 small">Same as shipping address</p>
                ) : (
                  <>
                    <p className="text-black small mb-1">
                      {orderData.billing_address.first_name}{" "}
                      {orderData.billing_address.last_name}
                    </p>
                    <p className="text-black small mb-1">
                      {orderData.billing_address.address_line_1}
                    </p>
                    {orderData.billing_address.address_line_2 && (
                      <p className="text-black small mb-1">
                        {orderData.billing_address.address_line_2}
                      </p>
                    )}
                    <p className="text-black small mb-1">
                      {orderData.billing_address.city},{" "}
                      {orderData.billing_address.state}{" "}
                      {orderData.billing_address.zip_code}
                    </p>
                    <p className="text-black small mb-1">
                      {orderData.billing_address.country_code_iso}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Conversion Summary */}
          <div className="bg-white rounded-lg border border-gray-line">
            <div className="p-6 border-b border-gray-line flex justify-between items-center">
              <h3 className="text-black title-4-semibold">
                Conversion Summary
              </h3>
            </div>
            <div className="p-6">
              <div className="flex items-start mb-4">
                <div className="h-6 w-6 bg-primary text-white rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                {isLoadingOrderInfo ? (
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-gray-10 small">
                    {customerOrderInfo.isFirstOrder
                      ? "This is their first order"
                      : `This is their ${customerOrderInfo.sequenceNumber}${
                          customerOrderInfo.sequenceNumber % 10 === 1 && customerOrderInfo.sequenceNumber % 100 !== 11
                            ? "st"
                            : customerOrderInfo.sequenceNumber % 10 === 2 && customerOrderInfo.sequenceNumber % 100 !== 12
                              ? "nd"
                              : customerOrderInfo.sequenceNumber % 10 === 3 && customerOrderInfo.sequenceNumber % 100 !== 13
                                ? "rd"
                                : "th"
                        } order`}
                  </p>
                )}
              </div>
              <div className="flex items-start">
                <div className="h-6 w-6 bg-primary text-white rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-gray-10 small">1 session over 1 day</p>
              </div>
              <button className="mt-4 text-blue-100 small-semibold">
                View Conversion Details
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg border border-gray-line">
            <div className="p-6 border-b border-gray-line flex justify-between items-center">
              <h3 className="text-black title-4-semibold">Tags</h3>
              <button className="text-gray-10">
                <FontAwesomeIcon icon={faPen} className="h-3 w-3" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-10 small">No tags added yet</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fulfill Order Modal */}
      {orderData?.OrderItems && isFulfillModalOpen && (
        <AdminFulfillOrderModal
          orderItems={orderData.OrderItems}
          onClose={() => setIsFulfillModalOpen(false)}
          onFulfill={handleFulfillOrderSubmit}
        />
      )}

      {/* Admin Add Tracking Modal */}
      {isTrackingModalOpen && orderData && (
        <AdminAddTrackingModal
          orderId={params.id as string}
          onClose={handleTrackingModalClose}
          onSuccess={handleTrackingSuccess}
        />
      )}

      {/* Cancel Order Modal */}
      {showRefundModal && orderData && (
        <AdminCancelOrderModal
          isOpen={showRefundModal}
          onClose={() => setShowRefundModal(false)}
          onConfirm={handleRefundConfirm}
          orderId={params.id as string}
          orderItems={orderData.OrderItems || []}
          shippingAmount={orderData.shipping ? parseFloat(orderData.shipping) : 0}
          cancelRequestMessage={cancelRequestMessage}
          autoCheckProductTitles={autoCheckItems}
          isLoading={isRefunding}
        />
      )}
    </div>
  );
}
