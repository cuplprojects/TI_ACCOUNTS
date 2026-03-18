"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import CategoryBannerManager from "@/app/components/admin/ads-banner/CategoryBannerManager";
import { getCategories } from "@/app/lib/services/admin/categoryBannerService";

interface Category {
  id: string;
  title: string;
  name?: string;
  category_type?: string;
}

export default function CategoryBannersPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const data = await getCategories();
    if (data) {
      setCategories(data);
    }
    setLoading(false);
  };

  const filteredCategories = categories.filter((cat) =>
    (cat.name || cat.title || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl">
        <h1 className="title-1 text-default mb-2">Category Banners</h1>
        <p className="body-text text-gray-30">
          Manage banner images for each category. Choose a category to add or edit banners.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories List */}
        <div className="bg-white p-6 rounded-xl">
          <div className="mb-4">
            <div className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-3 text-gray-30 w-4 h-4"
              />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-20 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-4 text-gray-30">Loading...</div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-4 text-gray-30">
                No categories found
              </div>
            ) : (
              filteredCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedCategory?.id === category.id
                      ? "bg-blue-50 border border-blue-200 text-blue-600"
                      : "hover:bg-gray-10 border border-transparent"
                  }`}
                >
                  <p className="small-semibold">
                    {category.name || category.title}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Banner Manager */}
        <div className="lg:col-span-2">
          {selectedCategory ? (
            <CategoryBannerManager
              categoryId={selectedCategory.id}
              categoryName={selectedCategory.name || selectedCategory.title || ""}
            />
          ) : (
            <div className="bg-white p-6 rounded-xl text-center">
              <p className="body-text text-gray-30">
                Select a category to manage its banners
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
