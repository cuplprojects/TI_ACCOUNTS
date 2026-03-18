"use client";
import React, { useEffect, useState, Suspense, useRef } from "react";
import { usePageTitle } from "@/app/providers/PageTitleProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSearch,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import Image from "next/image";
import ImageUpload from "@/components/ui/ImageUpload";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Collection,
  createCollection,
  updateCollection,
  prepareCollectionFormData,
  Condition,
  getAllSuperCategories,
  getAllCategoriesBySuperId,
  getCollection,
} from "@/app/lib/services/admin/collectionService";
import { formatUrlHandle, isValidUrlHandle } from "@/app/lib/utils/stringUtils";
import QuillEditor from "@/app/components/QuillEditor";
import { showErrorMessage } from "@/app/lib/swalConfig";

function CreateCollectionContent() {
  const { setTitle } = usePageTitle();
  const router = useRouter();
  const searchParams = useSearchParams();
  const collectionId = searchParams.get("id");
  const viewMode = searchParams.get("view");
  const isEditMode = !!collectionId;
  const isViewMode = viewMode === "true";

  // Collection form state
  const [collection, setCollection] = useState<Partial<Collection>>({
    category_type: undefined,
    title: "",
    description: "",
    collection_type: "Manual",
    conditionMatchType: "all",
    conditions: [],
    text_me: "",
    footer_text: "",
    caption: "",
    page_title: "",
    page_description: "",
    page_url: "",
  });

  // UI state
  const [collectionType, setCollectionType] = useState("manual");
  const [conditionMatch, setConditionMatch] = useState<"all" | "any">("all");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [conditions, setConditions] = useState<Condition[]>([
    { field: "tag", operator: "eq", value: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const quillEditorRef = useRef<any>(null);

  // For super-category/category selection
  const [superCategories, setSuperCategories] = useState<Collection[]>([]);
  const [categories, setCategories] = useState<Collection[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Collection[]>([]);
  const [loadingSuperCategories, setLoadingSuperCategories] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    setTitle(isViewMode ? "View Category" : isEditMode ? "Edit Category" : "Create Category");
  }, [setTitle, isEditMode, isViewMode]);

  // Fetch collection data if in edit mode
  useEffect(() => {
    if (isEditMode && collectionId) {
      setIsLoading(true);

      // First, load the collection data
      getCollection(collectionId)
        .then(async (data) => {
          if (data) {
            // Load dependent data based on category type
            if (data.category_type === "category") {
              try {
                setLoadingSuperCategories(true);
                const superCats = await getAllSuperCategories();
                setSuperCategories(superCats);
              } catch (error) {
                console.error("Error loading super categories:", error);
                setSuperCategories([]);
              } finally {
                setLoadingSuperCategories(false);
              }
            } else if (data.category_type === "sub-category") {
              try {
                // For sub-category, load super categories and get categories by super category
                setLoadingSuperCategories(true);
                setLoadingCategories(true);
                
                const superCats = await getAllSuperCategories();
                setSuperCategories(superCats);
                
                // If super category is already selected, fetch categories for it
                if (data.superCategoryId) {
                  const cats = await getAllCategoriesBySuperId(data.superCategoryId);
                  setCategories(cats);
                  setFilteredCategories(cats);
                }
              } catch (error) {
                console.error("Error loading super categories or categories:", error);
                setSuperCategories([]);
                setCategories([]);
              } finally {
                setLoadingSuperCategories(false);
                setLoadingCategories(false);
              }
            }

            // Now set the collection data after dependent data is loaded
            setCollection(data);

            // Set image preview if available
            if (data.image_url) {
              setImagePreview(data.image_url);
            }

            // Set collection type
            if (data.collection_type) {
              setCollectionType(data.collection_type.toLowerCase());
            }

            // Set condition match type
            if (data.conditionMatchType) {
              setConditionMatch(data.conditionMatchType);
            }

            // Set conditions
            if (data.conditions && Array.isArray(data.conditions)) {
              // Type assertion to convert to Condition[]
              const typedConditions = data.conditions
                .filter(
                  (cond: unknown) =>
                    cond &&
                    typeof cond === "object" &&
                    cond !== null &&
                    "field" in cond &&
                    "operator" in cond &&
                    "value" in cond
                )
                .map(
                  (cond: {
                    field: string;
                    operator: string;
                    value: string | number;
                  }) => ({
                    field: cond.field as "price" | "vendor" | "tag",
                    operator: cond.operator as
                      | "gt"
                      | "lt"
                      | "eq"
                      | "not_eq"
                      | "contains",
                    value: cond.value,
                  })
                );

              if (typedConditions.length > 0) {
                setConditions(typedConditions as Condition[]);
              }
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching collection:", error);
          showErrorMessage(
            "Failed to load collection details. Redirecting to collection list."
          );
          router.push("/admin/collection");
        })
        .finally(() => {
          setIsLoading(false);
          // Mark initial data load as complete
          setIsInitialDataLoad(false);
        });
    }
  }, [collectionId, isEditMode, router]);

  // Auto-fill parent categories when editing
  useEffect(() => {
    if (isEditMode && !isLoading && collection.id) {
      // For category type, auto-fill super category from SuperCategory relationship
      if (collection.category_type === "category" && collection.SuperCategory && collection.SuperCategory.id) {
        setCollection((prev) => ({
          ...prev,
          superCategoryId: collection.SuperCategory?.id,
        }));
      }
      
      // For sub-category type, auto-fill super category and category from relationships
      if (collection.category_type === "sub-category") {
        // Set the parent category
        if (collection.Category && collection.Category.id) {
          setCollection((prev) => ({
            ...prev,
            categoryId: collection.Category?.id,
          }));
        }
        
        // Set the super category
        if (collection.SuperCategory && collection.SuperCategory.id) {
          setCollection((prev) => ({
            ...prev,
            superCategoryId: collection.SuperCategory?.id,
          }));
        }
      }
    }
  }, [isEditMode, isLoading, collection.id]);

  // Track if we're still loading initial data (for edit mode)
  const [isInitialDataLoad, setIsInitialDataLoad] = useState(isEditMode);
  const [previousCategoryType, setPreviousCategoryType] = useState<string | null>(null);

  // Step 1: Load all super categories when category type is selected
  useEffect(() => {
    // Skip if we're in edit mode and still loading (data will be loaded in the collection fetch effect)
    if (isEditMode && isLoading) {
      return;
    }

    // Load super categories for both "category" and "sub-category" types
    if ((collection.category_type === "category" || collection.category_type === "sub-category") && !superCategories.length) {
      console.log("Loading all super categories...");
      setLoadingSuperCategories(true);
      getAllSuperCategories()
        .then((data: any) => {
          console.log("Super categories loaded:", data);
          setSuperCategories(data);
        })
        .catch((error: any) => {
          console.error("Error loading super categories:", error);
          setSuperCategories([]);
        })
        .finally(() => {
          setLoadingSuperCategories(false);
        });
    }
  }, [collection.category_type, isLoading, isEditMode, superCategories.length]);

  // Step 2: Load categories for the selected super category (only for sub-category)
  useEffect(() => {
    if (collection.category_type === "sub-category" && collection.superCategoryId) {
      console.log("Loading categories for super category:", collection.superCategoryId);
      setLoadingCategories(true);
      getAllCategoriesBySuperId(collection.superCategoryId)
        .then((data: any) => {
          console.log("Categories loaded for super category:", data);
          setCategories(data);
          setFilteredCategories(data);
        })
        .catch((error: any) => {
          console.error("Error loading categories:", error);
          setCategories([]);
          setFilteredCategories([]);
        })
        .finally(() => {
          setLoadingCategories(false);
        });
    }
  }, [collection.superCategoryId, collection.category_type]);

  // Handle category type changes - reset parent selections when type changes
  useEffect(() => {
    if (previousCategoryType && previousCategoryType !== collection.category_type && !isInitialDataLoad) {
      setCollection((prev) => ({
        ...prev,
        superCategoryId: undefined,
        categoryId: undefined,
      }));
    }
    setPreviousCategoryType(collection.category_type || null);
  }, [collection.category_type, isInitialDataLoad]);

  // Update collection type when UI selection changes
  useEffect(() => {
    setCollection((prev) => ({
      ...prev,
      collection_type: collectionType === "manual" ? "Manual" : "Smart",
    }));
  }, [collectionType]);

  // Update condition match type when UI selection changes
  useEffect(() => {
    setCollection((prev) => ({
      ...prev,
      conditionMatchType: conditionMatch,
    }));
  }, [conditionMatch]);



  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Special handling for URL handle field
    if (name === "page_url") {
      const formattedUrl = formatUrlHandle(value);
      setCollection((prev) => ({
        ...prev,
        [name]: formattedUrl,
      }));
    } else {
      setCollection((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle condition changes
  const handleConditionChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updatedConditions = [...conditions];
    updatedConditions[index] = {
      ...updatedConditions[index],
      [field]: value,
    };
    setConditions(updatedConditions);
  };

  // Add new condition
  const addCondition = () => {
    setConditions([...conditions, { field: "tag", operator: "eq", value: "" }]);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!collection.title) {
      showErrorMessage("Please enter a category title");
      return;
    }

    // Validate parent category based on type
    if (collection.category_type === "category" && !collection.superCategoryId) {
      showErrorMessage("Please select a Super Category");
      return;
    }

    if (collection.category_type === "sub-category" && !collection.categoryId) {
      showErrorMessage("Please select a Category");
      return;
    }

    // Capture description from Quill editor
    const descriptionFromEditor = quillEditorRef.current?.getContent?.() || collection.description || "";
    
    // Update collection with description from editor
    const updatedCollection = {
      ...collection,
      description: descriptionFromEditor,
    };

    // Check if image is uploaded for new collections
    // if (!isEditMode && !imageFile) {
    //   showErrorMessage("Please upload an image for the collection");
    //   return;
    // }

    // // For edit mode, we don't require a new image if there's already one
    // if (isEditMode && !imageFile && !imagePreview) {
    //   showErrorMessage("Please upload an image for the collection");
    //   return;
    // }

    // Validate URL handle if provided
    if (collection.page_url && !isValidUrlHandle(collection.page_url)) {
      showErrorMessage(
        "Please enter a valid URL handle. Only lowercase letters, numbers, and hyphens are allowed."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // For smart collections, format conditions
      if (updatedCollection.collection_type === "Smart") {
        updatedCollection.conditions = conditions;
      }

      // Create form data
      const formData = await prepareCollectionFormData(
        updatedCollection as Collection,
        imageFile || undefined
      );

      // Call API to create or update collection
      let success;
      if (isEditMode && collectionId) {
        const result = await updateCollection(collectionId, formData);
        success = result.success;
      } else {
        const result = await createCollection(formData);
        success = result.success;
      }

      if (success) {
        router.push("/admin/collection");
      }
    } catch (error) {
      console.error(
        `Failed to ${isEditMode ? "update" : "create"} category:`,
        error
      );
      showErrorMessage(
        `Error: ${(error as Error).message || "Unknown error occurred"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">Loading collection details...</div>
    );
  }

  return (
    <div className="main-container">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <Link href="/admin/collection" className="flex items-center text-black">
          <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
          <span className="display-4-bold">
            {isEditMode ? "Edit" : "Create"} Collection
          </span>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Main Form */}
          <div className="md:col-span-2 space-y-6">
            {/* Category Type Dropdown */}
            <div className="custom-border-1 bg-white">
              <label className="block text-black title-4-semibold mb-2">
                Condition Type <span className="text-red-500">*</span>
              </label>
              <select
                name="category_type"
                value={collection.category_type || ""}
                onChange={(e) =>
                  setCollection((prev) => ({
                    ...prev,
                    category_type: e.target
                      .value as Collection["category_type"],
                  }))
                }
                className="w-full p-2 small focus:outline-none custom-border-3 bg-blue-80 mb-4"
                required
              >
                <option value="">Select Condition Type</option>
                <option value="super-category">Super Category</option>
                <option value="category">Category</option>
                <option value="sub-category">Sub Category</option>
              </select>
              {/* If category, show super-category dropdown */}
              {collection.category_type === "category" && (
                <div className="mb-4">
                  <label className="block text-black title-4-semibold mb-2">
                    Select Super Category <span className="text-red-500">*</span>
                  </label>
                  {loadingSuperCategories ? (
                    <div className="w-full p-2 small custom-border-3 bg-gray-100 text-gray-500">
                      Loading super categories...
                    </div>
                  ) : superCategories.length > 0 ? (
                    <select
                      key={`super-category-${collection.superCategoryId}-${superCategories.length}`}
                      name="superCategoryId"
                      value={
                        superCategories.find(
                          (sc) => sc.id === collection.superCategoryId
                        )
                          ? collection.superCategoryId || ""
                          : ""
                      }
                      onChange={(e) =>
                        setCollection((prev) => ({
                          ...prev,
                          superCategoryId: e.target.value,
                        }))
                      }
                      className="w-full p-2 small focus:outline-none custom-border-3 bg-blue-80"
                    >
                      <option value="">Select Super Category</option>
                      {superCategories.map((sc) => (
                        <option key={sc.id} value={sc.id}>
                          {sc.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      disabled
                      className="w-full p-2 small focus:outline-none custom-border-3 bg-gray-100 text-gray-500 cursor-not-allowed"
                    >
                      <option>No super categories found</option>
                    </select>
                  )}
                  <p className="text-gray-10 xxsmall mt-1">
                    {superCategories.length === 0 && !loadingSuperCategories
                      ? "No super categories available"
                      : "Super category is required"}
                  </p>
                </div>
              )}
              {/* If sub-category, show super category and category dropdowns */}
              {collection.category_type === "sub-category" && (
                <>
                  <div className="mb-4">
                    <label className="block text-black title-4-semibold mb-2">
                      Super Category
                    </label>
                    {loadingSuperCategories ? (
                      <div className="w-full p-2 small custom-border-3 bg-gray-100 text-gray-500">
                        Loading super categories...
                      </div>
                    ) : superCategories.length > 0 ? (
                      <select
                        key={`super-category-${collection.superCategoryId}-${superCategories.length}`}
                        name="superCategoryId"
                        value={collection.superCategoryId || ""}
                        onChange={(e) =>
                          setCollection((prev) => ({
                            ...prev,
                            superCategoryId: e.target.value,
                          }))
                        }
                        className="w-full p-2 small focus:outline-none custom-border-3 bg-blue-80"
                      >
                        <option value="">Select Super Category</option>
                        {superCategories.map((sc) => (
                          <option key={sc.id} value={sc.id}>
                            {sc.title}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <select
                        disabled
                        className="w-full p-2 small focus:outline-none custom-border-3 bg-gray-100 text-gray-500 cursor-not-allowed"
                      >
                        <option>No super categories found</option>
                      </select>
                    )}
                    <p className="text-gray-10 xxsmall mt-1">
                      {superCategories.length === 0 && !loadingSuperCategories
                        ? "No super categories available"
                        : "Select a super category to filter categories"}
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-black title-4-semibold mb-2">
                      Select Category <span className="text-red-500">*</span>
                    </label>

                    {loadingCategories ? (
                      <div className="w-full p-2 small custom-border-3 bg-gray-100 text-gray-500">
                        Loading categories...
                      </div>
                    ) : filteredCategories.length > 0 ? (
                      <select
                        key={`category-${collection.categoryId}-${filteredCategories.length}`}
                        name="categoryId"
                        value={collection.categoryId || ""}
                        onChange={(e) =>
                          setCollection((prev) => ({
                            ...prev,
                            categoryId: e.target.value,
                          }))
                        }
                        className="w-full p-2 small focus:outline-none custom-border-3 bg-blue-80"
                      >
                        <option value="">Select Category</option>
                        {filteredCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.title}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <select
                        disabled
                        className="w-full p-2 small focus:outline-none custom-border-3 bg-gray-100 text-gray-500 cursor-not-allowed"
                      >
                        <option>
                          {collection.superCategoryId
                            ? "No categories found for selected super category"
                            : "Please select a super category first"}
                        </option>
                      </select>
                    )}
                    <p className="text-gray-10 xxsmall mt-1">
                      {filteredCategories.length === 0 && !loadingCategories
                        ? collection.superCategoryId
                          ? "No categories available for this super category"
                          : "Select a super category to see available categories"
                        : "Category is required for sub-categories"}
                    </p>
                  </div>
                </>
              )}
              <label className="block text-black title-4-semibold mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={collection.title || ""}
                onChange={handleChange}
                placeholder="eg. Summer Collection, Under 100, Staff picks"
                className="w-full p-2 small focus:outline-none custom-border-3 bg-blue-80"
                required
              />
              {/* Description Editor */}

              <label className="block text-black title-4-semibold my-2">
                Description
              </label>
              <div className="border border-gray-line rounded-md">
                <QuillEditor
                  ref={quillEditorRef}
                  value={collection.description || ""}
                  onChange={(content) =>
                    setCollection((prev) => ({ ...prev, description: content }))
                  }
                  placeholder="Enter collection description..."
                />
              </div>
            </div>

            {/* Collection Type - Hide for super-category and category */}
            {collection.category_type === "sub-category" && (
              <div className="bg-white p-6 rounded-lg shadow-sm custom-border-1">
                <h3 className="text-black title-4-semibold mb-4">
                  Collection Type
                </h3>
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="collectionType"
                      value="manual"
                      checked={collectionType === "manual"}
                      onChange={(e) => setCollectionType(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <div className="text-black title-4-semibold">Manual</div>
                      <div className="text-gray-10 xsmall-medium">
                        Add products to this collection one by one. Learn more
                        about{" "}
                        <a href="#" className="text-blue-100 hover:underline">
                          manual collections
                        </a>
                        .
                      </div>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="collectionType"
                      value="smart"
                      checked={collectionType === "smart"}
                      onChange={(e) => setCollectionType(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <div className="text-black title-4-semibold">Smart</div>
                      <div className="text-gray-10 xsmall">
                        Existing and future products that match the conditions
                        you set will automatically be added to this collection.
                        Learn more about{" "}
                        <a href="#" className="text-blue-100 hover:underline">
                          smart collections
                        </a>
                        .
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Products/Conditions Section - Hide for super-category and category */}
            {collection.category_type === "sub-category" &&
              (collectionType === "manual" ? (
                /* Products Section for Manual Collection */
                <div className="bg-white shadow-sm custom-border-1">
                  <h3 className="text-black title-4-semibold mb-4">Products</h3>
                  <div className="w-full flex items-center justify-between gap-4 mb-4">
                    <div className="left flex gap-3">
                      <div className="relative flex-1">
                        <FontAwesomeIcon
                          icon={faSearch}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-10 h-3 w-3"
                        />
                        <input
                          type="text"
                          placeholder="Search Products"
                          className="w-64 !pl-8 pr-4 py-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        className="px-4 py-2 text-black small bg-blue-80 custom-border-3"
                      >
                        Browse
                      </button>
                    </div>
                    <div className="right">
                      <button
                        type="button"
                        className="px-4 py-2 text-black small bg-blue-80 custom-border-3"
                      >
                        Sort: Best Selling
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center py-1 text-center">
                    <div className="text-primary my-3">
                      <Image
                        src="/images/product-404.png"
                        alt="No products"
                        width={192}
                        height={192}
                        className="w-auto h-50 mx-auto"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Conditions Section for Smart Collection */
                <div className="bg-white shadow-sm custom-border-1">
                  <h3 className="text-black title-4-semibold mb-4">
                    Conditions
                  </h3>
                  <div className="mb-6 flex gap-2">
                    <p className="text-black title-4-semibold">
                      Products must Match:
                    </p>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="conditionMatch"
                          value="all"
                          checked={conditionMatch === "all"}
                          onChange={() => setConditionMatch("all")}
                        />
                        <span className="text-black title-4-semibold">
                          All Condition
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="conditionMatch"
                          value="any"
                          checked={conditionMatch === "any"}
                          onChange={() => setConditionMatch("any")}
                        />
                        <span className="text-black title-4-semibold">
                          Any Condition
                        </span>
                      </label>
                    </div>
                  </div>

                  {conditions.map((condition, index) => (
                    <div key={index} className="mb-4 flex items-center gap-2">
                      <select
                        className="p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none w-1/3"
                        value={condition.field}
                        onChange={(e) =>
                          handleConditionChange(index, "field", e.target.value)
                        }
                      >
                        <option value="tag">Tag</option>
                        <option value="price">Price</option>
                        <option value="vendor">Vendor</option>
                      </select>

                      <select
                        className="p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none w-1/3"
                        value={condition.operator}
                        onChange={(e) =>
                          handleConditionChange(
                            index,
                            "operator",
                            e.target.value
                          )
                        }
                      >
                        <option value="eq">is equal to</option>
                        <option value="not_eq">is not equal to</option>
                        <option value="gt">is greater than</option>
                        <option value="lt">is less than</option>
                        <option value="contains">contains</option>
                      </select>

                      <input
                        type="text"
                        value={condition.value.toString()}
                        onChange={(e) =>
                          handleConditionChange(index, "value", e.target.value)
                        }
                        className="p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none w-1/3"
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addCondition}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-00 text-white small-semibold rounded-md hover:opacity-90"
                  >
                    <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                    <span>Add another condition</span>
                  </button>
                </div>
              ))}

            {/* Metafields - Hide for super-category and category */}
            {collection.category_type === "sub-category" && (
              <div className="bg-white p-6 rounded-lg shadow-sm custom-border-1">
                <h3 className="text-black title-2 mb-4">Metafields</h3>
                <div className="space-y-4">
                  <div className="flex gap-2 items-center">
                    <label className="block text-gray-30 title-4-medium mb-2 w-[150px]">
                      Text_me
                    </label>
                    <input
                      type="text"
                      name="text_me"
                      value={collection.text_me || ""}
                      onChange={handleChange}
                      className="w-full p-2 custom-border-2 !py-2 bg-blue-80 rounded-md small focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <label className="block text-gray-30 title-4-medium mb-2 w-[150px]">
                      Footer_text
                    </label>
                    <input
                      type="text"
                      name="footer_text"
                      value={collection.footer_text || ""}
                      onChange={handleChange}
                      className="w-full p-2 custom-border-2 !py-2 bg-blue-80 rounded-md small focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <label className="block text-gray-30 title-4-medium mb-2 w-[150px]">
                      Image
                    </label>
                    <input
                      type="text"
                      name="image"
                      value={collection.image || ""}
                      onChange={handleChange}
                      className="w-full p-2 custom-border-2 !py-2 bg-blue-80 rounded-md small focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <label className="block text-gray-30 title-4-medium mb-2 w-[150px]">
                      Caption
                    </label>
                    <input
                      type="text"
                      name="caption"
                      value={collection.caption || ""}
                      onChange={handleChange}
                      className="w-full p-2 custom-border-2 !py-2 bg-blue-80 rounded-md small focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SEO Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm custom-border-1 !px-0">
              <div className="top px-6">
                <h3 className="text-black title-4-semibold mb-2">
                  Search Engine Listing
                </h3>
                <p className="text-gray-10 xsmall mb-4">
                  Add a title and description to see how this collection might
                  appear in a search engine listing
                </p>
              </div>
              {/* hr line */}
              <div className="h-[2px] bg-gray-line my-4"></div>
              <div className="bottom px-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-black title-4-semibold mb-2">
                      Page Title
                    </label>
                    <textarea
                      name="page_title"
                      value={collection.page_title || ""}
                      onChange={handleChange}
                      className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
                      placeholder="Enter page title here..."
                    ></textarea>
                    <p className="text-gray-10 xxsmall mt-1">
                      {collection.page_title?.length || 0} of 70 characters used
                    </p>
                  </div>
                  <div>
                    <label className="block text-black title-4-semibold mb-2">
                      Page Description
                    </label>
                    <textarea
                      name="page_description"
                      value={collection.page_description || ""}
                      onChange={handleChange}
                      className="w-full p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
                      placeholder="Enter page description here..."
                    ></textarea>
                    <p className="text-gray-10 xxsmall mt-1">
                      {collection.page_description?.length || 0} of 160
                      characters used
                    </p>
                  </div>
                  <div>
                    <label className="block text-black title-4-semibold mb-2">
                      URL Handle
                    </label>
                    <div className="flex flex-col items-start w-full gap-2">
                      <div className="flex gap-2 w-full">
                        <input
                          type="text"
                          name="page_url"
                          value={collection.page_url || ""}
                          onChange={handleChange}
                          className="flex-1 p-2 custom-border-3 bg-blue-80 rounded-md small focus:outline-none"
                          placeholder="collection-name"
                        />
                        {/* <button
                          type="button"
                          onClick={() => {
                            const formattedUrl = formatUrlHandle(collection.title || "");
                            setCollection((prev) => ({
                              ...prev,
                              page_url: formattedUrl,
                            }));
                          }}
                          className="px-3 py-2 bg-gray-200 text-black small rounded-md hover:bg-gray-300 whitespace-nowrap"
                        >
                          Generate from title
                        </button> */}
                      </div>
                      <div className="flex flex-col w-full">
                        <span className="text-blue-100 xsmall-medium">
                          https://totallyindian.com/category/{collection.page_url}
                        </span>
                        <span className="text-gray-10 xxsmall mt-1">
                          Only lowercase letters, numbers, and hyphens allowed. No spaces or special characters.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-00 text-white small-semibold rounded-md hover:opacity-90 disabled:opacity-50"
              >
                {isSubmitting
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                  ? "Update Category"
                  : "Create Category"}
              </button>
            </div>
          </div>

          {/* Right Column - Image Upload */}
          <div className="md:col-span-1">
            <div className="mb-3 text-black title-4-semibold">
              Collection Image
            </div>
            <p className="text-gray-10 xxsmall mb-3">
              Optional - Upload an image for your collection
            </p>
            <ImageUpload
              onUpload={(file) => setImageFile(file)}
              initialPreview={imagePreview}
            />
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CreateCollectionPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
      <CreateCollectionContent />
    </Suspense>
  );
}
