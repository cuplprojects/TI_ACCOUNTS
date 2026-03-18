"use client";

import React, { useEffect, useState } from "react";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faAngleLeft,
  faAngleRight,
  faPen,
  faSmile,
  faHashtag,
  faPaperclip,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getPickup,
  formatPickupDate,
  getPickupStatusBadgeClass,
  type Pickup,
  type PickupStatus,
} from "@/app/lib/services/admin";
import {
  revertOrderStep,
  addTrackingInfo,
} from "@/app/lib/services/admin/orderService";
import {
  getOrderItemData,
} from "@/app/lib/utils/orderItemUtils";
import Swal from "sweetalert2";
import Image from "next/image";

// Helper function to create timeline entries
const createTimelineEntry = (pickup: Pickup) => [
  {
    id: "1",
    date: "Today",
    event: `Pickup created for order ${pickup.shippingOrderId || pickup.id}`,
    time: new Date(pickup.createdAt).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    type: "status",
  },
  {
    id: "2",
    event: `Status: ${pickup.status}`,
    time: new Date(pickup.updatedAt).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    type: "status",
  },
];

export default function PickUpDetailPage() {
  const { setTitle } = usePageTitle();
  const params = useParams();
  const [comment, setComment] = useState("");
  const [pickUpData, setPickUpData] = useState<Pickup | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingCarrier, setShippingCarrier] = useState("");
  const [shipmentWeight, setShipmentWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("Kg");
  const [dimensions, setDimensions] = useState({
    length: "",
    breadth: "",
    height: "",
  });
  const [dimensionUnit, setDimensionUnit] = useState("cm");
  const [isSavingTracking, setIsSavingTracking] = useState(false);

  // Handle save tracking information
  const handleSaveTracking = async () => {
    if (!pickUpData?.order_id) {
      await Swal.fire({
        title: "Error",
        text: "Order ID not found. Cannot save tracking information.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    if (!trackingNumber.trim() || !shippingCarrier.trim()) {
      await Swal.fire({
        title: "Missing Information",
        text: "Please enter both tracking number and shipping carrier.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    setIsSavingTracking(true);
    try {
      const result = await addTrackingInfo(
        pickUpData.order_id,
        trackingNumber.trim(),
        shippingCarrier.trim()
      );

      if (result) {
        await Swal.fire({
          title: "Success!",
          text: "Tracking information has been saved successfully.",
          icon: "success",
          confirmButtonText: "OK",
        });

        // Refresh pickup data to get updated information
        const updatedPickup = await getPickup(params.id as string);
        if (updatedPickup) {
          setPickUpData(updatedPickup);
        }
      }
    } catch (error) {
      console.error("Error saving tracking info:", error);
    } finally {
      setIsSavingTracking(false);
    }
  };

  // Handle revert pickup action
  const handleRevertPickup = async () => {
    if (!pickUpData) return;

    // Check if order is already cancelled
    // if (pickUpData.status?.toLowerCase() === "cancelled") {
    //   await Swal.fire({
    //     title: "Order Already Cancelled",
    //     text: "This pickup order has already been cancelled and cannot be reverted.",
    //     icon: "info",
    //     confirmButtonText: "OK",
    //     confirmButtonColor: "#3085d6",
    //   });
    //   return;
    // }

    // Confirm revert action
    const confirmResult = await Swal.fire({
      title: "Revert Pickup Order?",
      text: "Are you sure you want to revert this pickup order? This action will cancel the pickup and reset the order status.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Revert",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (confirmResult.isConfirmed) {
      // Call revert-step API
      const success = await revertOrderStep(
        pickUpData.order_id || pickUpData.id,
        pickUpData.seller_id || pickUpData.Seller?.id || ""
      );

      if (success) {
        // Refresh pickup data after successful revert
        const updatedPickup = await getPickup(params.id as string);
        if (updatedPickup) {
          setPickUpData(updatedPickup);
        }
      }
    }
  };

  useEffect(() => {
    setTitle("Pick Up");

    const fetchPickupData = async () => {
      if (params.id) {
        setLoading(true);
        const pickup = await getPickup(params.id as string);
        if (pickup) {
          setPickUpData(pickup);
          setTrackingNumber(pickup.trackingNumber || "");
          setShippingCarrier(pickup.shippingCarrier || "");
          setShipmentWeight(pickup.weight || "");
          setDimensions({
            length: pickup.length || "",
            breadth: pickup.breadth || "",
            height: pickup.height || "",
          });
        }
        setLoading(false);
      }
    };

    fetchPickupData();
  }, [setTitle, params.id]);

  if (loading) {
    return (
      <div className="main-container bg-gray-bg">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-10">Loading pickup details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!pickUpData) {
    return (
      <div className="main-container bg-gray-bg">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-10">Pickup not found</p>
            <Link
              href="/admin/pickup"
              className="text-primary underline mt-2 inline-block"
            >
              Back to Pickups
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container bg-gray-bg">
      {/* Header with Order ID and status */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/admin/pickup" className="text-black mr-2">
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
          </Link>
          <h1 className="title-2">
            {pickUpData.orderNumber || `#${pickUpData.id.toString().slice(0, 6)}...`}
          </h1>
          <div className="flex items-center ml-4 gap-2">
            <span
              className={`inline-flex items-center px-2 py-1 ${getPickupStatusBadgeClass(
                pickUpData.status as PickupStatus
              )} rounded-full xsmall-semibold`}
            >
              <span className="h-2 w-2 bg-green-10 rounded-full mr-1"></span>
              {pickUpData.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRevertPickup}
            className="px-4 py-2 bg-red-600 text-white rounded-md small-semibold hover:bg-red-700 transition-colors"
          >
            Revert
          </button>
          <button className="px-4 py-2 border border-gray-line bg-white rounded-md small-semibold">
            Edit
          </button>
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

      {/* Order date and source */}
      <p className="text-gray-10 small mb-6">
        {formatPickupDate(pickUpData.createdAt)} from Online Store
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Products Section */}
          <div className="bg-white rounded-lg border border-gray-line p-6">
            <div className="flex items-center mb-4">
              <h3 className="text-black title-4-semibold">
                #{pickUpData.shippingOrderId || pickUpData.id}
              </h3>
              <span className="ml-auto">
                {pickUpData.Seller?.Addresses?.find(
                  (addr) => addr.type === "warehouse"
                )?.city ||
                  pickUpData.Seller?.pickup_address?.city ||
                  `Warehouse: ${pickUpData.Seller?.warehouse_id}` ||
                  "N/A"}
              </span>
            </div>

            {pickUpData.Order?.OrderItems?.map((item) => (
              <div key={item.id} className="border-t border-gray-line py-4">
                <div className="flex">
                  <div className="w-20 h-20 bg-gray-line rounded mr-4 overflow-hidden">
                    {item.Variant?.image_urls?.[0]?.url ? (
                      <Image
                        height={80}
                        width={80}
                        src={item.Variant.image_urls[0].url}
                        alt={item.Product.title || "Product"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-line flex items-center justify-center">
                        <span className="text-gray-10 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-black small-semibold">
                      {item.Product?.title || `Product #${item.product_id}`}
                    </h4>
                    {item.Variant?.option_values && (
                      <p className="text-gray-110 px-3 py-1.5 my-2 bg-gray-100 xsmall-semibold w-fit rounded-full">
                        {Object.entries(item.Variant.option_values)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(", ")}
                      </p>
                    )}
                    <p className="text-gray-10 xsmall">
                      SKU: {item.Variant?.sku || "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-black small-semibold">
                      {(() => {
                        const itemData = getOrderItemData(item);
                        const weight = itemData.weight || 0;
                        return `${weight.toFixed(2)} kg`;
                      })()}
                    </p>
                    <p className="text-black small">
                      {item.quantityFulfilled} of {item.quantityRequested}
                    </p>
                  </div>
                </div>
              </div>
            )) || (
              <div className="border-t border-gray-line py-4">
                <p className="text-gray-10 text-center">No order items found</p>
              </div>
            )}

            {/* Tracking Information */}
            {/* <div className="mt-6">
              <h3 className="text-black title-4-semibold mb-4">
                Tracking Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-black small-semibold block mb-1">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-line rounded-md"
                    placeholder="Enter tracking number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-black small-semibold block mb-1">
                    Shipping Carrier
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-line rounded-md"
                    placeholder="Enter shipping carrier"
                    value={shippingCarrier}
                    onChange={(e) => setShippingCarrier(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <button className="text-blue-100 small-semibold">
                  + Add another tracking number
                </button>
                <button
                  onClick={handleSaveTracking}
                  disabled={
                    isSavingTracking ||
                    !trackingNumber.trim() ||
                    !shippingCarrier.trim()
                  }
                  className={`px-4 py-2 rounded-md small-semibold transition-all ${
                    !isSavingTracking &&
                    trackingNumber.trim() &&
                    shippingCarrier.trim()
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isSavingTracking ? "Saving..." : "Save Tracking Info"}
                </button>
              </div>
            </div> */}
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
                ></textarea>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-10">
                      <FontAwesomeIcon icon={faSmile} className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-10">
                      <FontAwesomeIcon icon={faHashtag} className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-10">
                      <FontAwesomeIcon icon={faPaperclip} className="h-4 w-4" />
                    </button>
                  </div>
                  <button className="px-4 py-2 bg-primary text-white rounded-md small-semibold">
                    Post
                  </button>
                </div>
                <p className="text-gray-10 small mt-2">
                  Only you and other staff can see comments.
                </p>
              </div>

              <div className="relative pl-6 border-l-2 border-gray-line">
                {createTimelineEntry(pickUpData).map((event) => (
                  <div key={event.id} className="mb-6">
                    {event.date && (
                      <div className="flex items-center mb-2">
                        <span className="text-black small-semibold">
                          {event.date}
                        </span>
                      </div>
                    )}
                    <div className="absolute left-0 transform -translate-x-1/2 mt-1">
                      <div className="h-4 w-4 rounded-full bg-gray-line flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-gray-10"></div>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-10 small">{event.event}</p>
                      <span className="text-gray-10 small">{event.time}</span>
                    </div>
                    {event.type === "email" && (
                      <button className="mt-2 text-blue-100 small-semibold">
                        View Email
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Seller Info */}
        <div className="md:col-span-1 space-y-6">
          {/* Seller Information */}
          <div className="bg-white rounded-lg border border-gray-line">
            <div className="p-6 border-b border-gray-line flex justify-between items-center">
              <h3 className="text-black title-4-semibold">Seller</h3>
              <button className="text-gray-10">×</button>
            </div>
            <div className="p-6">
              <p className="text-blue-100 small-semibold">
                {pickUpData.Seller?.firm_name ||
                  `${pickUpData.Seller?.first_name} ${pickUpData.Seller?.last_name}`}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg border border-gray-line">
            <div className="p-6 border-b border-gray-line flex justify-between items-center">
              <h3 className="text-black title-4-semibold">
                Contact information
              </h3>
              <button className="text-gray-10">
                <FontAwesomeIcon icon={faPen} className="h-3 w-3" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-blue-100 small-medium mb-1">
                {pickUpData.Seller?.email}
              </p>
              <p className="text-gray-10 small">
                {pickUpData.Seller?.country_code} {pickUpData.Seller?.phone}
              </p>
            </div>
          </div>

          {/* Pick Up Address */}
          <div className="bg-white rounded-lg border border-gray-line">
            <div className="p-6 border-b border-gray-line flex justify-between items-center">
              <h3 className="text-black title-4-semibold">Pick Up address</h3>
              <button className="text-gray-10">
                <FontAwesomeIcon icon={faPen} className="h-3 w-3" />
              </button>
            </div>
            <div className="p-6">
              {(() => {
                const warehouseAddress =
                  pickUpData.Seller?.Addresses?.find(
                    (addr) => addr.type === "warehouse"
                  );

                if (warehouseAddress) {
                  return (
                    <>
                      <p className="text-black small mb-1">
                        {warehouseAddress.first_name}{" "}
                        {warehouseAddress.last_name}
                      </p>
                      {warehouseAddress.company &&
                        warehouseAddress.company !== "No Company" && (
                          <p className="text-black small mb-1">
                            {warehouseAddress.company}
                          </p>
                        )}
                      <p className="text-black small mb-1">
                        {warehouseAddress.address_line_1}
                      </p>
                      {warehouseAddress.address_line_2 &&
                        warehouseAddress.address_line_2 !== "no apartment" && (
                          <p className="text-black small mb-1">
                            {warehouseAddress.address_line_2}
                          </p>
                        )}
                      <p className="text-black small mb-1">
                        {warehouseAddress.city}, {warehouseAddress.state}{" "}
                        {warehouseAddress.zip_code}
                      </p>
                      <p className="text-black small mb-1">
                        {warehouseAddress.country}
                      </p>
                    </>
                  );
                } else if (pickUpData.Seller?.pickup_address) {
                  return (
                    <>
                      <p className="text-black small mb-1">
                        {pickUpData.Seller?.firm_name}
                      </p>
                      <p className="text-black small mb-1">
                        {pickUpData.Seller.pickup_address.address_line_1}
                      </p>
                      <p className="text-black small mb-1">
                        {pickUpData.Seller.pickup_address.city},{" "}
                        {pickUpData.Seller.pickup_address.state}{" "}
                        {pickUpData.Seller.pickup_address.zip_code}
                      </p>
                    </>
                  );
                } else {
                  return (
                    <p className="text-gray-10 small mb-1">
                      Pickup address not configured
                    </p>
                  );
                }
              })()}
              <p className="text-blue-100 small-medium">
                {pickUpData.Seller?.country_code} {pickUpData.Seller?.phone}
              </p>
              <button className="text-blue-100 small-medium mt-1">
                View Map
              </button>
            </div>
          </div>

          {/* Upload Label
          <div className="bg-white rounded-lg border border-gray-line">
            <div className="p-6 border-b border-gray-line">
              <h3 className="text-black title-4-semibold">Upload Label</h3>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-line rounded-md p-6 flex flex-col items-center justify-center">
                <button className="px-4 py-2 bg-primary text-white rounded-md small-semibold mb-2">
                  Add File
                </button>
                <p className="text-gray-10 small text-center">
                  Or drop an image, file, pdf to upload
                </p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
