"use client";

import React, { useState } from "react";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import ProductImageUploadForm from "@/components/ui/ProductImageUploadForm";
import BannerUploadForm from "@/components/ui/BannerUploadForm";

interface ProductFormData {
  serial_no?: string;
  title: string;
  description: string;
  short_description: string;
  price: number;
  compare_price?: number;
  cost_per_item?: number;
  gst_percent: number;
  physical_product?: boolean;
  is_tracking_inventory?: boolean;
  stock_qty?: number;
  sell_out_of_stock?: boolean;
  sku?: string;
  barcode?: string;
  weight: number;
  length?: number;
  breadth?: number;
  height?: number;
  region_of_origin: string;
  hs_code: string;
  page_title?: string;
  page_description?: string;
  page_url?: string;
  type: string;
  brand: string;
  margin_contribution?: number;
  status?: "draft" | "active" | "inactive";
  tags?: string[];
  collections?: string[];
}

interface BannerFormData {
  desktopImages: { url: string; originalName: string }[];
  mobileImages: { url: string; originalName: string }[];
  useSameForBoth: boolean;
}

export default function TestUploadPage() {
  const { setTitle } = usePageTitle();
  const [productFormData, setProductFormData] = useState<ProductFormData>({
    title: "",
    description: "",
    short_description: "",
    price: 0,
    gst_percent: 18,
    weight: 0,
    region_of_origin: "India",
    hs_code: "",
    type: "simple",
    brand: "",
    is_tracking_inventory: true,
    sell_out_of_stock: false,
    physical_product: true,
  });

  const [productImages, setProductImages] = useState<
    { url: string; originalName: string }[]
  >([]);

  const [bannerFormData, setBannerFormData] = useState<BannerFormData>({
    desktopImages: [],
    mobileImages: [],
    useSameForBoth: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    setTitle("Test Upload Components");
  }, [setTitle]);

  const handleProductSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      console.log("Product Form Data:", data);
      // Here you would typically call your product creation service
      // await createProduct(data);
      alert("Product form submitted successfully! Check console for data.");
    } catch (error) {
      console.error("Error submitting product:", error);
      alert("Error submitting product form");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBannerSubmit = async () => {
    setIsSubmitting(true);
    try {
      console.log("Banner Form Data:", bannerFormData);
      // Here you would typically call your banner creation service
      // await createBannerWithPresignedUrls(bannerFormData);
      alert("Banner form submitted successfully! Check console for data.");
    } catch (error) {
      console.error("Error submitting banner:", error);
      alert("Error submitting banner form");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Test Upload Components
        </h1>
        <p className="text-gray-600 mb-8">
          This page demonstrates the new presigned URL-based upload components.
          All uploads are functional and will upload to your S3 bucket.
        </p>
      </div>

      {/* Product Upload Form */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Product Upload Form
          </h2>
          <p className="text-gray-600 mt-1">
            Complete product form with integrated image upload
          </p>
        </div>
        <div className="p-6">
          <ProductImageUploadForm
            role="admin"
            productData={productFormData}
            onProductDataChange={setProductFormData}
            onImagesChange={setProductImages}
            images={productImages}
            maxImages={8}
          />

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => handleProductSubmit(productFormData)}
              disabled={isSubmitting || !productFormData.title}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Product"}
            </button>
          </div>
        </div>
      </div>

      {/* Banner Upload Form */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Banner Upload Form
          </h2>
          <p className="text-gray-600 mt-1">
            Banner management with desktop/mobile image support
          </p>
        </div>
        <div className="p-6">
          <BannerUploadForm
            title="Test Banner Section"
            desktopImages={bannerFormData.desktopImages}
            mobileImages={bannerFormData.mobileImages}
            onDesktopImagesChange={(images) =>
              setBannerFormData((prev) => ({ ...prev, desktopImages: images }))
            }
            onMobileImagesChange={(images) =>
              setBannerFormData((prev) => ({ ...prev, mobileImages: images }))
            }
            useSameForBoth={bannerFormData.useSameForBoth}
            onUseSameForBothChange={(value) =>
              setBannerFormData((prev) => ({ ...prev, useSameForBoth: value }))
            }
            maxImages={5}
          />

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleBannerSubmit}
              disabled={
                isSubmitting || bannerFormData.desktopImages.length === 0
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Save Banner"}
            </button>
          </div>
        </div>
      </div>

      {/* JSON Output for Debugging */}
      <div className="bg-gray-50 rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Form Data (Debug)
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Product Data:</h4>
            <pre className="bg-white p-4 rounded border text-xs overflow-auto max-h-64">
              {JSON.stringify(
                { ...productFormData, images: productImages },
                null,
                2
              )}
            </pre>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">Banner Data:</h4>
            <pre className="bg-white p-4 rounded border text-xs overflow-auto max-h-64">
              {JSON.stringify(bannerFormData, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">
          How to Use These Components
        </h3>

        <div className="space-y-4 text-sm text-blue-700">
          <div>
            <h4 className="font-medium">ProductImageUploadForm:</h4>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Complete product form with integrated image upload</li>
              <li>
                Handles all product fields: name, description, pricing,
                inventory, SEO
              </li>
              <li>Uses presigned URLs for secure, direct-to-S3 uploads</li>
              <li>Provides form validation and error handling</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium">BannerUploadForm:</h4>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Separate desktop and mobile image uploads</li>
              <li>Option to use same images for both devices</li>
              <li>Drag-and-drop interface with progress tracking</li>
              <li>Validation for image formats and file sizes</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium">Integration:</h4>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>
                Replace existing ImageUpload components with these new ones
              </li>
              <li>Update your forms to use the new data structures</li>
              <li>The services are already updated to handle presigned URLs</li>
              <li>All uploads are secure and go directly to S3</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
