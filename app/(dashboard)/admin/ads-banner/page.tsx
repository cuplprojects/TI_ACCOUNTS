"use client";

import React, { useState } from "react";
import UploadImageComponent from "@/app/components/admin/ads-banner/UploadImageComponent";
import CategoryBannerManager from "@/app/components/admin/ads-banner/CategoryBannerManager";
import Button from "@/app/components/common/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

type TabType = "homepage" | "category";

export default function AdsBannerPage() {
  const [activeTab, setActiveTab] = useState<TabType>("homepage");

  const handleFileUpload = (file: File, position: string) => {
    console.log(`File uploaded for ${position}:`, file);
    // Here you would typically upload the file to your server
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border-b border-gray-20">
        <div className="flex gap-0">
          <button
            onClick={() => setActiveTab("homepage")}
            className={`px-6 py-4 font-semibold transition-colors border-b-2 ${
              activeTab === "homepage"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-30"
            }`}
          >
            Homepage Banners
          </button>
          <button
            onClick={() => setActiveTab("category")}
            className={`px-6 py-4 font-semibold transition-colors border-b-2 ${
              activeTab === "category"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-30"
            }`}
          >
            Category Banners
          </button>
        </div>
      </div>

      {/* Homepage Banners Tab */}
      {activeTab === "homepage" && (
        <div className="bg-white py-2 px-6">
          <h2 className="title-2 text-default mb-4">Homepage - Below Hero Section</h2>
          <div className="mb-8">
            <h3 className="title-4-semibold text-black mb-4">Landscape Mode</h3>

            {/* First row of upload components */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <UploadImageComponent
                title="Upload - Left Image"
                onUpload={(file) => handleFileUpload(file, "left-top")}
                maxSize={25}
              />

              <UploadImageComponent
                title="Upload Ad - Center Image"
                onUpload={(file) => handleFileUpload(file, "center-top")}
                maxSize={25}
              />

              <UploadImageComponent
                title="Upload Ad - Right Image"
                onUpload={(file) => handleFileUpload(file, "right-top")}
                maxSize={25}
              />
            </div>
          </div>

          <div className="mt-8">
            <h3 className="title-4-semibold text-black mb-4">Mobile View</h3>
            {/* Second row of upload components */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <UploadImageComponent
                title="Upload - Left Image"
                onUpload={(file) => handleFileUpload(file, "left-bottom")}
                maxSize={25}
              />

              <UploadImageComponent
                title="Upload Ad - Center Image"
                onUpload={(file) => handleFileUpload(file, "center-bottom")}
                maxSize={25}
              />

              <UploadImageComponent
                title="Upload Ad - Right Image"
                onUpload={(file) => handleFileUpload(file, "right-bottom")}
                maxSize={25}
              />
            </div>
          </div>
        </div>
      )}

      {/* Category Banners Tab */}
      {activeTab === "category" && (
        <div>
          <CategoryBannerManager
            categoryId=""
            categoryName="Select a category to manage banners"
          />
        </div>
      )}
    </div>
  );
}
