"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useEffect } from "react";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import Button from "@/app/components/common/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCircleInfo } from "@fortawesome/free-solid-svg-icons";

export default function SettingsPage() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Settings");
  }, [setTitle]);

  // Profile information
  const [displayName, setDisplayName] = useState("Bredar");
  const [email, setEmail] = useState("bredar2411@ui8.net");
  const [location, setLocation] = useState("Kerela");
  const [profileImage, setProfileImage] = useState(
    "/images/common/profile.jpg"
  );

  // Notification preferences
  const [notifyUpdates, setNotifyUpdates] = useState(true);
  const [notifyNewsletter, setNotifyNewsletter] = useState(false);
  const [notifyComments, setNotifyComments] = useState(true);
  const [notifyPurchases, setNotifyPurchases] = useState(true);

  const handleSave = () => {
    // Save settings logic would go here
    console.log("Settings saved");
  };

  return (
    <div className="space-y-8 pb-10 bg-white">
      <div className="mb-6">
        <div className="flex items-center">
          <span className="text-green-500 mr-2">✓</span>
          <h2 className="text-lg font-medium text-gray-800">
            Profile information
          </h2>
        </div>
      </div>

      {/* Profile Image Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
          <div className="relative">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100">
              <Image
                src={profileImage}
                alt="Profile"
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="primary"
              className="flex items-center gap-2 py-2"
              onClick={() => console.log("Replace picture clicked")}
            >
              <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
              Replace picture
            </Button>

            <Button
              variant="secondary"
              className="py-2"
              onClick={() =>
                setProfileImage("/images/common/profile-placeholder.jpg")
              }
            >
              Remove
            </Button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="max-w-xl">
          <div className="mb-5">
            <label className="flex items-center mb-2 text-sm text-gray-600">
              Display name
              <FontAwesomeIcon
                icon={faCircleInfo}
                className="ml-2 h-3 w-3 text-gray-400"
              />
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="mb-5">
            <label className="flex items-center mb-2 text-sm text-gray-600">
              Email
              <FontAwesomeIcon
                icon={faCircleInfo}
                className="ml-2 h-3 w-3 text-gray-400"
              />
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="mb-5">
            <label className="flex items-center mb-2 text-sm text-gray-600">
              Location
              <FontAwesomeIcon
                icon={faCircleInfo}
                className="ml-2 h-3 w-3 text-gray-400"
              />
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Notifications Section */}
      <div className="my-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">
          Notifications
        </h2>

        <div className="max-w-xl">
          <div className="border-b border-gray-200 py-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-800">
                    Product updates and community announcements
                  </span>
                  <FontAwesomeIcon
                    icon={faCircleInfo}
                    className="ml-2 h-3 w-3 text-gray-400"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifyUpdates(!notifyUpdates)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  notifyUpdates ? "bg-primary" : "bg-secondary"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    notifyUpdates ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="border-b border-gray-200 py-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-800">
                    Market newsletter
                  </span>
                  <FontAwesomeIcon
                    icon={faCircleInfo}
                    className="ml-2 h-3 w-3 text-gray-400"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifyNewsletter(!notifyNewsletter)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  notifyNewsletter ? "bg-primary" : "bg-secondary"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    notifyNewsletter ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="border-b border-gray-200 py-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-800">
                    Comments
                  </span>
                  <FontAwesomeIcon
                    icon={faCircleInfo}
                    className="ml-2 h-3 w-3 text-gray-400"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifyComments(!notifyComments)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  notifyComments ? "bg-primary" : "bg-secondary"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    notifyComments ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="border-b border-gray-200 py-3 pb-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-800">
                    Purchases
                  </span>
                  <FontAwesomeIcon
                    icon={faCircleInfo}
                    className="ml-2 h-3 w-3 text-gray-400"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifyPurchases(!notifyPurchases)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  notifyPurchases ? "bg-primary" : "bg-secondary"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    notifyPurchases ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      <div className="my-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Payment</h2>

        <div className="max-w-xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-800">Paypal</span>
              <FontAwesomeIcon
                icon={faCircleInfo}
                className="ml-2 h-3 w-3 text-gray-400"
              />
            </div>
            <Button variant="secondary" className="py-1 px-4 text-sm">
              Update
            </Button>
          </div>

          <div className="text-gray-600 mb-1 text-sm">bredar2411@ui8.net</div>
          <div className="text-xs text-gray-500">
            Payout fee is 1% of the amount transferred, with a minimum of USD
            $0.25 and a maximum of USD $20
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8">
        <Button variant="primary" onClick={handleSave} className="py-2 px-6">
          Save
        </Button>
      </div>
    </div>
  );
}
